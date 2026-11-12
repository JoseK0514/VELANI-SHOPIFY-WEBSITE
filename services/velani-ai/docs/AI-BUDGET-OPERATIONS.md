# Rondo retention and finite AI budget operations

SCRUM-155; November12,2026. Codex owns backend/hosting; Claude owns UI.
Development is the primary operating/acceptance line. Promote an exact verified
combined release to main/production only after Jose approves. This document
approves no spending, credential change, message, purge or production promotion.

## Implemented admission

Both interactive chat and plan generation use the same PostgreSQL allowance.
Every provider attempt requires an acknowledged committed reservation first.
Row locking serializes independent processes; a restart does not refill usage.
The SDK performs no automatic retries. Saved-answer replay uses the existing
request identity and does not make another provider call/reservation.

The operator installs an explicit UUID authorization with a dollar limit, exact
provider base URL, exact model IDs/prices, approval reference and finite validity
window of at most31 days. The runtime receives only its ID. Missing, invalid,
paused, future, expired or exhausted approval and accounting failures stop model
dispatch. Timeouts, refusals, invalid output, cancellation after reservation and
uncertain commits remain fully reserved. No automatic refund, reset or renewal
exists. The application role can only read the policy and increase its reserved
counter; it cannot install, delete, pause, raise or extend an authorization.

All amounts use integer microdollars:1 USD =1,000,000 microdollars. Arithmetic
uses BigInt and rounds reservations upward. For each attempt the conservative
bound is the **entire verified model input-context ceiling**, plus its requested
output allowance, at approved maximum applicable rates. Do not substitute the
usual request size, a guessed tokenizer ratio, discounted cached-input prices or
old evaluation rates. Cover context/cache/reasoning surcharges that can apply.
This is deliberately conservative: reserved usage is not the provider invoice,
and unused reservations are not released. A small allowance may not fund even
one worst-case attempt. Review that consequence before activation; do not lower
the verified context ceiling to manufacture more headroom.

This controls this application's admission at the reviewed rates/limits. It does
not cap other applications, credentials, provider-account charges, database/
hosting charges or unannounced provider pricing changes. A finite pricing window,
fresh catalog review and the existing provider account controls remain necessary.
Never clone an enabled authorization into another billing environment or restore
an old counter and continue spending. Expiry requires a new explicit decision.

## Current independent provider facts

Fresh November12 read-only metadata: project wild-leaf-57992989,
branch br-snowy-brook-bcc6b3zm, database velani_ai, named
velani-website-ai-development, region aws-us-east-1; restore history86400seconds.
The running service still has no ai_budget_authorizations table: this new control
has **not** been migrated or deployed there. Vercel production remains the earlier
runtime. Git development publication is not runtime activation.

