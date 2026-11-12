import { Pool } from 'pg';
import { createNeonOperationsHandler, developmentOperationsDsn } from '../src/neon-operations.js';
import { runConversationRetention } from '../src/conversation-retention.js';
declare const __RONDO_SOURCE_SHA__: string;
const source = typeof __RONDO_SOURCE_SHA__ === 'string' ? __RONDO_SOURCE_SHA__ : '';
export default { fetch: createNeonOperationsHandler('retention', process.env, source, async () => {
  const pool = new Pool({ connectionString: developmentOperationsDsn('retention', process.env), max: 1,
    connectionTimeoutMillis: 5000, statement_timeout: 10000, query_timeout: 12000 });
  pool.on('error', () => undefined);
  try { await runConversationRetention(pool, 'scheduler'); return { state: 'completed' }; }
  finally { await pool.end(); }
}) };
