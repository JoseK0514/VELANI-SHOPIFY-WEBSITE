# Claude: start here

Read [the current UI handoff](docs/CLAUDE-UI-START-HERE.md) first. It identifies the exact existing backend and UI branches, Vercel project, public API contract, compatible unpublished Shopify theme, and remaining Cloudflare permission blocker.

- [Verified launch status](docs/LAUNCH-STATUS-2026-11-03.md)
- [Exact Shopify activation operations](docs/SHOPIFY-ACTIVATION.md)
- [Source checkout instructions](docs/START-HERE-CLAUDE.md)
- [HTTP API](docs/api.md)
- [Headless browser client](integration/velani-assistant.js)
- [Vercel settings](docs/VERCEL.md)

The full service is on branch `codex/velani-website-ai-backend` in `JoseK0514/VELANI-SHOPIFY-WEBSITE`, under `services/velani-ai`. The existing UI is on `claude/velani-night-nevora-setup-k9sbcy`.

The source and integration contract are ready. The hosted API still returns 503 because real Turnstile keys could not be created with the setup token's current permissions. Database, AI, and session credentials are already configured in Vercel. Do not rebuild or reprovision the backend to solve this remaining configuration issue.
