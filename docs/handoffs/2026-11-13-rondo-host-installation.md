# Rondo independent host installation

Prepared for Jose's November 13 request to complete SCRUM-155 and integrate
development. Codex owns backend/hosting; Claude owns UI. Development remains
the primary operating and acceptance line at production standards. No main,
public Shopify or legacy public Rondo promotion is part of this packet.

## Installed development database preparation

Fresh owning-service readback identified wild-leaf-57992989 /
br-snowy-brook-bcc6b3zm / velani_rondo_development. Additive migration 009 from
accepted development 66d7d5ac75af5f7607e5f1144ec12463da2c70f9 is now applied
under the migration advisory lock. Its immutable source checksum is
6beffbe703dffa3c65a855b835a4aad83cca66dc24fd3cc7eafaa836b3d3d1b2.

Dedicated `velani_rondo_dev_watchdog` exists with NOLOGIN, NOINHERIT, no
memberships/elevated flags, no schema CREATE and zero effective privileges on
private tables. It has database CONNECT, public schema USAGE and SELECT only
on rondo_retention_status, rondo_budget_status and rondo_monitor_status. It has
no password and is not yet a usable external credential. A SET LOCAL ROLE
probe by the application schema owner was refused (42501); no impersonation
grant was added to manufacture a passing authenticated-reader result.

At 13:45:38 UTC, cumulative AI reservations remained 2,670,150 microUSD of the
existing 10,000,000 approval, expiring December 1 at 04:00 UTC. Native observation
was healthy at 13:21:27 UTC; scheduled retention was fresh and overdue session/
lead counts were zero. These are aggregate readbacks, not a failure drill.

## Reviewable host proposal

[The Blueprint](../../services/velani-ai/render-watchdog.yaml) defines one new
Render background worker named velani-rondo-development-watchdog in Virginia,
0.5c-512mb, one 1-GB persistent disk at /var/data, no inbound web service,
automatic deploys off, explicit Node 24.19.0 and a disabled initial state.
No existing NEVORA service is repurposed. The observer and durable journal
remain those already accepted on development; the new host wrapper invokes
them every 15 minutes without overlapping ticks or automatically recreating
state. Its configured source must match Render's actual Git commit.

Current official list estimate: compute USD7/month + disk USD0.25/month =
USD7.25/month before taxes/extra bandwidth or other account charges. Proposed
approval ceiling: USD8/month additional, still subject to aggregate headroom.
The pre-existing USD10/month Rondo model allowance is separate and unchanged.
No paid resource or Blueprint sync has been created by this preparation.
[Compute/storage pricing](https://render.com/pricing.md),
[disk persistence](https://render.com/docs/disks).

An independent owner-controlled Healthchecks.io check is proposed for completion
and silence detection: 900-second period, 900-second grace, POST-only, no
repeating reminders, initially paused. Its free plan currently supports 20 jobs;
account existence, ownership and alert integration remain unverified.
[Current account limits](https://healthchecks.io/pricing/).

The wrapper accepts only a canonical HTTPS UUID ping URL, sends an empty POST
and never prints the URL/exception body. Healthy is reported only after an
armed healthy observation. An unhealthy/unarmed result reports failure;
configuration/journal/observation or receiver failure closes the process.
Observations have a 30-second deadline; heartbeat transport has a two-second
deadline and no automatic retry of unknown outcomes. A finite independently
approved heartbeat expiry is required; expiration stops further work. This
alone does not pause the external check: the operator must pause it before
closing the authorized monitoring window to avoid a deliberate false alarm.
No HTTP 2xx is described as actual inbox delivery or responder acceptance.

## Installation after the explicit host and notification decision

1. Confirm Render workspace tea-dbmr3t6c6qcc73cbf0jg (Jose's workspace), the
   additional budget and account ownership. Apply only the reviewed Blueprint
   path after exact candidate and development Actions pass. Confirm the deployed
   commit and disk; initial RONDO_WATCHDOG_ENABLED remains false.
2. Prepare the owner-controlled independent check and approved recipient/expiry/
   attempt policy. Keep it paused during provisioning. The original two native
   mail attempts remain consumed and are never reinitialized as a new allowance.
3. Generate a new dedicated reader password directly into the new runner's secret
   store and only then enable LOGIN for velani_rondo_dev_watchdog. Supply its
   exact direct verify-full DSN. Never use the schema owner, application or native
   monitor DSN, and do not print/copy credentials into this document or chat.
4. From the running worker's shell, run the existing watchdog:initialize exactly
   once for /var/data/rondo-watchdog with the reviewed immutable policy. Keep
   directory0700/files0600. Restart/deploy must preserve this directory. Never
   initialize over missing old custody or steal locks by age/PID.
5. Set the exact qualified source SHA, dedicated ping URL, finite heartbeat
   expiry and reference in the worker's private store. Install any separately
   approved native alert policy with its genuine remaining cap. The supplied
   policy remains mail=false/cap0; unarmed operation cannot qualify coverage.
6. After configuration and state proof, enable the wrapper and resume only its
   external check. Observe actual aggregate sampling, persisted journal and
   independent heartbeat receipt. Verify restart/deploy preserves journal and
   cumulative attempts. Do not reset the AI budget or activate another model.
7. Execute only the explicitly approved outage/recovery and missing-heartbeat
   drills, with a finite real-message envelope. Keep database/native-monitor/
   retention/runner failures distinct. Record exact affected target, reversible
   fault/restore, source, provider message IDs, dates and delivery closure.
   Stop/restore on unexpected data or budget changes.
8. Jose and Ilianis must actually confirm their access, acknowledge the allowed
   notices and perform the response drill. Assignment or synthetic replies do
   not satisfy this gate. Ilianis's access/acknowledgment cannot be invented.

## Rollback and evidence

Disable the wrapper and pause its corresponding external check together;
suspend only the new dedicated worker if costs must stop. Keep its disk and
journal/counters for custody. Preserve the original native schedules, retention,
budget and public runtime. Leave the new reader NOLOGIN when not installed.
Migration 009 is additive/read-only; no destructive down migration is required.
If a lock remains after a deadline/crash, retain it and prove old process
termination before an operator recovers custody. Never turn an unresolved
delivery into a free attempt.

Local host controls: nine no-network tests passed, including disabled startup,
source/URL/approval refusal, finite expiry, hung observation/receiver, unarmed
failure and private errors. Types/build, website100/100 and theme checks passed.
The Blueprint passed the current official JSON Schema. Full SQL/backend Actions
and actual development Actions must be read back on the final source; installed
host, external credential authentication, provider alert delivery and human
drills remain distinct pending evidence. Governance release impact: CONDITION
for source delivery; BLOCKER for claims of continuous operating coverage.
