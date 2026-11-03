import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { readConfig } from '../src/config.js';
import { buildApp } from '../src/app.js';
import { PostgresRepository } from '../src/repository.js';
import { ModelEngine } from '../src/engine.js';
import { administrationPool } from './migrate.js';

// Explicit opt-in: this calls the configured model and writes synthetic test records.
if (!process.argv.includes('--run')) throw new Error('Use --run against an isolated development database. This smoke test makes paid model calls and cleans up its synthetic records.');
const config = readConfig();
if (config.nodeEnv === 'production') throw new Error('Smoke test must not run in production.');
const repository = new PostgresRepository(config.databaseUrl);
const engine = new ModelEngine({ apiKey: config.aiApiKey, baseURL: config.aiBaseUrl, model: config.aiModel, timeoutMs: config.modelTimeoutMs });
const app = buildApp({ ...config, requireCaptcha: false }, repository, engine);
const admin = administrationPool();
const sessionIds: string[] = [];
const leadIds: string[] = [];
const report: Record<string, unknown> = { model: config.aiModel, startedAt: new Date().toISOString() };
try {
  const origin = config.allowedOrigins[0];
  const start = await app.inject({ method: 'POST', url: '/v1/sessions', headers: { origin }, payload: { locale: 'en' } });
  assert.equal(start.statusCode, 201); const data = start.json(); sessionIds.push(data.sessionId);
  const headers = { origin, authorization: `Bearer ${data.sessionToken}` };
  const firstPayload = { requestId: randomUUID(), message: 'I run two shops with 28 employees. Managers approve paper timesheets on Fridays. Can NEVORA reduce that work, and can it pay employees directly?' };
  const first = await app.inject({ method: 'POST', url: '/v1/chat', headers, payload: firstPayload });
  assert.equal(first.statusCode, 200, `First chat returned ${first.statusCode}`);
  assert.ok(first.json().sources.length > 0); report.firstAnswer = first.json();
  const replay = await app.inject({ method: 'POST', url: '/v1/chat', headers, payload: firstPayload });
  assert.deepEqual(replay.json(), first.json());
  const followup = await app.inject({ method: 'POST', url: '/v1/chat', headers, payload: { requestId: randomUUID(), message: 'Given the team size and approval day I mentioned, suggest three sensible evaluation steps. Do not ask me for those details again.' } });
  assert.equal(followup.statusCode, 200); report.followupAnswer = followup.json();
  const payload = { requestId: randomUUID(), name: 'Synthetic smoke test', email: 'assistant-smoke@example.com', company: 'AUTOMATED DEVELOPMENT TEST', consent: true, consentVersion: 'lead-v1' };
  const lead = await app.inject({ method: 'POST', url: '/v1/leads', headers, payload });
  assert.equal(lead.statusCode, 201); leadIds.push(lead.json().id);
  const leadReplay = await app.inject({ method: 'POST', url: '/v1/leads', headers, payload });
  assert.equal(leadReplay.statusCode, 200); assert.equal(leadReplay.json().id, lead.json().id);
  const stored = await admin.query('SELECT count(*)::integer AS n FROM messages WHERE session_id = $1', [data.sessionId]);
  assert.equal(stored.rows[0].n, 4);
  const deleted = await app.inject({ method: 'DELETE', url: '/v1/session', headers }); assert.equal(deleted.statusCode, 204);
  const noAccess = await app.inject({ method: 'POST', url: '/v1/chat', headers, payload: firstPayload }); assert.equal(noAccess.statusCode, 401);
  const leadAfter = await admin.query('SELECT session_id FROM leads WHERE id = $1', [lead.json().id]); assert.equal(leadAfter.rows[0].session_id, null);
  const role = await admin.query(`SELECT has_table_privilege('velani_ai_app', 'knowledge_documents', 'INSERT') AS knowledge_write,
    has_schema_privilege('velani_ai_app', 'public', 'CREATE') AS schema_create`);
  assert.equal(role.rows[0].knowledge_write, false); assert.equal(role.rows[0].schema_create, false);
  report.checks = ['real-model answer with sources', 'idempotent chat replay', 'stored multi-turn history', 'explicit synthetic lead', 'idempotent lead replay', 'chat deletion and token invalidation', 'lead retained separately', 'restricted runtime role'];
  report.status = 'passed';
  await mkdir('artifacts', { recursive: true });
  await writeFile('artifacts/live-smoke.json', JSON.stringify(report, null, 2) + '\n', { mode: 0o600 });
  console.log('Live development smoke test passed: model, Neon retrieval/history, lead capture/replay, deletion and runtime permissions.');
} catch {
  console.error('Live development smoke test failed. No credentials or response payloads printed.'); process.exitCode = 1;
} finally {
  for (const id of leadIds) await admin.query("DELETE FROM leads WHERE id = $1 AND email = 'assistant-smoke@example.com'", [id]);
  for (const id of sessionIds) await admin.query('DELETE FROM sessions WHERE id = $1', [id]);
  await app.close(); await repository.close(); await admin.end();
}
