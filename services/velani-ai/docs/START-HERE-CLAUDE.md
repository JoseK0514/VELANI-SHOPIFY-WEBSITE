# Start here — Velani / NEVORA website AI source

This is the original source built in the Codex workspace, not an API reconstructed from database tables.

## Source location

The original implementation was local to the Codex workspace. The complete source is now provided in the existing private website repository so the same GitHub connection can reach it:

- Repository: https://github.com/JoseK0514/VELANI-SHOPIFY-WEBSITE
- Branch: `codex/velani-website-ai-backend`
- Service directory: `services/velani-ai`
- [Open the source](https://github.com/JoseK0514/VELANI-SHOPIFY-WEBSITE/tree/codex/velani-website-ai-backend/services/velani-ai)

```sh
git clone --branch codex/velani-website-ai-backend --single-branch https://github.com/JoseK0514/VELANI-SHOPIFY-WEBSITE.git
cd VELANI-SHOPIFY-WEBSITE/services/velani-ai
npm ci
npm run typecheck
npm test
npm run build
```

This branch contains the source without changing the current Shopify theme or the NEVORA workforce repository. The service has its own package.json and deployment root. README, API documentation, release notes, Dockerfile, migrations and the integration client are ordinary Git files here.

The public website assistant is a separate service from the private NEVORA workforce application. Its existing development Neon project is named velani-website-ai-development, project ID wild-leaf-57992989, development branch br-snowy-brook-bcc6b3zm, database velani_ai. These identifiers are not credentials. Do not assume that similarly named tables in another database are this service's tables.

## Read in this order

1. README.md — local setup, configuration, current status.
2. docs/RELEASE-0.2.md — current AI profile/plan behavior, API additions and database changes. Versions 0.2.1–0.2.2 add frontend entrance animation; the AI implementation remains this release.
3. docs/api.md and docs/CLAUDE-HANDOFF.md — HTTP contract and handoff constraints.
4. src/app.ts and src/experience-routes.ts — authoritative route handlers and validation.
5. src/engine.ts, src/plan-engine.ts, src/prompts.ts and src/plan-prompts.ts — chat/plan orchestration and prompts.
6. src/repository.ts and src/experience-repository.ts — transactions, session ownership, retries and persistence.
7. migrations/001_initial.sql, 002_experience.sql and 003_plan_brief.sql — original schema migrations.
8. test/ and docs/VALIDATION-0.2.md — tests and validation evidence.

Use these route handlers as the data contract. Database table definitions alone do not describe request validation, bearer authentication, consent, revision conflicts or idempotency behavior.

## Continue the implementation

Check out the branch above and work from services/velani-ai. Install locked dependencies with npm ci, then run npm run typecheck, npm test and npm run build. Obtain runtime credentials through the owner's secure environment. No real .env files, database passwords or model tokens are included; .env.example documents the required names.

The assistant database already had migrations applied in the Codex development work. Compare its current migration history/schema with these files before running administrative commands; another agent may have made later changes. Do not recreate tables to compensate for the earlier missing repository handoff.

Use Vercel with Root Directory `services/velani-ai`; see [Vercel setup](VERCEL.md). Preserve the existing restricted runtime database role and separation from the NEVORA employee database. Publishing this source does not deploy the service or enable live Shopify AI integration. The Vercel account visible to this Codex session does not list NEVORA; select the owner's intended Vercel account before configuring secrets or deploying.

## Package contents

This package contains the source, migrations, knowledge, tests, deployment files, integration code and documentation. The Git branch also preserves visual evidence. Local dependencies, build output and real credentials are excluded.
