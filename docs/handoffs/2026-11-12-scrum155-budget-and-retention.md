# SCRUM-155 development implementation and remaining operating gate

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
