import { randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { administrationPool } from './migrate.js';

// One-time provisioning. Never rotate an existing role implicitly.
const pool = administrationPool();
const client = await pool.connect();
try {
  await client.query('BEGIN');
  const exists = await client.query("SELECT 1 FROM pg_roles WHERE rolname = 'velani_ai_app'");
  if (exists.rowCount) throw new Error('velani_ai_app already exists. Reuse its saved secret; this command does not rotate credentials.');
  const password = randomBytes(36).toString('base64url');
  const create = await client.query<{ statement: string }>("SELECT format('CREATE ROLE velani_ai_app LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION', $1::text) AS statement", [password]);
  await client.query(create.rows[0].statement);
  const database = await client.query<{ statement: string }>("SELECT format('GRANT CONNECT ON DATABASE %I TO velani_ai_app', current_database()) AS statement");
  await client.query(database.rows[0].statement);
  await client.query('REVOKE CREATE ON SCHEMA public FROM PUBLIC');
  await client.query('GRANT USAGE ON SCHEMA public TO velani_ai_app');
  await client.query('GRANT SELECT, INSERT, UPDATE, DELETE ON sessions, chat_turns TO velani_ai_app');
  await client.query('GRANT SELECT, INSERT ON messages, leads TO velani_ai_app');
  await client.query('GRANT SELECT, INSERT, UPDATE ON rate_limits TO velani_ai_app');
  await client.query('GRANT SELECT ON knowledge_documents TO velani_ai_app');
  await client.query('GRANT SELECT, INSERT, UPDATE ON retention_heartbeats TO velani_ai_app');
  await client.query('GRANT USAGE, SELECT ON SEQUENCE messages_id_seq TO velani_ai_app');
  await client.query('GRANT SELECT, INSERT, UPDATE ON session_profiles, plan_requests TO velani_ai_app');
  await client.query('GRANT SELECT, INSERT ON workflow_plans TO velani_ai_app');
  await client.query('GRANT UPDATE (actions, notes, revision, updated_at) ON workflow_plans TO velani_ai_app');
  const runtimeUrl = new URL(process.env.DATABASE_URL!);
  runtimeUrl.username = 'velani_ai_app'; runtimeUrl.password = password;
  // Save before COMMIT; a filesystem failure rolls back creation so secrets are not lost.
  await writeFile('.env.runtime', `DATABASE_URL=${runtimeUrl.toString()}\n`, { mode: 0o600, flag: 'wx' });
  await client.query('COMMIT');
  console.log('Restricted application role created. Its connection string is in .env.runtime (mode 600). Keep this file secret.');
} catch (error) {
  await client.query('ROLLBACK').catch(() => undefined);
  console.error(error instanceof Error && error.message.startsWith('velani_ai_app already') ? error.message : 'Role provisioning failed. Check database access and whether .env.runtime already exists. No credentials were printed.');
  process.exitCode = 1;
} finally { client.release(); await pool.end(); }
