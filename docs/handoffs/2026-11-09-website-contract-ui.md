# Velani + NEVORA UI on the Nov 9 website/backend contract

Date: 2026-11-09. UI: Claude. Backend and contracts: Codex. Source: NEVORA
`docs/handoffs/2026-11-09-claude-website-backend-contract.md` (Codex candidate `341066bd3`, evidence `759109159`).
Nothing was published, deployed, merged to main, or changed in DNS, global Shopify settings or backend contracts. No email was
sent and nothing was charged. `commerce_api_url` stays empty on every theme.

## Where it is

| | |
|---|---|
| Velani branch | `claude/velani-home-mock-20261107`, commit `3a60062` (pushed) |
| Velani preview | theme **193268777274** "Velani website contract Nov 9 (preview)", UNPUBLISHED, a copy of the live theme 193244496186 plus 27 changed files |
| Preview URL | `https://www.thevelani.com/?preview_theme_id=193268777274` (then open /pages/sign-in, /pages/plans, /pages/nevora-billing …) |
| NEVORA UI | local detached worktree `.claude/worktrees/website-contract`, commit `25b2b99e` on Codex's `341066bd3` (not pushed) |

## What changed

**Velani (thevelani.com theme)**

1. **NEVORA entry:** the parked `https://nevora.team` "Open NEVORA" link is gone. No preview or alpha address replaces it.
2. **Sign-in (EN/ES):** each workplace has its own NEVORA address. People sign in there with their Employee ID and password.
   - Forgot password? is on the workplace's own sign-in page and needs the Employee ID plus the email the workplace has on file.
   - The 4-digit PIN is only for the shared tablet, and the Owner can set a new one.
   - A lost address or ID goes to the invitation email or the employer.
   - There is no workplace finder.
3. **Billing:**
   - Without a handoff, Plan and billing gives billing support (mailto support@thevelani.com, two business days). It never offers the new-trial request.
   - Billing opens only through the Owner's NEVORA handoff (`#handoff=`).
   - The email sign-in form is removed. Old `#token=` links are scrubbed and ignored.
   - Return pages without billing say the same.
4. **Legacy endpoints removed from the UI:** `/v1/signup`, `/v1/login-link`, `/v1/verify` and `/v1/setup`.
   - nevora-start / es-prueba ask for a trial: online signup isn't open yet.
   - nevora-verify / es-configurar scrub old links and say setup now happens in NEVORA.
5. **Language and dates:**
   - Plans' Owner view (always `/pages/plans#handoff=…`, no query) has an English / Español choice.
   - Checkout and Portal send `{lang}`.
   - A lost-response retry repeats the same Idempotency-Key and body. A new language is a new operation.
   - Dates use `status.timeZone`. When it is null they show in UTC and the page says so.
6. **30+ employees (EN/ES, calculator, contact form, FAQ, NEVORA page, Plans, llms.txt):** "write to us for assisted setup; we reply within two business days".
   - Teams that qualify get the same 30-day free trial from the day the workplace is set up.
   - No quote language, no instant signup.
7. **Trial end:** no 3-day deletion and no retention or export promise.
   - The site says NEVORA pauses on day 30, and that the record-retention and export details will be published before NEVORA opens to new businesses.
   - This applies to the FAQ, the contact fine print, Plans terms, the NEVORA privacy "Free trial workplaces" paragraph, website terms and llms.txt.
8. **Capability boundaries:** llms.txt no longer says "available now / on the web today", and it adds the sign-in rule. Availability text says NEVORA is offered through a free trial that Velani sets up.

**NEVORA app (worktree `25b2b99e`)**

- **Tablet recovery moved** to `/clocker/access/paused`.
  - Try again accepts only `^/clocker/[a-z0-9]+(?:-[a-z0-9]+)*$` with a 1–64 character key, including `2`, `110` and `paused`.
  - It is a plain full-page link.
- **New `/onboarding/verify`:**
  - Reads `?lang=en|es`.
  - Scrubs `#proof=` before anything else, keeping only `?lang=`.
  - POSTs `{schemaVersion:1, operationId, proof}` to `/api/onboarding/verification`, same-origin, no-store, no redirect.
  - A 202 or lost answer is retried with the same operation and proof.
  - States: verified, invalid, unavailable, limited, uncertain.
  - No language switch (it would reload after the scrub).
- **In-app billing words:** 30+ is assisted setup; a paused workplace makes no retention promise; the team page no longer says "your records are safe".
- **Dependency:** `src/lib/commerce/status.ts` is carried verbatim from Codex `04fe4616` so the recovery UI compiles. Codex owns it.

## Checks run

- **Velani `npm test`:** 45/45.
- **Local fixture flows (`scripts/commerce-fixture.mjs`, updated to this contract):** Chromium 58/58 and WebKit 56/58 at 1440 and 390.
  - The two WebKit misses are Tab-to-button: Safari doesn't Tab to buttons by default.
  - Coverage: handoff scrub; EN→ES choice with focus kept; `{lang:"es"}` on Checkout; Spanish return to `/pages/es-pago`.
  - Coverage: a doubly dropped Checkout response retried with the same key and body.
  - Coverage: null `timeZone` shown as UTC; sign-out; old `#token=` scrubbed with no API calls; expired handoff in Spanish; the retired verify pages; start without a form.
  - Coverage: sign-in EN/ES with no nevora.team and no sideways scroll; the 31+ card in EN/ES; the over-30 Owner.
- **axe:** 0 violations over 12 pages/states × 2 widths.
- **Sign-in copy:** the copy column clears the phone screenshot by 48px at 1280 and 1440.
- **NEVORA:** the focused vitest suites pass (72 tests: verify screen, tablet path, billing view and page, clocker recovery). `tsc --noEmit` is clean, and eslint is clean on the changed files.
- **Not run:**
  - a NEVORA browser render of `/onboarding/verify` and `/clocker/access/paused` (needs an onboarding-enabled build);
  - the hosted API, Stripe or email (all disabled);
  - a real screen reader.

## Needed from Codex

1. **Assemble** NEVORA `25b2b99e` with `341066bd3` and the `04fe4616` recovery work: the status route, `status.ts`, the shell-free billing/export layout and `/app/my-pay`.
2. **Build the screens after verification.** Workspace creation, bootstrap and Owner activation have UI contracts but no screens yet. The verify screen ends at "Email confirmed" and points to support.
3. **Allow the website origin.** Add an approved staging ingress/origin profile that admits `https://www.thevelani.com` (exact origin, no wildcard). Then give Claude a source-matched, enabled `commerce_api_url`. Until then it stays empty.
4. **Approve a signup origin**, so Start free trial can link to `/onboarding` instead of the trial request.
5. **Sync the app policy source** (`src/lib/legal/policies.ts`) to the same trial-end wording; the website mirror changed.
6. **Update the Rondo website-chat knowledge** in velani-ai to the same rules: sign-in by Employee ID, 30+ assisted setup, no deletion timer.
