import { createHash, randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { Pool as NeonPool } from '@neondatabase/serverless';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { PostgresRepository, SessionUnavailableError, StaleTurnError } from '../src/repository.js';
import type { Answer, KnowledgeDocument, LeadInput } from '../src/types.js';
import { migrate } from '../scripts/migrate.js';
import { seedKnowledge } from '../scripts/seed.js';
import { runRetention } from '../scripts/retention.js';
import { runConversationRetention } from '../src/conversation-retention.js';
import { createDatabasePool } from '../src/db-pool.js';

// Never fall back to DATABASE_URL: this suite creates and removes its own schema only
// inside an explicitly designated test database.
const testUrl = process.env.TEST_DATABASE_URL;
const hash = (text: string) => createHash('sha256').update(text).digest('hex');
const answer: Answer = { message: 'Nevora helps teams understand the product.', sources: [], action: 'none', confidence: 'grounded', model: 'test' };
const lead: LeadInput = { name: 'Test Visitor', email: 'test@example.com', consent: true, consentVersion: 'lead-v1' };
const document = (id: string, extra: Partial<KnowledgeDocument> = {}): KnowledgeDocument => ({
  id, title: id, url: 'https://www.thevelani.com/pages/nevora', content: 'Reviewed product information.', locale: 'en',
  reviewedAt: new Date(Date.now() - 86_400_000).toISOString(), validUntil: new Date(Date.now() + 86_400_000).toISOString(), ...extra,
});

describe('Knowledge publication input validation', () => {
  it.each([
    { url: 'https://x19hvn-ar.myshopify.com/pages/nevora' },
    { url: 'https://www.thevelani.com:8443/pages/nevora' },
    { content: 'x'.repeat(6001) },
  ])('rejects unsupported source input before connecting', async invalid => {
    const connect = vi.fn();
    const disconnectedPool = { connect } as unknown as Pool;
    await expect(seedKnowledge(disconnectedPool, [document('invalid', invalid)])).rejects.toThrow();
    expect(connect).not.toHaveBeenCalled();
  });
});

describe('Optional database transport', () => {
  const neonUrl = 'postgresql://test:test@ep-example.us-east-1.aws.neon.tech/test?sslmode=require';

  it('uses pg by default even when a proxy is present', async () => {
    const pool = createDatabasePool({ connectionString: neonUrl }, { HTTPS_PROXY: 'http://127.0.0.1:9999' });
    expect(pool).toBeInstanceOf(Pool);
    await pool.end();
  });

  it('keeps local PostgreSQL on pg when Neon transport is enabled', async () => {
    const pool = createDatabasePool({ connectionString: 'postgresql://test:test@127.0.0.1/test' }, { NEON_WEBSOCKET: 'true', NEON_USE_PROXY: 'true' });
    expect(pool).toBeInstanceOf(Pool);
    await pool.end();
  });

  it('uses Neon Pool only with explicit WebSocket opt-in', async () => {
    const pool = createDatabasePool({ connectionString: neonUrl }, { NEON_WEBSOCKET: 'true' });
    expect(pool).toBeInstanceOf(NeonPool);
    await pool.end();
  });

  it('rejects missing or unsupported explicit proxy configuration', () => {
    expect(() => createDatabasePool({ connectionString: neonUrl }, { NEON_WEBSOCKET: 'true', NEON_USE_PROXY: 'true' })).toThrow('HTTPS_PROXY');
    expect(() => createDatabasePool({ connectionString: neonUrl }, { NEON_WEBSOCKET: 'true', NEON_USE_PROXY: 'true', HTTPS_PROXY: 'socks://127.0.0.1' })).toThrow('HTTP or HTTPS');
  });
});

describe.skipIf(!testUrl)('PostgreSQL repository integration', () => {
  let admin: Pool;
  let pool: Pool;
  let repository: PostgresRepository;
  const schema = `velani_test_${randomUUID().replaceAll('-', '')}`;

  beforeAll(async () => {
    admin = new Pool({ connectionString: testUrl, max: 1 });
    // The identifier is generated above and contains only this fixed prefix and hex.
    await admin.query(`CREATE SCHEMA "${schema}"`);
    const scopedUrl = new URL(testUrl!);
    scopedUrl.searchParams.set('options', `-c search_path=${schema},public`);
    pool = new Pool({ connectionString: scopedUrl.toString(), max: 12 });
    repository = new PostgresRepository(pool);
    await migrate(pool);
  }, 30_000);

  beforeEach(async () => {
    await pool.query('TRUNCATE sessions, knowledge_documents, rate_limits, leads RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    await repository?.close();
    if (admin) {
      await admin.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      await admin.end();
    }
  }, 30_000);

  async function session() {
    const tokenHash = hash(randomUUID());
    const value = await repository.createSession(tokenHash, 'en', new Date(Date.now() + 60_000));
    return { ...value, tokenHash };
  }

  it('only finds the session matching a token hash and excludes expired sessions', async () => {
    const one = await session();
    const two = await session();
    expect((await repository.findSession(one.tokenHash))?.id).toBe(one.id);
    expect((await repository.findSession(two.tokenHash))?.id).toBe(two.id);
    expect(await repository.findSession(hash('unknown'))).toBeNull();
    await pool.query("UPDATE sessions SET expires_at = now() - interval '1 second' WHERE id = $1", [one.id]);
    expect(await repository.findSession(one.tokenHash)).toBeNull();
    await expect(repository.claimTurn(one.id, 'expired', hash('request'))).rejects.toBeInstanceOf(SessionUnavailableError);
  });

  it('permits one concurrent turn per session across independent repository instances', async () => {
    const one = await session();
    const otherRepository = new PostgresRepository(pool);
    const claims = await Promise.all(Array.from({ length: 12 }, (_, index) =>
      (index % 2 ? repository : otherRepository).claimTurn(one.id, `turn-${index}`, hash(`${index}`))));
    expect(claims.filter(claim => claim.state === 'new')).toHaveLength(1);
    expect(claims.filter(claim => claim.state === 'busy')).toHaveLength(11);
  });

  it('rejects reused IDs with changed payloads and replays completed answers exactly once', async () => {
    const one = await session();
    const claim = await repository.claimTurn(one.id, 'turn', hash('same'));
    expect(claim.state).toBe('new');
    if (claim.state !== 'new') throw new Error('Expected a new claim.');
    expect(await repository.claimTurn(one.id, 'turn', hash('different'))).toEqual({ state: 'conflict' });
    await repository.completeTurn(one.id, 'turn', 'same', answer, claim.leaseToken);
    expect(await repository.claimTurn(one.id, 'turn', hash('same'))).toEqual({ state: 'completed', answer });
    expect(await repository.claimTurn(one.id, 'turn', hash('different'))).toEqual({ state: 'conflict' });
    expect(await repository.history(one.id, 20)).toEqual([{ role: 'user', content: 'same' }, { role: 'assistant', content: answer.message }]);
  });

  it('fences stale completions and failures after an expired lease is reclaimed', async () => {
    const one = await session();
    const old = await repository.claimTurn(one.id, 'turn', hash('same'));
    if (old.state !== 'new') throw new Error('Expected a new claim.');
    await pool.query("UPDATE chat_turns SET lease_expires_at = now() - interval '1 second' WHERE session_id = $1", [one.id]);
    const current = await repository.claimTurn(one.id, 'turn', hash('same'));
    if (current.state !== 'new') throw new Error('Expected a reclaimed claim.');
    expect(current.leaseToken).not.toBe(old.leaseToken);
    await expect(repository.completeTurn(one.id, 'turn', 'same', answer, old.leaseToken)).rejects.toBeInstanceOf(StaleTurnError);
    await repository.failTurn(one.id, 'turn', old.leaseToken);
    expect(await repository.claimTurn(one.id, 'other-turn', hash('other'))).toEqual({ state: 'busy' });
    await repository.completeTurn(one.id, 'turn', 'same', answer, current.leaseToken);
    expect(await repository.history(one.id, 20)).toHaveLength(2);
  });

  it('keeps ordered history isolated to its session and cascades conversation deletion', async () => {
    const one = await session();
    const two = await session();
    for (const [value, text] of [[one, 'private first'], [two, 'private second']] as const) {
      const claim = await repository.claimTurn(value.id, 'turn', hash(text));
      if (claim.state !== 'new') throw new Error('Expected a claim.');
      await repository.completeTurn(value.id, 'turn', text, answer, claim.leaseToken);
    }
    expect((await repository.history(one.id, 2))[0]?.content).toBe('private first');
    expect((await repository.history(two.id, 2))[0]?.content).toBe('private second');
    await repository.deleteSession(one.id);
    expect(await repository.history(one.id, 20)).toEqual([]);
    expect((await pool.query('SELECT count(*) FROM chat_turns WHERE session_id = $1', [one.id])).rows[0].count).toBe('0');
    expect(await repository.history(two.id, 20)).toHaveLength(2);
  });

  it('enforces an atomic shared rate limit and resets expired windows', async () => {
    const results = await Promise.all(Array.from({ length: 20 }, () => repository.consumeRateLimit('test-rate-key', 5, 60)));
    expect(results.filter(Boolean)).toHaveLength(5);
    await pool.query("UPDATE rate_limits SET expires_at = now() - interval '1 second'");
    expect(await repository.consumeRateLimit('test-rate-key', 5, 60)).toBe(true);
    expect(await repository.consumeRateLimit('independent-key', 5, 60)).toBe(true);
  });

  it('requires consent and stores one lead per submission under concurrent retry', async () => {
    const one = await session();
    await expect(repository.saveLead(one.id, 'lead', hash('lead'), { ...lead, consent: false } as unknown as LeadInput)).rejects.toThrow('consent');
    const results = await Promise.all(Array.from({ length: 8 }, () => repository.saveLead(one.id, 'lead', hash('lead'), lead)));
    expect(results.filter(result => result !== 'conflict' && !result.duplicate)).toHaveLength(1);
    expect(new Set(results.map(result => result === 'conflict' ? result : result.id)).size).toBe(1);
    expect(await repository.saveLead(one.id, 'lead', hash('changed'), lead)).toBe('conflict');
    expect((await pool.query('SELECT count(*) FROM leads')).rows[0].count).toBe('1');
    await repository.deleteSession(one.id);
    expect((await pool.query('SELECT session_id, consent FROM leads')).rows).toEqual([{ session_id: null, consent: true }]);
  });

  it('always retrieves core constraints while excluding expired, future, and unpublished knowledge', async () => {
    await seedKnowledge(pool, [
      document('core', { isCore: true, content: 'Scope constraints that do not match the question.' }),
      document('scheduling', { content: 'Employee scheduling information.' }),
      document('expired', { reviewedAt: '2020-01-01T00:00:00Z', validUntil: '2020-02-01T00:00:00Z' }),
      document('future', { reviewedAt: '2099-01-01T00:00:00Z', validUntil: '2099-02-01T00:00:00Z' }),
      document('archived'),
    ]);
    await pool.query("UPDATE knowledge_documents SET status = 'archived' WHERE id = 'archived'");
    const found = await repository.knowledge("scheduling'); DROP TABLE sessions; --", 'en');
    expect(found.map(doc => doc.id)).toEqual(['core', 'scheduling']);
    expect(found.every(doc => /^\d{4}-\d{2}-\d{2}$/.test(doc.reviewedAt) && /^\d{4}-\d{2}-\d{2}$/.test(doc.validUntil))).toBe(true);
    await repository.ping();
  });

  it('keeps date-only sources valid through the end of their UTC expiry day', async () => {
    const today = new Date().toISOString().slice(0, 10);
    await seedKnowledge(pool, [document('today', { reviewedAt: today, validUntil: today })]);
    expect((await repository.knowledge('today', 'en')).map(doc => doc.id)).toEqual(['today']);
    const stored = (await pool.query('SELECT valid_until FROM knowledge_documents')).rows[0].valid_until as Date;
    expect(stored.toISOString()).toBe(`${today}T23:59:59.999Z`);
  });

  it('seeds deterministically and archives removed seed documents', async () => {
    const first = document('first');
    const second = document('second');
    await seedKnowledge(pool, [first, second]);
    await seedKnowledge(pool, [first, second]);
    expect((await pool.query('SELECT count(*) FROM knowledge_documents')).rows[0].count).toBe('2');
    await seedKnowledge(pool, [{ ...first, content: 'Updated approved facts.' }]);
    expect((await repository.knowledge('facts', 'en')).map(doc => doc.id)).toEqual(['first']);
    expect((await pool.query("SELECT status FROM knowledge_documents WHERE id = 'second'")).rows[0].status).toBe('archived');
    await expect(seedKnowledge(pool, [first, first])).rejects.toThrow('unique');
    expect((await pool.query("SELECT content FROM knowledge_documents WHERE id = 'first'")).rows[0].content).toBe('Updated approved facts.');
  });

  it('checks migration checksums and skips already applied migrations', async () => {
    expect(await migrate(pool)).toEqual([]);
    const prior = (await pool.query('SELECT name, checksum FROM schema_migrations LIMIT 1')).rows[0];
    await pool.query("UPDATE schema_migrations SET checksum = 'changed' WHERE name = $1", [prior.name]);
    try { await expect(migrate(pool)).rejects.toThrow('checksum mismatch'); }
    finally { await pool.query('UPDATE schema_migrations SET checksum = $2 WHERE name = $1', [prior.name, prior.checksum]); }
  });

  it('previews retention by default and separately applies conversation and lead retention', async () => {
    const one = await session();
    const two = await session();
    await repository.saveLead(one.id, 'recent-lead', hash('recent'), lead);
    await repository.saveLead(two.id, 'old-lead', hash('old'), lead);
    await pool.query("UPDATE sessions SET expires_at = now() - interval '1 second' WHERE id = $1", [one.id]);
    await pool.query("UPDATE leads SET created_at = now() - interval '91 days' WHERE session_id = $1", [two.id]);
    await repository.consumeRateLimit('old-window', 1, 1);
    await pool.query("UPDATE rate_limits SET expires_at = now() - interval '2 days'");
    expect(await runRetention(pool)).toEqual({ apply: false, sessions: 1, leads: 1, rateLimits: 1 });
    expect((await pool.query('SELECT count(*) FROM sessions')).rows[0].count).toBe('2');
    expect(await runRetention(pool, { apply: true })).toEqual({ apply: true, sessions: 1, leads: 1, rateLimits: 1 });
    expect((await pool.query('SELECT session_id FROM leads')).rows).toEqual([{ session_id: null }]);
    expect((await pool.query('SELECT count(*) FROM sessions')).rows[0].count).toBe('1');
    expect((await pool.query('SELECT count(*) FROM rate_limits')).rows[0].count).toBe('0');
  });

  it('automatically removes expired/old conversation children, preserves enquiries and recent chats, and tolerates concurrent delivery', async () => {
    const expired = await session();
    const old = await session();
    const recent = await session();
    for (const value of [expired, old, recent]) {
      const claim = await repository.claimTurn(value.id, 'turn', hash(value.id));
      if (claim.state !== 'new') throw new Error('Expected a new claim.');
      await repository.completeTurn(value.id, 'turn', 'Synthetic retention test', answer, claim.leaseToken);
      await repository.saveLead(value.id, 'lead', hash(value.id), lead);
      await pool.query('INSERT INTO session_profiles (session_id, profile, revision) VALUES ($1, $2, 1)', [value.id, '{}']);
      await pool.query("INSERT INTO workflow_plans (session_id, generated_plan, actions, profile_revision) VALUES ($1, '{}', '[]', 1)", [value.id]);
      await pool.query("INSERT INTO plan_requests (session_id, request_id, request_hash, status, lease_token, lease_expires_at) VALUES ($1, 'pending-plan', $2, 'pending', $3, now() + interval '1 minute')", [value.id, hash(value.id), randomUUID()]);
    }
    await pool.query("UPDATE sessions SET expires_at = now() - interval '1 second' WHERE id = $1", [expired.id]);
    await pool.query("UPDATE sessions SET created_at = now() - interval '31 days' WHERE id = $1", [old.id]);
    await pool.query("UPDATE leads SET created_at = now() - interval '91 days'");
    await repository.consumeRateLimit('preserved-rate-limit', 1, 1);
    const runs = await Promise.all([runConversationRetention(pool), runConversationRetention(pool)]);
    expect(runs.map(result => result.sessions).sort()).toEqual([0, 2]);
    expect((await pool.query('SELECT id FROM sessions')).rows).toEqual([{ id: recent.id }]);
    for (const table of ['chat_turns', 'session_profiles', 'workflow_plans', 'plan_requests']) {
      expect((await pool.query(`SELECT session_id FROM ${table}`)).rows).toEqual([{ session_id: recent.id }]);
    }
    expect((await pool.query('SELECT count(*) FROM messages')).rows[0].count).toBe('2');
    expect((await pool.query('SELECT count(*) FROM leads')).rows[0].count).toBe('3');
    expect((await pool.query('SELECT count(*) FROM leads WHERE session_id IS NULL')).rows[0].count).toBe('2');
    expect((await pool.query('SELECT count(*) FROM rate_limits')).rows[0].count).toBe('1');
    expect(await runConversationRetention(pool)).toEqual({ sessions: 0 });
  });

  it('lets manual cleanup waiting behind cron see the committed deletion', async () => {
    const one = await session();
    await pool.query("UPDATE sessions SET expires_at = now() - interval '1 second' WHERE id = $1", [one.id]);
    const blocker = await pool.connect();
    await blocker.query('BEGIN');
    await blocker.query('SELECT id FROM sessions WHERE id = $1 FOR UPDATE', [one.id]);
    const cron = runConversationRetention(pool);
    const waitForQuery = async (pattern: string) => {
      for (let attempt = 0; attempt < 40; attempt++) {
        const result = await pool.query("SELECT 1 FROM pg_stat_activity WHERE datname = current_database() AND usename = current_user AND wait_event_type = 'Lock' AND query LIKE $1", [pattern]);
        if (result.rowCount) return;
        await new Promise(resolve => setTimeout(resolve, 25));
      }
      throw new Error('Expected a cleanup query waiting on a database lock.');
    };
    let manual: ReturnType<typeof runRetention> | undefined;
    try {
      await waitForQuery('DELETE FROM sessions%');
      manual = runRetention(pool, { apply: true });
      const completed = Promise.allSettled([cron, manual]);
      await waitForQuery('SELECT pg_advisory_xact_lock%');
      await blocker.query('COMMIT');
      const results = await completed;
      expect(results).toEqual([
        { status: 'fulfilled', value: { sessions: 1 } },
        { status: 'fulfilled', value: { apply: true, sessions: 0, leads: 0, rateLimits: 0 } },
      ]);
    } finally {
      await blocker.query('ROLLBACK'); blocker.release();
      await Promise.allSettled([cron, ...(manual ? [manual] : [])]);
    }
  });

  it('rolls back a failed cleanup and releases its connection for a later run', async () => {
    const one = await session();
    await pool.query("UPDATE sessions SET expires_at = now() - interval '1 second' WHERE id = $1", [one.id]);
    await pool.query("CREATE FUNCTION reject_retention_test() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Synthetic deletion failure'; END $$");
    await pool.query('CREATE TRIGGER reject_retention_test BEFORE DELETE ON sessions FOR EACH ROW EXECUTE FUNCTION reject_retention_test()');
    try {
      await expect(runConversationRetention(pool)).rejects.toThrow('Synthetic deletion failure');
      expect((await pool.query('SELECT id FROM sessions')).rows).toEqual([{ id: one.id }]);
    } finally {
      await pool.query('DROP TRIGGER reject_retention_test ON sessions');
      await pool.query('DROP FUNCTION reject_retention_test()');
    }
    expect(await runConversationRetention(pool)).toEqual({ sessions: 1 });
  });
});
