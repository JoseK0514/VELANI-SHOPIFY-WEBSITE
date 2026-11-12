# Client hub — Codex to Claude, November 11, 2026

## Scope and source

Jose asked Codex to complete the backend portion after the remaining-work audit. The request backend already exists and its public configuration is enabled. This pass qualifies that implementation and prepares the integration handoff; it does not build UI or change the published Shopify theme.

Repository: `JoseK0514/VELANI-SHOPIFY-WEBSITE`. Existing isolated worktree: `/Users/josek0514/Documents/Codex/2026-11-04/https-www-thevelani-com-preview-theme-2/work/velani-client-hub`, branch `codex/client-hub-20261107`, baseline `ef9dbe2`.

The client-hub runtime, migration 004, API adapters and Vercel routing have no differences from `d89350bd4019bc2746373bba8b75ff70d05039c8`, the implementation in the retained deployed-backend receipt. This pass requires no runtime redeployment. Current Vercel deployment metadata could not be freshly read through the connected account (project lookup returned 404); the live endpoint checks below are direct observations, not deployment provenance claims.

## Fixed contract — use this unchanged

Full field/error/retry contract: [2026-11-07-client-hub-interface.md](2026-11-07-client-hub-interface.md).

- Base URL: **`https://velani-ai.vercel.app`**.
- `GET /v1/client-hub/config`: use its `enabled`, public `turnstileSiteKey` and `turnstileAction` values. Keep submission disabled if unavailable or disabled. The action is **`velani-client-hub`**; a website-chat token with another action will fail.
- `POST /v1/client-hub/requests`: JSON, exact allowed browser Origin, `Idempotency-Key: crypto.randomUUID()`.
- Body: `type`, `name`, `email`, optional `company`, `project`, `description`, support-only `urgency`, `language` (`en`/`es`), `turnstileToken`. Support requires a project. Description is 20–5000 characters. Unknown fields are rejected. Other limits and field error codes are in the fixed contract.
- UI topic mapping: **`client-work` → `new_work`**; **`client-help` → `project_support`**. Map the form’s message to `description`. Do not send raw Shopify `contact[...]` field names to the JSON API.
- Keep **`nevora-demo` and other NEVORA trial/quote/Relay requests separate**. This endpoint accepts only Velani new work and project support. It does not provision workplaces or manage trials.
- No client account, login, chat session, public request lookup, attachment upload, payment or marketing subscription is created.

Example support submission:

```js
const response = await fetch('https://velani-ai.vercel.app/v1/client-hub/requests', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Idempotency-Key': logicalSubmissionKey,
  },
  body: JSON.stringify({
    type: 'project_support',
    name, email, company, project,
    description: message,
    urgency: 'normal',
    language: 'en',
    turnstileToken,
  }),
  credentials: 'omit',
  redirect: 'error',
  referrerPolicy: 'no-referrer',
});
```

Keep one key for the same logical submission through timeout/network/503 retries. Use a new key after editing form values. Reset verification when needed while preserving the key for unchanged values. Do not put tokens, keys or message text in URLs, logs or analytics. Avoid persistent browser storage of personal form content.

## Saved success is independent of email delivery

New request: HTTP 201. Identical replay: HTTP 200. Both return:

```json
{"status":"received","reference":"VEL-2611-0007","confirmationEmail":"submitted"}
```

`confirmationEmail` can instead be `pending`. **Both mean the request is saved.** Show the reference and success state. Never ask for a new submission because mail is pending. `submitted` means provider acceptance, not confirmed inbox delivery.

Handle per-field 422 errors, edited-key conflict 409, verification failure 403, rate limit 429 and unavailable/unknown transport outcomes without losing input or inventing a saved reference. Respect `Retry-After`. The service enforces 30 IP attempts/15 minutes, five accepted requests/email/rolling day and 40 accepted requests globally/rolling day. There are two email jobs per request.

## Email and privacy text

Provider **Resend**; sender **`Velani <requests@thevelani.com>`**. Full request goes to **support@thevelani.com**, Reply-To the client. The separate confirmation uses the client’s requested language, includes the reference, and replies to support. Sending authentication and the original queue/cron/restricted-role setup are recorded in the existing operations and backend handoffs; no provider key belongs in Shopify.

The database is Velani’s assistant database, with dedicated client-hub tables and runtime role; no NEVORA workforce data. Request/outbox target retention is up to 90 days with eligibility at day 88, provider email/log retention is separately documented as 30 days. Mailbox copies and backups are separate. Do not promise all copies are deleted at 90 days or treat this as the workforce trial policy. See [operations](2026-11-07-client-hub-operations.md) and [original backend receipt](2026-11-07-velani-nevora-backend-handoff.md).

