import type { Pool } from 'pg';
import { createDatabasePool } from '../../src/db-pool.js';
import { runConversationRetention } from '../../src/conversation-retention.js';
import { createRetentionHandler } from '../../src/retention-handler.js';

let pool: Pool | undefined;
export default createRetentionHandler(process.env, async () => {
  if (!process.env.DATABASE_URL) throw new Error('Retention database is not configured.');
  if (!pool) {
    pool = createDatabasePool({ connectionString: process.env.DATABASE_URL, max: 1,
      connectionTimeoutMillis: 5_000, idleTimeoutMillis: 10_000, statement_timeout: 30_000 });
    pool.on('error', () => { /* Requests report a sanitized failure; never log credentials. */ });
  }
  const result = await runConversationRetention(pool);
  console.info(JSON.stringify({ event: 'conversation_retention', status: 'ok', sessions: result.sessions, completedAt: new Date().toISOString() }));
  return result;
});
