# Vercel commit-author mapping — November 13, 2026

Jose requested a bounded Velani release-infrastructure correction. This issue is
separate from application tests, GitHub Actions failures and private-admin CI.
Development remains the working/acceptance line. Codex owns backend/hosting;
Claude retains UI ownership. Main/production promotion requires Jose's approval.

## Reproduced failure

- Repository: `JoseK0514/VELANI-SHOPIFY-WEBSITE` (GitHub repository ID `1443058200`).
- Source: development `850ec357b48bdf3c064be78fd93b8d07e32356ef`.
- Vercel: team `team_Lzbw410WwXGWHTuUXuamRI1N`, project `velani-ai`
  (`prj_E1Vl2AEpTlJlBam4MTKG7oEHB7x2`), root `services/velani-ai`.
- Blocked Preview: `dpl_AzshfucyT4Ybm2NpUPXwnZru9LFJ`.
- Provider reason: `COMMIT_AUTHOR_REQUIRED`; Vercel could not find a Git account
  for the commit author. GitHub returned null author/committer accounts for this
  commit, whose email was `josek0514@Mac.lan`.
- Vercel's owner already has GitHub login `JoseK0514` connected. GitHub confirms
  this account's numeric ID is `319002654`, also the linked repository owner ID.
  Reconnecting the repository or adding a paid seat is unnecessary for this fix.
- The Vercel connector returned a scope-dependent project 404. The existing
  authenticated Vercel CLI successfully read the exact project/deployment using
  the explicit team ID. A connector 404 does not mean the project is absent.

## Correction

Configured the existing website repository's local Git defaults (shared by its
linked worktrees), without changing global Git configuration:

```sh
git config --local user.name 'Jose Karlo Natal Muniz'
git config --local user.email '319002654+JoseK0514@users.noreply.github.com'
git config --local user.useConfigOnly true
git var GIT_AUTHOR_IDENT
git var GIT_COMMITTER_IDENT
```

The ID-based GitHub noreply address avoids publishing a personal email. New
clones must configure the same repository-local identity for work authorized on
Jose's behalf. Other contributors use their own identities and authorized access.
Explicit `GIT_AUTHOR_*`, `GIT_COMMITTER_*`, `git -c user.*` or worktree-level
overrides can supersede local defaults; inspect the effective identities rather
than assuming the configuration wins. Do not use `Codex <codex@openai.com>` for
owner-authored releases; that email attributes commits to a different account.

No existing commit is amended, rebased or force-pushed. The release-infrastructure
commit is a normal descendant of the current development source. No runtime,
frontend, database, environment-variable, access-control or provider-plan setting
changes are part of the correction.

## Provider verification

The regression is exercised through the real Git integration, not a synthetic
application test. Before the correction, the exact source above has null GitHub
attribution and a blocked Vercel Preview. After a normal development push, verify:

1. GitHub attributes both author and committer to `JoseK0514` (ID `319002654`).
2. Vercel records the new SHA and `githubCommitAuthorLogin=JoseK0514` for branch
   `development`, with a Preview target. `main` remains the production branch.
3. The author block clears. A later build/configuration failure, if any, is a
   separate failure and must be reported without claiming deployment readiness.
4. Read the final deployment state and GitHub status. Do not claim success only
   from a local configuration check or successful push.
5. Confirm main and the production alias remain unchanged. Baseline main is
   `f5082ed5be0e65bb322fe4047dd624ad73e9d493`; `velani-ai.vercel.app` points to
   `dpl_2yjDbRBcm8vc6ujPm1mqz34qLRhT`.

Verification is limited to development Preview. It does not promote main,
publish Shopify, execute an AI request, create a real inquiry,
send mail, activate production or alter another repository's author defaults.
Historical blocked deployments retain their original metadata/status.

## Rollback

If the owner requests removal of these repository defaults, unset only these
three newly added local keys (`git config --local --unset user.name`,
`git config --local --unset user.email`, and
`git config --local --unset user.useConfigOnly`). No prior explicit local values
existed. Preserve published commits; do not rewrite history. Rolling back these
defaults restores the risk of Git inferring an unmapped machine-local identity.

## References

- [Vercel commit attribution and linked Git accounts](https://vercel.com/docs/deployments/troubleshoot-project-collaboration#account-configuration)
- [GitHub repository-local commit email configuration](https://docs.github.com/en/account-and-profile/how-tos/email-preferences/setting-your-commit-email-address)

The documentation-only verification commit uses `[skip actions]` to respect the
repository's CI-dispatch restriction and avoid rerunning unrelated application
gates. It does not repair, waive or change those gates. Vercel's Git integration
must still independently accept the mapped author and build the Preview.

Live provider verification receipts are retained in the local output report at
`/Users/josek0514/.codex/visualizations/2026/11/13/01a1d5d4-5741-7e93-ab62-b7705c0e403b/vercel-author/REPORT.md`.
No application suite or hosted business lifecycle acceptance is implied by this
infrastructure check.
