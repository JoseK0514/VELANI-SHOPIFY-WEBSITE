# Client hub execution evidence — 2026-11-07

Base fb6a79b26d3748da9e556149e74de4dd1b6a57b4; isolated feature worktree codex/client-hub-20261107. Production credentials were not used for tests. No paid AI, real customer/support email, domain purchase or NEVORA production change.

## TDD and review corrections

Initial missing-module failures preceded implementation. Focused tests then covered validation/API/template/lease/recovery/retention behavior. Both reviewers' first and subsequent BLOCK findings are preserved in their artifacts.

- Rolling acceptance quota regression failed against fixed-window counters, then passed with actual accepted-row counting under an admission lock. Definitive rejection and cumulative ambiguous handoff are durable states; local/DB cases cover quota resets and a timeout followed by429.
- Provider capacity discovered100emails/day. A40-request capacity fixture failed with old100-request admission (received created instead of limited); source cap corrected to40, preserving five/email/day and no quota charge on denial.
- HTTP queue adapter: after correcting test-authoring syntax/setup errors, RED was2 assertion failures/1pass: headers-only delivery returned400 instead of SDK200; oversized body returned400 instead of413. GREEN after minimal adapter changes:3/3 pass. Tests use real Readable streams and a stub SDK callback boundary; they do not prove hosted broker delivery.
- Independent source reviews now CLEAR/APPROVE; see client-hub-spec-review.md and client-hub-standards-review.md. Production configuration remains a separate gate.

## Checks actually run

- Focused original41 cases and9 isolated PostgreSQL cases passed before the capacity adjustment.
- Full default service suite initially failed10 cases on Vitest's default5s remote-database timeout,176 passed. No assertion failed for business behavior. Existing and new concurrent transaction cases exceeded5s against the remote isolated compute. Preserved failure; no assertions changed.
- `TEST_DATABASE_URL=<isolated test-only store> npm test -- --testTimeout=30000 --maxWorkers=1` passed **186/186**,19 files,250.61s. This serializes files while retaining each test's internal concurrency. The new HTTP adapter regression file was added after this run collected files and passed separately3/3 after the source fix. Existing Fastify deprecation warnings remain visible.
- `npm run typecheck` and `npm run build` exited0 after the adapter fix. `npm audit --omit=dev` reports0 known production vulnerabilities. Three pre-existing dev-only audit findings remain. No automatic force-upgrade.

## External readbacks

- Shopify domain details explicitly Managed by Shopify; four approved Resend DNS additions saved and reloaded. Public DNS matches account records. Resend now reports **verified**, sending enabled, receiving disabled, tracking off. Google MX/SPF/DKIM and storefront records preserved.
- Guarded migration004 and fresh dedicated role committed atomically with prior001–003 checksums rechecked under the migration lock. Applied004 SHA256:7d733ace5cd677a7358acbe30a77d5b707622a27f429d7fffaa1c21fa23519d4.
- Effective privilege readback: role LOGIN, NOINHERIT, NOSUPERUSER/NOCREATEDB/NOCREATEROLE/NOREPLICATION/NOBYPASSRLS; no schema CREATE; no read/write on Rondo tables; no rewrite of outbox payload or request fields. Outbox UPDATE only nine delivery metadata columns. Existing Rondo app cannot read hub requests. Hub requests/jobs0; pre-existing chat-session aggregate1 preserved.
- Domain-restricted sending-only Resend key and fresh restricted hub DB URL saved directly as production-sensitive Vercel variables. Admission flag false; six existing approved exact origins copied as public configuration. No secret value printed or written to a local production env file.

## Hosted acceptance

Source `d89350bd4019bc2746373bba8b75ff70d05039c8` was pushed on the feature branch, no main merge. Guarded deployment `dpl_BZdFwDp5DYr7uJXFRFSNpVjJfJTF` passed disabled-flag 503, exact CORS/403, cron 401 and internal consumer 404 checks. The same source activated in deployment `dpl_8ChbePq8yvGTPJxi3LAspPyCtwnG`, Ready, alias `velani-ai.vercel.app`, region iad1. Config 200/enabled true; invalid fields 422 with individual codes; media 415; all six approved origin preflights 204; Rondo health 200.

Vercel deployment metadata records the queue/v2beta trigger for `velani-client-requests`; public callback POST returns 404. Both cron registrations match source. Authenticated CLI manual hub cron runs in both deployments produced aggregate retentionSucceeded/recoverySucceeded true, zero jobs/expired requests. Active run completed `2026-11-07T15:23:46.313Z`. The secret was not exposed. A future automatic daily firing has not yet been observed.

Provider-owned simulation `01a1b692-ba02-723d-809d-f82e5894671d` from requests@thevelani.com, Reply-To support, to a labelled resend.dev address reported delivered. This is simulation evidence, with no real customer/support inbox send. The restricted Resend sending key was stored independently; this connector-sent simulation does not prove an application-sent email.

Neon project restore history readback: 86,400 seconds. The isolated test DB has no tables; its test role is NOLOGIN with zero active test connections. Temporary secret copies were cleared. Production hub request/outbox counts remain 0 and the existing Rondo session aggregate 1 was preserved.

Actual accepted form → queue consumer → two emails remains untested pending genuine Turnstile/UI and inbox-test authorization. Queue observability showed no data and provided no publisher control; no probe test job was created. Full form delivery and future cron firing are not claimed.
