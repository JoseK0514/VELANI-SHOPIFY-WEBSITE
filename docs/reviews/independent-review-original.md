# Independent whole-branch review — The Velani

Date: 2 November 2026. Reviewer: fresh-context independent review agent. Original report; preserve unchanged.

Base: `24c86f7`. Application candidate: `6d58a1b6bc561df6623a56458ac7da796d142eef`. Documentation HEAD reviewed: `c79ad5907c186535808dab2930126ce8602096ba`. Worktree: `/workspace/work/velani-company-site-20261102`, branch `codex/velani-company-site-20261102`.

Read AGENTS.md and the review package first; reviewed the source additions, specifications, implementation plan, active ledger and all Ruling lines, current validation documentation, selected reference, tests, browser runner, build/package/export/readback scripts, and saved evidence. Parent supplied environment/performance evidence and a documentation-only validation addition during review; application source remained frozen. This review made no checkout edits, Git changes, external writes, real sends, production actions, or further agent dispatches. Review scripts and screenshots are under `/workspace/outputs/velani-independent-review/`.

## Strengths

- The implementation follows the selected mockup 2. The actual 969px homepage preserves the reference's navy split hero, service list, light NEVORA band, workflow illustration, and project invitation. The expanded footer supports the required destinations. Independently inspected service/contact/privacy layouts at 320, 1024 and 1440px and security at 320px remain coherent and readable. NEVORA is visibly In development, without invented launch, native-release or commercial claims.
- The preview inquiry is disabled in static markup until its JavaScript handler is attached, uses a preview-specific action, and never invokes transport in preview mode. The native delivery branch requires both MAIN role and an explicit enabled setting. Repeated clicks, offline use, unavailable JavaScript, markup-shaped text and long Unicode input did not turn into delivery or persistent personal information in the tested local flows.
- Canonical content/rendering is shared between the local site and Shopify output. Theme role-dependent draft links avoid publishing global Page records merely to make a preview. All 66 distinct local internal URL/fragment destinations independently checked resolved correctly.
- Privacy API absence and rejection produce explicit failures instead of fake success. A rejected withdrawal retained the provider's previously granted analytics state in the UI. No optional integration is included in this implementation.
- The project preserves original failures and distinguishes actual local testing, API upload acceptance, and blocked hosted acceptance. No Critical or Important defect was established in the authorized draft scope.

## Issues

### Critical

None found.

### Important

None found in the unpublished, delivery-disabled draft scope. This is not a publication approval.

### Minor

**M1 — A delayed initial privacy read overwrites an editable visitor choice.**

- File: `public/assets/velani.js:63`, `public/assets/velani.js:69`.
- Reproduction: in a local browser fixture, change only the HTML platform marker to `shopify`; provide `Shopify.loadFeatures` that resolves after 1,000ms and then exposes `currentVisitorConsent()` returning all three categories `no`. Open Cookie choices and check Analytics before that read resolves. The checkbox is enabled while the three action buttons are disabled. Analytics is checked immediately, then silently becomes unchecked when the read finishes. Executed at 320×568 in Chromium; exact fixture/result: `velani-independent-review/privacy.mjs` and `privacy.json`.
- Impact: a visitor can make a visible selection during loading and lose it without explanation. This did not save consent or start processing, so the observed effect is a recoverable UI mistake, not an unauthorized grant.
- Fix: make category inputs unavailable while the initial read is pending, or preserve explicitly dirty selections rather than overwriting them. Keep close/Escape available and show a clear loading state. Use the same consistent busy policy during saves to avoid editing values that completion then overwrites.

**M2 — A delayed consent failure removes keyboard focus and does not restore it.**