The public [Neon catalog](https://neon.com/models.json) currently lists
gpt-6-astra with input922000/output128000/context1050000 tokens. Its base
input/output rates are $10/$50 per million; the listed context tier rises to
$20/$75, and cache-write entries reach$25. These are a dated catalog read,
not approval or proof of this deployment's selected model/servable catalog.
At input922000 and conservative input$25/output$75, the full bound is
$23.275 per3000-output chat attempt or$23.50 per6000-output plan attempt.
Recheck the selected branch, exact model, all applicable rates and context
limits at actual activation. No model inference was performed for this receipt.

The [current model reference](https://neon.com/docs/ai-gateway/models) and
[prepaid credit documentation](https://neon.com/docs/ai-gateway/prepaid-credits)
distinguish account-level limits, metered prepaid balances and automatic reload.
Their defaults do not establish this account's configured limit or a
Rondo-specific approved budget. A credit balance or notification setting is not
proof that an application has a hard dollar ceiling. No purchase, reload or
account setting was changed.

## Concrete rollout

1. Obtain Jose's USD amount and exact start/end period, the selected development
   environment and named incident responder/backup. Obtain an exact finite alert
   recipient/channel and delivery-test scope before sending any real notice.
2. Verify the source, owner database target, existing restore point and secret
   custody. Keep production/main unchanged. Apply migrations only to the
   explicitly approved development database;006 creates an empty policy table
   and restricted grants, with no budget or spending activation. Existing
   conversation cleanup remains independent of this table.
3. Prepare a private JSON file with this schema. The template below is
   intentionally invalid and cannot grant an allowance until owner choices and
   current provider facts replace every placeholder:

   {
     "id": "NEW-CANONICAL-UUID",
     "providerBaseUrl": "EXACT-REVIEWED-HTTPS-PROVIDER-BASE-URL",
     "limitMicrousd": 0,
     "validFrom": "APPROVED-UTC-START",
     "validUntil": "APPROVED-UTC-END",
     "approvedReference": "EXACT-JOSE-APPROVAL-REFERENCE",
     "models": [{
       "model": "EXACT-REVIEWED-MODEL-ID",
       "contextTokens": 0,
       "outputTokenLimit": 6000,
       "inputMicrousdPerMillion": 0,
       "outputMicrousdPerMillion": 0
     }]
   }

4. Run npm run budget:operator -- --file=/absolute/private/approval.json.
   This is an offline proposal only:applied=false,targetVerified=false. It does
   not connect to a database or buy credits. Review the worst-case per-attempt
   reservation against the approved total before applying.
5. Through the existing approved owner secret injection, supply only
   DATABASE_URL_UNPOOLED and run the same command with --apply,
   --expected-host=THE-EXACT-DIRECT-HOST and --expected-database=velani_ai.
   Hosted URLs require verify-full TLS. Pooled hosts, URL option overrides,
   mismatched targets and implicit application-credential fallback are refused.
   A repeated ID cannot overwrite usage/approval. On an uncertain failure,
   read the actual row before retrying; never manufacture a replacement allowance.
6. Set AI_BUDGET_AUTHORIZATION_ID on the selected development runtime. Deploy
   the exact reviewed source with the ordinary restricted application role.
   Recheck readiness/configuration and the authenticated request paths. The
   owned tests cover actual PostgreSQL and the SDK with a synthetic provider;
   they are not proof of hosted paid inference or provider-invoice metering.

The new runtime intentionally blocks model calls until this process is complete.
Do not silently restore the earlier uncapped behavior to make an acceptance test
pass. Client-hub email and retention entry points remain separate.

## Monitoring and failure response

Use npm run operations:check with an explicitly selected SELECT-only
RONDO_OPERATIONS_DATABASE_URL and AI_BUDGET_AUTHORIZATION_ID. It never loads
the owner/application URL as a fallback, grants a policy, purges records or sends
a message. Output contains aggregate counts/timestamps and fixed alert codes;
no prompt, session ID, customer address, approval text or secret is returned.
Missing/stale scheduler, overdue conversations/leads, knowledge review/expiry and
budget missing/paused/expired/near-limit/exhausted/invalid configuration require
attention. The budget near-limit warning means80% reserved or insufficient
headroom for one fully approved output allowance; it is not an invoice
measurement. Any attention/unavailable result exits nonzero.

The runtime logs only fixed rondo_cost_control diagnostic codes on denied
admission. Connect the read-only operator check and runtime failure signals to
the approved existing monitor and exact alert sink. Observe a finite synthetic
failure/recovery and actual recipient acknowledgement before claiming alert
delivery/coverage. A local nonzero exit, console log, configured mailbox or a
successful retention cron is not independent continuous monitoring; a dead
scheduler cannot monitor itself. Installation, approved alert recipient, actual
delivery and response drill remain distinct.

Fresh aggregate SQL at16:56Z observed the scheduler heartbeat15:45:43.570Z,
zero overdue conversations/leads,16 published and zero expired knowledge entries.
It did not run a purge. Existing production cron runs conversation cleanup at
15:00UTC; operator runs never satisfy the scheduler-specific heartbeat.

## Pause, drain and rollback

The owner can stop new admissions with:

  npm run budget:operator -- --pause=THE-APPROVED-UUID

This prints an offline proposal. Supply the same explicit owner target and
--apply for the actual pause. Confirm enabled=false on the intended row.
Keep usage unchanged. Already-admitted calls may finish inside their reserved
bound and timeout; wait for the model deadline before treating the service as
drained. Do not retry/refund unknown provider or COMMIT outcomes automatically.

Preserve the current allowance/counter, source and diagnostic evidence across a
code rollback. Rolling back to code predating this guard would bypass a paused
row; first use an explicitly approved provider/project admission shutdown and
verify it remains closed. Do not restore an older database counter or revoke/
rotate credentials speculatively. Source rollback does not reverse prior charges,
emails, saved requests or accepted business operations.

Conversation expiry/deletion, separately consented enquiries, client-hub request/
outbox data, provider records, mailbox copies, backups and workforce data are
different categories. Conversation cron does not delete enquiries or erase
backups/mailboxes. Existing enquiry90-day cleanup stays operator-owned and
manual. SCRUM-156 retains public/legal/category reconciliation; this feature
does not approve a new retention promise or change public policy.
