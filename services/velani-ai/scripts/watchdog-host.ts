import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

type Settings = { enabled: false } | { enabled: true; heartbeat: string; until: number };
export function watchdogHostSettings(environment: NodeJS.ProcessEnv, now = Date.now()): Settings {
  const enabled = environment.RONDO_WATCHDOG_ENABLED ?? 'false';
  if (enabled === 'false') return { enabled: false };
  const source = environment.RONDO_WATCHDOG_SOURCE_SHA ?? '';
  const heartbeat = environment.RONDO_WATCHDOG_HEARTBEAT_URL ?? '';
  const until = Date.parse(environment.RONDO_WATCHDOG_HEARTBEAT_UNTIL ?? '');
  if (enabled !== 'true' || !/^[a-f0-9]{40}$/.test(source) || source !== environment.RENDER_GIT_COMMIT
    || !/^https:\/\/hc-ping\.com\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(heartbeat)
    || !environment.RONDO_WATCHDOG_HEARTBEAT_APPROVAL?.trim()
    || !Number.isFinite(until) || until <= now || until - now > 31 * 86_400_000) throw Error('watchdog_host_configuration_invalid');
  return { enabled: true, heartbeat, until };
}

async function bounded<T>(work: Promise<T>, milliseconds: number, code: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([work, new Promise<never>((_resolve, reject) => { timer = setTimeout(() => reject(Error(code)), milliseconds); })]);
  } finally { clearTimeout(timer); }
}

/** The external check watches both unhealthy results and a missing runner.
 * Native notification attempts remain in their independent durable journal. */
export async function watchdogHostTick(
  settings: Settings, observe: () => Promise<unknown>, fetcher: typeof fetch = fetch, now = Date.now,
) {
  if (!settings.enabled) return { status: 'disabled' };
  if (now() >= settings.until) return { status: 'expired' };
  let healthy = false, observationFailed = false;
  try {
    const result = await bounded(observe(), 30_000, 'watchdog_observation_unavailable') as { status?: string; deliveryStatus?: string };
    healthy = result?.status === 'ok' && result?.deliveryStatus === 'armed';
  } catch { observationFailed = true; }
  // An observation may finish after the finite notification window closed.
  if (now() >= settings.until) {
    if (observationFailed) throw Error('watchdog_observation_unavailable');
    return { status: 'expired' };
  }
  try {
    const response = await bounded(fetcher(settings.heartbeat + (healthy ? '' : '/fail'), {
      method: 'POST', body: '', redirect: 'error', credentials: 'omit', signal: AbortSignal.timeout(2000),
    }), 2000, 'watchdog_heartbeat_unavailable');
    if (!response.ok) throw Error('receiver_unavailable');
  } catch { throw Error('watchdog_heartbeat_unavailable'); }
  if (observationFailed) throw Error('watchdog_observation_unavailable');
  return { status: healthy ? 'ok' : 'attention' };
}

async function main() {
  const settings = watchdogHostSettings(process.env);
  const controller = new AbortController();
  const stop = () => controller.abort();
  process.once('SIGTERM', stop); process.once('SIGINT', stop);
  // Disabled deployment does not load a database driver or send a heartbeat.
  const observe = settings.enabled
    ? async () => (await import('./watchdog.js')).runWatchdog('observe')
    : async () => undefined;
  try {
    while (!controller.signal.aborted) {
      const result = await watchdogHostTick(settings, observe);
      console.log(JSON.stringify({ component: 'rondo_watchdog_host', ...result }));
      if (result.status === 'expired') break;
      await delay(15 * 60_000, undefined, { signal: controller.signal }).catch(error => {
        if (!controller.signal.aborted) throw error;
      });
    }
  } finally { process.removeListener('SIGTERM', stop); process.removeListener('SIGINT', stop); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(() => {
    console.error(JSON.stringify({ component: 'rondo_watchdog_host', status: 'unavailable' }));
    // A timed-out observation must not survive to send later. A retained journal
    // lock is intentionally preserved for operator recovery, never stolen.
    process.exit(1);
  });
}