- File: `public/assets/velani.js:63`, `public/assets/velani.js:76`.
- Reproduction: fixture provider returns analytics `yes`, other categories `no`; `setTrackingConsent` calls back with an error after 150ms. Open the dialog, focus Reject optional, press Enter, and wait for the callback. The rejection message is correctly shown and analytics stays checked, but `document.activeElement.tagName` is `BODY` while Reject optional is enabled again. The next Tab reaches Accept optional. Exact keyboard result: `velani-independent-review/focus-nojs.json`; asynchronous provider fixture: `privacy.mjs`.
- Impact: focus indication disappears after the keyboard action and immediate Space/Enter cannot retry the same control. Recovery by Tab remains possible and consent is not falsely reported as saved, which limits severity.
- Fix: preserve focus while preventing duplicate actions, for example with an appropriate guarded aria-disabled busy state, or restore the initiating action when the pending operation finishes if the dialog is still open and the user has not intentionally moved focus. Do not steal focus after close/Escape or a later interaction.

**M3 — The readback summary labels a matched subset as the draft file count.**

- File: `scripts/check-readback.mjs:34`; related handover wording: `docs/VALIDATION.md:18` and `README.md:32`.
- Evidence: `readback-01.json` contains **96 draft files**, whereas the expected package and the verification loop contain **70 files**. The extra **26 inherited files** are intentionally preserved, including retail assets/sections and `templates/gift_card.liquid`. The `draftFiles` summary value is currently `files.length`, meaning the number of expected package files verified, not the total remote inventory. The 70 expected matches and 38 unchanged MAIN files are supported; this is not a finding that those comparisons failed.
- Impact: a reader can mistake 70/70 package acceptance for a complete 70-file remote theme inventory and overlook inherited resources during later cutover review. No leak through the newly generated company-page links was demonstrated.
- Fix: report `verifiedPackageFiles: 70`, `totalDraftFiles: 96`, and an explicit 26-file retained-extra inventory, ideally verifying these extras against their baseline. Preserve them rather than deleting them to make the counts agree. Carry the distinction into the handover.

**M4 — Cookie-choice buttons remain actionable-looking when JavaScript is unavailable.**

- File: `src/render.mjs:26`, `src/render.mjs:72`; JavaScript wiring: `public/assets/velani.js:73`.
- Reproduction: Chromium context with `javaScriptEnabled:false`, 320×568; visit `/pages/cookies`, click Open cookie choices. The button is enabled but the dialog remains invisible. The always-rendered footer Cookie choices button has the same dependency. Result: `velani-independent-review/focus-nojs.json`.
- Impact: visitors receive a dead privacy-control action without an explanation. The cookie notice remains readable and no newly added optional processing runs, so this is minor rather than a consent breach.
- Fix: progressively enable/reveal dialog-opening buttons after their handler is installed; provide a no-JavaScript explanation or a meaningful notice link when controls cannot run. Keep the existing safe form behavior.

## Tests actually run by this reviewer

- `npm test`: **26/26 passed**. All three test files were inspected before running; they do not write checkout files or deliver messages.
- Direct `@shopify/theme-check-node` `check('dist/theme')`: **no offenses**. Used the library directly instead of the repository script because that script overwrites evidence.
- Independent Chromium 154 local browser checks against the existing `127.0.0.1:4173` server: Custom Development, Contact, Privacy and Security at **320, 390, 720 and 1440 CSS px**, 900px high. All 16 combinations had no horizontal page overflow and **zero axe WCAG 2/2.1/2.2 A/AA violations**. Screenshots at 320 and 1440 saved outside checkout. No console/page errors, external requests or POST attempts occurred in this pass.
- All **14 routes at 1024×768** returned 200 without horizontal page overflow. Captured and visually inspected service/contact/privacy screenshots at that size.
- **66 unique local internal URL/fragment destinations** returned 200 with fragment targets present. Checked rendered sources/tests for forbidden retail copy and product availability; new routes use the Velani content set.
- 320×568 keyboard menu opening, Tab to Products, Escape close and focus return; cookie dialog keyboard traversal, scrolling and Escape return; invalid form focus; repeated valid preview clicks; offline preview check; untrusted query/input text; no local/session storage of the entered fictional values; no-JavaScript disabled form and visible navigation. All relevant safety expectations held. Native dialog traversal can pass through browser chrome/body between cycles; no background page control was observed becoming actionable while modal.
- Injected **4,001 Unicode characters** into the message field beyond the native maxlength to exercise application validation: preserved the entered value, showed the 4,000-character error, focused the message field, and did not send it.
- Local browser privacy fixtures for API absence, asynchronous rejection and delayed initial loading. Absence/rejection messages were honest; M1/M2 were reproduced. These fixtures are not actual Shopify API acceptance.
- Inspected original reference and supplied 969/390 homepage screenshots, plus independently captured service/contact/privacy/security images. Layouts preserve the selected design; no redesign is recommended.

