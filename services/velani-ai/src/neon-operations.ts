import { parseTriggerDelivery } from '@neon/functions/triggers';
import { rondoTarget } from './rondo-target.js';

export const INERT_PROVIDER_ENV = Object.freeze({
  DATABASE_URL: 'postgresql://disabled.invalid/disabled', DATABASE_URL_UNPOOLED: 'postgresql://disabled.invalid/disabled',
  PGDATABASE: 'disabled', PGHOST: 'disabled.invalid', PGHOST_UNPOOLED: 'disabled.invalid',
  PGPASSWORD: 'disabled', PGUSER: 'disabled',
  AWS_ACCESS_KEY_ID: 'disabled', AWS_SECRET_ACCESS_KEY: 'disabled', AWS_REGION: 'us-east-1',
  AWS_ENDPOINT_URL_S3: 'https://disabled.invalid',
  NEON_AI_GATEWAY_TOKEN: 'disabled', NEON_AI_GATEWAY_BASE_URL: 'https://disabled.invalid',
});
type Role = 'monitor' | 'retention';
type Env = Readonly<Record<string, string | undefined>>;
const answer = (state: string, status: number) => Response.json({ state }, { status, headers: { 'cache-control': 'no-store' } });

/** Operator-only, finite fault injection. Schedules keep running, but no work or
 * completion heartbeat is produced during the pause. Expiry restores ordinary
 * execution without a control-plane credential or a live supervising process. */
function drillPaused(role: Role, scope: string, env: Env): boolean {
  const values = ['RONDO_DRILL_PAUSE_FROM','RONDO_DRILL_PAUSE_UNTIL','RONDO_DRILL_ENVIRONMENT',
    'RONDO_DRILL_ROLE','RONDO_DRILL_APPROVAL_ID'].map(key => env[key]);
  if (values.every(value => value === undefined)) return false;
  const [from, until, environment, selectedRole, approval] = values;
  const absolute = (value: string | undefined) => {
    if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) throw Error('invalid_drill_window');
    const timestamp = Date.parse(value);
    if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString() !== value) throw Error('invalid_drill_window');
    return timestamp;
  };
  const start = absolute(from), end = absolute(until), now = Date.now();
  if (environment !== scope || selectedRole !== role || !approval
    || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(approval)
    || end <= start || end - start > 30 * 60 * 60_000 || !Number.isFinite(now)) throw Error('invalid_drill_window');
  return start <= now && now < end;
}

export function developmentOperationsDsn(role: Role, env: Env): string {
  const raw = env.RONDO_OPERATIONS_DATABASE_URL;
  try {
    const target = rondoTarget(env.RONDO_OPERATIONS_ENVIRONMENT);
    if (!raw || raw.length > 2048) throw Error();
    const url = new URL(raw);
    const expectedRole = role === 'monitor' ? target.monitorRole : target.appRole;
    if (!['postgres:', 'postgresql:'].includes(url.protocol) || url.hostname !== target.host || url.hash
      || url.port && url.port !== '5432' || decodeURIComponent(url.username) !== expectedRole
      || !url.password || decodeURIComponent(url.pathname.slice(1)) !== target.database
      || url.searchParams.get('sslmode') !== 'verify-full'
      || [...url.searchParams.keys()].some(key => !['sslmode','channel_binding'].includes(key))
      || url.searchParams.getAll('sslmode').length !== 1 || url.searchParams.getAll('channel_binding').length > 1
      || url.searchParams.has('channel_binding') && url.searchParams.get('channel_binding') !== 'require') throw Error();
    return raw;
  } catch { throw Error('rondo_operations_database_invalid'); }
}

async function body(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw Error('invalid_body');
  const chunks: Uint8Array[] = []; let size = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => { timer = setTimeout(() => {
    void reader.cancel().catch(() => undefined); reject(Error('invalid_body'));
  }, 2000); });
  try {
    for (;;) {
      const chunk = await Promise.race([reader.read(), deadline]);
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 16384) { void reader.cancel().catch(() => undefined); throw Error('invalid_body'); }
      chunks.push(chunk.value);
    }
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks)));
  } finally { if (timer) clearTimeout(timer); }
}

/** Native Neon proxy only: the platform strips client-supplied x-neon-* headers.
 * Parser tests do not establish that deployment boundary; verify it on the
 * actual closed deployment before installing any scoped credentials. */
export function createNeonOperationsHandler(role: Role, env: Env, expectedSource: string, run: () => Promise<{ state: string; notice?: string }>) {
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/run' || url.search) return answer('not_found',404);
    if (!request.headers.has('x-neon-trigger-invocation-id')) return answer('unauthorized',401);
    try {
      const parsed = parseTriggerDelivery({ headers: request.headers, body: await body(request) });
      if (!parsed.ok) return answer('unauthorized',401);
      const target = rondoTarget(env.RONDO_OPERATIONS_ENVIRONMENT);
      if (parsed.invocation.type !== 'schedule' || parsed.invocation.trigger.name !== 'rondo-' + target.scope + '-' + role
        || !Number.isFinite(Date.parse(parsed.invocation.data.scheduledAt))) return answer('wrong_trigger',403);
      if (!/^[a-f0-9]{40}$/.test(expectedSource) || env.RONDO_OPERATIONS_SOURCE_SHA !== expectedSource
        || env.RONDO_OPERATIONS_BRANCH_ID !== target.branch || env.NEON_BRANCH_ID !== target.branch
        || !['true','false'].includes(env.RONDO_OPERATIONS_ENABLED ?? '')
        || !Object.entries(INERT_PROVIDER_ENV).every(([key,value]) => env[key] === value)) return answer('not_ready',503);
      if (env.RONDO_OPERATIONS_ENABLED === 'false') return answer('disabled',200);
      if (drillPaused(role, target.scope, env)) {
        console.info(JSON.stringify({ event: 'rondo_' + target.scope + '_operations', role, state: 'drill_paused' }));
        return answer('drill_paused',200);
      }
      const result = await run();
      const ok = ['ok','completed','busy'].includes(result.state) && !['uncertain','capped'].includes(result.notice ?? '');
      console.info(JSON.stringify({ event: 'rondo_' + target.scope + '_operations', role, state: ok ? result.state : 'attention', notice: result.notice ?? 'none' }));
      return answer(ok ? result.state : 'attention', ok ? 200 : 503);
    } catch {
      console.warn(JSON.stringify({ event: 'rondo_operations', role, state: 'unavailable' }));
      return answer('unavailable',503);
    }
  };
}
