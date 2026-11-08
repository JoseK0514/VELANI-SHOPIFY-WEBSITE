# Velani / NEVORA backend handoff — 2026-11-07

**Website backend deployed and enabled. NEVORA Release 1.1 code is prepared, reviewed and unshipped. Production domain binding and store-app activation remain gated on the authorized release and verified signing identities.** No Shopify UI/theme changes were made.

## 1. Velani client hub — ready for Claude's forms

Fixed contract: [client-hub interface](2026-11-07-client-hub-interface.md). [Operations, grants, recovery and rollback](2026-11-07-client-hub-operations.md). Claude owns forms/UI and privacy copy; preserve this request/response contract.

- `POST https://velani-ai.vercel.app/v1/client-hub/requests`, JSON plus required UUID `Idempotency-Key`.
- Types `new_work` and `project_support`; common fields name/email/company/project/description/language/turnstileToken. Urgency is support-only; project required for support. Per-field 422 errors, strict unknown-field rejection, 32 KiB bound, exact CORS and action/hostname-bound Turnstile. No account or chat session.
- `GET https://velani-ai.vercel.app/v1/client-hub/config` currently returns `enabled:true`, the public site key and action `velani-client-hub`.
- One transaction creates a monthly Puerto Rico reference (`VEL-YYMM-sequence`), request and two frozen email jobs. Identical retries replay the reference; edits with the same key return 409.
- Resend sender `Velani <requests@thevelani.com>`. Full request goes to `support@thevelani.com`, Reply-To client. EN/ES acknowledgement goes to the client, Reply-To support. Provider acceptance is distinct from inbox delivery.
- Existing account: 100 emails/day, 3,000/month, 10 requests/second. Hub admission is 40 requests/rolling day and5/email/rolling day;30 attempts/IP/15min. No paid upgrade or overages enabled.

Source: `d89350bd4019bc2746373bba8b75ff70d05039c8` on pushed feature branch `codex/client-hub-20261107`, based on `fb6a79b26d3748da9e556149e74de4dd1b6a57b4`. Documentation follows in a separate commit; no main merge. Service root `services/velani-ai`, existing Vercel project `prj_E1Vl2AEpTlJlBam4MTKG7oEHB7x2`.

