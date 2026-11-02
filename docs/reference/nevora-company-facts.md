# NEVORA development check and Velani company-source addendum

Checked: 2026-11-02T12:06:22.245Z. Read-only source/hosting/public-page inspection.

## Company facts found

The current development source src/lib/legal/policies.ts at 1e6f35ab9731234fc765aa18ee817cb196459e2e and the public development Privacy/Terms/Support pages agree on:

- Operator: VELANI LLC.
- Public support/privacy contact: support@thevelani.com.
- Public mailing address: VELANI LLC, 1654 Calle Tulipan, Suite 100, San Juan, PR 00927.
- NEVORA is described as a product of VELANI LLC.

Source: https://github.com/JoseK0514/NEVORA/blob/1e6f35ab9731234fc765aa18ee817cb196459e2e/src/lib/legal/policies.ts
Public sources:
- https://nevora-git-development-josekarlo-5933s-projects.vercel.app/privacy
- https://nevora-git-development-josekarlo-5933s-projects.vercel.app/terms
- https://nevora-git-development-josekarlo-5933s-projects.vercel.app/support

These resolve the previously unavailable public operator/contact/address fields as sourced facts for the Velani draft. The legal registration jurisdiction is not established merely by a mailing address. Mailbox deliverability and physical-mail handling were not tested.

The existing policy is for NEVORA workforce processing. Its employment-record retention, account deletion, hosting, advertising, backup and support commitments must not be copied wholesale into the Shopify company site's inquiry policy or custom-client agreements. Website vendors, optional tracking, inquiry retention, recipients and commercial terms still need their own confirmed facts. No new general-company service-level promise is inferred from NEVORA's support page.

## Current development source and CI

GitHub development: 1e6f35ab9731234fc765aa18ee817cb196459e2e, November 1, 2026, 23:18:12 UTC.
Current check conclusions: {"failure":4,"success":12,"cancelled":1}.
The direct failed gates are Communications and D2 corrections. The Phase E aggregate and final evidence gates also fail. Validation was cancelled during the source-bound build and its build receipt was absent.
Communications failed at Chromium 1440px after six successful cells. The D2 report records 281 checks and a deep-equality assertion failure. Root causes are unresolved by this status inspection.

CI: https://github.com/JoseK0514/NEVORA/actions/runs/41361645909

## Known development preview

URL: https://nevora-git-development-josekarlo-5933s-projects.vercel.app
Vercel resolved deployment: dpl_3qRhyjEKpt5qZsYsj6aDULW43EJf.
Reported state: READY.
Reported source SHA: d5ec9685abd9c41a5e593c0ad3d98b48d0f82bf6.
Reported source ref: dev-combined-preview.
Created: 2026-10-31T17:12:17.461Z.
Its source marker differs from the current development HEAD. READY is deployment metadata, not acceptance of signed-in application behavior.

Live reads reached /login, /forgot-access, /activate, /privacy, /terms and /support with HTTP 200 and the expected named content.
The Vercel connector denied scoped deployment listing (403) and returned 404 for the scoped project detail request. The known alias itself resolved successfully. This inspection therefore does not enumerate every available deployment.

## Work and limits

No application/repository code, database, settings, branches, policy records, Shopify theme, real message, payment, workflow or deployment was changed or triggered.
No authenticated app flow, mailbox submission, native device, unit suite or new regression suite was exercised.
The original Velani site-review package, original builder report and archive remain unchanged; this is a separate source addendum. Design approval and actual implementation/acceptance remain pending.
