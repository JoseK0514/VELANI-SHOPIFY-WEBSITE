import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDatabasePool } from '../src/db-pool.js';
import { sampleRondoWatchdog, watchdogDsn } from '../src/rondo-watchdog.js';
import { rondoTarget } from '../src/rondo-target.js';
import { initializeWatchdog, observeWatchdog, type WatchdogPolicy } from '../src/watchdog-journal.js';
import { createRondoNotifier } from '../src/rondo-notifier.js';

export async function runWatchdog(command: string | undefined, environment: NodeJS.ProcessEnv = process.env) {
  if (!['check', 'initialize', 'observe'].includes(command ?? '')) throw Error('watchdog_configuration_invalid');
  const target = rondoTarget(environment.RONDO_WATCHDOG_ENVIRONMENT);
  let policy: WatchdogPolicy | undefined;
  if (command !== 'check') {
    if (!environment.RONDO_WATCHDOG_POLICY_FILE || !environment.RONDO_WATCHDOG_STATE_DIR) throw Error('watchdog_configuration_invalid');
    const raw = await readFile(environment.RONDO_WATCHDOG_POLICY_FILE, 'utf8');
    if (Buffer.byteLength(raw) > 8192) throw Error('watchdog_configuration_invalid');
    policy = JSON.parse(raw);
    if (policy!.scope !== target.scope || policy!.target !== target.database) throw Error('watchdog_configuration_invalid');
    if (command === 'initialize') {
      await initializeWatchdog(environment.RONDO_WATCHDOG_STATE_DIR, policy!);
      return { status: 'initialized', mailEnabled: policy!.mailEnabled, maxAttempts: policy!.maxAttempts };
    }
    if (!['true', 'false'].includes(environment.RONDO_ALERT_MAIL_ENABLED ?? '')
      || policy!.mailEnabled !== (environment.RONDO_ALERT_MAIL_ENABLED === 'true')
      || (policy!.mailEnabled && policy!.recipient !== environment.RONDO_ALERT_RECIPIENT?.trim().toLowerCase())) throw Error('watchdog_configuration_invalid');
  }
  const authorizationId = environment.RONDO_WATCHDOG_BUDGET_AUTHORIZATION_ID;
  if (!authorizationId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(authorizationId)) throw Error('watchdog_configuration_invalid');
  const connectionString = watchdogDsn(environment);
  const pool = createDatabasePool({ connectionString, max: 1, connectionTimeoutMillis: 3000, statement_timeout: 5000 }, environment);
  pool.on('error', () => undefined);
  const sample = () => sampleRondoWatchdog(pool, { database: target.database, role: target.watchdogRole, authorizationId, scope: target.scope });
  try {
    if (command === 'check') return await sample();
    return await observeWatchdog(environment.RONDO_WATCHDOG_STATE_DIR!, policy!, environment.RONDO_WATCHDOG_SOURCE_SHA ?? '',
      sample, createRondoNotifier(environment));
  } finally { await pool.end(); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await runWatchdog(process.argv[2]);
    console.log(JSON.stringify(result));
    if (!['ok', 'initialized'].includes(result.status)) process.exitCode = 1;
    if ('deliveryStatus' in result && result.deliveryStatus !== 'armed') process.exitCode = 1;
  } catch {
    console.error(JSON.stringify({ status: 'unavailable', alerts: ['watchdog_configuration_or_journal_unavailable'] }));
    process.exitCode = 1;
  }
}
