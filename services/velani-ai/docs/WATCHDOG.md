# Independent Rondo watchdog

The native monitor stores its journal in the database it observes. The external
watchdog reads aggregates but keeps incident state, notification claims and its
lifetime attempt counter in a private directory on a different host. Database
unavailability can therefore produce an alert without a database write.

This source increment does not activate a host, scheduler or message allowance.
The two earlier native alert attempts remain consumed. The supplied policy is
explicitly unarmed: mail false, maximum attempts zero. Its identifier/reference
does not grant a new allowance or reset the AI budget. Production promotion and
Ilianis's actual access/acknowledgment remain separate acceptance steps.

## Reader and exact target

Apply additive migration009 through the existing approved migration process.
Create `velani_rondo_dev_watchdog` with no elevated flags, role memberships,
database/schema ownership or private base-table access. Grant only CONNECT,
schema USAGE and SELECT on these views:

```sql
GRANT SELECT ON rondo_retention_status, rondo_budget_status,
  rondo_monitor_status TO velani_rondo_dev_watchdog;
```

Supply its direct, verify-full TLS URL through the selected host's secret store
as `RONDO_WATCHDOG_DATABASE_URL`. The CLI accepts only the existing development
database and endpoint; it never falls back to DATABASE_URL or an application,
native-monitor or owner principal. Every observation verifies the actual database,
session principal, dangerous flags/memberships, schema privileges and private
table permissions inside a bounded READ ONLY transaction. A mismatched or
overprivileged reader reports unavailable. No runtime grant is changed by a probe.

Set `RONDO_WATCHDOG_BUDGET_AUTHORIZATION_ID` to the exact approved monthly
authorization. Reads preserve all reservations. A stopped/future-dated native
monitor heartbeat, stale scheduled retention, expired knowledge or unavailable,
paused/expired/exhausted budget is not healthy. Native monitor freshness allows
90 minutes for the existing hourly cadence; retention retains its26-hour bound.
Operator runs never replace scheduler execution evidence.

A fresh native heartbeat whose recorded state is attention also remains an
attention result. The reader refuses base-table/sequence privileges, write
privileges on views and SELECT on other application views, including accidental
journal access; the approved schema is checked at runtime.

```sh
npm run watchdog:check
```

## Independent journal

Use Node24 on a verified Linux host and a persistent private filesystem outside
Neon. Configure `RONDO_WATCHDOG_STATE_DIR` to a new absolute path and
`RONDO_WATCHDOG_POLICY_FILE` to the reviewed finite policy. Initialize explicitly
once with `npm run watchdog:initialize`; the observer never initializes or
recreates a missing journal. Keep the directory0700 and files0600, with backups
under the same custody. Do not recreate state when deploying another source.

Set `RONDO_WATCHDOG_SOURCE_SHA` to the exact qualified commit and
`RONDO_ALERT_MAIL_ENABLED=false` for the supplied unarmed policy. Run
`npm run watchdog:observe` from the approved external scheduler. State is locked
across sampling and delivery. Claims and their counter are atomically written
and fsynced before a request. Repeated unhealthy samples do not resend an outage;
recovery requires an attempted outage. Unknown delivery remains consumed across
process/source changes. New incidents do not refill the finite allowance.

The immutable policy binds the exact recipient as well as target, cap and
expiry. A new explicit allowance uses a new policy/journal with the old records
preserved and the old runner stopped. A source update alone never changes that
policy or counter. Observe reports delivery disabled, capped or approval inactive
as a nonzero result even when the application probe is healthy; check is only a
read-only health probe and does not certify active alert coverage.

An unexplained lock is never stolen using elapsed time or a reused PID. Stop the
runner, prove process/filesystem custody and preserve the journal before an
operator recovers a crash lock. A corrupt/public/linked/missing journal fails
closed. Journal loss cannot automatically manufacture a new attempt allowance.

## Activation and failure drill

Before enabling an ongoing timer or any mail, record the exact qualified source,
approved host/cadence, persistent-state custody and rollback, and new explicit
recipient/attempt/expiry authority. The existing two-message approval does not
authorize additional notices. `RONDO_ALERT_API_KEY`, recipient and approval ref
belong only in that independent runner's secret/configuration store. Policy and
mail-enabled flags must agree. Reuse the existing fixed, private-data-free
notifier; do not send from this application to manufacture responder evidence.

Configure an independently hosted dead-man service for the runner's expected
completion. This is required: this process cannot detect its own disappearance.
Record that service's target, cadence/grace and separate alert authority; neither
an Actions test nor the native database heartbeat proves it is installed.

Then exercise one approved database/connection outage and recovery, stopped
native monitor, stopped retention and missing external-runner heartbeat. Retain
actual provider receipts and sending closure. Jose and Ilianis must independently
confirm access, acknowledge the permitted notices and perform the response drill.
Synthetic HTTP acknowledgments and CI passes do not establish those human or
hosted outcomes. Leave sending disabled/cap0 when no new finite approval exists.

Public rollout must pause/drain the old and protected runtimes, preserve the
monthly authorization and cumulative reservations, verify a single active
allowance, and retain a closed rollback. This development watchdog never
retroactively meters legacy public Rondo. Main/public activation needs the exact
accepted source and existing production authorization gates.
