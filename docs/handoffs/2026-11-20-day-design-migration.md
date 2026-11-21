# Day design: theme migration (started November 20, 2026)

The approved "Day" design (mockups and reviews in `docs/design/2026-11-18-premium-software/`) is moving into the real theme one page at a time. Source work only: no Shopify write, publication, store setting, menu, policy or page-resource change was made.

## How it works

- Every route names its Day body with `day: '<body>'` in `src/content.mjs` (`doc` for legal pages, `account` for the trial and billing pages). The Night design was removed on November 21 (below); the last commit with it is `d58806f`, and the recovery tags under `archive/velani-20261112/` keep the older history.
- `src/day.mjs` renders the Day header, phone menu and footer (English and Spanish) and the page bodies in `src/day/*.body.html`.
- `src/day/day.css` and `src/day/day.js` build into `velani-day.css` and `velani-day.js`. Pages load only these, their own page files and `velani.js` (forms and cookie choices); no web font (system fonts).
- `src/shared.mjs` holds what every page shares: icons, Spanish links, the language switch, the wordmark, the assistant markup and the NEVORA policy pages. `src/shared/` holds the billing script (`velani-commerce.js`) and the assistant (`assist.*`, `velani-assistant.js`).
- Theme: one layout for every page, with the `velani-day-header-*` / `velani-day-footer-*` snippets; each page's case branch captures its own Day assets in `velani_head`. The cookie dialog travels with the footer.
- The assistant keeps its earlier dark look (its tokens are scoped to `.ast-root` in `velani-day.css`) until it gets its own Day styling. Since November 21 it speaks about products only (below).

## Status

| Page | Day | Notes |
| --- | --- | --- |
| About (EN) | Done | Products-only facts; route description updated |
| Home (EN) | Done | Ported by `scripts/port-day-home.py` (one-time); trial start and fine print follow Jose's current wording; device screens are pictures (`role="img"`, inner screens hidden) |
| NEVORA (EN) | Done | Ported by `scripts/port-day-nevora.py` (one-time); device, plan and app-screen styles moved to `src/day/devices.css` (Home and NEVORA); the schedule demo says "Not published" instead of "Draft" (public pages never say draft); `#relay` is the closing Relay line; the section bar carries the trial |
| Plans (EN) | Done | Keeps the `velani-commerce.js` contract: `#top .hcopy` (h1, `p.lead.fade`, `.hacts`, `.hfact`) for the Owner handoff, the `[data-pcard]` team-size card, `#price` with the quote and billing links, the commerce template. `src/day/plans.js` only reads the card's `data-n` (price per employee, matching plan, real dates) |
| Contact (EN) | Done | Jose's form unchanged (inquiry-* fields, velani.js checks, preview check, Shopify `form 'contact'` only on the main theme with inquiries on, email otherwise). Four topics: trial, more than 30, Relay waitlist, something else (no custom work). `src/day/contact.js` keeps the side, the button words, the message label and the team fields in step with the topic. `velani.js` change: an exact topic choice now wins in `syncTopics` (the three-choice form behaves as before) |
| Help (EN) | Done | Ported by `scripts/port-day-help.py` (one-time). Search and topic chips over 13 answers, two keys, deletion steps; Jose's client request section (hub form, live/preview branches unchanged) sits in a closed "Already a Velani client?" disclosure that a `#client` or `?interest=client-…` link opens |
| Sign in (EN) | Done | Jose's three sign-in facts, the two keys, and NEVORA support at the end; no client form or offer, as on Jose's page | Contact keeps the live/preview inquiry safeguards from `src/render.mjs`; Help keeps existing-client support as one quiet line (recommended November 20) |
| Rondo, Relay (EN) | Done, new routes | `/pages/rondo` and `/pages/relay`, ported by `scripts/port-day-products.py` (one-time) with `src/day/product.css` (the NEVORA styles their designs use). Header, footer, Home and About now link to them. Relay has no form of its own: Join the waitlist opens Contact on the Relay topic. **At publish time** these two need Shopify Page resources (handles `rondo` and `relay`, templates `page.rondo` and `page.relay`); creating them is a store change for Jose's go-ahead. Until then they work on the theme preview through `?view=velani-rondo` and `?view=velani-relay` |
| Spanish pages | Done | `/pages/es`, `es-nevora`, `es-planes`, `es-contacto`, `es-ayuda`, `es-entrar`, `es-nosotros`. Each is its English body plus `src/day/es/<page>.json` (exact phrase pairs; the build fails if an English phrase changes without its Spanish), using Jose's terms (el dueño, lugar de trabajo, tarjetas de tiempo, comprobantes de nómina, ¿Olvidaste tu contraseña?, Perfil, Eliminar mi cuenta). Page scripts pick their words by the page language; the NEVORA time clock and the Home Rondo conversation start in Spanish. The drawn app screens stay in English (sample illustrations); translating them is open. Rondo and Relay have no Spanish pages yet; Spanish pages link them marked `hreflang="en"`. `es-productos`, `es-a-la-medida` and the Spanish trial/billing helper pages stay Night |
| Legal and NEVORA policy pages | Done (restyle) | All 16 legal, policy and legal-index routes (EN and ES) get `day: 'doc'` in `src/content.mjs`: Day header, footer and head with `src/day/legal.css`; the bodies are still Jose's `legalDoc`, `legalIndex` and `policyMain` output, word for word. Shopify's not-found templates and `/policies/...` fallback use the same look. |
| Custom software and project terms | Removed from the source (November 21) | Decision 2. `/pages/custom-development`, `/pages/es-a-la-medida` and `/pages/software-project-terms` are gone from the routes, the language maps, the Legal index and the policy fallback (which now points to the NEVORA terms). A test checks that no page links to them. At publish time the matching Shopify Page resources still exist in the store: removing them, and redirects (suggested: custom-development and es-a-la-medida to Products, software-project-terms to Legal), are publish-time decisions for Jose. Existing clients whose contracts cite the project terms may still need a copy; keep one on file or redirect to a page that explains where to ask |
| Products (EN and ES) | Done | One light page outside the menus: NEVORA, Rondo and Relay as index rows (`src/day/products.body.html`, Spanish pairs in `src/day/es/products.json`), one filled action (free trial) |
| NEVORA trial and billing pages (EN and ES) | Done | `nevora-start`, `nevora-verify`, `nevora-billing`, `nevora-billing-return`, `es-prueba`, `es-configurar`, `es-facturacion`, `es-pago` (`day: 'account'`, `dayCommerce()` in `src/render.mjs`, `src/day/account.css`). One centered column with the NEVORA icon. Every `velani-commerce.js` hook kept: `#setup[data-account-page]`, the heading `#setup-t` (tabindex -1), `[data-setup-lede]`, `[data-setup-acts]`, `[data-setup-card]`, `[data-off]`, `[data-announce]`, `[data-verify-retired]`, the `#velani-commerce` template, and the trial page's redirect to the trial request while signup is closed. The script's own markup (`.hb`, `.setup-facts`, `.setup-steps`, `.setup-note`, `.setup-out`) is styled in Day |

