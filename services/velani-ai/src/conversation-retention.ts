import type { Pool } from 'pg';
import type { CronTrigger } from './cron-handler.js';

/** Uses only the runtime role's existing DELETE permission on sessions. */
export async function runConversationRetention(pool: Pool, trigger: CronTrigger = 'operator'): Promise<{ sessions: number }> {
  const client = await pool.connect();
  try {
    // READ COMMITTED takes a new snapshot after waiting for another cleanup.
    await client.query('BEGIN');
    await client.query("SELECT pg_advisory_xact_lock(hashtext(current_database()), hashtext(current_schema() || ':velani-retention'))");
    const result = await client.query("DELETE FROM sessions WHERE expires_at <= now() OR created_at < now() - interval '30 days'");
    await client.query(`INSERT INTO retention_heartbeats (trigger_source, completed_at, sessions_deleted)
      VALUES ($1, clock_timestamp(), $2) ON CONFLICT (trigger_source)
      DO UPDATE SET completed_at = EXCLUDED.completed_at, sessions_deleted = EXCLUDED.sessions_deleted`, [trigger, result.rowCount ?? 0]);
    await client.query('COMMIT');
    return { sessions: result.rowCount ?? 0 };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally { client.release(); }
}
