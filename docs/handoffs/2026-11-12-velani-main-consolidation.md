# Velani main consolidation and branch cleanup — November 12, 2026

Owner: Codex. Jose explicitly requested checking all Velani branches, bringing
their outstanding work into main, reporting any needed pages/UI work for Claude,
and leaving only development (dev) and main. This replaces the earlier Git-main
hold for this source-consolidation task. It does not authorize Shopify publication,
runtime deployment, public signup, real billing, mail, paid inference or Step2.

**Qualification is complete; remote delivery and deletion are recorded in the
follow-up receipt after the source push is verified.** Source/runtime qualification
and actual public publication remain separate.

## What was missing from main

Main was `5680168611f6b366a3a0ce5397bca039c855ed70` (November2). Development was
`afd453d7506f427784b2948f4b02a00b8b0fcf9c`,221commits ahead. The audit covered
15remote branches,7local branches and all existing Velani worktree heads.

| Work absent from old main | Reconciliation |
|---|---|
| Later website implementation | Preserve the combined signature-hero Home, NEVORA demo/shared sample week, Plans, custom-software stories, support, billing fallback, legal/SEO and EN/ES routes already in development. |
| Public website AI service | Include the existing `services/velani-ai` implementation, API contracts, tested refusal handling, reviewed knowledge, retention, workflow plans, finite development cost guard, native monitor/retention handlers and operational receipts. Git integration does not activate them in public production. |
| Client-hub inquiry system | Include the existing EN/ES Help forms and backend contracts, saved references, idempotency/concurrency, durable email outbox/queue, recovery and retention. Earlier hosted acceptance and unpublished-theme status remain explicit. |
| Tooling/security and Step1 | Include dependency repairs, local CSP/preview controls, regression harnesses, the Step1 migration concurrency fix,261passing backend tests and source-pinned claim/handoff evidence. |
|13additional UI exploration commits | `044b6d2` and descendant `950919f` were not in development. Merge their history, preserve an exact41-file snapshot, and resolve26conflicting files against the later signature implementation. This preserves the newer combined application and avoids restoring a retired design. |
| Two detached publication-guard commits | Worktree `velani-publish-guard-20261110` contained `48ad93af` and `d2a633c`, missing from both main and development. The existing one-line sandbox publication guard and20regressions are now included with their original handoff/review receipts. |

No original branch head is omitted from the consolidated ancestry. See
[the full original ref inventory](branch-consolidation-evidence-20261112/refs-before.json),
[per-branch dispositions](branch-consolidation-evidence-20261112/branch-dispositions.json)
and [source qualification](branch-consolidation-evidence-20261112/source-qualification.json).

## Resolving the parallel UI work

The Gusto/Phase1 branches were parallel November10 explorations: Fraunces headings,
paper/teal replacement, old Home/Products, a different header and website assistant
rename. The later signature rounds replace those components and already carry
their substantial workflow improvements: field-error recovery and named summaries,
Jose/trial-request wording, outage help and the Direction B clock demo.

The later Products page no longer has the old phone screenshot slot, and the
later Home uses a shared four-view sample rather than the retired three-tab
component. Both complete layouts cannot occupy the same routes. Current pages,
client-hub safeguards, backend contracts and tests were preserved. No new visual
design, competing live route or business policy was invented during resolution.

The exact retired files, assets, font license and original handoffs are retained
in [the UI exploration archive](../archive/2026-11-10-ui-explorations/README.md),
with41verified SHA256s. They are not copied into the public website build. All
original commits remain in the merge history and in recovery tags. Small optional
copy differences, such as the old Spanish clear-all label, are listed for Claude
there; they are not missing backend features.

## Restored publication safeguard

The detached guard was independently reproduced before integration: the existing
20-test suite had12failures/8passes on the development renderer. With the original
guard restored,20/20pass. It emits `commerce_api_url` only for explicit unpublished
or development Shopify themes; main/demo/missing roles emit an empty API.

This intentionally keeps sandbox billing out of a published theme even if an
operator leaves a setting populated. It does not erase stored theme settings or
enable live billing. A separately qualified production API and explicit release
work are required before revising this temporary guard. No theme was uploaded.

Against original development, active application changes are exactly:

- `src/render.mjs`: this existing one-line publication safeguard.
- `tests/commerce-publish-guard.test.mjs`: its existing20Liquid role tests.

The backend, active CSS, demo behavior, inquiry transport and other website source
are unchanged from the combined development release. No test assertion was
removed, weakened or updated merely to pass. Original guard handoff:
[publication containment](2026-11-10-codex-commerce-publication-guard.md).

## Verification actually performed

Qualified application source:
`a456364bade4a32d3114980c7cc24bf2bb321725`. Later evidence/delivery commits change
documentation only. Existing AGENTS, package/build/test configuration and relevant
handoffs/source were read first. Used Git/conflict-resolution, debugging/TDD,
verification and engineering/security/governance delivery controls. No independent
certification is claimed.

