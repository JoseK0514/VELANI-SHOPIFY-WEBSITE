# Task 3 — NEVORA Release 1.1 trial retention

## Scope and custody

The implementation is prepared locally and has no application caller, database change, scheduled job, destructive adapter, billing hook or copy change. The assigned worktree is `work/nevora-release11`, detached from `e2872f30ea8548b1310ea4a9b25813352decf82a`. The locally available `origin/development` matched the assigned base. Release 1 is frozen at `f5fa463b111e263c9b863b16b6c2bca502571a7b`. No branch, remote artifact, hosted environment or customer data was changed.

- `src/lib/trials/policy.ts` calculates trial phase, the owner's grace export window and the current reminder with a stable deduplication key.
- `src/lib/trials/policy.test.ts` covers phase and reminder boundaries, leap day, delayed polls, retries, high-precision incarnations, conversion, stale/mismatched observations and invalid identifiers/timestamps.
- `docs/handoffs/2026-11-07-release11-trial-policy.md` records exact policy, source evidence, authority restrictions, owners and release gates.

## TDD and checks

- RED, `npm test -- src/lib/trials/policy.test.ts` after writing tests, failed to load the absent policy. Repeated the same command with an always-unavailable scaffold to verify assertion failures. Vitest reported **15 failed, 18 passed** across all 33 cases. Explicit failures included day 30, day 60, reminder changes, stable keys and paid-plan exclusion.
- GREEN, same command after implementing policy, **33 passed**. Boundary inputs straddle the exact millisecond and the fixture crosses February 29 in a leap year.
- `TZ=America/New_York npm test -- src/lib/trials/policy.test.ts src/lib/tenancy/runtime/workspace-incarnation.test.ts src/app/api/reports/export/route.test.ts` passed **100 tests** across three files.
- `npm run typecheck -- --incremental false` exited 0 for the entire worktree. `node_modules/.bin/eslint src/lib/trials/policy.ts src/lib/trials/policy.test.ts` exited 0.
- Inspected `package.json` scripts and `vitest.config.mts`. The full default suite uses `vitest run`. Its run received a sanitized environment containing only PATH, HOME, TMPDIR and CI, without application service credentials. Build/start and dedicated service integration suites were not invoked.

## Self-review and integration gaps

- Checked day 30 and day 60 as half-open cutoffs, preserving the exact trial start time through DST. Reused the tenant runtime's positive native-int8 incarnation validator without numeric conversion. An exact observed timestamp and matching immutable trial facts are required even when an old trial would otherwise be deletion eligible.
- Reviewed event keys for retry stability, collision-resistant tuple framing and separation across workplaces, generations, trial IDs, start times and reminder kinds. A late poll returns the latest applicable reminder, suppressing obsolete countdown notices. Outbox uniqueness and delivery still belong to the future integration.
- `scripts/company-setup.ts` uses one transaction on an empty schema. Its cleanup removes installation seed rows. The account deletion request module targets an employee. Repository searches of source, DB, scripts and functions did not identify a billing trial source or abandoned workplace deletion authority. The reports export route authorizes OWNER/MANAGER reports by period and session proof. The new grace flag is an eligibility window only.
- Re-read the brief against the candidate, checked the staged file list, and inspected the result for external effects. The future adapter must persist and serialize conversion history and deletion with current tenant/incarnation checks, deny unknown billing, implement full scoped owner export, reminders/outbox, resumable deletion, retention exceptions and backup restoration fencing. The next gate is Release 1.1 design/integration review led by Engineering with CISO and Governance. Publish policy copy only after shipment.

## Verified candidate

**DONE_WITH_CONCERNS** — detached candidate `36d51fc080d4abc9aaa8636f15e92bda9a63587d`, direct child of `e2872f30ea8548b1310ea4a9b25813352decf82a`. Staged whitespace check passed and the post-commit worktree was clean. No push, merge or deployment.

Full default suite: `env -i PATH="$PATH" HOME="$HOME" TMPDIR="${TMPDIR:-/tmp}" CI=1 npm test -- --maxWorkers=4` exited 0 after 163.04s. Vitest reported **724 files passed, 27 skipped, 11,011 tests passed and 801 skipped**. Integration and hosted evidence for the new lifecycle remain open. The full-suite log had unrelated React DOM attribute warnings. Local test output does not establish release acceptance.

## Review correction, round 1

Detached correction `365538ce33a27dcbb5e819dc967948f0b96f61c3` directly follows FIX_BASE `36d51fc080d4abc9aaa8636f15e92bda9a63587d`. Clean worktree after commit. The three original candidate files were the only files edited in the NEVORA repository.

- Reproduced the review finding against the previous source. RED with new cases: `npm test -- src/lib/trials/policy.test.ts` exited 1, **4 failed, 33 passed**. Both matching padded ID cases incorrectly returned unavailable. The matching lone high and low UTF-16 surrogate cases incorrectly returned deletion-eligible.
- `validId` now uses the same native text decoder as `portal-source-binding.ts`, admitting only decoded nonempty scalars without control or format characters. Both workspace and trial IDs retain exact source text in equality checks and reminder keys. Tests distinguish padded and trimmed bindings/keys, valid supplementary Unicode, lone surrogate halves and zero-width format characters.
- Covered the minor finding by varying only the start by one millisecond within the same reminder window and asserting distinct keys.
- GREEN: `npm test -- src/lib/trials/policy.test.ts` passed **37/37**. `npm test -- src/lib/trials/policy.test.ts src/lib/tenancy/runtime/workspace-incarnation.test.ts src/lib/tenancy/runtime/portal-source-binding.test.ts` passed **169/169** across three files.
- `npm run typecheck -- --incremental false`, `node_modules/.bin/eslint src/lib/trials/policy.ts src/lib/trials/policy.test.ts` and `git diff --cached --check` all exited 0. The full default suite was not repeated in this bounded round. Release 1.1 enforcement still needs the lifecycle integrations and acceptance evidence above.
