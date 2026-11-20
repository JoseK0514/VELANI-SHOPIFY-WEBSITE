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
| Home, NEVORA, Plans, Help, Contact, Sign in | Next | Contact keeps the live/preview inquiry safeguards from `src/render.mjs` |
| Rondo, Relay | New routes | Until then the header and footer link `/pages/nevora#rondo` and `#relay` |
| Spanish pages | After English | Day chrome already has Spanish words; `localize()` moves links |
| Legal and NEVORA policy pages | Last | Restyle only; wording is Jose's |

## Facts to carry into the next pages

- The 30 free days run from workplace provisioning (creation in NEVORA), per `development` commit 5d2e545. The mockups say "the day your workplace is ready"; use the provisioning wording in the theme.
- Custom work is removed (decision 2 in `SITE-STRUCTURE.md`). The Help page's client-hub door ("a website or app we built") and the client request service are Jose's backend work: confirm with Jose whether existing-client support stays on Help before removing it from the theme.
- Assigned UI findings still open (from `services/velani-ai/docs/CLAUDE-UI-START-HERE.md`): the Retry-After cap in `public/assets/velani-hub.js` and final success focus in the Shopify preview.

## Verification (November 20)

- `npm test`: 106/106, including `tests/day.test.mjs` (design switch, chrome, Spanish chrome, layout, About body).
- `npm run check:theme`: 0 offenses.
- `scripts/browser-check.mjs` on the local preview: 99/99, 0 runtime errors, 0 external requests, 0 posts (`evidence/day-about-20261120/report.json`).
- Day page check (`evidence/day-about-20261120/day-check.txt`): 21/21 on About, including strict CSP, axe WCAG and best-practice, keyboard skip link, phone menu focus loop and Escape, 320px, no-JavaScript menu link and cookie dialog.
- Not verified: hosted Shopify (storefront password), Safari and Firefox, real screen readers.
