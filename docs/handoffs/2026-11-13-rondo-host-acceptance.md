# Rondo installed development watchdog — November 13, 2026

Codex owns backend/hosting; Claude owns UI. Development is Jose's primary
operating and acceptance release, with production standards. This receipt does
not promote main, Shopify, the legacy public Rondo runtime or production.

## Qualified source and installed host

Runtime source is `5232ea04e8ba4776bf60ec0c318327004c33f4ec`, tree
`0dc25ca8aeb758c7d3ece3371e492e2c7c83dd48`. Exact
[candidate Actions](https://github.com/JoseK0514/VELANI-SHOPIFY-WEBSITE/actions/runs/43439332557)
and [development Actions](https://github.com/JoseK0514/VELANI-SHOPIFY-WEBSITE/actions/runs/43439972439)
passed all three jobs. Downloaded artifacts independently matched all 2,424
tracked source hashes, all 30 backend test files and 285 passing assertions
(zero skips), website 100/100, and both native archives. Types/build/theme passed.
Fresh source review approved with no Important/Critical blocker; a typed observer
result remains a nonblocking follow-up. The initial Render plan rejected the
disk/shutdown combination; it was corrected before applying the Blueprint.

Jose explicitly approved up to USD8/month additional for this dedicated worker
and disk. Installed in Jose's Render workspace `tea-dbmr3t6c6qcc73cbf0jg`:

- Blueprint `exs-dbrhhb5g1s2s738h4hv0`, automatic sync off.
- Worker `srv-dbrhk456e07s73bo8gsg`,
  `velani-rondo-development-watchdog-nsaq`, Virginia, one 0.5c-512mb instance,
  automatic deploys off, no inbound web service.
- Disk `dsk-dbrhk4d6e07s73bo8h90`, 1GB mounted at `/var/data`.
- Routine deployment `dep-dbrilhbtqb8s73embbgg`, live November 13 at
  15:23:18 UTC, exact qualified runtime commit above.

Base list estimate is USD7.25/month; this is not an actual invoice. The existing
Rondo model allowance remains separate. No NEVORA service was repurposed.

Migration009 was applied to `wild-leaf-57992989` /
`br-snowy-brook-bcc6b3zm` / `velani_rondo_development` under its advisory lock;
checksum `6beffbe703dffa3c65a855b835a4aad83cca66dc24fd3cc7eafaa836b3d3d1b2`.
The dedicated `velani_rondo_dev_watchdog` credential is installed only in the
dedicated Render secret store. Actual hosted authentication succeeded. Its role
has CONNECT/USAGE and SELECT on three aggregate views, without private-table
access, schema CREATE, elevated flags or memberships. No application/native
monitor/schema-owner credential was reused. Secrets and ping identifiers are
excluded from this receipt.

## Actual completed test window

Jose authorized eight new test-alert emails in one 48-hour window. Immutable
policy `d4e47776-86b2-4788-a739-ee9d0edb2360` runs from November 13,
14:22:04.940 UTC to November 15, 14:22:04.940 UTC. Observer subcap6 and
independent-heartbeat reservation2 preserved that total. The original two
native attempts remain consumed separately.

Four new test emails were used, and Jose explicitly received/reviewed all four:

| Fault and recovery | Actual evidence |
| --- | --- |
| Restricted reader connection unavailable | Temporarily set NOLOGIN only on the new observer role; durable unavailable/submitted result. Resend `01a1d54c-8dc1-784e-a7fd-1115c38c8ac0`, November 13 at 14:25:26 UTC, delivered. |
| Restricted reader restored | LOGIN restored immediately; healthy/submitted result. Resend `01a1d54c-f05f-7b7e-9dca-0a33dd0a2442`, 14:25:51 UTC, delivered. |
| Watchdog worker stopped | Real hosted POST recorded up at 15:05:50 UTC. Suspended only the dedicated worker at 15:07:07 UTC. Healthchecks independently recorded down and sent the approved inbox its outage email at 15:07 UTC. |
| Same worker resumed | Resumed at 15:08:30 UTC; deployment `dep-dbrifrlckfvc73ech730` reached live at 15:10:52 UTC. The actual daemon reported healthy and POSTed at 15:10:53 UTC; Healthchecks recorded down-to-up. Jose confirmed both independent DOWN/UP emails arrived and were reviewed. |

The missed-run drill used a temporary 60-second period/60-second grace. Normal
15-minute timing was restored after recovery. Reports and repeating reminders
were disabled. Healthchecks' event-log filter shows downtime alerts; absence of
an UP email in that filtered log is not proof that no recovery mail was sent.
The integration had both down/up enabled and reported its latest notification
delivered; Jose supplied the independent inbox receipt.

The observer journal survived actual suspension/redeployment: state `ok`,
used2/cap6, unchanged outage/recovery provider IDs and policy ID. Two additional
observer processes also left used2 unchanged. The original unarmed journal is
retained, directory0700/file0600. No policy, incident or cumulative count was
reinitialized. The test check was paused at 15:15 UTC; test sending was then
disabled in live deployment `dep-dbrij6lg1s2s738jvqa0` before routine activation.
Unused test attempts do not become a renewed allowance.

## Separately approved regular operation

After the completed drill, Jose explicitly approved regular incident/recovery
email to `support@thevelani.com` through December 1, 2026 at 04:00 UTC
(midnight Puerto Rico), native cap20, reminders off, with Healthchecks
state-change alerts having no per-check email cap. This is a separate approval,
not an extension/reset of the test journal or AI budget.

Routine immutable policy `8e759da9-083e-4a7d-a55b-5bb9154ad8ed` starts
November 13 at 15:19:41.070 UTC and ends December 1 at 04:00 UTC. It was
initialized exactly once with cap20 in `/var/data/rondo-routine-8e759da9`;
policy file `/var/data/rondo-routine-8e759da9-policy.json`. The wrapper source
still matches the actual Render Git commit. Its heartbeat approval has the same
finite end; expired observation cannot continue mail or heartbeats.

The free owner-controlled Healthchecks account is signed in as the approved
inbox owner. One POST-only check ignores pings whenever paused; it was explicitly
resumed for routine operation. The current bounded OnCalendar schedule is UTC:

```text
2026-11-13..30 *:00,15,30,45:00
2026-12-01 00..03:00,15,30,45:00
```

Grace is 15 minutes. The owning service accepted this schedule and previewed
the expected quarter-hour dates. Explicit years avoid scheduling a fresh cycle
next November. Four actual boundary assertions passed in the dedicated host's
Python 3.11.2 with pinned `oncalendar==1.2` installed only into temporary QA
storage: final pings 03:30/03:45 UTC, final grace deadline 04:00 UTC, no expected
ping after that approval end and none next November. The local Mac's Python 3.9
cannot satisfy that package's >=3.11 requirement; no local parser pass is claimed.
This uses the documented
[OnCalendar schedule](https://healthchecks.io/docs/configuring_checks/),
without a broader management API credential. Reports/reminders remain off;
both actual failure and recovery notifications are enabled. No customer data
is included in heartbeat bodies or alerts.

At 15:38:22.524 UTC the actual routine daemon reported `ok`; Healthchecks recorded
its fourth POST as OK and transitioned new-to-up, with the approved inbox
integration ON. This was the scheduled tick after explicit resume, distinct from
the ignored startup ping at 15:23 UTC. Actual host readback showed source `5232ea0`,
wrapper/mail both true, cutoff December 1 at 04:00 UTC, routine state `ok`,
0 of 20 attempts used, directory0700/file0600, and the preserved test policy
still 2 of 6 attempts used. Operator
shell exited afterward. The routine and completed test journals remain separate.

## Preserved state and remaining acceptance

At 15:10:58 UTC the dedicated reader independently confirmed scheduled cleanup
completed at 15:00:02 UTC, overdue sessions/leads both zero, 16 published knowledge
entries with no expired/expiring entries, and a fresh healthy native monitor.
Cumulative AI reservation remained 2,670,150 of 10,000,000 microUSD, approval
`686083cd-535e-422d-b027-9293601fe98c`, expiring December 1 at 04:00 UTC.
No reservation reset, model purchase/renewal or original schedule change occurred.
The final dedicated-reader read at 15:40:02 UTC reconfirmed the same cleanup,
zero overdue records, unchanged budget and the next genuine healthy native
observation at 15:15:19 UTC.

Ilianis still needs to demonstrate actual access, acknowledge the notices and
perform the responder drill. Jose's receipt and named backup assignment do not
satisfy that gate. Stopping the native monitor/retention scheduler and observing
their actual age thresholds has not been performed; the reader fault above is
not a stopped database or rewritten historical heartbeat. Whole SCRUM-155 stays
open for remaining responder, combined UI and public-promotion acceptance.

Before the finite window ends, renew with Jose's actual authority or pause the
external check and disable the dedicated wrapper together. Preserve both
journals, disk, policy IDs and cumulative usage; never recreate an allowance to
recover a missing lock or unknown delivery. An exhausted native cap is not healthy
armed coverage and the independent check must still report attention. For cost
rollback, suspend only this dedicated worker and retain its disk. Use the
[installation procedure](2026-11-13-rondo-host-installation.md) and
[watchdog runbook](../../services/velani-ai/docs/WATCHDOG.md).

Private reproducible receipts live at
`/Users/josek0514/.codex/rondo-watchdog-evidence-20261113/` in
`host-progress.json`, `healthchecks-drill.json`, `drill-policy.json` and
`routine-policy.json`. Do not copy runtime secrets into those files.
