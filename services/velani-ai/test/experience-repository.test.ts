import { createHash, randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { migrate } from '../scripts/migrate.js';
import { PostgresRepository, SessionUnavailableError, StaleTurnError } from '../src/repository.js';
import { PostgresExperienceRepository, ProfileChangedError } from '../src/experience-repository.js';
import { EMPTY_PROFILE, type BusinessProfile, type WorkflowPlan } from '../src/experience-types.js';

const testUrl = process.env.TEST_DATABASE_URL; // Intentionally never use the application database.
const hash = (text: string) => createHash('sha256').update(text).digest('hex');
const profile: BusinessProfile = { ...EMPTY_PROFILE, businessType: 'Cafés', teamSize: '42', locations: '3', challenge: 'Friday approvals' };
const plan: WorkflowPlan = {
  title: 'A clearer Friday handoff', summary: 'Start with a single review process.', profile,
  workflow: [{ stage: 'approve', productFact: 'Managers review approved hours.', recommendation: 'Assign a primary reviewer.', sourceIds: ['overview-en'] }],
  actions: [{ title: 'Map the current process', owner: 'Manager', timing: 'This week', details: 'List every handoff.' }],
  assumptions: ['Three locations were supplied by the visitor.'], questions: ['What is the current approval cutoff?'],
  sources: [{ id: 'overview-en', title: 'Overview', url: 'https://www.thevelani.com/pages/nevora' }], model: 'test-model',
};

describe.skipIf(!testUrl)('Experience repository PostgreSQL integration', () => {
  let admin: Pool;
  let pool: Pool;
  let sessions: PostgresRepository;
  let repository: PostgresExperienceRepository;
  const schema = `velani_experience_test_${randomUUID().replaceAll('-', '')}`;

  beforeAll(async () => {
    admin = new Pool({ connectionString: testUrl, max: 1 });
    await admin.query(`CREATE SCHEMA "${schema}"`);
    const scopedUrl = new URL(testUrl!);
    scopedUrl.searchParams.set('options', `-c search_path=${schema},public`);
    pool = new Pool({ connectionString: scopedUrl.toString(), max: 12 });
    sessions = new PostgresRepository(pool);
    repository = new PostgresExperienceRepository(pool);
    await migrate(pool);
  }, 30_000);

  beforeEach(async () => { await pool.query('TRUNCATE sessions CASCADE'); });
  afterAll(async () => {
    await repository?.close();
    if (admin) {
      await admin.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      await admin.end();
    }
  }, 30_000);

  const session = () => sessions.createSession(hash(randomUUID()), 'en', new Date(Date.now() + 60_000));
  async function generated(sessionId: string, requestId = randomUUID(), profileRevision = 0) {
    const claim = await repository.claimPlan(sessionId, requestId, hash(requestId));
    if (claim.state !== 'new') throw new Error('Expected a new plan claim.');
    return repository.completePlan(sessionId, requestId, claim.leaseToken, plan, profileRevision);
  }

  it('returns a private empty profile then persists only the supplied session profile', async () => {
    const one = await session(); const two = await session();
    const initial = await repository.getProfile(one.id);
    expect(initial).toEqual({ profile: EMPTY_PROFILE, revision: 0 });
    initial.profile.teamSize = 'mutated locally';
    expect((await repository.getProfile(two.id)).profile.teamSize).toBe('');
    expect(await repository.saveProfile(one.id, 0, profile)).toEqual({ profile, revision: 1 });
    expect(await repository.getProfile(one.id)).toEqual({ profile, revision: 1 });
    expect(await repository.getProfile(two.id)).toEqual({ profile: EMPTY_PROFILE, revision: 0 });
  });

  it('accepts only one concurrent profile update at an expected revision', async () => {
    const one = await session();
    const saves = await Promise.all(Array.from({ length: 8 }, (_, index) =>
      repository.saveProfile(one.id, 0, { ...profile, teamSize: String(index) })));
    expect(saves.filter(saved => saved !== 'conflict')).toHaveLength(1);
    expect(saves.filter(saved => saved === 'conflict')).toHaveLength(7);
    expect(await repository.saveProfile(one.id, 1, { ...profile, teamSize: '43' })).toEqual({ profile: { ...profile, teamSize: '43' }, revision: 2 });
  });

  it('rejects unknown and expired sessions for profile access and mutations', async () => {
    const one = await session();
    await pool.query("UPDATE sessions SET expires_at = now() - interval '1 second' WHERE id = $1", [one.id]);
    for (const id of [one.id, randomUUID()]) {
      await expect(repository.getProfile(id)).rejects.toBeInstanceOf(SessionUnavailableError);
      await expect(repository.saveProfile(id, 0, profile)).rejects.toBeInstanceOf(SessionUnavailableError);
      await expect(repository.claimPlan(id, 'new', hash('new'))).rejects.toBeInstanceOf(SessionUnavailableError);
    }
  });

  it('serializes concurrent claims to one pending generation per session', async () => {
    const one = await session();
    const independent = new PostgresExperienceRepository(pool);
    const claims = await Promise.all(Array.from({ length: 12 }, (_, i) =>
      (i % 2 ? repository : independent).claimPlan(one.id, String(i), hash(String(i)))));
    expect(claims.filter(claim => claim.state === 'new')).toHaveLength(1);
    expect(claims.filter(claim => claim.state === 'busy')).toHaveLength(11);
    const another = await session();
    expect((await repository.claimPlan(another.id, 'independent', hash('independent'))).state).toBe('new');
  });

  it('rejects changed payload reuse and replays the latest edited plan without duplicates', async () => {
    const one = await session(); const requestId = randomUUID();
    const saved = await generated(one.id, requestId);
    expect(saved.revision).toBe(1); expect(saved.edited).toBe(false);
    expect(saved.plan).toEqual(plan);
    expect(await repository.claimPlan(one.id, requestId, hash('different'))).toEqual({ state: 'conflict' });
    const actions = [{ ...plan.actions[0], owner: 'Location leads' }];
    const edited = await repository.editPlan(one.id, saved.id, 1, actions, 'Use Friday at noon as a discussion point.');
    expect(edited).toMatchObject({ revision: 2, edited: true, plan: { actions } });
    expect(await repository.claimPlan(one.id, requestId, hash(requestId))).toEqual({ state: 'completed', record: edited });
    expect((await pool.query('SELECT count(*) FROM workflow_plans')).rows[0].count).toBe('1');
    // Suggested changes overlay the editable fields; the generated evidence is never rewritten.
    const generatedCore = (await pool.query('SELECT generated_plan FROM workflow_plans WHERE id = $1', [saved.id])).rows[0].generated_plan;
    expect(generatedCore).toEqual(plan);
  });

  it('fences expired leases, stale completion, and stale failure after reclamation', async () => {
    const one = await session(); const requestId = randomUUID(); const requestHash = hash('same');
    const first = await repository.claimPlan(one.id, requestId, requestHash);
    if (first.state !== 'new') throw new Error('Expected a claim.');
    await pool.query("UPDATE plan_requests SET lease_expires_at = now() - interval '1 second' WHERE session_id = $1", [one.id]);
    const current = await repository.claimPlan(one.id, requestId, requestHash);
    if (current.state !== 'new') throw new Error('Expected reclamation.');
    await expect(repository.completePlan(one.id, requestId, first.leaseToken, plan, 0)).rejects.toBeInstanceOf(StaleTurnError);
    await repository.failPlan(one.id, requestId, first.leaseToken);
    expect(await repository.claimPlan(one.id, 'other', hash('other'))).toEqual({ state: 'busy' });
    await repository.completePlan(one.id, requestId, current.leaseToken, plan, 0);
    expect((await pool.query('SELECT count(*) FROM workflow_plans')).rows[0].count).toBe('1');
  });

  it('discards generated output if a confirmed profile changed during generation', async () => {
    const one = await session(); const requestId = randomUUID();
    const claim = await repository.claimPlan(one.id, requestId, hash('request'));
    if (claim.state !== 'new') throw new Error('Expected a claim.');
    await repository.saveProfile(one.id, 0, profile);
    await expect(repository.completePlan(one.id, requestId, claim.leaseToken, plan, 0)).rejects.toBeInstanceOf(ProfileChangedError);
    expect((await pool.query('SELECT count(*) FROM workflow_plans')).rows[0].count).toBe('0');
    await repository.failPlan(one.id, requestId, claim.leaseToken);
    const retried = await repository.claimPlan(one.id, requestId, hash('request'));
    if (retried.state !== 'new') throw new Error('Expected retry.');
    expect((await repository.completePlan(one.id, requestId, retried.leaseToken, plan, 1)).profileRevision).toBe(1);
  });

  it('isolates plans and makes concurrent edits conflict instead of losing changes', async () => {
    const one = await session(); const two = await session(); const saved = await generated(one.id);
    expect(await repository.getPlan(two.id, saved.id)).toBeNull();
    expect(await repository.editPlan(two.id, saved.id, 1, [], 'not mine')).toBeNull();
    const edits = await Promise.all(Array.from({ length: 6 }, (_, i) => repository.editPlan(one.id, saved.id, 1, plan.actions, `Edit ${i}`)));
    expect(edits.filter(edited => edited !== 'conflict')).toHaveLength(1);
    expect(edits.filter(edited => edited === 'conflict')).toHaveLength(5);
    expect((await repository.getPlan(one.id, saved.id))?.revision).toBe(2);
  });

  it('cascades profiles, requests and plans when their conversation is deleted', async () => {
    const one = await session(); const two = await session();
    await repository.saveProfile(one.id, 0, profile);
    const first = await generated(one.id, randomUUID(), 1);
    const second = await generated(two.id);
    await sessions.deleteSession(one.id);
    for (const table of ['session_profiles', 'workflow_plans', 'plan_requests']) {
      expect((await pool.query(`SELECT count(*) FROM ${table} WHERE session_id = $1`, [one.id])).rows[0].count).toBe('0');
    }
    expect(await repository.getPlan(one.id, first.id)).toBeNull();
    expect(await repository.getPlan(two.id, second.id)).not.toBeNull();
  });

  it('does not return or edit a stored plan once the session expires', async () => {
    const one = await session(); const saved = await generated(one.id);
    await pool.query("UPDATE sessions SET expires_at = now() - interval '1 second' WHERE id = $1", [one.id]);
    expect(await repository.getPlan(one.id, saved.id)).toBeNull();
    await expect(repository.editPlan(one.id, saved.id, 1, plan.actions, 'expired')).rejects.toBeInstanceOf(SessionUnavailableError);
  });

  it('preserves the original visitor brief through plan edits and request replay', async () => {
    const one = await session(); const requestId = randomUUID();
    const brief = 'We have three cafés and Friday approvals. Do not assume we can deploy software this month.';
    const claim = await repository.claimPlan(one.id, requestId, hash(brief));
    if (claim.state !== 'new') throw new Error('Expected a claim.');
    const saved = await repository.completePlan(one.id, requestId, claim.leaseToken, plan, 0, brief);
    expect(saved.brief).toBe(brief);
    const edited = await repository.editPlan(one.id, saved.id, 1, [{ ...plan.actions[0], owner: 'Owner' }], 'Review this first.');
    expect(edited).toMatchObject({ brief, revision: 2 });
    expect((await repository.getPlan(one.id, saved.id))?.brief).toBe(brief);
    expect(await repository.claimPlan(one.id, requestId, hash(brief))).toEqual({ state: 'completed', record: edited });
  });
});
