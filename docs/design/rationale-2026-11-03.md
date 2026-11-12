# Design rationale: why every value is what it is (2026-11-03)

Measured on the rendered site with `scratchpad/precision/measure.cjs` (computed styles, button geometry, header centring, left edges, radii, and contrast sampled from the pixels behind each block of hero text). Every number below is a decision, not a default.

## Type

| Decision | Value | Why |
| --- | --- | --- |
| One family | DM Sans 400 / 500 / 600 | A geometric grotesque reads as technology without imitating Apple's or Tesla's faces. Three weights are loaded; nothing is synthesised. The serif wordmark is the only other voice, so the brand mark stays unmistakable. |
| Seven sizes on desktop | 12 · 14 · 17 · 20 · 28.8 · 43.2 · 80.6 (hero 84 / 64) | Measured inventory before the pass: ten sizes on Support, nine on NEVORA. Each extra size dilutes hierarchy. 13 px and 15 px were folded into 12 and 14; 21 px into 20; the FAQ summary now equals the lede. |
| Body 17 px, line-height 1.55 | `17px/1.55` | 16 is the floor; 17 reads better in DM Sans's small x-height on dark backgrounds. 1.55 keeps 60–75 characters per line comfortable. |
| Measure caps | documents 42 em, FAQ answers 40 em, hero copy 30 em, split rows 36 em | Measured lines ran to 84 characters on legal pages; 42 em lands them at 68–75. |
| Hero display | 84 px, line-height 1, letter-spacing −0.03 em | Large grotesque type needs negative tracking or the words fall apart; −0.03 em is one value for every heading at 40 px and up (was three different values). Titles under 40 px use −0.02 em; under 24 px, −0.01 em. |
| Uppercase labels | 12 px, 500, +0.12 em | Small capitals need positive tracking to stay legible; 0.12 em is the one value for labels, header links and footer links. Buttons use 0.10 em because their 14 px caps are already wider. Two values, not four. |
| Numbers | `tabular-nums` on the time clock | Digits change; the layout must not. |

## Color

| Decision | Value | Why |
| --- | --- | --- |
| Background | `#05090e`, never `#000` on surfaces | Pure black flattens shadows and makes near-black panels disappear. Panels sit at `#0d1620` and `#101c29`, two steps up the same hue. |
| Text | `#f4f6f9` / `#a3b1c1` / `#7a8a9c` | Three steps: primary, secondary, tertiary. Tertiary measures 5.1:1 on the background, so even captions pass AA. |
| Labels over imagery | `#e6ecf5` | The label grey (`#c9d6ea`) lost 15% of its contrast against a light streak; near-white keeps every kicker over 4.5:1 at its worst pixel. |
| Accent | `#bbd8ff`, links and the current menu item only | One accent, used sparingly, so the white filled button stays the only loud thing on a screen. |
| Contrast over photographs | Scrim under every hero copy block + stronger phone shade | Sampled worst-case ratios before: headline 4.5:1, paragraph 2.3:1 on desktop; 2.1:1 and 3.3:1 on phones where the light ribbons cross the copy. After: headline 8.5:1, paragraph 6.1:1 on desktop; 7.2:1 and 9.6:1 on phones. The scrim is a radial gradient that is invisible as a shape. |

## Buttons

| Decision | Value | Why |
| --- | --- | --- |
| Shape | 50 px tall, 4 px radius, 1 px border at 35% white, uppercase 14 px | The SpaceX/Tesla button: square enough to read as an instrument, not a pill. 50 px clears the 44 px touch minimum with room for the arrow. |
| Primary | White fill, dark text | One primary per view; it is the only filled element on a screen, so the eye lands on it first. |
| Arrow | 16 px, centred to ±0 px | Measured icon centre offset 0.0 px; text centre sat 0.4 px high (DM Sans caps), so the button carries 1 px top padding. |
| Press | scale 0.96, 150 ms, ease-out | The standard press depth; anything deeper reads as a bug. |
| Glass | `backdrop-filter` on hero buttons only | Blur costs scroll frames on phones; it earns its place only where a button sits on a photograph. |

## Header and menus

| Decision | Value | Why |
| --- | --- | --- |
| Bar | 56 px, items centred at 0.0 px | The hairline is an inset shadow instead of a border, so the bar is exactly 56 px and nothing sits half a pixel low. |
| Links | 12 px uppercase, 14 px padding each side, 28 px between glyphs | The gap between words is twice the gap inside them, so the row reads as six items, not a sentence. |
| Order | NEVORA · Websites · Custom apps · Plans · Support · About, then **Start free demo** | Product first, services, then money, then help. The demo is the strongest offer, so it is the one button on every page. Contact lives in the menu and the footer. |
| Hide on scroll | tuck after 24 px down, return after 12 px up | Reading gets the full screen; the menu is one flick away. |
| Phone menu | Full-screen sheet, uppercase rows, demo button, client support line | The same language as the site; the two things a phone visitor needs (demo, phone number) are at the bottom under the thumb. |

## Alignment and spacing

| Decision | Value | Why |
| --- | --- | --- |
| One left edge | 100 px at 1440, 20 px on phones | Wordmark, hero label, headline, paragraph and buttons share one edge (measured: all at 100.0). Nothing floats. |
| Vertical rhythm inside a hero | label → title 16 px, title → paragraph 16 px, paragraph → buttons 32 px | Was 14 / 18 / 30. Now two steps of an 8 px scale: 16 inside a group, 32 between groups. |
| Section spacing | 48–72 / 72–120 / 88–136 px | Three steps: heading-to-content, chapter-to-follow-up, chapter-to-chapter. |
| Radii | 4 px controls, 12 px surfaces, device frames 36/44 px | Three tokens. 14 px, 18 px, 22 px, 24 px and 28 px were removed. Device frames keep their own radius because they are objects, not surfaces. |
| Hairlines | 8% white, only between rows that space alone cannot separate | Space first, lines last. |

## Motion

| Decision | Value | Why |
| --- | --- | --- |
| Hero | 30 s drift, scale 1.06→1.14, alternating | Slow enough to feel like film, not a slideshow. |
| Scroll cue | 2.4 s bob, pauses on hover | One moving element on the first screen, never two. |
| Headlines | words rise 0.85 s with a 40 ms stagger, once | Reading order, shown once. Reduced motion shows everything still. |
| Everything else | 150–300 ms, named properties only | Nothing animates on hover except colour; nothing uses `transition: all`. |

## Words

The NEVORA page went from about 900 words to 519. Every sentence had to answer "what does the visitor do next" or go. Headings are statements ("Schedule. Clock in. Pay."), steps are five words, the offer's terms sit in one line under the offer, and the fine print carries the legal precision so the page does not.
