# Consolidation evidence

See [the controlling handoff](../2026-11-12-velani-main-consolidation.md).

- `refs-before.json`, `branch-dispositions.json`, `all-work-dispositions.json`:
  exact branch/worktree source inventory and disposition, including the two
  detached publication-guard commits discovered during inspection.
- `merge-conflicts-before-resolution.json`: the26conflicting UI paths, resolved
  before committing. No conflicted state was delivered.
- `recovery-tags.json`:16immutable source mappings for retirement/recovery.
- `source-qualification.json`: exact application and merge identities; backend
  unchanged from prior development, plus the restored publication guard.
- `backend-tests.json` / `backend-tests.log`:261passed/0failed/0skipped on a new
  owned loopback PostgreSQL16.2/pgvector fixture, using synthetic transports.
- `backend-checks.json` and corresponding logs: passing service typecheck/build.
- `root-checks.json`, `root-tests.log`:80passing baseline tests before the guard.
- `final-root-checks.json`, `root-tests-final.log`, `theme-check-final.log`:
  100passing root tests,37-route build and clean Theme Check after the guard.
- `publication-guard-red.log`, `publication-guard-green.log`:12failed/8passed
  before the original guard;20passed after it. No assertion weakened.
- `browser.json`, `browser-final.json` and logs: actual local installed Chrome;
  both runs87passed/2existing UI failures/0runtime errors. Failures are the
  missing Relay target and no-JavaScript navigation. External writes were blocked.
- `incoming-history-secret-scan.log`, `incoming-history-secret-triage.json`:
  preserved scanner failure and source-based classification of4false positives,
  with no scanner rule changes or credential values printed/copied.
- `reconciled-heads-secrets.*`: follow-up scan covering the newly reconciled
  history, including the detached guard. `final-packet-secrets.*` covers the
  added packet and expanded archive. Both report no findings.

New tracked logs normalize only trailing line/EOF whitespace. Unmodified logs
are preserved privately under
`/Users/josek0514/.codex/velani-main-consolidation-20261112/raw-logs/`.
Historical incoming guard `red.txt` remains byte-identical in its original path,
including its8whitespace diagnostics. No failure message/count was removed.

Source promotion, branch deletion, recovery-tag readback, uncommitted-work
preservation and unchanged-host readbacks are recorded by the final delivery
receipt. Local test database/preview processes were shut down before promotion.
No real email, paid inference, production data write, deployment or publication.
