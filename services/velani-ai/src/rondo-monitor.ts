import { randomUUID } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';

export interface RondoMonitorPolicy {
  scope: 'development' | 'production'; sourceSha: string; mailEnabled: boolean;
  maxNoticeAttempts: number; deliveryDeadlineMs?: number;
}
type Kind = 'outage' | 'recovery';
type Notice = 'none' | 'disabled' | 'submitted' | 'uncertain' | 'capped' | 'busy';
interface JournalNotice { id: string; status: string; attempts: number; kind: Kind }

/** The direct connection's session lock spans sampling, journal commit and the
 * bounded external acknowledgement. Never use a transaction-pooling endpoint. */
export async function processRondoObservation(
  pool: Pool, policy: RondoMonitorPolicy,
  observe: () => Promise<{ status: string }>,
  notify: (kind: Kind, key: string) => Promise<{ id: string }>,
): Promise<{ state: string; notice: Notice }> {
  if (!['development','production'].includes(policy.scope) || !/^[a-f0-9]{40}$/.test(policy.sourceSha)
    || !Number.isSafeInteger(policy.maxNoticeAttempts) || policy.maxNoticeAttempts < 0 || policy.maxNoticeAttempts > 100
    || (policy.deliveryDeadlineMs !== undefined && (!Number.isInteger(policy.deliveryDeadlineMs)
      || policy.deliveryDeadlineMs < 10 || policy.deliveryDeadlineMs > 5000))) throw Error('rondo_monitor_configuration_invalid');
  let client: PoolClient | undefined;
  let locked = false, transaction = false, unlockConfirmed = false, claimed = false;
  try {
    client = await pool.connect();
    locked = (await client.query(`SELECT pg_try_advisory_lock(hashtext(current_database()),
      hashtext(current_schema() || ':rondo-monitor:' || $1)) AS locked`, [policy.scope])).rows[0].locked;
    if (!locked) return { state: 'busy', notice: 'busy' };
    const observed = await observe();
    if (!['ok','attention'].includes(observed.status)) throw Error('invalid_observation');
    await client.query('BEGIN'); transaction = true;
    const old = (await client.query<{ state: string; incident_id: string | null }>(
      'SELECT state,incident_id FROM rondo_monitor_state WHERE scope=$1 FOR UPDATE', [policy.scope])).rows[0];
    const incident = observed.status === 'attention' && old?.state !== 'attention' ? randomUUID() : old?.incident_id ?? null;
    await client.query(`INSERT INTO rondo_monitor_state(scope,state,incident_id) VALUES($1,$2,$3)
      ON CONFLICT(scope) DO UPDATE SET state=EXCLUDED.state,incident_id=EXCLUDED.incident_id,observed_at=clock_timestamp()`,
    [policy.scope, observed.status, incident]);
    let notice: JournalNotice | undefined;
    if (incident) {
      const kind: Kind = observed.status === 'attention' ? 'outage' : 'recovery';
      const outageAttempted = kind === 'outage' || Boolean((await client.query(
        "SELECT 1 FROM rondo_monitor_notices WHERE scope=$1 AND incident_id=$2 AND kind='outage' AND attempts=1",
        [policy.scope, incident])).rowCount);
      const eligible = policy.mailEnabled && outageAttempted;
      await client.query(`INSERT INTO rondo_monitor_notices(scope,incident_id,kind,source_sha,status)
        VALUES($1,$2,$3,$4,$5) ON CONFLICT(scope,incident_id,kind) DO NOTHING`,
      [policy.scope, incident, kind, policy.sourceSha, eligible ? 'pending' : 'disabled']);
      if (eligible) await client.query(`UPDATE rondo_monitor_notices SET status='pending'
        WHERE scope=$1 AND incident_id=$2 AND kind=$3 AND attempts=0 AND status IN ('disabled','capped')`,
      [policy.scope, incident, kind]);
      notice = (await client.query<JournalNotice>(
        'SELECT id,status,attempts,kind FROM rondo_monitor_notices WHERE scope=$1 AND incident_id=$2 AND kind=$3',
        [policy.scope, incident, kind])).rows[0];
      if (eligible && notice?.status === 'pending') {
        const used = Number((await client.query(
          'SELECT count(*) AS n FROM rondo_monitor_notices WHERE scope=$1 AND attempts=1', [policy.scope])).rows[0].n);
        if (used >= policy.maxNoticeAttempts) {
          await client.query("UPDATE rondo_monitor_notices SET status='capped' WHERE id=$1", [notice.id]);
          notice.status = 'capped';
        } else {
          const updated = await client.query("UPDATE rondo_monitor_notices SET status='sending',attempts=1,attempted_at=clock_timestamp() WHERE id=$1 AND attempts=0", [notice.id]);
          if (updated.rowCount !== 1) throw Error('claim_not_confirmed');
          claimed = true;
          notice.status = 'sending'; notice.attempts = 1;
        }
      }
    }
    await client.query('COMMIT'); transaction = false;
    if (!notice || !claimed || !policy.mailEnabled) {
      return { state: observed.status, notice: notice?.status === 'sending' ? 'uncertain' : !notice ? 'none' : ['disabled','capped','uncertain'].includes(notice.status)
        ? notice.status as Notice : 'none' };
    }
    // Only a newly claimed notice may be sent. An older ambiguous sending row
    // must never be retried, even after the provider's idempotency window ends.
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const response = await Promise.race([
        notify(notice.kind, 'rondo-ops/' + policy.scope + '/' + notice.id),
        new Promise<never>((_, reject) => { timer = setTimeout(() => reject(Error('unknown_delivery')), policy.deliveryDeadlineMs ?? 5000); }),
      ]);
      if (!/^[a-zA-Z0-9_-]{1,200}$/.test(response.id)) throw Error('unknown_delivery');
      await client.query("UPDATE rondo_monitor_notices SET status='submitted',provider_id=$2 WHERE id=$1 AND status='sending'", [notice.id, response.id]);
      return { state: observed.status, notice: 'submitted' };
    } catch {
      await client.query("UPDATE rondo_monitor_notices SET status='uncertain' WHERE id=$1 AND status='sending'", [notice.id]).catch(() => undefined);
      return { state: observed.status, notice: 'uncertain' };
    } finally { if (timer) clearTimeout(timer); }
  } catch {
    if (transaction) await client?.query('ROLLBACK').catch(() => undefined);
    throw Error('rondo_monitor_unavailable');
  } finally {
    if (locked) {
      try { unlockConfirmed = Boolean((await client!.query(`SELECT pg_advisory_unlock(hashtext(current_database()),
        hashtext(current_schema() || ':rondo-monitor:' || $1)) AS unlocked`, [policy.scope])).rows[0].unlocked); } catch { /* Destroy uncertain session below. */ }
    }
    client?.release(locked && !unlockConfirmed ? Error('monitor_lock_unknown') : undefined);
  }
}
