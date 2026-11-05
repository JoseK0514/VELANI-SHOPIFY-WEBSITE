import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Pool } from 'pg';
import { administrationPool } from './migrate.js';

export interface RetentionResult { apply: boolean; sessions: number; leads: number; rateLimits: number }

export async function runRetention(pool: Pool, options: { apply?: boolean; chatDays?: number; leadDays?: number } = {}): Promise<RetentionResult> {
  const chatDays = options.chatDays ?? 30;
  const leadDays = options.leadDays ?? 90;
  if (![chatDays, leadDays].every(days => Number.isInteger(days) && days >= 1 && days <= 3650)) {
    throw new Error('Retention days must be whole numbers from 1 to 3650.');
  }
  const apply = options.apply === true;
  const client = await pool.connect();
  try {
    // A new snapshot after the advisory lock sees a concurrent cron's commit.
    await client.query('BEGIN');
    await client.query("SELECT pg_advisory_xact_lock(hashtext(current_database()), hashtext(current_schema() || ':velani-retention'))");
    let result: RetentionResult;
    if (apply) {
      const leads = await client.query('DELETE FROM leads WHERE created_at < now() - make_interval(days => $1)', [leadDays]);
      const sessions = await client.query('DELETE FROM sessions WHERE expires_at <= now() OR created_at < now() - make_interval(days => $1)', [chatDays]);
      const rateLimits = await client.query("DELETE FROM rate_limits WHERE expires_at < now() - interval '1 day'");
      result = { apply, sessions: sessions.rowCount ?? 0, leads: leads.rowCount ?? 0, rateLimits: rateLimits.rowCount ?? 0 };
    } else {
      const counts = await client.query<{ sessions: string; leads: string; rate_limits: string }>(`SELECT
        (SELECT count(*) FROM sessions WHERE expires_at <= now() OR created_at < now() - make_interval(days => $1)) AS sessions,
        (SELECT count(*) FROM leads WHERE created_at < now() - make_interval(days => $2)) AS leads,
        (SELECT count(*) FROM rate_limits WHERE expires_at < now() - interval '1 day') AS rate_limits`, [chatDays, leadDays]);
      result = { apply, sessions: Number(counts.rows[0]!.sessions), leads: Number(counts.rows[0]!.leads), rateLimits: Number(counts.rows[0]!.rate_limits) };
    }
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally { client.release(); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== '--apply')) throw new Error('Supported option: --apply. Omit it for a dry run.');
  const pool = administrationPool();
  try {
    const result = await runRetention(pool, {
      apply: args.includes('--apply'),
      chatDays: Number(process.env.CHAT_RETENTION_DAYS ?? 30),
      leadDays: Number(process.env.LEAD_RETENTION_DAYS ?? 90),
    });
    console.log(JSON.stringify(result));
    if (!result.apply) console.log('Dry run only. Run with --apply to delete these records and cascaded conversation messages.');
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Retention command failed.');
    process.exitCode = 1;
  } finally { await pool.end(); }
}
