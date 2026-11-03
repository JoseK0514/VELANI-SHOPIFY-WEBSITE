import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { readConfig } from '../src/config.js';
import { buildApp } from '../src/app.js';
import { PostgresRepository } from '../src/repository.js';
import { PostgresExperienceRepository } from '../src/experience-repository.js';
import { ModelEngine } from '../src/engine.js';
import { PlanModelEngine } from '../src/plan-engine.js';
import { EMPTY_PROFILE, type PlanRecord } from '../src/experience-types.js';
import { administrationPool } from './migrate.js';

if (!process.argv.includes('--run')) throw new Error('Use --run against the isolated development database. This test makes paid model calls and removes its synthetic records.');
const config = readConfig();
if (config.nodeEnv === 'production') throw new Error('Use an isolated development environment.');
const repository = new PostgresRepository(config.databaseUrl);
const experienceRepository = new PostgresExperienceRepository(config.databaseUrl);
const settings = { apiKey: config.aiApiKey, baseURL: config.aiBaseUrl, model: config.aiModel, timeoutMs: 90000 };
const app = buildApp({ ...config, requireCaptcha: false }, repository, new ModelEngine(settings), {
  experience: { repository: experienceRepository, engine: new PlanModelEngine({ ...settings, model: config.planModel ?? config.aiModel }) },
});
const admin = administrationPool();
const sessions: string[] = [];
const leads: string[] = [];
const results: unknown[] = [];
try {
  for (const locale of ['en', 'es'] as const) {
    const origin = config.allowedOrigins[0];
    const start = await app.inject({ method: 'POST', url: '/v1/sessions', headers: { origin }, payload: { locale } });
    assert.equal(start.statusCode, 201);
    const token = start.json(); sessions.push(token.sessionId);
    const headers = { origin, authorization: `Bearer ${token.sessionToken}` };
    const profile = { ...EMPTY_PROFILE, businessType: locale === 'en' ? 'cafes' : 'tiendas', teamSize: '42', locations: '3', currentTools: 'spreadsheets', approvalCadence: 'Friday', constraints: 'No new software this month', challenge: 'Shift swaps and weekly time approval' };
    const saved = await app.inject({ method: 'PUT', url: '/v1/profile', headers, payload: { expectedRevision: 0, profile } });
    assert.equal(saved.statusCode, 200);
    const brief = locale === 'en' ? 'Create a practical two-week plan for our saved business details. We cannot adopt new software this month. Explain which future NEVORA capabilities would be relevant, without promising availability.'
      : 'Prepara un plan práctico de dos semanas para los datos guardados de nuestra empresa. No podemos adoptar software nuevo este mes. Explica qué capacidades documentadas de NEVORA serían relevantes sin prometer disponibilidad.';
    const input = { requestId: randomUUID(), brief, profileRevision: saved.json().revision, locale };
    const begun = performance.now();
    const generated = await app.inject({ method: 'POST', url: '/v1/plans', headers, payload: input });
    assert.equal(generated.statusCode, 201, `Plan ${locale} failed with ${generated.statusCode}: ${generated.body}`);
    const plan = generated.json<PlanRecord>();
    const replay = await app.inject({ method: 'POST', url: '/v1/plans', headers, payload: input });
    assert.equal(replay.json().id, plan.id);
    const actions = plan.plan.actions.map((item, index) => index === 0 ? { ...item, owner: locale === 'en' ? 'Operations manager' : 'Responsable de operaciones' } : item);
    const edited = await app.inject({ method: 'PATCH', url: `/v1/plans/${plan.id}`, headers, payload: { expectedRevision: plan.revision, actions, notes: 'Synthetic verification note' } });
    assert.equal(edited.statusCode, 200);
    const download = await app.inject({ method: 'GET', url: `/v1/plans/${plan.id}/download`, headers });
    assert.equal(download.statusCode, 200); assert.ok(download.body.includes('Synthetic verification note'));
    const corrected = await app.inject({ method: 'PUT', url: '/v1/profile', headers, payload: { expectedRevision: saved.json().revision, profile: { ...profile, locations: '4' } } });
    assert.equal(corrected.statusCode, 200);
    const answer = await app.inject({ method: 'POST', url: '/v1/chat', headers, payload: { requestId: randomUUID(), planId: plan.id, locale,
      message: locale === 'en' ? 'I corrected my saved business details after making this plan. How many locations do I now have, and what should I change in the plan?'
        : 'Corregí mis datos guardados después de crear el plan. ¿Cuántas ubicaciones tengo ahora y qué debería cambiar del plan?' } });
    assert.equal(answer.statusCode, 200);
    if (locale === 'en') {
      const leadInput = { requestId: randomUUID(), name: 'Synthetic experience test', email: 'experience-smoke@example.com', consent: true, consentVersion: 'lead-v1', planId: plan.id, planRevision: edited.json().revision };
      const lead = await app.inject({ method: 'POST', url: '/v1/leads', headers, payload: leadInput });
      assert.equal(lead.statusCode, 201); leads.push(lead.json().id);
      const stored = await admin.query('SELECT plan_snapshot FROM leads WHERE id = $1', [lead.json().id]);
      assert.equal(stored.rows[0].plan_snapshot.notes, 'Synthetic verification note');
    }
    results.push({ locale, latencyMs: Math.round(performance.now() - begun), plan: edited.json(), memoryAnswer: answer.json() });
    assert.equal((await app.inject({ method: 'DELETE', url: '/v1/session', headers })).statusCode, 204);
  }
  await mkdir('artifacts', { recursive: true });
  await writeFile('artifacts/experience-live-smoke.json', JSON.stringify({ status: 'passed', date: new Date().toISOString(), model: config.aiModel, planModel: config.planModel ?? config.aiModel, results }, null, 2), { mode: 0o600 });
  console.log('Live EN/ES plans, stored profile corrections, edits, downloads, sharing and deletion passed. Synthetic responses saved for semantic review.');
} catch (error) {
  console.error(error instanceof assert.AssertionError ? error.message : 'Experience live smoke failed. No credentials printed.'); process.exitCode = 1;
} finally {
  for (const id of leads) await admin.query("DELETE FROM leads WHERE id = $1 AND email = 'experience-smoke@example.com'", [id]);
  for (const id of sessions) await admin.query('DELETE FROM sessions WHERE id = $1', [id]);
  await app.close(); await Promise.all([repository.close(), experienceRepository.close(), admin.end()]);
}
