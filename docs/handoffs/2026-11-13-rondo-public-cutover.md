# Rondo public cutover preparation — November 13, 2026

Codex owns backend/hosting; Claude owns UI. Development is the accepted operating
line. This packet prepares public production but does not merge main, promote an
alias, change a hosted database, send messages or purchase hosting. Jose accepted
Ilianis's access on November 13 and explicitly closed that requirement: Jose
remains the incident owner and will work with Codex when an incident occurs. No
additional backup-response questionnaire is a release gate.

## Reproduced engineering gap and correction

The existing public alias `velani-ai.vercel.app` resolves to
`dpl_2yjDbRBcm8vc6ujPm1mqz34qLRhT`, whose provider `meta.sourceCommit` is
`3db0ea98bc3da6b3ae08b9e5d2c2b59a361e6a8d`. Its `velani_ai` database has five
migrations and no budget table, retention aggregate view or native-monitor view.
The separately accepted budget and monitors operate on
`velani_rondo_development`. Those are distinct runtime/data targets.

Native jobs, watchdog DSN validation, monitor journal constraints and alert labels
were development-only. Six RED regressions reproduced rejection of the explicit
production target, a real SQL scope constraint failure and incorrectly labeled
alerts. A separate operator-entry regression demonstrated that a crossed policy
could create the wrong target's journal without the new entry guard.

The correction adds two pinned profiles:

| Selector | Database | Native monitor role | Retention/app role | External reader |
| --- | --- | --- | --- | --- |
| development (existing default) | velani_rondo_development | velani_rondo_dev_monitor | velani_rondo_dev_app | velani_rondo_dev_watchdog |
| production (explicit) | velani_ai | velani_rondo_prod_monitor | velani_ai_app | velani_rondo_prod_watchdog |

Both bind the existing branch `br-snowy-brook-bcc6b3zm` and exact direct endpoint.
`RONDO_OPERATIONS_ENVIRONMENT=production` selects native production jobs;
`RONDO_WATCHDOG_ENVIRONMENT=production` selects the external observer. Unknown
values, crossed credentials/databases, wrong triggers, poolers, TLS downgrades
and URL overrides are refused. Production triggers are named
`rondo-production-monitor` and `rondo-production-retention`; alerts identify the
actual environment. Existing jobs retain their development names and selection.

Additive migration `010_monitor_environment_scope.sql` admits a production
journal scope and appends a scope column to the aggregate view. Original
migrations remain immutable. Existing rows, notice IDs, provider outcomes and
attempt counters are preserved. A missing heartbeat remains an explicit stale/
unobserved result. Scoped sampling cannot use a healthy development heartbeat
to hide a stopped production monitor. Existing development readers continue to
see the development row first until their reviewed replacement is installed.

The independent journal still refuses any in-place policy/target change. The
operator entry point checks the selected profile before initializing a journal.
No automatic journal conversion, new allowance, role grant or hosted activation
is implemented by this change.

Local GREEN: all292 service tests pass with zero skipped/failed/todo against an
owned PostgreSQL16.2/vector fixture; types/build pass. The seven added tests cover
target/trigger rejection, truthful alert labels, SQL scope separation, independent
policy counters and operator entry-point binding. The first SQL run and separate
operator-entry RED are retained. PostgreSQL17/vector candidate and development
Actions must independently qualify the committed source and rebuilt archives.

## Exact cutover procedure after release approval

1. Qualify the exact committed source in candidate and actual development
   Actions. Verify the complete source hashes and both Node24 native archives.
   Freeze that source for the public release. Review hosting/headroom first:
   the team currently reports Hobby; the earlier commercial-hosting gate remains.
2. Read the actual public alias/source, both databases' migration checksums and
   the current finite authorization. Public source currently lacks the guard;
   pause/drain its model admission through an approved provider/runtime control
   before changing it. A row in the development database cannot stop an older
   public binary. Preserve hub/inquiry availability and its dedicated database
   and outbox configuration throughout this Rondo-specific cutover.
3. Pause development model admission, wait at least its configured maximum
   model deadline and verify no admission remains. Snapshot the final immutable
   policy and cumulative reserved amount. Latest readback was 2,670,150 of
   10,000,000 microUSD, authorization `686083cd-535e-422d-b027-9293601fe98c`,
   expiring **December 1, 2026 at 04:00 UTC**. Use the fresh post-drain amount,
   never this historical number if it has increased.
