# Velani / NEVORA AI backend

**Current backend follow-through (2026-11-05):** [Retention schedule, knowledge refresh, client sync and verification](docs/RETENTION-REFRESH-2026-11-05.md). This supersedes the historical setup status below and the November 3 handoffs. Claude owns the Shopify UI.

**For Claude:** [GitHub source and checkout instructions](docs/START-HERE-CLAUDE.md) · [Vercel setup](docs/VERCEL.md). This is an independent service; use `services/velani-ai` as the deployment root in the website repository.

**Current release: 0.2.2 — sculptural Velani entrance.** A 3.35-second titanium V and oversized wordmark reveal now opens the personalized guide. See [animation, recordings and Shopify installation](docs/ENTRANCE-ANIMATION.md). Run `npm run dev` and open `http://localhost:3001` for the bilingual experience. See [guide release details](docs/RELEASE-0.2.md), [AI validation](docs/VALIDATION-0.2.md), [model comparison](docs/model-comparison.md), and [the roadmap](docs/AI-EXPERIENCE-ROADMAP.md). The older integration harness remains available as a smaller API example.

A working development implementation for thoughtful product advice and explicit lead capture. It uses a configurable frontier model through an OpenAI-compatible API, a separate Neon Postgres database, reviewed English/Spanish knowledge, bounded conversation memory, and an embeddable browser client.

Start with [the Claude handoff](docs/CLAUDE-HANDOFF.md). See [architecture](docs/architecture.md), [API](docs/api.md), [integration](integration/README.md), and [evaluation evidence](docs/evaluation.md).

## What is implemented

- Model-backed reasoning about visitors' business needs, with reviewed sources and clear uncertainty.
- Last 40 conversation messages, capped at 32,000 characters; sessions expire after 24 hours by default.
- Sixteen reviewed bilingual knowledge articles; expiring sources and a safe response when knowledge is unavailable.
- Explicit-consent enquiries stored in Neon; no automatic emails, subscriptions or bookings.
- Hashed bearer sessions, strict origins, production CAPTCHA, persistent quotas, idempotent retries and fenced request leases.
- Separate restricted runtime and database-administration credentials.
- A headless JavaScript client and accessible manual test page.
- Database migrations, seeding, private enquiry export, retention jobs, live evaluation and a container build.

The existing Vercel backend and protected Shopify preview have passed hosted chat checks, including English follow-up context, Spanish, source links and deletion. See the current follow-through document for the conversation-cleanup deployment evidence. This does not publish the Shopify theme or establish that every model request will succeed.

## Existing isolated development resources

Neon project `wild-leaf-57992989` / `velani-website-ai-development`, branch `br-snowy-brook-bcc6b3zm`, database `velani_ai`. PostgreSQL 17 plus pgvector. Runtime role: `velani_ai_app`. This project is separate from the owner's NEVORA employee databases.

Release 0.2 is configured with `gpt-6-astra` for chat and plans after the bounded comparison and live plan validation. The original `gpt-6-1-sol` baseline also passed; the small sample supports only a slight practical preference, not a universal intelligence ranking. Local credentials are in excluded `.env` files and are not part of this source handoff. Do not publish or commit them.

## Local setup for a new environment

Requires Node 24, npm and a PostgreSQL 17 database with pgvector available.

```sh
npm ci
cp .env.example .env
# Fill in server-side database and AI credentials, origins and random session secret.
npm run migrate
npm run seed
npm run provision:role
# Copy the new DATABASE_URL from .env.runtime into .env.
# Keep DATABASE_URL_UNPOOLED owner credentials only for administration jobs.
npm run dev
```

`provision:role` is a one-time setup. It refuses to rotate an existing role. Its `.env.runtime` file contains a secret and must be stored securely. Do not run these setup commands against an unrelated or workforce database.

Use a pooled Neon URL for the service and a direct owner URL for administration. `sslmode=verify-full` validates TCP certificates. Environments that cannot reach PostgreSQL TCP can set `NEON_WEBSOCKET=true`; it uses Neon's secure WebSocket transport with full transactions. Only environments requiring an HTTP proxy should additionally set `NEON_USE_PROXY=true` and `HTTPS_PROXY`. Node 24 HTTP model requests can use `NODE_OPTIONS=--use-env-proxy` in that environment. These flags are not required on ordinary hosting.

For the browser harness, serve only the integration directory in another terminal:

```sh
python3 -m http.server 8080 --bind 127.0.0.1 --directory integration
```

