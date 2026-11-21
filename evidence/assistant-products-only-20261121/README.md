# Assistant: products only (November 21, 2026)

Local evidence. Nothing was published or deployed.

- `velani-ai-vitest.txt`: the assistant service's own suite (`npx vitest run` in `services/velani-ai`): 205 passed, 91 skipped (the skipped files need the database or real keys). `npx tsc --noEmit` passed.
- `knowledge-check.ts`: the publish script's own document rules (from `scripts/seed.ts`) run against `knowledge/nevora.json`: 16 valid documents, 10 core. To rerun it, copy it into `services/velani-ai/scripts/` (so it finds the service's packages) and run `npx tsx scripts/knowledge-check.ts` from `services/velani-ai`.
- `assist-copy.txt`: the on-site greeting and suggested questions in English and Spanish, read in Chromium from the local preview with the assistant panel opened by hand (no assistant service runs locally).
