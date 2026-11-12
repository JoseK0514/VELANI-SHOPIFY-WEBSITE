import { Pool } from 'pg';
import { createNeonOperationsHandler, developmentOperationsDsn } from '../src/neon-operations.js';
import { readRondoOperationsStatus } from '../src/operations-status.js';
import { processRondoObservation } from '../src/rondo-monitor.js';
import { createRondoNotifier } from '../src/rondo-notifier.js';
declare const __RONDO_SOURCE_SHA__: string;
const source = typeof __RONDO_SOURCE_SHA__ === 'string' ? __RONDO_SOURCE_SHA__ : '';
export default { fetch: createNeonOperationsHandler('monitor', process.env, source, async () => {
  const pool = new Pool({ connectionString: developmentOperationsDsn('monitor', process.env), max: 2,
    connectionTimeoutMillis: 5000, statement_timeout: 10000, query_timeout: 12000 });
  pool.on('error', () => undefined);
  try {
    return await processRondoObservation(pool, {
      scope: 'development', sourceSha: source, mailEnabled: process.env.RONDO_ALERT_MAIL_ENABLED === 'true',
      maxNoticeAttempts: Number(process.env.RONDO_ALERT_MAX_TOTAL ?? 0),
    }, () => readRondoOperationsStatus(pool, process.env.AI_BUDGET_AUTHORIZATION_ID), createRondoNotifier(process.env));
  } finally { await pool.end(); }
}) };
