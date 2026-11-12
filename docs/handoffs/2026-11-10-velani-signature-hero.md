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

## Round 4 (same branch, same preview 193311572282)

- **One cool family below the first screen**, on Home and the NEVORA page: white and one pale teal-grey ground (#F2F6F5), teal-ink text (#0E2A2A), NEVORA teal (#0B6E69) for the filled action with white text, teal-grey hairlines and shadows. No cream, brown or black. The piece's frame is back in the cool family.
- **Join:** the teal light brightens into white. One hue, no line.
- **Home is NEVORA and Rondo:** the Tool Box and Yavi panels are gone from Home (EN and ES). The closing has the trial as its only filled action, then one quiet line linking to Custom software. The Custom software page and nav are untouched.
- **Schedule view:** each chip shows start over end, Saturday marked, "Published".
- **Rondo view:** two of the app's starter questions as buttons. The second, "Investigate coverage for tomorrow and compare my options.", answers from the schedule only: who is scheduled Sunday, who is off and under 40 hours, who is already at 40. The third starter ("What could go wrong with this plan?") is left out; the piece has no plan to reason about.
- **Support line:** shortened to two lines at 390 in both languages.

### Measured contrast

| Pair | Ratio |
|---|---|
| Ink #0E2A2A on white / on #F2F6F5 | 15.2 / 13.9 |
| Secondary #3D5654 on white / on #F2F6F5 | 7.9 / 7.3 |
| Small notes #56706D on white / on #F2F6F5 | 5.3 / 4.9 |
| White on teal button #0B6E69 | 6.1 |
| "Sample data" line #4A6360 on the frame | 5.9 |
| Teal "Clock in" on its tint | 5.3 |
| Pressed question chip | 7.8 |

### Checks, round 4

- `npm test` 50/50 (new: Home has no client panels, one filled action in the closing, the quiet line, two question buttons). `check:theme` clean.
- axe WCAG 2.2 AA, each view, EN and ES, five widths: 0 violations in 40 runs. The card height is the same across the four views and both Rondo answers.
- Keyboard: tabs as before; the question buttons take focus with a ring and Enter switches the answer and its source line.
- Phone 390×844: support line two lines; clock at 498–545; Alexandra's row with Clock in ends at 823.
- Hosted: 5/5 changed files match their checksums.

### Still short

- Home is now three sections, so it is short. The NEVORA section is still the older panel with its own screens ("Welcome back, Alexandra", zeros).
- The NEVORA page's time clock demo on this branch is still the older grey kiosk; the Direction B restyle lives on `claude/velani-home-gusto-20261110`.
- The NEVORA page's hero and local nav are still the older dark blue-black, and the footer wordmark is unchanged.
- Rondo's coverage answer states facts from the schedule; it does not compare real options the way the app would.

## Round 5 (same branch, same preview 193311572282)

- **Phone page check (hosted, 390×844, by scrolling):** the headline sits at 108px; the earlier full-page capture was an artefact. The long empty stretch was real in effect: the old NEVORA panel's phone waited at opacity 0 for its observer. That panel is gone. The new sections have no reveal that starts hidden; a check counts 0 elements at opacity 0.
- **Home below the first screen** is three sections at natural height, built in HTML from the same rows as the piece:
  - **Your team sees the week on their phones:** Alexandra's phone for the same Saturday. Her week's hours, today's hours and clock-in state follow the piece (clock her in above and it changes here).
  - **Rondo tells the Owner what needs attention:** the briefing (the same text as the piece's Rondo view, live) and one prepared change, "Add Dana Kim on Sunday, November 8", with Approve. Approving shows "Approved. NEVORA checked the schedule again and added the shift", adds Dana's Sunday chip to the Schedule view, sets her week to 40 h and updates Rondo's coverage answer.
  - **One monthly price, and we set it up with you:** $19 / $29 as a plain sentence, 30 days free with no card, the day-30 sentence, Jose and two business days, one filled trial button and a text link to Plans.
- **Schedule view:** chips are 13px (12px below 1100px, where the week-total column is dropped to give the days room), rows 58px.
- **Footer (sitewide in this theme):** the thin wordmark at 20px on teal-ink; the giant letters and the glow image are gone.
- **Chat launcher:** hidden while the first screen, the phone or the Rondo cards are in view. Its dark style is unchanged.

### Checks, round 5

- `npm test` 51/51 (new: three live sections, shared numbers, one filled action below the first screen). `check:theme` clean.
- axe WCAG 2.2 AA on the whole Home (main and footer), EN and ES, five widths: 0 violations in 10 runs; plus the piece's four views: 0 in 40 runs. Every h1 and h2 is two lines or fewer; no sideways scroll.
- Shared data: before clock-in the phone says "Clock in on the Main Street tablet" and 24:00; after, "Clocked in at 7:59 AM", 24:02 on the phone and in the Pay view. The Rondo card's text equals the piece's Rondo answer.
- Approve by keyboard: focus moves to the result; Dana's row reads 40 h with a 12–8 Sunday chip.
- Layout shift 0.0003. Hosted: changed files match their checksums.

### Still short

- The white price section meets the dark closing with a hard edge.
- The prepared change is a scripted sample: one fixed proposal, not a live Rondo result.
- The phone is a rebuild of the app's employee home, not a capture; small details may differ from the app.
- Chips are 12px below 1100px, under the 13px asked for.
- NEVORA page: hero, local nav and the time clock demo are still the older look.
- Not run: real iPhone, Safari, WebKit.

## Round 6 (same branch, same preview 193311572282)

**Home**
- The white price section now deepens into the closing's teal light (the mirror of the top join).
- Rondo's briefing adds who starts later ("Luis Medina starts at 12:00."), and the sources line sits right under the text.
- The website chat launcher reads "Ask Velani" / "Pregúntale a Velani", in white and teal-ink, a 48px round button on phones, hidden over the live pieces, with `scroll-padding-bottom`.

**NEVORA page, rebuilt (EN and ES).** It uses the site header (the page's own nav is gone) and the same engine and rows as Home, so both pages agree.
1. First screen: the teal light, the NEVORA wordmark, "The whole week, from schedule to pay.", trial plus "Try the time clock", and the Owner's Today (what needs you, who is in, the week's pay).
2. Plan: the week's schedule, large, "Published".
3. Clock in: the Direction B round 2 time clock (ported from `claude/velani-home-gusto-20261110`), set to the page's sample Saturday. Any four digits clock in Alexandra by name; the result links to her timecard. The sample note is the frame's caption.
4. Approve: the week's timecards with Jordan's late start flagged, and Approve timecards.
5. Pay: Alexandra's pay statement, calculated from the same hours at the sample rate, with the calculation-only line.
6. Rondo: the coverage question, the answer from the schedule, the prepared change and Approve.
7. Price and start, six questions as disclosures, one line for Relay, then one ending.
- Removed: the second story, the "Carmen's screen" repeat, the blue chat demo, "In development", the screenshot collage, the four endings, "eight people".
- `velani-nevora.css` now bundles `home.css` first; `nevora.js` is a stub; `kiosk.js` reads the page's sample clock through `window.NVWEEK`.

### Checks, round 6
- `npm test` 52/52 (new: the NEVORA page's order, shared rows with Home, binds, time clock, six questions, three filled actions). `check:theme` clean.
- axe WCAG 2.2 AA on main and footer, Home and NEVORA, EN and ES, five widths: 0 violations in 20 runs; the Home piece's four views: 0 in 40. Every h1 and h2 is two lines or fewer; no sideways scroll; 0 elements at opacity 0 at rest.
- NEVORA flow in a browser: before, the time clock shows 7:58 AM Saturday; typing a PIN records "Alexandra Rivera · Barista · Nov 7 · 7:59 AM", moves focus to the result, and her timecard and pay statement follow (24:02, $360.50 two ticks later). Approve timecards and Rondo's Approve work from the keyboard; Dana's Sunday chip and 40 h appear in the schedule. Layout shift 0.0006.
- Hosted: 13/13 changed files match their checksums, then `velani-motion.js` again after one more change. Viewport slices: `r6-nevora-1440-*`, `r6-nevora-390-*`, `r6-nevora-es-390-*`, `r6-home-1440-*`, `r6-home-390-*`.

### For Codex
- If the assistant service on the website introduces itself as Rondo, change it on the server to match "Ask Velani". Only the launcher label and avatar changed here; the chat panel's own header and replies were not touched.
- Confirm Rondo's coverage flow in the app matches the page: it reads the published schedule, prepares a change, the Owner approves, and the server rechecks.
- Confirm the timecard exception wording ("Late") and that approval precedes the pay calculation.

### Still short
- On the NEVORA page the sample clock keeps running while you read (so the sections stay in step); the pause button is only in the first screen.
- Timecard approval and the prepared change are scripted samples, not live results. The pay statement shows hours, rate and calculated pay only.
- The time clock demo's wrong-PIN and clock-out states do not exist in the demo.
- The old NEVORA page styles and scripts were removed from the bundle, but other pages (Plans, Custom software, About, Support, Sign in, legal) are still the older dark look.
- I looked at about a third of the hosted slices, not every one. Not run: real iPhone, Safari, WebKit.

## Round 7 (same branch, same preview 193311572282)

**NEVORA page**
- The first screen's object is now the Owner's desktop Today for the sample Saturday (icon rail, teal band "1 thing needs you", clocked in, late, pay calculated this week, needs-you card, next payday, today's shifts). On phones the rail drops and it reads as the Owner's phone Today. It runs on the shared rows.
- Sample clock: it runs only while a live piece is on screen (the Today, the time clock, the timecards, the pay statement, the Rondo flow, and on Home the phone and Rondo cards) and rests when none is. The pause button stays in the first screen.
- Time clock demo: PIN 0000 turns the field red with the kiosk's message "PIN not recognized for this location. Try again or ask your manager." (shake only without reduced motion). After Alexandra is clocked in, a second PIN records "Clock-out recorded" with the shift length, and her row, timecard and pay stop accruing. Spanish included. The caption tells the visitor about both.

**Plans**
- First screen in the teal light with the trial button; then white and #F2F6F5 sections in the system: the team-size price control (ticks, steppers and slider in teal; the − / + now announce the new count and price through a polite status), "Your 30 days" with the calendar, terms at 16px, "More than 30 employees?" as the outline action, the billing help line.
- Day 30 reads "On day 30, the Owner picks a plan in NEVORA. Nothing is charged until you do." in both languages.
- The schedule screenshot is gone. The page has one ending: the trial, with Jose named. No custom-work offer.

**Trial request page**
- White form card on #F2F6F5, teal-ink text, teal Send button, errors in dark red. The lede names Jose and two business days. The long trial-end paragraph is now the day-30 sentence plus the calculation-only line. The header's own request button is not shown on this page.
- The form's field names, values, validation and the preview/live switch were not touched.

### Checks, round 7
- `npm test` 52/52; `check:theme` clean.
- axe WCAG 2.2 AA on header, main and footer of Plans, the trial request, NEVORA and Home, EN and ES, five widths: 0 violations in 40 runs. Every h1 and h2 is two lines or fewer; no sideways scroll (a 62px overflow on the request page at 834 was found and fixed).
- NEVORA in a browser: Today shows "1 thing needs you", "2 of 3" clocked in; the clock rests with no live piece in view; 0000 shows the error and keeps focus on the keypad heading; a PIN clocks Alexandra in; a second PIN shows "Clock-out recorded", "Shift length 0:02", and her hours hold afterwards.
- Request form (preview mode only): an empty submit marks 2 fields invalid and moves focus to Name.
- Hosted: 11/11 files match their checksums, then `velani.css` again after a selector fix (Shopify wraps sections, so `main:has(> …)` did not match on the hosted theme). Slices: `r7-plans-*`, `r7-trial-*`, `r7-nevora-*` at 1440 and 390.

### Not done in this round
- Request form: the error summary still sits below the button with the old wording, errors do not clear per field as you fix them, and the success panel was not reworked. Labels sit inside the fields as before.
- Plans has no live piece from the shared data, and "what's included" is still the existing paragraph.
- No new tests were added for Plans or the request page; no mailto restyle.
- I viewed about half of the hosted slices, not every one. Home `r7` slices were not re-shot.

### Still short
- Plans: the join from the pale section into the dark closing passes through grey. On phones the round chat button sits over the calendar's last column.
- The price card's status announcement was not exercised with a screen reader.
- After a clock-out, a third PIN resumes the same shift rather than starting a new one.
- Not run: real iPhone, Safari, WebKit.

### For Codex
- Confirm the kiosk's wrong-PIN message and "Clock-out recorded" wording against the app, in English and Spanish.
- Confirm that billing help on Plans still points Owners to Settings in NEVORA.

## Round 8 (same branch, same preview 193311572282): the path Home → Plans → sent trial request

1. **Request form.** Field names, values, validation rules and the preview/live switch are unchanged.
   - Labels sit above each field (the existing `<label for>`, 14px teal-ink, "optional" as plain text); fields are white with a teal-grey border, 48px tall, with a teal focus ring.
   - After the first submit attempt, the form re-validates on input and on leaving a field. Each error clears when its field is fixed; errors stay tied by `aria-describedby`, and `aria-invalid` is removed.
   - The summary sits directly above Send with `role="alert"`: "2 fields need attention: Name, Email." It counts down as fields are fixed and empties when none remain. Spanish: "2 campos necesitan atención: …". Focus moves to the first invalid field.
   - The success panel fills one centred card; the side column is hidden in that state. Preview keeps its "Nothing was sent" note.
   - The email address is a quiet line of selectable text.
2. **Plans first screen.** The team-size price control is the page's live object, on the right at 1100px and wider, under the copy below that. It appears once: the price section below keeps the words, the two price boxes and the actions.
3. **Plans closing join.** The pale ground deepens into the teal light through teal midtones.
4. **Chat launcher on phones.** It steps aside while a form, calendar, table, price control or live piece is on screen, on every page (`quiet-chat`, set by a small observer in `motion.js`).
5. **Light header.** On the request page the header is white with teal-ink links and the ink wordmark. Dark-hero pages keep the dark header.

### Checks, round 8
- `npm test` 54/54 (new: Plans first-screen object and single ending; request form labels and summary strings). `check:theme` clean.
- axe WCAG 2.2 AA on Plans, the request page, NEVORA and Home, EN and ES, five widths: 0 violations in 40 runs. Headings two lines or fewer; no sideways scroll.
- Form by keyboard, preview mode only, at 1440 and 390, local and hosted: empty Send → "2 fields need attention: Name, Email.", role alert, focus on Name, summary above Send; typing a name → "1 field needs attention: Email." and the name error clears; fixing the email empties the summary; Send → the success panel, with focus on it.
- Hosted: 5/5 files match their checksums. Slices `r8-plans-*` and `r8-trial-*` at 1440 and 390, plus `r8-trial-*-error.png` and `r8-trial-*-success.png`.

### Not done or still short
- The success panel keeps the existing words ("We'll email you within two business days…"); it does not name Jose, and its button says "Back to home".
- The light header is applied to the request page only (and the other contact topics, which share the layout). Other light pages without a dark first screen were not reviewed.
- The header's hidden request button leaves an empty slot at the right of the nav on the request page.
- The Plans join is teal now, but it reads as a soft bright band rather than an invisible transition. Banding was not checked on an 8-bit display.
- Launcher hiding was confirmed on Plans at 390 by screenshot; 360 and the NEVORA and request pages were covered by the same rule but not looked at one by one.
- I looked at about half of the hosted slices. Not run: real iPhone, Safari, WebKit, a screen reader.
- The live (published) form path was never submitted, by design.
