# Velani signature first screen (Nov 10, 2026)

A proof screen for Jose: the Home first screen and its join into the first paper section, in English and Spanish. Nothing else on the site changed. Nothing is published.

- Preview theme: **193311572282**, "Velani signature hero (preview)", a copy of 193306460474 (warm light). `config/settings_data.json` was not uploaded.
- Branch: `claude/velani-signature-hero-20261110`, from 53d9a0c.

## What it is

- **The light stays.** The dark cinematic image, DM Sans, the real wordmark and nav. No serif, no teal field.
- **Headline:** "Your team's week, from first shift to payday." / "Tu equipo, del primer turno al día de pago." Two lines from 360 to 1440, its left edge on the logo's edge.
- **A living light:** a second soft light leans toward the pointer through a slow lerp (transform only). On touch it drifts over 26s. Off under reduced motion.
- **"A Saturday at Northside Coffee":** one HTML object in the app's Direction B look (teal band, one lifted white card), not a screenshot.
  - A sample clock starts at 7:58 AM; one second is one sample minute, until 4:00 PM.
  - Ana and Dana are clocked in, with hours accruing in tabular figures. Jordan is late. Luis starts at noon.
  - "Pay calculated today" adds up from minutes worked at a $15 sample rate.
  - The visitor presses "Clock in" on Alexandra's row: the row flashes once, her status arrives, her hours start and the total moves. A polite status region says "Alexandra Rivera clocked in at 8:02 AM."
  - A pause button stops the clock (WCAG 2.2.2). Under reduced motion it starts paused. The clock also stops when the tab or the piece is out of view.
  - "Sample data. Nothing is saved." Runs in the browser only.
- **Morning join:** the dark screen ends in an amber horizon that meets the paper below. Where scroll timelines exist it rises as you leave. Complete at rest.
- **Chat launcher:** hidden while the first screen is in view.

## Skills loaded with the Skill tool

emil-design-eng, interfaces-that-feel, micro-interaction-spec, motion-system, animation-principles, better-typography, better-ui, better-colors, high-end-visual-design, minimalist-ui, mobile-native, better-accessibility, better-writing. design-taste-frontend and tastemaker were loaded earlier in the session. Where high-end-visual-design and minimalist-ui ask for eyebrow tags, pill navs, serif heroes or nested arrow circles, Jose's rules won.

## Checks

- `npm test` 48/48 (one new test for the live piece), `check:theme` clean.
- axe WCAG 2.2 AA on the first screen: 0 violations in 10 runs (EN and ES at 1440, 1024, 834, 390, 360). Headline two lines and no sideways scroll in all 10.
- Keyboard: Tab reaches trial, See how it works, Pause, Clock in, each with a ring. Enter clocks in, focus moves to the row, the status announces. Pause holds the clock.
- Reduced motion: clock paused, light off, piece visible, join static.
- Scroll: 0 long tasks; layout shift 0.0002.
- Contrast against the brightest pixel behind the text at 390: paragraph 9.8:1, fact line 5.7:1 (it was 2.98 before the fix). At 1440: 13.4:1 and 7.3:1.
- Hosted: 4/4 files match their checksums; EN and ES at 1440 and 390 load the piece with no page errors.

## Not done or not verified

- Real iPhone and Safari; WebKit was not run this round.
- No compact PIN keypad; the button alone kept the piece one clean object.
- The pointer light was checked by code and reduced-motion state, not by eye in motion.
- The panels below still show "Welcome back, Alexandra" screens with other dates; that is later work.
- The local server logs CSP warnings for the page's older inline dawn scripts; they predate this change.
