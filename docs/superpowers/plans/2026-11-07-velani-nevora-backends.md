# Velani client hub and NEVORA Release 1.1 implementation plan

> **For agentic workers:** Continue website implementation inline with superpowers:executing-plans. Use superpowers:subagent-driven-development for the independent NEVORA Release 1.1 candidate only; the controller retains deployment/DNS ownership. Steps use checkbox syntax for tracking.

**Goal:** Implement the fixed client-hub contract, prepare the authorized Release 1.1 trial policy and domain/app-link delivery, and leave an evidence-backed dated handoff.

**Architecture:** Isolated Velani Fastify function with validated request persistence, atomic monthly references and a transactional email outbox; Resend handles two transactional messages. A separate restricted role in the existing Velani database owns the request boundary. NEVORA work starts at development `e2872f30e` in a detached worktree, never alters frozen candidate `f5fa463b111e263c9b863b16b6c2bca502571a7b`, and is not deployed to production.

**Tech Stack:** Existing TypeScript/Fastify/PostgreSQL/Vercel service and NEVORA Next.js/PostgreSQL/native configuration; existing Resend account, no new subscriptions.

**Spec:** Jose's three-item request and `docs/handoffs/2026-11-07-client-hub-interface.md`.

## Global constraints

- Website backend only for client-hub data; never use NEVORA production data or credentials for tests.
- Current website policy wording remains until the Release 1.1 trial lifecycle ships.
- Exactly the existing NEVORA branches are allowed; detached worktree preserves parallel native work. Do not merge main or deploy NEVORA production.
- No metered AI calls, real customer-message tests, paid upgrades, wildcard CORS or secret output. DNS changes preserve existing inbound Google Workspace email.
- Domain purchase/registrar and verified store-signing identity are external prerequisites; never fabricate them.

## Review focus

- Concurrent duplicate submissions and edited retries: one request/reference, no double email.
- Ambiguous provider timeouts: stable provider idempotency keys and no resend beyond its 24-hour guarantee.
- CAPTCHA action/hostname, missing Origin and quota abuse: fail closed without storing payloads in logs.
- Missing subscription/provisioning authority: never infer a workplace may be deleted; an owner must retain export access throughout the grace period.
- Domain/app identifiers: never publish placeholders, staging signing keys or a deployment that changes the frozen release.

### Task 1: Fixed client-hub endpoint and storage

Files: create `services/velani-ai/src/client-hub/{types,validation,repository,app,config}.ts`, `api/client-hub.ts`, `migrations/004_client_hub.sql`, and focused tests. Modify only specific Vercel routing/function entries.

- [x] Add failing validation/API/repository tests for both request types, EN/ES, bad fields, no Origin, CAPTCHA mismatch, quotas, concurrent monthly allocation, duplicate and conflicting keys, and transaction rollback.
- [x] Implement minimal modules with parameterized SQL, independent AI-free bootstrap and no request-body logging.
- [x] Run focused tests and typecheck; record red/green evidence.

### Task 2: Email dispatch, recovery, retention and activation

Files: create `src/client-hub/{email,delivery,maintenance,runtime}.ts`, `api/cron/client-hub.ts`, role-provisioning/operations documentation; modify `vercel.json` and `.env.example`.

- [x] Add failing provider and outbox tests for recipient/Reply-To, escaped/plain text contents, bilingual confirmations, partial failure, fencing/concurrent workers, permanent failures and idempotency expiry.
- [x] Implement bounded inline dispatch, native Vercel queue retries and durable daily recovery on the existing Hobby plan. Retry only within a safe provider idempotency window; retain operator-visible blocked/uncertain state instead of duplicating notifications.
- [x] Purge eligible request/outbox data daily, preserving non-personal counters and leaving email-copy retention explicit.
- [x] Prepare/verify Resend DNS, restricted production configuration and guarded migration/rollback through existing approved stores. Activate sending only after domain verification and account capacity evidence. No customer-data tests.
- [x] Run full service suite using an isolated test database, typecheck/build and production-safe probes; commit feature work and evidence.

### Task 3: Release 1.1 trial lifecycle

