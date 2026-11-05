# Rondo standards code review

Scope: baseline 953e47a to HEAD 77d57b9, branch codex/rondo-backend-readiness-20261104; clean checkout at inspection. Reviewed repository AGENTS.md, backend package configuration, complete changed code, prompt/knowledge changes, engine and API guards. No ULW plan exists; fallback report path used. No executor evidence or notepad path supplied.

## Findings

CRITICAL: None.

HIGH: None.

MEDIUM — Skill-perspective type escape: services/velani-ai/scripts/evaluate-rondo.ts:35,55 uses Record<string, unknown> for a fixed report row. Status, actionCheck and usage fields consequently have no checked schema; misspelled writes or incompatible values silently weaken the report. The programming skill requires explicit domain types rather than untyped escape hatches. Use a typed result row, preferably with discriminated status. This is a maintainability concern, not a demonstrated runtime failure.

LOW — Evidence coverage: services/velani-ai/test/evaluation-budget.test.ts:6 says failed calls remain reserved, but only invokes the arithmetic helper. It does not exercise persistence before transmission, SDK failure, or the runner's handling of a budget stop. The arithmetic coverage is useful; the runner lifecycle remains unverified by this test.

## Standards versus heuristics

No observed repository-standard violation of server authorization, secret handling, JSON answer contract, or backend-only scope. assistantName is an additive public field; existing origin/CAPTCHA/session/consent guards are untouched. No UI files changed. Reservations occur before inference, failed requests retain reservations, and automatic SDK retries are disabled. The $3 cap is per invocation; cumulative accounting across different output files explicitly remains the operator's responsibility. Pricing assumes the configured gateway matches the Neon catalog.

Both remove-ai-slops and programming skills were located and consulted, including TypeScript guidance. The type-escape concern above violates the programming perspective. No deletion-only, tautological, brittle prompt-prose tests or needless production extraction/normalization were added. The budget helper supplies a useful deterministic test seam. No additional heuristic smell warrants a finding.

## Verification and limits

Ran npm test -- --run test/app.test.ts test/evaluation-budget.test.ts: 18/18 passed. Existing Fastify deprecation warnings remain. No paid calls, deployment, source edits or live mutations. Answer quality, current commercial-source accuracy and hosted acceptance were not established by these tests.

codeQualityStatus: WATCH
recommendation: APPROVE
blockers: []
