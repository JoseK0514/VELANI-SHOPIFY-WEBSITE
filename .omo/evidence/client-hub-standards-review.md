# Velani client hub standards review

Scope: uncommitted work against fb6a79b26d3748da9e556149e74de4dd1b6a57b4, codex/client-hub-20261107. Inspected the root agreements, interface, plan, migration 004, new modules, function routing, shared cron changes and local/database test source. Paths below are relative to services/velani-ai.

CRITICAL: none.

HIGH — src/client-hub/repository.ts:16,33. Accepted-submission quotas use counters with an expiry anchored to the first hit. One acceptance at the start, four immediately before expiry and five immediately afterward give nine accepted requests for one email in a rolling day. The analogous global maximum is 199. Also, when the email quota increments but the global quota denies a submission, returning 'limited' commits the email charge. Five global rejections can exhaust the caller's allowance without any accepted request. Enforce the specified rolling limits atomically against successful accepts. Add boundary, cross-quota-denial and concurrent tests.

HIGH — src/client-hub/repository.ts:56,77 and src/client-hub/delivery.ts:16. The system records the first attempt for every delivery, ignores DeliveryFailure.ambiguous in storage and converts all unsent attempts older than 23 hours to uncertain. For a job receiving two definitive 429s just after the daily cron, no send was accepted. The next unattended run still marks it uncertain and never retries. Conversely, a timeout followed by a definitive 429 must preserve the original uncertainty. Persist cumulative uncertainty across attempts and protect the original provider idempotency window for possibly accepted messages. Cover both sequences across the daily boundary.

MEDIUM — api/cron/client-hub.ts:11. A thrown dispatch/acknowledgement error skips the daily retention purge. A recurring failure can leave request descriptions and client contacts beyond the documented retention window. Run retention independently and record aggregate phase outcomes. Test a dispatcher exception followed by a successful purge.

MEDIUM — src/client-hub/validation.ts:7,15,29. Offline probes confirmed that a name containing U+0085 or U+2028 passes the one-line validator. Missing type/language fields produce 'invalid', and a support request with an invalid language omits the missing project error. Reject multiline Unicode separators and control characters for the single-line fields, and map independent required fields consistently. Add combined-error cases.

LOW: no additional material finding.

Verified exact-origin checks, action and hostname verification, dedicated ingress-IP extraction, bounded request size, parameterized SQL, atomic request/reference/outbox inserts, SQL lease fencing, immutable provider keys and restricted logs by source inspection. The current integration test role creates its own schema; its results alone cannot establish deployed role privileges. Activation requires sender DNS verification preserving Google inbound records, verified provider capacity, and readback of a dedicated least-privilege database identity/grants. These deployment checks are separate from the source findings.

The remove-ai-slops and programming perspectives ran. Cases cover relevant behavior; missing adversarial cases are described above. The unused ambiguity flag creates false confidence in notification recovery. The executor reported six database cases and 32 local cases; I inspected tests and independently probed validation in memory. No service/AI calls, customer data, DB writes, or live email tests.

codeQualityStatus: BLOCK
recommendation: REQUEST_CHANGES
blockers: Enforce atomic rolling acceptance limits, distinguish definite rejection from ambiguous handoff in durable recovery, isolate retention from delivery failures, and meet the input/error contract.

## Re-review of the corrections and native queue integration, 2026-11-07

All four initial findings are addressed. Admission now counts committed requests in the last 24 hours under a shared database lock, with limits of five/email and 40/global. Rejected admissions consume no accepted-request allowance. The SQL and sender preserve ambiguity across retries and lease recovery while allowing a definite 429 to retry later. Maintenance purges before republishing and reports both phases independently. Validation distinguishes missing fields, includes independent cross-field errors and rejects the demonstrated Unicode single-line violations. Unsupported content types return 415. Inspected the corresponding regressions. The queue publishes an opaque key before admission, retries early wake-ups and uses the original SQL outbox and provider keys. The installed SDK metadata types match the creation timestamp and delivery count consumed by the handler.

CRITICAL: none.

HIGH — api/client-hub-email.ts:26. For a raw POST with no body the wrapper calls JSON.parse('') and returns 400 before invoking the native consumer. The installed @vercel/queue 0.11.0 supports a v2 metadata-only callback: dist/index.js:860 parses its headers without needing body data and dist/index.js:938 fetches the message by ID when the receipt handle is absent. Such callbacks cannot perform durable recovery through this wrapper. Forward an empty raw body as undefined, preserving malformed nonempty-body rejection. Exercise the adapter against a headers-only v2 callback using a local stub.

MEDIUM — docs/handoffs/2026-11-07-client-hub-interface.md:72 promises all quota hashes expire within 48 hours of window end. Migration 004 and repository.ts:41 persist email_quota_hash on the request until request deletion (88–90 days). Align the stated retention periods by hash type, or expire the email hash according to the contract. Preserve the actual 48-hour cleanup description for IP counter hashes.

LOW: no additional finding. The remove-ai-slops and programming review checked production parsing and the revised behavior tests. The unnecessary assumption that all queue envelopes need a JSON body is captured above. No suites or external services were run in this re-review.

Deployment gates: verify sender domain state and sending-only key, effective dedicated role grants including denied outbox payload updates and unrelated-table access, hosted queue trigger and external ingress isolation before enabling admission. The documented operations runbook identifies these steps; they are distinct from source findings.

codeQualityStatus: BLOCK
recommendation: REQUEST_CHANGES
blockers: Preserve the SDK's metadata-only pull callback, and correct the email quota hash retention promise.

## Final source verdict following the two corrections

CRITICAL, HIGH, MEDIUM, LOW — no open findings. The earlier BLOCK decisions above record prior versions.

The Node adapter now forwards zero-byte raw requests with an undefined body and preserves the queue headers for the SDK's fetch-by-ID path. Nonempty raw JSON and pre-parsed payloads both enforce an 8 KiB bound before invoking the SDK. The adapter test uses a real Node readable stream with the installed SDK's v2 event type and verifies the bodyless handoff, both JSON paths, malformed input, and oversized bodies. The programming and remove-ai-slops review found the tests relevant to the observed regression. I inspected the fixes without rerunning suites or services.

The interface and operations documents now distinguish short-lived IP quota keys from the email hash deleted with its request after 88–90 days. This matches storage and the rolling admission query.

The executor reports completed Resend domain verification. Production role/grant readback, deployed queue registration and external ingress isolation remain deployment checks owned by the parent. Approval here covers source only.

codeQualityStatus: CLEAR
recommendation: APPROVE
blockers: []
