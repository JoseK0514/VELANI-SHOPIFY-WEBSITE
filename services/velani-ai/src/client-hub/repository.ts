import { randomUUID } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';
import type { Acceptance, ClientRequest, DeliveryClaim, DeliveryFailure, HubRepository, Receipt } from './types.js';
import { requestEmail } from './email.js';

const receiptColumns = 'id, reference, request_hash AS "requestHash"';
export class PostgresHubRepository implements HubRepository {
  constructor(private readonly pool: Pool) { pool.on('error', () => { /* Requests report sanitized errors. */ }); }
  private async transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try { await client.query('BEGIN'); const result = await work(client); await client.query('COMMIT'); return result; }
    catch (error) { await client.query('ROLLBACK').catch(() => undefined); throw error; }
    finally { client.release(); }
  }
  private async limit(client: Pick<Pool, 'query'> | PoolClient, key: string, maximum: number, seconds: number): Promise<boolean> {
    const result = await client.query<{ hits: number }>(`INSERT INTO client_hub_limits(key,hits,expires_at)
      VALUES ($1,1,clock_timestamp()+make_interval(secs=>$3)) ON CONFLICT(key) DO UPDATE SET
      hits=CASE WHEN client_hub_limits.expires_at<=clock_timestamp() THEN 1 ELSE LEAST(client_hub_limits.hits+1,$2+1) END,
      expires_at=CASE WHEN client_hub_limits.expires_at<=clock_timestamp() THEN clock_timestamp()+make_interval(secs=>$3) ELSE client_hub_limits.expires_at END
      RETURNING hits`, [key,maximum,seconds]);
    return result.rows[0]!.hits <= maximum;
  }
  async consumeLimit(key: string, maximum: number, seconds: number): Promise<boolean> { return this.limit(this.pool,key,maximum,seconds); }
  async find(keyHash: string): Promise<Receipt | null> {
    const result = await this.pool.query<Receipt>(`SELECT ${receiptColumns} FROM client_hub_requests WHERE key_hash=$1 AND expires_at>clock_timestamp()`, [keyHash]);
    return result.rows[0] ?? null;
  }
  async accept(input: ClientRequest, keyHash: string, requestHash: string, emailQuotaKey: string): Promise<Acceptance> {
    return this.transaction(async client => {
      await client.query("SELECT pg_advisory_xact_lock(hashtext(current_database()),hashtext('velani-client-hub:' || $1))", [keyHash]);
      const prior = await client.query<Receipt>(`SELECT ${receiptColumns} FROM client_hub_requests WHERE key_hash=$1`, [keyHash]);
      if (prior.rows[0]) return prior.rows[0].requestHash === requestHash ? { kind: 'replay', receipt: prior.rows[0] } : { kind: 'conflict' };
      await client.query("SELECT pg_advisory_xact_lock(hashtext(current_database()),hashtext(current_schema() || ':velani-client-hub-admission'))");
      const quota=await client.query<{total:string;email:string}>(`SELECT count(*) AS total,count(*) FILTER(WHERE email_quota_hash=$1) AS email
        FROM client_hub_requests WHERE created_at>clock_timestamp()-interval '24 hours'`,[emailQuotaKey]);
      // Two emails per request; reserve headroom within the existing 100/day plan.
      if(Number(quota.rows[0]!.total)>=40 || Number(quota.rows[0]!.email)>=5)return {kind:'limited'};
      const counter = await client.query<{ period: string; value: number }>(`INSERT INTO client_hub_counters(period,value)
        VALUES (to_char(now() AT TIME ZONE 'America/Puerto_Rico','YYMM'),1)
        ON CONFLICT(period) DO UPDATE SET value=client_hub_counters.value+1 RETURNING period,value`);
      const { period,value } = counter.rows[0]!;
      const reference = `VEL-${period}-${String(value).padStart(4,'0')}`;
      const result = await client.query<Receipt>(`INSERT INTO client_hub_requests(reference,key_hash,request_hash,fields,email_quota_hash)
        VALUES($1,$2,$3,$4::jsonb,$5) RETURNING ${receiptColumns}`, [reference,keyHash,requestHash,JSON.stringify(input),emailQuotaKey]);
      const receipt = result.rows[0]!;
      for (const kind of ['support','confirmation'] as const) {
        await client.query('INSERT INTO client_hub_outbox(request_id,kind,payload) VALUES($1,$2,$3::jsonb)', [receipt.id,kind,JSON.stringify(requestEmail(input,reference,kind))]);
      }
      return { kind: 'created',receipt };
    });
  }
  async confirmationState(requestId: string): Promise<'submitted' | 'pending'> {
    const result = await this.pool.query<{ status: string }>("SELECT status FROM client_hub_outbox WHERE request_id=$1 AND kind='confirmation'", [requestId]);
    return result.rows[0]?.status === 'submitted' ? 'submitted' : 'pending';
  }
  async claimDelivery(requestId?: string): Promise<DeliveryClaim | null> {
    return this.transaction(async client => {
      // A lost acknowledgement can mean the provider accepted the message. Its
      // idempotency guarantee lasts 24 hours; stop safely before that boundary.
      await client.query(`UPDATE client_hub_outbox SET status='uncertain',failure_code='idempotency_window_expired'
        WHERE first_attempt_at<=clock_timestamp()-interval '23 hours'
          AND ((status='pending' AND submission_uncertain) OR (status='processing' AND lease_expires_at<=clock_timestamp()))`);
      const selected = await client.query<{ id: string; request_id: string; reference: string; kind: 'support' | 'confirmation'; payload: DeliveryClaim['email'] }>(`SELECT o.id,o.request_id,r.reference,o.kind,o.payload
        FROM client_hub_outbox o JOIN client_hub_requests r ON r.id=o.request_id
        WHERE ($1::uuid IS NULL OR o.request_id=$1) AND r.expires_at>clock_timestamp()
          AND ((o.status='pending' AND o.next_attempt_at<=clock_timestamp()) OR (o.status='processing' AND o.lease_expires_at<=clock_timestamp()))
          AND o.attempts<32 ORDER BY o.created_at,o.kind DESC,o.id FOR UPDATE OF o SKIP LOCKED LIMIT 1`, [requestId ?? null]);
      const row = selected.rows[0]; if (!row) return null;
      const leaseToken = randomUUID();
      await client.query(`UPDATE client_hub_outbox SET attempts=attempts+1,
        first_attempt_at=CASE WHEN status='pending' AND NOT submission_uncertain THEN clock_timestamp() ELSE COALESCE(first_attempt_at,clock_timestamp()) END,
        submission_uncertain=submission_uncertain OR status='processing',status='processing',
        lease_token=$2,lease_expires_at=clock_timestamp()+interval '2 minutes' WHERE id=$1`, [row.id,leaseToken]);
      return { id: row.id,requestId: row.request_id,reference: row.reference,kind: row.kind,leaseToken,email: row.payload };
    });
  }
  async completeDelivery(id: string, leaseToken: string, providerId: string): Promise<void> {
    const result = await this.pool.query(`UPDATE client_hub_outbox SET status='submitted',provider_id=$3,lease_expires_at=NULL,failure_code=NULL
      WHERE id=$1 AND lease_token=$2 AND status='processing' AND lease_expires_at>clock_timestamp()`, [id,leaseToken,providerId]);
    if (!result.rowCount) throw new Error('Email delivery lease expired.');
  }
  async failDelivery(id: string, leaseToken: string, failure: DeliveryFailure): Promise<void> {
    await this.pool.query(`UPDATE client_hub_outbox SET status=CASE WHEN $3 AND attempts<32 THEN 'pending' ELSE 'blocked' END,
      submission_uncertain=submission_uncertain OR $5,
      failure_code=$4,next_attempt_at=clock_timestamp()+make_interval(secs=>LEAST(3600,30*power(2,LEAST(attempts,7)))::integer),lease_expires_at=NULL
      WHERE id=$1 AND lease_token=$2 AND status='processing' AND lease_expires_at>clock_timestamp()`, [id,leaseToken,failure.retryable,failure.code,failure.ambiguous]);
  }
  async hasPendingDeliveries(requestId:string):Promise<boolean>{
    const result=await this.pool.query("SELECT 1 FROM client_hub_outbox o JOIN client_hub_requests r ON r.id=o.request_id WHERE o.request_id=$1 AND o.status IN ('pending','processing') AND r.expires_at>clock_timestamp() LIMIT 1",[requestId]);
    return Boolean(result.rowCount);
  }
  async pendingKeys():Promise<string[]>{
    const result=await this.pool.query<{key_hash:string}>("SELECT DISTINCT r.key_hash FROM client_hub_requests r JOIN client_hub_outbox o ON o.request_id=r.id WHERE o.status IN ('pending','processing') AND r.expires_at>clock_timestamp() ORDER BY r.key_hash LIMIT 100");
    return result.rows.map(row=>row.key_hash);
  }
  async purge(): Promise<{ requests: number; quotaKeys: number }> {
    return this.transaction(async client => {
      await client.query("SELECT pg_advisory_xact_lock(hashtext(current_database()),hashtext(current_schema() || ':velani-client-hub-purge'))");
      const requests = await client.query('DELETE FROM client_hub_requests WHERE expires_at<=clock_timestamp()');
      const keys = await client.query("DELETE FROM client_hub_limits WHERE expires_at<clock_timestamp()-interval '1 day'");
      return { requests: requests.rowCount ?? 0,quotaKeys: keys.rowCount ?? 0 };
    });
  }
  async close(): Promise<void> { await this.pool.end(); }
}
