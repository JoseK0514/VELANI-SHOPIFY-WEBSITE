# The Velani company site

## Branch policy — Jose, November 12, 2026

Keep only `development` (dev) and `main` as local/remote working branches. Start
new application work from freshly fetched `origin/development`; use detached
worktrees for isolation instead of recreating retired feature branches. Preserve
active worktrees and uncommitted files. Recovery tags under
`archive/velani-20261112/` retain historical source and are not working branches.
Integrate verified work into development first. Future main promotion requires
Jose's authorization; his November12consolidation authorized that source update
only. A Git main merge does not authorize Shopify publication, runtime deployment,
live billing, customer-data changes or new spending. See
`docs/handoffs/2026-11-12-velani-main-consolidation.md` for the completed audit and
remaining Claude-owned UI/page work.

## Git author attribution for Vercel

For Jose-authorized changes made on his behalf in this repository, use his
GitHub-mapped commit identity:
`Jose Karlo Natal Muniz <319002654+JoseK0514@users.noreply.github.com>`.
Configure it with repository-local
`user.name`/`user.email`; keep `user.useConfigOnly=true`. Before committing, check
both `git var GIT_AUTHOR_IDENT` and `git var GIT_COMMITTER_IDENT`. Do not override
this identity with a generic agent address or an inferred Mac-local email.
Other contributors must use their own GitHub-mapped identities and authorized
Vercel access. Do not rewrite published history to repair attribution. See
`docs/handoffs/2026-11-13-vercel-commit-author-mapping.md` for evidence, verification
and the separation from application/CI failures.

## Website controls

The user selected the second displayed mockup and authorized this build. docs/reference/approved-homepage.png is the exact target. Preserve its navy/white identity and the confirmed company facts.
This is a new isolated repository, separate from NEVORA. Never alter NEVORA or older company review packages.
Only UNPUBLISHED Shopify themes may be created/changed. Read exact target role before writes. Policies, menus and store settings are global; do not update them in this build. Do not publish content, remove the storefront password, delete old resources, change DNS, enable live inquiries, send real messages, charge money, or dispatch CI.
Keep source, active ledger, original reference, backup inventory, failed and passed evidence and independent reviews.
Run actual build, unit, theme syntax, route/link and browser checks. A local render is not hosted Shopify acceptance. Keep preview inquiry delivery disabled and label preview outcomes truthfully.

