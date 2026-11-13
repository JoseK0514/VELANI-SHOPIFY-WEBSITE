import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { migrate } from '../scripts/migrate.js';
import { installBudgetAuthorization } from '../src/ai-budget.js';
import { sampleRondoWatchdog, watchdogDsn, WATCHDOG_ROLE } from '../src/rondo-watchdog.js';

const sourceDsn = 'postgresql://velani_rondo_dev_watchdog:synthetic-only@ep-withered-pine-bcnflkeq.c-16.us-east-1.aws.neon.tech/velani_rondo_development?sslmode=verify-full';
it('binds the independent reader to its dedicated role, exact development target and authenticated direct TLS transport', () => {
  expect(watchdogDsn({ RONDO_WATCHDOG_DATABASE_URL: sourceDsn })).toBe(sourceDsn);
  for (const bad of [undefined, sourceDsn.replace('dev_watchdog', 'dev_app'), sourceDsn.replace('dev_watchdog', 'dev_monitor'),
    sourceDsn.replace('velani_rondo_development?', 'other?'), sourceDsn.replace('.c-16.', '-pooler.c-16.'),
    sourceDsn.replace('verify-full', 'require'), sourceDsn + '&sslmode=verify-full', sourceDsn + '&host=other.example',
    sourceDsn + '#override', sourceDsn.replace('neon.tech', 'neon.tech.attacker.example')]) {
    expect(() => watchdogDsn({ RONDO_WATCHDOG_DATABASE_URL: bad, DATABASE_URL: sourceDsn })).toThrow('rondo_watchdog_configuration_invalid');
  }
});