Files and integration points are selected after inspecting NEVORA's current workspace/provisioning/notifications/export controls; record exact paths and why in its Release 1.1 handoff before edits.

- [x] Add a failing 30-day grace/reminder-boundary test at trial end, deletion minus seven days, deletion minus one day, conversion/cancellation races, idempotency, and owner-only export authorization.
- [ ] Introduce explicit authoritative trial state/provisioning and a fail-closed lifecycle boundary; do not claim a completed deletion worker where no trusted deletion/provisioning adapter exists.
- [x] Verify affected tests/typecheck, preserve frozen candidate and current policy copy, and commit detached development changes for the existing integration line.

### Task 4: nevora.team production preparation and handoff

- [ ] Verify purchase/DNS ownership and production project identity before domain writes; preserve the frozen production release boundary.
- [ ] Inspect actual Apple team/bundle and Android package/store signing identities. Prepare validated association files and native entitlements/intent filters; fail closed rather than publishing placeholder identities.
- [x] Document exact DNS/email records, release ownership, hosted checks actually performed, unresolved external prerequisites, rollback and next production gate in `docs/handoffs/2026-11-07-velani-nevora-backend-handoff.md`.
- [x] Run independent standards/spec review of the final work and address material findings before handoff.

## Decision and execution ledger

- Baselines: Velani `fb6a79b26d3748da9e556149e74de4dd1b6a57b4`; NEVORA development `e2872f30ea8548b1310ea4a9b25813352decf82a`. Separate worktrees preserve other work.
- Ruling: put the trial change in Release 1.1 as requested; no before-production exception is needed or assumed.
- Observed: the existing NEVORA development source has no implemented trial lifecycle. It needs an explicit new boundary, not a constant change to an existing deletion worker.
- Observed: Resend authenticated; `thevelani.com` domain created without tracking. DNS uses Google nameservers and inbound Google Workspace. `nevora.team` returns no public NS/TXT/MX; registrar/purchase question pending.
- Ruling: dispatch one fresh implementer for Task 3 while the controller finishes the independent website backend. The two worktrees share no application files. No concurrent implementation subagents, no production NEVORA changes.
- Ruling: use a native Vercel queue for prompt durable outbox retries; daily cron independently purges expired data and republishes pending work. Daily-only recovery cannot safely cover ambiguous email acceptance within the provider's 24-hour idempotency guarantee.
- Website implementation: validation, independent API, rolling accepted-request quotas, immutable two-message outbox, bounded provider retries, queue wake-ups, retention and tests are implemented but uncommitted. Initial reviewers found issues; fixes and queue integration await re-review.
- Evidence so far: 41 focused in-memory cases and 9 isolated PostgreSQL cases passed; typecheck passed; production dependency audit reports zero vulnerabilities. Full final suite and hosted activation remain.
- DNS evidence: Shopify domain detail explicitly says Managed by Shopify; DNS settings are accessible. Existing Google Workspace MX/SPF/DKIM remain intact. Resend domain is created, not verified. No DNS writes yet.
- Current state: no NEVORA production writes, no customer email tests; nevora.team purchase and production store-signing identities remain unverified.

## Final bounded outcome

- Website source d89350bd4019bc2746373bba8b75ff70d05039c8 pushed; active deployment dpl_8ChbePq8yvGTPJxi3LAspPyCtwnG Ready/enabled. Domain verified, effective grants/cron/route isolation checked; 186 full tests plus 3 final HTTP regressions passed. Actual accepted-form/queue/two-email journey is still pending UI, genuine verification and authorized inbox testing.
- NEVORA detached candidate 831d33dac00f63622f538e77fc598857f3b9b8d9 has zero open final source-review findings. Task3 timing policy and Task4 offline generator are prepared; authoritative lifecycle adapters, real signed app files and domain activation are not complete or shipped. The unchecked integration/purchase/signing gates above remain for Release1.1.
- Final dated status/owners/rollback and exact evidence: docs/handoffs/2026-11-07-velani-nevora-backend-handoff.md. Keep the worktrees/ledger for continuation; no NEVORA production release or main merge.
