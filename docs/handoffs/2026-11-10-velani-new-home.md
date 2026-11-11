# Velani new Home (Nov 10, 2026)

Jose's direction: NEVORA is the focus, gusto.com is the benchmark for the vibe, and he agreed to try a serif for headings. Nothing is
published.

- **Preview theme:** **193308328250**, "Velani new Home (preview)". It duplicates 193306460474 (the warm-light preview, which carries the
  Nov 10 follow-ups), so publishing it brings all three passes. MAIN (193290043706), 193306198330 and 193306460474 were not written to.
- `config/settings_data.json` was not uploaded: its checksum equals the source theme's, and `commerce_api_url` stays empty.
- **Branch:** `claude/velani-home-gusto-20261110`, from `53d9a0c`. Pushed; no PR, no merge.

## Home, in order (EN `/`, ES `/pages/es`)

1. **The NEVORA field.**
   - A deep NEVORA-teal field with the app's own band gradient, ending in rounded corners above paper.
   - The serif line "Your team's week, in one place." / "Todo tu equipo, en un solo lugar.", with one sentence under it.
   - Two actions: Request a free NEVORA trial, and See how it works (#nevora).
   - The Owner's web screen rises out of the field inside a light frame.
   - Two floating real-app pieces sit on the screen:
     - a "Clock-in recorded" card, an HTML rebuild of the Direction B kiosk receipt with sample Alexandra at 7:58 AM;
     - the employee's Direction B phone home.
   - On phones the copy is left-aligned with the logo and only the phone floats.
2. **NEVORA in three parts.** "From the schedule to payday."
   - A real tablist (Schedule, Time clock, Pay; ES Horario, Registro de tiempo, Nómina). Arrow keys, Home and End move between tabs, and focus follows.
   - Each panel has one sentence and one real screen.
   - On phones, Schedule and Pay show the employee phone screens instead of the web screens.
3. **Who it's for.** One licensed photograph and four short facts:
   - shift businesses;
   - up to 30 employees (larger teams get assisted setup);
   - English and Spanish;
   - available now in any browser, with the phone app coming.
4. **Price.**
   - The copy states that every business gets the whole app.
   - A card holds two equal boxes, $19 and $29 a month, under "Free for 30 days, no card needed", with "may change before online billing opens".
   - Actions: Request a free trial and See plans.
5. **Client work.** Two cards of equal height, Tool Box LLC and Yavi Barber, using existing screenshots and facts. Each links to its section on the Custom software page.
6. **Closing band.** Teal: "Ready to try NEVORA?" / "¿Quieres probar NEVORA?", with the reply-within-two-business-days line. Actions: trial and Start a project.

**Header and footer:**
- The header markup and behaviour are unchanged. On Home only, it reads on paper:
  - ink text and the real VELANI wordmark;
  - a teal trial pill;
  - light dropdowns and a light phone menu.
- The footer is unchanged.

**Removed from Home:** the five full-screen dark panels, the page-load light and the Faro/Rondo hero aside. The NEVORA page keeps its own hero.

## Serif: Fraunces 600

DM Serif Display and Fraunces were both tried on the hero at 1440.

- **DM Serif Display** is narrow and high-contrast. The headline set in three lines and read like a magazine cover: formal, not warm.
- **Fraunces** has soft, wedge-like serifs and a generous x-height. It reads warm and friendly next to DM Sans, close to the feeling of Gusto's own serif. It holds every heading to two lines.

Only `fraunces-latin-600-normal.woff2` ships (self-hosted, SIL OFL 1.1; licence in `docs/licenses/fraunces.txt`). It is used for Home headings, the two prices and the case titles. DM Sans stays for everything else.

## Time clock: Direction B round 2 (Jose: "that clocker looks like an old picture, i think it must be B2")

- **The NEVORA page demo** ("Try the time clock", EN and ES) is restyled to Direction B round 2, matching NEVORA 830a1313 and `mocks/8-clocker.html`. Behaviour, timers, copy and the sample note are unchanged.
  - **The band:** teal, with the wordmark and TIME CLOCK, the workplace pill (Northside Coffee), and the live clock as the large figure. The location pill (Main Street) and the date sit under the clock. At the foot, a glass status ("Tablet registered · New York time · Main Street iPad") and Powered by VELANI LLC.
  - **The card:** the task is one lifted white card (22px).
    - The PIN box has a 2px teal ring.
    - Keys are 76px (64px at 834–1100 and 60px on phones), 22px radius. Clear and Delete are outlined.
    - Continue is a 56px pill. The Español pill is tinted.
  - **The recorded state:** a 96px green check with an 8px ring, the same title and the demo note in green. "Clock in again" is a 56px grey pill.
  - **Phones:** the band runs across the top and the card lifts over its lower edge, as on the portrait tablet.
- **New strings:** "Tablet registered" / "Tableta registrada" and "New York time · Main Street iPad" / "Hora de Nueva York · iPad de Main Street" are in `kiosk.js` `ES`.
- The site keeps DM Sans; the app uses Inter.
- **Home's Time clock tab** shows a crop of the Direction B mock frame "Enter your PIN" (`night-b2-clocker.webp`). The mock's sample text was swapped before capture: Northside Café & Bakery → Northside Coffee, Calle Loíza → Main Street, Puerto Rico time · Front counter tablet → New York time · Main Street iPad.

## Pictures checked against Direction B

| Picture | Where | Verdict |
|---|---|---|
| `night-r1-clocker.webp` (grey left panel) | Home | Old Release 1 kiosk. **Replaced** by `night-b2-clocker.webp` (Direction B mock crop). The file stays in the theme but nothing uses it. |
| `night-phone-long.webp` ("Good afternoon, Alexandra", dark-navy band with the A shape, "Workforce" lockup) | Products page, EN and ES | Pre-Direction B. **Replaced** by `night-b2-phone-home.webp`, a capture of the Direction B employee mock "Welcome back, Ana". The mock's "From Jose" became "From Carmen". |
| `night-r1-owner`, `-schedule`, `-timecards`, `-payroll`, `-ph-home`, `-ph-schedule`, `-ph-pay` | Home, NEVORA page | Kept. These are app captures with the Direction B band and lifted white cards. The mocks show the same structure, with more items and QA names. |
| `today-*.jpg` in the mocks | — | Not used. |

## Photograph

"Barista prepares coffee in modern café with steam rising during busy morning hours" by Shixart1985, CC BY 2.0, via Wikimedia Commons.
- Source: https://commons.wikimedia.org/w/index.php?curid=195948210
- Licence: https://creativecommons.org/licenses/by/2.0/

CC BY requires a credit, so the page credits it under the photo with links. It shows atmosphere only and is never presented as a client. It is resized to 1600px WebP.

## Checks run

- `npm test`: 48/48, including a new test for the tab/panel pairing, the photo credit and the Direction B clocker on Home. `check:theme` is clean.
- **Headings:** ≤ 2 lines at 1440, 1280, 1024, 900, 834, 768, 600, 430, 390 and 360, in EN and ES, with all three tab panels shown. No sideways scroll at any of those widths.
- **axe (WCAG 2.0/2.1/2.2 A and AA tags) and overflow:** Home EN/ES and NEVORA EN/ES at 1440, 1024, 834, 390 and 360. Chromium had 0 violations in 20 runs, and WebKit had 0 in 20 runs.
- **Keyboard:**
  - Tabs: the focus ring shows, ArrowRight moves to the next tab, End goes to the last, wrap works, and Tab moves into the panel. All passed in Chromium and WebKit, EN and ES, at every width.
  - Time clock demo: type a PIN, an extra digit is refused, Continue moves focus to the result, "Clock in again" returns, and the language switch works. Passed at 1440, 1024, 834, 390 and 360, EN and ES, in Chromium and WebKit, with no page errors and nothing overflowing the demo.
- **Motion:**
  - With reduced motion, every screenshot shows all content.
  - Without it, the hero floats come in and every `.fade`/`.rise` reveals after a scroll (0 left hidden).
- **Hosted preview 193308328250:**
  - 14/14 uploaded files match the build checksums.
  - Read back `Shopify.theme.id` 193308328250 on Home EN, ES and NEVORA. Fraunces loads, there are 3 tabs and the B2 clocker image is present.
  - The NEVORA demo shows Northside Coffee. No sideways scroll at 1440 or 390.

Evidence: `evidence/home-gusto-20261110/` (untracked).

## Still short

- **Other pages:** Plans, Support, About, Custom software and the NEVORA hero are still the dark site. Clicking from Home into them changes the world. The Products page still says "Request free trial", where the rest of the site says "Request a free trial".
- **Photography:** there is one stock photograph. There are no real customers, quotes or numbers, by design.
- **Hosted header:** "Ask Rondo" (the chat launcher, visible on previews) keeps its dark style over the paper hero.
- **Not done:** no real-iPhone Safari check yet. The hosted check was Chromium only; WebKit ran locally.
