# Velani / NEVORA backend handoff — 2026-11-07

Status ledger, in progress. This file will be completed with verified commit/deployment evidence before the final handoff.

## Velani client hub

Website-only backend candidate lives on `codex/client-hub-20261107`, based on `fb6a79b26d3748da9e556149e74de4dd1b6a57b4`, service `services/velani-ai`. Fixed form contract: [client-hub interface](2026-11-07-client-hub-interface.md). [Operations, grants, recovery and rollback](2026-11-07-client-hub-operations.md). No frontend/theme changes.

New-work/support validation, monthly references, transactionally frozen bilingual email jobs, rolling quotas, native queue retries and independent daily retention are implemented locally. Final tests/re-review, restricted production migration/configuration and deployment remain in progress. Current source is not yet a deployed endpoint.

Resend is authenticated. `thevelani.com` exists in the account with tracking off and receiving disabled. Four provider-returned records were added through Shopify after Jose's explicit approval; all four resolve in public DNS. Domain verification is pending. Google root MX/SPF/DKIM and Shopify storefront records were preserved.

| Type | Host | Added value |
|---|---|---|
| TXT | resend._domainkey | Resend-generated public DKIM key; exact public DNS matches the account record. |
| TXT | send | `v=spf1 include:amazonses.com ~all` |
| MX | send | `feedback-smtp.us-east-1.amazonses.com`, priority 10 |
| CNAME | rsend | `send.forge.rmta.net` |

Actual provider capacity: 100 emails/day and 3,000/month; initial readback 0 used today and 180 this month. No upgrade. Hub limit: 40 accepted requests/rolling day, five/email/rolling day; two messages each. Sender will be `requests@thevelani.com`, support destination/confirmation Reply-To `support@thevelani.com`, support message Reply-To client. Domain-scoped sending-only key and dedicated Velani database role still to provision.

Privacy: active request/outbox database target is up to 90 days (eligible day 88, daily sweep); Resend email/log copies have standard 30-day retention. Database backups and Google/client mailbox copies are separate; no automatic mailbox purge verified. Claude must disclose these boundaries rather than promise deletion of every copy at day 90. Existing `_dmarc` record has malformed report URI `mailto:@support@thevelani.com`; observed, preserved, and outside the four approved additions.

## NEVORA Release 1.1

Detached development candidate `36d51fc080d4abc9aaa8636f15e92bda9a63587d` is based on `e2872f30ea8548b1310ea4a9b25813352decf82a`. Canonical repository was verified as `JoseK0514/NEVORA`; old Git remote URL redirects from `Fuel-Scheduler-`. Release 1 candidate `f5fa463b111e263c9b863b16b6c2bca502571a7b` remains unchanged. No production merge/deploy and no policy copy changes.

The inspected source has no authoritative subscription/trial lifecycle. The candidate prepares a tested pure 30-day trial + 30-day grace policy with deduplicated reminder windows. It is **not integrated or shipped**. Billing conversion serialization, durable reminder delivery/scheduling, complete owner export, safe workplace deletion and backup restoration controls are still required for Release 1.1. Detailed evidence and ownership: NEVORA `docs/handoffs/2026-11-07-release11-trial-policy.md` in the detached candidate. Source review is pending.

## nevora.team / store app links

Not purchased as last confirmed by Jose; public NS/TXT/MX return no records. Safari shows only a purchase cart; no order was placed. Production project mapping and @nevora.team sending records remain gated on domain ownership and the authorized production deployment. No placeholder or development app identity may be published.

Apple account readback: VELANI LLC enrollment pending, documentation under review. Production signed application identifier is unverified. Current native source uses `com.velani.nevora.development`; production bundle/package and Play App Signing SHA-256 certificate have not been established. Existing `native/association/prepare.mjs` prepares public association documents but does not establish signed/hosted/device verification. Production link delivery preparation is in progress.

## Evidence / next gate

Focused website cases: 41 in-memory and 9 isolated PostgreSQL passed before the provider-capacity adjustment; final full suite will supersede these counts. Production dependency audit: zero known vulnerabilities; three pre-existing development-only audit findings remain. No metered AI call, real support/client email, NEVORA production data mutation or domain purchase occurred.

Next: finish tests/re-review, restricted storage/config and hosted backend checks; append final evidence and exact deployment state here. Claude owns forms/UI and privacy copy. Engineering owns Release 1.1 lifecycle integration and future production domain deployment; CISO/Governance must verify authority, export and deletion controls before claiming the new policy.
