# HTTP API

All request and response bodies are JSON except `DELETE` success (204) and plan downloads. `/v1` mutation calls require `Origin: https://www.thevelani.com` or another exact configured origin. Protected GET reads require the bearer token and may omit Origin for same-origin browsers; supplied disallowed origins are rejected. Responses use `Cache-Control: no-store`. CORS allows Content-Type and Authorization, and exposes Retry-After. See [release 0.2](RELEASE-0.2.md) for profile, plan and download endpoints.

## Session

`POST /v1/sessions`

```json
{"locale":"en","captchaToken":"TOKEN_FROM_TURNSTILE"}
```

Returns 201 `{ "sessionToken": "...", "sessionId": "...", "expiresAt": "..." }`. Keep `sessionToken` in memory; never log it. Subsequent calls use `Authorization: Bearer <sessionToken>`. CAPTCHA is optional only in development. Turnstile's action must be `velani-session`.

## Advice

`POST /v1/chat`

```json
{"requestId":"6c931b64-f8f2-4f24-88be-dc0623bdc320","message":"We have 35 employees across two locations. Can NEVORA help with timesheets?"}
```

Use `crypto.randomUUID()` for each new message. A manual retry reuses the identical request ID and payload.

Returns 200:

```json
{
  "message":"Plain-text answer",
  "sources":[{"id":"nevora-overview-en","title":"NEVORA product workflows","url":"https://www.thevelani.com/pages/nevora"}],
  "action":"none",
  "confidence":"grounded",
  "model":"gpt-6-1-sol"
}
```

Actions are `none`, `show_demo`, `lead_form`, `human_help`. They are UI suggestions, never automatic operations. Show a demo button only when a real demo URL is separately verified/configured. `confidence` indicates the model's response category, not a calibrated numerical probability or proof of accuracy. Render message text as text, not HTML. This version returns a complete validated response rather than streaming unchecked tokens.

Maximum message: 4,000 characters. Latest 40 stored messages are considered within the model context cap. The request cannot override history or model settings.

## Enquiry

`POST /v1/leads`

```json
{
  "requestId":"ba7685b4-cefb-48ee-afd6-101c592e9da9",
  "name":"Example Person",
  "email":"example@example.com",
  "company":"Example Company",
  "teamSize":"35",
  "locations":"2",
  "message":"Please discuss our timesheet workflow.",
  "consent":true,
  "consentVersion":"lead-v1"
}
```

Name, email and explicit consent are required. Company, teamSize, locations and message are optional. A checkbox must be unchecked initially. Suggested consent: “I agree that Velani may use these details to respond to this enquiry. This does not subscribe me to marketing.” Link the published assistant privacy notice alongside it.

Returns 201 `{ "id": "...", "saved": true }`, or 200 for an identical replay. Say “Your enquiry was saved.” Do not claim an email was sent or a meeting was booked.

## Delete chat

`DELETE /v1/session` returns 204 and invalidates the current token. Separate submitted enquiries remain under the enquiry retention policy.

## Errors

```json
{"error":{"code":"rate_limited","message":"Please wait before trying again."},"requestId":"req-7"}
```

| Status | Meaning | Client behavior |
| --- | --- | --- |
| 400 / 413 | Invalid input / body too large | Correct input |
| 401 | Missing/expired session | Start a new session |
| 403 | Origin or CAPTCHA rejected | Correct configuration / new CAPTCHA |
| 409 | Turn in progress / UUID conflict / expired lease | Wait, or fix request ID reuse |
| 429 | Persistent quota exhausted | Respect Retry-After |
| 503 | Provider/database unavailable | Offer intentional retry and contact route |

`GET /health/live` checks process availability. `GET /health/ready` checks database connectivity. Startup validates model credentials are configured; readiness is not a paid live model call and does not certify provider availability or knowledge freshness.
