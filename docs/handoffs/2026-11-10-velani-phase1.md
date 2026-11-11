# Velani Phase 1: one look on every page (Nov 10, 2026)

Phase 1 of the approved site plan (artifact LZ88vY9XJTr2fM2wCPcARQ). All six decisions are in as recommended.

- **Preview theme:** 193310425402, "Velani phase 1 one look (preview)". It is a copy of 193308328250 (the new Home). Nothing is published.
- **Untouched:** MAIN 193290043706 and the other previews.
- **Settings:** `config/settings_data.json` was not uploaded, so `commerce_api_url` stays empty.
- **Branch:** `claude/velani-phase1-system-20261110`, from 044b6d2.

## The system

- `src/night/system.css` builds to `assets/velani-system.css`. Every page loads it last, in both the local and the Shopify heads.
- **Colors:**
  - Paper #f7f3ec is the ground, white is used for raised cards, NEVORA teal #0b6e69 is the only accent, and teal ink #0e3b39 is the footer.
  - A flat teal field appears only as the hero band and the closing band.
  - The dark theme, the blue light-streak images, lavender buttons, the blue and orange accents, and the NEVORA chapters' blue accent are all gone.
- **Type:**
  - Fraunces 600 is used for H1 and H2 on every page, and DM Sans for everything else.
  - The scale is 80/56 display, 28 card titles, 20 lead, 17 body and controls, 14 small and 12 legal.
  - On phones the headings shrink so every heading stays at two lines or fewer from 360 to 1440, in English and Spanish.
- **One button:**
  - Primary is teal, 12px radius, 48px tall (52 in heroes), and always has the arrow. On a teal field it becomes white with teal text.
  - Secondary is an outline. Press scales to 0.96 over 150ms; hover only applies on pointer devices.
  - The one trial label is "Request a free trial" / "Pide la prueba gratis" everywhere, including the header.
- **Header:**
  - Four flat links: NEVORA, Plans, Custom software, About. Then EN|ES, Sign in and the trial button.
  - Below 1024px it shows the logo, a 44px "Free trial" button and the menu. The menu opens with the trial.
  - The NEVORA page's own nav is removed, and `velani-nevora.js` is guarded for that.
  - The header trial button is hidden on the trial page itself.
- **Footer:**
  - Teal ink, with the header's thin wordmark at header size.
  - Rondo and Relay are out of the footer menu.
  - The café photo credit moved from under the photo into the footer note.
- **Focus:**
  - The ring is 3px teal on paper and paper-colored on teal and ink.
  - The skip link is fixed, and touch targets are at least 44px.
- **"Ask Velani":**
  - This was the website chat, "Ask Rondo". It is now a teal pill on desktop and a 48px round button on phones.
  - The labels changed in `assist.js` and `assist.html`, EN and ES.
  - **For Codex:** if the assistant service introduces itself as "Rondo" (the `{name}` comes from the server), change its self-introduction to Velani.
- **Motion:**
  - The word-by-word headline rise and the 1.2s hairline draw are gone.
  - Each block gets one 450ms fade with a 12px rise. Reduced motion shows everything.

## Fixes made regardless

- **Home:**
  - The headline is "Your team's week, from first shift to payday." The Spanish is "Tu equipo, del primer turno al día de pago." I shortened the approved "La semana de tu equipo, …" because it could not stay within two lines on phones.
  - The page title and description now lead with NEVORA.
- **NEVORA:**
  - The Spanish H1 is now "Horarios, horas y cálculo de nómina." so it stays within two lines.
  - The staff-count sentence now matches the screen ("eight people on the schedule").
- **Copy:** "Approve hours, get payroll." became "Approve hours, see the pay."
- **Billing:** one sentence everywhere: "On day 30, the Owner picks a plan in NEVORA. Nothing is charged until you do." (ES matched.) It is used on Plans Day 30 and in both Support FAQs.
- **Outage line:** "If NEVORA is down and your team can't clock in, email us."
- **Plans:**
  - The page ends on the trial: "Ready to try NEVORA?", Jose named, then trial and "See how NEVORA works".
  - The terms are readable at 16px.
- **Trial request lede:** "Jose from Velani replies within two business days and sets up your workplace with you." (ES matched.)
- **Form:**
  - After the first try, each field clears its error as it is fixed.
  - The line above the send button names the fields: "2 fields need attention: Name, Email."
- **Time clock demo:**
  - Spanish "Borrar todo" vs "Borrar dígito".
  - The success step links to "Request a free trial".
- **Relay waitlist** is now a secondary button.

## Checks

- **Tests:** `npm test` 49/49. It now asserts the same header with the trial button and the system stylesheet on every page, and one trial label. `check:theme` is clean.
- **axe (WCAG 2.2 AA tags):** 0 violations in 42 runs (14 pages at 1440, 834 and 390) plus 18 runs on the remaining pages. That covers Home, NEVORA, Plans and their Spanish pairs, Custom software (EN/ES), About (EN/ES), the trial request, Support (EN/ES), Sign in (EN/ES), Privacy, NEVORA support, nevora-start, Billing and Products.
- **Overflow:** none sideways at 360, 390, 834, 1024 or 1440.
- **Headings:** every heading is two lines or fewer at 360, 390, 834, 1024 and 1440 on 15 pages.
- **Keyboard and behavior:** 13/13 pass.
  - Header order with a visible ring.
  - The paper ring on the teal hero.
  - Tabs respond to the arrow keys.
  - The phone menu opens with the trial, and Escape returns focus.
  - The 44px phone trial button.
  - The form summary appears above the button, clears per field and clears when valid.
  - No header trial on the trial page.
  - The time clock success link.
  - Reduced motion leaves nothing hidden.
- **design-taste-frontend `inspect.mjs`:** Home went from 7 FAIL to 4 FAIL. NEVORA and Plans were checked too. What remains is listed below.
- **Evidence:** before and after full pages for 15 pages at 1440 and 390 are in `evidence/phase1-20261110/`.

## Not brought to the bar (left for later phases, or defended)

- **Inspector FAILs I left on purpose:**
  - Product-frame and floating app card shadows: one product shadow, on objects that really float.
  - The B2 clocker's teal glow: it copies the app.
  - FAQ and footer accordion dividers: they are structure.
  - "Yavi Barber…" flagged as a 6-line headline: that is a card link, not a heading.
  - A mixed-font headline flag I could not reproduce.
- **Phase 2 (Home):**
  - The hero screens still contradict each other ("Welcome back, Ana" next to Alexandra, zeros).
  - The orphan "See everything NEVORA does" button.
  - The facts block, the price card and the stock photo.
- **Phase 3 (NEVORA):** the page is still 12 screens long. It still has two stories, the Rondo/Relay sections and four endings.
- **Plans:** the hero right half is empty; Phase 4 puts the calculator there.
- **Phase 5:** Products is still an orphan page; Help, Sign in and NEVORA support are still separate pages.
- **The header button and the hero primary are both filled on the first screen.** They differ (teal vs white on teal). The plan's "one filled per screen" is met inside the page content only.
- **Not tested:**
  - Real iPhone Safari.
  - WebKit on this round (Chromium only).
  - The live form success state, which would send real mail.
