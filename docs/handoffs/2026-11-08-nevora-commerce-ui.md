# NEVORA signup, trial and billing UI on thevelani.com

Date: 2026-11-08. Built by Claude on the Velani branch `claude/velani-home-mock-20261107`. Uploaded only to the unpublished preview theme **193180827962** (role UNPUBLISHED, checked before every write). Nothing was published, no page was unhidden, no store setting changed, no email was sent and nothing was charged.

Backend contract: NEVORA `docs/handoffs/2026-11-07-commerce-backend.md` and `2026-11-08-commerce-ui-gap-fixes.md` (Codex, detached worktree at `04fe4616`).

## Pages

| Route | What it does |
|---|---|
| `/pages/plans`, `/pages/es-planes` | Shows the prices: $19 a month for 1 to 15 employees, $29 for 16 to 30, and a quote above 30. A team-size card has 30 marks in the two bands, the price, and − / + with a slider; without the script it reads 8 employees at $19. Buttons: Start free trial and Manage billing. An Owner arriving with `#handoff=` sees their business, plan, dates and one action (Subscribe, Manage billing or Ask for a quote), and the card is set to their real employee count. |
| `/pages/nevora-start`, `/pages/es-prueba` | Email-only signup in the first screen (`POST /v1/signup`), then "Check your email" with Send it again (30 s wait) and Use a different email. |
| `/pages/nevora-verify` | Reads and scrubs `#token=`, then calls `/v1/verify`. Then, by status: <br>• **required:** the setup form (business name, location, time zone, employees; first and last name, mobile phone, password) via `POST /v1/setup`. <br>• **pending or provisioning:** progress, polled every 3 s, then 6 s, then 15 s, paused while the tab is hidden or offline. <br>• **ready:** Open NEVORA, the NEVORA address and Owner ID `OWNER` with Copy. |
| `/pages/nevora-billing`, `/pages/es-facturacion` | Asks for the owner's email (`POST /v1/login-link`); the reply never reveals whether an account exists. With `#token=` or `#handoff=`, shows the business, plan rows (plan, trial end, paid through or pay-by, employees), one action, Back to NEVORA and Sign out (`/v1/logout`). |
| `/pages/nevora-billing-return` | Exchanges the Stripe-return `#handoff=` and polls `/v1/status`. The return is never treated as proof of payment. Outcomes: <br>• "You're subscribed" once the status shows a plan; <br>• "Billing updated" after a cancellation; <br>• "Your payment didn't go through" on a failed payment; <br>• after two minutes with no plan, "We haven't seen a payment yet" (nothing is charged if the owner left checkout). |

The Start free trial buttons on every page (header, Home, NEVORA, closing panels) now open `nevora-start` (`es-prueba` in Spanish). Support, Contact and `llms.txt` state the real prices.

## How it is wired

- `src/night/commerce.js`, built to `assets/velani-commerce.js`, is loaded only on these pages.
  - **API address:** comes from the theme setting **NEVORA billing → NEVORA commerce API address** (`commerce_api_url`). Locally it comes from `VELANI_COMMERCE_API`.
  - **No address set:** every page keeps an honest fallback, a trial request on the contact form, and never guesses an endpoint.
  - **Bearer token:** kept in module memory only, never in storage, the URL, logs or analytics. Fragments are scrubbed before anything else runs.
  - **Checkout and portal:** each request carries an `Idempotency-Key` that is reused for uncertain retries and replaced only on `checkout_expired`. `use_billing_portal` and `subscription_required` switch to the right action; `assisted_quote_required` points to a quote.
  - **Navigation:** only https URLs (or local http in fixture mode) are navigated to.
- `scripts/commerce-fixture.mjs` is a **local-only fake API** on 127.0.0.1:4198: fictional businesses, no email, no charges. Scenarios come from the token, e.g. `#handoff=fixture-trial-000000000001`: `trial`, `paid`, `canceled`, `grace`, `trial-ended`, `payment-failed`, `ended`, `payment-required`, `over-limit`, `over-30`, `team`, `setup`, `waiting`, `expired`, `down`, `slow`, `lost`. Run it alongside `VELANI_COMMERCE_API=http://127.0.0.1:4198 node scripts/serve.mjs --port 4199 --host 127.0.0.1`.

## Checks run

- `npm test`: 45/45.
- **Local fixture walk-throughs**, Chrome and Safari at 1440 and 390:
  - Plans handoff states, including a lost checkout response retried with the same key;
  - signup errors and sent state;
  - setup from link to ready, with all link problems;
  - billing request, sign-in, Subscribe to fake checkout and back, failed, canceled, over 30, sign out, and Spanish.
- **Hosted preview** (billing not configured), Chrome and Safari at 1440, 1024 or 834, 390 and 320, English and Spanish:
  - layout: titles within 2 lines, no sideways scroll, no page errors, no axe violations in Chrome;
  - the fallback shows on every page;
  - a handoff arriving on Plans is scrubbed and says billing isn't available.
- Not run: a real API, real Stripe Checkout or Portal, real email delivery, or a screen reader.

## Before launch (Jose / Codex)

1. Set `commerce_api_url` on the theme to the real API origin, and make sure the API allows `https://www.thevelani.com` (CORS).
2. Unhide or create the Shopify pages: nevora-start, nevora-verify, nevora-billing, nevora-billing-return, es-prueba, es-facturacion.
3. Legal: Website terms and Software and project terms still say the site sells nothing and takes no payment, and the retention line says closed workplaces are deleted within 3 days. These need Jose's decision before subscriptions go live.
4. Codex: the email links always open English pages. A `lang` on signup and login-link (to link `es-` pages) would let Spanish visitors finish in Spanish. The status also has no time zone, so dates show in the visitor's own time zone.
