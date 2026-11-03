# Validation completed 2026-11-02

## Automated code and database checks

- TypeScript typecheck and build passed.
- Docker image built successfully and ran as the non-root node user; its readiness endpoint connected to Neon successfully. The build environment required its trusted outbound-proxy CA as an ephemeral BuildKit secret; no CA or proxy credential was baked into the image.
- 62 tests passed: 28 engine tests, 15 API tests, and 19 database/transport/knowledge-validation tests. Database cases ran against isolated schemas in local PostgreSQL 17 with pgvector; they were not skipped.
- `npm audit --omit=dev --audit-level=high` reported zero vulnerabilities at the time of this run. This is a point-in-time dependency check, not a security guarantee.
- Separate review found and fixed CORS headers missing on early rate limits and mismatched publishing/engine source constraints. Unrestricted boolean proxy trust is rejected.

## Live development backend

The new isolated Neon database was migrated and seeded with 12 knowledge articles. A restricted application role was created. The public service role has no knowledge-write or schema-create privileges.

The live smoke test used that runtime role, the real model and Neon storage. It verified cited answers, multi-turn context, replay without duplicate messages, explicit synthetic lead capture, lead replay, chat deletion/token invalidation, and independent enquiry retention. It removed its own synthetic records afterwards. See [live-smoke.json](live-smoke.json) for the two synthetic conversation answers.

The retention command was exercised as a dry run. A production retention schedule has not been installed.

## Conversation quality

See [evaluation.md](evaluation.md) and [evaluation-results.json](evaluation-results.json): 25 real responses across 17 distinct scenarios, reviewed by agents. This is separate from the live API smoke test. A human owner still needs to approve the product facts and production experience.

## Browser

Chromium tested the local integration example against the real development API. A browser-specific fetch-binding issue was found and fixed.

- Spanish session creation, a real answer, and four rendered source citations passed.
- Desktop 1280px and mobile 390px views had no horizontal overflow.
- The consent checkbox began unchecked; an invalid contact form did not send a lead request.
- Chat deletion succeeded and cleared the visible conversation.
- No provider key/database URL appeared in the DOM; localStorage and sessionStorage remained empty in this original validation. Release 0.2.1 added only a `velani:entrance:v1=seen` sessionStorage marker; the redesigned 0.2.2 entrance uses `velani:entrance:v2=seen`. The anonymous bearer remains in memory and is sent only to the API on authenticated calls.
- No page JavaScript errors occurred.

Evidence: [desktop screenshot](browser-desktop.png), [mobile screenshot](browser-mobile.png). This validates the developer harness, not the final Shopify theme, comprehensive accessibility or production load behavior.

## Remaining rollout work

Deploy the API to the chosen host, configure real production Turnstile and ingress, install the branded widget in Shopify, publish accurate privacy/retention details, schedule cleanup, configure spending alerts, and assign enquiry-review ownership. The public website has not been modified by this implementation.
