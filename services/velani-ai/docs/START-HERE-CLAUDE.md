# Start here — Rondo backend source

Updated November 12, 2026 for SCRUM-153. The public website assistant is in
`JoseK0514/VELANI-SHOPIFY-WEBSITE`, under `services/velani-ai`.

## Source and checkout

Start ordinary new work from freshly fetched **development**. The source reviewed
for this handoff is `daca3fc17f35fc8142c8ec7ccf91c6ccab39c261`. Keep only the
approved `development` and `main` working branches. Historical backend/UI branches
have been consolidated and retired; do not fetch them into new working refs.
Their evidence remains recoverable through Git history and the recorded archive
tags in the [consolidation handoff](../../../docs/handoffs/2026-11-12-velani-main-consolidation.md).

Preserve your current branch and dirty work. In an existing clean repository,
fetch the source without switching another chat's checkout:

```sh
git fetch origin development
git rev-parse FETCH_HEAD
# Only for a NEW, unused sibling path:
git worktree add --detach ../velani-ai-reference FETCH_HEAD
```

Use an existing owned worktree if it already contains your work. Recheck the
latest source and active ownership before combining changes. Main promotion,
Shopify publication, runtime activation and spending are separate approvals.

## Read next

1. [Current Claude UI contract](CLAUDE-UI-START-HERE.md).
2. [Backend boundaries and source map](CLAUDE-HANDOFF.md).
3. [SCRUM-153 review and integration receipt](../../../docs/handoffs/2026-11-12-scrum153-rondo-backend-integration.md).
4. [Current six-issue UI packet](../../../docs/handoffs/2026-11-12-six-release-codex-to-claude.md).
5. [Development operations](DEVELOPMENT-OPERATIONS.md) and
   [remaining operating acceptance](../../../docs/handoffs/2026-11-12-rondo-responder-closeout.md).

The source contains the actual routes, persistence, migrations, headless clients,
provider adapters, tests and deployment files. Do not reconstruct the API from
tables or put this public service into the NEVORA workforce application.

## Local verification

Inspect package scripts and use Node 24 with the committed lockfile. Typecheck
and build only compile TypeScript. Full database tests require an explicitly
owned, disposable `TEST_DATABASE_URL`; missing database cases can skip and do
not establish a full integration pass. Existing deployed databases are not test
fixtures. Migration, seed, role-provisioning, retention/apply and evaluation
commands have effects and are not part of a normal documentation/UI check.

Use explicit synthetic fixtures for UI development. Obtain any separately
approved runtime access through the existing secure store. No secret, session
bearer or production connection belongs in source, chat, Jira or an archive.

Dated November 3/5 validation documents remain historical receipts. Their source,
model, expiry, database and deployment claims do not select today's environment
or grant a new paid test allowance.
