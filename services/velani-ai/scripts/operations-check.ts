import { createDatabasePool } from '../src/db-pool.js';
import { readOperationsStatus } from '../src/operations-status.js';

// No application/owner credential fallback. Supply an approved SELECT-only role.
const connectionString = process.env.RONDO_OPERATIONS_DATABASE_URL;
if (!connectionString) throw new Error('Set RONDO_OPERATIONS_DATABASE_URL to an approved read-only connection.');
const pool = createDatabasePool({ connectionString, max: 1, connectionTimeoutMillis: 5000, statement_timeout: 10000 });
pool.on('error', () => undefined);
try {
  const result = await readOperationsStatus(pool);
  console.log(JSON.stringify(result));
  if (result.status !== 'ok') process.exitCode = 1;
} catch {
  console.error(JSON.stringify({ status: 'unavailable', alerts: ['operations_check_failed'] }));
  process.exitCode = 1;
} finally { await pool.end(); }
