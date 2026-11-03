# The Velani company website

The Velani company website (www.thevelani.com): a static site generator that produces a local preview and a Shopify theme. It presents NEVORA, the scheduling, time clock and payroll calculation app for shift teams (in development, offered to businesses by quote), and Velani's custom development work. The current design is "Night" (`src/night/`), approved 2026-11-02; the earlier navy/paper mockup in `docs/reference/approved-homepage.png` is superseded.

## Routes and themes

- 18 routes (`src/content.mjs`): home, NEVORA, products, custom development, about, contact, help, legal index, website privacy notice, cookies and preferences, website terms, software and project terms, accessibility, security, and four NEVORA policy pages (support, privacy policy, terms of use, account deletion) generated from the NEVORA app's approved policy source (`src/nevora-policies.mjs`). Each route becomes `templates/page.<slug>.json` with a `sections/velani-<slug>.liquid` section, plus `templates/index.velani-<slug>.json` so unpublished drafts can be reviewed through `?preview_theme_id=…&view=velani-<slug>` without published page resources.
- Shopify store `x19hvn-ar`. Theme IDs are recorded in the delivery notes under `docs/`; only unpublished themes are changed without the owner's explicit instruction to publish.
- Historical snapshots of the first (navy/paper) delivery, including the original MAIN theme backup, are in `deliverables/2026-11-02/` with SHA256 checksums.
- Page content and the policy directory are complete for review. Final published notices require verified website delivery, vendors, retention and commercial terms. This is not a legal compliance certification.

## Run locally

Node 24+ and Python 3 are needed for packaging. Run `npm ci`, then `npm run dev` and open `http://localhost:4173`. The server builds all routes and accepts GET/HEAD only. Its preview inquiry rejects POST with 405.

Run `npm test`, `npm run build`, `npm run check:theme`, `npm run package:theme` and `npm run check:readback`. The importable archive is `dist/velani-midnight-unpublished.zip`; `dist/theme-manifest.json` records every file and the ZIP SHA256. Build replaces `dist`, so package after the final build.

Acceptance scripts in `scripts/checks/` run against the local server in Chromium and write evidence under `evidence/`: `acceptance.mjs` (home and NEVORA journeys, the time-clock demo with mouse, touch and keyboard, Spanish, no-JavaScript and reduced-motion states, the NEVORA enquiry variant, axe), `scroll-stability.mjs` (finger-like scrolling on a phone: layout shift, long frames, header flips, overflow) and `clipping.mjs` (every route at 320px and 200% zoom). Set `VELANI_CHROMIUM_EXECUTABLE` when Playwright's own Chromium is not installed.

Browser checks: install Playwright browsers and host dependencies using the supported installer, start the local server, then run `VELANI_ENGINES=chromium,firefox,webkit npm run check:browser`. `VELANI_BROWSER_RUN` chooses a new evidence directory; preserve failed runs. `VELANI_CHROMIUM_EXECUTABLE` can select an installed Chromium. `VELANI_PREVIEW_URL` defaults to `http://127.0.0.1:4173`. Browser run directories use timestamps by default and refuse existing names. `npm run check:privacy` runs the four asynchronous/no-JavaScript privacy regressions; use the same `VELANI_ENGINES` setting for three-engine coverage.

## Draft behavior

On drafts the form validates locally and states that nothing was sent; no field content is saved to browser storage. The Shopify `inquiries_enabled` setting defaults to **true** (owner-approved 2026-11-02): on the published MAIN theme the Contact page uses Shopify's native contact form, and inquiries go to the store's sender address. The `?interest=nevora` variant asks about team size and locations and makes the message optional; if the message is empty, the browser fills it with those details before the native submission.

Cookie controls use the Shopify Customer Privacy API when available. The local version demonstrates choices only for the current document. Missing/failing platform consent never becomes a fake success, and no new optional analytics or marketing integration is included.

Draft links use Shopify's supported alternate index templates (`?view=velani-privacy`, for example) and preserve the exact preview theme ID, so every destination is reviewable on an unpublished theme without touching global Shopify Page resources. MAIN-role navigation has canonical `/pages/...` destinations; the 17 pages with matching handles and templates exist in the store.

The new layout does not render inherited retail templates or global legacy policy text. Existing products, checkout capabilities, coffee policies, menus, other drafts, settings, DNS and password protection remain store resources and require a separate cutover decision. This theme does not disable those global systems.

## Preservation and acceptance

See `evidence/` for actual browser, unit, theme and Shopify readback results, including failed attempts. `evidence/private/` contains raw API/export data and temporary signed asset URLs and is excluded from Git and ordinary source archives. The original theme export has **38/38 matching API checksums**. The draft has 96 total files: 70 verified package files (exact bytes or Shopify-normalized JSON) and 26 retained inherited files, each checked against the original. All 38 original MAIN files are unchanged.

Cloud WebKit uses already available user-space libraries linked only inside `.cache`; no application or machine configuration was changed. Playwright's host `ldconfig` check does not see those user-space libraries, so the cloud run explicitly skips that preflight while executing the real browser. WebKit's screenshot driver injects `body {}` to synchronize animations; the site correctly rejects it under its CSP. Those exact capture-time messages are retained separately from application runtime failures. See the diagnostic JSON and browser report; the site CSP was not relaxed.

The source, original references, active ledger and review reports must be retained. Publishing a theme, enabling live delivery, changing production store settings or merging into NEVORA happen only on the owner's explicit instruction.