| Rondo and Relay (ES) | Done, new routes | `/pages/es-rondo` and `/pages/es-relay` (pairs in `src/day/es/rondo.json` and `relay.json`; `ES_PATHS` maps them, so the Spanish header, footer, Products and Home now link them). The Spanish Rondo page asks three questions in Spanish and two in English (marked `lang="en"`), the reverse of the English page; `rondo.js` picks its answers and button words by the page language. Publish-time: two more Shopify Page resources (`es-rondo`, `es-relay`) |
| Drawn app screens (ES) | Done | Spanish pages draw the app screens in Spanish: `src/day/es/screens.json` holds exact phrase pairs per screen (the build fails if an English screen changes without its Spanish), and Spanish bodies use `{{ES_SCR_…}}`. Wording follows NEVORA's own Spanish (Inicio, Horario, Tiempo, Nómina, Equipo, Próximo turno, Entrada registrada, Período de pago, Aprobada, En espera) and the kiosk's terms. `home.js` and `nevora.js` write the live greeting, date and a. m./p. m. in the page language; Home's payroll chip says Calculando/Calculado. The lock screen was already Spanish; Home's Spanish Rondo conversation is unchanged |

Every route is now on Day.

## Facts to carry into the next pages

- The 30 free days run from workplace provisioning (creation in NEVORA), per `development` commit 5d2e545. The mockups say "the day your workplace is ready"; use the provisioning wording in the theme.
- Custom work is removed (decision 2 in `SITE-STRUCTURE.md`). Existing-client support stays on Help as one quiet line using the client request service (decided November 20); no new custom work is offered.
- For Jose (found while porting Plans): `velani-commerce.js` picks the quote link with `#price a[href*="interest=nevora"]`, which also matches `interest=nevora-demo`. The Night Plans page put the trial link first in `#price`, so an Owner over 30 coming from NEVORA could get the trial link instead of assisted setup. The Day page keeps only the quote and billing links in `#price`, and the fixture's `over-30` handoff now shows Contact Velani → `?interest=nevora`. Matching `interest=nevora"` or `[href$="interest=nevora"]` in the script would remove the trap for any future layout.
- For Jose: the Rondo page keeps the approved wording "included in every NEVORA plan, and in the free 30-day trial". The website privacy notice says the Owner assistant in NEVORA depends on workplace availability and authorization; confirm the page wording matches what Owners get.
- Assigned UI findings still open (from `services/velani-ai/docs/CLAUDE-UI-START-HERE.md`): the Retry-After cap in `public/assets/velani-hub.js` and final success focus in the Shopify preview.

