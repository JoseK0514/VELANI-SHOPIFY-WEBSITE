# The Velani website — final cloud handoff

Read this before continuing. Date: 2 November 2026, UTC.

The user approved mockup **2** for The Velani as a software company with **own products and custom development**. That composition is implemented across the company site. Preserve its navy/white visual direction; do not restart exploration. The exact approved original is prior-mockups/2-approved.png, SHA256 df343a0c58e43209b3ba62af0a7184d624ebe531f51a00f50bfa6582549aa370. The two unselected originals and immutable planning review are preserved.

## Exact source and environment

- Repository: /workspace/work/velani-company-site-20261102
- Branch: codex/velani-company-site-20261102
- HEAD: **daf95f62543cf4687ccfd63e7ab4c0739f84ec84**
- Tree: **9810e5271e82bebcf5bd756b2b010cd7559469b5**
- Initial plan/reference commit: 24c86f7; independent review application checkpoint: 6d58a1b; final correction: daf95f6. Complete six-commit history is in the bundle.
- GitHub remote: **none**. All source commits are local and recoverable in the verified bundle; no GitHub publication is claimed. Tracked working directory is clean. The latest active ledger is ignored by Git and preserved here as active-ledger.md; runtime/cache/raw private API files remain in the original workspace and are excluded from transfer.
- Actual imported verification checkout: /workspace/work/velani-company-site-import-verify-daf95f6. Bundle verification, clone, full Git fsck, identical HEAD/tree and clean status all passed; see bundle-verification.json.
- Cloud Linux 6.18.57 x86_64, Node24.19.0, npm11.9.0, Python3.12.14, Chromium154.0.8037.57, Firefox142.0.1, WebKit26.0. See environment-final.json. Local preview server remains at 0.0.0.0:4173 (session69162). The imported verification checkout has no development server or installed dependency folder.

## Review the result

- Shopify draft preview: https://www.thevelani.com/?preview_theme_id=192965443898
- Confirmed Shopify theme editor: https://admin.shopify.com/store/x19hvn-ar/themes/192965443898/editor
- Theme **192965443898**, role **UNPUBLISHED**, name “Velani Midnight · software company · preview 20...” as returned by Shopify.
- The existing storefront password returns “Please Log In” to an unauthenticated browser. It is preserved. Hosted visual/routing/privacy/CAPTCHA acceptance is **blocked/unproved**; the owner can use their own authenticated Shopify session for review.
- desktop.png and mobile.png are actual final Chromium full-page captures. Additional routes, screens and test evidence are in the Git bundle. compiled-local-preview.zip is a static visual preview: extract and serve with `python3 -m http.server 4173`; the source's Node server is the tested CSP/404/405 implementation.

## Implemented

Fourteen destinations: Home, Products, NEVORA, Custom Development, About, Contact, Help, Legal, Privacy, Cookies, Website Terms, Software/Project Information, Accessibility and Security. Shared approved style, responsive navigation, service anchors, readable legal pages, fictional inquiry validation, honest consent states, original social artwork, self-hosted licensed fonts and official icons are included.

NEVORA is **In development**. No launch date, public accounts, prices, native/product completion or unsupported AI claim is introduced. Company identity/contact comes from the verified public NEVORA policy source: VELANI LLC; support@thevelani.com; 1654 Calle Tulipan, Suite100, San Juan, PR00927. The website policies cover this preview and identify unverified operational details instead of inventing them.

Important source paths: src/content.mjs, src/render.mjs, src/inquiry.mjs, src/privacy.mjs, public/assets/velani.css, public/assets/velani.js, scripts/build.mjs, scripts/serve.mjs, scripts/browser-check.mjs, scripts/privacy-regression.mjs, scripts/check-readback.mjs, scripts/package-theme.mjs. Read AGENTS.md, README.md and docs/VALIDATION.md after import.

## Actual validation and review

