# Rondo launch follow-through — 2026-11-05

## Scope and source

Jose requested daily automatic conversation deletion, Claude's refreshed product knowledge, and an exact copy of Claude's updated headless chat client. Baseline: `d6ed79fff0bc362e752e269baf66d24a424d5361`. Claude source: `claude/rondo-website-ui-20261105` at `3be6321b8eafd25f537280098907f262e187d808`, specifically its launch handoff, eight proposed knowledge entries, and `src/night/velani-assistant.js`.

No Shopify theme/UI changes, workforce-application changes, model changes, or paid AI evaluations belong to this task.

## Acceptance criteria

- A production-only Vercel cron runs daily at 15:00 UTC (11:00 Puerto Rico; Hobby timing may occur within that hour), authenticated by a production-only sensitive `CRON_SECRET`. Missing/invalid credentials fail closed and never access the database.
- The job uses the existing restricted application database role, deletes expired sessions or sessions older than 30 days, and cascades their conversation children. It preserves enquiries, knowledge and rate limits. Current session expiry is 24 hours, bounded by configuration to seven days; daily cleanup therefore normally removes conversations much earlier than the public 30-day upper bound.
- Cleanup is transactional, serialized with the manual retention command, idempotent on duplicate delivery, and emits only aggregate counts. Record a first applied production run and verify the installed production schedule. Distinguish a manual verification from an observed automatic tick.
- Merge all eight proposed entries by ID, preserving the other eight existing entries: 16 published documents, 10 core. Validate first-party sources, dates and content hashes; back up existing knowledge before atomic publication. Test retrieval without calling a model.
- Copy Claude's client byte-for-byte into `integration/velani-assistant.js`. Verify non-retryable provider rejection, retryable in-progress responses and EN/ES messages with stub HTTP responses.
- Run focused regression tests, the full service suite in an isolated test database, typecheck/build, and independent standards/spec reviews. Do not use application credentials for integration tests.

## Deployment and rollback

Existing project: `velani-ai`, root `services/velani-ai`. Existing production before this change: `dpl_Hcqh1ShtUkdHCAVddRiC5ZWTyKAm`, commit `759a44d3e7662491b6fcea80f95be49ba4c70421`. Preserve its alias as a rollback target.

To roll back the job, first disable the project's cron jobs (instant rollback alone does not replace cron configuration), then deploy the previous source/configuration. Keep the secret in the approved Vercel store. Knowledge rollback uses the exact pre-publication snapshot with a hash guard so later edits are not overwritten. Conversation deletion is irreversible; no record backup is created by this task. Enquiry retention remains the separate manual 90-day operator command.

## Execution evidence

- Source reviews: [standards](../../../.omo/evidence/retention-refresh-standards-code-review.md) and [spec](../../../.omo/evidence/retention-refresh-code-review.md), both CLEAR / APPROVE after fixing the reproduced manual/cron stale-snapshot race and qualifying preview chat availability.
- Full service suite: **133/133 passed**, no skipped cases, using a fresh empty `rondo_retention_test_20261105` database with its own scoped test credential. Network integration cases used a 30-second timeout; assertions were unchanged. Typecheck and build passed. After removing redundant manual count queries, all four retention integration tests passed again, followed by typecheck/build. Existing Fastify deprecation warnings remain.
- Knowledge: 16 documents / 10 core atomically published to the assistant-only `velani_ai` database using the existing Neon owner connection, with no owner credential copied locally. Exact readback hashes match all 16 validated source records. The actual app-role retrieval SQL includes Relay and Plans in both English and Spanish, without model calls. A timestamp guard initially rejected publication because the connector normalized timestamps to milliseconds; no changes committed. The retry used exact `timestamptz::text` values and succeeded.
- [Guarded knowledge rollback](evidence/knowledge-rollback-2026-11-05.sql) preserves the exact previous 14 documents and archives the two added Relay records. Prepared only, not executed.
- Client: byte-identical to Claude Git blob `f9ab868f765b2c819e5152b60a66d997d0f29b7c`. Four EN/ES HTTP-stub tests cover rejection/editing, in-progress messaging and stable retry request IDs.
- `CRON_SECRET` configured as Sensitive in the existing Vercel project, **production only**; no administrator DB secret was added.
- Production deployment **`dpl_CniQFLC1BWmEJ5G3gKLZSX9o8zMG`** is READY and serves `https://velani-ai.vercel.app`, verified against source commit **`0ca8a753cd8618577a9fb7c1b9250c6769d46134`**. Vercel's project readback has cron enabled, `disabledAt: null`, and exactly `/api/cron/retention` with schedule `0 15 * * *` tied to that deployment.
- First applied run: **2026-11-05 14:29:40 UTC / 10:29:40 Puerto Rico**, manually invoked with cron authentication. HTTP 200 returned `{ "status": "ok", "sessions": 0 }`, and the production runtime log independently records `conversation_retention`, status `ok`, count 0. There were no conversations or enquiries before or after this verification. Unauthenticated access returned 401. Health/live, health/ready and public config returned 200; CAPTCHA remains required.
- The automatic schedule is installed; an automatic timer tick has **not** been observed during this task. The first scheduled window is 15:00–15:59 UTC / 11:00–11:59 Puerto Rico. A manual verification is not reported as an automatic execution. [Raw activation evidence](evidence/retention-activation-2026-11-05.json) preserves the schedule, API responses, runtime log, source hashes and validation summary. The logs connector returned 403; the already authenticated Vercel CLI retrieved the execution record successfully.
- Test cleanup: all isolated test schemas/tables were removed by the suites, and the new test-only role was set to NOLOGIN. Its empty test database remains for audit; application credentials were never used for tests. The runtime database was not used for synthetic conversations in this task.
- No paid AI requests, customer-data test changes, or Shopify writes. Existing AI reservation upper bound remains $3.225423 of the approved $3.35 cumulative cap; actual billing is unknown.

## Claude handoff

All three requested backend items are complete. Use `codex/rondo-backend-readiness-20261104`, service root `services/velani-ai`; do not merge unrelated backend/site branch histories merely to obtain the client. Your existing UI source already matches `integration/velani-assistant.js`. Product facts are live in the assistant database, including Relay's coming-soon status, trial request flow and Plans URL; chat availability is qualified by enabled surface. The six replaced and two added entries are reviewed through December 5; the eight unchanged entries still expire December 4 and need review by then.

No Shopify theme was modified or published. No additional paid answer-quality evaluation was run. The prior upstream provider rejection limitation remains; the client now correctly offers editing rather than retrying the same rejected request. Theme publication and any remaining website launch checklist remain with Jose and Claude.
