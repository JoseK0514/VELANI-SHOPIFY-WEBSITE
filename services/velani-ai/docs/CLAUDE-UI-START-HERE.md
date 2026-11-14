# Claude: use the existing Rondo backend

Updated November 12, 2026 for SCRUM-153. Read [source and checkout](START-HERE-CLAUDE.md)
and the [current integration receipt](../../../docs/handoffs/2026-11-12-scrum153-rondo-backend-integration.md)
first. Backend source is integrated into development; Claude owns UI.

## Current development acceptance entry

Use the [November13 closeout](../../../docs/handoffs/2026-11-13-velani-rondo-development-closeout.md) and the [protected development instructions](START-HERE-CLAUDE.md#november13-development-operating-entry). They supersede dated source/deployment selections below without changing these HTTP contracts.

Missing client-hub rendered same-logical-request retry and0003 Inbox proof are now captured; preserve accepted EN/ES delivery and provider replay evidence rather than sending more mail. Two bounded UI findings remain yours: holdFor in public/assets/velani-hub.js caps Retry-After86400 to3600 (server quota still applies), and final success focus was not established in Shopify preview. Fix only the confirmed delay behavior with its boundary case and investigate focus in the real selected theme; no redesign or publication is requested.

## Starting implementation

Reuse `src/night/assist.js`, `src/night/velani-assistant.js` and existing markup,
styles, components and approved Lantern identity. The reference headless client
is `services/velani-ai/integration/velani-assistant.js`. This is the public Rondo
marketing assistant, without workforce-account access or execution tools.

Read the selected deployment's **public configuration**, not a database table or
hardcoded old widget key. Source integration, public health, genuine CAPTCHA/chat
acceptance, provider behavior, runtime budget/retention and final UI acceptance
are separate states. The dated runtime receipts and current operating owner are
in the [backend facts](../../../docs/handoffs/2026-11-12-signup-policy-rondo-backend.md)
and [operations handoff](DEVELOPMENT-OPERATIONS.md). Health/configuration200 is
not proof that a model answer or incident delivery succeeded.

A protected Preview is not an anonymously usable cross-origin API. The existing
client deliberately uses `credentials: omit`. Use the already approved runtime
for the selected environment or explicit local fixtures; preserve SSO and exact
origin checks. Do not invent a preview URL or disable protection to make it work.

## Existing HTTP contract

| Request | Body and result |
|---|---|
| GET /v1/config | Public assistantName, requireCaptcha and public turnstileSiteKey. |
| POST /v1/sessions | locale en/es and fresh captchaToken;201 returns sessionToken, sessionId, expiresAt. Turnstile action is velani-session. |
| POST /v1/chat | requestId UUID and message up to 4000 characters; optional existing locale/plan fields are validated by the server.200 returns message, sources, action, confidence and model. |
| DELETE /v1/session | Current bearer session;204 confirms its deletion. Panel close alone does not delete it. |
| POST /v1/leads | Separate explicit consented form;200/201 saved:true means the enquiry was saved. It does not confirm an email, booking or meeting. |

Use JSON and the current bearer only in memory. The browser supplies Origin;
server-owned session and company/source authority are not UI inputs. Render
answers as plain text and validate citation URLs before linking. Advanced
profile/plan APIs already exist but are not required for the existing widget.

Errors use `{error:{code,message},requestId}`. Keep request IDs for the same
operation and use a new UUID when content changes:

| Result | UI recovery |
|---|---|
|422 or503 provider_request_rejected | Non-retryable rejected request. Offer editing/new question/human help; no unchanged resend or automatic retry. There is no Retry-After. |
|503 temporary provider outage with Retry-After | Manual unchanged-operation retry after the actual delay; no background request. |
|409 turn_in_progress | Preserve the UUID/body; wait and show pending honestly. |
|409 request_id_conflict | Changed content needs a new operation. |
|401 | Normal expired/session-required recovery. |
|403 | Configuration/CAPTCHA/origin recovery; no bypass. |
|429 | Respect the returned Retry-After. |

Both clients retain failed operations. For an explicit edit, call
`discardFailedRequest()` then `chat(editedText)` to get a fresh UUID.
`retryLastRequest()` preserves the old operation and refuses provider rejection.
Calling chat again without discarding the failure remains pending.

[Actual handler-to-client tests](../test/release-ui-contract.test.mjs) cover both
clients in EN/ES. Use the [local response fixtures](../../../docs/handoffs/six-release-evidence-20261112/rondo-ui-fixtures.json)
only in explicit fixture mode; never silently substitute them in production.

## UI acceptance and custody

Verify keyboard/focus/Escape, loading/error/empty/success, mobile sizing, locale,
validated sources and delete/edit confirmation against the current source.
Preserve the existing design and no-JS behavior. Remaining website issues and
physical-device evidence are in [Claude's release packet](../../../docs/handoffs/2026-11-12-six-release-codex-to-claude.md).

Read the exact Shopify theme role before an approved write; work only on an
unpublished copy. This handoff authorizes no publication, runtime promotion,
real enquiry, model call, message or paid test. Historical model evaluation and
CAPTCHA receipts keep their original source and consumed allowance. SCRUM-155
retains operating/retention/budget acceptance; SCRUM-157 retains website UI work.
