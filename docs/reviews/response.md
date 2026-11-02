# Review response and scope decisions

Original reviewer report preserved unchanged as `independent-review-original.md` (SHA256 `92197e2ca55d23ec62579bd8d54798622e0410c0939ba41ea8bfa4ed97fdf837`). Citation erratum from reviewer: M4's cookie-page control is at original `src/render.mjs:70`, not line 72. The original report is not rewritten.

The reviewer found no Critical/Important issue and four Minor items within the unpublished draft. The implementer grades the following by user impact for the single fix pass:

- **M1 + M2: Important, asynchronous privacy interaction integrity.** A visitor's visible choice can be overwritten while loading; after a rejected keyboard withdrawal, focus is lost and the next Tab reaches the opposite Accept action. Although no integration is activated in this draft, those are material failures of the intended privacy controls. Category controls must be unavailable while a read/write is pending, and completion must preserve a useful focus target without stealing focus after closing.
- **P1: Important, pending save can be reopened into a concurrent action.** Parent's additional browser reproduction shows close/reopen clears the busy state before acknowledgement. Serialize the existing pending operation across dialog close/reopen; do not add retries or new integrations. The original failing regression is preserved with M1/M2.
- **M4: Important, unavailable privacy interaction presented as enabled.** With JavaScript unavailable, a visibly enabled Cookie choices action has no result or recovery explanation. The privacy route needs accurate availability: progressively enable only after wiring, with a readable no-JavaScript explanation. Existing navigation and disabled inquiry behavior must remain.
- **M3: Minor reporting correction required by the requested exact handoff.** `check-readback.mjs`'s `draftFiles:70` means expected package files verified, not the full remote inventory. The full remote inventory is **96**, comprising **70 package files and 26 retained inherited files**. The original evidence and handover must state this distinction; do not delete inherited files. The original label is not a failed comparison or proof of a 70-file-only remote theme. The user explicitly requested the exact environment state; correcting the report fields and checking the 26 retained file hashes is part of that reporting requirement. This limited reporting correction is an exception to the skill’s default of deferring minor polish. It changes no application behavior, incurs a field-name migration for a consumer of this new report, and preserves the original summary unchanged.

## Decisions on behavior set aside by the reviewer

1. Authenticated hosted UI/routing/privacy/CAPTCHA remains unaccepted because the existing storefront password blocks inspection. Keep it protected; cost: platform acceptance remains pending for the owner.
2. Real inquiry delivery, mailbox receipt, native uncertain navigation, abuse controls and actual provider retention remain disabled/unverified. They require their own later acceptance; cost: this preview cannot be advertised as a live inquiry service.
3. Global policy/catalog/checkout/gift-card/Page/menu cutover remains outside this theme-only preview. Preserve inherited resources and disclose all 26 extras; cost: publication needs an actual store-resource cutover review.
4. Final legal sufficiency, jurisdiction, dates, commercial terms and operational privacy handling remain business/legal work. Use the sourced identity and honest draft notices; cost: draft notices are not final legal approval.
5. Full assistive-technology conformance, actual browser-toolbar/text zoom and production/field performance remain unevaluated beyond the recorded geometry/axe/keyboard/local lab checks. Cost: no conformance or production-performance certification.
6. NEVORA application or release readiness remains outside this isolated site. Keep In development; cost: product/native delivery cannot be inferred from this marketing preview.

Focused RED evidence: `evidence/privacy-regression-red/report.json`. Fix and final verification results are recorded in the active ledger and final handoff. No second reviewer is dispatched; observed regressions and the whole suite govern the one fix pass.

## Closure

The four focused browser regressions all failed before changes, then passed in Chromium, Firefox and WebKit (12/12). Loading and saving now disable category edits; an outstanding operation remains busy when the dialog is reopened; save status receives focus before native disabling and the initiating action regains focus only if the visitor has not moved or closed the dialog. Cookie openers start disabled and are enabled after wiring, with a readable no-JavaScript explanation.

The inventory report now uses explicit total/verified/inherited fields and checks all retained inherited checksums against baseline. The original 70-only summary and original review remain unchanged. The complete post-review browser suite passes 92/92 with no application runtime errors, unexpected external requests or POSTs; all 26 unit tests and ThemeCheck pass. Latest Shopify readback confirms the four changed files, all 70 package files, all 26 inherited files and all 38 untouched MAIN files. No further review pass or production action was performed.