4. Under the existing migration advisory lock, verify public migrations 001–005
   and apply only reviewed missing migrations 006–010 plus their checksums.
   Preserve all existing public sessions, leads, hub requests/outbox and monthly
   reference counters. Do not copy public customer data into development.
5. Install the same finite approved pricing/ceiling/end date with admission
   disabled on the public target. Carry the final reserved amount forward
   monotonically using the existing schema's protected counter. Assert exact
   policy equality and no decrease. Keep development paused: two databases must
   never expose two usable copies of one monthly allowance. Do not refund an
   ambiguous attempt or create a fresh zero counter as a deployment shortcut.
6. Create only the dedicated restricted public monitor and aggregate-reader
   roles, verify grants and install them directly in their matching secret
   stores. No owner/application fallback for monitoring, no plaintext credential
   exports. Install exact-source native bundles disabled; verify the real Neon
   edge rejects anonymous and forged trigger headers before enabling work.
   Native mail stays false with cap0; routine delivery uses the independently
   hosted finite policy and its preserved lifetime attempts.
7. Prepare the closed public web candidate with the public application DSN,
   exact provider/model pair and `AI_BUDGET_AUTHORIZATION_ID`. Preserve existing
   client-hub secrets, Turnstile/CORS, queue consumer and daily cleanup. Check
   paused/expired/exhausted admission without paid inference or new real mail
   outside its explicit finite test envelope. Keep original public data in place.
8. Pause the external observer before its target changes and preserve its disk,
   old immutable policy/journal and all used attempts. A public-target policy
   needs explicit matching authority and at most the remaining routine attempts;
   it cannot refill the completed test or routine policy. Verify the public
   reader, exact target, healthy native/retention observations and independent
   heartbeat. The existing approval ends December 1 at midnight Puerto Rico;
   reminders remain off. Restore/record the finite external schedule.
9. After gates and approval, promote the exact verified release, admit only the
   public budget row and keep the old/development admission closed. Observe
   scheduled success, cumulative usage and faults; preserve the old public
   deployment for source custody. Shopify publication is a separate Jose action.

Rollback closes model admission first. Do not restore an unguarded older public
binary with model access open, reverse immutable counters/migrations, reuse the
old allowance concurrently, restore a stale journal or interrupt hub retention.
Keep the compatible reviewed guarded source closed until the issue is resolved.

## Other release checks

- **Real stopped-job drills:** existing native freshness is 90 minutes and daily
  retention freshness is 26 hours. No historical timestamp is rewritten and no
  threshold is shortened. Current schedules remain enabled and healthy. A real
  stopped-retention drill requires a reviewed long-running window, restoration
  custody and notification authority; its result is not inferred from SQL tests.
- **Client-hub lost-response receipt:** use one explicitly approved synthetic
  request on unpublished acceptance theme `193374224698`, only to
  `support@thevelani.com`, with at most two real emails. Capture the first raw
  Idempotency-Key privately; let the service commit and return 201, then discard
  only that browser response. Retry the unchanged request/key and require 200
  with the same reference; inspect exactly one request, two outbox jobs and one
  provider attempt each. Restore preview submissions false and verify the exact
  theme file readback. The earlier two-request/four-email acceptance is consumed;
  no additional real mail is authorized by this document. Final publication is
  Jose's action. Production is not a disposable database fixture.
- **Admin:** source b18e8c1 remains accepted (158/158; new public Actions attempt
  2 passed). Source changes since worker c528949 are CI/test/docs only. Production
  `velani-admin` is paused, app/writes false; production function/trigger
  inventories are empty. The accepted production activation/rollback packet
  remains applicable. Real monitoring delivery, hosting and Jose's production
  Google/two-passkey enrollment still precede activation approval.
- **Tax:** accountant review remains unresolved. Collection stays off.

Provider/source verification and RED/GREEN logs are retained in
`/Users/josek0514/.codex/visualizations/2026/11/13/01a1d5d4-5741-7e93-ab62-b7705c0e403b/release-completion/`.
