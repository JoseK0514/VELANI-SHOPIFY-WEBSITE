# Client hub UI: Claude, November 12, 2026

Branch `claude/velani-signature-hero-20261110`. Contract (unchanged): Codex's `2026-11-11-codex-to-claude-client-hub.md` and
`2026-11-07-client-hub-interface.md` in the `velani-client-hub` worktree.

## Scope
Only the client request form on Help (`/pages/help#client`, `/pages/es-ayuda#client`): `client-work` to `new_work`,
`client-help` to `project_support`. Contact, NEVORA trial, quote and Relay keep the Shopify contact transport.

## Log
- Step 1: `src/client-hub.mjs` (validation with contract codes, exact body, one Idempotency-Key per logical submission,
  outcomes saved / invalid / conflict / verify / rate / unknown / rejected) and `tests/client-hub.test.mjs` against a local
  fake of the two endpoints (14 tests). No UI yet.

## Decisions
- New work has no timing field in the contract. The form's Timing choice is sent as the last line of `description`
  (`Timing: This month`), in English like the other request values. Question for Codex: fine, or drop it?
- Urgency choices map: It can wait = normal, It's slowing us down = high, We can't work = urgent. Blank = normal.
- Support needs `project`, so the form gains one field: "Website or app" (required for Help, optional for New work).
- Step 2: the Support form (`clientSection` in `src/render.mjs`) is a client-hub form: no Shopify `{% form 'contact' %}`,
  no `contact[...]` names, no `action`. `data-hub` is `live` only when `theme.role == 'main'`, otherwise `preview`.
  New field "Website or app" (`project`). UI in `public/assets/velani-hub.js`; `velani.js` hands it only this form.
- Step 3: render tests (17 in `tests/client-hub.test.mjs`), browser check `scripts/checks/client-hub-browser.mjs`.
- Step 4: privacy notice gains a "Client requests" section (EN; the Spanish pages link to it). The shared
  "Last updated" date was not changed (it covers every legal page). Jose decides.

## How it behaves
- Published theme: GET `/v1/client-hub/config` on load. Unavailable, disabled or wrong action: the form is hidden and a calm
  notice shows support@thevelani.com as selectable text. Nothing is posted anywhere else.
- Submit: validate, Turnstile (site key and action from config, explicit render, interaction-only), then POST exactly as
  the contract shows. Key rules live in `createHubClient`: same key while the body (without the token) is unchanged, new key
  after any edit, after a 409 and after a saved request. A fresh token on every attempt.
- Outcomes: 201/200 saved panel with the reference and a copy button (`submitted` or `pending` wording); 422 beside the
  fields; 409 explained; 403 and Turnstile failure keep input and key; 429 and 503 respect Retry-After (button waits);
  network, timeout (20 s), 5xx and an unreadable 2xx are "could not confirm", button reads Try again, same key.
  400, 413, 415 and 403 origin_not_allowed: "could not be sent from this page", with the address.
- Unpublished theme and local preview: no GET, no POST. The draft is checked and the saved panel shows as a labelled
  preview with the sample reference VEL-0000-0000.
- Review states (never on the published theme): add `#hub-state=` plus one of
  `sent pending conflict rate unavailable verify unknown invalid verifying sending` to the Support address, fill the form,
  press Send (unavailable shows on load).
- Real sending for Codex's acceptance is simply the published theme: `https://www.thevelani.com/pages/help#client` and
  `/pages/es-ayuda#client`. There is no test switch and no way to send from a preview.
- Local live testing against a fake only: `VELANI_CLIENT_HUB_API=http://127.0.0.1:<port> node scripts/serve.mjs`.
  CSP in `scripts/serve.mjs` then allows that origin and challenges.cloudflare.com (script, connect, frame), nothing else.
  Shopify themes send no CSP of their own, so there is nothing to change on the hosted site.

## Checks (Nov 12)
- `npm test`: 74/74 (17 new). `npm run build`: 37 routes. `npm run check:theme`: no offenses.
- Contact sections (EN, ES) are byte-identical to 24db862 (md5 compared), so NEVORA trial, quote and Relay are untouched.
- Browser, Chromium headless, fake hub + Turnstile stub, zero requests off this machine:
  live 4 runs (1440/390 x EN/ES) 69 checks each = 276/276; preview 4 runs 36 each = 144/144; 88 axe runs
  (WCAG 2.2 AA, scoped to the form section), 0 violations; no sideways scroll; keyboard path; reduced motion on one state.
  Run: `node scripts/checks/client-hub-browser.mjs <live|preview> <1440|390> <en|es> [screenshot-dir]`.
  Local screenshots: `evidence/client-hub-20261112/local-*.png` in the main checkout (176 files, not committed).

## NOT DONE: hosted upload
Theme 193311572282 "Velani signature hero (preview)" is now role MAIN (the live site reports it too). The rule is never
to write to MAIN, so nothing was uploaded and there are no hosted `hub-*.png` screenshots. The live files equal the
24db862 build, so a fresh unpublished duplicate of MAIN plus these 7 built files is the whole change:
assets/velani.css a661330973669a813ed04e974d628325, assets/velani.js 1c21256036e0352445ec5ee7de1b4d08,
assets/velani-hub.js efa084a44d370bfba1ffba511cca5b2a, assets/client-hub.js e23f75ffa53f010ded95f8dcbe982c98,
sections/velani-help.liquid b0fdff7eb454326e810f701caf62e5c9, sections/velani-es-ayuda.liquid
a7cd8656d6b691a6ab8fd1e2f36d0281, sections/velani-privacy.liquid 72aba39fcf9d946be930d2a56c12b5ce.
Creating a new theme was not in the task, so it waits for Jose's or the coordinator's word.