const testUrl = process.env.TEST_DATABASE_URL;
describe.skipIf(!testUrl)('independent Rondo SELECT-only observer', () => {
  let admin: Pool, owner: Pool, reader: Pool, database: string, id: string;
  const schema = 'watchdog_' + randomUUID().replaceAll('-', '');
  beforeAll(async () => {
    admin = new Pool({ connectionString: testUrl, max: 1 });
    database = (await admin.query('SELECT current_database() AS name')).rows[0].name;
    await admin.query('CREATE SCHEMA "' + schema + '"');
    const ownerUrl = new URL(testUrl!); ownerUrl.searchParams.set('options', '-c search_path=' + schema + ',public');
    owner = new Pool({ connectionString: ownerUrl.toString(), max: 1 });
    await migrate(owner);
    const password = randomUUID();
    const create = await owner.query("SELECT format('CREATE ROLE velani_rondo_dev_watchdog LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS NOINHERIT',$1::text) AS statement", [password]);
    await owner.query(create.rows[0].statement);
    await owner.query('GRANT USAGE ON SCHEMA "' + schema + '" TO ' + WATCHDOG_ROLE);
    await owner.query('GRANT SELECT ON rondo_retention_status,rondo_budget_status,rondo_monitor_status TO ' + WATCHDOG_ROLE);
    const url = new URL(ownerUrl); url.username = WATCHDOG_ROLE; url.password = password;
    reader = new Pool({ connectionString: url.toString(), max: 1, connectionTimeoutMillis: 1000 });
  }, 30_000);
  beforeEach(async () => {
    await owner.query('TRUNCATE ai_budget_authorizations,rondo_monitor_state,retention_heartbeats,knowledge_documents CASCADE');
    id = randomUUID();
    await installBudgetAuthorization(owner, { id, providerBaseUrl: 'https://provider.example.test/v1', limitMicrousd: 10_000_000,
      validFrom: new Date(Date.now() - 60_000).toISOString(), validUntil: new Date(Date.now() + 86_400_000).toISOString(),
      approvedReference: 'SYNTHETIC-WATCHDOG-TEST-NO-PROVIDER-CALLS', models: [{ model: 'fixture', contextTokens: 1000,
        outputTokenLimit: 1000, inputMicrousdPerMillion: 100, outputMicrousdPerMillion: 100 }] });
    await owner.query("INSERT INTO retention_heartbeats(trigger_source,completed_at,sessions_deleted) VALUES('scheduler',clock_timestamp(),0)");
    await owner.query(`INSERT INTO knowledge_documents(id,title,url,content,locale,reviewed_at,valid_until,status,managed_by,content_hash)
      VALUES('synthetic-watchdog','Synthetic','https://example.test','Synthetic public fixture','en',clock_timestamp(),clock_timestamp()+interval '14 days','published','fixture','fixture')`);
  });
  afterAll(async () => {
    await reader?.end(); await owner?.end();
    if (admin) {
      await admin.query('DROP SCHEMA IF EXISTS "' + schema + '" CASCADE');
      await admin.query('DROP ROLE IF EXISTS ' + WATCHDOG_ROLE); await admin.end();
    }
  });
  const probe = () => sampleRondoWatchdog(reader, { database, role: WATCHDOG_ROLE, authorizationId: id, schema });

  it('distinguishes a missing, stale and future-dated native heartbeat from healthy retention', async () => {
    expect(await probe()).toMatchObject({ status: 'attention', alerts: ['native_monitor_unobserved'] });
    await owner.query("INSERT INTO rondo_monitor_state(scope,state,observed_at) VALUES('development','ok',clock_timestamp()-interval '2 hours')");
    expect(await probe()).toMatchObject({ status: 'attention', alerts: ['native_monitor_stale'] });
    await owner.query("UPDATE rondo_monitor_state SET observed_at=clock_timestamp()+interval '1 hour'");
    expect((await probe()).alerts).toContain('native_monitor_stale');
    await owner.query('UPDATE rondo_monitor_state SET observed_at=clock_timestamp()');
    expect(await probe()).toMatchObject({ status: 'ok', alerts: [] });
    await owner.query("UPDATE rondo_monitor_state SET state='attention'");
    expect((await probe()).alerts).toContain('native_monitor_attention');
  });
  it('detects stopped retention and paused budget without spending or repairing either one', async () => {
    await owner.query("INSERT INTO rondo_monitor_state(scope,state) VALUES('development','ok')");
    await owner.query("UPDATE retention_heartbeats SET completed_at=clock_timestamp()-interval '27 hours'");
    await owner.query('UPDATE ai_budget_authorizations SET enabled=false');
    const result = await probe();
    expect(result.alerts).toContain('retention_scheduler_stale'); expect(result.alerts).toContain('ai_budget_paused');
    expect((await owner.query('SELECT reserved_microusd FROM ai_budget_authorizations')).rows[0].reserved_microusd).toBe('0');
  });
  it('proves aggregate grants, rejects an owner connection and refuses a reader accidentally granted private data', async () => {
    await expect(reader.query('SELECT * FROM sessions')).rejects.toThrow();
    await expect(reader.query('SELECT * FROM rondo_monitor_state')).rejects.toThrow();
    await expect(reader.query("UPDATE retention_heartbeats SET sessions_deleted=1")).rejects.toThrow();
    expect((await sampleRondoWatchdog(owner, { database, role: WATCHDOG_ROLE, authorizationId: id })).status).toBe('unavailable');
    await owner.query('GRANT SELECT ON sessions TO ' + WATCHDOG_ROLE);
    expect((await probe()).status).toBe('unavailable');
    await owner.query('REVOKE SELECT ON sessions FROM ' + WATCHDOG_ROLE);
    await owner.query('GRANT UPDATE ON rondo_monitor_state TO ' + WATCHDOG_ROLE);
    expect((await probe()).status).toBe('unavailable');
    await owner.query('REVOKE UPDATE ON rondo_monitor_state FROM ' + WATCHDOG_ROLE);
    await owner.query('CREATE VIEW unexpected_private_view AS SELECT id FROM sessions');
    await owner.query('GRANT SELECT ON unexpected_private_view TO ' + WATCHDOG_ROLE);
    expect((await probe()).status).toBe('unavailable');
    await owner.query('DROP VIEW unexpected_private_view');
    expect((await sampleRondoWatchdog(reader, { database, role: WATCHDOG_ROLE, authorizationId: id, schema: 'public' })).status).toBe('unavailable');
  });
  it('bounds pool starvation and destroys a connection acquired after its deadline', async () => {
    const held = await reader.connect();
    try { expect((await sampleRondoWatchdog(reader, { database, role: WATCHDOG_ROLE, authorizationId: id }, 20)).status).toBe('unavailable'); }
    finally { held.release(); }
    await new Promise(resolve => setImmediate(resolve));
    await new Promise(resolve => setImmediate(resolve));
    expect(reader.waitingCount).toBe(0);
    expect((await probe()).alerts).toContain('native_monitor_unobserved');
  });
});
