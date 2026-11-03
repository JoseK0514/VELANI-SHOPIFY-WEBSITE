# Velani assistant: backend deployment and website widget, 2026-11-03

## What exists now

- **Backend** (`services/velani-ai` on branch `codex/velani-website-ai-backend`, commit 55c17ab): deployed to Vercel project `velani-ai` (team josekarlo-5933s-projects, root directory `services/velani-ai`, Node 24, region iad1, production deployment from that branch). Production URL: `https://velani-ai.vercel.app`. Deployment protection applies to preview deployments only, so the production API is reachable by browsers.
- **Non-secret environment** is configured on the project for production and preview: `NODE_ENV`, `AI_BASE_URL` (Neon gateway, `/v1`), `AI_MODEL` and `AI_PLAN_MODEL` (`gpt-6-astra`), `MODEL_TIMEOUT_MS`, `SESSION_TTL_HOURS`, `DAILY_AI_REQUEST_LIMIT`, `ALLOWED_ORIGINS` (www.thevelani.com, thevelani.com, x19hvn-ar.myshopify.com), `TRUST_PROXY=false`, `REQUIRE_CAPTCHA=true`, `NEON_WEBSOCKET=false`, `NEON_USE_PROXY=false`, `CHAT_RETENTION_DAYS=30`, `LEAD_RETENTION_DAYS=90`, and a generated `SESSION_HASH_SECRET` (sensitive).
- **Widget** (this branch, commit 27bf16b and f1ef648): `src/night/assist.*` built into the theme; on Shopify it renders only when the theme setting **AI assistant › Assistant API address** holds the service origin. The preview theme 192986808634 has the files; the setting is empty, so nothing shows yet.
- **Privacy notice** gained "The AI assistant"; the cookies page mentions the Turnstile check. Both need the owner's approval like the rest of the legal copy.

## What the owner must do (secrets never pass through chat or Git)

In Vercel › velani-ai › Settings › Environment Variables (Production and Preview), add:

1. `DATABASE_URL`: the **pooled** connection string for role `velani_ai_app` on database `velani_ai`, Neon project `velani-website-ai-development` (branch `development`). In the Neon console: Connect › role velani_ai_app › database velani_ai › Connection pooling on. Keep `sslmode=require` (or `verify-full`).
2. `AI_API_KEY`: a Neon AI gateway credential for that branch with the `ai_gateway:invoke` scope (Neon console › AI Gateway › credentials; the existing credential's value is only visible where it was created, so creating a new one is fine).
3. `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`: create a Cloudflare Turnstile widget (Managed) for hostnames `www.thevelani.com`, `thevelani.com` and `x19hvn-ar.myshopify.com`. Mark the secret key as sensitive.

Then redeploy (Vercel › Deployments › Redeploy, or tell Claude). Validation after that: `/health/live` 200, `/health/ready` 200, `/v1/config` returns `requireCaptcha: true` with the site key; a conversation from the preview theme; disallowed origins and missing CAPTCHA rejected; retries do not duplicate answers.

## Switching the widget on

Set the theme setting to `https://velani-ai.vercel.app` on the preview theme (Theme settings › AI assistant), review the chat on the live preview, then publish when satisfied. A custom API hostname such as `ai.thevelani.com` needs a CNAME at the DNS provider and the domain added to the Vercel project; the vercel.app origin works without it.

## Still open

- Retention: `scripts/retention.ts` must run daily for the 30-day statement to hold. Vercel Cron needs an authenticated maintenance endpoint (not in this release); a scheduled GitHub Actions job with a restricted database URL is the simplest option and needs the owner's approval.
- Gateway spend: set billing limits or alerts in the Neon console; `DAILY_AI_REQUEST_LIMIT=500` is a request cap, not a dollar budget.
- Model catalog: `gpt-6-astra` was selected in release 0.2; confirm it is still listed by the gateway.
- Leads: the widget routes "ask for a quote" to the contact page instead of saving leads in the assistant database, so no separate lead-review process is required for now.