Open `http://localhost:8080/example.html`; its origin must be allowed. Never serve the repository root, which contains private environment files. The harness stores the session bearer only in memory. It is a developer example; integrate the headless client with the approved Velani design for the public site.

## Validation

```sh
npm run typecheck
npm run build
docker run -d --name velani-ai-test -e POSTGRES_PASSWORD=velani_local_test_only -e POSTGRES_DB=velani_ai_test -p 127.0.0.1:55432:5432 pgvector/pgvector:pg17
TEST_DATABASE_URL=postgresql://postgres:velani_local_test_only@127.0.0.1:55432/velani_ai_test npm test
npm run eval
```

Database tests create and remove isolated schemas using `TEST_DATABASE_URL` only. They do not fall back to your application database. Without this variable they explicitly skip database cases; that is not a full integration pass.

`npm run eval` makes paid calls to the configured model and saves synthetic test transcripts under excluded `artifacts/`. It checks response contracts and requested actions; read the actual responses for factual accuracy, usefulness and language quality. A passing parser is not a quality score.

To exercise the real API, database and model in an isolated development environment:

```sh
npx tsx --env-file=.env scripts/smoke.ts --run
```

This makes two model calls, creates synthetic conversations and an enquiry, checks retries/deletion/runtime permissions, and removes its own synthetic records. It refuses `NODE_ENV=production`. Run only against the dedicated development project.

## Administration

Update `knowledge/nevora.json` after reviewing first-party product facts, then `npm run seed`. The initial review date is 2026-11-02 and expiry is end of 2026-12-02 UTC. Update the evidence and review dates together. A maximum of 12 core articles ensures product boundaries travel with retrieval. pgvector is installed for future expansion; this release uses lexical ranking plus core facts, not vector similarity.

```sh
npm run leads -- --out=/private/new-file.json --limit=100
npm run retention
npm run retention -- --apply
```

Lead exports contain personal contact details, are created with mode 600 and refuse existing filenames. No contact data is printed to the terminal. The manual retention command is a dry run by default; `--apply` removes expired sessions, sessions older than 30 days, enquiries older than 90 days, and stale rate limits. It requires the separate administration role.

Vercel schedules **conversation cleanup only** at `/api/cron/retention`, daily at **15:00 UTC / 11:00 Puerto Rico** (Hobby execution may occur within that hour). It requires production `CRON_SECRET` as a Sensitive environment variable, minimum 32 random characters, sent as `Authorization: Bearer …`; previews and unauthenticated requests cannot run it. It uses the existing runtime role's session-delete permission, cascading messages, profiles and plans, while preserving enquiries and rate limits. The current 24-hour session expiry (maximum configurable seven days) means daily deletion is normally much earlier than 30 days. The 30-day age condition is a fallback. Keep the bounded session TTL and scheduled job in place; a daily sweep at a 30-day cutoff alone would allow records to exceed 30 days between sweeps.

Monitor the cron path in Vercel runtime logs: each completed run records `conversation_retention`, `status: ok`, aggregate session count and UTC completion time. Vercel does not automatically retry failures: investigate any non-200 run or missing daily success. Consented enquiries remain on the separate manual 90-day policy; this change does not schedule their deletion. Public privacy wording must also match Neon backup retention.

## Deploy

```sh
docker build -t velani-ai-backend .
# Set production environment and secrets through the host's secret manager.
# Do not pass development .env containing admin credentials to the public service.
```

The container runs as a non-root user. Configure `NODE_ENV=production`, HTTPS-only origins, a real Turnstile secret, the gateway token, a random session hash secret and the restricted `DATABASE_URL`. Set trusted proxy IPs/CIDRs only when your ingress is verified; never trust arbitrary forwarded headers. Use `/health/live` and `/health/ready` probes.

For separate administrative container jobs, supply owner credentials only to those jobs and use compiled commands such as `node dist/scripts/retention.js --apply`, `node dist/scripts/migrate.js` and `node dist/scripts/seed.js`. The scheduled conversation endpoint does not require an owner credential. Disable cron jobs separately when rolling back a deployment: Vercel instant rollback does not replace the active cron configuration.

The default global cap is 500 model requests per rolling 24-hour window. This is not a dollar cap. Set actual provider budgets/alerts and watch latency, errors and unanswered topics. Production rollout requires a real browser check inside Shopify, privacy notice, contact-review ownership and confirmed model pricing. The source is ready for that integration work; it does not silently deploy it.