The **720px viewport** checks exercise the reflow width corresponding to a 1440px browser at 200% zoom. They are not a browser-toolbar zoom test, text-only zoom test, or full manual WCAG certification. This reviewer did not rerun Firefox/WebKit or the build: the existing three-engine report and compiled output were inspected, and rerunning the build would mutate the checkout. The parent-supplied 648/624ms LCP and zero-CLS samples were read as two local lab measurements, not independently rerun or accepted as hosted/field performance.

## WebKit CSP classification

The separation is justified for the recorded evidence. The browser report contains **8 exact capture-time diagnostics** and zero application runtime errors. In the installed Playwright SDK, `node_modules/playwright/node_modules/playwright-core/lib/server/screenshotter.js:28` creates an inline style with `body {}` when `syncAnimations` is true; line 215 obtains this flag from the browser delegate. The preserved controlled diagnostic identifies the same error during both screenshot variants, with no baseline message.

The runner requires WebKit, an active screenshot, and the exact CSP message before classifying it separately. It retains every diagnostic and does not weaken CSP. Keep this narrow classification tied to this SDK and capture operation; it must not become a general suppression of stylesheet or runtime errors. This reviewer inspected source and saved evidence but did not independently rerun the WebKit reproduction.

## Recommendations

Address the four minor findings in the single planned fix pass, with focused regressions for delayed checkbox loading, keyboard save failure, no-JavaScript controls and inventory labels. Preserve the approved visual, original evidence and this report. No new visual exploration, external integration, global Shopify mutation or NEVORA work is warranted by this review.

## Declined to judge

- Authenticated hosted Shopify visual/routing behavior, native Customer Privacy behavior and CAPTCHA: the existing storefront password blocks unauthenticated acceptance; this reviewer did not bypass it or equate Liquid/unit/API acceptance with hosted behavior.
- Live inquiry acceptance, uncertain native navigation, mailbox receipt, abuse protection, provider retention and delivery guarantees: delivery is deliberately disabled, and real sends are outside authorization. A future MAIN-enabled form requires separate acceptance of these paths.
- Global policy endpoints, retail/catalog/checkout exposure, gift-card behavior, Page/menu assignments and publication migration: these are shared or inherited resources intentionally preserved for later cutover. M3 records the inherited inventory; the new theme cannot be treated as disabling those platform systems.
- Legal sufficiency, registration jurisdiction, final policy dates, commercial terms and operational handling of privacy/security requests: draft notices and sourced contact details do not establish those business decisions or legal compliance.
- Full assistive-technology conformance, actual desktop toolbar/text zoom and production performance/field INP: this review ran the specific local geometry, axe and keyboard checks listed above, not those broader evaluations.
- NEVORA application functionality or native/product release readiness: outside this isolated company-site work; development status must remain unchanged.

## Assessment

**Ready to merge as an isolated draft: Yes, with minor follow-up.** No Critical or Important issue was established within the authorized unpublished preview. The approved composition, complete local routes, safe inquiry behavior and honest platform limitations are supported by source and executed checks. M1–M4 should be cleaned up during the planned fix pass, but none demonstrates data delivery, unauthorized processing, a broken core company destination or a draft-blocking visual defect.

**Draft-readiness: Ready for owner review, with the four minor issues recorded.** The stored readback supports all 70 package files and the unchanged 38-file MAIN baseline, while the actual duplicated draft retains 96 total files. Hosted acceptance remains explicitly unproved.

**Publication-readiness: Not ready.** Authenticated hosted routing/visual/privacy/CAPTCHA checks, finalized inquiry and policy practices, the concrete global legacy-resource cutover, applicable accessibility/performance acceptance and separate publication authorization remain necessary. Do not enable delivery, publish the theme, remove the password, or infer NEVORA launch readiness from this draft review.
