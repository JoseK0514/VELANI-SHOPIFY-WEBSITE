# SCRUM-155 development delivery and operating limits

## November12,18:35UTC — current evidence supersedes dated sections below

Jose approved USD10 per calendar month in America/Puerto_Rico, followed by
exactly two real Rondo test alerts to support@thevelani.com. Development is the
primary operating/acceptance release; Codex owns backend/hosting and Claude owns
UI. Main/public production promotion requires approval of the exact combined
verified release. Synthetic data and environment labels remain explicit.

Backend source78cdae299457af6b79bb105878f3fb52bfc70f79 is pushed to development.
The final backend suite passes247/247 in25files, no pending/skipped cases;
typecheck/build pass and the production dependency audit reports0vulnerabilities.
The added monitor regression reproduced a false near-limit warning on an unused
$10policy. Status now warns at80% reserved or insufficient approved output
headroom; actual request admission still uses its conservative input/output
envelope and refuses unaffordable calls. Earlier source-specific evidence and
Fastify deprecation warnings are retained below/in the evidence directory.

### Installed and actually tested

- New protected Vercel project `velani-rondo-development`,
  prj_T9x5XwRzCkLSUy2wYk36nz8C3k9B; READY **Preview target** (API targetnull)
  dpl_2ev5SpkzzbSDvH2xRaHbHcSVoCft, exact78cdae2, Node24.x.
  [Protected development Preview](https://velani-rondo-development-1lfrwbpo0-josekarlo-5933s-projects.vercel.app).
  SSOALL, no Git connection/auto-deploy. Generated Preview aliases remain
  SSO-protected; no custom domain/public production promotion occurred. Anonymous config
  returns302 to Vercel authentication. CLI's temporary automation bypass was
  removed and readback confirmed zero bypass entries, with SSOALL unchanged.
- Fresh database `velani_rondo_development` in existing Neon project
  wild-leaf-57992989/branchbr-snowy-brook-bcc6b3zm. Eight source/checksum-tracked
  migrations and16 reviewed public knowledge entries installed; no customer data
  or production credentials copied. New app and monitor roles have no admin
  flags or inherited memberships. Actual monitor-role readback proves private
  base-table/budget writes denied; only aggregate views and its operational
  journal are granted. Gateway credential is branch-scoped invoke-only.
- The installed immutable policy686083cd-535e-422d-b027-9293601fe98c has
  limit10000000microUSD, valid prospectively from November12 through
  December1,04:00UTC. Chat/plans share it. Actual guard reservations total
  2670150microUSD ($2.67015), including two synthetic hosted chat attempts;
  provider invoice charges are not established. Saved-answer replay returned
  identical answers. Sessions were deleted through the API (204). A paused
  policy returned503/provider_unavailable with **unchanged** reserved counter;
  the private error is intentionally mapped by the model adapter. The test
  harness initially expected the private error code; its corrected final
  receipt records the public contract. The allowance is enabled again and no
  counter was reset. No credits were bought or auto-reload changed.
- Native Node24 functions `rondodevretention` version3 and `rondodevmonitor`
  version6 run the source78cdae2 ZIPs recorded in the build manifest. Before
  scoped secrets were installed, actual native URLs denied both anonymous and
  forged scheduler-header requests (401). Ambient owner/database/storage/model
  capabilities are explicitly overridden with inert values. Scoped direct
  connections bind exact host/database/role and verify TLS.
- Genuine native retention ran at18:30:20UTC and subsequent queued ticks; the
  latest aggregate heartbeat is18:33:35.568675UTC, zero overdue sessions/leads,
  16 published/zero expired knowledge documents. The monitor recorded outage and
  recovery. Final cadences: retention15:00UTC daily; monitor minute15 hourly.
  A disabled trigger can still have already queued invocations; locks prevent
  overlapping work. These observations cover the new development database.
- Exactly two durable mail attempts were submitted, with stable idempotency
  keys. Resend independently reports both **delivered** to the approved address:
  outage01a1d103-28de-77c2-9515-f2461bf30043 at18:26:47UTC and
  recovery01a1d105-c816-7c33-9dba-7afb73470981 at18:29:39UTC. Fixed messages contain
  no customer/conversation data. Sending was then disabled, total attempt limit
  set0, and sending key/recipient/approval variables removed from active native
  version6. The newly created domain-scoped test key still exists unused in
  Resend; irreversible provider-key deletion was not separately approved.

The first new-project Vercel request used the wrong REST target value `preview`;
Vercel assigned production. That deployment dpl_HbY1sZ5JzceQw8hCpeUkmSdqB4n2
was **CANCELED** before READY, carried no production-target application secrets,
and had no assigned alias. The corrected REST request omitted target and the
actual readback verifies Preview/null. The existing public project was not
modified; no main merge or public production promotion occurred.

### Remaining operating decisions and limits

Keep the overall issue open until its complete operating acceptance is agreed.
The $10guard is active on this **development** runtime. It does not retroactively
meter the earlier public runtime or enforce a provider-account-wide cap. Public
Rondo remains the old separate deployment; its promotion is a Jose gate.
Before any promotion, pause/drain development and carry reserved usage forward,
so two environments never receive duplicate monthly allowances.

The approval is recurring $10/month, but each implemented authorization is
finite: next month's selected model/rates must be requalified and a fresh
calendar-month row installed under that standing ceiling. Missing renewal
fails closed. No automatic credit purchase or allowance increase is authorized.

The monitor journal shares the observed database: database unavailability can
prevent its journal and mail. Independent monitor-of-monitor coverage, named
primary/backup ownership, actual responder acknowledgement and combined Claude
UI acceptance remain open. Provider delivery is not human acknowledgement.
This test grants no ongoing mail activation. Browser-wide earlier Relay/no-JS
findings are not closed by backend acceptance. SCRUM-156 governs other data
categories, retained copies, backup and knowledge-review policy; this is not a
claim that every retention/recovery category is finished.

See [development operations](../../services/velani-ai/docs/DEVELOPMENT-OPERATIONS.md)
and the [credential-free evidence](scrum155-evidence-20261112/), including the
operations qualification, ZIP manifest, hosted API/pause and provider receipts.

---

## Preserved earlier source-only snapshot — superseded above

November12,2026. Jose requested completion of Codex's part of SCRUM-146 and155.
This receipt covers155 in the separate Velani website repository.146 belongs to
NEVORA and its existing active operations chat; it is not completed by a Rondo
cron or this cost-control change.

## Source and completed engineering

Base development:d21e5b5c1c73fefe722f4379de1b81c01fc5dca7.
First finite-budget implementation:68ffad38452f92c9474056127bb9710ef968c585.
Qualified final request-envelope implementation:
5e2e0b13bd4d32c7bd0019ef88dff45a99d66ee1.
The following receipt commit changes documentation/evidence only.

Chat and workflow-plan calls now require a committed, finite PostgreSQL dollar
reservation. The same immutable approval and increasing counter cover concurrent
instances, restarts, both model paths and failed/unknown attempts. Missing,
expired, paused, exhausted, malformed or mismatched configuration stops dispatch.
The restricted application role cannot install, delete, extend, increase or reset
an approval. The source deliberately creates no approval or budget automatically.

The actual text-only request is checked before accounting. UTF8 bytes and padded
message framing provide a conservative token envelope, capped at the verified
provider input ceiling; approved maximum rates and the requested output/reasoning
allowance determine the reservation. Extra modalities, tools, fields and message
shapes are rejected. This is an admission estimate with stated tokenizer/protocol/
pricing assumptions; it is not provider invoice metering or an account-wide cap.

An operator command produces an offline proposal by default. Applying an approval
or pause requires an explicit unpooled owner credential and exact expected
host/database; no application-credential fallback, automatic renewal or usage
reset is provided. The aggregate operations command now includes budget status
alongside retention/knowledge alerts and exits nonzero on attention/unavailable.
It does not send messages or substitute an operator check for a scheduled run.

See the [rollout, ownership, monitoring and rollback runbook](../../services/velani-ai/docs/AI-BUDGET-OPERATIONS.md).

## Actual verification and retained failures

- Backend:233 tests pass in23 files, zero failures/pending/skips, with a new
  loopback-only PostgreSQL17/pgvector fixture and synthetic provider responses.
  These include real SDK/API request paths and acknowledged-commit ordering.
- Fresh source typecheck and build pass. The dependency audit reports zero
  vulnerabilities. Scoped staged secret scans report zero findings.
- Website:80 tests pass/zero skips, including its37-route build. No UI/source/
  theme file was changed. Existing Relay-anchor and no-JS mobile navigation
  findings from the earlier broad browser suite remain open; they were not
  rerun or relabelled passed by this backend-only change.
- Observed RED→GREEN:both engines previously dispatched despite denied admission;
  the real runtime API still needed wiring; malformed pricing could appear
  healthy; and a real PostgreSQL row-lock wait could outlive approval but still
  admit a call. The actual counter mutation now rechecks expiry. Additional
  regressions cover UTF8/rounding, shared chat/plan cost, denial at an exact cap,
  restricted-role grants, saved-answer replay, lost COMMIT acknowledgement,
  cancellation before dispatch, pause, expiry and insufficient headroom alerts.
- Short requests originally over-reserved the entire model input ceiling. The
  final source uses the reviewed padded text envelope; fixed literal byte/cost
  regressions failed before that refinement and pass afterward.

The [evidence directory](scrum155-evidence-20261112/) retains both the earlier
231-test source68 candidate and final233-test source5e2 qualification, file
hashes, provider readback and secret-scan receipts. Existing Fastify FSTDEP023
warnings remain visible; they are not test failures or suppressed output.
No new independent certification, hosted paid-inference acceptance or actual
alert-delivery/coverage test is claimed.

## Fresh read-only runtime facts

At16:56UTC, the existing Velani database reports scheduler completion
15:45:43.570UTC, zero overdue conversations/leads,16 published knowledge entries
and zero expired entries. This independently reconfirms the already observed
automatic retention run; no purge was invoked by this task. Provider project
metadata confirms86400 seconds of restore history. Other retained copies and
enquiry/client-hub/workforce categories remain distinct under SCRUM-156.

The running database has no ai_budget_authorizations table. The new migration,
allowance and guard have **not** been applied to the hosted service. Existing
Vercel production remains READY dpl_2yjDbRBcm8vc6ujPm1mqz34qLRhT; automatic Git
deployments are disabled, production branch main. Publishing development is
source delivery, not a new runtime deployment or operating acceptance.

The live public model catalog now includes tiered context/cache rates. Old
evaluation prices and an organization notification/reload setting cannot stand
in for an approved Rondo allowance. No inference, credit purchase, model change,
reload, credential rotation, real alert/email/push or production mutation occurred.

## Exact remaining Codex operating work

Keep SCRUM-155 In Progress. The implementation and owned qualification above are
complete; the operational issue is not.

1. Jose supplies the USD amount and finite period for Rondo. Prepare the exact
   policy from fresh selected-branch/model pricing and its verified context/
   framing assumptions. No amount or automatic renewal is inferred.
2. Select and verify the development-only database/runtime target and existing
   restore/credential custody. Apply the empty migration, operator-approved
   allowance and exact-source development deployment. Do not copy production
   credentials/customer data or promote main/public production.
3. Install the read-only status/failure checks on the approved independent
   monitor, with named primary/backup and an exact finite alert recipient/test
   scope. Observe failure/recovery, delivery and response evidence; a CLI exit
   or log is not a delivered/acknowledged alert. The existing cron alone cannot
   detect that it stopped running.
4. Recheck actual hosted admission, expired/paused/exhausted behavior and rollback
   on synthetic data, using no paid inference or real messages without their
   explicit budget/test scope. Preserve uncertain reservations and earlier
   source/receipts. Close the issue only when those operating gates are evidenced.

Jose's November12 policy remains in force:development is the primary operating
and acceptance release; Codex owns backend/hosting and Claude owns UI. Apply
production standards there, verify the combined release and promote only its
exact source to main/production after Jose approves. Preserve synthetic-versus-
real data and target names, existing budgets and every control.
