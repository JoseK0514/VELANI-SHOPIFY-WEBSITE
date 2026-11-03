import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';
import { createDatabasePool } from '../src/db-pool.js';

export async function migrate(pool: Pool, directory = resolve(process.cwd(), 'migrations')): Promise<string[]> {
  const files = (await readdir(directory)).filter(file => /^\d+_[a-z0-9_-]+\.sql$/.test(file)).sort();
  if (!files.length) throw new Error('No SQL migrations found. Run this command from the project root.');
  const client = await pool.connect();
  const applied: string[] = [];
  try {
    await client.query('BEGIN');
    await client.query("SELECT pg_advisory_xact_lock(hashtext(current_database()), hashtext(current_schema() || ':velani-migrations'))");
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT clock_timestamp()
    )`);
    for (const file of files) {
      const sql = await readFile(resolve(directory, file), 'utf8');
      const checksum = createHash('sha256').update(sql).digest('hex');
      const previous = await client.query<{ checksum: string }>('SELECT checksum FROM schema_migrations WHERE name = $1', [file]);
      if (previous.rows[0]) {
        if (previous.rows[0].checksum !== checksum) throw new Error(`Migration checksum mismatch: ${file}. Add a new migration instead of editing applied SQL.`);
        continue;
      }
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)', [file, checksum]);
      applied.push(file);
    }
    await client.query('COMMIT');
    return applied;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally { client.release(); }
}

/** Administrative jobs use owner credentials, separate from the restricted application role. */
export function administrationPool(): Pool {
  const connectionString = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!connectionString) throw new Error('Set DATABASE_URL_UNPOOLED for database administration.');
  const parsed = new URL(connectionString);
  if (parsed.hostname.includes('-pooler.')) throw new Error('Use a direct DATABASE_URL_UNPOOLED for administration commands.');
  return createDatabasePool({ connectionString, max: 1, connectionTimeoutMillis: 10_000, statement_timeout: 60_000 });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const pool = administrationPool();
  try {
    const applied = await migrate(pool);
    console.log(applied.length ? `Applied migrations: ${applied.join(', ')}` : 'Database migrations are current.');
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Database migration failed.');
    process.exitCode = 1;
  } finally { await pool.end(); }
}
