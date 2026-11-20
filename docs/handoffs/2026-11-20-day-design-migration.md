# Day design: theme migration (started November 20, 2026)

The approved "Day" design (mockups and reviews in `docs/design/2026-11-18-premium-software/`) is moving into the real theme one page at a time. Source work only: no Shopify write, publication, store setting, menu, policy or page-resource change was made.

## How it works

- A route opts in with `day: '<body>'` in `src/content.mjs`. Every other route keeps the Night design, so the site is whole at every step.
- `src/day.mjs` renders the Day header, phone menu and footer (English and Spanish) and the page bodies in `src/day/*.body.html`.
- `src/day/day.css` and `src/day/day.js` build into `velani-day.css` and `velani-day.js`. Day pages load only these plus `velani.js` (forms and cookie choices); no Night CSS, no `velani-motion.js`, no web font (system fonts).
- Theme: the layout's per-page case branch sets `velani_design = 'day'`; the head, colours and the `velani-day-header-*` / `velani-day-footer-*` snippets follow it. The cookie dialog travels with the Day footer.
- The assistant keeps its Night look on Day pages (its tokens are scoped to `.ast-root` in `velani-day.css`) until it gets its own Day styling.

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
| Legal and NEVORA policy pages | Last | Restyle only; wording is Jose's |

## Facts to carry into the next pages

- The 30 free days run from workplace provisioning (creation in NEVORA), per `development` commit 5d2e545. The mockups say "the day your workplace is ready"; use the provisioning wording in the theme.
- Custom work is removed (decision 2 in `SITE-STRUCTURE.md`). Existing-client support stays on Help as one quiet line using the client request service (decided November 20); no new custom work is offered.
- For Jose (found while porting Plans): `velani-commerce.js` picks the quote link with `#price a[href*="interest=nevora"]`, which also matches `interest=nevora-demo`. The Night Plans page put the trial link first in `#price`, so an Owner over 30 coming from NEVORA could get the trial link instead of assisted setup. The Day page keeps only the quote and billing links in `#price`, and the fixture's `over-30` handoff now shows Contact Velani → `?interest=nevora`. Matching `interest=nevora"` or `[href$="interest=nevora"]` in the script would remove the trap for any future layout.
- For Jose: the Rondo page keeps the approved wording "included in every NEVORA plan, and in the free 30-day trial". The website privacy notice says the Owner assistant in NEVORA depends on workplace availability and authorization; confirm the page wording matches what Owners get.
- Assigned UI findings still open (from `services/velani-ai/docs/CLAUDE-UI-START-HERE.md`): the Retry-After cap in `public/assets/velani-hub.js` and final success focus in the Shopify preview.

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
