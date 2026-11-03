import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { createDatabasePool } from './db-pool.js';
import type { Answer, KnowledgeDocument, LeadInput, Locale, Message, Repository, Session, TurnClaim } from './types.js';

const LEASE_SECONDS = 120;

export class SessionUnavailableError extends Error {
  constructor() { super('Session is unavailable or expired.'); this.name = 'SessionUnavailableError'; }
}
export class StaleTurnError extends Error {
  constructor() { super('The response lease is no longer active.'); this.name = 'StaleTurnError'; }
}

/** All database access is scoped to this public marketing assistant's database. */
export class PostgresRepository implements Repository {
  private readonly pool: Pool;

  constructor(connectionStringOrPool: string | Pool) {
    this.pool = typeof connectionStringOrPool === 'string'
      ? createDatabasePool({ connectionString: connectionStringOrPool, max: 10, connectionTimeoutMillis: 5_000,
        idleTimeoutMillis: 30_000, statement_timeout: 10_000 })
      : connectionStringOrPool;
    // Idle socket errors are emitted outside requests; avoid an unhandled EventEmitter error.
    this.pool.on('error', () => { /* Subsequent operations surface a sanitized service error to the API. */ });
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

  async ping(): Promise<void> { await this.pool.query('SELECT 1'); }

  async createSession(tokenHash: string, locale: Locale, expiresAt: Date): Promise<Session> {
    const result = await this.pool.query<Session>(
      'INSERT INTO sessions (token_hash, locale, expires_at) VALUES ($1, $2, $3) RETURNING id, locale, expires_at AS "expiresAt"',
      [tokenHash, locale, expiresAt]);
    return result.rows[0]!;
  }

  async findSession(tokenHash: string): Promise<Session | null> {
    const result = await this.pool.query<Session>(
      'SELECT id, locale, expires_at AS "expiresAt" FROM sessions WHERE token_hash = $1 AND expires_at > clock_timestamp()', [tokenHash]);
    return result.rows[0] ?? null;
  }

  async history(sessionId: string, limit: number): Promise<Message[]> {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error('Invalid history limit.');
    const result = await this.pool.query<Message>(`SELECT role, content FROM (
      SELECT m.id, m.role, m.content FROM messages m JOIN sessions s ON s.id = m.session_id
      WHERE m.session_id = $1 AND s.expires_at > clock_timestamp() ORDER BY m.id DESC LIMIT $2
    ) recent ORDER BY id`, [sessionId, limit]);
    return result.rows;
  }

  async knowledge(query: string, locale: Locale): Promise<KnowledgeDocument[]> {
    // Core product constraints always travel with retrieval, including for vague follow-up questions.
    // Vector storage/index are ready for a future evaluated hybrid retriever; no paid embeddings are needed now.
    const result = await this.pool.query<KnowledgeDocument>(`WITH eligible AS (
      SELECT *, ts_rank_cd(search_vector, plainto_tsquery('simple', $1)) AS rank
      FROM knowledge_documents WHERE status = 'published' AND reviewed_at <= clock_timestamp()
        AND valid_until > clock_timestamp()
    ), core AS (
      SELECT * FROM eligible WHERE is_core ORDER BY (locale = $2) DESC, id LIMIT 12
    ), related AS (
      SELECT * FROM eligible WHERE NOT is_core ORDER BY (rank > 0) DESC, (locale = $2) DESC, rank DESC, id LIMIT 12
    ) SELECT id, title, url, content, locale, reviewed_at AS "reviewedAt", valid_until AS "validUntil", is_core AS "isCore"
      FROM (SELECT * FROM core UNION ALL SELECT * FROM related) selected
      ORDER BY is_core DESC, (locale = $2) DESC, rank DESC, id`, [query.slice(0, 8_000), locale]);
    // The engine's public knowledge contract uses UTC calendar dates. Precise
    // timestamp publication/expiry is already enforced by the SQL filter above.
    return result.rows.map(doc => ({ ...doc, reviewedAt: new Date(doc.reviewedAt).toISOString().slice(0, 10), validUntil: new Date(doc.validUntil).toISOString().slice(0, 10) }));
  }

  async claimTurn(sessionId: string, requestId: string, requestHash: string): Promise<TurnClaim> {
    return this.transaction(async client => {
      await this.lockSession(client, sessionId);
      const prior = await client.query<{ request_hash: string; status: string; answer: Answer | null }>(
        'SELECT request_hash, status, answer FROM chat_turns WHERE session_id = $1 AND request_id = $2', [sessionId, requestId]);
      const existing = prior.rows[0];
      if (existing && existing.request_hash !== requestHash) return { state: 'conflict' };
      if (existing?.status === 'completed') return { state: 'completed', answer: existing.answer! };
      await client.query(`UPDATE chat_turns SET status = 'failed', updated_at = clock_timestamp()
        WHERE session_id = $1 AND status = 'pending' AND lease_expires_at <= clock_timestamp()`, [sessionId]);
      const active = await client.query("SELECT 1 FROM chat_turns WHERE session_id = $1 AND status = 'pending'", [sessionId]);
      if (active.rowCount) return { state: 'busy' };
      const leaseToken = randomUUID();
      await client.query(`INSERT INTO chat_turns (session_id, request_id, request_hash, status, lease_token, lease_expires_at)
        VALUES ($1, $2, $3, 'pending', $4, clock_timestamp() + make_interval(secs => $5))
        ON CONFLICT (session_id, request_id) DO UPDATE SET status = 'pending', lease_token = EXCLUDED.lease_token,
          lease_expires_at = EXCLUDED.lease_expires_at, updated_at = clock_timestamp()`,
      [sessionId, requestId, requestHash, leaseToken, LEASE_SECONDS]);
      return { state: 'new', leaseToken };
    });
  }

  async completeTurn(sessionId: string, requestId: string, userMessage: string, answer: Answer, leaseToken: string): Promise<void> {
    await this.transaction(async client => {
      await this.lockSession(client, sessionId);
      const completed = await client.query(`UPDATE chat_turns SET status = 'completed', answer = $4::jsonb, updated_at = clock_timestamp()
        WHERE session_id = $1 AND request_id = $2 AND lease_token = $3 AND status = 'pending'
          AND lease_expires_at > clock_timestamp() RETURNING request_id`, [sessionId, requestId, leaseToken, JSON.stringify(answer)]);
      if (!completed.rowCount) throw new StaleTurnError();
      await client.query(`INSERT INTO messages (session_id, request_id, role, content)
        VALUES ($1, $2, 'user', $3), ($1, $2, 'assistant', $4)`, [sessionId, requestId, userMessage, answer.message]);
      await client.query('UPDATE sessions SET updated_at = clock_timestamp() WHERE id = $1', [sessionId]);
    });
  }

  async failTurn(sessionId: string, requestId: string, leaseToken: string): Promise<void> {
    await this.pool.query(`UPDATE chat_turns SET status = 'failed', updated_at = clock_timestamp()
      WHERE session_id = $1 AND request_id = $2 AND lease_token = $3 AND status = 'pending'`, [sessionId, requestId, leaseToken]);
  }

  async consumeRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    if (!Number.isInteger(limit) || limit < 1 || limit > 1_000_000 || !Number.isInteger(windowSeconds) || windowSeconds < 1 || windowSeconds > 86_400) {
      throw new Error('Invalid rate limit policy.');
    }
    const result = await this.pool.query<{ hits: number }>(`INSERT INTO rate_limits (key, hits, window_started_at, expires_at)
      VALUES ($1, 1, clock_timestamp(), clock_timestamp() + make_interval(secs => $3))
      ON CONFLICT (key) DO UPDATE SET
        hits = CASE WHEN rate_limits.expires_at <= clock_timestamp() THEN 1 ELSE LEAST(rate_limits.hits + 1, $2 + 1) END,
        window_started_at = CASE WHEN rate_limits.expires_at <= clock_timestamp() THEN clock_timestamp() ELSE rate_limits.window_started_at END,
        expires_at = CASE WHEN rate_limits.expires_at <= clock_timestamp() THEN clock_timestamp() + make_interval(secs => $3) ELSE rate_limits.expires_at END
      RETURNING hits`, [key, limit, windowSeconds]);
    return result.rows[0]!.hits <= limit;
  }

