# Client hub operations — 2026-11-07

Service: existing Vercel `velani-ai`, project `prj_E1Vl2AEpTlJlBam4MTKG7oEHB7x2`, team `team_Lzbw410WwXGWHTuUXuamRI1N`, service root `services/velani-ai`. The dated main handoff records actual deployment/activation state; this is the runbook, not proof of activation.

## Data and migration custody

Use only Velani Neon project `wild-leaf-57992989`, branch `br-snowy-brook-bcc6b3zm`, database `velani_ai`. Do not use any NEVORA database. The existing application uses `velani_ai_app`; the hub must use a distinct `velani_client_hub_app` login with no superuser/createdb/createrole/replication/bypass-RLS/inherited roles. Credentials belong only in production-sensitive `CLIENT_HUB_DATABASE_URL` in the existing Vercel secret store. The running function must never receive owner credentials.

Before applying migration 004, check recorded checksums 001–003, check that no `client_hub_*` table or dedicated role exists, and inspect its current diff/tests. Take the same `velani-migrations` advisory transaction lock as `scripts/migrate.ts`; recheck migration state while holding it. Apply `004_client_hub.sql` and its SHA-256 ledger row in one transaction. Existing migrations are immutable. Retain the applied checksum and privilege readback in the main handoff. Avoid running a general owner script against an implicit target.

Required grants (after exact role existence/attributes are checked):

```sql
GRANT CONNECT ON DATABASE velani_ai TO velani_client_hub_app;
GRANT USAGE ON SCHEMA public TO velani_client_hub_app;
GRANT SELECT, INSERT, DELETE ON client_hub_requests TO velani_client_hub_app;
GRANT SELECT, INSERT ON client_hub_outbox TO velani_client_hub_app;
GRANT UPDATE (status,attempts,first_attempt_at,submission_uncertain,next_attempt_at,
  lease_token,lease_expires_at,provider_id,failure_code)
  ON client_hub_outbox TO velani_client_hub_app;
GRANT SELECT, INSERT ON client_hub_counters TO velani_client_hub_app;
GRANT UPDATE (value) ON client_hub_counters TO velani_client_hub_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON client_hub_limits TO velani_client_hub_app;
```

No runtime permission to update outbox payload/identity, edit accepted request fields, reset counters, create schema objects, read Rondo conversations or assume owner. Verify **effective** table/column privileges, schema CREATE=false and no memberships. Read-only probes may assert permissions; use the isolated test database for attempted denied mutations or synthetic request insertions. Production is not a test fixture.

## Email and delivery

Resend domain `thevelani.com`, sending enabled, receiving disabled, open/click tracking off. Sender `Velani <requests@thevelani.com>`. Create a **sending-only, domain-restricted** API key and save directly in production-sensitive `RESEND_API_KEY`; never print it or put it in a local env file. Current account evidence: 100 emails/day, 3,000/month, 10 requests/second. Hub admission is capped at 40 requests/rolling day and five/email/rolling day. Two emails/request leaves ordinary headroom; account-wide traffic can still delay delivery. No paid upgrade or overages are authorized.

The outbox freezes full provider payloads when the request/reference is committed. Stable provider idempotency key: `velani-client-hub/<outbox UUID>`. Immediate sending is bounded; the native Vercel queue topic `velani-client-requests` delivers opaque HMAC request keys only, TTL 24 hours, region iad1. Its queue/v2beta consumer is internal to Vercel and must have no public HTTP ingress ([Vercel consumer security](https://vercel.com/docs/queues)). Verify the deployed consumer trigger and that direct external POST does not execute it.

A wake-up is durably published **before** request acceptance commits. A consumer retries a missing row for five minutes, then acknowledges an orphan. Duplicate wake-ups are safe: SQL leases/fencing and provider keys prevent duplicate sends. A provider timeout followed by 429 retains the earlier uncertainty. Definite refusals can retry after a daily quota resets; a possibly accepted send stops after 23 hours, inside [Resend's 24-hour deduplication window](https://resend.com/docs/dashboard/emails/idempotency-keys). Never reset an uncertain job or change its payload/key to force a resend without reconciling provider acceptance.

## Maintenance and monitoring

Keep the existing Rondo retention job at `0 15 * * *`. Hub maintenance: `/api/cron/client-hub`, `0 16 * * *` (12:00 Puerto Rico). Both require the existing production-only `CRON_SECRET`; no new owner credential. Hub purge runs independently of queue republishing, including while form admission is disabled. Requests are eligible at 88 days, leaving a daily scheduling margin before the 90-day target. Cascading deletes remove outbox copies. IP quota hashes are purged after their expired window plus one day (within 48 hours after window end under normal daily scheduling). Email quota hashes remain on requests until their 88–90-day purge, although only the latest rolling day's requests count against acceptance. Monthly reference counters are non-personal and remain.

Check maintenance aggregate logs for `retentionSucceeded` and `recoverySucceeded`, plus hosted cron registration/last run. A missing or failed daily run needs same-day operator attention; scheduling alone does not guarantee deletion on time during an outage. Inspect aggregate delivery state without client content:

```sql
SELECT status, count(*) AS jobs, min(created_at) AS oldest
FROM client_hub_outbox GROUP BY status ORDER BY status;
SELECT count(*) AS overdue FROM client_hub_requests
WHERE expires_at <= clock_timestamp();
```

Escalate `blocked`/`uncertain` to Velani support operations. Retrieve a specific request/provider event only when necessary for support, using authorized access; never put descriptions, email addresses, full hashes or credentials into runtime logs. Resend says email/log retention is [30 days](https://resend.com/security/gdpr). Google support/client mailbox retention is separate and has no verified automatic purge; database backups also require separate disclosure. Do not claim every copy disappears after 90 days.

## Guarded activation and rollback

Deploy from the reviewed feature commit with `CLIENT_HUB_ENABLED=false` first. Verify the additive migration/grants, DNS/provider status, exact CORS origins, config/disabled POST, production cron and internal queue registration. Activate only after those pass. Claude's form must consume `/v1/client-hub/config`; the contract is in `2026-11-07-client-hub-interface.md`.

Rollback ingress by setting `CLIENT_HUB_ENABLED=false` and redeploying the same reviewed service source. This also pauses email dispatch; retained outbox data remains available for reconciliation. Keep the maintenance deployment so retention continues. Do not drop populated tables, migration history or counters, revoke existing Rondo secrets, or remove Google DNS as rollback. If reverting the whole deployment, restore independent retention coverage before its deadline. DNS rollback removes only the four new Resend records after stopping sender use; it never resets the whole zone.

No real support/client inbox test is authorized. Tests use an isolated database and a local provider stub. A provider-owned simulated recipient may verify API acceptance separately, with no customer or support-mailbox delivery; it does not prove a real inbox, CAPTCHA or Claude's future form.