## Questions for Codex (not worked around)
1. Timing for new work travels as a last line of `description`. Accept, or should the form drop Timing?
2. The UI treats any 5xx, and a 2xx without a `VEL-` reference, as "could not confirm" and retries with the same key. Agreed?
3. The client-hub Turnstile site key must allow www.thevelani.com and thevelani.com. Not verifiable from here without a real run.
4. The browser reads `Retry-After` cross-origin, so it must stay in `Access-Control-Expose-Headers` on 429 and 503.
5. When the published theme changes, the form is live at once. Codex's real acceptance (Jose's approved inbox) should follow the publish.

## Later on Nov 12: hosted copy, Codex's review, acceptance mode

The "NOT DONE: hosted upload" section above is superseded. The coordinator created theme **193374224698**
"Velani client hub forms (preview)", an UNPUBLISHED duplicate of MAIN. All writes went there only. MAIN
(193311572282) was never written and nothing was published.

### Hosted preview guard (before the setting was turned on)
First upload: 7 built files, 7/7 `checksumMd5` equal to the build. With the preview guard active, 36 screenshots
`evidence/client-hub-20261112/hub-<state>-<width>-<lang>.png` (default, sent, pending, conflict, rate, verify, unknown,
invalid, unavailable x 1440/390 x EN/ES), 80/80 hosted checks, zero requests to the client hub.
Script: `node scripts/checks/client-hub-hosted.mjs <theme> <width> <lang> <dir> guard`.

### Codex's answers
Timing as the last description line: accepted. Same-key retry for uncertain 5xx and unreadable 2xx: required, kept.
Retry-After exposure verified. Both website hosts allowed for Turnstile.

### Review finding fixed: nothing stale can be sent
- From Send until the outcome, every field is read-only and both request kinds and the selects are disabled
  (`aria-busy` on the form and the fieldset). They open again with the outcome, values kept.
- Second guard: after the security check returns, the form is read again. If anything differs from what was validated,
  nothing is sent, the form is revalidated, and the next Send is a new submission with a new key.
- The body is always built from the validated values. The Turnstile script now loads when the form is first entered.
- Regression checks in `scripts/checks/client-hub-browser.mjs`: delayed challenge with typing and kind switching (no
  change possible, the checked values are sent); delayed challenge with a change forced past the lock (send cancelled,
  no POST, next Send carries the new values); delayed POST (locked; a forced change goes out later under a new key).
- The two brittle source-text assertions the review named were removed; behaviour is proven in the browser check and
  by rendering the section through Liquid.

### Acceptance mode
Theme setting `client_hub_preview_submissions` (checkbox, default false, group "Client request testing").
- Published theme: real sending. Unpublished, setting off: preview guard, review states available.
- Unpublished, setting on: real config GET and real POST, a visible notice ("Acceptance test copy. Requests sent from
  this page are real and go to Velani support." / Spanish), no preview note, no review states (`#hub-state` ignored, and
  the script also refuses fixtures whenever sending is real).
- Turned on ONLY on 193374224698: `config/settings_data.json` read, one key added, everything else kept exactly
  (`inquiries_enabled: true`, `assistant_api_url: "https://velani-ai.vercel.app"`, `commerce_api_url: ""`,
  `content_for_index: []`), read back and confirmed with `"client_hub_preview_submissions": true`.
- Second upload: velani.css, velani.js, velani-hub.js, both Support sections, `config/settings_schema.json`. 8/8 built
  files on the theme equal the build (client-hub.js and the privacy section unchanged). Role confirmed UNPUBLISHED.
- Hosted look without submitting (`... real`): 32/32. Test notice shows; config GET 200, enabled, action
  `velani-client-hub`, one GET per load and no POST; Turnstile script loads and a widget renders with the served key;
  `#hub-state=unavailable` does nothing; an empty Send only shows field errors. The script blocks every POST to the hub.
  Screenshots `hub-acceptance-<width>-<lang>.png`. No request was sent by Claude.

Acceptance addresses (Codex sends the two approved synthetic requests):
- EN: https://www.thevelani.com/?preview_theme_id=193374224698&view=velani-help#client
- ES: https://www.thevelani.com/?preview_theme_id=193374224698&view=velani-es-ayuda#client
After acceptance, turn the setting off on this copy (or do not publish this copy's settings; a published theme sends
for real regardless of the setting).

### Checks, final
- `npm test` 76/76; build 37 routes; `check:theme` no offenses.
- Local browser, fake hub: live 4 x 85 = 340/340, preview 4 x 37 = 148/148, 92 axe runs with 0 violations
  (1440 and 390, EN and ES).
- `check:privacy` 4/4 passed. `check:browser` 76 passed, 14 failed: the same 14 fail on 24db862 (Home geometry, menu,
  old inquiry button and Relay fragment checks that predate the current design). Not caused by this work, not fixed here.
  Both need the preview server on 4173 and `VELANI_CHROMIUM_EXECUTABLE`.
- Legal "Last updated" date: not changed. One date is shared by every legal page and earlier notice edits (the assistant
  section) did not move it, so the repo has no per-notice convention. The privacy text itself says the date is updated
  when the notice changes, so Jose should decide before this copy is published.
