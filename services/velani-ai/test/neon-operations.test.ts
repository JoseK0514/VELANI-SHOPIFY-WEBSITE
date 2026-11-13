import { randomUUID } from 'node:crypto';
import { expect, it, vi } from 'vitest';
import { createNeonOperationsHandler, INERT_PROVIDER_ENV, developmentOperationsDsn } from '../src/neon-operations.js';
import { createRondoNotifier } from '../src/rondo-notifier.js';

const source = 'b'.repeat(40);
const env = { ...INERT_PROVIDER_ENV, RONDO_OPERATIONS_ENABLED: 'false', RONDO_OPERATIONS_SOURCE_SHA: source,
  RONDO_OPERATIONS_BRANCH_ID: 'br-snowy-brook-bcc6b3zm', NEON_BRANCH_ID: 'br-snowy-brook-bcc6b3zm' };
function invocation(name = 'rondo-development-monitor', withHeader = true, scheduledAt = new Date().toISOString()) {
  const id = randomUUID();
  return new Request('https://native.example/run', { method: 'POST',
    headers: { 'content-type': 'application/json', ...(withHeader ? { 'x-neon-trigger-invocation-id': id } : {}) },
    body: JSON.stringify({ version: 1, invocation_id: id, trigger: { id: 'fixture', type: 'schedule', name }, data: { scheduled_at: scheduledAt } }),
  });
}
it('refuses public work before callback/configuration and keeps a valid closed schedule inert', async () => {
  let ran = 0;
  const handler = createNeonOperationsHandler('monitor', env, source, async () => { ran++; return { state: 'ok' }; });
  expect((await handler(invocation(undefined, false))).status).toBe(401);
  expect((await handler(new Request('https://native.example/run'))).status).toBe(404);
  expect((await handler(invocation('different-trigger'))).status).toBe(403);
  const closed = await handler(invocation());
  expect(closed.status).toBe(200);
  expect(await closed.json()).toEqual({ state: 'disabled' });
  expect(ran).toBe(0);
});
it('rejects wrong source, branch and ambient owner capabilities before scheduled work', async () => {
  let ran = 0;
  for (const change of [{ RONDO_OPERATIONS_SOURCE_SHA: 'a'.repeat(40) }, { NEON_BRANCH_ID: 'br-wrong' },
    { DATABASE_URL: 'postgresql://owner:secret@different.example/other' }, { NEON_AI_GATEWAY_TOKEN: 'privileged-token' }]) {
    const handler = createNeonOperationsHandler('monitor', { ...env, ...change, RONDO_OPERATIONS_ENABLED: 'true' }, source,
      async () => { ran++; return { state: 'ok' }; });
    expect((await handler(invocation())).status).toBe(503);
  }
  expect(ran).toBe(0);
});
it('binds direct verify-full DSNs to the exact development database, role and provider host', () => {
  const dsn = 'postgresql://velani_rondo_dev_monitor:fixture@ep-withered-pine-bcnflkeq.c-16.us-east-1.aws.neon.tech/velani_rondo_development?sslmode=verify-full';
  expect(developmentOperationsDsn('monitor', { RONDO_OPERATIONS_DATABASE_URL: dsn })).toBe(dsn);
  for (const bad of [dsn.replace('dev_monitor', 'dev_app'), dsn.replace('velani_rondo_development?', 'velani_ai?'),
    dsn.replace('-bcnflkeq.', '-bcnflkeq-pooler.'), dsn.replace('verify-full', 'disable'), dsn + '&host=other.example']) {
    expect(() => developmentOperationsDsn('monitor', { RONDO_OPERATIONS_DATABASE_URL: bad })).toThrow();
  }
});
it('accepts an explicit production database with its dedicated role and rejects crossed development bindings', async () => {
  const dsn = 'postgresql://velani_rondo_prod_monitor:fixture@ep-withered-pine-bcnflkeq.c-16.us-east-1.aws.neon.tech/velani_ai?sslmode=verify-full';
  const production = { RONDO_OPERATIONS_ENVIRONMENT: 'production', RONDO_OPERATIONS_DATABASE_URL: dsn };
  expect(developmentOperationsDsn('monitor', production)).toBe(dsn);
  for (const change of [{ RONDO_OPERATIONS_ENVIRONMENT: 'development' }, { RONDO_OPERATIONS_ENVIRONMENT: 'prod' },
    { RONDO_OPERATIONS_DATABASE_URL: dsn.replace('/velani_ai?', '/velani_rondo_development?') },
    { RONDO_OPERATIONS_DATABASE_URL: dsn.replace('prod_monitor', 'dev_monitor') }]) {
    expect(() => developmentOperationsDsn('monitor', { ...production, ...change })).toThrow();
  }
  let ran = 0;
  const handler = createNeonOperationsHandler('monitor', { ...env, RONDO_OPERATIONS_ENVIRONMENT: 'production', RONDO_OPERATIONS_ENABLED: 'true' }, source,
    async () => { ran++; return { state: 'ok' }; });
  expect((await handler(invocation('rondo-development-monitor'))).status).toBe(403);
  expect((await handler(invocation('rondo-production-monitor'))).status).toBe(200);
  expect(ran).toBe(1);
});
it('labels a production incident using the selected operating environment', async () => {
  let sent: { subject: string; text: string } | undefined;
  const notify = createRondoNotifier({ RONDO_WATCHDOG_ENVIRONMENT: 'production', RONDO_ALERT_MAIL_ENABLED: 'true',
    RONDO_ALERT_API_KEY: 'synthetic-only', RONDO_ALERT_APPROVAL_REF: 'SYNTHETIC', RONDO_ALERT_RECIPIENT: 'support@thevelani.com' },
  async (_url, init) => { sent = JSON.parse(String(init?.body)); return Response.json({ id: 'fixture-production' }); });
  await notify('outage', 'synthetic-production-key');
  expect(sent?.subject).toBe('[Production] Rondo operations: attention required');
  expect(sent?.text).toContain('Rondo production operations');
  expect(() => createRondoNotifier({ RONDO_WATCHDOG_ENVIRONMENT: 'prod' })).toThrow();
});
it('reports a scheduled attention result as unavailable without returning private exception text', async () => {
  const enabled = { ...env, RONDO_OPERATIONS_ENABLED: 'true' };
  expect((await createNeonOperationsHandler('monitor', enabled, source, async () => ({ state: 'attention' }))(invocation())).status).toBe(503);
  const failed = await createNeonOperationsHandler('monitor', enabled, source, async () => { throw Error('secret private@example.com'); })(invocation());
  expect(failed.status).toBe(503); expect(await failed.text()).not.toMatch(/secret|private@example/);
});
it('refuses email without an explicit finite recipient/approval and sends only a fixed private-data-free payload', async () => {
  let received: { url: string; init: RequestInit } | undefined;
  const fetcher: typeof fetch = async (url, init) => { received = { url: String(url), init: init! }; return Response.json({ id: 'fixture-provider-id' }); };
  expect(() => createRondoNotifier({ RONDO_ALERT_MAIL_ENABLED: 'true' }, fetcher)).toThrow();
  const notify = createRondoNotifier({ RONDO_ALERT_MAIL_ENABLED: 'true', RONDO_ALERT_API_KEY: 'synthetic-key-not-sent',
    RONDO_ALERT_RECIPIENT: 'support@thevelani.com', RONDO_ALERT_APPROVAL_REF: 'SYNTHETIC-ONLY' }, fetcher);
  expect(await notify('outage', 'opaque-incident-key')).toEqual({ id: 'fixture-provider-id' });
  expect(received?.url).toBe('https://api.resend.com/emails');
  expect(received?.init.redirect).toBe('error');
  const headers = new Headers(received?.init.headers);
  expect(headers.get('Idempotency-Key')).toBe('opaque-incident-key');
  const body = JSON.parse(String(received?.init.body));
  expect(body.to).toEqual(['support@thevelani.com']);
  expect(body.from).toContain('requests@thevelani.com');
  expect(body.text).not.toMatch(/conversation|synthetic-key|SYNTHETIC-ONLY/);
});

