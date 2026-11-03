import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { createDatabasePool } from './db-pool.js';
import { SessionUnavailableError, StaleTurnError } from './repository.js';
import {
  EMPTY_PROFILE, type BusinessProfile, type ExperienceRepository, type PlanAction,
  type PlanClaim, type PlanRecord, type ProfileState, type WorkflowPlan,
} from './experience-types.js';

export class ProfileChangedError extends Error {
  constructor() {
    super('The business profile changed while the plan was being prepared.');
    this.name = 'ProfileChangedError';
  }
}

interface PlanRow {
  id: string;
  brief: string;
  generated_plan: WorkflowPlan;
  actions: PlanAction[];
  notes: string;
  revision: number;
  profile_revision: number;
  created_at: Date;
}

function record(row: PlanRow): PlanRecord {
  return {
    id: row.id,
    brief: row.brief,
    plan: { ...row.generated_plan, actions: row.actions },
    revision: row.revision,
    profileRevision: row.profile_revision,
    notes: row.notes,
    edited: row.revision > 1,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

/** Session-scoped visitor profiles and generated plans. No workforce data access. */
export class PostgresExperienceRepository implements ExperienceRepository {
  private readonly pool: Pool;

  constructor(connectionStringOrPool: string | Pool) {
    this.pool = typeof connectionStringOrPool === 'string'
      ? createDatabasePool({ connectionString: connectionStringOrPool, max: 10, connectionTimeoutMillis: 5_000,
        idleTimeoutMillis: 30_000, statement_timeout: 10_000 })
      : connectionStringOrPool;
    this.pool.on('error', () => { /* Requests surface sanitized errors through the API. */ });
  }

  private async transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await work(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw error;
    } finally { client.release(); }
  }

  private async lockSession(client: PoolClient, sessionId: string): Promise<void> {
    const result = await client.query('SELECT id FROM sessions WHERE id = $1 AND expires_at > clock_timestamp() FOR UPDATE', [sessionId]);
    if (!result.rowCount) throw new SessionUnavailableError();
  }

  async getProfile(sessionId: string): Promise<ProfileState> {
    const result = await this.pool.query<{ profile: BusinessProfile | null; revision: number | null }>(
      `SELECT p.profile, p.revision FROM sessions s LEFT JOIN session_profiles p ON p.session_id = s.id
       WHERE s.id = $1 AND s.expires_at > clock_timestamp()`, [sessionId]);
    if (!result.rowCount) throw new SessionUnavailableError();
    const row = result.rows[0]!;
    return { profile: row.profile ?? { ...EMPTY_PROFILE }, revision: row.revision ?? 0 };
  }

  async saveProfile(sessionId: string, expectedRevision: number, profile: BusinessProfile): Promise<ProfileState | 'conflict'> {
    if (!Number.isInteger(expectedRevision) || expectedRevision < 0) throw new Error('Invalid profile revision.');
    return this.transaction(async client => {
      await this.lockSession(client, sessionId);
      const prior = await client.query<{ revision: number }>('SELECT revision FROM session_profiles WHERE session_id = $1', [sessionId]);
      const revision = prior.rows[0]?.revision ?? 0;
      if (revision !== expectedRevision) return 'conflict';
      const saved = await client.query<ProfileState>(`INSERT INTO session_profiles (session_id, profile, revision)
        VALUES ($1, $2::jsonb, 1) ON CONFLICT (session_id) DO UPDATE SET profile = EXCLUDED.profile,
          revision = session_profiles.revision + 1, updated_at = clock_timestamp() RETURNING profile, revision`,
      [sessionId, JSON.stringify(profile)]);
      return saved.rows[0]!;
    });
  }

  async claimPlan(sessionId: string, requestId: string, requestHash: string): Promise<PlanClaim> {
    return this.transaction(async client => {
      await this.lockSession(client, sessionId);
      const prior = await client.query<{ request_hash: string; status: string; plan_id: string | null }>(
        'SELECT request_hash, status, plan_id FROM plan_requests WHERE session_id = $1 AND request_id = $2', [sessionId, requestId]);
      const existing = prior.rows[0];
      if (existing && existing.request_hash !== requestHash) return { state: 'conflict' };
      if (existing?.status === 'completed') {
        const stored = await client.query<PlanRow>('SELECT * FROM workflow_plans WHERE session_id = $1 AND id = $2', [sessionId, existing.plan_id]);
        if (!stored.rowCount) throw new Error('Completed plan is unavailable.');
        return { state: 'completed', record: record(stored.rows[0]!) };
      }
      await client.query(`UPDATE plan_requests SET status = 'failed', updated_at = clock_timestamp()
        WHERE session_id = $1 AND status = 'pending' AND lease_expires_at <= clock_timestamp()`, [sessionId]);
      const active = await client.query("SELECT 1 FROM plan_requests WHERE session_id = $1 AND status = 'pending'", [sessionId]);
      if (active.rowCount) return { state: 'busy' };
      const leaseToken = randomUUID();
      await client.query(`INSERT INTO plan_requests (session_id, request_id, request_hash, status, lease_token, lease_expires_at)
        VALUES ($1, $2, $3, 'pending', $4, clock_timestamp() + interval '120 seconds')
        ON CONFLICT (session_id, request_id) DO UPDATE SET status = 'pending', lease_token = EXCLUDED.lease_token,
          lease_expires_at = EXCLUDED.lease_expires_at, updated_at = clock_timestamp()`, [sessionId, requestId, requestHash, leaseToken]);
      return { state: 'new', leaseToken };
    });
  }

  async completePlan(sessionId: string, requestId: string, leaseToken: string, plan: WorkflowPlan, profileRevision: number, brief = ''): Promise<PlanRecord> {
    return this.transaction(async client => {
      await this.lockSession(client, sessionId);
      const profile = await client.query<{ revision: number }>('SELECT revision FROM session_profiles WHERE session_id = $1', [sessionId]);
      if ((profile.rows[0]?.revision ?? 0) !== profileRevision) throw new ProfileChangedError();
      const lease = await client.query(`SELECT 1 FROM plan_requests WHERE session_id = $1 AND request_id = $2
        AND lease_token = $3 AND status = 'pending' AND lease_expires_at > clock_timestamp()`, [sessionId, requestId, leaseToken]);
      if (!lease.rowCount) throw new StaleTurnError();
      const saved = await client.query<PlanRow>(`INSERT INTO workflow_plans (session_id, generated_plan, actions, profile_revision, brief)
        VALUES ($1, $2::jsonb, $3::jsonb, $4, $5) RETURNING *`, [sessionId, JSON.stringify(plan), JSON.stringify(plan.actions), profileRevision, brief]);
      const row = saved.rows[0]!;
      // The session lock fences concurrent claim, completion, profile edits and deletion.
      const updated = await client.query(`UPDATE plan_requests SET status = 'completed', plan_id = $4, updated_at = clock_timestamp()
        WHERE session_id = $1 AND request_id = $2 AND lease_token = $3 AND status = 'pending'
          AND lease_expires_at > clock_timestamp()`, [sessionId, requestId, leaseToken, row.id]);
      if (!updated.rowCount) throw new StaleTurnError();
      return record(row);
    });
  }

  async failPlan(sessionId: string, requestId: string, leaseToken: string): Promise<void> {
    await this.pool.query(`UPDATE plan_requests SET status = 'failed', updated_at = clock_timestamp()
      WHERE session_id = $1 AND request_id = $2 AND lease_token = $3 AND status = 'pending'`, [sessionId, requestId, leaseToken]);
  }

  async getPlan(sessionId: string, planId: string): Promise<PlanRecord | null> {
    const result = await this.pool.query<PlanRow>(`SELECT p.* FROM workflow_plans p JOIN sessions s ON s.id = p.session_id
      WHERE p.session_id = $1 AND p.id = $2 AND s.expires_at > clock_timestamp()`, [sessionId, planId]);
    return result.rows[0] ? record(result.rows[0]) : null;
  }

  async editPlan(sessionId: string, planId: string, expectedRevision: number, actions: PlanAction[], notes: string): Promise<PlanRecord | 'conflict' | null> {
    if (!Number.isInteger(expectedRevision) || expectedRevision < 1) throw new Error('Invalid plan revision.');
    return this.transaction(async client => {
      await this.lockSession(client, sessionId);
      const prior = await client.query<{ revision: number }>('SELECT revision FROM workflow_plans WHERE session_id = $1 AND id = $2', [sessionId, planId]);
      if (!prior.rowCount) return null;
      if (prior.rows[0]!.revision !== expectedRevision) return 'conflict';
      const updated = await client.query<PlanRow>(`UPDATE workflow_plans SET actions = $3::jsonb, notes = $4,
        revision = revision + 1, updated_at = clock_timestamp() WHERE session_id = $1 AND id = $2 RETURNING *`,
      [sessionId, planId, JSON.stringify(actions), notes]);
      return record(updated.rows[0]!);
    });
  }

  async close(): Promise<void> { await this.pool.end(); }
}
