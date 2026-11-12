import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { migrate } from '../scripts/migrate.js';
import { buildClientHubApp } from '../src/client-hub/app.js';
import { dispatchClientHubEmails } from '../src/client-hub/delivery.js';
import { ResendSender } from '../src/client-hub/email.js';
import { processHubWakeup } from '../src/client-hub/queue-work.js';
import { PostgresHubRepository } from '../src/client-hub/repository.js';
import type { TransactionalEmail } from '../src/client-hub/types.js';

const testUrl = process.env.TEST_DATABASE_URL;
const origin = 'https://www.thevelani.com';
const support = {
  type: 'project_support', name: 'Synthetic Client', email: 'client@example.invalid',
  company: 'Synthetic Company', project: 'Synthetic website',
  description: 'Synthetic support request; no real client or email delivery.',
  urgency: 'high', language: 'es', turnstileToken: 'fixture-approved',
};

// Real HTTP application, migrations, SQL transactions and outbox. Only the
// external CAPTCHA, queue broker and email network are fixture boundaries.
describe.skipIf(!testUrl)('Client hub isolated request-to-outbox journey', () => {
  const schema = `hub_journey_${randomUUID().replaceAll('-', '')}`;
  let admin: Pool;
  let pool: Pool;
  let repository: PostgresHubRepository;
  let app: FastifyInstance;
  let sender: ResendSender;
  let confirmationUnavailable: boolean;
  let queueUnavailable: boolean;
  let published: { keyHash: string }[];
  let providerCalls: { email: TransactionalEmail; key: string; accepted: boolean }[];

  beforeAll(async () => {
    admin = new Pool({ connectionString: testUrl, max: 1 });
    await admin.query(`CREATE SCHEMA "${schema}"`);
    const url = new URL(testUrl!);
    url.searchParams.set('options', `-c search_path=${schema},public`);
    pool = new Pool({ connectionString: url.toString(), max: 8 });
    await migrate(pool);
    repository = new PostgresHubRepository(pool);
  }, 30_000);

  beforeEach(async () => {
    await pool.query('TRUNCATE client_hub_requests,client_hub_counters,client_hub_limits CASCADE');
    confirmationUnavailable = false;
    queueUnavailable = false;
    published = [];
    providerCalls = [];
    sender = new ResendSender('fixture-not-a-provider-credential', async (_url, init) => {
      const email = JSON.parse(String(init?.body)) as TransactionalEmail;
      const key = new Headers(init?.headers).get('Idempotency-Key')!;
      const accepted = !(confirmationUnavailable && email.to !== 'support@thevelani.com');
      providerCalls.push({ email, key, accepted });
      return new Response(JSON.stringify(accepted ? { id: `fixture-${key}` } : { message: 'Synthetic quota refusal' }), { status: accepted ? 200 : 429 });
    });
    app = buildClientHubApp({
      enabled: true, hashSecret: 'isolated-client-hub-fixture-secret-only',
      allowedOrigins: [origin], turnstileSecret: 'fixture', turnstileSiteKey: 'fixture',
    }, repository, {
      verifyCaptcha: async token => token === 'fixture-approved',
      ensureDelivery: async keyHash => {
        if (queueUnavailable) throw new Error('Synthetic broker failure');
        published.push({ keyHash });
      },
      dispatch: requestId => dispatchClientHubEmails(repository, sender, { requestId, maximum: 2, pause: async () => undefined }),
    });
  });

  afterEach(async () => { await app?.close(); });
  afterAll(async () => {
    await pool?.end();
    if (admin) {
      await admin.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      await admin.end();
    }
  }, 30_000);

  const submit = (payload: object, key = randomUUID()) => app.inject({
    method: 'POST', url: '/v1/client-hub/requests',
    headers: { origin, 'idempotency-key': key }, payload,
  });

  it('saves EN new work and ES support with references and two correctly addressed emails each', async () => {
    const newWork = { ...support, type: 'new_work', urgency: undefined, project: '', email: 'new-work@example.invalid', language: 'en' };
    const responses = [await submit(newWork), await submit(support)];
    for (const response of responses) {
      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({ status: 'received', confirmationEmail: 'submitted' });
      expect(response.json().reference).toMatch(/^VEL-\d{4}-\d{4}$/);
    }
    expect(responses[0]!.json().reference).not.toBe(responses[1]!.json().reference);
    const requests = await pool.query('SELECT reference,fields FROM client_hub_requests ORDER BY reference');
    expect(requests.rows.map(row => row.reference)).toEqual(responses.map(response => response.json().reference));
    expect(requests.rows[0]!.fields).toMatchObject({ type: 'new_work', language: 'en', urgency: null });
    expect(requests.rows[1]!.fields).toMatchObject({ type: 'project_support', language: 'es', urgency: 'high' });
    expect(JSON.stringify(requests.rows)).not.toContain('fixture-approved');
    expect((await pool.query("SELECT count(*) FROM client_hub_outbox WHERE status='submitted'")).rows[0]!.count).toBe('4');
    for (const [index, email] of ['new-work@example.invalid', 'client@example.invalid'].entries()) {
      const reference = responses[index]!.json().reference as string;
      const confirmation = providerCalls.find(call => call.email.to === email)!.email;
      const notification = providerCalls.find(call => call.email.to === 'support@thevelani.com' && call.email.subject.includes(reference))!.email;
      expect(confirmation.reply_to).toBe('support@thevelani.com');
      expect(confirmation.subject).toBe(`${index === 0 ? 'Request received' : 'Solicitud recibida'} · ${reference}`);
      expect(notification.reply_to).toBe(email);
      expect(notification.text).toContain(support.description);
      expect(notification.text).toContain(`Email: ${email}`);
      expect(notification.from).toBe('Velani <requests@thevelani.com>');
    }
    expect(providerCalls).toHaveLength(4);
    expect(published).toHaveLength(2);
    expect(published.every(message => /^[a-f0-9]{64}$/.test(message.keyHash))).toBe(true);
  });

  it('deduplicates concurrent HTTP retries through SQL leases and replays after CAPTCHA expiry', async () => {
    const key = randomUUID();
    const responses = await Promise.all(Array.from({ length: 4 }, () => submit(support, key)));
    expect(responses.filter(response => response.statusCode === 201)).toHaveLength(1);
    expect(responses.filter(response => response.statusCode === 200)).toHaveLength(3);
    expect(new Set(responses.map(response => response.json().reference)).size).toBe(1);
    const replay = await submit({ ...support, turnstileToken: 'expired-fixture' }, key);
    expect(replay.statusCode).toBe(200);
    expect(replay.json()).toMatchObject({ reference: responses[0]!.json().reference, confirmationEmail: 'submitted' });
    const conflict = await submit({ ...support, description: 'An edited synthetic description must use a new key.' }, key);
    expect(conflict.statusCode).toBe(409);
    expect(conflict.json()).toEqual({ error: { code: 'idempotency_conflict' } });
    expect((await pool.query('SELECT count(*) FROM client_hub_requests')).rows[0]!.count).toBe('1');
    expect((await pool.query('SELECT count(*) FROM client_hub_outbox')).rows[0]!.count).toBe('2');
    expect(providerCalls).toHaveLength(2);
  });

  it('keeps a saved request successful during partial email failure and recovers only the pending job', async () => {
    confirmationUnavailable = true;
    const key = randomUUID();
    const accepted = await submit(support, key);
    expect(accepted.statusCode).toBe(201);
    expect(accepted.json()).toMatchObject({ status: 'received', confirmationEmail: 'pending' });
    expect((await pool.query('SELECT kind,status FROM client_hub_outbox ORDER BY kind')).rows).toEqual([
      { kind: 'confirmation', status: 'pending' }, { kind: 'support', status: 'submitted' },
    ]);
    confirmationUnavailable = false;
    await pool.query("UPDATE client_hub_outbox SET next_attempt_at=now()-interval '1 second' WHERE status='pending'");
    await processHubWakeup(repository, sender, published[0], new Date());
    const replay = await submit({ ...support, turnstileToken: 'expired-fixture' }, key);
    expect(replay.statusCode).toBe(200);
    expect(replay.json()).toEqual({ status: 'received', reference: accepted.json().reference, confirmationEmail: 'submitted' });
    expect(providerCalls.filter(call => call.accepted).map(call => call.email.to)).toEqual(['support@thevelani.com', support.email]);
    expect(new Set(providerCalls.filter(call => call.email.to === support.email).map(call => call.key)).size).toBe(1);
    expect((await pool.query('SELECT count(*) FROM client_hub_requests')).rows[0]!.count).toBe('1');
  });

  it('saves nothing on queue failure and accepts a retry using the original key', async () => {
    queueUnavailable = true;
    const key = randomUUID();
    const failed = await submit(support, key);
    expect(failed.statusCode).toBe(503);
    expect(failed.json()).toEqual({ error: { code: 'service_unavailable' } });
    expect((await pool.query('SELECT count(*) FROM client_hub_requests')).rows[0]!.count).toBe('0');
    expect((await pool.query('SELECT count(*) FROM client_hub_counters')).rows[0]!.count).toBe('0');
    expect((await pool.query('SELECT count(*) FROM client_hub_outbox')).rows[0]!.count).toBe('0');
    expect(providerCalls).toHaveLength(0);
    queueUnavailable = false;
    expect((await submit(support, key)).statusCode).toBe(201);
    expect(providerCalls).toHaveLength(2);
  });
});