  async saveLead(sessionId: string, requestId: string, requestHash: string, input: LeadInput): Promise<{ id: string; duplicate: boolean } | 'conflict'> {
    if (input.consent !== true || input.consentVersion !== 'lead-v1') throw new Error('Explicit lead consent is required.');
    return this.transaction(async client => {
      await this.lockSession(client, sessionId);
      const inserted = await client.query<{ id: string }>(`INSERT INTO leads
        (session_id, origin_session_id, request_id, request_hash, name, email, company, team_size, locations, message, consent, consent_version, plan_snapshot)
        VALUES ($1, $1, $2, $3, $4, $5, $6, $7, $8, $9, true, $10, $11::jsonb)
        ON CONFLICT (origin_session_id, request_id) DO NOTHING RETURNING id`,
      [sessionId, requestId, requestHash, input.name, input.email, input.company ?? null, input.teamSize ?? null,
        input.locations ?? null, input.message ?? null, input.consentVersion, input.planSnapshot ? JSON.stringify(input.planSnapshot) : null]);
      if (inserted.rows[0]) return { id: inserted.rows[0].id, duplicate: false };
      const prior = await client.query<{ id: string; request_hash: string }>(
        'SELECT id, request_hash FROM leads WHERE origin_session_id = $1 AND request_id = $2', [sessionId, requestId]);
      const existing = prior.rows[0]!;
      return existing.request_hash === requestHash ? { id: existing.id, duplicate: true } : 'conflict';
    });
  }

  async findLeadRequest(sessionId: string, requestId: string, requestHash: string): Promise<{ id: string; duplicate: true } | 'conflict' | null> {
    const result = await this.pool.query<{ id: string; request_hash: string }>(
      'SELECT id, request_hash FROM leads WHERE origin_session_id = $1 AND request_id = $2', [sessionId, requestId]);
    const row = result.rows[0];
    return row ? row.request_hash === requestHash ? { id: row.id, duplicate: true } : 'conflict' : null;
  }

  async deleteSession(sessionId: string): Promise<void> { await this.pool.query('DELETE FROM sessions WHERE id = $1', [sessionId]); }
  async close(): Promise<void> { await this.pool.end(); }
}
