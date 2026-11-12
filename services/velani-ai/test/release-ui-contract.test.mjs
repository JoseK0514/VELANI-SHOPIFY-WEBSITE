import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { afterEach, expect, it, vi } from 'vitest';
import { buildApp } from '../src/app.js';
import { readConfig } from '../src/config.js';
import { ModelError } from '../src/engine.js';
import { VelaniAssistant as ReferenceClient } from '../integration/velani-assistant.js';
import { VelaniAssistant as ShopifyClient } from '../../../src/night/velani-assistant.js';

const fixtures = JSON.parse(await readFile(new URL('../../../docs/handoffs/six-release-evidence-20261112/rondo-ui-fixtures.json', import.meta.url), 'utf8'));
const clients = [['reference', ReferenceClient], ['Shopify', ShopifyClient]];
const cases = clients.flatMap(([name, Client]) => ['en', 'es'].flatMap(locale =>
  fixtures.rejections.map(fixture => ({ name, Client, locale, fixture }))));
const apps = [];
afterEach(async () => { await Promise.all(apps.splice(0).map(app => app.close())); });

function setup(Client, locale, modelError) {
  const sessions = new Map();
  const repository = {
    ping: vi.fn(async () => {}),
    createSession: vi.fn(async (hash, language, expiresAt) => {
      const session = { id: randomUUID(), locale: language, expiresAt };
      sessions.set(hash, session); return session;
    }),
    findSession: vi.fn(async hash => sessions.get(hash) ?? null),
    consumeRateLimit: vi.fn(async () => true),
    claimTurn: vi.fn(async () => ({ state: 'new', leaseToken: 'fixture-lease' })),
    history: vi.fn(async () => []), knowledge: vi.fn(async () => []),
    completeTurn: vi.fn(async () => {}), failTurn: vi.fn(async () => {}),
    deleteSession: vi.fn(async () => {}), close: vi.fn(async () => {}),
  };
  const answer = { message: 'Synthetic workflow answer.', sources: [], action: 'none', confidence: 'grounded', model: 'fixture-only' };
  const engine = { answer: vi.fn().mockRejectedValueOnce(modelError).mockResolvedValue(answer) };
  const config = readConfig({ DATABASE_URL: 'postgresql://unused.invalid/never-connected',
    AI_API_KEY: 'fixture-never-transmitted', AI_MODEL: 'fixture-only',
    SESSION_HASH_SECRET: 'fixture-only-hash-material-at-least-32-characters',
    ALLOWED_ORIGINS: 'https://fixture.invalid', NODE_ENV: 'test' });
  const app = buildApp({ ...config, requireCaptcha: true, turnstileSiteKey: 'fixture-public-key',
    turnstileSecret: 'fixture-only' }, repository, engine, { verifyCaptcha: async () => true });
  apps.push(app);
  const exchanges = [];
  // Fastify injection executes actual origin/session/validation/error handlers.
  // No socket, remote verification, database or model-provider transport exists.
  const fetch = vi.fn(async (url, init) => {
    const headers = new Headers(init.headers);
    headers.set('origin', 'https://fixture.invalid'); // browser-generated Origin
    const response = await app.inject({ method: init.method, url: new URL(url).pathname,
      headers: Object.fromEntries(headers), ...(init.body ? { payload: JSON.parse(init.body) } : {}) });
    exchanges.push({ path: new URL(url).pathname, body: init.body ? JSON.parse(init.body) : null,
      status: response.statusCode, response: response.json(), headers: response.headers });
    return new Response(response.body, { status: response.statusCode, headers: response.headers });
  });
  const assistant = new Client({ apiBaseUrl: 'https://fixture.invalid', locale, fetch,
    getCaptchaToken: async () => 'fixture-captcha' });
  return { app, assistant, engine, repository, exchanges, fetch, answer };
}

