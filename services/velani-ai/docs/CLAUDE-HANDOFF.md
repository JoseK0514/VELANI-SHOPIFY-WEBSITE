# Claude handoff: Velani / NEVORA AI assistant

**GitHub handoff:** [Exact source location and checkout instructions](START-HERE-CLAUDE.md). This service lives under `services/velani-ai` on branch `codex/velani-website-ai-backend` in the private `JoseK0514/VELANI-SHOPIFY-WEBSITE` repository. [Vercel setup](VERCEL.md) is the preferred continuation path.

**Latest addition — 0.2.2:** [Velani entrance animation](ENTRANCE-ANIMATION.md) has been redesigned around a sculptural titanium V and is implemented in the development homepage, with desktop/mobile recordings and a ready-to-install Shopify Liquid snippet. Use that document for animation behavior, integration and validation. The public Shopify theme has not been changed.

**Updated implementation:** [Release 0.2](RELEASE-0.2.md) adds the actual bilingual homepage/workspace, confirmed business memory, sourced workflow plans, editable actions, download/print and consented plan sharing. Start with that release document for current behavior and new API/database contracts. Release 0.2 selects GPT-6 Astra after the bounded comparison and live plan validation; see [current validation](VALIDATION-0.2.md). Earlier evaluation evidence remains historical; the model comparison is in [model-comparison.md](model-comparison.md).

## Goal

Deliver a thoughtful, knowledgeable website assistant for product advice and consensual lead capture. The owner wants conversation quality comparable to a capable frontier assistant. Prioritize accurate reasoning, useful follow-up questions and continuity. Do not replace the configured model with a cheap tier without the owner's direction.

This code is a separate public marketing service. The existing private `JoseK0514/NEVORA` repository is an employee scheduling application. Do not connect the public assistant to its employee database, expose its authentication paths, or merge this code into its default branch without following that repository's workflow.

## Development resources

- Neon organization: VELANI LLC (MAIN).
- New isolated project: `wild-leaf-57992989`, name `velani-website-ai-development`.
- Branch: `br-snowy-brook-bcc6b3zm`, name `development`.
- Database: `velani_ai`, PostgreSQL 17, region `aws-us-east-1`.
- Gateway: `https://br-snowy-brook-bcc6b3zm-api.ai.c-16.us-east-1.aws.neon.tech/v1`.
- Current configured model: `gpt-6-astra` for chat and plans. The earlier `gpt-6-1-sol` baseline and comparison are historical evidence.
- Secrets are intentionally excluded from the handoff archive. Retrieve them from the owner's secure environment; do not request pasted keys in a public issue or commit `.env` files.

See README, docs/api.md and docs/architecture.md for behavior and operations. The integration directory includes a headless client and an illustrative manual test page, not the final luxury website design.

## Preserve these decisions

1. Use only reviewed current product knowledge. Source links resolve through server-owned metadata. Product status, prices and availability are facts to review, not marketing copy to invent.
2. Use authenticated anonymous sessions and server-owned conversation history. A visitor cannot select another visitor's session by ID or submit system messages.
3. Saving a lead requires a separate consent form. Chatting, mentioning an email, or a model `lead_form` action does not save a lead.
4. Do not claim an email or meeting was sent/booked. This release saves an enquiry only.
5. A draft clock demo is not verified as publicly available. Configure a real demo URL only after checking it. The default product link remains valid.
6. Keep runtime database credentials restricted. Do not give the model SQL, browser/network tools, employee records or admin access.
7. Preserve idempotent UUID retries and lease fencing. A network retry must not duplicate a completed answer or enquiry.

## Deployment work still needed

The source and development resources are prepared. Production hosting and Shopify installation have not been performed by this handoff. Use the owner's intended Vercel account with the supplied Node adapter and `services/velani-ai` as Root Directory; see VERCEL.md. A managed Node container host remains an alternative using the Dockerfile. Neon supplies persistence and the AI gateway, not this HTTP process automatically.

Configure an HTTPS API domain, health checks, restricted ingress proxy trust and production-only CORS origins. Create/configure Turnstile for the actual website hostnames; client action must be `velani-session`. `NODE_ENV=production` refuses disabled CAPTCHA or HTTP origins. A Shopify preview hostname must be intentionally added when needed.

Schedule the retention job daily, set gateway spending alerts, and publish an assistant privacy notice describing chat storage, enquiry storage, AI processing and backup retention. Validate the contact-review process: someone must review saved enquiries. An email/CRM notification workflow can be added later with explicit authorization and delivery retries.

Use a separate production Neon project/branch with appropriately protected credentials after staging acceptance. Keep the current development project isolated. Do not reuse the existing workforce production database.

## Acceptance

- `npm ci`, `npm run typecheck`, `npm run build`.
- Run all tests with an isolated PostgreSQL17+pgvector `TEST_DATABASE_URL`; without it DB integration tests explicitly skip.
- Migrate/seed staging, verify runtime role cannot write knowledge or create tables, run health/chat/lead/delete smoke tests.
- Run `npm run eval` using the intended model. Read every answer, not just the contract success count. Verify English, Spanish, repeated follow-ups, pricing unknowns, unsupported integration claims, payroll exclusions, sensitive-data requests and prompt injection.
- Test the embedded widget on desktop/mobile, keyboard and screen reader; test session expiry, CAPTCHA failure, rate limits, provider outage and manual retry.
- Make no claim that stochastic answers are guaranteed accurate or that the model is identical to ChatGPT. Track actual misses, fix knowledge/prompt issues and add regression scenarios.

## Further capability priorities

First improve the reviewed knowledge: concrete product screenshots/workflows, approved availability, supported integrations and commercial process. More accurate knowledge improves answers more reliably than giving the model unrestricted tools.

Next add an authenticated lead-review console and an explicitly authorized CRM/notification integration. Then evaluate semantic retrieval for a larger corpus and privacy-conscious quality analytics. Keep visitor chat memory bounded; persistent identity or cross-device memory should be a separate consented product decision.
