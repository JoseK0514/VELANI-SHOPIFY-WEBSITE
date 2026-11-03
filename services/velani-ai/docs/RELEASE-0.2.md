# Release 0.2 — personalized NEVORA guide

This release implements the first stage of the proposed AI experience roadmap. It adds a working public-facing guide and plan workspace to the isolated development backend. It does not add employee-facing scheduling, time-review automation, document imports or voice to the actual NEVORA workforce application.

## Experience delivered

The new homepage at `/` combines a business-description form, a compact conversation area, an illustrated four-stage NEVORA workflow and an editable action plan. English and Spanish are available without starting a new session. It uses a genuine reviewed clock preview, locally served fonts and a responsive layout.

Visitors can describe their business or start from an example. The AI produces a structured plan with business context, four sourced product-workflow explanations, separate recommendations, actionable next steps, assumptions and questions to confirm. No product action or employment decision is performed by generating a plan.

Generated business details are suggestions until the visitor explicitly saves them. Saved details persist for the current session, independently of the forty-message history window. Later chat receives those details and the currently open plan. A current saved correction takes precedence over stale plan context; a new explicit visitor correction remains a valid input. Plans retain their original brief for context and provenance.

Visitors can edit the action list and add notes, save the changes, download Markdown or print/save a PDF using the browser. Downloading requires no email address. Product-source claims remain separate from visitor-edited actions. The visitor can choose to share the saved plan through an enquiry form with explicit consent. The server stores the exact shared revision as a snapshot; subsequent plan changes do not silently rewrite an already submitted enquiry.

## API additions

| Method / route | Purpose |
| --- | --- |
| GET `/v1/config` | Non-secret browser configuration: CAPTCHA requirement and public site key |
| GET `/v1/profile` | Read this session's saved business profile and revision |
| PUT `/v1/profile` | Save confirmed details with `expectedRevision` |
| POST `/v1/plans` | Generate a plan with UUID `requestId`, `brief`, `profileRevision`, optional `locale` |
| GET `/v1/plans/:id` | Read a plan belonging to this session |
| PATCH `/v1/plans/:id` | Save `actions` and `notes` with `expectedRevision` |
| GET `/v1/plans/:id/download` | Download the saved plan as Markdown |

Chat accepts optional `planId` and `locale`. Enquiries accept optional `planId` and `planRevision` together. The browser never sends a model-generated plan as trusted database content; the API resolves the owned plan and revision itself. Idempotent enquiry replay returns the existing result even if the plan was later edited.

Mutation requests require an allowed Origin. Safe GET requests may omit Origin, as same-origin browsers commonly do; protected reads still require the bearer token. Supplied disallowed origins are rejected for all API methods. Sessions remain memory-only in the browser; a reload starts a new session.

## Database and concurrency

Migration 002 adds session profiles, generation requests, plans and enquiry snapshots. Migration 003 preserves original plan briefs. Existing runtime-role grants are updated by the migration. Fresh installations receive the same permissions from `provision:role`.

Profile and plan edits use optimistic revision checks. Generation uses an expiring fenced lease and request-payload hash. If a profile changes while a plan is being generated, completion fails with a conflict instead of publishing a plan against an obsolete revision. Session deletion cascades through profiles, plans and generation records; separately consented enquiry snapshots follow the enquiry retention policy.

## Model selection and evidence

The comparison tested the existing GPT-6.1 configuration, GPT-6 Astra and Claude Opus 5.5 through the available gateway. Read [model-comparison.md](model-comparison.md) for the exact successful tests, provider failures and limits. This is a small task-specific evaluation, not a general intelligence ranking.

`AI_MODEL` controls conversation. Optional `AI_PLAN_MODEL` controls structured plans and otherwise defaults to `AI_MODEL`. No automatic cheaper substitute is selected. The structured plan engine validates all four stages, field lengths, source IDs and plain-text content before a result reaches the browser. This validates the contract and source identities; it does not mathematically prove every natural-language claim.

For this release the development environment selects `gpt-6-astra` for both settings. It passed all six conversational comparison cases and both English/Spanish plan cases. The blind conversational review slightly preferred its practical detail in three cases and tied the rest; both working models were sound in the two plan cases. This is a provisional choice aligned with the owner's preference for answer quality, not evidence of a large or universal intelligence advantage. [Plan comparison evidence](plan-model-comparison.md) records the limits and actual outputs. The Claude candidate returned request errors through the tested gateway contract and could not be ranked for quality.

## Run and deploy

```sh
npm ci
npm run migrate
npm run dev
```

Open `http://localhost:3001` using an origin included in `ALLOWED_ORIGINS`. In a proxy-based environment, run with `NODE_OPTIONS=--use-env-proxy` and the documented Neon WebSocket settings. The server serves only `public/`, never the repository or environment files.

Production needs an HTTPS API/site origin, the scoped model token, restricted database URL, session hash secret, `TURNSTILE_SECRET_KEY` and `TURNSTILE_SITE_KEY`. CAPTCHA action is `velani-session`. Keep database-owner credentials out of the public service. Configure the daily retention job, budgets and enquiry-review ownership.

The Docker image includes the new frontend and runs as the non-root node user. For Shopify, the guide can run on a dedicated HTTPS origin and be linked from the approved homepage, or be integrated into the theme after checking styles, CSP, consent and origin configuration. The existing live Shopify theme has not been modified.

## Continuing the roadmap

Next stages remain proposals: a constraint-checked fictional Scenario Studio, the custom-project brief builder, authenticated workforce copilots, private document onboarding and optional voice. They require their own implemented tools and appropriate access boundaries; the current guide does not claim those capabilities.