## Unpublished Shopify theme (November 21)

- Commit `1e22602` is on the store as theme **193710227770 "Velani Day design 1e22602 (preview)", role UNPUBLISHED** (staged upload, then `themeCreate`). The live theme (193311572282) is unchanged. Nothing was published and no store data changed.
- The import skipped `templates/robots.txt.liquid`; it was added to the unpublished theme with `themeFilesUpsert`, and its checksum matches.
- Preview (signed in to Shopify): `https://www.thevelani.com/?preview_theme_id=193710227770`; other pages add `&view=velani-<page>` (for example `velani-rondo`, `velani-es-relay`).
- Hosted acceptance is not done: the Shopify connector lacks theme screenshot and read permissions here, and anonymous preview links redirect to the live site. Evidence: `evidence/shopify-unpublished-20261121`.

## Independent review (November 21)

- A separate reviewer read `8177dd6..2342d56`: no blockers; ten findings. Report and outcome per finding: `evidence/independent-review-20261121/README.md`.
- Fixed: `llms.txt` (still offered custom development and linked the removed page), text contrast on the sky backgrounds (link and secondary greys darkened, small teal labels use the link teal; lowest measured 5.10:1), the account pages' email link underlined, the Rondo approval steps' state for screen readers, a sample answer that disagreed with the sample week, the assistant's "Try the time clock" anchor, PIN feedback and language marks on the kiosk and Home, and six Spanish wordings.
- For Jose: the website's NEVORA policy mirror is version 2026-11-09 ("Forgot access"); the app's policy source is 2026-11-10 and says "Forgot password?", as the app and the Day pages do. Syncing the legal text is his call. Also still open: whether Rondo is included today (site) or to be confirmed per workplace (assistant knowledge).

## Rondo answer card fix (November 21)

- On NEVORA and Rondo (English and Spanish), Rondo's sample answer and the Approve buttons were unstyled: their rules were only in `home.css`. They now live in `devices.css`, which Home, NEVORA and Rondo load; the scripts build the card title as `p.prep-t` instead of an `h4`. A test keeps both in place.
- Checks: `npm test` 119/119, theme check 0, browser suite 101/101, Day check 126/126 on the six affected pages, flows Rondo/Relay 12/12, NEVORA demos 12/12, Spanish 56/56. Evidence: `evidence/day-answer-card-20261121`.

## Share images (November 21)

