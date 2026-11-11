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

## Round 2 and 3 (same branch, same preview 193311572282)

- **Round 2:** the join is a cool-to-warm light with a first-light line (no brown), the phone top is tighter, and the piece's frame is warm.
- **Round 3, colour:** the hero and closing images take a teal grade (`hue-rotate(-26deg) saturate(.9)`), so the light and NEVORA teal are one family. The trial button is clean white with ink text. "Clock in" is a pale-teal button. Amber is used only for "Late".
- **Round 3, the piece:** four views in a tablist (Schedule, Time clock, Pay, Rondo). It advances every 7 seconds until the visitor touches it, never under reduced motion, and the pause button stops it. The panels share one grid cell, so the height never changes.
  - All four read the same five rows. Schedule: Nov 2–8, eight-hour shifts, 40/32/32/32/32 hours. Pay: Mon–Fri minutes plus today's live minutes at $15. Rondo's answer is composed from the same state.
- **Rondo is available:** Home, the NEVORA page (EN and ES), the header menus and `llms.txt` no longer say "in development". The NEVORA page's own nav item is "Rondo". Relay stays "coming".

### What was verified about Rondo, and where

Source: NEVORA `origin/development`, `docs/product/rondo-operating-contract.md` and `src/components/owner-advisor/advisor.tsx`.

- Rondo is the assistant inside the Owner profile, reached through chat; Owner only (Manager access is not implemented).
- Tools in the allowlist: `company_briefing` and `published_staffing` (today's workforce, punches, published staffing); `coverage_investigation`, `coverage_proposals`, `coverage_plan`; `operational_insights`, `attendance_payroll_review`; coverage prepare/apply/check with server rechecks.
- The app's starter questions include "What needs my attention today?", which is the question the piece uses. The app shows a plain answer with a sources list, which is the shape the piece follows.
- Website wording is limited to: answers the Owner's questions about today's team, coverage and recorded hours from the workplace's records, and can prepare a coverage change for the Owner to approve.

**For Jose or Codex to confirm:**
- The contract document says its destination has not fully shipped and model judgment runs were "not executed" at that snapshot. Jose says Rondo is finished; the site relies on that.
- Whether Rondo's real answer would state "pay calculated so far this week" in a today briefing. The piece's sentence is composed from sample data, not a recorded Rondo answer.
- The existing example conversation on the NEVORA page (Luis late, Dana covering Saturday) is unchanged and uses different sample facts from the Home piece.
- Spanish Rondo inside the app was not checked.

### Checks, round 3

- `npm test` 49/49 (new: the four views share one set of numbers), `check:theme` clean.
- axe WCAG 2.2 AA with each of the four views open: 0 violations in 40 runs (EN and ES, five widths). No height change between views; headline two lines; no sideways scroll.
- Contrast against the brightest pixel behind the text: headline 15.8:1 (1440) and 18.4:1 (390); support line 13.5 and 16.0; fact line 9.3 and 7.8. Text inside the piece passes axe's contrast rule in every view.
- Tabs: arrow keys, Home, End and wrap; one panel active; focus ring. Auto-advance stops after the first key or pointer.
- Numbers after a clock-in and three ticks: today's pay $32.50 from rows $32.50; week $1,832.50 equals the sum of the Pay rows and Mon–Fri plus today.
- Layout shift 0.0011. Reduced motion: stays on Time clock, clock paused at 7:58.
- Hosted: 9/9 files match their checksums.
