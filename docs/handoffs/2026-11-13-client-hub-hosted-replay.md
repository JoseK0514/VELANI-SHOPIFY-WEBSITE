# Client hub hosted lost-response receipt — November 13, 2026

The missing hosted HTTP/persistence/provider receipt is complete. Jose explicitly
authorized one synthetic request and one same-key retry, with at most two real
emails to the business support address. The two-email allowance is consumed.
Codex owns backend/hosting; Claude owns UI. Development remains the operating and
acceptance line. This check does not publish a theme or activate production admin.

## Exact target and execution

- Unpublished Shopify acceptance theme193374224698, ordinary Safari Support page.
- Existing public hub endpoint at `https://velani-ai.vercel.app`; provider source
  remains3db0ea98bc3da6b3ae08b9e5d2c2b59a361e6a8d. This tests the existing hub,
  not the prepared Rondo production-target change.
- Jose completed the ordinary Safari security challenge successfully. The earlier
  instrumented Chrome attempt failed before any hub POST or email.
- A page-local diagnostic fetch wrapper matched only the approved synthetic hub
  request, retained the first actual201 receipt, then threw a network error to
  simulate its loss. It allowed at most two matching POSTs. No application,
  Turnstile validation or provider security setting was changed.
- The rendered form showed the unknown-result message, retained its input and
  offered Try again. The same-origin browser-console HTTP retry used the captured
  key and unchanged logical fields, with an explicitly expired diagnostic token.
  An already-persisted same-key replay returns its saved result before validating
  a new CAPTCHA; new requests still require normal verification.

| Observation | First request | Same-key replay |
| --- | --- | --- |
| Received at UTC | 2026-11-13T17:48:44.938Z | 2026-11-13T17:57:46.827Z |
| Actual HTTP status | 201 | 200 |
| Reference | VEL-2611-0003 | VEL-2611-0003 |
| Confirmation state | submitted | submitted |

Both POSTs used the same key. Its SHA256 is
`549fb2075ce84c0263e7d698a5b8a6cdc216fc70775ff59d3d29fad6dbc9ee28`.
The raw key/body and browser challenge material are excluded from this repository.
The raw synthetic key is retained only in the private local receipt.

## Independent persistence and delivery readback

Neon `wild-leaf-57992989`, branch `br-snowy-brook-bcc6b3zm`, database `velani_ai`
contains exactly one matching synthetic request after the approved start time:
`0c4a43be-4681-46d4-997b-6b89e98987b8`, created17:48:44.712Z.
It has exactly two outbox jobs, each submitted, attempts1 and
submission_uncertain=false, with unchanged provider IDs after replay:

| Kind | Outbox ID | Resend ID | Resend readback |
| --- | --- | --- | --- |
| confirmation | 8eca68d2-f372-45d6-8e41-dcce37e63229 | 01a1d606-afb4-7516-b37f-671c1d9de627 | delivered |
| support | 8b3dfb5c-5f48-4113-8eba-6cb2c6d4dbb2 | 01a1d606-af7f-760e-a4ab-e3e40f03dd7c | delivered |

Resend's individual-message readbacks establish delivery; its aggregate metrics
returned zero in a window ending18:00Z and are not used as the delivery proof.
The Gmail connection required reauthentication. Therefore this receipt claims
provider delivery, not mailbox placement or a human opening these new messages.
The earlier bilingual inbox acceptance remains a separate retained receipt.

## Restoration and evidence limits

The acceptance theme remained UNPUBLISHED. Its original settings bytes were
restored exactly: checksumMD5 `10459f6658e1aa75baa00a7dec45052a`,
`client_hub_preview_submissions=false`. The main theme193311572282 was untouched.
After closing the inspector and reloading only the test tab, Safari visibly
showed empty fields and “Preview. This form checks your draft and sends nothing.”
The reload removed the page-local wrapper; no further request was sent.

The second request was an actual same-origin HTTP retry from the browser console.
It was not a click of the rendered Try again button, and successful recovery of
that panel is not asserted. This receipt closes the missing hosted replay and
exactly-once side-effect evidence without extending the UI acceptance claim.
No synthetic record was deleted from production; normal retention applies.

Final theme selection, combined current-source review and publication remain
Jose's release action. In particular, the newer legal preview193401127226 is a
separate unpublished artifact with different disabled settings; do not publish
an older acceptance theme simply because this bounded transport check passed.

Local raw and filtered receipts are under
`/Users/josek0514/.codex/visualizations/2026/11/13/01a1d5d4-5741-7e93-ab62-b7705c0e403b/release-completion/hosted-replay-safari/`.
