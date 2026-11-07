# Velani client hub — v1 interface (2026-11-07)

This is the fixed form contract for Claude. The service is Velani's existing `velani-ai` Vercel project, independent of NEVORA workforce data. No account, password, chat session or login is required. Availability/activation evidence is recorded in `2026-11-07-velani-nevora-backend-handoff.md`; this document does not claim it is already activated.

## Submit

`POST https://velani-ai.vercel.app/v1/client-hub/requests`

Headers: `Content-Type: application/json`, `Idempotency-Key: <crypto.randomUUID()>`. Browser Origin must be an exact allowed HTTPS Velani/preview origin. Generate the key once per logical submission; retain it on transport errors or server retries. Use a new key after editing any form value. Never put the key or request description in a URL.

```json
{
  "type": "project_support",
  "name": "Example Client",
  "email": "client@example.com",
  "company": "Example Company",
  "project": "Company website",
  "description": "The contact page stops responding after submitting the form.",
  "urgency": "normal",
  "language": "en",
  "turnstileToken": "fresh-browser-token"
}
```

| Field | Rules |
| --- | --- |
| type | Required: `new_work` or `project_support`. |
| name | Required, trimmed, 1–120 characters; one line, no control characters. |
| email | Required, trimmed, valid email, maximum 254 characters. Stored lowercase. |
| company | Optional, trimmed, maximum 200 characters; one line. Send `""` or omit if blank. |
| project | Required for support; optional for new work. Trimmed, maximum 200 characters; one line. |
| description | Required, trimmed, 20–5000 characters. Plain text; line breaks allowed. No attachments or sensitive employee/payment/password data. |
| urgency | Support only: `normal`, `high`, or `urgent`; defaults to `normal`. Omit for new work. It records priority requested by the client, not an SLA or emergency service. |
| language | Required: `en` or `es`. Controls confirmation-email language. |
| turnstileToken | Required, maximum 2048 characters. Cloudflare action **`velani-client-hub`**. Fresh token after a verification failure. |

Unknown JSON fields are rejected. Maximum JSON body size 32 KiB. No marketing consent or subscription is created. Explain purpose/retention and link the privacy notice next to Submit; no account is created.

`GET https://velani-ai.vercel.app/v1/client-hub/config` returns `{ "enabled": false, "turnstileSiteKey": "…", "turnstileAction": "velani-client-hub" }`. The site key is public. Keep submission disabled while `enabled` is false.

## Success and retry

New submission returns HTTP **201**, an identical replay HTTP **200**:

```json
{ "status": "received", "reference": "VEL-2611-0007", "confirmationEmail": "submitted" }
```

`confirmationEmail` is `submitted` when the email provider accepted the confirmation; `pending` means the request is saved but email delivery has not been confirmed. Provider acceptance is not proof of inbox delivery. Always show the reference and saved success state; do not ask the client to submit again because an email is pending. Suggested EN: “Request received. Your reference is …”; ES: “Solicitud recibida. Tu referencia es …”.

Reference period uses Puerto Rico's calendar month; sequence is atomic and unique within the month. References are not authentication and there is no public lookup endpoint. Retrying the same key with a different normalized payload returns HTTP **409**, `idempotency_conflict`; send a new key after edits. Replays of an already saved request do not require reusing a valid Turnstile token.

## Errors

```json
{
  "error": {
    "code": "validation_failed",
    "fields": { "email": ["invalid"], "project": ["required"] }
  }
}
```

Field errors return **422**, with stable codes `required`, `invalid`, `too_long`, `too_short`, `not_allowed`, or `unknown`; Claude localizes them beside each field. `idempotencyKey` identifies header errors, `_form` identifies non-object/unknown form structure. No submitted values are echoed.

Other codes: **400** `invalid_json`; **403** `origin_not_allowed` or `verification_failed`; **409** `idempotency_conflict`; **413** `request_too_large`; **415** `content_type_required`; **429** `rate_limited` with `Retry-After`; **503** `service_unavailable` with `Retry-After`. For verification failure, reset Turnstile and keep the logical submission key if no values changed. For network/503 retry, keep the same key and field values; a new token may be supplied. Rate limits are server enforced: 30 HTTP attempts per IP per 15 minutes, 5 accepted requests per email per rolling day, and **40 accepted requests globally per rolling day**. Each request creates two emails; this leaves headroom within the verified existing 100-email/day account. IP/email quota keys are purpose-specific HMAC hashes.

## Email, privacy and ownership

Provider: **Resend**, sender **`Velani <requests@thevelani.com>`**. Full request goes to **support@thevelani.com**, Reply-To client email. A separate EN/ES acknowledgement goes to the client, Reply-To support. No open/click tracking. SPF for the Resend Return-Path subdomain `send.thevelani.com` and its DKIM records must verify first; preserve the existing Google Workspace root SPF/MX.

Requests and cascaded email-job records are stored only in the Velani assistant database (`velani_ai`, project `wild-leaf-57992989`), in separate client-hub tables. Target retention: **up to 90 days from submission**; purge eligibility starts at 88 days to give the daily sweep headroom. IP quota hashes are purged within 48 hours of their window ending. The email quota hash is stored on the request and is deleted with that request (up to 90 days); its acceptance count uses only the latest rolling day. Non-personal monthly counters remain to prevent reference reuse. Resend's standard email/log retention is **30 days** ([provider policy](https://resend.com/security/gdpr)). Support/client mailbox copies and database backups have separate retention; the 90-day database cleanup does not delete these copies. No automatic Google mailbox purge has been verified, so Claude must not promise all copies disappear after 90 days. The dated handoff records verification and remaining retention review. No request is written to NEVORA production.

Email jobs are committed atomically with the request. An opaque native Vercel queue wake-up is durably published before acceptance; temporary delivery failures are retried with stable provider keys. A daily maintenance job independently purges expired data and republishes pending work. Provider ambiguity past its safe deduplication window is retained for operator review, never blindly resent. A confirmation marked `pending` always remains a saved success in the UI.