Active production deployment: `dpl_8ChbePq8yvGTPJxi3LAspPyCtwnG`, Ready, [deployment](https://velani-hew3tjcir-josekarlo-5933s-projects.vercel.app). Alias [velani-ai.vercel.app](https://velani-ai.vercel.app). Guarded disabled predecessor `dpl_BZdFwDp5DYr7uJXFRFSNpVjJfJTF` used the same source before activation. Both are iad1. Existing Rondo health remains200.

### DNS, storage and secrets verified

DNS is **Shopify-managed**, verified in the authenticated domain detail/settings. Existing inbound Google Workspace MX/SPF/DKIM and Shopify storefront records were preserved. Jose approved these four additions at action time. Public DNS matches Resend; domain now **verified**, sending enabled, receiving disabled, open/click tracking off.

| Type | Host | Added value |
|---|---|---|
| TXT | resend._domainkey | Account-generated public DKIM key; complete value matches public DNS. |
| TXT | send | `v=spf1 include:amazonses.com ~all` |
| MX | send | `feedback-smtp.us-east-1.amazonses.com`, priority10 |
| CNAME | rsend | `send.forge.rmta.net` |

Only the Velani Neon project `wild-leaf-57992989`, branch `br-snowy-brook-bcc6b3zm`, database `velani_ai` is used. No NEVORA workforce data is involved. Guarded additive migration004 checksum: `7d733ace5cd677a7358acbe30a77d5b707622a27f429d7fffaa1c21fa23519d4`;001–003 were checked under the same migration lock. The dedicated `velani_client_hub_app` role has no schema CREATE, owner privileges, memberships or access to Rondo tables. It cannot rewrite accepted fields, frozen email payloads or monthly reference periods. Readback confirmed metadata-column-only outbox updates and that Rondo's app role cannot read hub requests.

Fresh domain-restricted sending-only Resend key and restricted DB URL are in existing Vercel **production-sensitive** variables only. Existing Rondo secrets were reused by reference, never downloaded or rotated. Six existing exact website/guide origins were copied to the hub's public CORS setting. No production credential was written to a local env file.

### Retention and privacy facts for Claude

Active request/outbox records are eligible for deletion at 88 days, with a daily sweep and a target of up to 90 days under normal scheduling. IP quota hashes are purged within 48 hours after their window ends. The email quota hash stays on its request until the request purge, although admission counts only the latest rolling day. Non-personal monthly reference counters remain.

Neon project readback shows **86,400 seconds (24 hours) of restore history**. Resend's standard email/log retention is [30 days](https://resend.com/security/gdpr). Google support/client mailbox copies are separate; **no automatic mailbox deletion policy was verified**. Claude must not promise that every email or backup copy disappears with the active database row. Scheduler outages require operator follow-up; the runbook defines aggregate checks.

Existing `_dmarc` reporting URI is malformed (`mailto:@support@thevelani.com`). It was observed and preserved outside the four approved additions. This does not negate the verified Resend SPF/DKIM records; correcting reporting and deciding enforcement are separate email-administration work.

### Hosted checks and remaining acceptance

| Check | Observed result |
|---|---|
| Active config |200, enabled true, dedicated Turnstile action |
| Invalid fields |422 with individual required errors; no submitted values echoed |
| Non-JSON input |415 |
| Allowed CORS |All six exact origins204; required headers allowed |
| Hostile Origin |403, no CORS grant |
| Cron without secret |401 |
| Internal queue consumer public POST |404, including a forged callback-header probe in the guarded deployment |
| Deployed consumer |queue/v2beta trigger for `velani-client-requests` recorded in deployment functions |
| Rondo health |200 |
| Provider simulation |Provider-owned `resend.dev` test recipient reported delivered; no customer/support inbox contacted |

Both cron registrations were read back: Rondo `0 15 * * *`; hub `0 16 * * *` (12:00 Puerto Rico). The hub job was triggered through authenticated Vercel CLI without exposing CRON_SECRET. Guarded and active runtime logs show configured true, retentionSucceeded true, recoverySucceeded true, zero expired requests and zero pending jobs. This proves manual execution and registration; a future daily firing is not yet observed.

Native queue consumers are [internal to Vercel](https://vercel.com/docs/queues). Registration and external ingress isolation were verified. **An actual accepted form → broker wake-up → two real emails has not been exercised.** The queue dashboard has no delivery data yet; all production request/outbox counts remain0. After Claude wires the forms and privacy notice, the next acceptance test needs a genuine Turnstile interaction and explicit authorization to contact the test client's and support inboxes. Keep saved-success/pending-email semantics; do not bypass verification to test it.

## 2. NEVORA trial retention — Release 1.1 candidate only

Detached candidate HEAD `831d33dac00f63622f538e77fc598857f3b9b8d9`, based on freshly fetched development `e2872f30ea8548b1310ea4a9b25813352decf82a`. Worktree: `/Users/josek0514/Documents/Codex/2026-11-04/https-www-thevelani-com-preview-theme-2/work/nevora-release11`. Commits: trial policy `36d51fc08`, native identifier correction `365538ce3`, app-link-only preparation `60542450a`, strict option correction `831d33dac`. No new NEVORA branch, push, main merge or production deployment.

Canonical repository verified: `JoseK0514/NEVORA`; the old `Fuel-Scheduler-` remote URL redirects there. Frozen Release1 candidate `f5fa463b111e263c9b863b16b6c2bca502571a7b` is unchanged by this work. Website/in-app policy copy and Rondo's current policy knowledge were not changed.

The inspected development code has **no authoritative subscription/trial lifecycle**. The candidate adds a pure policy for 30 days of trial plus 30 days of retention, owner export eligibility during grace, reminders at trial end/deletion−7 days/deletion−1 day, stable reminder keys and fail-closed stale/conversion checks. It does **not** persist billing state, send reminders, schedule deletion or grant actual export/destructive authority.

Remaining Engineering work before Release1.1 ships: durable trial/subscription authority; serialize conversion and deletion; durable reminder outbox/worker/scheduler; complete owner-authenticated workplace export; scoped resumable deletion with legal-hold/backup restoration controls; integration/hosted acceptance. Current report export is not proof of a complete workplace export. CISO/Governance must review the integration; Claude changes policy wording only after shipment.

Detailed NEVORA handoffs in the candidate: `docs/handoffs/2026-11-07-release11-trial-policy.md` and `docs/handoffs/2026-11-07-nevora-domain-app-links.md`. Source, task and final reviews have zero open findings after corrections. This approval is for the offline candidate, not a live lifecycle or production release.

## 3. nevora.team, email and store links — prepared, activation pending

Update on 2026-11-07: Jose purchased **nevora.team** through GoDaddy; authenticated receipt and My Products inspection confirmed the exact domain. DNS management is accessible. The four approved Resend records are now saved and resolve in authoritative/public DNS; Resend now reports the domain and all four records **verified**. Sender preparation and exact provider records are tracked in [domain activation follow-up](2026-11-07-nevora-domain-activation.md). Production website mapping and certificate verification remain separate gates.

The existing NEVORA Vercel project was identified and cross-checked: **fuel-scheduler**, `prj_89ROQdj0NXfzmKNSeYkoYUASXRLC`, same team `team_Lzbw410WwXGWHTuUXuamRI1N`. Its current production deployment readback is `dpl_zPkw2i5HramtMKh4eYP67MraP6pX`, source `7ffd013e39a9763a0655aa092b159dea4cbbfb50`; this older main commit is an ancestor of the frozen Release1 candidate. It was not deployed or changed by this task. Do not confuse the existing protected Preview (`32ce3b5…`) with the future authorized production release.

At the authorized production deployment, verify this project's selected release and isolated production DB/origin binding, then attach `nevora.team` to that production project and use Vercel's actual domain records/TLS checks. Follow-up: the existing domain is now added and verified at the Vercel **account** level with `zone:false`; GoDaddy DNS stays intact. It is not attached to the production project, and public routing/runtime settings remain unchanged. The activation follow-up records current release identity and read-only DNS recommendations for the final cutover.

NEVORA sender provider is **Resend**. The separate `nevora.team` sender domain is now created (us-east-1, receiving/tracking off, TLS enforced); its four approved authentication records resolve publicly. Provider verification is complete; DKIM, SPF TXT/MX and CNAME all report verified. The exact state is in the activation follow-up. A future **separate @nevora.team domain-scoped sending key** must be used, never the Velani key. No NEVORA mail secret or runtime sender configuration was provisioned. At the authorized release, the existing recovery transport supports [Resend SMTP](https://resend.com/docs/send-with-smtp): host `smtp.resend.com`, port 465 with implicit TLS, username `resend`, a dedicated key in the approved store, a plain sender such as `no-reply@nevora.team`, and canonical `FUEL_PORTAL_ORIGIN=https://nevora.team`. Shared account capacity must be rechecked before NEVORA mail activation; no upgrade is authorized.

Apple account readback: **VELANI LLC enrollment pending; documentation under review**. Production signed iOS application-identifier is unavailable/unverified. Current native source uses `com.velani.nevora.development`; production Android package and **Play App Signing app-signing certificate SHA256** are also unverified. Never substitute development/upload/debug identities.

The existing association tool now has an explicit `--links-only` mode that retains app-opening paths/identities and omits Apple webcredentials/Android get_login_creds. Malformed non-boolean API options fail before output creation; prior native defaults are preserved. It reuses existing identity validation and safe external-directory writes. No placeholder production files or native entitlement/application-ID changes.

Once verified public identities exist, generate an external bundle with `node native/association/prepare.mjs --config /absolute/public-identities.json --output /absolute/new-bundle --links-only`. At the authorized production release, publish only its two JSON files at:

- `https://nevora.team/.well-known/apple-app-site-association`
- `https://nevora.team/.well-known/assetlinks.json`

Require HTTPS, application/json, no redirects, exact signed app identities, exact-host native entitlement/intent filters and actual signed-device verification. Current status: **not generated with real production IDs, not signed, not hosted, not device-tested**.

## Evidence, decisions and ownership

Website:186/186 full service tests passed with isolated testDB, serial files and30s remote-DB timeout; the default5s run's10timeout failures are preserved. After the adapter correction,3/3 focused HTTP regressions passed. Typecheck/build passed; production dependency audit0. Three pre-existing dev-only audit findings and existing Fastify deprecation warnings remain.

NEVORA: earlier trial candidate full suite 11,011 passed/801 skipped; corrected policy and tenancy focused suite 169 passed; final association tool 26 passed. Typecheck and targeted lint passed for the corrected policy. These are scoped checks at their recorded commits, not a full-suite claim for final HEAD or hosted certification.

Test database contains no remaining tables; its named test role is now NOLOGIN with zero active test connections. Empty testDB retained for audit. Temporary secret copies cleared. Production hub requests/jobs0; existing Rondo session aggregate1 preserved. No metered AI call, real customer/support email, paid upgrade, NEVORA production mutation or domain purchase.

Rulings: keep trial change in Release1.1 and copy unchanged until shipped; use a pure reviewed candidate while billing/deletion authority is absent; use native queue plus independent daily maintenance to respect the email provider's24h deduplication window; limit hub admission to40/day for existing email capacity; prepare app-opening-only delegation; preserve detached worktree and resumable evidence. If these choices change, revisit the corresponding integration/release gate rather than treating preparation as production evidence.

Next owners: **Claude** builds forms and privacy copy against the fixed contract; **Engineering** completes Release1.1 lifecycle integration and, after ownership/signing gates, production domain/app links; **CISO/Governance** verify authority, export/deletion and release controls; **Jose** has purchased the domain and retains future NEVORA production authorization. No further DNS navigation is needed from Jose.

Supporting evidence is versioned under `.omo/evidence/`: client-hub-execution, both source reviews, release11-trial-review, release11-app-links-review and release11-final-review. Worktrees and handoffs are preserved for continuation.