const drill = {
  RONDO_DRILL_PAUSE_FROM: '2026-11-13T20:00:00.000Z',
  RONDO_DRILL_PAUSE_UNTIL: '2026-11-14T17:01:00.000Z',
  RONDO_DRILL_ENVIRONMENT: 'development', RONDO_DRILL_ROLE: 'monitor',
  RONDO_DRILL_APPROVAL_ID: '00000000-0000-4000-8000-000000000001',
};
it('stops actual job work only inside the finite drill window and automatically resumes at expiry', async () => {
  const clock = vi.spyOn(Date, 'now');
  let ran = 0;
  try {
    const handler = createNeonOperationsHandler('monitor', { ...env, ...drill, RONDO_OPERATIONS_ENABLED: 'true' }, source,
      async () => { ran++; return { state: 'ok' }; });
    clock.mockReturnValue(Date.parse(drill.RONDO_DRILL_PAUSE_FROM) - 1);
    expect(await (await handler(invocation())).json()).toEqual({ state: 'ok' });
    expect(ran).toBe(1);
    clock.mockReturnValue(Date.parse(drill.RONDO_DRILL_PAUSE_FROM));
    expect(await (await handler(invocation())).json()).toEqual({ state: 'drill_paused' });
    expect(ran).toBe(1);
    clock.mockReturnValue(Date.parse(drill.RONDO_DRILL_PAUSE_UNTIL));
    expect(await (await handler(invocation())).json()).toEqual({ state: 'ok' });
    expect(ran).toBe(2);
  } finally { clock.mockRestore(); }
});
it('uses current runtime time so delayed or future schedule timestamps cannot extend or escape a drill', async () => {
  const clock = vi.spyOn(Date, 'now'); let ran = 0;
  try {
    const handler = createNeonOperationsHandler('retention', { ...env, ...drill, RONDO_DRILL_ROLE: 'retention', RONDO_OPERATIONS_ENABLED: 'true' }, source,
      async () => { ran++; return { state: 'completed' }; });
    clock.mockReturnValue(Date.parse(drill.RONDO_DRILL_PAUSE_FROM) + 1);
    expect(await (await handler(invocation('rondo-development-retention', true, '2026-12-01T00:00:00.000Z'))).json()).toEqual({ state: 'drill_paused' });
    expect(ran).toBe(0);
    clock.mockReturnValue(Date.parse(drill.RONDO_DRILL_PAUSE_UNTIL) + 1);
    expect(await (await handler(invocation('rondo-development-retention', true, drill.RONDO_DRILL_PAUSE_FROM))).json()).toEqual({ state: 'completed' });
    expect(ran).toBe(1);
  } finally { clock.mockRestore(); }
});
it('rejects partial, malformed, overlong and crossed-environment or crossed-role drill configuration', async () => {
  let ran = 0;
  for (const change of [
    { RONDO_DRILL_PAUSE_UNTIL: '' }, { RONDO_DRILL_PAUSE_FROM: 'invalid' },
    { RONDO_DRILL_PAUSE_FROM: '2026-02-31T20:00:00.000Z' },
    { RONDO_DRILL_PAUSE_UNTIL: drill.RONDO_DRILL_PAUSE_FROM },
    { RONDO_DRILL_PAUSE_UNTIL: '2026-11-15T02:00:00.001Z' },
    { RONDO_DRILL_APPROVAL_ID: '' }, { RONDO_DRILL_ENVIRONMENT: 'production' }, { RONDO_DRILL_ROLE: 'retention' },
  ]) {
    const handler = createNeonOperationsHandler('monitor', { ...env, ...drill, ...change, RONDO_OPERATIONS_ENABLED: 'true' }, source,
      async () => { ran++; return { state: 'ok' }; });
    const response = await handler(invocation());
    expect(response.status).toBe(503); expect(await response.json()).toEqual({ state: 'unavailable' });
  }
  expect(ran).toBe(0);
});
it('keeps authentication, exact source/branch and a disabled job ahead of drill handling', async () => {
  let ran = 0;
  const callback = async () => { ran++; return { state: 'ok' }; };
  const active = { ...env, ...drill, RONDO_OPERATIONS_ENABLED: 'true' };
  expect((await createNeonOperationsHandler('monitor', active, source, callback)(invocation(undefined, false))).status).toBe(401);
  expect((await createNeonOperationsHandler('monitor', active, source, callback)(invocation('rondo-production-monitor'))).status).toBe(403);
  expect((await createNeonOperationsHandler('monitor', { ...active, NEON_BRANCH_ID: 'br-wrong' }, source, callback)(invocation())).status).toBe(503);
  expect((await createNeonOperationsHandler('monitor', { ...active, RONDO_OPERATIONS_SOURCE_SHA: 'a'.repeat(40) }, source, callback)(invocation())).status).toBe(503);
  expect(await (await createNeonOperationsHandler('monitor', { ...active, RONDO_OPERATIONS_ENABLED: 'false' }, source, callback)(invocation())).json()).toEqual({ state: 'disabled' });
  expect(ran).toBe(0);
});
