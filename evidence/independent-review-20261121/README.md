# Independent review, November 21, 2026

Scope: `8177dd6..2342d56` on `claude/optimistic-fermat-e5347b` (pull request JoseK0514/VELANI-SHOPIFY-WEBSITE#3 into
`development`). The reviewer was a separate agent given the repository rules and the scope, not the author's notes or
conclusions. It made no edits, commits or pushes. Its report is reproduced below, then what happened to each finding.

## Report (as delivered)

No blockers. Suites pass (`npm run build`, `npm test` 118/118, `npm run check:theme` no offenses).

1. Should fix: `src/seo/llms.txt.liquid` is stale and ships as `templates/llms.txt.liquid`. It has a "Custom development"
   section linking the removed `/pages/custom-development`, lists Rondo and Relay under "Coming later" at `nevora#rondo` and
   `nevora#relay`, says Velani builds websites and apps, and its Spanish list lacks es-rondo, es-relay and es-productos. The
   removed-pages test does not cover it.
2. Should fix: text below 4.5:1 on the Day sky backgrounds (axe cannot read the gradients; measured from pixels). `.more`
   links (#0A7C76) on dawn 3.56–3.85:1 (NEVORA, Plans, Products, About, Sign in, Help, Relay; Home at dawn and golden hour);
   Home `.hero .note` 3.79–4.0:1; NEVORA lead and eyebrows 4.07–4.47:1; Home `.place` 4.11:1 and timeline labels about
   3.3–4.4:1.
3. Should fix: the account pages' email link is shown by colour alone (WCAG 1.4.1); axe `link-in-text-block`, 1.25:1.
4. Should fix: the Day pages say "Forgot password?"; the NEVORA policy pages say "Forgot access". Confirm the app label.
5. Should fix: the Rondo approval checklist (`role="status"`) always reads as done, and approving announces nothing.
6. Minor: a Rondo sample answer says "Everyone else is at 32 hours or less" while the sample week shows 32:02.
7. Minor: the site says Rondo is included in every plan; the assistant's knowledge says to confirm availability with Velani.
8. Minor: the assistant's "Try the time clock" links `/pages/nevora#try`, an anchor that does not exist (`#clock` does).
   Already broken before this change.
9. Minor accessibility: the kiosk PIN dots give no text feedback; "Español"/"English" buttons have no `lang`; without
   JavaScript, Home's day moments 2–5 stay hidden.
10. Minor Spanish wording: "Dos maneras de llegar al día 30", "tus localidades", "Sabe qué se está acabando.",
    "Respuestas con tus propios registros", and in drawn screens "Con entrada 3 / 5" and "Hoy, por primera marca".

Checked and found fine: links across all 44 built pages (2,353 anchors; only llms.txt linked a removed page), Spanish
links and `hreflang`, theme snippets and draft links, inquiry and billing safety gates, contact and Help flows in both
languages (no POSTs), every `velani-commerce.js` hook, no runtime errors at 1280 and 390 px, the phone menu, one `h1` per
page with no duplicate ids, mixed-language marking, and the facts (prices, trial, quotes, support hours, sample arithmetic).
Not checked: hosted Shopify, live APIs, Firefox and WebKit, the share images.

## Outcome

| # | Outcome |
| --- | --- |
| 1 | Fixed. `llms.txt` rewritten for NEVORA, Rondo and Relay with their own pages, no custom work, and the full Spanish list. New test: `llms.txt` and `robots.txt` name only existing pages and no custom work. |
| 2 | Fixed. `--link` #0A7C76 → #065E59 and `--ink-2` #5F5F64 → #4F4F54; small teal labels (eyebrows, step and day labels) use the link teal; Home's note grey, `.place` and timeline opacities raised. Measured again from pixels at every spot named (`contrast.txt`, including Home at dawn and golden hour): lowest 5.10:1. On the plain page background these colours read 7:1 or more. |
| 3 | Fixed. The account pages' email link is underlined. |
| 4 | No site change. The NEVORA app's own label is "Forgot password?" (app copy and its policy source at version 2026-11-10, whose test rejects "Forgot access"), so the Day pages are right. The website's policy mirror is still version 2026-11-09 with "Forgot access"; the policy text is approved legal wording, so syncing it to 2026-11-10 is for Jose. |
| 5 | Fixed. The checklist is no longer a status region; each step carries hidden "Not yet:"/"Done:" ("Todavía no:"/"Hecho:"), and one status line announces the outcome (or "Left as is") once. |
| 6 | Fixed. "Nobody else is above 32:04." / "Nadie más pasa de 32:04." |
| 7 | For Jose (already in the handoff): confirm whether Rondo is included today; the site and the knowledge must say the same. |
| 8 | Fixed. The assistant links `#clock`. |
| 9 | Fixed: PIN count announced ("1 of 4 digits" / "1 de 4 dígitos"); language buttons carry `lang` and keep it when switched. Not changed: Home's day moments without JavaScript; they are stacked on one spot, so showing all five would overlap, and the same content is in the sections below. |
| 10 | Fixed: "Lo que pasa el día 30.", "tus locales", "Entérate de lo que se está acabando.", "Respuestas basadas en tus propios registros.", "Marcaron entrada", "Hoy, por hora de entrada". |

Also found while taking screenshots for the user, before the review reported: Rondo's answer card and Approve buttons were
unstyled on NEVORA and Rondo (fixed in `2342d56`, `evidence/day-answer-card-20261121`).

Verification after the fixes: `npm test` 121/121, theme check 0 offenses, `scripts/browser-check.mjs` 101/101
(`evidence/day-review-fixes-20261121`), Day check 861/861 on all 41 rendering pages, flows Spanish 56/56, Rondo/Relay
12/12, NEVORA demos 12/12, Help 12/12, Contact 17/17, trial and billing 10/10, review behaviour 15/15
(`review-flows.txt`). Share images regenerated with the new label colour.