## Verification in this pass

- Fresh focused baseline: **27/27** API, configuration, email, delivery and queue-adapter tests passed before changes.
- Added `services/velani-ai/test/client-hub-journey.test.ts`: real PostgreSQL migration/transactions/outbox plus the HTTP application. CAPTCHA, queue broker and provider network are explicit external fixtures. Tests cover EN new work + ES support; concurrent duplicate HTTP requests and expired-token replay; partial email failure with queue recovery and stable provider key; queue failure with no accepted request/counter/outbox followed by safe retry.
- Database journey: **4/4 passed**. Full service suite: **193/193 tests across 21 files, zero skipped**, including all existing PostgreSQL suites. Typecheck and build passed; production dependency audit found **0 vulnerabilities**. The suite reports pre-existing Fastify `FSTDEP023` deprecation warnings; these were not suppressed or changed.
- QA database used PostgreSQL 17 from the official Postgres.app 2.9.6 single-version release, with pgvector available. Release SHA-256 was verified. Its image was mounted read-only, without installing the app, and the cluster bound only to loopback. Each test cluster was stopped and removed. The earlier minimal fixture lacked pgvector; migrations/assertions were preserved unchanged for the successful rerun.
- Reproduce in the service directory with an explicitly isolated pgvector-capable `TEST_DATABASE_URL`: `npm test -- --fileParallelism=false --testTimeout=30000`, `npm run typecheck`, `npm run build`, `npm audit --omit=dev --audit-level=high`. Build only invokes TypeScript; it does not migrate or deploy. Receipts: `.omo/evidence/client-hub-readiness-20261111/`.
- Direct live GET config: **200**, enabled, expected Turnstile action, `Cache-Control: no-store`.
- Direct live OPTIONS: **204** for `https://www.thevelani.com`, `https://thevelani.com`, `https://x19hvn-ar.myshopify.com`; correct allow-origin and `Content-Type, Idempotency-Key`, with `Retry-After` exposed.
- Direct live hostile-Origin GET: **403**, no allow-origin header, `origin_not_allowed`.
- No live POST, support/client email, paid AI call, production data mutation, credential change, theme write, CI dispatch or deployment was made by this pass. Automatic cron execution and actual provider/inbox delivery were not freshly established by these probes.

## Claude’s remaining work and final acceptance

1. Integrate both request types and languages into the current approved design. The live forms inspected on November 11 still use Shopify’s `/contact` transport; backend enablement alone does not connect them.
2. Exercise field validation, conditional project/urgency, verification, disabled/unavailable state, reference success, pending email, edited-key conflict, quota and uncertain retry. Include mobile, keyboard, focus and language navigation. Use fixture responses first.
3. For final real sending, obtain Jose’s explicitly approved test inbox/send scope, use genuine browser verification and labeled synthetic content. Prove EN new-work + ES support each produce one saved request, two jobs, support and client inbox receipts, and no duplicate mail on replay. The saved request and provider submission must not be described as inbox delivery without that evidence.
4. Do not publish/change the live theme or replace the NEVORA trial flow as a shortcut. Do not change the API contract or add admin actions not supported by the private admin contract.

## Execution ledger

- Ruling: preserve the existing fixed contract and runtime rather than inventing a new endpoint or duplicating working backend code. The confirmed gap is the website transport and full acceptance.
- Ruling: add a database/application journey check at the seam missing from the existing separate API and repository tests. Do not modify applied migrations or weaken assertions to make a local fixture pass.
- Local initial journey attempt could not migrate because the minimal PostgreSQL binary lacked the existing Rondo `vector` extension. This was a QA dependency failure, not a diagnosed client-hub defect. Preserve all migrations and rerun using a disposable pgvector-capable fixture.
- Qualification complete: 193/193 tests, zero skips; typecheck/build/production audit pass. Runtime contract and applied migrations are unchanged. Claude can implement against the existing public backend. This readiness does not claim the live Shopify forms are connected or that real email inbox delivery was tested.
- Independent Standards and Spec reviews approved the qualification commit `9165290594797a5527b0a6387bf07cfe12caee21`, with no open findings. Their reports are `.omo/evidence/client-hub-readiness-standards-code-review.md` and `.omo/evidence/client-hub-readiness-spec-code-review.md`. The QA disk image was unmounted and this run’s temporary tools/data removed. The source/test/evidence commit is local; no push, CI dispatch or runtime deployment was performed.
