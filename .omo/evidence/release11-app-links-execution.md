# Task 4 report — offline app-link preparation

Status: implemented and locally verified; detached candidate committed. No push,
merge, deployment, production bundle, native build, account/DNS or other external
mutation. No subagents. Only the four assigned NEVORA files were changed.

- Worktree: `/Users/josek0514/Documents/Codex/2026-11-04/https-www-thevelani-com-preview-theme-2/work/nevora-release11`
- Verified clean initial detached BASE: `365538ce33a27dcbb5e819dc967948f0b96f61c3`.
- Detached commit: `60542450a1366d627837f362a3a7c463ad275382`
  (`feat(native): prepare app-link-only association bundles`).
- Post-commit `git status --short --branch`: `## HEAD (no branch)`, no changed files.
- Frozen Release1 `f5fa463b111e263c9b863b16b6c2bca502571a7b` untouched.

## Changes

1. `native/association/prepare.mjs`: optional `{linksOnly: true}` in document and
   preparation APIs; one explicit `--links-only` flag in CLI. Reuses unchanged
   identity validation and IO/receipt path. Omits Apple webcredentials and Android
   get_login_creds in that mode, preserving app-link identities/routes and the
   original default. Rejects duplicate/unknown/missing CLI combinations.
2. `native/association/prepare.check.mjs`: six added tests for literal returned
   link-only documents, explicit false/default behavior, actual prepared bytes and
   receipt hashes, validation/custody, CLI flag ordering and duplicate rejection.
   Existing default CLI test now checks credential-association files explicitly.
3. `native/association/README.md`: documents opt-in API/CLI and unchanged default,
   distinguishes applinks-only entitlement requirement and links production gates.
4. `docs/handoffs/2026-11-07-nevora-domain-app-links.md`: public-input custody,
   exact production target URLs, TLS/application-json/no-redirect checks, exact-host
   native gates, rollout/revocation effects, email/DNS limits, ownership and next
   release decision. Labels prepared/not hosted/not signed/not device-tested.

## TDD and actual verification

Before implementation, ran from the assigned worktree:

```sh
node --test native/association/prepare.check.mjs
```

Exit 1: 23 tests, 20 passed, 3 failed, 0 skipped. Expected missing-feature failures:

- `links-only documents retain app-opening routes and identities without credential delegation`
  — actual Apple document still contained webcredentials.
- `links-only preparation writes app-opening files with matching receipt hashes`
  — actual prepared Apple file still contained webcredentials.
- `CLI accepts one links-only flag before, between or after required option pairs`
  — CLI exited 1 for the new flag.

After the implementation, the identical command exited 0: 23/23 passed, zero
failures, zero skips. Repeated after finishing docs and strengthening default CLI
assertions: exit 0, 23/23 passed, zero skips. All test outputs consumed real
returned documents, filesystem files and subprocess CLI behavior; no live service
or production data was used. Temporary fixtures were cleaned by test hooks.

`git diff --check` and final `git diff --cached --check`: exit 0. Self-review read
all changed code/tests/docs and confirmed scoped diff, default preservation,
unchanged validator/custody implementation, no placeholder production files,
receipt states and gate wording. Whole NEVORA suite was not repeated per brief.

## Director positions and remaining concerns

Engineering: GO for the small offline candidate; controller owns integration.
Security: least app-opening delegation in opt-in mode; input syntax is not proof
of signed store identity or domain ownership. Governance: GO WITH CONDITIONS for
local preparation, production **BLOCKER** until domain/project/account/signing,
hosted/device evidence and Jose's future release authorization. No exception or
risk acceptance requested. Independent review has not been claimed.

Controller supplied that domain purchase/DNS are absent, Apple enrollment is
pending and store identities are unverified. No production bundle was generated.
Never publish `.development` IDs or fictional test fixtures. Required next owners:
controller verifies purchase/project/TLS and later hosting; native release owner
provides the signed iOS application-identifier, production Android application ID
and Play App Signing app signing certificate (not upload/debug), then tests actual
signed devices. Sender DNS must come from selected provider/domain setup; no
records were invented. No architectural escalation was necessary.

Read-only official references consulted: Apple Supporting associated domains
(its Markdown endpoint could not be fetched), Apple QA1916 troubleshooting and
Android configure-assetlinks. Specific identity/hosting claims are linked in the
handoff. This is no claim of hosted, signed, device-tested or production readiness.

## Final review fix wave — malformed linksOnly values

Complete review finding addressed: an explicitly supplied non-boolean
`linksOnly` value previously fell through to credential association. FIX_BASE was
verified clean at detached `60542450a1366d627837f362a3a7c463ad275382`.

Minimal implementation: `associationDocuments` rejects a non-boolean value after
its existing undefined-to-false defaulting and before configuration processing
or any preparation filesystem work. `prepareAssociations` uses the same check
through its existing call. No duplicate validator, CLI or custody code added.
Omitted/undefined options, empty options, undefined linksOnly, literal false/true
and CLI semantics remain unchanged. README and handoff explain the contract and
record the fix verification. Exactly the same four owned files changed.

Added three real-behavior tests: document rejection, preparation rejection with
no directory/files, and undefined/default credential associations in documents
and actual prepared files. Invalid values exercised: strings true/false/empty,
null, numeric 0/1/NaN, object, array, boxed boolean, function, symbol and bigint.

TDD red command: `node --test native/association/prepare.check.mjs`.
Exit 1: 26 tests, 24 passed, 2 expected failures (missing exception in both new
invalid-value tests), zero skips. Green, using the identical command after the
one-line implementation and doc changes: exit 0, 26/26 passed, zero failures and
zero skips. `git diff --check` and `git diff --cached --check` exited 0. Self-review
confirmed early rejection, explicit undefined/default preservation, real
no-output custody assertions, original CLI coverage and four-file scope.

Fix commit: `831d33dac00f63622f538e77fc598857f3b9b8d9`
(`fix(native): reject non-boolean association scope options`). Post-commit status:
`## HEAD (no branch)`, clean. No subagents, full-suite rerun or external actions.
No further fix-wave concerns. Existing production identity/domain/project and
hosted/signed/device/authorization gates remain open and unchanged. Controller
owns final review/integration of this detached follow-up commit.
