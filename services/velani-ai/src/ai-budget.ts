import type { Pool } from 'pg';
import { z } from 'zod';
import type { ModelRequest } from './engine.js';

type BudgetCode = 'ai_budget_not_configured' | 'ai_budget_paused' | 'ai_budget_expired'
  | 'ai_budget_exhausted' | 'ai_budget_policy_mismatch' | 'ai_budget_unavailable';
export class AiBudgetError extends Error {
  constructor(readonly code: BudgetCode) { super(code); this.name = 'AiBudgetError'; }
}

const integer = z.number().int().positive().max(1_000_000_000_000);
const modelPrice = z.object({
  model: z.string().min(1).max(120).regex(/^[a-zA-Z0-9][a-zA-Z0-9._:/-]*$/),
  // Verified provider input-context ceiling, including internal message framing.
  contextTokens: z.number().int().min(1).max(10_000_000),
  outputTokenLimit: z.number().int().min(1).max(1_000_000),
  inputMicrousdPerMillion: integer, outputMicrousdPerMillion: integer,
}).strict();
function reservationMicrousd(price: z.infer<typeof modelPrice>, outputTokens: number, inputTokens = price.contextTokens): bigint {
  const numerator = BigInt(inputTokens) * BigInt(price.inputMicrousdPerMillion)
    + BigInt(outputTokens) * BigInt(price.outputMicrousdPerMillion);
  return (numerator + 999_999n) / 1_000_000n;
}
const modelRequestSchema = z.object({
  model: z.string().min(1).max(120),
  messages: z.array(z.object({ role: z.enum(['system', 'user']), content: z.string().min(1).max(512000) }).strict()).min(1).max(3),
  response_format: z.object({ type: z.literal('json_object') }).strict(),
  max_completion_tokens: z.number().int().min(1).max(1_000_000), stream: z.literal(false),
}).strict();
function providerBase(value: string): string {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || value.length > 500) throw new Error('Invalid provider');
  return url.href.replace(/\/$/, '');
}
export const budgetAuthorizationSchema = z.object({
  id: z.uuid(), providerBaseUrl: z.string().transform(providerBase), limitMicrousd: integer,
  validFrom: z.iso.datetime(), validUntil: z.iso.datetime(),
  approvedReference: z.string().trim().min(1).max(120),
  models: z.array(modelPrice).min(1).max(8),
}).strict().refine(value => {
  const duration = Date.parse(value.validUntil) - Date.parse(value.validFrom);
  return duration > 0 && duration <= 31 * 86_400_000 && new Set(value.models.map(model => model.model)).size === value.models.length;
}, 'Approval must have a finite window of at most31 days and unique exact models.');

interface BudgetRow {
  id: string; provider_base_url: string; model_prices: unknown;
  limit_microusd: string; reserved_microusd: string;
  valid_from: Date; valid_until: Date; enabled: boolean;
  started: boolean; unexpired: boolean; approved_reference: string;
}
const columns = `id, provider_base_url, model_prices, limit_microusd, reserved_microusd,
  valid_from, valid_until, enabled, approved_reference,
  valid_from <= clock_timestamp() AS started, valid_until > clock_timestamp() AS unexpired`;
function decodePolicy(row: BudgetRow) {
  try {
    return budgetAuthorizationSchema.parse({ id: row.id, providerBaseUrl: row.provider_base_url,
      limitMicrousd: Number(row.limit_microusd), validFrom: row.valid_from.toISOString(),
      validUntil: row.valid_until.toISOString(), approvedReference: row.approved_reference, models: row.model_prices });
  } catch { return undefined; }
}

/** Owner-only INSERT. A repeated ID cannot overwrite approval or refill usage. */
export async function installBudgetAuthorization(pool: Pool, input: unknown): Promise<void> {
  const value = budgetAuthorizationSchema.parse(input);
  await pool.query(`INSERT INTO ai_budget_authorizations
    (id, provider_base_url, model_prices, limit_microusd, valid_from, valid_until, approved_reference, enabled)
    VALUES ($1,$2,$3,$4,$5,$6,$7,true)`,
  [value.id, value.providerBaseUrl, JSON.stringify(value.models), value.limitMicrousd,
    value.validFrom, value.validUntil, value.approvedReference]);
}

/** Every attempt remains reserved, including timeouts, refusals and unknown commits.
 * This bounds this application's model charges only at the reviewed provider rates
 * and context ceiling; it is not an invoice/provider-account spending guarantee. */
