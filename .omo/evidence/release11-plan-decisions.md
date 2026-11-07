# SDD ledger — plan: docs/superpowers/plans/2026-11-07-velani-nevora-backends.md

Scope: SDD governs the independent Task 3 candidate. Tasks 1/2 remain existing inline work; Task 4 infrastructure is controller-owned. User's three-item request is the spec.

| Tasks | Shared output/interface | Preflight finding |
|---|---|---|
| 1 / 2 | Website repository and outbox | Same controller; no concurrent edits. Daily-only retries revised to native queue plus independent daily maintenance. |
| 1 / 3 | None; separate repositories | Isolated worktrees, database boundaries explicit. |
| 2 / 4 | Domain/email activation | Controller owns all external settings; candidate implementer performs no external mutations. |
| 3 / 4 | Release 1.1 handoff | Task 3 owns its dedicated handoff; controller writes domain integration separately. |
| 1 | Contract/API tests | Consistent; actual rolling accepted-request SQL replaces fixed acceptance counters. |
| 2 | Email/outbox/maintenance tests | Consistent after native queue ruling; account activation still gated. |
| 3 | Trial tests versus current source | No implemented trial lifecycle or trusted deletion adapter exists. Candidate must distinguish policy preparation from shipped behavior. |
| 4 | Association files versus signing identity | Public production identifiers are missing. Never publish development IDs/placeholders. |

Ruling: Release 1.1 candidate may add tested policy at a new narrow boundary and a precise integration handoff, but must not install an unsafe pretend deletion worker or claim the feature shipped — no billing/provisioning authority exists in the inspected development source — costs an explicit later integration gate.
Ruling: Task 3 file ownership is src/lib/trials/policy.ts, its unit test, and docs/handoffs/2026-11-07-release11-trial-policy.md. Existing export/auth guards remain source of truth; no bypass or broad route changes. Ask the controller if a real lifecycle integration is found that changes this scope.
Task 3 BASE: e2872f30ea8548b1310ea4a9b25813352decf82a (detached NEVORA worktree).

Task 3: fix round 1/5 (2 addressed, 0 open — exact native ID semantics and start-instant key coverage; commits 36d51fc08..365538ce3).
Task 3: complete as prepared policy candidate (commits e2872f30e..365538ce3, review clean). Live lifecycle integration remains an explicit Release 1.1 gate, not completed/shipped behavior.
Ruling: delegate only Task 4's offline links-only association preparation to a fresh implementer; controller retains domain purchase/ownership, DNS, provider and production deployment work — independent file set and no external mutations — adds a small separate candidate commit.
Task 4 code BASE: 365538ce33a27dcbb5e819dc967948f0b96f61c3. Ownership: native/association/prepare.mjs, prepare.check.mjs, README.md, docs/handoffs/2026-11-07-nevora-domain-app-links.md. No overlap with Task 3 policy files.
Task 4: complete as offline preparation (commits365538ce3..60542450a, spec/quality passed, no Critical/Important findings). Node tests23/23 green; no native signing, hosted links or production readiness claimed.
Task 4: minor (deferred to final triage): options.linksOnly accepts only literal true; a string 'true' silently preserves default credential-sharing scope. CLI supplies a proper boolean. See release11-app-links-review.md.
Final fix wave: addressed the single minor with an early non-boolean guard and real no-output regression cases; commit60542450a..831d33dac, Node26/26pass. Scoped final re-review confirms ADDRESSED, zero open findings.
Final candidate:831d33dac00f63622f538e77fc598857f3b9b8d9, detached/clean, source-approved as offline preparation; no integration or NEVORA production release claimed.
Website source:d89350bd4019bc2746373bba8b75ff70d05039c8 pushed; active Vercel deploymentdpl_8ChbePq8yvGTPJxi3LAspPyCtwnG ready/enabled. Actual accepted-form→queue→two-email journey remains untested pending UI/genuine verification and inbox-test authorization; registration/ingress/maintenance/provider simulation passed.
Ruling: preserve the user-requested active ledger, reports and worktrees instead of removing scratch evidence; copy resumable reports into versioned evidence. Costs retained local scratch space, avoids losing recovery context while Release1.1 remains unshipped.
