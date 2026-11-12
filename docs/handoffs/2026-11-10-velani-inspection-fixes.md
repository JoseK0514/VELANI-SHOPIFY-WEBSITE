# Velani inspection fixes (Nov 10, 2026)

This pass applies the Nov 10 website inspection: execution steps 1 and 2, plus copy and structure items. Nothing is published.

- Preview theme: **193290043706**, "Velani inspection fixes Nov 10 (preview)". It is a duplicate of the live theme 193268777274. Only that preview was written to.
- Codex's draft 193285849402 and the live theme were not touched.
- `commerce_api_url` stays empty: the duplicate's `config/settings_data.json` was not uploaded. The site keeps the assisted trial-request CTA.
- Branch: `claude/velani-home-mock-20261107`.

## Contradictions fixed (EN and ES)

| Finding | Change |
|---|---|
| NEVORA FAQ says "ready in minutes" | The answer now describes the assisted process: ask for a trial; we reply within two business days and set up the workplace with you; online signup isn't open yet; the 30 days start the day the workplace is ready. |
| Account deletion says an unpaid trial workplace is deleted within 3 days | The sentence is removed, matching the app's current `src/lib/legal/policies.ts` (Codex 3922df94) word for word. Privacy and terms already say that trial expiry starts no automatic deletion. |
| Plans promises an end date based on the visit date | The hero line is now fixed: "Your 30 free days start the day your workplace is ready…" Day 1 and Day 30 are no longer rewritten to today's date. The calendar is labeled "Example: a workplace that's ready today…" at every width. The price-card line no longer names a date. |
| Payroll scope sits low on the NEVORA page | The NEVORA h1 is now "Scheduling, time clock and payroll calculation." The hero sentence ends "You still pay your team and file payroll taxes." |

## Trial and sign-in paths

- **Trial button:** every trial button says "Request a free trial" / "Pide la prueba gratis". It opens the trial request (`/pages/contact?interest=nevora-demo`) directly instead of going through `nevora-start`.
  - The request page explains assisted setup and when the 30 days start.
  - The compact NEVORA nav pill says "Free trial" / "Prueba gratis"; the longer label overflowed at 960 to 1100px.
- **Sign in → "How to sign in to NEVORA."** It uses the Support layout and holds sign-in guidance only.
  - Three facts as cards; the PIN card says "Ask the business Owner to set a new one" ("Pide al dueño del negocio…").
  - No product screenshots, no project form, no cross-sell.
  - It ends with "Still can't sign in?", linking NEVORA support and email.
- **Client request form:** moved from Sign in to Support (`/pages/help#client`, same form, ids and validation). The "A website or app we built" door links there.
- **Support:**
  - The intro separates staffed hours from the reply target: "We read email Monday to Friday, 8 am to 9 pm ET, and reply within two business days."
  - The page ends on support with no cross-sell.
- **NEVORA local nav:** Time clock · Screens · Get started · **Pricing** · Questions · Coming next.
  - Rondo and Relay are one secondary link, and their sections now sit after the questions.
  - In the header NEVORA menu, Plans comes before Rondo and Relay.
- **Plans:**
  - The prices come right after the hero: two quiet $19/$29 boxes plus what's included. The 30-day calendar follows.
  - "Manage billing" is out of the hero. It is now one line under the actions: "Already on NEVORA? … Billing help".
- **Billing return page:** the title is "Plan and billing." It has no "Confirming payment" wording while billing is closed. When billing is live, the script still shows the confirming steps.
- **Noindex:** nevora-verify, nevora-billing and nevora-billing-return, plus es-configurar, es-facturacion and es-pago, now carry `noindex`. Shopify's sitemap still lists them. Hiding them there takes a page SEO setting, which is admin data and was not changed.

## Copy

- **Home:** "For everything else" is gone. The line is now "NEVORA plans your team's shifts, records their hours and calculates their pay. We also design and build websites, booking apps and online stores for businesses like yours." ES matches.
- **About:** "top-quality software at prices they can afford" now reads "…with a fixed price in writing and everything in English and Spanish." The route description adds the practices the site already states: written scope, milestones, bilingual.
- **Spanish:**
  - "Tu dueño" is fixed.
  - "comprobantes de pago" became "comprobantes de nómina".
  - "espacio de trabajo" became "lugar de trabajo" on the website, including velani.js.
  - `docs/i18n/es-glossary.md` is updated with the Owner wording, the trial label and the corrected facts: no 3-day deletion and no phone number.

## Checks run

- `npm test`: 46/46, including a new test that the six billing and setup utility pages render `noindex` on the main theme and Plans, Sign in and Support don't. `npm run build` and `check:theme` are clean.
- **Local browser:** Chromium headless at 1440 and 390, EN and ES.
  - axe (WCAG 2.2 AA tags) shows 0 violations, and no page scrolls sideways, on 15 changed pages: sign-in, help, plans, nevora, home, contact trial request, billing return, about, account deletion, with ES pairs.
  - No overflow at 834, 900, 960–1180 and 1280 on the NEVORA, Plans and Support pages in both languages.
- **Keyboard:**
  - Support: Tab reaches Get help, and Enter lands on `#client` with the Help kind preset.
  - Sign in: Tab reaches NEVORA support.
- **Repo browser check** (`check:browser`, Chromium): 80 passed and 10 failed. The baseline build at 6bb6dd5 gives the same 10 failures and 38 runtime errors. Those checks are stale: they look for markup the site replaced on Nov 7. They are not a regression.
- **Hosted preview 193290043706:**
  - All 28 uploaded files match the build checksums.
  - Read back at 1440 and 390: sign-in, help, plans, nevora (FAQ), account deletion (no 3-day deletion), billing return, es-entrar and es-planes show the new words. None scrolls sideways, and the header trial link stays in the draft and opens the trial request.
  - On a draft every page is `noindex`, so the per-page `noindex` is checked by the test above, not on the preview.

## For Jose (not built)

- The warm-light visual direction, founder and team photos, and the company story need real material.
- Approved customer quotes and results for Tool Box and Yavi.
- **Home headline:** "Brighter work ahead." / "Más luz para tu trabajo." is kept. The inspection suggests a direct line, such as "Your team's week, in one place." That is a brand call.
- **Prices:** $19/$29 are still shown. Codex calls them sandbox prices, not approved commercial prices.
- **Recovery wording:** the NEVORA support policy says "Forgot access", and the app's login link says "Forgot password?". The website follows the login link. The policy text comes from the app, so Codex or the app should align it.
- **Policy translations:** the policy pages (privacy, terms, support, deletion) exist in English only. A reviewed Spanish translation is a separate task.
- **Old trial page:** `nevora-start` / `es-prueba` still exist and still work, but no button links to them now. Decide whether to keep them for the future signup or remove them.
