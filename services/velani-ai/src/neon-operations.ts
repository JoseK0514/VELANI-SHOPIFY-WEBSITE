import { parseTriggerDelivery } from '@neon/functions/triggers';

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
const branch = 'br-snowy-brook-bcc6b3zm';
const host = 'ep-withered-pine-bcnflkeq.c-16.us-east-1.aws.neon.tech';
const answer = (state: string, status: number) => Response.json({ state }, { status, headers: { 'cache-control': 'no-store' } });

export function developmentOperationsDsn(role: Role, env: Env): string {
  const raw = env.RONDO_OPERATIONS_DATABASE_URL;
  try {
    if (!raw || raw.length > 2048) throw Error();
    const url = new URL(raw);
    const expectedRole = role === 'monitor' ? 'velani_rondo_dev_monitor' : 'velani_rondo_dev_app';
    if (!['postgres:', 'postgresql:'].includes(url.protocol) || url.hostname !== host
      || url.port && url.port !== '5432' || decodeURIComponent(url.username) !== expectedRole
      || !url.password || decodeURIComponent(url.pathname.slice(1)) !== 'velani_rondo_development'
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
      if (parsed.invocation.type !== 'schedule' || parsed.invocation.trigger.name !== 'rondo-development-' + role
        || !Number.isFinite(Date.parse(parsed.invocation.data.scheduledAt))) return answer('wrong_trigger',403);
      if (!/^[a-f0-9]{40}$/.test(expectedSource) || env.RONDO_OPERATIONS_SOURCE_SHA !== expectedSource
        || env.RONDO_OPERATIONS_BRANCH_ID !== branch || env.NEON_BRANCH_ID !== branch
        || !['true','false'].includes(env.RONDO_OPERATIONS_ENABLED ?? '')
        || !Object.entries(INERT_PROVIDER_ENV).every(([key,value]) => env[key] === value)) return answer('not_ready',503);
      if (env.RONDO_OPERATIONS_ENABLED === 'false') return answer('disabled',200);
      const result = await run();
      const ok = ['ok','completed','busy'].includes(result.state) && !['uncertain','capped'].includes(result.notice ?? '');
      console.info(JSON.stringify({ event: 'rondo_development_operations', role, state: ok ? result.state : 'attention', notice: result.notice ?? 'none' }));
      return answer(ok ? result.state : 'attention', ok ? 200 : 503);
    } catch {
      console.warn(JSON.stringify({ event: 'rondo_development_operations', role, state: 'unavailable' }));
      return answer('unavailable',503);
    }
  };
}
