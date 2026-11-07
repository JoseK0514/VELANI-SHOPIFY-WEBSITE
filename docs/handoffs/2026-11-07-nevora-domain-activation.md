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

Authoritative ns01.domaincontrol.com and public recursive DNS now return all four exact provider values. Public NS records resolve to ns01/ns02.domaincontrol.com; existing _dmarc quarantine and www CNAME remain intact. Resend verification was started; latest status pending (CNAME verified, DKIM/SPF/MX pending). Continue checking the provider’s actual status before claiming sending is verified. Registration, propagation and provider verification are separate states. Sender verification alone does not prove an application-sent email or real inbox delivery.

Engineering owns DNS preparation/verification. CISO: least sender scope, receiving/tracking off, separate future NEVORA key, no broader app delegation. Governance: GO WITH CONDITIONS for preparation; production mapping and runtime mail activation remain gated on the authorized release and verified configuration. No policy exception or production authorization inferred from purchase.
