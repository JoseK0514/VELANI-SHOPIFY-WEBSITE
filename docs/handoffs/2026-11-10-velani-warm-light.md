# Velani warm light: Home and NEVORA (Nov 10, 2026, preview only)

Jose approved the recommendation to try a warm light look on Home and NEVORA first, as one preview to compare with the live site. Nothing is published.

- **Preview theme:** 193306460474, "Velani warm light Home + NEVORA (preview)". It duplicates 193306198330 (the Nov 10 follow-ups), so it carries those changes too.
- **Branch:** `claude/velani-warm-light-20261110`, from `1f09302`.
- **Not changed:** `commerce_api_url` (settings_data was not uploaded), MAIN 193290043706 and 193306198330.
- **Preview links:**
  - `/?preview_theme_id=193306460474`
  - `&view=velani-es`
  - `&view=velani-nevora`
  - `&view=velani-es-nevora`

## What changed

**Home, EN and ES.**
- The hero and the closing panel are unchanged: the dark cinematic light opens and closes the page.
- The three panels between them (NEVORA, Websites and online stores, Booking and rewards apps) sit on warm paper:
  - backgrounds #f5f0e8, with #efe8dc for the middle panel;
  - ink #1c1915 for text, #4f493f for body and #6b6458 for small print.
- The background photos are no longer painted on these panels. Their boxes stay, so the phone layout keeps its frames.
- Buttons on paper: the primary is filled with ink and the second is outlined in ink. Both keep the arrow-right icon.
- Screens and phones keep their frames, with a warm contact shadow.
- The NEVORA wordmark on paper is the app's own light-background version: navy letters with the blue tip on the A. It is `night-nevora-wm-ink.png`, made with a transparent background from `public/images/nevora-wordmark.png` in the NEVORA app. The white version stays on dark.

**NEVORA, EN and ES.**
- The hero and the local nav stay dark.
- Every chapter after the hero sits on paper, alternating the two tones: Carmen's week, the time clock, A Saturday, Getting started, Questions, Rondo, Relay and the help band.
- The Rondo example chat is a solid dark card, without the blue glow. The Relay plan card is a raised paper card.
- The footer stays dark.

**Text and layout:** no copy changes. The only markup change is the wordmark image on the Home NEVORA panel. Headings, the type scale, spacing and layout are unchanged.

## Checks

- `npm test`: 47/47. `check:theme`: clean.
- **axe** (WCAG 2.2 AA tags) with a sideways-scroll check, run on all four pages at 360, 390, 768, 834, 1024, 1280 and 1440: 28 runs, 0 violations, no sideways scroll. The baseline gives the same result.
- **Local screenshots:** all four pages at 1440, 1024, 834 and 390, reviewed over three rounds.
  - Round 1 found the Tool Box screen covering its heading on phones. Fixed by keeping the photo's box but not painting it.
  - Round 2 found the teal-blue A of the wordmark turned black by a filter. Fixed with the app's own light-background wordmark.
- **Hosted preview:**
  - All five uploaded files match the build checksums.
  - The four views load the theme 193306460474 CSS.
  - Home at 1440 and NEVORA at 390 render, with no sideways scroll.

## For Jose

- **Rollout:** if you like it, the next pages would be Plans, Support and Sign in, which are reading pages. The other pages are still dark, so the site is mixed in this preview.
- **Not checked yet:** real Safari on an iPhone.
