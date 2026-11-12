import { randomUUID } from 'node:crypto';
import { readdir } from 'node:fs/promises';
import { Pool } from 'pg';
import { expect, it } from 'vitest';
import { migrate } from '../scripts/migrate.js';

const testUrl = process.env.TEST_DATABASE_URL;

it.skipIf(!testUrl)('installs the shared vector extension once during concurrent fresh-schema migrations', async () => {
  const url = new URL(testUrl!);
  // This regression owns a new database, never an application/remote database.
  if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) throw Error('Migration regression requires an owned loopback TEST_DATABASE_URL.');
  const database = `velani_migration_${randomUUID().replaceAll('-', '')}`;
  const admin = new Pool({ connectionString: testUrl, max: 1 });
  const pools: Pool[] = [];
  let created = false;
  let setup: Pool | undefined;
  try {
    await admin.query(`CREATE DATABASE "${database}"`);
    created = true;
    url.pathname = '/' + database;
    url.searchParams.delete('options');
    setup = new Pool({ connectionString: url.toString(), max: 1 });
    // Widen the real extension-installation race without replacing PostgreSQL
    // or the migration runner. All objects live only in this owned database.
    await setup.query(`CREATE FUNCTION public.slow_extension() RETURNS event_trigger LANGUAGE plpgsql AS
      $$ BEGIN PERFORM pg_sleep(0.3); END $$;
      CREATE EVENT TRIGGER slow_extension ON ddl_command_start
      WHEN TAG IN ('CREATE EXTENSION') EXECUTE FUNCTION public.slow_extension();`);
    expect((await setup.query("SELECT count(*)::int AS n FROM pg_extension WHERE extname='vector'")).rows[0].n).toBe(0);
    for (const schema of ['first_install', 'second_install']) {
      await setup.query(`CREATE SCHEMA "${schema}"`);
      const scoped = new URL(url);
      scoped.searchParams.set('options', `-c search_path=${schema},public`);
      pools.push(new Pool({ connectionString: scoped.toString(), max: 1 }));
    }
    const results = await Promise.allSettled(pools.map(pool => migrate(pool)));
    expect(results.map(result => result.status)).toEqual(['fulfilled', 'fulfilled']);
    const files = (await readdir('migrations')).filter(file => /^\d+_[a-z0-9_-]+\.sql$/.test(file)).sort();
    for (const [index, pool] of pools.entries()) {
      expect(results[index]).toMatchObject({ status: 'fulfilled', value: files });
      expect((await pool.query('SELECT name FROM schema_migrations ORDER BY name')).rows.map(row => row.name)).toEqual(files);
      expect(await migrate(pool)).toEqual([]);
    }
    expect((await setup.query("SELECT count(*)::int AS n FROM pg_extension WHERE extname='vector'")).rows[0].n).toBe(1);
  } finally {
    await Promise.all(pools.map(pool => pool.end()));
    await setup?.end();
    try { if (created) await admin.query(`DROP DATABASE "${database}"`); }
    finally { await admin.end(); }
  }
}, 30_000);
