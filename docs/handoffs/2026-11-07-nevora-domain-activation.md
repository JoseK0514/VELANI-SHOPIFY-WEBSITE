# nevora.team domain activation — 2026-11-07

Jose confirmed the spelling **nevora.team**, purchased through GoDaddy. Authenticated Safari inspection showed “nevora.team is yours” and “Thank you for your order”; the receipt initially said registration in progress. The domain is also listed in GoDaddy My Products, and its DNS management page is accessible. Initial public recursive NS/A/MX queries returned ENOTFOUND; this does not override authenticated purchase evidence.

## Sender prepared

Resend domain `cc97774e-7065-4d92-a021-2c6ff994d939`, `nevora.team`, us-east-1. Sending enabled, receiving disabled, open/click tracking off, TLS enforced. This uses the third included domain slot (previously 2/3); no upgrade or subscription was started. Account readback before creation: 3/100 emails today, 183/3,000 this month. No test email was sent.

No API key, mailbox, NEVORA runtime setting, application deployment or production-domain mapping was created. Production release selection and store-signing prerequisites from the main handoff still apply. Frozen Release 1 remains unchanged.

## Verified DNS baseline

GoDaddy zone had seven records: root A Parked (600s); NS ns01.domaincontrol.com and ns02.domaincontrol.com; CNAME www → nevora.team; CNAME _domainconnect → _domainconnect.gd.domaincontrol.com; SOA; TXT _dmarc = `v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;`. Non-A records showed one-hour TTL. No Resend record conflicted with the proposed names. Preserve all existing records and the parked website binding until the separate production release is authorized.

## Exact provider-returned additions

| Type | Name | Value | Priority | TTL |
|---|---|---|---|---|
| TXT | resend._domainkey | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDkPLnrk1O66Gn5ea82J/FDZ0aqjizvGwrkuVP0JW78eZcPhKpinO6iHuAKq1nz+bQfFW/SEW+g59oT6mSVztIFoxsYAsMBMWLGUJSiYGtKBkgVCism7VQXRkNUddbjLpaJ1OcJ87fkjXxj165MOXCiT/4adP07yVkTrVDvVQcFGQIDAQAB` | — | 1h |
| TXT | send | `v=spf1 include:amazonses.com ~all` | — | 1h |
| MX | send | `feedback-smtp.us-east-1.amazonses.com` | 10 | 1h |
| CNAME | rsend | `send.forge.rmta.net` | — | 1h |

Jose explicitly approved “Save NEVORA email records.” The four-record batch was saved in GoDaddy. The UI showed Success and 11 total records (the original seven plus four additions). Each added type/name/value and MX priority was read back. The saved TTL is 3,600seconds (1hour), confirmed in authoritative DNS; GoDaddy normalized the form’s initial half-hour display. The parked website binding, nameservers and existing records were preserved.

Authoritative ns01.domaincontrol.com and public recursive DNS now return all four exact provider values. Public NS records resolve to ns01/ns02.domaincontrol.com; existing _dmarc quarantine and www CNAME remain intact. Resend verification completed: overall status **verified**, with DKIM, SPF TXT, SPF MX and CNAME all verified. Sending remains enabled, receiving disabled and open/click tracking off. Registration, propagation and provider verification are separate states. Sender verification alone does not prove an application-sent email or real inbox delivery.

Engineering owns DNS preparation/verification. CISO: least sender scope, receiving/tracking off, separate future NEVORA key, no broader app delegation. Governance: GO WITH CONDITIONS for preparation; production mapping and runtime mail activation remain gated on the authorized release and verified configuration. No policy exception or production authorization inferred from purchase.

## URL preparation completed after Jose's follow-up

Jose asked whether to finish the URL setup now. Recommendation: complete reversible domain preparation now and bind the public hostname during the authorized Release 1 cutover. Store-app identities are a separate dependency; they do not need to block the web-domain preparation.

The domain was absent from Vercel's account inventory (404). Added the **existing** apex domain to team `team_Lzbw410WwXGWHTuUXuamRI1N` using method `add`, `zone:false`. This neither purchases/transfers registration nor switches nameservers. Readback confirms `nevora.team`, `verified:true`, `serviceType:external`, `zone:false`, and GoDaddy ns01/ns02.domaincontrol.com. No Vercel DNS zone, production project binding, runtime environment change, application deployment or public DNS switch was made.

Post-change public DNS still resolves root A `3.33.130.190` and `15.197.148.33` (GoDaddy parking), GoDaddy NS, Resend SPF TXT and priority-10 MX. Project-domain readback still lists only `fuel-scheduler-ten.vercel.app` for `fuel-scheduler`, project `prj_89ROQdj0NXfzmKNSeYkoYUASXRLC`.

### Verified release identity

- Current Vercel production is deployment `dpl_zPkw2i5HramtMKh4eYP67MraP6pX`, source `7ffd013e39a9763a0655aa092b159dea4cbbfb50`, Ready. It is the older main build, not the selected Release 1 candidate.
- Exact Release 1 source remains `f5fa463b111e263c9b863b16b6c2bca502571a7b`. Its [CI run 41913069693](https://github.com/JoseK0514/NEVORA/actions/runs/41913069693) was read directly: completed/success with matching headSha.
- [PR37](https://github.com/JoseK0514/NEVORA/pull/37) is open, titled “CI only (do not merge)”; current head `27b8f43ebc9a5de9669be2b800ba87a344dbc65d` has failed/in-progress checks. Those are on a different head and must not be substituted for the frozen candidate or reported as failure of its successful historical run. No CI dispatch, branch change, merge or deployment was performed.

### Concrete cutover inputs and remaining gate

Vercel `get_domain_config` for this domain/project currently returns rank-1 IPv4 values `216.198.79.1` and `64.29.17.1`, and rank-1 CNAME `c5f27bb8f288ce0b.vercel-dns-017.com.`. These were **read-only recommendations**, not records added to GoDaddy. Refresh the project/domain recommendations during the approved cutover instead of treating this snapshot as a universal DNS recipe. Preserve Resend, DMARC, nameserver and DomainConnect records. Prefer the apex as the canonical app hostname and configure the www redirect deliberately with the release.

The frozen release's published handoff still requires verified migration/restore/environment custody, inspection/device acceptance and Jose's explicit production go. This follow-up checked release identity/CI and staged domain ownership; it does not certify those other gates. Source-specific checks must use the frozen candidate, not development or the newer collab head.

Next owner: Engineering completes the production preflight, including canonical `FUEL_PORTAL_ORIGIN=https://nevora.team` and matching passkey RP/origin configuration where enabled, plus a separate restricted NEVORA sender key in the approved store. Review source and existing credentials without copying production secrets into tests. The final reviewable cutover must include the exact release/deployment, migration/rollback evidence, DNS changes and final authorization before public routing. Afterward verify HTTPS, redirects, sign-in, recovery/invitations and approved email delivery on the actual hostname. Native association files remain a later signed-identity/device gate.

Governance recommendation: **GO for the completed preparation; public cutover held for production readiness/authorization.** Existing controls come from NEVORA AGENTS.md and the frozen Release 1 handoff, not from a new approval process invented for DNS. No production exception was accepted.
