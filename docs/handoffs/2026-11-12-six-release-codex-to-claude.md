# Codex → Claude: six remaining release issues

November 12, 2026. Issues: [60](https://thevelani-team.atlassian.net/browse/SCRUM-60), [147](https://thevelani-team.atlassian.net/browse/SCRUM-147), [73](https://thevelani-team.atlassian.net/browse/SCRUM-73), [156](https://thevelani-team.atlassian.net/browse/SCRUM-156), [157](https://thevelani-team.atlassian.net/browse/SCRUM-157), [158](https://thevelani-team.atlassian.net/browse/SCRUM-158).

This packet finishes this chat's non-overlapping contract verification, policy/resource/permission inventory and UI handoff. Workforce hosted execution remains actively owned by the separate finisher; it is **not** certified complete here. Source/UI/business/device gates remain distinct.

## Release policy and custody

Development is Jose's primary working/operating and acceptance release. Apply production standards and verify the combined UI/backend there. Only promote the exact verified release to actual main/production after Jose approval. Preserve true environment names and synthetic-versus-real status. Codex owns backend/hosting; Claude owns UI. Existing paid/send/customer-data limits remain unchanged.

Read AGENTS.md, DESIGN.MD/CLAUDE.md where present, current source and uncommitted work before editing. Preserve approved visual directions and existing shared components; no new design direction is requested. NEVORA uses only its three approved branches and detached worktrees for isolation.

**Do not duplicate the active finisher.** At the ownership readback20:35UTC, “Finish NEVORA SCRUM-190 handoff” (`01a1d175-7de0-7a80-b607-5418fde6ed50`) explicitly took over from now-idle “Complete SCRUM-190 backend work”. Its preserved checkout is `/Users/josek0514/.codex/worktrees/nevora-worker-quota-repair-20261112`. It owns Home/communications CI investigation, source assembly, manuals/bundles, worker/monitor custody, quotas, hosted payroll/web-push/Stripe acceptance and final NEVORA development publication. Do not edit that checkout, operate its runtime, start a second candidate/CI workflow or reuse its finite allowance.

The prior146/155 QA chat is idle after its local282-check checkpoint; private-admin work is separate. No other chat was messaged or interrupted by this packet. Read the actual latest finisher checkpoint before depending on its hosted results.

| Source | Bound identity |
|---|---|
| NEVORA development at this packet's initial read | `eee76416ec8d06435e73c3ecde9a77752ec0d446`; its actual post-push CI failed. Later local finisher checkpoints are not qualified release substitutes. Fetch/recheck before UI integration. |
| Velani base | `482353871898c3f72154d284937a311757bf8e00`; this packet adds docs/fixtures/tests only on top. |
| Existing public Rondo runtime | `3db0ea98bc3da6b3ae08b9e5d2c2b59a361e6a8d`; no promotion by this packet. |
| Protected Rondo development runtime | `78cdae299457af6b79bb105878f3fb52bfc70f79`, Node24, SSO ALL, Preview/null target. Use its authenticated same-origin Preview or explicit local fixtures; do not broaden origins/bypass protection. |
| Current Shopify MAIN | `193311572282`, signature design. |
| New client-hub acceptance copy | `193374224698`, UNPUBLISHED; real-preview-submit flag was returned false after the earlier approved test. |

Reference backend details instead of recreating them:
- [Current signup/policy/Rondo facts](2026-11-12-signup-policy-rondo-backend.md).
- [Velani development closeout](2026-11-12-velani-development-closeout.md), including retained browser failures.
- [Rondo155 current protected browser origin/operations](2026-11-12-scrum155-budget-and-retention.md).
- [Existing client-hub UI contract](2026-11-12-claude-client-hub-ui.md) and [actual earlier acceptance](2026-11-12-client-hub-live-acceptance.md).
- NEVORA finisher's `docs/handoffs/2026-11-12-nevora-consolidated-finisher-handoff.md` and `2026-11-12-scrum146155-qa-checkpoint.md`; their runtime operations remain with its owner.

## What is ready and who finishes each issue

| Issue | Codex work / remaining execution owner | Claude / business acceptance |
|---|---|---|
|60 workforce notifications | Current API/client/authorization contract already exists. The finisher owns actual finite browser-push/SMTP and consent/suppression delivery acceptance; not duplicated here. | Preserve existing device-alerts UI/controller and finish selected-source permission/error/cleanup/receipt/device checks. Do not rebuild it or add deferred category switches. |
|147 uptime/recovery | Worker/monitor source, private health and prior receipts exist. The finisher owns current-source restart/monitor/incident readback and coverage; no new monitor/control endpoint requested. | Handle the existing unavailable/paused recovery screens truthfully; do not expose private monitor/health credentials or invent an Owner operations dashboard. Human delivery/backup/coverage acceptance remains with named operators. |
|73 phone recovery | No new backend endpoint is required by the retained phone-sheet findings. Authorization/command recovery remain unchanged. | Reproduce remaining phone/PWA sheets, tap-through, focus/keyboard, crash and Back behavior on the exact source and real named devices. Fix demonstrated UI defects. Historical R-01/R-02 fixes and Android160 are separate evidence. |
|156 public policy | Backend factual boundaries and fresh read-only public/configuration checks are supplied below. No lifecycle or deletion-policy change is introduced. | Align actual EN/ES pages, language map, dates and selected-source app policy mirror; obtain business/legal review of changed commitments. |
|157 Shopify/site | Read-only resource roles/pages, current API states, Rondo error contracts and fixture checks are delivered. Admin mutation/publication is not inferred. | Finish Relay/no-JS links, Rondo recovery/identity, actual phone/accessibility checks, then a reviewed unpublished theme. Jose handles approved global-resource decisions/publication. |
|158 portfolio/AI claims | Exact four current portfolio assets and hashes are inventoried; no explicit public-use permission receipt was found. No new asset or false permission was generated. | Use approved Lantern direction and truthful demos. Jose/business supplies actual portfolio permissions/materials. |

##60: use the existing workforce device-alert contract

NEVORA source paths, inspect at the selected final source:
- `src/components/employee-mobile/device-alerts.tsx` and `device-owner.tsx`: existing presentation/controller ownership.
- `src/app/app/profile/device-alerts/page.tsx`: normal sign-in; Employee/Lead view, other roles redirect.
- `src/lib/notifications/device-client.ts`, `device-protocol.ts`, `subscription-service.ts`.
- `docs/runbooks/web-notification-acceptance.md`: configuration/delivery gates. Its older unperformed snapshots are superseded only by the finisher's exact actual receipts.

Same-origin routes are **/app/api/push/status** (GET), **subscribe**, **unsubscribe**, **test** (POST). These are not `/api/push/*`. Keep credentials same-origin, no-store and the existing `X-Nevora-Device-Authority` binding/lifetime handling. Do not make browser calls to internal dispatch/reminder/worker routes.

Status exposes `supported, enabled, configurationAvailable, testAllowed` plus conditional ownershipGeneration/public VAPID key/dismissalScope; bound reads also have matching authority and positive validForMs≤45000. This status can reconcile proof cookies; retain the controller's lifecycle lock and stale/account-change protections. Server readiness is distinct from browser support/permission.

- Subscribe200 validates current ownership/generation. Never claim delivery merely because enrollment succeeds.
- Test202 **{status:"queued"}** means queued, not delivered or displayed. Show Test only when the current controller permits it.
- Unsubscribe200 **{status:"complete",generation?}** confirms its own generation.409 cleanup_pending/installation_conflict must remain honest; never show successful turn-off on uncertainty.
-401 requires normal sign-in;403 means denied/test not allowed;503 configuration/temporary unavailable means no false success.
- Existing UI states include ready/dismissed, enabled, loading/pending, denied, revoked, install, unavailable/error, paused/accessChanged and cleanupPending. Keep gesture-only permission requests, focus return, browser/Home Screen recovery and generic lock-screen copy.

Actual hosted push display/click, delivery and account-revocation receipts are the finisher's remaining work. Website Rondo emails and native validate-only tests do not close60.

##147/73: recovery without weakening access

Preserve current sign-in and role checks. Owner billing controls remain Owner-only. Employees/Managers contact their employer; a time-clock tablet shows paused/unavailable without payment controls. A billing-authority outage is unavailable, not a request to pay.

The verified EEE development source has the recovery exceptions/status API but **does not yet contain the `/app/billing` or `/clocker/access/paused` page files**. Its gate redirects tablets but still answers `/app` documents with raw JSON. The separate local patch in this packet fixes app document303 redirects, preserves reason402/503 and excludes `/api` and `/app/api` requests; it also keeps the exact billing recovery GET independent of failed commerce binding. The finisher must integrate/qualify that patch before joined acceptance. Claude should reconcile/import the existing held recovery UI under169, rather than assume those pages are already in development or rebuild its backend. Do not reintroduce nonexistent `/app/pay` or bypass commerce gates. The Clocker recovery destination uses the established strict tablet-key validator and a full-page link. Current backend receipts distinguish unconfirmed commands, recorded time and photo outcomes; a UI recovery must never create a second punch just to dismiss a sheet.

Shared layout is also a UI integration gate: the current `src/app/app/layout.tsx` still wraps admitted recovery pages in AppShell and its operational pollers/parallel sheet. Make the authenticated recovery composition independent of those failing counts/notifications without removing normal session/role checks. Earlier local recovery work is preserved at NEVORA ref `refs/codex-recovery/commerce-recovery-04fe4616`; its `recovery-boundary.tsx` is a reference, not a blind port of an older single-company layout into current isolated routing. Recheck the exact final company/session binding and retained-client-layout behavior.

Phone acceptance: record source/deployment, device model/OS/browser/install mode, viewport/text size, native Back/edge gesture, keyboard/focus/scroll/tap behavior and retained failures. Browser emulation/CI alone does not satisfy physical-device acceptance. Preserve independent authors' closure authority.

##156: current factual boundaries and copy work

[Read-only readback](six-release-evidence-20261112/read-only-readback.json) was captured20:44UTC:
- Public signup config200, schemaVersion1, **signupEnabled:false**, EN/ES. Keep the request/assisted setup CTA until joined admission acceptance. Do not reopen retired Velani signup/login-link/verify/setup APIs.
- Public Rondo config200 identifies **Rondo**, CAPTCHA required. Client-hub config200 is enabled; that does not publish the newer form theme or authorize test sends.
- Published English NEVORA privacy **already says no automatic workplace-deletion timer** and describes restricted unpaid-trial operations/available recovery records. The sampled current privacy/deletion text does not reproduce the old three-day promise. Preserve corrected text; reconcile remaining surfaces rather than repeating obsolete work.
- **/pages/es-privacy** and **/pages/es-nevora-privacy** return404. Current privacy/deletion Spanish switches point to the product page, not a translation.

Authoritative facts are in the existing factual handoff:30 days/no card, workplace provisioning starts trial; assisted over-30 eligibility; restricted unpaid access with available Owner export/own employee statements; no live automatic30-day workplace eraser. Payroll calculation/statements do not execute wages/taxes. Owner assistant availability is deployment/authorization dependent and distinct from public website advice. Existing advertised prices are not newly approved or changed by this packet.

Copy/source locations:
- Website `src/content.mjs`, `src/content.es.mjs`, `src/nevora-policies.mjs`; `src/render.mjs` (`langPaths`/alternates) and ES_PATHS/ES_NEAREST.
- NEVORA `src/lib/legal/policies.ts` and its existing public-policy rendering/versioning. Preserve already approved statutory retention facts; do not invent new legal periods or silently change accepted request versions.

Supply genuine translated Spanish legal content and reciprocal language/canonical mappings. Proposed consistent handles are es-privacy, es-nevora-privacy, es-nevora-terms and es-nevora-account-deletion; verify final mapping before implementation. Source/unpublished theme views can be reviewed first. Creating/publishing required global Shopify Page resources is a distinct owner/admin step; do not change global store policies/menus or publish placeholders to make the routes appear green.

Keep retention categories separate: specific verified workforce DB restore history, Rondo's separate one-day DB history, snapshots, conversations, leads/outbox, provider logs/AI safety retention and mailbox copies. Seven-day metadata is not universal-erasure proof or a fresh restore exercise. Today's16 reviewed knowledge records expire December12; completed164 is separate from next maintenance191.

Provider facts were rechecked at the [official Neon retention page](https://neon.com/docs/ai-gateway/data-retention.md): Databricks may retain model inputs/outputs up to30days for abuse monitoring; applicable partner safety retention is separate. Do not describe Delete conversation as erasure from all providers/backups or promise zero retention/human review. Business/legal wording approval remains explicit.

##157: Rondo contract and remaining site work

The backend and both existing headless clients already implement this matrix. No new endpoint, model fallback, filter bypass or UI architecture is required.

| Result | UI behavior |
|---|---|
|422 provider_request_rejected, no Retry-After | Localized edit/new question/human help; no same-message retry or automatic resend. |
|503 provider_request_rejected, no Retry-After | Same non-retryable edit recovery; status503 does not make this code retryable. |
|503 provider_unavailable with Retry-After10 | Temporary outage; user-initiated same-operation retry after the delay; no automatic model request. |
|409 turn_in_progress | Wait; preserve identical UUID/body for the same operation. |
|409 request_id_conflict | Changed content needs a fresh operation; do not reuse an old UUID with new words. |
|401 session-required/expired;403 CAPTCHA/origin denial | Existing session/verification recovery; no bypass or success. |
|429 | Respect actual Retry-After; no background retry. |

Response envelope is **{error:{code,message},requestId}**. Rejections have no successful answer/source/action object and no private provider diagnostic. Browser clients localize presentation; server error text is not an instruction to expose provider details.

**Edit flow detail:** both clients retain a failed operation. Call the existing `discardFailedRequest()` for an explicit edit/new question, then `chat(editedText)`, which creates a fresh UUID. Simply calling chat again while the failure is retained yields pending. `retryLastRequest()` is for the unchanged retryable operation; it refuses these rejected messages.

Use [rondo-ui-fixtures.json](six-release-evidence-20261112/rondo-ui-fixtures.json) only in explicit local fixture mode. [release-ui-contract.test.mjs](../../services/velani-ai/test/release-ui-contract.test.mjs) verifies actual Fastify handlers plus both the integration/reference client and the Shopify client, EN/ES, edited UUIDs, refusal of resend, private-detail exclusion and temporary-outage delays. No remote inference is required for UI regression tests. Production must use actual responses; never silently fall back to fixtures.

Actual source locations: `src/night/velani-assistant.js` and the launcher/panel wired by `src/night.mjs`; reference client is `services/velani-ai/integration/velani-assistant.js`. Keep runtime name Rondo consistent across launcher, accessible name, title and greetings. Jose's approved icon is **concept1, Lantern**; no new concept selection or generated substitute is requested.

Retained site failures to fix with unchanged acceptance assertions:
1. Both NEVORA language pages need an actual `#relay` destination matching their links.
2. At390px with JavaScript disabled, product/service header navigation must remain usable. Preserve disabled no-JS delivery.
3. Complete actual phone/keyboard/focus and UI-recovery checks, then selected-source language/legal/identity review.

Shopify inventory: Sign-in/Entrar/Nosotros/Ayuda/A-la-medida are already published; do not recreate them. MAIN193311572282 already contains the signature design. Hub copy193374224698 is still unpublished; keep real-preview submission disabled. Global Products still exists, despite theme/link changes. Jose chooses its approved disposition and final exact-theme publication after review; no deletion, DNS mutation, live inquiry activation or new real test send is authorized here.

##158: portfolio and demo acceptance

[portfolio-register.json](six-release-evidence-20261112/portfolio-register.json) identifies the exact current Tool Box LLC and Yavi Barber images/hashes. It is evidence of files/provenance, not permission. No explicit public-use permission was found in the reviewed sources. Jose/business must record the actual name/asset/claim permission; do not infer it from a published image or fictional QA data.

Use genuine project results; avoid invented testimonials, metrics, customer records or automatic execution claims. Public chat has no workforce access; static demonstrations must be distinguishable from functioning authenticated operations. Keep approved imagery once permission is evidenced; this handoff does not request a new portfolio design.

## Verification and return contract

The Velani change adds only backend/UI seam tests, synthetic fixtures, inventories and this handoff. A separate **local NEVORA backend patch** restores document recovery; its reviewed diff and qualification are in `six-release-evidence-20261112/nevora-document-recovery.diff` and `nevora-recovery-qualification.json`. It is incoming work for the sole finisher, not a parallel NEVORA publication. No UI/theme/policy/permission/environment or deployment is changed here.

Fresh verification:
- Backend suite **260/260,0skips**, own loopback PostgreSQL17/pgvector, synthetic SDK/provider responses; typecheck/build pass.
- New seam tests **13/13**; prior focused baseline64/64.
- Website unit/build **80/80,0skips**,37routes; Theme Check zero offenses.
- Browser/link results and retained initial fixture/browser limitations are recorded in [qualification.json](six-release-evidence-20261112/qualification.json). Do not call the whole website/device matrix accepted.
- The initial fresh parallel SQL fixture hit the global pgvector extension-install race; both failed suite setups/26 skipped cases were retained. The required local extension was explicitly initialized and the unchanged full suite rerun passed260/260. No assertion or application/migration code was changed to hide the setup failure.
- No email/push, model inference, live charge, cleanup/purge, hosted mutation or CI dispatch by this packet. All owned local DB/server/mount resources are closed at final receipt.

Claude should return: exact source/diff; pages/files changed; desktop/mobile/keyboard/error/empty/loading checks and fixture/live distinction; actual unpublished theme ID/preview; remaining business/device/independent findings; and a small backend-gap list only where an existing API demonstrably fails. Keep60/147 and NEVORA recovery patch integration with the finisher; do not close whole issues from contract/local-only evidence. Future91/92/95/97/101 remain deferred under13 and are excluded from this work.

Suggested skills: repository visual/design-system and accessibility skills, existing browser-testing/verification skills, and the project's UI delivery guidance. Review the approved reference and existing implementation first; no blanket redesign, new product scope or paid tooling is requested.

