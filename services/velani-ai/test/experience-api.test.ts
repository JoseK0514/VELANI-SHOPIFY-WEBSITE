import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../src/app.js';
import { readConfig } from '../src/config.js';
import { PostgresRepository } from '../src/repository.js';
import { PostgresExperienceRepository } from '../src/experience-repository.js';
import { EMPTY_PROFILE, type BusinessProfile, type PlanEngine, type PlanRecord, type WorkflowPlan } from '../src/experience-types.js';
import type { AnswerEngine } from '../src/types.js';
import { migrate } from '../scripts/migrate.js';
import { ModelError } from '../src/engine.js';

const testUrl = process.env.TEST_DATABASE_URL; // Never use DATABASE_URL in integration tests.
const origin = 'https://www.thevelani.com';
const profile: BusinessProfile = {
  ...EMPTY_PROFILE, businessType: 'Cafés', teamSize: '42', locations: '3',
  currentTools: 'Spreadsheets', challenge: 'Friday approvals', constraints: 'No new software this month',
};
const config = readConfig({
  NODE_ENV: 'test', DATABASE_URL: 'postgresql://unused', AI_API_KEY: 'unused-test-key', AI_MODEL: 'test-model',
  SESSION_HASH_SECRET: 'test-secret-with-at-least-thirty-two-characters', ALLOWED_ORIGINS: origin,
});
function planFor(businessProfile: BusinessProfile): WorkflowPlan {
  return {
    title: 'Your Friday review plan', summary: 'Assign clear owners for a consistent review.', profile: businessProfile,
    workflow: [
      { stage: 'schedule', productFact: 'Managers plan shifts.', recommendation: 'Assign a planning owner.', sourceIds: ['overview-en'] },
      { stage: 'clock', productFact: 'A shared tablet records time.', recommendation: 'Review missing entries.', sourceIds: ['clock-en'] },
      { stage: 'approve', productFact: 'Managers approve hours.', recommendation: 'Agree a review cadence.', sourceIds: ['overview-en'] },
      { stage: 'payroll', productFact: 'Approved hours support payroll calculations.', recommendation: 'Confirm your payroll handoff.', sourceIds: ['payroll-en'] },
    ],
    actions: [
      { title: 'Map the process', owner: 'Manager', timing: 'Week one', details: 'List the existing handoffs.' },
      { title: 'Review exceptions', owner: 'Location leads', timing: 'Thursday', details: 'Gather corrections without changing actual hours.' },
      { title: 'Confirm handoff', owner: 'Manager', timing: 'Friday', details: 'Review the outstanding questions.' },
    ],
    assumptions: ['These are suggested process changes.'], questions: ['Who gives final approval?'],
    sources: [{ id: 'overview-en', title: 'Product overview', url: 'https://www.thevelani.com/pages/nevora' }],
    model: 'test-model',
  };
}

