# Finite Rondo drill and closed production preparation

Jose authorized completion of public Rondo controls and the other remaining
release checks. Development is canonical; main/production alignment follows
completed acceptance. No main replacement has occurred. Codex owns backend and
hosting; Claude retains UI ownership.

## New bounded native-job pause

The original indefinite enabled flag is unsafe as the only restoration mechanism
for a long freshness drill. A new optional native-handler pause stops actual job
work and completion-heartbeat writes only inside one absolute interval. The
provider schedules remain enabled. This tests missing job completion; it does
**not** certify a literally stopped provider scheduler.

All five operator-only fields are required together:

| Variable | Constraint |
| --- | --- |
| RONDO_DRILL_PAUSE_FROM | Canonical UTC ISO timestamp with milliseconds |
| RONDO_DRILL_PAUSE_UNTIL | Later canonical UTC timestamp, at most30hours after start |
| RONDO_DRILL_ENVIRONMENT | Exact selected development/production profile |
| RONDO_DRILL_ROLE | Exact monitor/retention handler role |
| RONDO_DRILL_APPROVAL_ID | UUID referencing the actual finite approval |

Absent configuration preserves ordinary work. Partial/malformed/crossed settings
are refused. Authentication, exact trigger/source/branch, inert injected defaults
and the existing disabled flag take precedence. While paused, the handler returns
and logs `drill_paused`; it never invokes the job or produces a healthy completion.
Runtime wall-clock time controls the interval, not the delivery's scheduledAt.
At/after expiry the next eligible authentic delivery runs normally. No supervising
chat/process or new control-plane credential is needed to restore execution.
Malformed configuration remains closed and needs operator repair.

Three new tests failed RED before implementation; four new cases then passed
with the existing seven handler cases. Full owned PostgreSQL16.2/vector service
suite: **296 passed, zero skipped/failed/todo**. Types/build passed. Independent
review ran11/11 and approved the bounded implementation without blockers.
Candidate and actual-development source/artifact qualification remains required
before deploying this new code. Do not describe old hosted versions as having it.

## Approved email envelope and proposed observations

Jose explicitly approved at most **12 operational test-alert emails** to
support@thevelani.com over48hours. Conservative cutoff is
**November15,2026 at20:21:28UTC**. Approval
`4108495f-8577-4915-9be2-694fb452256c` and the reserve-before-effect ledger are
private task artifacts. Unknown outcomes consume attempts. No reminders, reused
closed allowance, automatic extension, customer mail or signup/invite mail.

The proposed development-only drill uses synthetic data and the existing real
90-minute native and26-hour retention freshness thresholds. Capture fresh actual
completion times before arming. A single continuous incident can observe native
stale, then retention stale, then native fresh while retention remains stale.
The independent observer deduplicates by unhealthy/healthy transition, so changing
fault reasons must not generate a false recovery. Native routine mail stays off;
the existing external observer and independent Healthchecks paths remain distinct.

Expected Rondo envelope: one outage/recovery pair from each external path, four
emails total, leaving eight for the two admin environments. This expectation is
**not an enforced global cap**. Check actual state, journals, remaining attempts
and receiver settings before arming; reserve each sender's effects and retain
ambiguous results. Unexpected additional test effects require stopping/replanning
within the approved total, not an implicit new allowance.

A pause end is not recovery. With the original daily15:00UTC retention cadence,
restoration may wait until the following actual scheduled cleanup. Require a
genuine completed cleanup and an independently healthy sample before claiming
recovery. Keep margin before the48-hour notification cutoff. Use only the
synthetic development data scope; do not deliberately exceed real customer-data
retention. No heartbeat history or freshness threshold is rewritten.

## Closed provider preparation already completed

- Exact prior development7fee58e production-target candidate
  `dpl_CvH7vEjaFC1E8xcvkAUy1uh4kLc9` is READY; Git source pins the full SHA,
  autoAssignCustomDomains=false. Anonymous health/live, health/ready and hub
  config each returned200. No authentication bypass, AI request or email.
  Actual `velani-ai.vercel.app` still maps to legacy
  `dpl_2yjDbRBcm8vc6ujPm1mqz34qLRhT`; staged aliasAssigned metadata alone did
  not prove public promotion.
- Production native slugs `rondoprodmonitor` and `rondoprodretention`, version1,
  are completed, exact7fee58e qualified bundles. Work/mail are false, mail cap0,
  injected privileged defaults inert and no database credential installed.
  Production triggers exist **disabled**, next_run_at=null: hourly minute15
  and daily15:00UTC. Anonymous and forged-platform-header POSTs each returned401
  at both actual Neon edges. No public migration, budget transfer or activation.
- Admin's exactb18e8c1 closed production build
  `dpl_CUvrtbhnY17Q5sBygvN3qnVUXfvG` reached READY during a44-second bounded
  provider unpause. App/writes stayedfalse, custom alias unchanged, provider
  pause restored. The initial paused-build failure and rejected redeploy attempt
  are retained. No owner enrollment or business activation.
- Admin production `adminretention` version1 is installed from the runtime-
  equivalent qualifiedc528949 bundle, with only the matching restricted
  maintenance/journal-write credentials in its production function store.
  Privileged injected defaults are inert; heartbeat absent; hourly minute17
  trigger disabled, next_run_at=null. Actual anonymous/forged POSTs both401.
  This is installed/closed, not scheduled-execution or alert-delivery acceptance.

The new finite-pause source is not installed merely because those older closed
versions exist. The original model authorization/cumulative reservation, existing
native development schedules and installed external watchdog are unchanged.
Public cutover still needs the pinned migration/budget/observer sequence in
[the cutover packet](2026-11-13-rondo-public-cutover.md). Public configuration's
legacy chat model differs from the one-model approved policy; select the exact
approved model at cutover rather than silently expanding its pricing list.

Task evidence root:
`/Users/josek0514/.codex/visualizations/2026/11/13/01a1d5d4-5741-7e93-ab62-b7705c0e403b/release-completion-next/`.
