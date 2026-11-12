import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { migrate } from '../scripts/migrate.js';
import { PostgresAiBudget, installBudgetAuthorization, readBudgetStatus } from '../src/ai-budget.js';
import type { ModelRequest } from '../src/engine.js';
import { createRuntime } from '../src/runtime.js';
import { readConfig } from '../src/config.js';
import { seedKnowledge } from '../scripts/seed.js';
import { EMPTY_PROFILE } from '../src/experience-types.js';
import { readRondoOperationsStatus } from '../src/operations-status.js';

const testUrl = process.env.TEST_DATABASE_URL; // Never fall back to application/owner credentials.
const request: ModelRequest = {
  model: 'fixture-chat', messages: [{ role: 'user', content: 'Synthetic question' }],
  response_format: { type: 'json_object' }, max_completion_tokens: 3000, stream: false,
};
const provider = 'https://ai.example.test/v1';
const prices = [{
  model: 'fixture-chat', contextTokens: 1000, outputTokenLimit: 6000,
  inputMicrousdPerMillion: 1_000_000, outputMicrousdPerMillion: 2_000_000,
}];

describe.skipIf(!testUrl)('durable Rondo budget admission', () => {
  let admin: Pool;
  let pool: Pool;
  const schema = 'budget_test_' + randomUUID().replaceAll('-', '');
  const role = 'budget_fixture_' + randomUUID().replaceAll('-', '').slice(0, 20);
  let id: string;
  let connectionString: string;
  afterEach(() => vi.unstubAllGlobals());

  beforeAll(async () => {
    admin = new Pool({ connectionString: testUrl, max: 1 });
    await admin.query('CREATE SCHEMA "' + schema + '"');
    const url = new URL(testUrl!);
    url.searchParams.set('options', '-c search_path=' + schema + ',public');
    connectionString = url.toString();
    pool = new Pool({ connectionString: url.toString(), max: 20 });
    await migrate(pool);
    await pool.query('CREATE ROLE "' + role + '" NOLOGIN');
    await pool.query('GRANT USAGE ON SCHEMA "' + schema + '" TO "' + role + '"');
    await pool.query('GRANT SELECT, UPDATE (reserved_microusd) ON ai_budget_authorizations TO "' + role + '"');
  }, 30_000);

  beforeEach(async () => {
    await pool.query('TRUNCATE ai_budget_authorizations');
    id = randomUUID();
  });

  afterAll(async () => {
    await pool?.end();
    if (admin) {
      await admin.query('DROP SCHEMA IF EXISTS "' + schema + '" CASCADE');
      await admin.query('DROP ROLE IF EXISTS "' + role + '"');
      await admin.end();
    }
  }, 30_000);

  const policy = (overrides: Record<string, unknown> = {}) => ({
    id, providerBaseUrl: provider, limitMicrousd: 14_000,
    validFrom: new Date(Date.now() - 60_000).toISOString(),
    validUntil: new Date(Date.now() + 3_600_000).toISOString(),
    approvedReference: 'SYNTHETIC-FIXTURE-NO-SPENDING', models: prices, ...overrides,
  });
  const budget = (authorizationId: string | undefined = id, baseUrl = provider) =>
    new PostgresAiBudget(pool, authorizationId, baseUrl);
  const used = async () => (await pool.query('SELECT reserved_microusd FROM ai_budget_authorizations WHERE id=$1', [id])).rows[0]?.reserved_microusd;

  it('blocks missing approval without opening a provider allowance', async () => {
    await expect(new PostgresAiBudget(pool, undefined, provider).authorize(request)).rejects.toMatchObject({ code: 'ai_budget_not_configured' });
    await expect(budget().authorize(request)).rejects.toMatchObject({ code: 'ai_budget_not_configured' });
    expect(await readBudgetStatus(pool, id)).toMatchObject({ status: 'not_configured' });
    await installBudgetAuthorization(pool, policy());
    await expect(new PostgresAiBudget(pool, undefined, provider).authorize(request)).rejects.toMatchObject({ code: 'ai_budget_not_configured' });
    expect(await used()).toBe('0');
  });

  it('admits exactly two concurrent independent instances at the cap and never resets on restart', async () => {
    await installBudgetAuthorization(pool, policy());
    const results = await Promise.allSettled(Array.from({ length: 20 }, () => budget().authorize(request)));
    expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(2);
    expect(results.filter(result => result.status === 'rejected')).toHaveLength(18);
    // Full input context1000 * $1/M + output3000 * $2/M = 7000 microdollars each.
    expect(await used()).toBe('14000');
    await expect(budget().authorize(request)).rejects.toMatchObject({ code: 'ai_budget_exhausted' });
    expect(await readBudgetStatus(pool, id)).toMatchObject({ status: 'exhausted', reservedMicrousd: '14000', limitMicrousd: '14000' });
  });

  it('charges chat and plan attempts to the same allowance and retains uncertain/failed attempts', async () => {
    await installBudgetAuthorization(pool, policy({ limitMicrousd: 20_000 }));
    await budget().authorize(request);
    // Simulated upstream failure: no refund/release path exists.
    await budget().authorize({ ...request, max_completion_tokens: 6000 });
    expect(await used()).toBe('20000');
    await expect(budget().authorize(request)).rejects.toMatchObject({ code: 'ai_budget_exhausted' });
  });

  it('blocks wrong provider, model, expired approval and oversized outputs without consuming allowance', async () => {
    await installBudgetAuthorization(pool, policy({ validUntil: new Date(Date.now() - 1000).toISOString() }));
    await expect(budget().authorize(request)).rejects.toMatchObject({ code: 'ai_budget_expired' });
    expect(await used()).toBe('0');
    await pool.query('TRUNCATE ai_budget_authorizations');
    await installBudgetAuthorization(pool, policy());
    await expect(budget(id, 'https://different.example/v1').authorize(request)).rejects.toMatchObject({ code: 'ai_budget_policy_mismatch' });
    await expect(budget().authorize({ ...request, model: 'unapproved-model' })).rejects.toMatchObject({ code: 'ai_budget_policy_mismatch' });
    await expect(budget().authorize({ ...request, max_completion_tokens: 6001 })).rejects.toMatchObject({ code: 'ai_budget_policy_mismatch' });
    expect(await used()).toBe('0');
  });

  it('pauses new calls immediately through owner-only configuration and reports attention before exhaustion', async () => {
    await installBudgetAuthorization(pool, policy({ limitMicrousd: 8000 }));
    await budget().authorize(request);
    expect(await readBudgetStatus(pool, id)).toMatchObject({ status: 'near_limit', reservedMicrousd: '7000' });
    await pool.query('UPDATE ai_budget_authorizations SET enabled=false WHERE id=$1', [id]);
    await expect(budget().authorize(request)).rejects.toMatchObject({ code: 'ai_budget_paused' });
    expect(await used()).toBe('7000');
    expect(await readBudgetStatus(pool, id)).toMatchObject({ status: 'paused' });
  });

  it('warns when remaining headroom cannot fund a fully approved attempt even below80percent usage', async () => {
    await installBudgetAuthorization(pool, policy({ limitMicrousd: 20_000 }));
    await budget().authorize(request);
    //35% reserved,13000 left: a6000-output plan still fits exactly.
    expect(await readBudgetStatus(pool, id)).toMatchObject({ status: 'ok' });
    await budget().authorize(request);
    //70% reserved,6000 left: neither a7000 chat nor13000 plan fits.
    expect(await readBudgetStatus(pool, id)).toMatchObject({ status: 'near_limit', reservedMicrousd: '14000' });
  });

  it('refuses a future window and reports malformed provider pricing as attention', async () => {
    await installBudgetAuthorization(pool, policy({
      validFrom: new Date(Date.now() + 60_000).toISOString(),
      validUntil: new Date(Date.now() + 3_600_000).toISOString(),
    }));
    await expect(budget().authorize(request)).rejects.toMatchObject({ code: 'ai_budget_expired' });
    expect(await used()).toBe('0');
    await pool.query('TRUNCATE ai_budget_authorizations');
    await pool.query(`INSERT INTO ai_budget_authorizations
      (id,provider_base_url,model_prices,limit_microusd,valid_from,valid_until,approved_reference,enabled)
      VALUES ($1,$2,'[{}]',14000,now()-interval '1 minute',now()+interval '1 hour','SYNTHETIC-INVALID',true)`, [id, provider]);
    expect(await readBudgetStatus(pool, id)).toMatchObject({ status: 'policy_mismatch' });
    await expect(budget().authorize(request)).rejects.toMatchObject({ code: 'ai_budget_unavailable' });
    expect(await used()).toBe('0');
  });

  it('never overwrites approval, resets usage, extends pricing or permits a runtime-role budget increase', async () => {
    await installBudgetAuthorization(pool, policy());
    await budget().authorize(request);
    await expect(installBudgetAuthorization(pool, policy())).rejects.toThrow();
    await expect(pool.query('UPDATE ai_budget_authorizations SET reserved_microusd=0 WHERE id=$1', [id])).rejects.toThrow();
    await expect(pool.query("UPDATE ai_budget_authorizations SET valid_until=valid_until+interval '1 day' WHERE id=$1", [id])).rejects.toThrow();
    const client = await pool.connect();
    try {
      await client.query('SET ROLE "' + role + '"');
      await expect(client.query('UPDATE ai_budget_authorizations SET limit_microusd=1000000 WHERE id=$1', [id])).rejects.toThrow();
      await expect(client.query('DELETE FROM ai_budget_authorizations WHERE id=$1', [id])).rejects.toThrow();
      await expect(client.query('UPDATE ai_budget_authorizations SET reserved_microusd=0 WHERE id=$1', [id])).rejects.toThrow();
    } finally {
      await client.query('RESET ROLE');
      client.release();
    }
    expect(await used()).toBe('7000');
  });

  it('permits reservation with the actual restricted-role grants but forbids policy changes', async () => {
    await installBudgetAuthorization(pool, policy());
    const url = new URL(connectionString);
    url.searchParams.set('options', '-c search_path=' + schema + ',public -c role=' + role);
    const runtimePool = new Pool({ connectionString: url.toString(), max: 1 });
    try {
      await new PostgresAiBudget(runtimePool, id, provider).authorize(request);
      await expect(runtimePool.query('UPDATE ai_budget_authorizations SET enabled=false WHERE id=$1', [id])).rejects.toThrow();
      await expect(runtimePool.query('INSERT INTO ai_budget_authorizations SELECT * FROM ai_budget_authorizations')).rejects.toThrow();
      expect(await used()).toBe('7000');
    } finally { await runtimePool.end(); }
  });

  it('includes missing/near-limit budget status in retention operations attention without private data', async () => {
    const missing = await readRondoOperationsStatus(pool);
    expect(missing.status).toBe('attention');
    expect(missing.alerts).toContain('ai_budget_not_configured');
    await installBudgetAuthorization(pool, policy({ limitMicrousd: 8000 }));
    await budget().authorize(request);
    const status = await readRondoOperationsStatus(pool, id);
    expect(status.alerts).toContain('ai_budget_near_limit');
    expect(status.budget).toMatchObject({ status: 'near_limit', reservedMicrousd: '7000' });
    expect(JSON.stringify(status)).not.toContain('SYNTHETIC-FIXTURE-NO-SPENDING');
    expect(JSON.stringify(status)).not.toContain(id);
  });

  it('fails closed if durable accounting is unavailable and does not leak SQL/connection details', async () => {
    await installBudgetAuthorization(pool, policy());
    await pool.query('ALTER TABLE ai_budget_authorizations RENAME TO fixture_budget_unavailable');
    try {
      await expect(budget().authorize(request)).rejects.toMatchObject({ message: 'ai_budget_unavailable', code: 'ai_budget_unavailable' });
    } finally {
      await pool.query('ALTER TABLE fixture_budget_unavailable RENAME TO ai_budget_authorizations');
    }
  });

  it('does not admit a call after an acknowledged database commit is lost to the caller', async () => {
    await installBudgetAuthorization(pool, policy());
    const uncertain = new Proxy(pool, {
      get(target, key) {
        if (key !== 'connect') return Reflect.get(target, key);
        return async () => new Proxy(await target.connect(), {
          get(client, member) {
            if (member === 'release') return client.release.bind(client);
            if (member !== 'query') return Reflect.get(client, member);
            return async (sql: unknown, ...values: unknown[]) => {
              if (sql === 'COMMIT') {
                await client.query('COMMIT');
                throw new Error('Synthetic lost database acknowledgement');
              }
              return Reflect.apply(client.query, client, [sql, ...values]);
            };
          },
        });
      },
    });
    await expect(new PostgresAiBudget(uncertain, id, provider).authorize(request)).rejects.toMatchObject({ code: 'ai_budget_unavailable' });
    expect(await used()).toBe('7000');
    await budget().authorize(request);
    expect(await used()).toBe('14000');
    await expect(budget().authorize(request)).rejects.toMatchObject({ code: 'ai_budget_exhausted' });
  });

  it('rounds sub-microdollar reservations upward without floating point undercounting', async () => {
    await installBudgetAuthorization(pool, policy({ limitMicrousd: 1, models: [{
      model: 'fixture-chat', contextTokens: 1, outputTokenLimit: 1,
      inputMicrousdPerMillion: 100001, outputMicrousdPerMillion: 100000,
    }] }));
    await budget().authorize({ ...request, max_completion_tokens: 1 });
    expect(await used()).toBe('1');
    await expect(budget().authorize({ ...request, max_completion_tokens: 1 })).rejects.toMatchObject({ code: 'ai_budget_exhausted' });
  });

  it('reserves a conservative text-byte allowance instead of charging every short question for the full model context', async () => {
    await installBudgetAuthorization(pool, policy({ limitMicrousd: 20228, models: [{ ...prices[0], contextTokens: 10000 }] }));
    await budget().authorize(request);
    //18 UTF8 content bytes +4096 framing tokens, plus3000 output at twice the rate.
    expect(await used()).toBe('10114');
    await budget().authorize(request);
    expect(await used()).toBe('20228');
    await expect(budget().authorize(request)).rejects.toMatchObject({ code: 'ai_budget_exhausted' });
  });

  it('counts UTF8 bytes and rejects new non-text/tools request shapes before spending', async () => {
    await installBudgetAuthorization(pool, policy({ models: [{ ...prices[0], contextTokens: 10000 }] }));
    await budget().authorize({ ...request, messages: [{ role: 'user', content: 'café' }], max_completion_tokens: 1 });
    //café is5 bytes, not4;4096 framing +5 input +2 output =4103 microdollars.
    expect(await used()).toBe('4103');
    await expect(budget().authorize({ ...request, tools: [] } as ModelRequest)).rejects.toMatchObject({ code: 'ai_budget_policy_mismatch' });
    expect(await used()).toBe('4103');
  });

  it('does not admit an allowance that expires while its row lock is waiting', async () => {
    const expires = Date.now() + 1000;
    await installBudgetAuthorization(pool, policy({ validUntil: new Date(expires).toISOString() }));
    const holder = await pool.connect();
    await holder.query('BEGIN');
    await holder.query('SELECT id FROM ai_budget_authorizations WHERE id=$1 FOR UPDATE', [id]);
    const outcome = budget().authorize(request).then(() => ({ admitted: true, code: '' }),
      (error: unknown) => ({ admitted: false, code: (error as { code: string }).code }));
    try {
      let waiting = false;
      const until = Date.now() + 500;
      while (!waiting && Date.now() < until) {
        waiting = (await pool.query(`SELECT EXISTS(SELECT 1 FROM pg_stat_activity
          WHERE datname=current_database() AND wait_event_type='Lock'
          AND query LIKE '%FROM ai_budget_authorizations WHERE id=$1 FOR UPDATE%') AS waiting`)).rows[0].waiting;
        if (!waiting) await new Promise(resolve => setTimeout(resolve, 5));
      }
      expect(waiting).toBe(true);
      await new Promise(resolve => setTimeout(resolve, Math.max(0, expires - Date.now() + 30)));
    } finally { await holder.query('COMMIT'); holder.release(); }
    expect(await outcome).toEqual({ admitted: false, code: 'ai_budget_expired' });
    expect(await used()).toBe('0');
  });

  it('rejects malformed runtime allowance IDs instead of selecting or inventing an approval', () => {
    const config = { NODE_ENV: 'test', DATABASE_URL: 'postgresql://unused', AI_API_KEY: 'fixture', AI_MODEL: 'fixture',
      SESSION_HASH_SECRET: 'fixture-with-more-than-thirty-two-characters', ALLOWED_ORIGINS: 'https://www.thevelani.com' };
    expect(() => readConfig({ ...config, AI_BUDGET_AUTHORIZATION_ID: 'arbitrary-budget' })).toThrow('AI_BUDGET_AUTHORIZATION_ID');
    expect(readConfig(config).aiBudgetAuthorizationId).toBeUndefined();
  });

  async function runtime(authorizationId?: string) {
    await seedKnowledge(pool, [{
      id: 'fixture', title: 'Synthetic knowledge', content: 'A synthetic planning fixture.',
      url: 'https://www.thevelani.com/pages/nevora', locale: 'en', isCore: true,
      reviewedAt: new Date(Date.now() - 86_400_000).toISOString(),
      validUntil: new Date(Date.now() + 86_400_000).toISOString(),
    }]);
    const app = createRuntime(readConfig({
      NODE_ENV: 'test', DATABASE_URL: connectionString, AI_API_KEY: 'synthetic-never-sent-key',
      AI_MODEL: 'fixture-chat', AI_BASE_URL: provider, AI_BUDGET_AUTHORIZATION_ID: authorizationId,
      SESSION_HASH_SECRET: 'synthetic-session-secret-with-more-than-32-characters',
      ALLOWED_ORIGINS: 'https://www.thevelani.com',
    }), { serveWeb: false });
    const session = await app.inject({ method: 'POST', url: '/v1/sessions', headers: { origin: 'https://www.thevelani.com' }, payload: { locale: 'en' } });
    expect(session.statusCode).toBe(201);
    const headers = { origin: 'https://www.thevelani.com', authorization: 'Bearer ' + session.json().sessionToken };
    const profile = await app.inject({ method: 'PUT', url: '/v1/profile', headers,
      payload: { expectedRevision: 0, profile: { ...EMPTY_PROFILE, businessType: 'Synthetic café' } } });
    expect(profile.statusCode).toBe(200);
    return { app, headers, revision: profile.json().revision };
  }

  it('wires both real runtime model paths through admission when no approval is installed', async () => {
    const received: unknown[] = [];
    vi.stubGlobal('fetch', async (_url: unknown, init: RequestInit) => {
      received.push(JSON.parse(String(init.body)));
      return Response.json({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ message: 'Synthetic answer', sourceIds: [], action: 'none', confidence: 'grounded' }) } }] });
    });
    const { app, headers, revision } = await runtime();
    try {
      const chat = await app.inject({ method: 'POST', url: '/v1/chat', headers, payload: { requestId: randomUUID(), message: 'Synthetic question' } });
      const plan = await app.inject({ method: 'POST', url: '/v1/plans', headers, payload: { requestId: randomUUID(), brief: 'Synthetic workflow', profileRevision: revision } });
      expect(chat.statusCode).toBe(503);
      expect(plan.statusCode).toBe(503);
      expect(received).toEqual([]);
      expect(JSON.stringify([chat.json(), plan.json()])).not.toContain('synthetic-never-sent-key');
    } finally { await app.close(); }
  });

  it('commits before SDK dispatch, preserves saved-answer replay and charges a failed plan to the same cap', async () => {
    await installBudgetAuthorization(pool, policy({ limitMicrousd: 20_000 }));
    const received: number[] = [];
    vi.stubGlobal('fetch', async (_url: unknown, init: RequestInit) => {
      const body = JSON.parse(String(init.body));
      received.push(Number(await used())); // Independent read must see acknowledged COMMIT.
      expect(body.model).toBe('fixture-chat');
      return Response.json({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ message: 'Synthetic answer', sourceIds: [], action: 'none', confidence: 'grounded' }) } }] });
    });
    const { app, headers, revision } = await runtime(id);
    const payload = { requestId: randomUUID(), message: 'Synthetic question' };
    try {
      const first = await app.inject({ method: 'POST', url: '/v1/chat', headers, payload });
      expect(first.statusCode).toBe(200);
      const replay = await app.inject({ method: 'POST', url: '/v1/chat', headers, payload });
      expect(replay.json()).toEqual(first.json());
      const plan = await app.inject({ method: 'POST', url: '/v1/plans', headers, payload: { requestId: randomUUID(), brief: 'Synthetic workflow', profileRevision: revision } });
      // Deliberately invalid provider plan, after one properly budgeted attempt.
      expect(plan.statusCode).toBe(503);
      const denied = await app.inject({ method: 'POST', url: '/v1/chat', headers, payload: { requestId: randomUUID(), message: 'Next synthetic question' } });
      expect(denied.statusCode).toBe(503);
      expect(received).toEqual([7000, 20000]);
      expect(await used()).toBe('20000');
    } finally { await app.close(); }
  });

  it.each([
    { limitMicrousd: 0 }, { limitMicrousd: 1.1 }, { limitMicrousd: Number.MAX_SAFE_INTEGER + 1 },
    { approvedReference: '' }, { providerBaseUrl: 'https://user:secret@ai.example.test/v1' },
    { models: [{ ...prices[0], inputMicrousdPerMillion: 0 }] },
    { models: [prices[0], prices[0]] },
  ])('rejects invalid approval input before inserting a policy: %j', async invalid => {
    await expect(installBudgetAuthorization(pool, policy(invalid))).rejects.toThrow();
    expect((await pool.query('SELECT count(*)::int AS n FROM ai_budget_authorizations')).rows[0].n).toBe(0);
  });
});
