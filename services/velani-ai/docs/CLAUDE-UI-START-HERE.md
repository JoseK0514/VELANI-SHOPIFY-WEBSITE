# Claude: finish the Velani website assistant UI

Updated 2026-11-03. This is the current handoff for the public Velani / NEVORA marketing assistant. It supersedes older deployment-status statements in the historical release notes.

## Exact source and deployment

| Item | Location |
| --- | --- |
| Repository | https://github.com/JoseK0514/VELANI-SHOPIFY-WEBSITE |
| Backend branch | `codex/velani-website-ai-backend` |
| Backend root | `services/velani-ai` |
| Backend PR | https://github.com/JoseK0514/VELANI-SHOPIFY-WEBSITE/pull/1 |
| Existing UI branch | `claude/velani-night-nevora-setup-k9sbcy` |
| UI implementation | `src/night/assist.js`, `src/night/velani-assistant.js`, related assistant styles/markup |
| API base | https://velani-ai.vercel.app |
| Vercel project | `velani-ai`, ID `prj_E1Vl2AEpTlJlBam4MTKG7oEHB7x2` |
| Vercel team | `team_Lzbw410WwXGWHTuUXuamRI1N` / `josekarlo-5933s-projects` |
| Unpublished UI preview | https://www.thevelani.com/?preview_theme_id=192990773562 |
| Former preview, now MAIN | `192986808634` — do not change under the current repository rules |

The full backend source already exists. Do not recover its contract from database tables, rebuild it in the NEVORA workforce application, or provision a replacement database. The default website branch may not contain the service; fetch the exact backend branch.

Read the source in a separate worktree if you are already working on the UI branch:

```sh
git fetch origin codex/velani-website-ai-backend:refs/remotes/origin/codex/velani-website-ai-backend
git worktree add --detach ../velani-ai-reference origin/codex/velani-website-ai-backend
```

The service includes `src/`, `api/index.ts`, `migrations/`, `knowledge/`, `integration/`, `public/`, tests, `package.json`, lockfile, `Dockerfile`, `vercel.json`, and complete docs. No runtime secrets belong in the source archive.

## Current readiness — do not skip

**The source and UI integration contract are ready. The deployed API is not yet healthy.**

Configured and metadata-verified in Vercel for production and preview:

- `DATABASE_URL`: sensitive; existing restricted `velani_ai_app` role.
- `AI_API_KEY`: sensitive; existing Neon AI gateway credential.
- `SESSION_HASH_SECRET`: sensitive; preserved, not replaced.
- Existing model configuration: `gpt-6-astra` for chat and plans.
- `NODE_ENV=production`, `REQUIRE_CAPTCHA=true`, and the website's exact HTTPS origins.

Database connectivity and gateway authentication/model availability were independently verified. These are not proof of a successful hosted chat.

**Only the Turnstile credential setup remains blocked in this configuration pass:** the owner-supplied Cloudflare management token can read the account/widgets, but creating the widget returned HTTP 403, error 10000. The account currently has no widget from this setup. Grant that token **Account → Turnstile → Edit**, or create the widget in the owner's dashboard. Do not put the management token in browser code or Vercel runtime variables.

Create a Managed widget for:
- `www.thevelani.com`
- `thevelani.com`
- `x19hvn-ar.myshopify.com`
- Optionally `velani-ai.vercel.app` if testing the standalone guide there; also add that exact origin to `ALLOWED_ORIGINS`.

Install its `TURNSTILE_SITE_KEY` (public) and `TURNSTILE_SECRET_KEY` (sensitive) in Vercel production and preview. Preserve the existing credentials. Redeploy the backend branch to the existing project. Existing known ready build: `dpl_BtssgR3pAtgB6MXkoKrWCrCJjHBq`; it can be redeployed with the completed environment. Do not deploy main accidentally.

Keep Vercel Root Directory `services/velani-ai`, Node 24, build `npm run build`, install **`npm ci --include=dev`**, and output `public`. The install flag is required because `NODE_ENV=production` otherwise omits the TypeScript build dependency. Preserve the supplied API adapter and rewrites.

Last observed: `/health/live`, `/health/ready`, and `/v1/config` all returned 503. No successful production chat or real Turnstile browser check is claimed.

## What to implement in the UI

Reuse the existing assistant and its headless client. The inspected client already matches the server's session, chat, CAPTCHA, and delete contracts. Keep the approved navy/white Velani styling and responsive panel.

1. Keep the existing launcher and accessible panel. Opening, closing, focus restoration, Escape, mobile sizing, and readable loading/error states must work.
2. Load public configuration from `GET /v1/config`.
3. Load Cloudflare's official Turnstile client and obtain a fresh token with action **`velani-session`** for session creation.
4. Use the headless client in `integration/velani-assistant.js` (or the equivalent already integrated in `src/night/velani-assistant.js`). Keep the bearer in memory, never localStorage or analytics.
5. Render answers as plain text. Render citations as validated HTTPS Velani links. Show the assistant as AI; do not imply a human operator.
6. Support English and Spanish via session locale. Start a new session when changing locale if the current UI already has a session.
7. Keep manual retry, session-expired, CAPTCHA-failed, service-unavailable, and quota states understandable. Do not endlessly auto-retry.
8. Preserve the clear/delete conversation confirmation. A local panel close is not server deletion.
9. Keep product/demo/contact actions aligned with existing verified site routes. No invented pricing, integration promises, meetings, or email delivery.
10. After API health passes, set only `current.assistant_api_url` to `https://velani-ai.vercel.app` on a freshly verified **UNPUBLISHED** theme. Detailed read/update instructions are in [SHOPIFY-ACTIVATION.md](SHOPIFY-ACTIVATION.md).