describe.skipIf(!testUrl)('Experience HTTP API with PostgreSQL', () => {
  const schema = `velani_experience_api_${randomUUID().replaceAll('-', '')}`;
  let admin: Pool;
  let pool: Pool;
  let repository: PostgresRepository;
  let experience: PostgresExperienceRepository;
  let app: ReturnType<typeof buildApp>;
  const answer = vi.fn<AnswerEngine['answer']>();
  const generate = vi.fn<PlanEngine['generate']>();

  beforeAll(async () => {
    admin = new Pool({ connectionString: testUrl, max: 1 });
    await admin.query(`CREATE SCHEMA "${schema}"`);
    const scoped = new URL(testUrl!);
    scoped.searchParams.set('options', `-c search_path=${schema},public`);
    pool = new Pool({ connectionString: scoped.toString(), max: 10 });
    repository = new PostgresRepository(pool);
    experience = new PostgresExperienceRepository(pool);
    await migrate(pool);
  }, 30_000);
  beforeEach(async () => {
    await pool.query('TRUNCATE sessions, leads, rate_limits CASCADE');
    answer.mockReset().mockResolvedValue({ message: 'Let us work with your existing approval process.', sources: [], action: 'none', confidence: 'grounded', model: 'test-model' });
    generate.mockReset().mockImplementation(async input => planFor(input.profile));
    app = buildApp(config, repository, { answer }, { experience: { repository: experience, engine: { generate } } });
  });
  afterEach(async () => { await app?.close(); });
  afterAll(async () => {
    await repository?.close();
    if (admin) {
      await admin.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      await admin.end();
    }
  }, 30_000);

  async function start() {
    const response = await app.inject({ method: 'POST', url: '/v1/sessions', headers: { origin }, payload: { locale: 'en' } });
    expect(response.statusCode).toBe(201);
    return { id: response.json().sessionId as string, headers: { origin, authorization: `Bearer ${response.json().sessionToken}` } };
  }
  async function saveProfile(headers: Record<string, string>, value = profile, expectedRevision = 0) {
    const response = await app.inject({ method: 'PUT', url: '/v1/profile', headers, payload: { expectedRevision, profile: value } });
    expect(response.statusCode).toBe(200);
    return response.json();
  }
  async function createPlan(headers: Record<string, string>, profileRevision = 0) {
    const request = { requestId: randomUUID(), brief: 'Help us improve Friday approvals.', profileRevision };
    const response = await app.inject({ method: 'POST', url: '/v1/plans', headers, payload: request });
    expect(response.statusCode).toBe(201);
    return { request, record: response.json<PlanRecord>() };
  }

  it('persists corrected business details and passes them to chat independently of history', async () => {
    const one = await start();
    expect((await app.inject({ method: 'GET', url: '/v1/profile', headers: one.headers })).json()).toEqual({ profile: EMPTY_PROFILE, revision: 0 });
    await saveProfile(one.headers);
    const corrected = { ...profile, teamSize: '44' };
    await saveProfile(one.headers, corrected, 1);
    const response = await app.inject({ method: 'POST', url: '/v1/chat', headers: one.headers, payload: { requestId: randomUUID(), message: 'Use my current team details.' } });
    expect(response.statusCode).toBe(200);
    expect(answer).toHaveBeenCalledWith(expect.objectContaining({ history: [], profile: corrected }));
    const other = await start();
    expect((await app.inject({ method: 'GET', url: '/v1/profile', headers: other.headers })).json().profile).toEqual(EMPTY_PROFILE);
  });

  it('generates and replays one plan without a second model invocation', async () => {
    const one = await start(); await saveProfile(one.headers);
    const { request, record } = await createPlan(one.headers, 1);
    expect(record.profileRevision).toBe(1);
    expect(record.plan.profile).toEqual(profile);
    const replay = await app.inject({ method: 'POST', url: '/v1/plans', headers: one.headers, payload: request });
    expect(replay.statusCode).toBe(200); expect(replay.json()).toEqual(record);
    expect(generate).toHaveBeenCalledTimes(1);
    expect((await pool.query('SELECT count(*) FROM workflow_plans')).rows[0].count).toBe('1');
    const conflict = await app.inject({ method: 'POST', url: '/v1/plans', headers: one.headers, payload: { ...request, brief: 'A different request.' } });
    expect(conflict.statusCode).toBe(409); expect(conflict.json().error.code).toBe('request_id_conflict');
    const chat = await app.inject({ method: 'POST', url: '/v1/chat', headers: one.headers, payload: { requestId: randomUUID(), message: 'Explain the last step.', planId: record.id } });
    expect(chat.statusCode).toBe(200); expect(answer).toHaveBeenLastCalledWith(expect.objectContaining({ plan: record }));
  });

  it('rejects stale profile revisions before generation and releases the failed claim', async () => {
    const one = await start(); await saveProfile(one.headers);
    const staleSave = await app.inject({ method: 'PUT', url: '/v1/profile', headers: one.headers, payload: { expectedRevision: 0, profile } });
    expect(staleSave.statusCode).toBe(409);
    const stalePlan = await app.inject({ method: 'POST', url: '/v1/plans', headers: one.headers, payload: { requestId: randomUUID(), brief: 'Prepare a plan.', profileRevision: 0 } });
    expect(stalePlan.statusCode).toBe(409); expect(stalePlan.json().error.code).toBe('profile_changed');
    expect(generate).not.toHaveBeenCalled();
    expect((await pool.query('SELECT status FROM plan_requests')).rows).toEqual([{ status: 'failed' }]);
    await createPlan(one.headers, 1);
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it('rejects a profile change during generation instead of saving a stale plan', async () => {
    const one = await start();
    generate.mockImplementationOnce(async input => {
      await experience.saveProfile(one.id, 0, profile);
      return planFor(input.profile);
    });
    const response = await app.inject({ method: 'POST', url: '/v1/plans', headers: one.headers, payload: { requestId: randomUUID(), brief: 'Prepare a plan.', profileRevision: 0 } });
    expect(response.statusCode).toBe(409); expect(response.json().error.code).toBe('profile_changed');
    expect((await pool.query('SELECT count(*) FROM workflow_plans')).rows[0].count).toBe('0');
    expect((await pool.query('SELECT status FROM plan_requests')).rows[0].status).toBe('failed');
  });

  it('sanitizes a model failure, releases its lease and permits same-ID retry', async () => {
    const one = await start(); const payload = { requestId: randomUUID(), brief: 'Prepare a plan.', profileRevision: 0 };
    generate.mockRejectedValueOnce(new ModelError('provider_unavailable'));
    const failed = await app.inject({ method: 'POST', url: '/v1/plans', headers: one.headers, payload });
    expect(failed.statusCode).toBe(503);
    expect(failed.json().error.code).toBe('provider_unavailable');
    expect((await pool.query('SELECT status FROM plan_requests')).rows[0].status).toBe('failed');
    const retried = await app.inject({ method: 'POST', url: '/v1/plans', headers: one.headers, payload });
    expect(retried.statusCode).toBe(201); expect(generate).toHaveBeenCalledTimes(2);
    expect((await pool.query('SELECT count(*) FROM workflow_plans')).rows[0].count).toBe('1');
  });

  it('prevents another session from viewing, editing, downloading, discussing or sharing a plan', async () => {
    const one = await start(); const other = await start(); const { record } = await createPlan(one.headers);
    const attempts = [
      { method: 'GET' as const, url: `/v1/plans/${record.id}` },
      { method: 'GET' as const, url: `/v1/plans/${record.id}/download` },
      { method: 'PATCH' as const, url: `/v1/plans/${record.id}`, payload: { expectedRevision: 1, actions: record.plan.actions, notes: 'Not mine' } },
      { method: 'POST' as const, url: '/v1/chat', payload: { requestId: randomUUID(), message: 'Read this plan.', planId: record.id } },
      { method: 'POST' as const, url: '/v1/leads', payload: { requestId: randomUUID(), name: 'Other visitor', email: 'other@example.com', consent: true, consentVersion: 'lead-v1', planId: record.id, planRevision: 1 } },
    ];
    for (const attempt of attempts) {
      const response = await app.inject({ ...attempt, headers: other.headers });
      expect(response.statusCode).toBe(404); expect(response.json().error.code).toBe('plan_not_found');
    }
    expect(answer).not.toHaveBeenCalled();
    expect((await pool.query('SELECT count(*) FROM leads')).rows[0].count).toBe('0');
  });

  it('edits only actions and notes, preserves generated claims, and downloads the current escaped plan', async () => {
    const one = await start(); const { record } = await createPlan(one.headers);
    const actions = record.plan.actions.map((action, index) => index ? action : { ...action, owner: 'Two location leads' });
    const notes = '**Friday** [review]';
    const edited = await app.inject({ method: 'PATCH', url: `/v1/plans/${record.id}`, headers: one.headers, payload: { expectedRevision: 1, actions, notes } });
    expect(edited.statusCode).toBe(200); expect(edited.json().revision).toBe(2); expect(edited.json().edited).toBe(true);
    expect(edited.json().plan.workflow).toEqual(record.plan.workflow);
    const stale = await app.inject({ method: 'PATCH', url: `/v1/plans/${record.id}`, headers: one.headers, payload: { expectedRevision: 1, actions, notes: 'stale' } });
    expect(stale.statusCode).toBe(409); expect(stale.json().error.code).toBe('plan_changed');
    const forbidden = await app.inject({ method: 'PATCH', url: `/v1/plans/${record.id}`, headers: one.headers, payload: { expectedRevision: 2, actions, notes, summary: 'Invented product claims' } });
    expect(forbidden.statusCode).toBe(400);
    const stored = (await pool.query('SELECT generated_plan FROM workflow_plans WHERE id = $1', [record.id])).rows[0].generated_plan;
    expect(stored).toEqual(record.plan);
    const downloaded = await app.inject({ method: 'GET', url: `/v1/plans/${record.id}/download`, headers: one.headers });
    expect(downloaded.statusCode).toBe(200);
    expect(downloaded.headers['content-type']).toContain('text/markdown');
    expect(downloaded.headers['content-disposition']).toContain('attachment;');
    expect(downloaded.body).toContain('Two location leads');
    expect(downloaded.body).toContain('\\*\\*Friday\\*\\* \\[review\\]');
    expect(downloaded.body).toContain('Plan revision 2');
    expect(downloaded.body).toContain('https://www.thevelani.com/pages/nevora');
  });

  it('requires explicit consent and preserves the exact shared plan across edits, retries and chat deletion', async () => {
    const one = await start(); const { record } = await createPlan(one.headers);
    const payload = { requestId: randomUUID(), name: 'Test visitor', email: 'visitor@example.com', consent: true, consentVersion: 'lead-v1', planId: record.id, planRevision: 1 };
    const refused = await app.inject({ method: 'POST', url: '/v1/leads', headers: one.headers, payload: { ...payload, consent: false } });
    expect(refused.statusCode).toBe(400);
    expect((await pool.query('SELECT count(*) FROM leads')).rows[0].count).toBe('0');
    const shared = await app.inject({ method: 'POST', url: '/v1/leads', headers: one.headers, payload });
    expect(shared.statusCode).toBe(201); const leadId = shared.json().id;
    const initial = (await pool.query('SELECT plan_snapshot FROM leads WHERE id = $1', [leadId])).rows[0].plan_snapshot;
    expect(initial).toEqual(record);
    await app.inject({ method: 'PATCH', url: `/v1/plans/${record.id}`, headers: one.headers, payload: { expectedRevision: 1, actions: record.plan.actions, notes: 'Only in revision two.' } });
    const replay = await app.inject({ method: 'POST', url: '/v1/leads', headers: one.headers, payload });
    expect(replay.statusCode).toBe(200); expect(replay.json().id).toBe(leadId);
    const staleShare = await app.inject({ method: 'POST', url: '/v1/leads', headers: one.headers, payload: { ...payload, requestId: randomUUID() } });
    expect(staleShare.statusCode).toBe(409); expect(staleShare.json().error.code).toBe('plan_changed');
    expect((await pool.query('SELECT count(*) FROM leads')).rows[0].count).toBe('1');
    const deleted = await app.inject({ method: 'DELETE', url: '/v1/session', headers: one.headers });
    expect(deleted.statusCode).toBe(204);
    for (const table of ['workflow_plans', 'session_profiles', 'plan_requests']) {
      expect((await pool.query(`SELECT count(*) FROM ${table} WHERE session_id = $1`, [one.id])).rows[0].count).toBe('0');
    }
    const retained = (await pool.query('SELECT session_id, plan_snapshot FROM leads WHERE id = $1', [leadId])).rows[0];
    expect(retained.session_id).toBeNull(); expect(retained.plan_snapshot).toEqual(record);
  });
});
