import { createHash, randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { beforeAll, beforeEach, afterAll, describe, expect, it } from 'vitest';
import { migrate } from '../scripts/migrate.js';
import { PostgresHubRepository } from '../src/client-hub/repository.js';
import type { Acceptance, ClientRequest } from '../src/client-hub/types.js';

const testUrl = process.env.TEST_DATABASE_URL;
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const input: ClientRequest = { type: 'project_support', name: 'Synthetic Client', email: 'client@example.com', company: '', project: 'Synthetic project', description: 'Synthetic request to verify isolated storage and delivery.', urgency: 'normal', language: 'en' };
describe.skipIf(!testUrl)('Client hub isolated PostgreSQL integration', () => {
  let admin: Pool; let pool: Pool; let repository: PostgresHubRepository;
  const schema = `hub_test_${randomUUID().replaceAll('-', '')}`;
  beforeAll(async () => {
    admin = new Pool({ connectionString: testUrl, max: 1 }); await admin.query(`CREATE SCHEMA "${schema}"`);
    const url = new URL(testUrl!); url.searchParams.set('options', `-c search_path=${schema},public`);
    pool = new Pool({ connectionString: url.toString(), max: 8 }); await migrate(pool); repository = new PostgresHubRepository(pool);
  }, 30_000);
  beforeEach(async () => { await pool.query('TRUNCATE client_hub_requests,client_hub_counters,client_hub_limits CASCADE'); });
  afterAll(async () => { await pool?.end(); if (admin) { await admin.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`); await admin.end(); } }, 30_000);
  const accept = (key: string, extra: Partial<ClientRequest> = {}, quota = key) => { const value = { ...input, ...extra }; return repository.accept(value, hash(key), hash(JSON.stringify(value)), hash(quota)); };
  function receipt(result: Acceptance) { if (!('receipt' in result)) throw new Error('Expected accepted request'); return result.receipt; }

  it('creates one reference and two immutable email jobs under concurrent identical retries', async () => {
    const results = await Promise.all(Array.from({ length: 6 }, () => accept('same')));
    expect(results.filter(result => result.kind === 'created')).toHaveLength(1);
    expect(new Set(results.map(result => receipt(result).reference)).size).toBe(1);
    expect(receipt(results[0]!).reference).toMatch(/^VEL-\d{4}-0001$/);
    expect((await pool.query('SELECT count(*) FROM client_hub_outbox')).rows[0].count).toBe('2');
    expect((await pool.query('SELECT value FROM client_hub_counters')).rows[0].value).toBe(1);
    expect(await accept('same', { description: 'A different synthetic request description.' })).toEqual({ kind: 'conflict' });
  });
  it('allocates distinct references concurrently and enforces the email quota before allocation', async () => {
    const results = await Promise.all(Array.from({ length: 6 }, (_, n) => accept(`request-${n}`, {}, 'one-email')));
    expect(results.filter(result => result.kind === 'limited')).toHaveLength(1);
    expect(new Set(results.flatMap(result => 'receipt' in result ? [result.receipt.reference] : [])).size).toBe(5);
    expect((await pool.query('SELECT value FROM client_hub_counters')).rows[0].value).toBe(5);
  });
  it('rolls back the request, reference counter and outbox together when storage fails', async () => {
    await pool.query("CREATE FUNCTION reject_hub_test() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Synthetic storage failure'; END $$");
    await pool.query('CREATE TRIGGER reject_hub_test BEFORE INSERT ON client_hub_outbox FOR EACH ROW EXECUTE FUNCTION reject_hub_test()');
    try { await expect(accept('rollback')).rejects.toThrow('Synthetic storage failure'); }
    finally { await pool.query('DROP TRIGGER reject_hub_test ON client_hub_outbox'); await pool.query('DROP FUNCTION reject_hub_test()'); }
    expect((await pool.query('SELECT count(*) FROM client_hub_requests')).rows[0].count).toBe('0');
    expect((await pool.query('SELECT count(*) FROM client_hub_counters')).rows[0].count).toBe('0');
  });
  it('leases each email once, fences stale completions and never resends a submitted confirmation', async () => {
    const saved = receipt(await accept('delivery'));
    const claims = await Promise.all(Array.from({ length: 4 }, () => repository.claimDelivery(saved.id)));
    expect(claims.filter(Boolean)).toHaveLength(2);
    const confirmation = claims.find(value => value?.kind === 'confirmation')!;
    await expect(repository.completeDelivery(confirmation.id, randomUUID(), 'wrong-worker')).rejects.toThrow();
    await repository.completeDelivery(confirmation.id, confirmation.leaseToken, 'provider-fixture');
    expect(await repository.confirmationState(saved.id)).toBe('submitted');
    expect(await repository.claimDelivery(saved.id)).toBeNull();
    await pool.query("UPDATE client_hub_outbox SET lease_expires_at=now()-interval '1 second' WHERE kind='support'");
    const reclaimed = await repository.claimDelivery(saved.id); expect(reclaimed?.leaseToken).not.toBe(claims.find(value => value?.kind === 'support')?.leaseToken);
  });
  it('blocks expired ambiguous sends and permanent failures instead of duplicating emails', async () => {
    const saved = receipt(await accept('uncertain'));
    await pool.query("UPDATE client_hub_outbox SET first_attempt_at=now()-interval '24 hours',submission_uncertain=true,status='pending'");
    expect(await repository.claimDelivery(saved.id)).toBeNull();
    expect((await pool.query('SELECT DISTINCT status FROM client_hub_outbox')).rows).toEqual([{ status: 'uncertain' }]);
    const fresh = receipt(await accept('permanent'));
    const claim = await repository.claimDelivery(fresh.id); expect(claim).not.toBeNull();
    await repository.failDelivery(claim!.id, claim!.leaseToken, { code: 'provider_403', retryable: false, ambiguous: false });
    expect((await pool.query('SELECT status FROM client_hub_outbox WHERE id=$1', [claim!.id])).rows[0].status).toBe('blocked');
  });
  it('purges old requests and cascaded jobs while preserving references, fresh requests and other service data', async () => {
    const old = receipt(await accept('old')); const fresh = receipt(await accept('fresh'));
    await pool.query("UPDATE client_hub_requests SET expires_at=now()-interval '1 second' WHERE id=$1", [old.id]);
    await pool.query("INSERT INTO rate_limits (key,hits,expires_at) VALUES ('other-service',1,now()+interval '1 hour')");
    expect(await repository.purge()).toMatchObject({ requests: 1 });
    expect((await pool.query('SELECT id FROM client_hub_requests')).rows).toEqual([{ id: fresh.id }]);
    expect((await pool.query('SELECT count(*) FROM client_hub_outbox')).rows[0].count).toBe('2');
    expect((await pool.query('SELECT value FROM client_hub_counters')).rows[0].value).toBe(2);
    expect((await pool.query('SELECT count(*) FROM rate_limits')).rows[0].count).toBe('1');
  });
  it('counts accepted requests in a real rolling day even after an IP counter window resets',async()=>{
    for(let n=0;n<5;n++)expect((await accept(`rolling-${n}`,{},'same-email')).kind).toBe('created');
    await pool.query("UPDATE client_hub_limits SET expires_at=now()-interval '1 second'");
    expect(await accept('rolling-overflow',{},'same-email')).toEqual({kind:'limited'});
    await pool.query("UPDATE client_hub_requests SET created_at=now()-interval '25 hours'");
    expect((await accept('rolling-new-day',{},'same-email')).kind).toBe('created');
  });
  it('does not consume a clients allowance when the global rolling cap rejects the request',async()=>{
    await pool.query(`INSERT INTO client_hub_requests(reference,key_hash,request_hash,email_quota_hash,fields)
      SELECT 'CAPACITY-'||n,md5('key-'||n)||md5('key-'||n),$1,md5('email-'||n)||md5('email-'||n),$2::jsonb FROM generate_series(1,40) n`,[hash('capacity'),JSON.stringify(input)]);
    expect(await accept('global-denied',{},'fresh-email')).toEqual({kind:'limited'});
    expect((await pool.query('SELECT count(*) FROM client_hub_limits')).rows[0].count).toBe('0');
    await pool.query("UPDATE client_hub_requests SET created_at=now()-interval '25 hours'");
    for(let n=0;n<5;n++)expect((await accept(`after-global-${n}`,{},'fresh-email')).kind).toBe('created');
    expect(await accept('after-global-overflow',{},'fresh-email')).toEqual({kind:'limited'});
  });
  it('safely retries a definitively refused message beyond one day while preserving earlier ambiguity',async()=>{
    const saved=receipt(await accept('definite-rejection'));
    const claim=await repository.claimDelivery(saved.id);expect(claim).not.toBeNull();
    await repository.failDelivery(claim!.id,claim!.leaseToken,{code:'provider_429',retryable:true,ambiguous:false});
    await pool.query("UPDATE client_hub_outbox SET first_attempt_at=now()-interval '25 hours',next_attempt_at=now()-interval '1 second' WHERE id=$1",[claim!.id]);
    const retry=await repository.claimDelivery(saved.id);expect(retry?.id).toBe(claim!.id);
    await repository.failDelivery(retry!.id,retry!.leaseToken,{code:'network_unconfirmed',retryable:true,ambiguous:true});
    await pool.query("UPDATE client_hub_outbox SET next_attempt_at=now()-interval '1 second' WHERE id=$1",[claim!.id]);
    const later=await repository.claimDelivery(saved.id);
    await repository.failDelivery(later!.id,later!.leaseToken,{code:'provider_429',retryable:true,ambiguous:false});
    await pool.query("UPDATE client_hub_outbox SET first_attempt_at=now()-interval '25 hours',next_attempt_at=now()-interval '1 second' WHERE id=$1",[claim!.id]);
    await repository.claimDelivery(saved.id);
    expect((await pool.query('SELECT status,submission_uncertain FROM client_hub_outbox WHERE id=$1',[claim!.id])).rows[0]).toEqual({status:'uncertain',submission_uncertain:true});
  });
});
