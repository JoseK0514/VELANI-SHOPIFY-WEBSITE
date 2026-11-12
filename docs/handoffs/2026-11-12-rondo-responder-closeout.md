# Rondo responder and remaining operating handoff

November 12, 2026. SCRUM-155 remains In Progress. This documentation update
starts from Velani development `4960e606d4ea563002c2d5f511400484b7b4ce20`.
The retained runtime and source receipts are in the
[budget and retention handoff](2026-11-12-scrum155-budget-and-retention.md).
No runtime or provider was changed for this update.

## Recorded ownership

Primary responder: **Jose Natal**. Jose answered "Jose Natal (me)" in the
consolidated finishing chat `01a1d175-7de0-7a80-b607-5418fde6ed50`, replying to the
question asking for primary and backup responders. Backup: **unassigned**.
Self-identification establishes primary assignment; it is not evidence of
receiving an incident alert, accepting a response target or completing a drill.

Development remains the primary operating/acceptance release, with production
standards. Codex owns backend/hosting and Claude owns UI. Promote only the exact
verified combined release to main/public production after Jose approves.

## Independent coverage that still needs an approved destination

The hourly native monitor and its journal share the observed development
database. A database outage can prevent both the journal and its email path.
The existing read-only `operations:check` command runs outside that database
and exits nonzero on attention or unavailable, but no independent scheduled
runner and alert destination have been installed or verified. The command also
checks the retention scheduler, knowledge and budget; it does not independently
prove freshness of the hourly monitor itself.

The concrete installation must therefore provide all of these before coverage
can be accepted:

1. An independently hosted runner using a dedicated least-privilege connection
   to the explicit development target. No owner/application credential fallback.
2. Bounded timeout handling for unreachable database or native provider, plus
   freshness checks for both the hourly monitor and daily retention completion.
   Runner disappearance must also be detected by a separate expected heartbeat.
3. An explicitly approved alert destination and attempt budget, backed by the
   independent runner rather than the unavailable database. Persist ambiguous
   delivery outcomes and avoid retrying a notice into duplicate delivery.
4. A finite synthetic failure/recovery test, provider delivery receipt and actual
   primary/backup acknowledgment, followed by verified sending closure when
   the finite test allowance is consumed.

No existing paid monitoring entitlement or authenticated integration is inferred.
No new subscription, CI schedule, always-on mail activation or additional real
email is authorized by this handoff. The two previously approved support test
messages were already delivered and their allowance is consumed; mail remains
disabled/attempt limit0. Do not rerun them to manufacture acknowledgment.

## Remaining joined acceptance

Claude's UI, independent outage/monitor heartbeat coverage, named backup and
actual responder acknowledgment remain open. The recurring USD10/month
approval still uses finite calendar-month authorization rows and preserves all
reservations. No extra model call, budget reset, key deletion, schedule change,
Shopify publication, main merge or public deployment occurred here.

Validation for this change: read-only source/runbook inspection, exact response
record, relative-link checks and `git diff --check`. No application test or
hosted verification is claimed for a documentation-only update. The original
checkout and its five untracked evidence directories are preserved; this update
uses a separate detached worktree.
