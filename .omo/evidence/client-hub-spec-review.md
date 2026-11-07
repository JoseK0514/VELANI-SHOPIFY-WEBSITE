# Velani client hub specification review

Baseline fb6a79b26d3748da9e556149e74de4dd1b6a57b4 against the Nov. 7 working tree on codex/client-hub-20261107. Source paths below are relative to services/velani-ai. codeQualityStatus BLOCK. recommendation REQUEST_CHANGES.

**CRITICAL** — None.

**HIGH — Notification recovery.** src/client-hub/repository.ts:56 expires all attempted pending jobs after 23 hours. email.ts:32 distinguishes definite 429 refusals from ambiguous sends, but failDelivery discards that distinction. For example, a submission just after the daily sweep can get two 429s and then be marked uncertain at its first scheduled recovery, without a further send. api/cron/client-hub.ts:11 also limits recovery to four messages (two complete requests) per day versus up to 100 accepted requests. A brief outage can leave saved requests with no support email and no client confirmation. Persist cumulative uncertainty across attempts, allow safe recovery for proven unaccepted mail, and support adequate recovery throughput within the provider window or provide reconciliation for ambiguous outcomes. Preserve the frozen payload/provider key and never blindly resend an ambiguous message after provider deduplication expiry.

**MEDIUM — Acceptance quotas.** src/client-hub/repository.ts:16 implements windows anchored to the first hit, so adjacent windows allow more than the promised five/100 requests in a rolling 24-hour interval. At line 33 an email hit commits even when the global limit rejects the request. Repeated globally rejected attempts can exhaust a client's quota despite zero accepted submissions. Enforce the documented rolling acceptance counts atomically and test window boundaries alongside rejection by either quota.

**MEDIUM — Retention depends on email success.** api/cron/client-hub.ts:11 runs dispatch before purge. A persistent claim/acknowledgement database error prevents the scheduled purge even when the delete path itself works. Ensure purge runs independently of delivery and report separate failures for recovery and retention.

**LOW — Content-type contract.** src/client-hub/app.ts:34 allows Fastify's text/plain parser, yielding 422 validation_failed when the interface promises 415 content_type_required for a non-JSON request. Independently reproduced with local app.inject. Enforce application/json (including valid parameters) and pin that error contract.

Storage, reference allocation and pair of frozen email payloads share one transaction. Reviewed EN/ES templates and Reply-To routing agree with the handoff. The runtime currently updates delivery metadata only. Verify production column grants deny rewriting outbox payload/identity: the migration alone does not enforce immutability, and the concurrency test checks counts, not mutation rejection. Scoped work is confined to the Velani checkout.

Verification: ran 28 local API/delivery/template/validation tests successfully and inspected six PostgreSQL integration cases; did not rerun live/DB tests. Applied remove-ai-slops and programming review perspectives. No deletion-only or prompt-string tests found. Failure ambiguity is collected but currently ignored when choosing a retry, as noted above.

Operational gates: verify Resend domain/required public DNS, sending capacity and tracking settings; provision restricted Velani-only DB grants, migrate, deploy and verify route/config/CORS/Turnstile and production cron; establish outbox reconciliation plus purge monitoring and mailbox/provider retention. Obtain approved synthetic inbox evidence before claiming delivery. The contract references docs/handoffs/2026-11-07-velani-nevora-backend-handoff.md, absent at review time. Activation remains pending. No external requests or paid calls made by reviewer.

## 2026-11-07 re-review

The initial BLOCK remains above as historical evidence. Confirmed the original fixes: rolling limits now count persisted admissions under an advisory lock (5/email and 40/global); delivery persists cumulative uncertainty, permits safe later retries for unequivocal 429 refusals, and uses an opaque native queue wakeup and fenced two-minute email leases; recovery and purge execute independently; the HTTP entry point explicitly enforces JSON. The operations runbook defines column-level grants protecting frozen outbox payloads. The trigger shape, region, topic and Node callback method agree with installed official @vercel/queue 0.11.0; the Vercel queue consumer is internal. The evidence reviewed included current untracked queue/maintenance tests, migration, operations and interface docs. This pass used local inspection only. Previously loaded programming/remove-ai-slops perspectives were applied.

HIGH (new) — api/client-hub-email.ts:26. A zero-byte raw Node callback with undefined req.body unconditionally runs JSON.parse('') and returns HTTP 400. The installed SDK's binary-mode queue/v2beta parser (dist/index.mjs:763,796,841) supports notifications identified by ce-vqsqueuename, ce-vqsconsumergroup and ce-vqsmessageid without a receipt handle or embedded message. The SDK receives the payload by ID for this variant. This adapter prevents that legitimate notification from reaching the SDK, jeopardizing the replacement recovery mechanism. Allow undefined for an empty body and cover that callback variant locally. This is independent of the consumer's internal visibility.

MEDIUM (new) — docs/handoffs/2026-11-07-client-hub-interface.md:72 promises that quota hashes expire within 48 hours after the quota window. The new email_quota_hash is persisted on the request through its 88-day purge eligibility, different from the short-lived IP limit rows. Document each hash's actual retention or adjust storage to match.

CRITICAL/LOW — no active findings. Current codeQualityStatus BLOCK; recommendation REQUEST_CHANGES. Resolve the callback handling and retention wording. Separate activation evidence still required for deployed route and internal trigger, verified DNS/provider readiness, restricted grants and enabled state, as documented by the parent. No service, email or metered calls made.

## 2026-11-07 final scoped verdict

**codeQualityStatus CLEAR. Recommendation APPROVE source. Blockers [].** All earlier findings are closed. CRITICAL, HIGH, MEDIUM and LOW have no active findings.

The queue adapter now forwards the original headers and undefined body for zero-byte notifications, allowing the installed SDK's binary notification path to fetch the message by ID. Nonempty streamed JSON is parsed and oversized streamed or pre-parsed bodies return 413. Confirmed the regression uses the SDK's actual com.vercel.queue.v2beta event type and exercises the adapter with a Readable. Independently ran test/client-hub-queue-http.test.ts: 3/3 passed. The SDK callback stub confines the test to the adapter boundary. The interface and operations handoffs now distinguish IP quota cleanup within 48 hours of expiry under normal scheduling from email quota hashes retained through the request's 88–90-day purge. The previously consulted programming/remove-ai-slops criteria revealed no remaining material violation in this correction.

Parent reports verified provider DNS. Restricted database grants, deployment, internal queue registration and production activation require separate operational evidence. No real email or service calls during this review.
