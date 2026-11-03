# Run the Velani website AI on Vercel

This service belongs in a separate Vercel project from the NEVORA workforce application. The source can live in the shared website repository without changing the Shopify theme or NEVORA's AI-owner branch.

## Import settings

| Setting | Value |
| --- | --- |
| Repository | `JoseK0514/VELANI-SHOPIFY-WEBSITE` |
| Source branch | `codex/velani-website-ai-backend` |
| Root Directory | `services/velani-ai` |
| Framework Preset | **Other** (explicitly configured by `framework: null`) |
| Node.js | **24.x** |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `public` |
| Function | `api/index.ts` |
| Region | `iad1`, near the existing Neon US East database |
| Maximum duration | 120 seconds, with Fluid compute enabled |

The existing plan engine has a 90-second provider timeout; 120 seconds leaves time for database work and response delivery. Confirm the chosen Vercel plan supports this duration. Do not change the framework preset to Fastify: `src/app.ts` is an application factory, while the explicit adapter in `api/index.ts` is the intended Vercel entrypoint.

The committed `vercel.json` forwards `/v1/*` and `/health/*` to that function. Original API paths remain intact. Vercel serves `public/` as static files. The function initializes one shared Fastify instance per warm process and preserves its request validation, response handling, session ownership and idempotency. Because the HTML is served outside Fastify, `vercel.json` applies the matching Content Security Policy to `/` and `/index.html`; API responses retain the dynamic Helmet policy. If a new site will embed the guide, add that exact HTTPS origin to both `ALLOWED_ORIGINS` and the static `frame-ancestors` values in `vercel.json`. Docker and `npm run dev` continue using `src/server.ts`.

## Set environment values in the hosting dashboard

Never paste real values into chat, documentation, Git, or the public frontend. Configure the exact target environments that will run this service. The checked-in `.env.example` lists names only.

Required:

- `NODE_ENV=production`
- `DATABASE_URL`: the restricted runtime role's **pooled** Neon URL for the isolated `velani_ai` database. Do not use database-owner credentials.
- `AI_BASE_URL`: the existing Neon AI gateway's HTTPS base URL.
- `AI_API_KEY`: a scoped credential for that gateway.
- `AI_MODEL=gpt-6-astra`; optionally `AI_PLAN_MODEL=gpt-6-astra`, or another model deliberately selected and evaluated by the owner.
- `SESSION_HASH_SECRET`: a securely generated secret of at least 32 characters, stable across deployments for that environment.
- `REQUIRE_CAPTCHA=true`
- `TURNSTILE_SECRET_KEY` and `TURNSTILE_SITE_KEY`: matching keys for the widget described below.
- `ALLOWED_ORIGINS`: exact comma-separated HTTPS origins, including `https://www.thevelani.com`, `https://thevelani.com`, `https://x19hvn-ar.myshopify.com`, and the stable HTTPS origin where this guide is served if visitors use that page directly. Add any actual preview origin individually; do not use wildcards.
- `TRUST_PROXY=false`
- `NEON_WEBSOCKET=false` and `NEON_USE_PROXY=false` for ordinary Vercel hosting with Neon TCP access. These flags were needed for the restricted Codex environment, not for a normal Vercel deployment.

`VERCEL=1` is supplied by Vercel. Only the Vercel entrypoint, when that platform flag is present, uses Vercel's validated `x-vercel-forwarded-for` header for per-client quotas. Local/Docker requests continue using the configured Fastify trusted-proxy policy. Do not broadly trust arbitrary forwarded headers.

Keep the application request limits configured deliberately. `DAILY_AI_REQUEST_LIMIT`, `SESSION_TTL_HOURS` and `MODEL_TIMEOUT_MS` are documented in `.env.example`. A request count is not a dollar budget; use gateway billing limits/alerts independently.

The database runtime role and gateway credential may already exist from the original setup. Check the correct isolated project before provisioning replacements. Do not rotate a working role simply because the source was previously missing.

## Cloudflare Turnstile

Create a widget in the owner's Cloudflare account for these hostnames (without schemes or paths):

- `www.thevelani.com`
- `thevelani.com`
- `x19hvn-ar.myshopify.com`
- The stable Vercel/custom guide hostname if the guide will be visited directly.

Use a Managed widget. Put its site key and secret directly in the Vercel environment settings. The client uses action **`velani-session`**; the server validates both that action and the token's hostname against the request Origin. A widget that covers only the API hostname will not validate a challenge rendered on Shopify.

Do not disable CAPTCHA to make a preview pass. Production configuration rejects that. Cloudflare access and actual widget configuration are separate from publishing this source.

## Validate before switching the website

1. Import the branch into the intended Vercel team and configure the environment before deploying.
2. Check `/health/live` returns 200 and `/health/ready` can reach the existing database.
3. Confirm `/v1/config` returns the public site key and `requireCaptcha: true`.
4. Test the actual hostnames: challenge completion, session creation, a cited chat answer, a plan and an explicitly consented enquiry. Check disallowed origins and missing/invalid CAPTCHA are rejected.
5. Confirm warm/cold invocations retain server-side conversation state through Neon and that retries do not duplicate completed work.
6. Configure the retention job before relying on the documented retention intervals. Vercel Cron integration is not added by this adapter; it needs an authenticated maintenance endpoint and a restricted maintenance credential. The existing `scripts/retention.ts` remains available to an authorized scheduler.
7. Point the website integration at the verified HTTPS backend origin only after those checks pass.

The client example is `integration/velani-assistant.js`; the full guide is `public/`. This handoff prepares Vercel-compatible source but does not certify a live deployment, provision a widget, or modify Shopify.

## Verification and references

Local tests cover real Node HTTP request streams through the adapter, concurrent warm initialization, delayed responses, malformed/oversized JSON, safe startup errors, and Vercel IP validation. Existing API tests retain authority for authentication, CAPTCHA, origins, consent and idempotency. Typecheck/build and selected tests must pass before source publication. Live Vercel routing/build and real Turnstile challenges still require deployment validation.

- https://vercel.com/docs/functions/runtimes/node-js
- https://vercel.com/docs/functions/configuring-functions/duration
- https://vercel.com/docs/headers/request-headers
- https://vercel.com/docs/routing/rewrites
- https://vercel.com/docs/frameworks/backend/fastify