A configuration failure should not produce a broken interactive panel. Use the existing intentional unavailable/fallback behavior. Do not claim a working assistant until a real answer succeeds.

## Wire contract

The browser sets `Content-Type: application/json`; the browser supplies Origin itself. Every protected call uses `Authorization: Bearer <sessionToken>`. No AI or database key is sent to the browser.

| Request | Body / result |
| --- | --- |
| `GET /v1/config` | `{ requireCaptcha: true, turnstileSiteKey: "public-site-key" }` |
| `POST /v1/sessions` | Body: `{ locale: "en"\|"es", captchaToken: "<fresh token>" }`; 201 result: `{ sessionToken, sessionId, expiresAt }` |
| `POST /v1/chat` | Body: `{ requestId: "<UUID>", message: "<up to 4000 characters>" }`; 200 result: `{ message, sources, action, confidence, model }` |
| `DELETE /v1/session` | Authenticated; 204 on success. Clear local conversation after success. |
| `POST /v1/leads` | Optional separate consented form; see below and [api.md](api.md). |

Each source is `{ id, title, url }`. `action` is one of `none`, `show_demo`, `lead_form`, `human_help`; these are suggestions for the UI, not operations the model has performed. `confidence` is a response category, not a percentage.

Generate a new UUID for a new message. Retry a failed message with **the identical UUID and payload**. The headless client's `retryLastRequest()` preserves this. Do not create a new request ID merely because a network response was interrupted.

Error envelope: `{ error: { code, message }, requestId }`. Handle 401 by offering a new session, 403 by obtaining valid verification/configuration, 409 as pending/conflict, 429 using `Retry-After`, and 503 with intentional retry/contact fallback. Never turn off production CAPTCHA to make the UI pass.

The service returns a complete validated answer, not an SSE token stream. A thinking indicator is appropriate; fake streaming and a second browser-side model integration are unnecessary.

## Optional enquiry form

The current widget's quote/contact action can keep navigating to the existing contact page. If adding native lead capture, require a separately submitted form and an unchecked consent checkbox. Merely mentioning an email in chat must not save a lead.

```json
{
  "requestId": "<UUID>",
  "name": "Example Person",
  "email": "person@example.com",
  "company": "Example Company",
  "teamSize": "35",
  "locations": "2",
  "message": "Please discuss our workflow.",
  "consent": true,
  "consentVersion": "lead-v1"
}
```

Name, email, consent, and consentVersion are required. The other business fields are optional. On `{ id, saved: true }`, say **“Your enquiry was saved.”** Do not say an email was sent or a meeting booked. Link the assistant privacy information. Confirm operational retention scheduling before publishing exact retention promises; code includes retention jobs, but this pass did not configure their schedule.

## Acceptance and delivery

Before activation:
- `GET /health/live` → 200 `{ status: "ok" }`.
- `GET /health/ready` → 200 `{ status: "ready" }`.
- `GET /v1/config` → 200 with real public site key and `requireCaptcha: true`.
- Missing/invalid CAPTCHA is rejected; allowed website CORS works.
- Re-read theme ID, role and settings; the previous preview has become MAIN.

On the hosted unpublished preview:
- Ask an English product question, then a follow-up that depends on the first message.
- Start a Spanish conversation and check language and source links.
- Complete **real** Turnstile verification, receive a real backend answer, and delete the synthetic test session.
- Test keyboard and mobile use, sources/actions, and an unavailable/retry state.
- Keep preview enquiry delivery disabled and do not submit a real customer enquiry.
- Record results without bearer tokens, CAPTCHA tokens, or secrets.

`scripts/checks/assistant.mjs` on the UI branch covers mocked interaction flows; it does not prove Cloudflare or production AI works. If browser automation cannot complete Turnstile, record that limitation and perform a human browser check.

Deliver the UI commit/diff, exact preview URL/theme ID, backend health statuses, and honest browser results. Do not publish or modify the live theme under the current repository instructions.

## Supporting files

- [Launch status](LAUNCH-STATUS-2026-11-03.md)
- [Exact Shopify activation operations](SHOPIFY-ACTIVATION.md)
- [HTTP API](api.md)
- [Headless browser client](../integration/velani-assistant.js)
- [Client integration notes](../integration/README.md)
- [Vercel deployment](VERCEL.md)
- [Architecture](architecture.md)
- [Release 0.2 / advanced profile and plan endpoints](RELEASE-0.2.md)

Advanced profile/plan features already exist in the service; they are not required to enable this chat panel. Keep this task focused on the existing marketing assistant UI.