- Ten Day share images (1200 × 630), English and Spanish: Home (the general image), NEVORA, Plans, Rondo and Relay (`public/assets/velani-social*.png`, `-es` for Spanish). They use the site's own Day styles, drawn screens (`dayScreen()` in `src/day.mjs`, Spanish screens on the Spanish images) and each page's own words.
- `scripts/og/make-share-images.mjs` now builds them from this repository (the old one read the live store's Night assets from Jose's Mac). It needs Chromium and the Inter and Inter Display fonts, and refuses to write an image in a fallback font.
- Pages: Rondo and Relay now have their own images; Spanish pages use the Spanish images, and a Spanish page without its own image shares the Spanish general image (the layout's Spanish default). The NEVORA and Spanish Home descriptions match the new pictures. A test checks every named image exists at 1200 × 630.
- Evidence: `evidence/share-images-20261121/contact-sheet.png`.

## Theme name and assistant (November 21)

- The theme is named "Velani" (settings_schema `theme_info`, the package manifest and `dist/velani-unpublished.zip`). `npm run package:theme` had been refusing the theme's `snippets/` folder; it now packages it.
- The on-site assistant (`src/shared/assist.js`, `assist.html`) greets with "Ask me about NEVORA, Rondo, Relay or the free trial" (Spanish to match), and its third suggested question is about Rondo instead of building a website or app.
- The assistant service's knowledge (`services/velani-ai/knowledge/nevora.json`): the enquiries entries no longer offer custom websites or apps or link the removed custom-development page; existing clients go to the client request on Help; the contact topics match the Contact page. Rondo's entries point to the Rondo pages and drop "Velani's websites and apps" (their availability caveat is unchanged). Relay's entries point to the Relay pages and describe what those pages say. The six entries are dated reviewed November 21, valid to December 21.
- For Jose: the hosted assistant still has the old knowledge until it is published again with the service's own seed script (`npm run seed` in `services/velani-ai`, against its database). That is a runtime change for him to approve and run.
- Evidence: `evidence/assistant-products-only-20261121`.

## Night design removed (November 21)

- Deleted: `src/night.mjs` and `src/night/` (Night header, footer, Home, NEVORA and Products bodies, the time clock, motion, styles), the Night page renderers in `src/render.mjs` (custom work, Night contact, sign in, plans, support, about, panels and closings, screenshots and their `srcset`), the Night layout branch (design switch, dark colours, DM Sans preload, `velani.css`, `velani-motion.js`) and the `velani-header-*` / `velani-footer-*` snippets.
- Deleted assets: `velani.css`, `velani-home.css`, `velani-nevora.css`, `velani-nevora.js`, `velani-motion.js`, the DM Sans fonts and `@fontsource/dm-sans` (and its license copy), `check.svg`, `arrow-right.svg`, 38 `night-*.webp` screenshots and photos, and `velani-social-custom.png` (the custom-development share image).
- Deleted content: the Night-only Spanish tables (chrome, work, about, support, plans), the custom-work `services` list, the old Help FAQ entries, and unused keys in the contact and client-request tables.
- Moved, unchanged (checked byte for byte against the old output): the billing script, the assistant and its client, the policy page renderer, icons, Spanish links, the language switch and the wordmark. The backend test that imports the assistant client now points at `src/shared/velani-assistant.js` (the path resolves and exports `VelaniAssistant`; the test itself needs the backend's vitest install, which this container does not have, so it was not run).
- Renamed: `night-nevora-wm-ink.png` / `night-nevora-wm-white.png` to `nevora-wm-ink.png` / `nevora-wm-white.png`.
- Fixed while there: the assistant hid its launcher when the old Night menu opened; it now hides under the Day phone menu. Two Spanish share-image descriptions still spoke of custom work (Products and Contact).
- Kept on purpose: the dated hosted checks in `scripts/checks/`. (The share images were redone in Day the same day; see below.)
- Publish-time: the next theme push no longer carries the Night assets above; nothing published references them once this theme is the live one.

## Verification (November 21, Night removed)

- Render comparison (`evidence/day-night-removed-20261121/flows/render-identity.json`): all 88 page and section outputs identical to commit `d58806f`; only the four Night snippets are gone. After that, two deliberate changes: the wordmark rename and the two share descriptions.
- `npm test`: 117/117. Six tests that only covered Night pages are gone (each filtered itself to Night pages and checked nothing once every page moved); the design-switch and layout tests now check that every page is Day and that no Night branch is left.
- `npm run check:theme`: 0 offenses; no Night file is referenced anywhere in the built theme or preview. `scripts/browser-check.mjs`: 101/101 (`evidence/day-night-removed-20261121`), with its dead Night branches removed.
- Day check on all 41 pages that render (the two trial pages redirect while signup is closed): 861/861. Flows: Spanish 56/56, Rondo/Relay 12/12, NEVORA demos 12/12, Help 12/12, Contact 17/17, trial and billing with signup closed 10/10, LOCAL commerce fixture 13/13. Assistant launcher under the Day phone menu: hidden while open, back after (checked with the assistant root revealed by hand, since no assistant service runs locally).

## Verification (November 21, Spanish Rondo and Relay; Spanish screens)

- `npm test`: 123/123. New tests: the Spanish Rondo and Relay pages (Spanish words, English questions marked, Spanish links); Spanish pages draw Spanish screens and English pages keep English ones. Updated: the header test now expects Spanish pages to link `es-rondo` and `es-relay` (English-only marking checked on the footer's Security link).
- `npm run check:theme`: 0 offenses. `scripts/browser-check.mjs`: 101/101 (`evidence/day-spanish-rondo-relay-screens-20261121`).
- Day check: 210/210 on ten Spanish pages and 210/210 on ten English pages; Spanish Rondo and Relay rerun 42/42 after the last wording change.
- Spanish flows 56/56: no visible English in thirteen Spanish page bodies; a new second pass reads the drawn screens after the scripts run and finds no English screen words; Rondo answers, approvals and the hero phone in Spanish, an English question answered in English and marked so; the Relay waitlist opens Spanish Contact on the Relay topic. English flows unchanged: Rondo/Relay 12/12, NEVORA demos 12/12, Help 12/12, Contact 17/17.
- Found and fixed: `nevora.js` wrote "Good evening" and "AM" into Spanish screens (the screen check caught it); the Home clock label could wrap as "a. m." (kept on one line); the Spanish question in the Rondo phone wrapped (shortened to "¿Quién cubre el domingo, de 12 a 8?").

## Verification (November 21, custom work removed; Products; trial and billing pages)

- `npm test`: 121/121. Night tests for Products and the trial button now follow the Day markup with the same intent; new tests: custom work is gone and nothing links to it; the trial and billing pages keep every commerce hook.
- `npm run check:theme`: 0 offenses. `scripts/browser-check.mjs`: 97/97 (`evidence/day-remaining-20261121`, rerun `-rerun` after removing the suite's dead Night menu branch, which pointed at the removed custom-development page). The six fewer checks than before are the three removed routes at two widths.
- Day check on Products and the six billing and setup pages (EN and ES): 168/168. The trial pages redirect while signup is closed, so they are covered by the flows.
- Flows (`evidence/day-remaining-20261121/flows`): signup closed 10/10 (trial pages send visitors to the trial request in their language, billing shows email support with the card hidden, setup scrubs an old `#token=` link). LOCAL commerce fixture 13/13 (trial page stays when signup is configured; one-time handoff leaves the address bar; business name, trial line and plan facts; sign out; Spanish paid line; expired link; payment return confirms the subscription; no sideways scroll on a phone; only the local site and fixture contacted). The fixture is fictional and local: no hosted Shopify, live billing or Stripe acceptance.
- Found and fixed: the heading the billing script focuses for screen readers showed a focus ring; it now matches Contact (no ring on a heading).

## Verification (November 20, legal pages)

- `npm test`: 120/120 (every legal route on the Day chrome with Jose's document unchanged; the Shopify layout gives the 404, product and policy templates the Day head, rendered through Liquid). `npm run check:theme`: 0 offenses. `scripts/browser-check.mjs`: 103/103 (`evidence/day-legal-20261120`).
- Day check on the 16 legal pages: first run 314/336 (two Day chrome findings: the unselected EN/ES link in the header was 55% opacity, below 4.5:1 on the plain legal background; the footer's legal nav shared the label "Legal" with Jose's document nav). Fixed: 72% opacity; the footer nav is "Legal notices" / "Avisos legales". Rerun 336/336.

## Verification (November 20, Spanish)

- `npm test`: 118/118. Spanish Night tests now follow the Day markup where the page moved (chrome, contact form, NEVORA kiosk, Shopify layout render), with the same intent. New test: no designer notes reach a Day page.
- `npm run check:theme`: 0 offenses. `scripts/browser-check.mjs`: 103/103 (`evidence/day-spanish-20261120`).
- Day check: 147/147 on the seven Spanish pages and 189/189 on the nine English ones. Spanish flows 25/25: no visible English outside drawn screens and `lang="en"`, demos in Spanish (kiosk, publish, Rondo, timecards, Help search, Plans price and calendar, Contact topic, button and errors), no sends.
- Found and fixed: a designer's note from the NEVORA mockup was visible on the English NEVORA page; the NEVORA team phones were exposed to screen readers; the arrow after links was oversized on Plans; the Spanish Help client form linked the English privacy notice.

## Verification (November 20, Rondo and Relay)

- `npm test`: 117/117 (new routes, links from header, footer, Home and About, Rondo and Relay content, no Relay form). `npm run check:theme`: 0 offenses.
- `scripts/browser-check.mjs`: first run 101/103 kept (`evidence/day-rondo-relay-20261120`: Relay hero text style leaked into the drawn kitchen screen, contrast 1.61; hero rules are now scoped to the hero copy). Rerun 103/103 (`-rerun`).
- Day check on all nine Day pages: 189/189. Rondo and Relay flows 12/12 (section bar marks and darkens, question picker, Approve, phone fitted, Relay waitlist opens Contact on the Relay topic, no sends).
- Found by the new tests: Spanish Day header links to English-only pages were not marked `hreflang="en"`; fixed.

## Verification (November 20, Help and Sign in)

- `npm test`: 114/114 (Day Help and Sign in tests). `npm run check:theme`: 0 offenses. `scripts/browser-check.mjs`: 99/99 (`evidence/day-help-signin-20261120`).
- Day check on all seven Day pages: 147/147. Help flows 12/12 (search, chips, PIN, client door from `#client`, client form preview with errors and no sends).
- A Sign in draft that included the client form failed the rule that public pages carry no preview wording; the form was removed from Sign in, matching Jose's design. During the work the Help port script was run a second time by mistake and overwrote one CSS fix; the fix was reapplied and the three port scripts now refuse to run over existing sources.

## Verification (November 20, Contact)

- `npm test`: 112/112 (Day Contact test pins the live/email/preview branches; the language test compares topics only when both Contact pages share a design).
- `scripts/browser-check.mjs`: first run 97/99 kept (`evidence/day-contact-20261120`: the help link pointed at a Help anchor that does not exist yet, now `/pages/sign-in`; and the header hid its links without JavaScript on phones, now a second row as Jose's suite requires). Second run 98/99 kept (`-rerun`: the no-JavaScript Menu link `#ft` was read on a redirect page; removed as redundant). Final 99/99 (`-rerun2`).
- Day check on Home, NEVORA, Plans, Contact and About: 105/105. Contact flows 17/17: topics from links, side and button follow the topic, more than 30 becomes assisted setup and back, message label follows, errors and focus, preview confirmation says nothing was sent, no network sends.

## Verification (November 20, Plans)

- `npm test`: 111/111, with a Day Plans test that pins the commerce contract (hooks, 30 marks, disabled slider without the script, quote link order). The Night Plans layout test runs only for Plans pages still on Night.
- `npm run check:theme`: 0 offenses. `scripts/browser-check.mjs`: 99/99 (`evidence/day-plans-20261120`).
- Day check on Home, NEVORA, Plans and About: 84/84.
- With Jose’s local commerce fixture (`scripts/commerce-fixture.mjs`, no real service): 18/18 (`plans-commerce-fixture-rerun.txt`; an earlier 14/18 run is kept with its cause in `evidence/day-plans-20261120/README.txt`), including keyboard on the card (16 → $29, End → quote), the price per employee and matching plan, real dates, and the Owner handoff scenarios trial, expired and over-30 (fragment scrubbed, language choice, assisted setup link).

## Verification (November 20, NEVORA)

- `npm test`: 110/110, with Day NEVORA tests and a check that every in-page link on a Day page has its target. Night NEVORA tests run only while a NEVORA page is still on Night (the Spanish one).
- `npm run check:theme`: 0 offenses.
- `scripts/browser-check.mjs`: first run 98/99 kept (`evidence/day-nevora-20261120`: the section bar linked `#top`, which the theme names `#main`; the hero is now `#top`). Rerun 99/99 (`evidence/day-nevora-20261120-rerun`).
- Day check on Home, NEVORA and About: 63/63; NEVORA demos 12/12 (publish, PIN clock-in, Rondo questions and Spanish, timecards, highlights, section bar).

## Verification (November 20, Home)

- `npm test`: 108/108. Night-home tests in `tests/spanish.test.mjs` now run only for homes still on Night (the Spanish home); `tests/day.test.mjs` covers the Day home.
- `npm run check:theme`: 0 offenses (11 image-size offenses found and fixed).
- `scripts/browser-check.mjs`: first run 89/99 (`evidence/day-home-20261120`, kept) because three checks were written for the Night home; they now check the same purpose on either design. Rerun 99/99 (`evidence/day-home-20261120-rerun`).
- Day check on Home and About: 42/42 (`evidence/day-home-20261120-rerun/day-check.txt`), after fixing a missing night colour token (Rondo tile contrast) and device-screen semantics.

## Verification (November 20, About)

- `npm test`: 106/106, including `tests/day.test.mjs` (design switch, chrome, Spanish chrome, layout, About body).
- `npm run check:theme`: 0 offenses.
- `scripts/browser-check.mjs` on the local preview: 99/99, 0 runtime errors, 0 external requests, 0 posts (`evidence/day-about-20261120/report.json`).
- Day page check (`evidence/day-about-20261120/day-check.txt`): 21/21 on About, including strict CSP, axe WCAG and best-practice, keyboard skip link, phone menu focus loop and Escape, 320px, no-JavaScript menu link and cookie dialog.
- Not verified: hosted Shopify (storefront password), Safari and Firefox, real screen readers.
