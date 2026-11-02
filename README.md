# The Velani company website

Approved mockup 2 implemented as a 14-route local website and an **unpublished Shopify theme**. This is the software company site: own products and custom development. NEVORA remains **In development**.

## Review

- Shopify theme: **192965443898**, role **UNPUBLISHED**. [Open preview](https://www.thevelani.com/?preview_theme_id=192965443898) or [open theme editor](https://admin.shopify.com/store/x19hvn-ar/themes/192965443898/editor). The existing storefront password blocks unauthenticated hosted inspection; sign in through your own Shopify account. The public site has not been changed.
- Approved visual: [reference](docs/reference/approved-homepage.png).
- Local source branch: `codex/velani-company-site-20261102`. This isolated repository is separate from NEVORA. The requested private GitHub destination is `JoseK0514/VELANI-SHOPIFY-WEBSITE`; repository creation is currently blocked by the connection permissions. See [GitHub transfer status](docs/handoffs/github-transfer-2026-11-02.md).
- Page content and the policy directory are complete **for preview review**. Final published notices require verified website delivery, vendors, retention and commercial terms. This is not a legal compliance certification.

## Downloads

- [Complete source/evidence handoff](deliverables/2026-11-02/velani-company-website-daf95f6-handoff.zip), including the original MAIN theme backup, original mockups, complete-history source bundle, compiled preview, latest active ledger and reviews.
- [Importable unpublished Shopify theme](deliverables/2026-11-02/velani-midnight-unpublished.zip).
- [SHA256 checksums](deliverables/2026-11-02/SHA256SUMS).

These are immutable snapshots of application checkpoint `daf95f6`. Its original handoff describes the pre-GitHub state at the time it was created; the transfer status below is the current record.

## Run locally

Node 24+ and Python 3 are needed for packaging. Run `npm ci`, then `npm run dev` and open `http://localhost:4173`. The server builds all routes and accepts GET/HEAD only. Its preview inquiry rejects POST with 405.

Run `npm test`, `npm run build`, `npm run check:theme`, `npm run package:theme` and `npm run check:readback`. The importable archive is `dist/velani-midnight-unpublished.zip`; `dist/theme-manifest.json` records every file and the ZIP SHA256. Build replaces `dist`, so package after the final build.

Browser checks: install Playwright browsers and host dependencies using the supported installer, start the local server, then run `VELANI_ENGINES=chromium,firefox,webkit npm run check:browser`. `VELANI_BROWSER_RUN` chooses a new evidence directory; preserve failed runs. `VELANI_CHROMIUM_EXECUTABLE` can select an installed Chromium. `VELANI_PREVIEW_URL` defaults to `http://127.0.0.1:4173`. Browser run directories use timestamps by default and refuse existing names. `npm run check:privacy` runs the four asynchronous/no-JavaScript privacy regressions; use the same `VELANI_ENGINES` setting for three-engine coverage.

## Draft behavior

The form validates a draft locally and states that nothing was sent. No field content is saved to browser storage. The Shopify `inquiries_enabled` setting is **false**, and native live delivery also requires the MAIN role. No real inquiry was sent or recipient tested.

Cookie controls use the Shopify Customer Privacy API when available. The local version demonstrates choices only for the current document. Missing/failing platform consent never becomes a fake success, and no new optional analytics or marketing integration is included.

Draft links use Shopify's supported alternate index templates (`?view=velani-privacy`, for example) and preserve the exact preview theme ID. This makes the 14 company destinations reviewable without publishing or assigning global Shopify Page resources. MAIN-role navigation has canonical `/pages/...` destinations; those resources must be separately prepared before any authorized launch.

The new layout does not render inherited retail templates or global legacy policy text. Existing products, checkout capabilities, coffee policies, menus, other drafts, settings, DNS and password protection remain store resources and require a separate cutover decision. This theme does not disable those global systems.

## Preservation and acceptance

See `evidence/` for actual browser, unit, theme and Shopify readback results, including failed attempts. `evidence/private/` contains raw API/export data and temporary signed asset URLs and is excluded from Git and ordinary source archives. The original theme export has **38/38 matching API checksums**. The draft has 96 total files: 70 verified package files (exact bytes or Shopify-normalized JSON) and 26 retained inherited files, each checked against the original. All 38 original MAIN files are unchanged.

Cloud WebKit uses already available user-space libraries linked only inside `.cache`; no application or machine configuration was changed. Playwright's host `ldconfig` check does not see those user-space libraries, so the cloud run explicitly skips that preflight while executing the real browser. WebKit's screenshot driver injects `body {}` to synchronize animations; the site correctly rejects it under its CSP. Those exact capture-time messages are retained separately from application runtime failures. See the diagnostic JSON and browser report; the site CSP was not relaxed.

The source, original references, active ledger and review reports must be retained. Do not publish, enable delivery, merge into NEVORA or modify production as part of this preview task.
