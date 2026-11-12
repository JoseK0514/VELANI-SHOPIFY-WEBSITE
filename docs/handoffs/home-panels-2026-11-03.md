# Home as full-screen panels (2026-11-03)

Jose asked for pages built the way spacex.com, tesla.com and apple.com build theirs, with modern technology imagery and no Puerto Rico photos. SpaceX and Apple were captured live at 1440px and on an iPhone 13 (Tesla blocks automated browsers) and their measurements set the structure: one subject per screen, a full-screen visual, a short title, one line and one or two outlined buttons.

## What changed

- **Home** (`src/night/home.body.html`, `home.css`): five full-screen panels. Opening ("Brighter work ahead."), NEVORA with the free demo, Websites, Custom apps, and a closing Velani panel. The time-clock demo now lives only on the NEVORA page.
- **Imagery:** three images generated in Jose's Canva account (abstract blue light, dark devices, a laptop in a night office) saved as `public/assets/night-ai-*.webp`, plus an unbranded booking-app screen (`night-booking.webp`). No client names or client screenshots.
- **Header** (`src/night.mjs`): NEVORA · Websites · Custom apps · Support · About, with a Contact pill. The phone menu ends with "Start free NEVORA demo".
- **Footer** (`src/night/foot.html`, `base.css`): one row of links and the client-support email, a legal row with "© 2026 VELANI LLC. All rights reserved.", and the fictional-screens note.
- **Free demo request:** new enquiry topic `nevora-demo` (`src/inquiry.mjs`, `render.mjs`, `public/assets/velani.js`). `/pages/contact?interest=nevora-demo` shows "Start your free NEVORA demo." with the terms in the intro: up to 30 employees, 30 days from setup, no card, no automatic charge, quote/export/delete on day 30, pay statements only.
- **NEVORA page:** the bar pill is "Start free demo"; the hero keeps "Try the time clock" first and "Start free demo" second.

## Checks run (local preview, fictional data)

| Suite | Result |
| --- | --- |
| `npm test` | 33/33 |
| `npm run check:theme` | clean |
| `npm run check:browser` | 51/51 |
| `npm run check:privacy` | passed |
| `scripts/checks/acceptance.mjs` | 77/77 |
| `scripts/checks/scroll-stability.mjs` | 9/9 routes |
| `scripts/checks/clipping.mjs` (320px, 200% zoom) | 18/18 routes each |
| `scripts/checks/assistant.mjs` (fresh harness) | 41/41 |
| `scripts/checks/layout-audit.mjs` | 19/19 |

Test changes: the Home demo checks moved to the NEVORA page; the Home action checks follow the new buttons; the browser check accepts the "In development" status in the NEVORA panel kicker and the "Custom apps" menu link; the layout audit no longer counts control borders as separators and allows about ten phone screens for the five panels.

Captures: `evidence/home-panels-20261103/`.

## Facts from Jose (2026-11-03)

- Client support: Monday to Friday, 787-925-2000 and support@thevelani.com. Shown in the footer, the Support page, the contact aside and the closing Home panel.
- Demo data is deleted within 3 days after day 30 (demo intro and Support page).
- Demo spots are not limited, so the site makes no claim about limits.
