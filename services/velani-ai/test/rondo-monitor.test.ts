import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { migrate } from '../scripts/migrate.js';
import { processRondoObservation } from '../src/rondo-monitor.js';

const testUrl = process.env.TEST_DATABASE_URL;
describe.skipIf(!testUrl)('independent Rondo incident monitor', () => {
  let admin: Pool, pool: Pool;
  const schema = 'monitor_test_' + randomUUID().replaceAll('-', '');
  const policy = { scope: 'development' as const, sourceSha: 'a'.repeat(40), mailEnabled: true, maxNoticeAttempts: 2 };
  beforeAll(async () => {
    admin = new Pool({ connectionString: testUrl, max: 1 });
    await admin.query('CREATE SCHEMA "' + schema + '"');
    const url = new URL(testUrl!);
    url.searchParams.set('options', '-c search_path=' + schema + ',public');
    pool = new Pool({ connectionString: url.toString(), max: 20 });
    await migrate(pool);
  });
  beforeEach(async () => { await pool.query('TRUNCATE rondo_monitor_notices,rondo_monitor_state'); });
  afterAll(async () => {
    await pool?.end();
    if (admin) { await admin.query('DROP SCHEMA IF EXISTS "' + schema + '" CASCADE'); await admin.end(); }
  });
  const sample = (status: 'ok' | 'attention') => async () => ({ status });
  it('journals production incidents under their own scope and preserves development notices', async () => {
    const sent: string[] = [];
    const notify = async (_kind: 'outage' | 'recovery', key: string) => { sent.push(key); return { id: randomUUID() }; };
    await processRondoObservation(pool, policy, sample('attention'), notify);
    await processRondoObservation(pool, { ...policy, scope: 'production' }, sample('attention'), notify);
    await processRondoObservation(pool, { ...policy, scope: 'production' }, sample('attention'), notify);
    expect(sent).toHaveLength(2);
    expect(sent[0]).toMatch(/^rondo-ops\/development\//);
    expect(sent[1]).toMatch(/^rondo-ops\/production\//);
    expect((await pool.query('SELECT scope,attempts FROM rondo_monitor_notices ORDER BY scope')).rows)
      .toEqual([{ scope: 'development', attempts: 1 }, { scope: 'production', attempts: 1 }]);
  });
  it('sends one outage and one recovery across concurrent ticks and keeps healthy startup quiet', async () => {
    const sent: { kind: string; key: string }[] = [];
    const notify = async (kind: 'outage' | 'recovery', key: string) => { sent.push({ kind, key }); return { id: randomUUID() }; };
    await processRondoObservation(pool, policy, sample('ok'), notify);
    expect(sent).toEqual([]);
    await Promise.all(Array.from({ length: 12 }, () => processRondoObservation(pool, policy, sample('attention'), notify)));
    await processRondoObservation(pool, policy, sample('attention'), notify);
    expect(sent.map(item => item.kind)).toEqual(['outage']);
    await processRondoObservation(pool, policy, sample('ok'), notify);
    await processRondoObservation(pool, policy, sample('ok'), notify);
    expect(sent.map(item => item.kind)).toEqual(['outage', 'recovery']);
    expect(sent[0].key).not.toBe(sent[1].key);
    expect((await pool.query('SELECT status,attempts FROM rondo_monitor_notices ORDER BY created_at')).rows)
      .toEqual([{ status: 'submitted', attempts: 1 }, { status: 'submitted', attempts: 1 }]);
  });
  it('keeps an uncertain provider outcome and never automatically resends it', async () => {
    let calls = 0;
    const notify = async () => { calls++; throw Error('Synthetic lost provider acknowledgement'); };
    await processRondoObservation(pool, policy, sample('attention'), notify);
    await processRondoObservation(pool, policy, sample('attention'), notify);
    expect(calls).toBe(1);
    expect((await pool.query('SELECT status,attempts FROM rondo_monitor_notices')).rows)
      .toEqual([{ status: 'uncertain', attempts: 1 }]);
    await expect(pool.query('UPDATE rondo_monitor_notices SET attempts=0')).rejects.toThrow();
  });
  it('does not resend a sending intent retained after an unobserved process crash', async () => {
    const incident = randomUUID();
    await pool.query("INSERT INTO rondo_monitor_state(scope,state,incident_id) VALUES('development','attention',$1)", [incident]);
    await pool.query(`INSERT INTO rondo_monitor_notices(scope,incident_id,kind,source_sha,status,attempts)
      VALUES('development',$1,'outage',$2,'sending',1)`, [incident, policy.sourceSha]);
    let calls = 0;
    const result = await processRondoObservation(pool, policy, sample('attention'), async () => { calls++; return { id: randomUUID() }; });
    expect(calls).toBe(0);
    expect(result.notice).toBe('uncertain');
  });
  it('bounds a hung acknowledgement, releases its lock and never sends again on a later tick', async () => {
    let calls = 0;
    const notify = async () => { calls++; return new Promise<{ id: string }>(() => {}); };
    const result = await processRondoObservation(pool, { ...policy, deliveryDeadlineMs: 20 }, sample('attention'), notify);
    expect(result.notice).toBe('uncertain');
    await processRondoObservation(pool, policy, sample('attention'), notify);
    expect(calls).toBe(1);
  });
  it('enforces the durable finite send allowance across restarts and reports a capped recovery', async () => {
    const sent: string[] = [];
    const notify = async (kind: 'outage' | 'recovery') => { sent.push(kind); return { id: randomUUID() }; };
    await processRondoObservation(pool, { ...policy, maxNoticeAttempts: 1 }, sample('attention'), notify);
    const result = await processRondoObservation(pool, { ...policy, maxNoticeAttempts: 1 }, sample('ok'), notify);
    expect(sent).toEqual(['outage']);
    expect(result.notice).toBe('capped');
    await processRondoObservation(pool, { ...policy, maxNoticeAttempts: 1 }, sample('attention'), notify);
    expect(sent).toEqual(['outage']);
  });
  it('sends nothing while disabled and can arm only an unattempted current outage', async () => {
    let calls = 0;
    const notify = async () => { calls++; return { id: randomUUID() }; };
    await processRondoObservation(pool, { ...policy, mailEnabled: false }, sample('attention'), notify);
    expect(calls).toBe(0);
    await processRondoObservation(pool, policy, sample('attention'), notify);
    expect(calls).toBe(1);
    await processRondoObservation(pool, policy, sample('attention'), notify);
    expect(calls).toBe(1);
  });
  it('does not send or retain private exception text when observation fails', async () => {
    let calls = 0;
    await expect(processRondoObservation(pool, policy, async () => { throw Error('private@example.com secret connection'); },
      async () => { calls++; return { id: randomUUID() }; })).rejects.toThrow('rondo_monitor_unavailable');
    expect(calls).toBe(0);
    expect((await pool.query('SELECT count(*)::int AS n FROM rondo_monitor_notices')).rows[0].n).toBe(0);
  });
});
