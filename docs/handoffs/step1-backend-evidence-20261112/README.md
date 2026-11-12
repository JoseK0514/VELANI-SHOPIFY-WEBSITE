# Step 1 evidence index

Owner: Codex backend/hosting. November 12, 2026. The controlling report is
[the Step 1 handoff](../2026-11-12-step1-velani-backend-truth.md).

- `source-custody.json`: freshly fetched development/main identities, local
  backend commit, clean read-only NEVORA checkout and no external mutations.
- `backend.patch`: exact two-file backend commit, including its regression.
- `backend-tests.{json,log}`: preserved original five failed setup suites,
  194 passed / 66 unexecuted; duplicate database-wide extension installation.
- `migration-red.log` / `migration-green.log`: focused real PostgreSQL race
  regression before and after the database-wide lock.
- `backend-tests-green.{json,log}`: 261 passed, no failures/skips, 27 files.
- `typecheck-green.log`, `backend-build-green.log`: post-fix exit0 checks.
- `root-tests.log`, `theme-check.log`, `checks.json`: 80 website tests,
  37-route build, Theme Check and initial service typecheck/build receipts.
- `browser.log`: blocked bundled Chromium launch, retained.
- `browser-chrome.{json,log}`: actual installed Chrome run, 87 passed / 2
  existing UI failures, no runtime errors or outbound POST/external request.
- `public-readonly.json`: 21 bounded GET observations, public page text/body
  hashes, API config and final URL. A final200 at Vercel login is authentication,
  not protected development API success. It contains no authentication cookies.
- `hosting-readonly.json`: allowlisted Vercel project/deployment metadata;
  source-target identities, SSO, bypass count, disabled Git deploys and cron.
  Existing CLI-session token was used only in memory; no credential value saved.
- `connected-readonly.json`: bounded Shopify/Jira/Stripe/Neon observations.
  Includes current sandbox price records, synthetic inquiry aggregates and Rondo
  budget/scheduler/knowledge metadata. Native environment entries are variable
  names only, not current flag values or credentials.
- `fixture-closure.json`: local owned PostgreSQL16.2 server stopped. Preview
  server also stopped; source data and failed receipts were preserved locally.
- `secret-scan.{json,log}`: redacted local Gitleaks scan of changed code and
  this report/evidence snapshot, not historical/full-repository certification.

Validation ran on Node24.19.0 with a new loopback-only PostgreSQL16.2/pgvector
cluster. The cached local PostgreSQL17 tools did not provide a complete matching
pgvector runtime; no hosted credentials were substituted. PostgreSQL17 hosted
equivalence remains a later qualification gate, not a passing result here.

Executed from `services/velani-ai` with a scrubbed subprocess environment and
only the owned `TEST_DATABASE_URL` (127.0.0.1:56571/postgres):

```sh
npm test -- test/migration-concurrency.test.ts
npm test -- --reporter=default --reporter=json --outputFile=<evidence>/backend-tests-green.json
npm run typecheck
npm run build
```

The new regression creates/drops only its generated local database and uses a
test-only event trigger to widen the real race. It needs local test administration
privileges and rejects non-loopback targets. Existing per-schema SQL tests use
the same disposable fixture. External model, CAPTCHA, queue and email transports
are synthetic; no live evaluation/sending or hosted migrations were run.

Root checks were `npm test` (its pretest builds37routes), `npm run check:theme`,
and `npm run check:browser` against127.0.0.1:4179. The successful browser launch
explicitly used the already-installed Google Chrome executable. Both genuine UI
failures remained failures. All package installation used `npm ci --ignore-scripts
--no-audit --no-fund`; lockfiles/dependency versions were unchanged.

Prior hosted inbox/delivery and paid Rondo receipts live in the dated handoffs
linked by the controlling report. They were not recreated or relabeled as new
acceptance. No CI, push, deploy, Shopify write, new alert or paid model call.

Tracked logs normalize only trailing blank lines at EOF. Unmodified originals
are preserved locally at
`/Users/josek0514/.codex/visualizations/2026/11/12/01a1d1ca-db98-7ed2-8ff7-138dcb511643/raw-step1-checklogs/`.
No failure message, test result, assertion or warning was removed.
