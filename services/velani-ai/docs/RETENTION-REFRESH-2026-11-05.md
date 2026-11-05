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
- `CRON_SECRET` configured as Sensitive in the existing Vercel project, **production only**; no administrator DB secret was added. Actual deployment, installed schedule and first applied-run verification remain pending below.
- No paid AI requests, customer-data test changes, or Shopify writes. Existing AI reservation upper bound remains $3.225423 of the approved $3.35 cumulative cap; actual billing is unknown.