- Final unit suite: **26/26**, final-unit.log.
- Actual build: **14 routes**. Shopify ThemeCheck: **0 errors/0 warnings**. Theme ZIP: **70 files /37 JSON files**, valid CRC, required paths and section bindings; inquiry activation false.
- Complete post-review Chromium/Firefox/WebKit suite: **92/92**; six home widths320/390/768/969/1440/1920, all routes scanned, links/fragments, keyboard/menu, form validation/no delivery, cookies, no-JS, 404 and405. No application runtime errors, unexpected external requests or browser POSTs.
- Four newly observed privacy regressions failed before fixes; **12/12** confirmations pass across all three engines. Loading cannot overwrite an editable choice; a failed keyboard save restores its action; close/reopen keeps a pending operation locked; no-JS controls accurately explain availability. These are fictional platform fixtures, not actual Shopify consent.
- The original independent review is immutable with all scripts/screenshots retained. Its four minor findings and the parent's additional pending-save case were addressed in one correction pass. See independent-review-original.md and review-response.md. No review finding remains deferred; no second review was represented as having occurred.
- Eight exact WebKit screenshot-driver CSP messages are retained separately. The SDK injects `body {}` to synchronize captures; the page's CSP correctly rejects it. Other runtime errors still fail. Cloud WebKit uses ignored local browser-library links and skips only the ldconfig host preflight, not actual browser execution.
- Two local, pre-correction composition baseline samples: mobile home LCP648ms, contact624ms, CLS0; cold cache,150ms latency,1.6Mbps,CPU4x. These are local lab samples on a shared cloud host, not final hosted/field performance or INP acceptance.
- Independent reviewer additionally checked16 route/width axe/geometry combinations, every route at1024px,66 URL/fragment destinations, keyboard/offline/long-Unicode and privacy failure fixtures. Its720px reflow check is not a browser-toolbar zoom or full assistive-technology audit.

## Shopify state and preservation

The latest API readback has **96 total draft files**: **70 verified package files** (35 exact byte matches and35 platform-normalized JSON matches) plus **26 retained inherited files**, each checked against the original. The original MAIN theme **190572462394** retains its role and all **38 original checksums**. No old draft was overwritten or deleted. Each write checked the exact UNPUBLISHED target first; all seven file-operation receipts and both readbacks are retained.

Original-main portable backup:38/38 API MD5 matches. SHA256 ddce42b3a31afad67d842231cc1fdfbe7d7c1b0b226c7f8fe98aca0e256553d9. Shopify-generated JSON headers/formatting were reconciled only when the resulting bytes matched the original checksum. Raw signed asset URLs remain private and are excluded. Original/failed unit, browser, installer, export, upload413 and readback-mismatch evidence is preserved, not relabeled as success.

The draft's supported alternate index templates keep navigation in the exact preview without publishing global Page resources. MAIN-role links retain their canonical /pages destinations. Native delivery requires both MAIN role and an explicit enabled setting; the stored setting remains **false**. No inquiry, real notification, purchase, production configuration, merge, CI dispatch or release was performed. NEVORA source and permissions were not touched.

## Pending work before any separately authorized launch

Authenticated hosted routing/visuals, real Customer Privacy behavior/opt-out signals and native CAPTCHA remain unaccepted. Delivery, recipient mailbox, actual providers/retention and native uncertain submissions require separate acceptance while real sends remain disabled here. Global Page/menu assignments, legacy /policies endpoints, retail/catalog/direct checkout/gift-card exposure and the26 inherited files need a concrete store-resource cutover. Final legal/jurisdiction/commercial decisions, policy effective dates, operational privacy handling, full accessibility and production/field performance remain pending. Draft noindex settings also require an explicit launch decision. The existing protection must remain intact during continuation.

Decisions made, their costs, and reviewer scope rulings are exhaustively recorded in rulings-and-deferred.md and the active ledger. The reporting-label correction was made to meet the user's explicit exact-state requirement; the original report remains unchanged.

## Import

Verify SHA256SUMS, then:

```sh
git bundle verify velani-company-daf95f6.bundle
git clone --branch codex/velani-company-site-20261102 velani-company-daf95f6.bundle velani-company-site
cd velani-company-site
git rev-parse HEAD HEAD^{tree}
npm ci
npm test
npm run dev
```

The two Git outputs must match the HEAD/tree above. The cloned origin is the bundle file, not a GitHub repository. Keep the current ledger and immutable evidence; create a new evidence directory for each browser run. Install supported Playwright browser/host dependencies in the new environment rather than transferring dependency folders or cloud runtime configuration.

Theme ZIP SHA256:3096cc2d54cd6b01b40abceb0b218e3a96f65b816ceab4fa5437b2ed190d365d.
Git bundle SHA256:73e3bd02bdb38bcc8a2a28034ada44807affc167566f510f533b3294cdd94433.
