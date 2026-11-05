# Latest status — 2026-11-05

Rondo's public backend is live and tested. [Current validation](RONDO-VALIDATION-2026-11-05.md) and [Claude UI handoff](CLAUDE-UI-START-HERE.md) supersede the historical credential/deployment/theme statements below. The compound-request provider limitation remains documented. Approved cleanup removed three synthetic database conversations and the unused original Turnstile widget; the active replacement and 14 knowledge documents remain. Health, readiness and configuration returned HTTP 200 after cleanup. No Shopify UI was changed.

# Source publication status — 2026-11-03

**Current handoff:** [UI implementation](CLAUDE-UI-START-HERE.md) and [verified deployment state](LAUNCH-STATUS-2026-11-03.md). The test evidence below records the original source publication; it is not a successful hosted-chat test.

The original website AI backend is available in the private `JoseK0514/VELANI-SHOPIFY-WEBSITE` repository on branch `codex/velani-website-ai-backend`, directory `services/velani-ai`. Start at `START-HERE-CLAUDE.md` in that directory. An independently usable ZIP is under `deliverables/2026-11-03/velani-ai-source.zip`, alongside its SHA256 checksum.

The initial publication supplied source and Vercel preparation. A Vercel project has since been created and its database/AI/session credentials installed; Turnstile configuration still blocks startup. No Shopify theme was changed in this credential/handoff pass. NEVORA's workforce application and its AI-owner branch remain separate.

## Verified in this publication

- TypeScript typecheck and production build passed.
- Full local test run: 82 passed; 31 database-dependent tests skipped because no isolated test database was configured for this publication. Prior database/model validation remains documented separately.
- The three new adapter tests exercise real Node HTTP request streams, delayed responses, concurrent warm initialization, malformed/oversized bodies, safe startup failures and platform IP validation.
- Current official Vercel configuration schema validation passed.
- The source and ZIP contain required API files, all three migrations, package manifests, Dockerfile, API docs and the integration client.
- Real environment files, dependency/build directories and known local credential values were excluded. `.env.example` is included for the configuration contract.

## Account and credential status

Vercel project `velani-ai` (`prj_E1Vl2AEpTlJlBam4MTKG7oEHB7x2`), team `team_Lzbw410WwXGWHTuUXuamRI1N`, is the existing target. `DATABASE_URL`, `AI_API_KEY`, and `SESSION_HASH_SECRET` are sensitive variables for production and preview. Database/gateway connectivity were independently verified. Preserve the existing resources.

The Cloudflare management token can read account/widgets, but widget creation returned HTTP 403 / error 10000. Grant Account → Turnstile → Edit, create the widget, install its matching site/secret keys, then redeploy the existing backend branch. The API currently returns 503; no successful real browser chat has been recorded.

The compatible unpublished Shopify preview is `192990773562`. The earlier preview `192986808634` is now MAIN. Follow the current UI handoff and re-read the target role before any changes.
