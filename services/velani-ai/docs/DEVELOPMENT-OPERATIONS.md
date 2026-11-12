# Rondo development operations

Development is Jose's primary operating and acceptance release (November 12,
2026). Codex owns backend/hosting; Claude owns UI. Main/public production
promotion requires Jose's approval of the exact verified release.

## Source and isolation

`npm run build:operations -- /new/absolute/output` bundles the committed backend
into two Node 24 ZIPs and records source, lockfile, input and output hashes. It
refuses tracked backend drift or new uncommitted implementation files. Deploy
only the recorded ZIPs to `rondodevmonitor` and `rondodevretention`, in project
`wild-leaf-57992989`, branch `br-snowy-brook-bcc6b3zm`.

Both handlers are closed until the compiled source, explicit source/branch
configuration and platform-injected branch match. Default injected database,
storage and gateway credentials must be overridden with inert values listed in
`src/neon-operations.ts`. Install no scoped secrets until the real native edge
rejects anonymous and forged-trigger-header requests. Parser unit tests alone
do not establish this boundary.

Use only `velani_rondo_development` on the verified direct endpoint. The app role
is `velani_rondo_dev_app`; the monitor role is `velani_rondo_dev_monitor`. The
monitor can read aggregate views and maintain its incident journal, without
reading conversations, enquiries, client-hub data or changing budget counters.
Session advisory locks require a direct connection, never transaction pooling.
Migrations and reviewed public knowledge are installed administratively; no
production credentials or customer records are copied.

## Budget

Jose approved USD 10 per calendar month in America/Puerto_Rico. The first
prospective policy is `ops/development-budget-2026-11.json`, expiring December 1
at 04:00 UTC. This does not retroactively account for earlier public-runtime
usage. One immutable authorization/counter must cover chat and plans. Preserve
all reservations, including unknown/failed outcomes. The conservative text
request estimate is an admission bound under reviewed model/rate assumptions,
not a provider invoice or account-wide spending limit. No credit purchase or
auto-reload change is authorized. Requalify model/rates before a new month's
finite policy. Before public promotion, pause/drain development and carry its
reserved usage forward; never duplicate the same monthly allowance.

## Schedules and incident notices

Initial deployment is disabled. Native schedule names are
`rondo-development-retention` and `rondo-development-monitor`, targeting `/run`.
Qualify genuine scheduled invocation and aggregate readback before enabling the
reviewed daily retention/hourly observation cadence. Manual retention is not
evidence of a scheduler. The original public service remains a separate scope.

Real email defaults off, with total allowed attempts zero. Activation requires
an approved recipient, explicit finite test scope and a newly scoped sending
credential. The fixed Resend adapter sends no conversation/customer content.
The durable journal records intent before submission, uses one idempotency key
per notice and never retries an ambiguous provider outcome. A configured total
attempt ceiling survives restarts. Provider submission is not proof of inbox
delivery or a responder's acknowledgement.

The journal shares the database being observed. Database unavailability can
prevent both journaling and email; a 503/console event is not an external alarm.
Independent monitor-of-monitor coverage, actual delivery/response acceptance
and named backup coverage remain explicit operating gates.

## Responder custody — November 12 update

Jose Natal is the primary responder. Jose supplied his own name in the
consolidated finisher chat (`01a1d175-7de0-7a80-b607-5418fde6ed50`) when asked for
primary and backup ownership. No backup was named. This records the assignment;
it does not establish an alert acknowledgment, response drill or continuous
coverage. See the [remaining operating handoff](../../../docs/handoffs/2026-11-12-rondo-responder-closeout.md).

## Pause and rollback

Disable both native triggers and set `RONDO_OPERATIONS_ENABLED=false` before
changing credentials/source. Set alert mail false and total attempts zero. Pause
the budget authorization administratively; never reset its counter. Preserve
incident/usage evidence. The new protected Vercel project has no Git auto-deploy
or public alias; pause its development runtime before source rollback. Revert
source through development, without main changes or undoing immutable usage.

Runtime installation and observed acceptance belong in the dated handoff; this
runbook describes the implementation and does not claim deployment.