| Check | Actual outcome |
|---|---|
| Branch/merge evidence |26UI conflicts resolved; zero unresolved entries. Every original local/remote branch head is an ancestor of the candidate; detached publication-guard source is also included. |
| Backend tests |261/261passed,0failed/0skipped,27files. New owned loopback-only PostgreSQL16.2/pgvector fixture; no hosted/application credentials. Service source is byte-identical to the already qualified development backend. |
| Backend typecheck/build | Both passed. |
| Website tests/build |100/100passed,0skipped after restoring20guard cases.37routes built. Earlier80/80baseline result retained. |
| Publication regression |12failing cases before the guard;20/20passed afterward. Failed and passing outputs retained. |
| Theme Check | Passed before and after the guard; no offenses. |
| Local actual Chrome | Both the earlier and final guard-source runs:87passed/2existing UI failures/0runtime errors. Both genuine Relay/no-JS findings remain open. |
| Secret scan | Initial incoming history scan covered232commits/7.37MB and returned4findings. Inspected exact owning source: one `scheduler/operator` prose phrase, two UUID idempotency fixtures and one local test secret. All are false positives; no real credential established, no rule weakened. Original scan and explicit triage retained. The final packet, including the expanded source archive, passed a1.34MBscan with no findings; newly reconciled head history is checked separately. |
| Diff/source checks | New active code has a clean whitespace diff and no conflict markers. The incoming historical guard's raw `red.txt` retains8trailing-whitespace diagnostics; it is preserved unchanged as historical failure evidence. This is not reported as an all-history clean whitespace check. |
| Hosted/live limits | No Shopify write, new hosted test, lost-response inquiry replay, external send, model inference, CI dispatch, production migration or deployment. Local PostgreSQL16.2 results do not qualify hosted17. |

Evidence directory:
[branch-consolidation-evidence-20261112](branch-consolidation-evidence-20261112/).
The backend/root subprocess environments excluded operational credentials and used
only the explicit owned fixture. Tests used scripted external transports. Builds
do not migrate a hosted database. Known browser failures are not merge regressions
and are not marked fixed by source integration.

## Recovery and existing work

Recovery tags use `archive/velani-20261112/`, preserving13retired remote branch
heads, old main/development, and the detached publication guard. These are tags,
not working branches. [Exact mapping](branch-consolidation-evidence-20261112/recovery-tags.json).
All retired branch commits are also retained as main/development ancestry.

Private local recovery:
`/Users/josek0514/.codex/velani-main-consolidation-20261112/` contains the full
pre-change Git bundle, incremental detached-guard bundle and original CSS patch.
It is owner-only; no credentials/customer records were copied into source.

The Desktop Velani checkout contains one pre-existing uncommitted
`public/assets/velani-home.css` change and908untracked evidence files. Their909file
hashes were recorded before work. Branch cleanup detaches affected checkouts at
the same original commit; it does not reset them or overwrite their files.
Final receipt records the preservation comparison. The clean consolidation
worktree is the place to continue on development:
`/Users/josek0514/.codex/worktrees/velani-main-consolidation-20261112`.

Remote deletion is permitted only after source promotion and recovery-tag
readback, and only for the exact audited branch heads. Any changed/new head must
be reconciled first. No forced history rewrite or deletion of main/development
is part of this task. Preserve existing worktree directories and ignored secrets.

## What Jose should tell Claude

1. Continue from freshly fetched **development**, using the combined source and
   [Step1 factual contract](2026-11-12-step1-velani-backend-truth.md). The earlier
   feature branch names are retired; do not recreate them automatically or copy
   whole older trees onto main.
2. **No new page is required merely to merge these branches.** Client new-work
   and support forms already live on existing `/pages/help#client` and
   `/pages/es-ayuda#client`; do not create another CRM/contact system.
3. New Spanish legal pages remain needed: at least `/pages/es-privacy` and
   `/pages/es-nevora-privacy` were confirmed404. Review all English-only legal
   routes and replace the Help/product language fallbacks with actual approved
   translations/routes. This source cleanup creates none of that UI content.
4. Restore the EN/ES NEVORA `#relay` target and usable390px no-JavaScript header
   navigation. Preserve the no-JS inquiry non-delivery guard. These remain the
   two actual failing browser checks.
5. Apply the recorded trial-start, provisional pricing/active-non-Owner count,
   Owner-versus-website Rondo availability, privacy-date/provider/retention and
   Rondo identity/approved Lantern corrections. Do not invent customer readiness,
   an automatic workplace deletion timer or live billing from sandbox receipts.
6. Inspect the preserved uncommitted Desktop CSS patch before deciding whether
   its older headline-size override still belongs in the current design. It was
   preserved but not silently promoted as qualified UI work.
7. Shopify theme193374224698 remains an unpublished acceptance copy with preview
   sending false. Public MAIN193311572282 remains separate. Production API
   deployment, theme publication, combined hosted acceptance and billing activation
   still require their own authorization; the source merge does not perform them.

## Ownership and release position

Engineering accepts source consolidation with the restored tested safeguard;
Security retains least-privilege/secret custody, closed publication transport and
recoverable exact-head deletion; Delivery separates Git integration from public
publication and preserves failures; Governance permits the explicitly authorized
main source update and branch cleanup without treating it as a public-readiness
certificate. Claude owns UI/legal work. Jose retains business policy and public
release authorization. NEVORA and the private-admin repositories were untouched.

Development remains the primary operating/acceptance release under Jose's
November12policy. Only the exact combined, verified release may later be deployed
or published with his approval. This source-consolidation request authorizes the
Git main update itself; it does not accept the remaining hosted/UI risks.