export class PostgresAiBudget {
  private readonly provider: string;
  constructor(private readonly pool: Pool, private readonly authorizationId: string | undefined, baseUrl = 'https://api.openai.com/v1') {
    this.provider = providerBase(baseUrl);
  }

  async authorize(request: ModelRequest): Promise<void> {
    if (!this.authorizationId || !z.uuid().safeParse(this.authorizationId).success) throw new AiBudgetError('ai_budget_not_configured');
    // Only the reviewed text-only protocol has a pricing bound. New tools,
    // modalities, messages or request fields need a fresh adapter/pricing review.
    const parsedRequest = modelRequestSchema.safeParse(request);
    if (!parsedRequest.success) throw new AiBudgetError('ai_budget_policy_mismatch');
    let client;
    try {
      client = await this.pool.connect();
      await client.query('BEGIN');
      const result = await client.query<BudgetRow>(`SELECT ${columns} FROM ai_budget_authorizations WHERE id=$1 FOR UPDATE`, [this.authorizationId]);
      const row = result.rows[0];
      if (!row) throw new AiBudgetError('ai_budget_not_configured');
      if (!row.enabled) throw new AiBudgetError('ai_budget_paused');
      if (!row.started || !row.unexpired) throw new AiBudgetError('ai_budget_expired');
      const policy = decodePolicy(row);
      if (!policy) throw new AiBudgetError('ai_budget_unavailable');
      const price = policy.models.find(value => value.model === request.model);
      if (row.provider_base_url !== this.provider || !price || !Number.isSafeInteger(request.max_completion_tokens)
        || request.max_completion_tokens < 1 || request.max_completion_tokens > price.outputTokenLimit) throw new AiBudgetError('ai_budget_policy_mismatch');
      // A conservative byte-level text-token envelope plus4096 framing tokens
      // per message; cap at the provider's physical input ceiling. No average
      // characters-per-token guess, cached discount or unbounded tool loop.
      const inputEnvelope = Math.min(price.contextTokens, parsedRequest.data.messages.reduce(
        (tokens, message) => tokens + Buffer.byteLength(message.content, 'utf8') + 4096, 0));
      const reservation = reservationMicrousd(price, request.max_completion_tokens, inputEnvelope);
      if (BigInt(row.reserved_microusd) + reservation > BigInt(row.limit_microusd)) throw new AiBudgetError('ai_budget_exhausted');
      // SELECT target expressions can be evaluated before a row-lock wait. Check
      // the live authorization window again in the actual counter mutation.
      const updated = await client.query(`UPDATE ai_budget_authorizations
        SET reserved_microusd=reserved_microusd+$2
        WHERE id=$1 AND enabled AND valid_from<=clock_timestamp() AND valid_until>clock_timestamp()
          AND reserved_microusd <= limit_microusd-$2`, [this.authorizationId, reservation.toString()]);
      if (updated.rowCount !== 1) throw new AiBudgetError('ai_budget_expired');
      // No provider dispatch until COMMIT is acknowledged. A lost acknowledgement
      // can consume headroom, but must never authorize a second unaccounted call.
      await client.query('COMMIT');
    } catch (error) {
      await client?.query('ROLLBACK').catch(() => undefined);
      throw error instanceof AiBudgetError ? error : new AiBudgetError('ai_budget_unavailable');
    } finally { client?.release(); }
  }
}

/** Aggregate-only output; no prompts, sessions, addresses, approval text or keys. */
export async function readBudgetStatus(pool: Pool, authorizationId?: string) {
  if (!authorizationId || !z.uuid().safeParse(authorizationId).success) return { status: 'not_configured' as const };
  const result = await pool.query<BudgetRow>(`SELECT ${columns} FROM ai_budget_authorizations WHERE id=$1`, [authorizationId]);
  const row = result.rows[0];
  if (!row) return { status: 'not_configured' as const };
  const policy = decodePolicy(row);
  if (!policy) return { status: 'policy_mismatch' as const };
  const reserved = BigInt(row.reserved_microusd), limit = BigInt(row.limit_microusd);
  const largestAttempt = policy.models.reduce((largest, price) => {
    const amount = reservationMicrousd(price, price.outputTokenLimit);
    return amount > largest ? amount : largest;
  }, 0n);
  const status = !row.enabled ? 'paused' : !row.started || !row.unexpired ? 'expired'
    : reserved >= limit ? 'exhausted' : reserved * 100n >= limit * 80n || limit - reserved < largestAttempt ? 'near_limit' : 'ok';
  return { status, reservedMicrousd: reserved.toString(), limitMicrousd: limit.toString(), validUntil: row.valid_until.toISOString() };
}
