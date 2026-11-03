# Source publication status — 2026-11-03

The original website AI backend is available in the private `JoseK0514/VELANI-SHOPIFY-WEBSITE` repository on branch `codex/velani-website-ai-backend`, directory `services/velani-ai`. Start at `START-HERE-CLAUDE.md` in that directory. An independently usable ZIP is under `deliverables/2026-11-03/velani-ai-source.zip`, alongside its SHA256 checksum.

This is source publication and Vercel preparation. It is not a live backend deployment or a change to the Shopify theme. NEVORA's workforce application and its AI-owner branch remain separate.

## Verified in this publication

- TypeScript typecheck and production build passed.
- Full local test run: 82 passed; 31 database-dependent tests skipped because no isolated test database was configured for this publication. Prior database/model validation remains documented separately.
- The three new adapter tests exercise real Node HTTP request streams, delayed responses, concurrent warm initialization, malformed/oversized bodies, safe startup failures and platform IP validation.
- Current official Vercel configuration schema validation passed.
- The source and ZIP contain required API files, all three migrations, package manifests, Dockerfile, API docs and the integration client.
- Real environment files, dependency/build directories and known local credential values were excluded. `.env.example` is included for the configuration contract.

## Account and credential status

The existing runtime database URL names restricted role `velani_ai_app`; an AI gateway credential and a session secret are configured in the private Codex environment. Those values are not in Git. Avoid recreating or rotating resources solely because source was previously unavailable.

Turnstile keys are not configured yet. Cloudflare account connection is required to create the widget and put its values directly into the correct hosting environment.

The Vercel account visible to this Codex session lists other projects but not NEVORA. Choose the owner's intended Vercel team before provisioning or transferring credentials. `docs/VERCEL.md` supplies the exact import settings. Live Vercel routing, real Turnstile challenges, and production readiness remain to be validated in that environment.
