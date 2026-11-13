import type { Pool, PoolClient } from 'pg';
import { readRondoOperationsStatus } from './operations-status.js';

export interface WatchdogSample {
  status: 'ok' | 'attention' | 'unavailable';
  alerts: string[];
  nativeMonitorCompletedAt?: string | null;
  retentionCompletedAt?: string | null;
}
export const WATCHDOG_ROLE = 'velani_rondo_dev_watchdog';
export const WATCHDOG_DATABASE = 'velani_rondo_development';

/** No application/owner fallback, pooler, URL override or insecure TLS mode. */
export function watchdogDsn(environment: Readonly<Record<string, string | undefined>>): string {
  const raw = environment.RONDO_WATCHDOG_DATABASE_URL;
  try {
    if (!raw || raw.length > 2048) throw Error();
    const url = new URL(raw);
    if (!['postgres:', 'postgresql:'].includes(url.protocol)
      || url.hostname !== 'ep-withered-pine-bcnflkeq.c-16.us-east-1.aws.neon.tech'
      || (url.port && url.port !== '5432') || url.hash
      || decodeURIComponent(url.username) !== WATCHDOG_ROLE || !url.password
      || decodeURIComponent(url.pathname.slice(1)) !== WATCHDOG_DATABASE
      || url.searchParams.getAll('sslmode').length !== 1 || url.searchParams.get('sslmode') !== 'verify-full'
      || url.searchParams.getAll('channel_binding').length > 1
      || (url.searchParams.has('channel_binding') && url.searchParams.get('channel_binding') !== 'require')
      || [...url.searchParams.keys()].some(key => !['sslmode', 'channel_binding'].includes(key))) throw Error();
    return raw;
  } catch { throw Error('rondo_watchdog_configuration_invalid'); }
}

/** One bounded READ ONLY transaction. Errors never expose DSNs or SQL details.
 * Destroying the checked-out connection cancels pending queries on timeout;
 * a connection acquired after the deadline is also immediately destroyed. */
export async function sampleRondoWatchdog(
  pool: Pool, identity: { database: string; role: string; authorizationId: string; schema?: string }, timeoutMs = 5000,
): Promise<WatchdogSample> {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 10 || timeoutMs > 10_000) throw Error('rondo_watchdog_configuration_invalid');
  let client: PoolClient | undefined, released = false, terminal = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const destroy = () => { if (client && !released) { released = true; client.release(true); } };
  try {
    const work = (async (): Promise<WatchdogSample> => {
      const acquired = await pool.connect();
      if (terminal) { acquired.release(true); throw Error('deadline'); }
      client = acquired;
      await client.query('BEGIN READ ONLY');
      await client.query("SELECT set_config('statement_timeout',$1,true)", [String(timeoutMs)]);
      const role = (await client.query<{
        database: string; schema: string; role: string; session_role: string; privileged: boolean;
        membership: boolean; private_access: boolean; schema_create: boolean; database_owner: boolean;
      }>(`SELECT current_database() AS database,current_schema() AS schema,current_user AS role,session_user AS session_role,
        r.rolsuper OR r.rolcreatedb OR r.rolcreaterole OR r.rolreplication OR r.rolbypassrls AS privileged,
        EXISTS(SELECT 1 FROM pg_auth_members m WHERE m.member=r.oid) AS membership,
        EXISTS(SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
          WHERE n.nspname=current_schema() AND CASE
            WHEN c.relkind='S' THEN has_sequence_privilege(current_user,c.oid,'SELECT,USAGE,UPDATE')
            WHEN c.relkind IN ('r','p','f') THEN has_table_privilege(current_user,c.oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
            WHEN c.relkind IN ('v','m') THEN has_table_privilege(current_user,c.oid,'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
              OR (c.relname NOT IN ('rondo_retention_status','rondo_budget_status','rondo_monitor_status')
                AND has_table_privilege(current_user,c.oid,'SELECT'))
            ELSE false END) AS private_access,
        has_schema_privilege(current_user,current_schema(),'CREATE') AS schema_create,
        EXISTS(SELECT 1 FROM pg_database d WHERE d.datname=current_database() AND d.datdba=r.oid) AS database_owner
        FROM pg_roles r WHERE r.rolname=current_user`)).rows[0];
      if (!role || role.database !== identity.database || role.schema !== (identity.schema ?? 'public')
        || role.role !== identity.role || role.session_role !== identity.role
        || role.privileged || role.membership || role.private_access || role.schema_create || role.database_owner) throw Error('wrong_identity');
      const operations = await readRondoOperationsStatus(client, identity.authorizationId);
      const native = (await client.query<{ state: string | null; completed_at: Date | null; fresh: boolean }>('SELECT * FROM rondo_monitor_status')).rows[0];
      if (!native) throw Error('missing_monitor_view');
      const alerts = [...operations.alerts];
      if (!native.fresh) alerts.push(native.completed_at ? 'native_monitor_stale' : 'native_monitor_unobserved');
      if (native.state === 'attention') alerts.push('native_monitor_attention');
      await client.query('COMMIT');
      return { status: alerts.length ? 'attention' : 'ok', alerts,
        nativeMonitorCompletedAt: native.completed_at?.toISOString() ?? null,
        retentionCompletedAt: operations.scheduledCompletedAt };
    })();
    return await Promise.race([work, new Promise<never>((_, reject) => {
      timer = setTimeout(() => { terminal = true; destroy(); reject(Error('deadline')); }, timeoutMs);
    })]);
  } catch { return { status: 'unavailable', alerts: ['watchdog_probe_unavailable'] }; }
  finally {
    terminal = true;
    if (timer) clearTimeout(timer);
    if (client && !released) { released = true; client.release(true); }
  }
}
