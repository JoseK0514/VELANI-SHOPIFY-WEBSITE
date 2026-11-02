# Preview validation — 2 November 2026

Actual environment: cloud Linux, Node 24.19.0, npm 11.9.0, system Chromium and Playwright 1.56.1 Firefox/WebKit. This is an isolated company website repository, not the NEVORA application. Source branch: `codex/velani-company-site-20261102`; exact checkpoint and later review fixes are recorded in Git and the final handoff.

## Executed checks

| Scope | Actual result | Evidence |
| --- | --- | --- |
| Shared content, rendering, inquiry and privacy behavior | 26/26 unit checks pass, including native draft links and live-role canonical links | `task3-commit-unit.log`, tests/ |
| Local build | 14 company/service/product/contact/help/legal destinations | `task3-social-build.log`, dist/routes.json |
| Shopify ThemeCheck | 0 errors, 0 warnings | `task3-commit-theme.log`, theme-check.json |
| Chromium / Firefox / WebKit | 92/92 checks pass; home at 320/390/768/969/1440/1920; every route scanned with axe; navigation, inquiry, cookie dialog, fragments, 404/405 and no-JS behavior | browser-acceptance/report.json and screenshots |
| Runtime and safety during browser flows | 0 application errors; 0 unexpected external requests; 0 browser POSTs; explicit server negative POST receives 405 | browser-acceptance/report.json |
| WebKit screenshot driver | 8 exact capture-time CSP messages retained; driver injects `body {}` to synchronize animations; CSP not weakened | webkit-screenshot-csp-attribution.json, browser-acceptance/report.json, installed SDK screenshotter.js |
| Theme ZIP | 70 files, 37 JSON files, CRC/path/template checks pass; inquiry setting false | theme-package-second.log, dist/theme-manifest.json |
| Original theme backup | 38/38 original API MD5 checksums match; 8,325,641-byte portable ZIP, SHA256 `ddce42b3a31afad67d842231cc1fdfbe7d7c1b0b226c7f8fe98aca0e256553d9` | original-theme-export-manifest.json, private export ZIP |
| Shopify draft write/readback | UNPUBLISHED `192965443898`; 70/70 files match: 35 exact bytes, 35 platform-normalized JSON; delivery disabled | shopify/readback-verification.json, per-operation receipts |
| Original MAIN after staging | `190572462394`, same MAIN role, all 38 original files unchanged | shopify/readback-01.json and verification |
| Hosted unauthenticated GET | Returns existing “Please Log In” password page; approved hero not reachable; no Liquid error on password page | private/hosted-preview-first.html and headers |

## Preserved failures

Missing-feature unit REDs, an initial assertion mismatch, first browser run (33 pass/4 fail), expanded browser dependency blocks, WebKit screenshot CSP diagnostics, the failed root dependency installer, initial theme warnings, original export reconciliation attempts and the original binary upload HTTP 413 are preserved. They were not relabeled as passing evidence. The social card now uses lossless WebP with the same pixels (ImageMagick AE=0); its original PNG remains in docs/reference.

## Scope limits

Hosted Shopify visual/routing/Customer Privacy/CAPTCHA acceptance is blocked by the existing storefront password and has not passed. No password was removed. Global policies, pages, menus and settings were not changed. The theme's alternate index navigation is supported by Shopify documentation and passes Liquid rendering and API acceptance, but requires authenticated hosted confirmation.

No real mail, recipient, provider retention, purchase, notification, NEVORA feature, production performance or release was tested. Local preview choice tests and injected failure fixtures do not certify actual platform consent, global opt-out signals or inbox delivery. Full assistive-technology/manual WCAG conformance, final legal/commercial review and production-like field performance remain launch work. These draft notices deliberately identify unverified practices rather than invent facts or dates.

Before any separately authorized publication, review the actual MAIN/page assignments, old `/policies` routes, retail catalog/direct checkout and resource cutover; finalize inquiry recipients/providers/retention, commercial terms and policy dates; prove actual platform consent and hosted accessibility/performance; remove draft-only indexability restrictions only as part of that decision.
