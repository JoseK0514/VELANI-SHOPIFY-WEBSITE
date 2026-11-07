import { afterEach, expect, it, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildClientHubApp, verifyHubTurnstile } from '../src/client-hub/app.js';
import type { ClientHubConfig } from '../src/client-hub/config.js';
import type { HubRepository } from '../src/client-hub/types.js';

const apps: FastifyInstance[] = [];
afterEach(async () => { await Promise.all(apps.splice(0).map(app => app.close())); vi.unstubAllGlobals(); });
const config: ClientHubConfig = { enabled: true, databaseUrl: 'fixture', emailApiKey: 'fixture', hashSecret: 'fixture-secret-with-more-than-32-characters', allowedOrigins: ['https://www.thevelani.com', 'https://x19hvn-ar.myshopify.com'], turnstileSecret: 'fixture', turnstileSiteKey: 'public-fixture' };
const input = { type: 'project_support', name: 'Example Client', email: 'client@example.com', project: 'Our website', description: 'The support form fails when submitting a request.', language: 'es', urgency: 'high', turnstileToken: 'fixture-token' };
const headers = { origin: 'https://www.thevelani.com', 'idempotency-key': 'b740ac04-6509-4118-a9aa-28671121ec93' };
function setup(overrides: Partial<ClientHubConfig> = {}) {
  const receipt = { id: 'fixture-id', reference: 'VEL-2611-0007', requestHash: '' };
  const repository = { find: vi.fn<HubRepository['find']>(async () => null), accept: vi.fn<HubRepository['accept']>(async () => ({ kind: 'created', receipt })), consumeLimit: vi.fn(async () => true), confirmationState: vi.fn<HubRepository['confirmationState']>(async () => 'pending'), claimDelivery: vi.fn(async () => null), completeDelivery: vi.fn(), failDelivery: vi.fn(), purge: vi.fn(), close: vi.fn() };
  const verifyCaptcha = vi.fn(async () => true); const dispatch = vi.fn(async () => undefined); const ensureDelivery=vi.fn(async()=>undefined);
  const app = buildClientHubApp({ ...config, ...overrides }, repository as unknown as HubRepository, { verifyCaptcha, dispatch,ensureDelivery }); apps.push(app);
  return { app, repository, verifyCaptcha, dispatch,ensureDelivery };
}
it('accepts both public forms without a chat session, with stable success and a public configuration', async () => {
  const { app, repository, dispatch } = setup();
  expect((await app.inject('/v1/client-hub/config')).json()).toEqual({ enabled: true, turnstileSiteKey: 'public-fixture', turnstileAction: 'velani-client-hub' });
  for (const payload of [input, { ...input, type: 'new_work', urgency: undefined, language: 'en' }]) {
    const response = await app.inject({ method: 'POST', url: '/v1/client-hub/requests', headers, payload });
    expect(response.statusCode).toBe(201); expect(response.json()).toEqual({ status: 'received', reference: 'VEL-2611-0007', confirmationEmail: 'pending' });
  }
  expect(repository.accept).toHaveBeenCalledTimes(2); expect(dispatch).toHaveBeenCalledTimes(2);
  expect(JSON.stringify(repository.accept.mock.calls)).not.toContain('fixture-token');
});
it('reports individual invalid fields and never saves or sends an invalid request', async () => {
  const { app, repository, dispatch } = setup();
  const response = await app.inject({ method: 'POST', url: '/v1/client-hub/requests', headers, payload: { ...input, email: 'bad', project: '' } });
  expect(response.statusCode).toBe(422); expect(response.json().error.fields).toMatchObject({ email: ['invalid'], project: ['required'] });
  expect(repository.accept).not.toHaveBeenCalled(); expect(dispatch).not.toHaveBeenCalled();
});
it('rejects missing and hostile origins, while preflight exposes idempotency and retry headers without quota use', async () => {
  const { app, repository } = setup();
  for (const origin of [undefined, 'https://thevelani.com.evil.test', 'https://unapproved.vercel.app']) {
    expect((await app.inject({ method: 'POST', url: '/v1/client-hub/requests', headers: { 'idempotency-key': headers['idempotency-key'], ...(origin ? { origin } : {}) }, payload: input })).statusCode).toBe(403);
  }
  const response = await app.inject({ method: 'OPTIONS', url: '/v1/client-hub/requests', headers: { origin: headers.origin, 'access-control-request-method': 'POST', 'access-control-request-headers': 'content-type,idempotency-key' } });
  expect(response.statusCode).toBe(204); expect(response.headers['access-control-allow-origin']).toBe(headers.origin);
  expect(String(response.headers['access-control-allow-headers']).toLowerCase()).toContain('idempotency-key');
  expect(repository.consumeLimit).not.toHaveBeenCalled();
});
it('fails closed on disabled service and verification failure', async () => {
  const disabled = setup({ enabled: false });
  expect((await disabled.app.inject({ method: 'POST', url: '/v1/client-hub/requests', headers, payload: input })).statusCode).toBe(503);
  expect(disabled.repository.accept).not.toHaveBeenCalled();
  const { app, verifyCaptcha, repository } = setup(); verifyCaptcha.mockResolvedValue(false);
  expect((await app.inject({ method: 'POST', url: '/v1/client-hub/requests', headers, payload: input })).json().error.code).toBe('verification_failed');
  expect(repository.accept).not.toHaveBeenCalled();
});
it('keeps a saved reference successful despite a mail failure and makes quota failures readable', async () => {
  const { app, dispatch, repository } = setup(); dispatch.mockRejectedValueOnce(new Error('private-secret'));
  const result = await app.inject({ method: 'POST', url: '/v1/client-hub/requests', headers, payload: input });
  expect(result.statusCode).toBe(201); expect(result.body).not.toContain('private-secret');
  repository.consumeLimit.mockResolvedValueOnce(false);
  const limited = await app.inject({ method: 'POST', url: '/v1/client-hub/requests', headers, payload: input });
  expect(limited.statusCode).toBe(429); expect(limited.headers['retry-after']).toBe('900'); expect(limited.headers['access-control-allow-origin']).toBe(headers.origin);
});
it('requires the dedicated Turnstile action and exact hostname', async () => {
  for (const [hostname, action, expected] of [['www.thevelani.com', 'velani-client-hub', true], ['evil.test', 'velani-client-hub', false], ['www.thevelani.com', 'velani-session', false]] as const) {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ success: true, hostname, action }))));
    expect(await verifyHubTurnstile('fixture', config, headers.origin)).toBe(expected);
  }
});
it('replays the original reference without repeating CAPTCHA and rejects edits using that key', async () => {
  const { app, repository, verifyCaptcha }=setup();
  await app.inject({method:'POST',url:'/v1/client-hub/requests',headers,payload:input});
  const requestHash=repository.accept.mock.calls[0]![2];
  repository.find.mockResolvedValue({id:'fixture-id',reference:'VEL-2611-0007',requestHash}); verifyCaptcha.mockClear();
  const replay=await app.inject({method:'POST',url:'/v1/client-hub/requests',headers,payload:{...input,turnstileToken:'expired-but-saved'}});
  expect(replay.statusCode).toBe(200); expect(replay.json().reference).toBe('VEL-2611-0007'); expect(verifyCaptcha).not.toHaveBeenCalled();
  const conflict=await app.inject({method:'POST',url:'/v1/client-hub/requests',headers,payload:{...input,description:'An edited synthetic request using the same key.'}});
  expect(conflict.statusCode).toBe(409); expect(repository.accept).toHaveBeenCalledTimes(1);
});
it('enforces the JSON media-type contract',async()=>{
  const {app}=setup();
  expect((await app.inject({method:'POST',url:'/v1/client-hub/requests',headers:{...headers,'content-type':'text/plain'},payload:'not-json'})).statusCode).toBe(415);
});
it('requires a durable wake-up before accepting a new request and preserves the retry key on queue failure',async()=>{
  const {app,repository,ensureDelivery}=setup();ensureDelivery.mockRejectedValueOnce(Error('queue unavailable'));
  const failed=await app.inject({method:'POST',url:'/v1/client-hub/requests',headers,payload:input});
  expect(failed.statusCode).toBe(503);expect(repository.accept).not.toHaveBeenCalled();
  const accepted=await app.inject({method:'POST',url:'/v1/client-hub/requests',headers,payload:input});
  expect(accepted.statusCode).toBe(201);expect(ensureDelivery.mock.calls).toHaveLength(2);
  expect(ensureDelivery.mock.invocationCallOrder[1]).toBeLessThan(repository.accept.mock.invocationCallOrder[0]!);
});
