# Calmer layout pass (2026-11-03)

Owner request: organise the site so visitors are not overwhelmed, with consistent spacing and a neat structure. The approved plan is summarised below; the measurements come from `scripts/checks/layout-audit.mjs` (Home and NEVORA targets) and a full-route audit at 1440px and on an iPhone 13.

Baseline: commit f730418 (the same build as the unpublished interaction-fix theme 192990773562). This pass includes those interaction fixes, so that theme can be skipped.

## Results

| Page | Desktop screens | Phone screens | Words |
| --- | --- | --- | --- |
| Home | 7.5 → 5.5 (target 5.5) | 10.2 → 7.3 (target 8) | 318 → 287 |
| NEVORA | 13.5 → 8.8 (target 9.5) | 17.6 → 11.8 (target 12) | 902 → 646 (target 650) |
| Custom development | 3.7 → 3.2 | 5.9 → 5.2 | 347 → 327 |
| About | 2.4 → 2.2 | 3.7 → 3.4 | unchanged |
| Help | 2.2 → 2.0 | 3.2 → 2.9 | unchanged |

Other targets, all met: NEVORA top bar 16 → 8 links plus one "by Velani" menu button; text sizes ≤ 9 per page; 2–3 text edges per page outside the demo and screenshots; separator lines NEVORA 25 → 5, Home 3.

Known exception: on desktop the owner's web screen appears twice on NEVORA, small in the hero's three-screen line and large under "What you see as the owner". The plan kept the hero line as the one place all three screens appear together.

## What changed

- **Spacing ladder** (`src/night/base.css`): `--s1` 48–72px inside a chapter, `--s2` 72–120px between a chapter and its follow-up, `--s3` 88–136px between unrelated chapters.
- **Headings**: `t0` hero only, `t1` for at most three primary chapters, `t2` for supporting chapters. `t3` and the step labels share one phone size.
- **Home**: five sections. The "Could this work for your team?" strip is gone; its action lives in the quote card. Three questions sit beside their heading with a link to the full list. "Built by Velani" is one line under the quote card. On phones the three role screens are a labelled, keyboard-scrollable swipe row with the next card peeking.
- **NEVORA**: one top bar (the Velani bar is hidden on this page at every width) with six section links and a "by Velani" menu. Chapters 9 → 7. The story has three shorter steps; phones show the hero phone and one To-do crop. The owner screen is a 16:9 crop. Details 9 → 6 items with one line on access, encryption, logs and advertising. Get NEVORA has three steps and one quote button. Help is one line of four links.
- **Inner pages**: the two tall contact cards are one compact band; Custom development has one "Tell us about your project" action after the services.
- **Copy**: shorter ledes and story steps, no new claims. Facts kept word for word where they are policy statements (logs up to 90 days, no sale of personal information, deletion within 30 calendar days, Northern Virginia).

## Checks run (local preview, fictional data)

| Suite | Result |
| --- | --- |
| `npm test` | 33/33 |
| `npm run check:theme` | clean |
| `npm run check:browser` | 51/51 |
| `npm run check:privacy` | passed |
| `scripts/checks/acceptance.mjs` | 76/76 |
| `scripts/checks/scroll-stability.mjs` | 9/9 routes |
| `scripts/checks/clipping.mjs` (320px, 200% zoom) | 18/18 routes each |
| `scripts/checks/assistant.mjs` (fresh harness) | 41/41 |
| `scripts/checks/layout-audit.mjs` | 19/19 |

Test changes: acceptance now uses the quote card (`.h-ask`) on Home and the NEVORA bar's quote pill after the demo, since the strip and the in-demo link were removed. The clipping check accepts content past the edge only inside a `[data-scroll-x]` row that scrolls, takes keyboard focus and shows at least 16px of the next item; any other content past the edge still fails.

Manual browser checks: Tab reaches the Home swipe row on a phone with a 2px focus ring and the arrow keys scroll it; on desktop the row is out of the tab order. The "by Velani" menu opens with Enter, moves focus to its first link, closes with Escape and returns focus to its button.

Evidence: `evidence/layout-pass-20261103/` (before and after captures), `evidence/layout-*`, and the dated suite folders from this run.

## Not verified

- Hosted Shopify rendering until the preview theme is uploaded and checked by file checksum.
- Real iOS Safari and Android devices; phone results come from Chromium device emulation.
- RTL mirroring; the site has no RTL locale.