it.each(cases)('$name $locale client preserves the real $fixture.name rejection and edit contract', async ({ Client, locale, fixture }) => {
  const modelError = new ModelError('provider_unavailable', 400, fixture.name === 'safety' ? 'safety_filter' : undefined);
  const s = setup(Client, locale, modelError);
  await expect(s.assistant.chat('Synthetic rejected workflow question')).rejects.toMatchObject({
    code: 'rejected', status: fixture.status, retryable: false,
    message: expect.stringContaining(locale === 'en' ? 'Edit' : 'Edítala'),
  });
  const rejected = s.exchanges.at(-1);
  expect(rejected.status).toBe(fixture.status);
  expect({ ...rejected.response, requestId: 'fixture-request-id' }).toEqual(fixture.body);
  expect(rejected.headers['retry-after'] ?? null).toBe(fixture.retryAfter);
  expect(rejected.headers['cache-control']).toBe('no-store');
  expect(rejected.response).not.toHaveProperty('sources');
  expect(rejected.response).not.toHaveProperty('action');
  expect(JSON.stringify(rejected.response)).not.toMatch(/safety_filter|cybersecurity|providerStatus|fixture-never-transmitted/);
  expect(s.repository.failTurn).toHaveBeenCalledOnce();
  expect(s.repository.completeTurn).not.toHaveBeenCalled();
  await expect(s.assistant.retryLastRequest()).rejects.toMatchObject({ code: 'retry' });
  await expect(s.assistant.chat('Edited synthetic workflow question')).rejects.toMatchObject({ code: 'pending' });
  expect(s.fetch).toHaveBeenCalledTimes(2); // one session, one rejected turn; no automatic resend
  expect(s.engine.answer).toHaveBeenCalledOnce();
  expect(s.engine.answer.mock.calls[0][0].locale).toBe(locale);

  // Edit explicitly discards the failed operation; it does not replay changed words under its UUID.
  const previousRequestId = rejected.body.requestId;
  s.assistant.discardFailedRequest();
  await expect(s.assistant.chat('Edited synthetic workflow question')).resolves.toMatchObject({ message: s.answer.message });
  const edited = s.exchanges.at(-1);
  expect(edited.body.requestId).not.toBe(previousRequestId);
  expect(edited.body.message).toBe('Edited synthetic workflow question');
  expect(s.fetch).toHaveBeenCalledTimes(3);
  expect(s.engine.answer).toHaveBeenCalledTimes(2);
  expect(s.repository.completeTurn).toHaveBeenCalledOnce();
  expect(s.assistant.failedRequest).toBeNull();
});

it.each(clients.flatMap(([name, Client]) => ['en', 'es'].map(locale => ({ name, Client, locale }))))(
  '$name $locale client distinguishes a temporary outage and respects Retry-After',
  async ({ Client, locale }) => {
    const s = setup(Client, locale, new ModelError('provider_unavailable', 502));
    await expect(s.assistant.chat('Synthetic temporary outage')).rejects.toMatchObject({
      code: 'server', status: fixtures.outage.status, retryable: true,
    });
    const failed = s.exchanges.at(-1);
    expect({ ...failed.response, requestId: 'fixture-request-id' }).toEqual(fixtures.outage.body);
    expect(failed.headers['retry-after']).toBe(fixtures.outage.retryAfter);
    expect(s.assistant.failedRequest.retryAt).toBeGreaterThan(Date.now());
    await expect(s.assistant.retryLastRequest()).rejects.toMatchObject({ code: 'early' });
    expect(s.fetch).toHaveBeenCalledTimes(2);
    expect(s.engine.answer).toHaveBeenCalledOnce();
  });

it('keeps the documented configuration public-only and session admission protected', async () => {
  const s = setup(ReferenceClient, 'en', new ModelError('provider_unavailable', 502));
  const config = await s.app.inject({ method: 'GET', url: '/v1/config' });
  expect(config.statusCode).toBe(fixtures.config.status);
  expect(config.json()).toEqual(fixtures.config.body);
  const denied = await s.app.inject({ method: 'POST', url: '/v1/sessions',
    headers: { origin: 'https://foreign.invalid' }, payload: { locale: 'en', captchaToken: 'fixture' } });
  expect(denied.statusCode).toBe(403);
  expect(s.repository.createSession).not.toHaveBeenCalled();
  expect(s.engine.answer).not.toHaveBeenCalled();
});

