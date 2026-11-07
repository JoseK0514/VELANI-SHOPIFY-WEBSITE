# NEVORA Release 1.1 trial policy review

**Spec verdict — changes required.** One identifier validation defect prevents a legitimate workplace from receiving the grace decision, export window and reminders. **Quality verdict — changes required.** The same predicate accepts malformed text that the existing tenancy source rejects. No Critical findings.

## Important — Match the authoritative workplace ID contract

At `src/lib/trials/policy.ts:32`, the predicate requires identifiers to equal their trimmed form. Tenancy preserves padded source identifiers. Its source parser validates the native text wire and then checks for a nonempty ID without control or format characters (`src/lib/tenancy/runtime/portal-source-binding.ts:16`). Its incarnation storage test uses a padded workspace ID and forbids relabeling to the trimmed value (`src/lib/tenancy/runtime/workspace-incarnation-storage.postgres.test.ts:375` and `:539`). The new policy test explicitly classifies a matching padded ID as malformed at `src/lib/trials/policy.test.ts:77`.

I called the actual evaluator and wire decoder through Node with tsx and its cache disabled. I used a synthetic trial starting at zero, incarnation `1`, trial ID `a`, and a matching never-converted observation at day 30.

| Workplace ID | Native text decoder | Policy phase |
| --- | --- | --- |
| `'x'` | DECODED | grace |
| `' x '` | DECODED | unavailable |
| Single UTF-16 high surrogate U+D800 | BLOCKED | grace |

At `src/lib/trials/policy.ts:49`, this mismatch denies the padded workplace its full policy evaluation and admits the malformed identifier. Align workplace validation with the existing tenancy source semantics. Preserve exact comparison and tuple encoding. Cover matching padded values, a padded-versus-trimmed mismatch, and malformed Unicode. Apply native text validation to trial IDs as appropriate for their separate contract.

## Minor — Cover the start instant in the reminder key test

The key includes the immutable trial start at `src/lib/trials/policy.ts:77`. The uniqueness cases at `src/lib/trials/policy.test.ts:52` do not vary that field. Vary only the start and evaluate both records during the same reminder window. This protects the documented key contract if the tuple later changes.

## Scope and evidence

The supplied diff adds only the policy, unit tests and engineering handoff. I verified the detached head, direct parent, changed paths and a clean `git diff --check` for `e2872f30ea8548b1310ea4a9b25813352decf82a..36d51fc080d4abc9aaa8636f15e92bda9a63587d`. Inspection confirms the half-open 30/60-day boundaries, reminder cutoffs at days 30/53/59, latest-window retry rule, exact incarnation/trial/start equality, same-instant observation requirement, and explicit conversion and active-plan exclusions. The returned phase conveys timing eligibility. No code in the change performs an export or deletion or changes customer copy.

The implementer reports 33 focused tests, 100 targeted tests, successful typecheck and lint, and 11,011 passing / 801 skipped in the full run. I did not rerun the suite or independently observe its red/green history. The handoff identifies Engineering, CISO and Governance owners and gates. Durable billing consistency, outbox delivery, complete owner export, destructive authority, backup handling and live enforcement remain unverified. The reviewed commit contains no deployment or Release 1 change. Production and remote refs were outside this review.

## Correction review — 365538ce3

**Important — ADDRESSED.** At `src/lib/trials/policy.ts:33` the evaluator decodes both identifiers with the native text wire decoder and requires a nonempty scalar without control or format characters. The original text remains in the trial comparison and reminder key. The new cases at `src/lib/trials/policy.test.ts:61` exercise matching padded values, distinct padded/plain keys, and padded/plain observation mismatches for each field. The invalid input table covers lone high and low surrogates.

**Minor — ADDRESSED.** At `src/lib/trials/policy.test.ts:56` the test varies only the start by one millisecond, holds the evaluation instant and reminder kind constant, and includes both resulting keys in the uniqueness assertion.

**Final spec verdict — PASS for the pure policy and integration handoff. Final quality verdict — PASS.** I reviewed the supplied correction diff and confirmed its head is the direct child of the initial candidate. The correction passes `git diff --check`. I found no new issue in the changed behavior. The implementer reports four regression failures before the fix, 37 policy tests and 169 combined tests passing afterward, and successful typecheck and targeted lint. I did not repeat those runs. The full-suite result applies to the initial candidate.

**Outside this review.** The production lifecycle integrations and release acceptance gates remain open as recorded in the handoff. This verdict covers the detached policy candidate.
