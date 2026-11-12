# Velani development closeout — November 12, 2026

## Ownership and release policy

Jose assigned this Codex chat the remaining Codex work for SCRUM-172, SCRUM-171
and SCRUM-130. Codex owns backend/hosting/integration; Claude owns product UI.
Development is the primary working/operating and acceptance release for Velani,
NEVORA and the private admin. Apply production standards and combined UI/backend
verification there. Promote only the exact verified release to real main/production
after Jose approval. Preserve truthful environment names and synthetic-versus-real
data status. This grants no automatic main merge, production activation, copied
production credentials/customer data, new paid activation, live charge or weaker
control. Existing specific authorizations and budgets persist.

This is a development integration and verification packet. The whole website and
NEVORA public release are not certified complete. No production/Shopify write,
real email, model request, DNS change, credential change or new spending was made
by this closeout.

## Source assembly

Repository: `JoseK0514/VELANI-SHOPIFY-WEBSITE`, private. No remote development
branch existed. The existing clean, isolated client-hub worktree was reused;
Claude's checkouts and uncommitted changes were preserved.

- Client-hub acceptance: `8505ed25e4265912ad68222e69d9c26165d80326`.
- Rondo closeout: `7a5696a06bb02ad8c8c9a184e949cdbb536d93ec`, runtime
  `3db0ea98bc3da6b3ae08b9e5d2c2b59a361e6a8d`.
- Claude website/client-hub UI: `17d35c2e9a146c54fcdfa1393348bfb642bdcf90`.
- Combined development assembly: `dc962db`; README was the only merge conflict.
  Both the UI documentation and backend entry point were retained.
- Verified tooling/preview/QA implementation: `2aa0d3f`; the following evidence
  commit changes only documentation and receipts.
- GitHub main before publication: `5680168611f6b366a3a0ce5397bca039c855ed70`.

The entire `services/velani-ai` tree remains byte-identical to deployed source
`3db0ea9`; no backend runtime redeployment is needed for this assembly. Source,
`public/`, build implementation and client-hub tests remain identical to Claude's
UI source. The additional changes are tooling, local preview hosting, regression
checks and this evidence/handoff. Runtime and UI source identities are not replaced
with a misleading single historical production SHA.

## SCRUM-171: backend and bounded development acceptance

The earlier Jira/GitHub summaries omitted unpushed local work. Genuine Safari
acceptance had already saved EN new-work `VEL-2611-0001` and ES support
`VEL-2611-0002`, using the explicitly approved business test inbox. No customer
address was used. This closeout independently read the two existing database
records: one request and exactly two email jobs each, one provider attempt per
job. Authenticated Resend reads independently show all four messages delivered;
the Spanish confirmation is Spanish. No new message was sent.

The original actual four-message inbox observation remains in
[the acceptance receipt](2026-11-12-client-hub-live-acceptance.md). The current
Gmail connector requires reauthentication, so this closeout does **not** claim a
new independent inbox observation. Provider delivery and the original inbox
observation remain distinct sources of evidence.

Fresh Shopify readback confirms MAIN `193311572282` and UNPUBLISHED acceptance
copy `193374224698`. Its real-submission flag is **false** after the original
test. Six current compiled client-hub code/schema/section MD5s exactly match the
hosted copy. Its other settings were read, not replaced. Publishing that copy
remains Jose's separate action; the published older theme does not gain these
form additions merely because source is integrated into development.

The HTTP/PostgreSQL suite covers concurrent same-key requests, changed-key/body
conflicts, saved-reference replay, queue admission failure, partial email failure
and stable provider-key recovery. Hosted repeated clicks did not create duplicate
rows/jobs. The original hosted test did not capture a raw idempotency key or
simulate a lost-response replay; that narrower hosted scenario is not claimed.

Codex implementation and bounded acceptance are complete. Keep the issue in
review for its publication/final review disposition, preserving the stated limit.
Retention/mailbox policy, wider site regressions and admin activation are separate
gates and are not silently closed by this form acceptance.

## SCRUM-172: current domain evidence and remaining release gate

The domain is no longer parked. Fresh authoritative-provider/project and public
readbacks establish:

- Vercel project `nevora-signup`, `prj_jPVvFBEx2mMZM125KVJzRiBZfgDE`, owns verified
  apex, www, signup and `*.portal.nevora.team` mappings.
- Apex and www return **307** to `https://signup.nevora.team/`.
- Normal TLS hostname validation succeeds for apex, www and signup; the current
  certificates expire February 8, 2027.
- Public onboarding config returns **200**, `signupEnabled:false`, EN/ES,
  `Cache-Control:no-store, private`.
- Existing production deployment is READY `dpl_5WsYDzYbdFnXwUZtBDfcQNNgigSX`,
  source `3922df940deef009b3a357ed2788cc7bb28e3fed`. This is not proof that newer
  NEVORA development has been deployed or accepted on that domain.

The old `fuel-scheduler` project's lack of an apex mapping does not mean current
signup routing is absent. The first Vercel connection returned404 for the owning
project; the already authenticated CLI succeeded with the exact same explicit
team/project. No credential or permission was changed.

Codex domain preparation/readiness is complete for the existing closed routing.
The whole production-cutover issue remains open for the selected NEVORA release,
joined UI/backend onboarding, ordinary workplace login/recovery/invitation and
passkey-origin acceptance, operational release gates and Jose's final promotion
approval. The other active NEVORA hosting chat owns that ongoing release; this
closeout did not alter its functions, aliases, public admission or DNS.

For the future cutover, refresh project-specific DNS recommendations, retain
Resend/SPF/DKIM/DMARC and nameservers, qualify the exact source/environment, take
the approved rollback snapshot, verify the ordinary login/invitation path and
then obtain final promotion approval. Rollback must restore the recorded project
domain/deployment mapping, not replace the whole registrar zone. Native association
files require their own verified signing identities and device acceptance.

## SCRUM-130: backend, retention and remaining owners

Fresh Vercel metadata identifies `velani-ai` production READY at
`dpl_2yjDbRBcm8vc6ujPm1mqz34qLRhT`. Automatic Git deployments are **disabled** and
the configured production branch remains `main`; publishing development does not
authorize or trigger a production rollout. Existing production source is preserved.

The first scheduled conversation cleanup is now actually observed. The database
receipt records scheduler completion at `2026-11-12T15:45:43.570451Z`; the matching
Vercel runtime record is `conversation_retention`, `status:ok`, `trigger:scheduler`,
zero deleted, at15:45:43.578Z (11:45 a.m. Puerto Rico). This was an existing timer
invocation, not a manually relabelled test. Fresh aggregate reads show zero overdue
conversations/leads, 16 published knowledge documents, zero expired documents and
earliest expiry December12. The fixed cron registers15:00UTC conversation cleanup
and16:00UTC client-hub maintenance. No customer deletion was performed as a test.

The runtime-logs connector returned403; the scoped authenticated CLI returned the
actual matching log. The durable heartbeat uses an authenticated diagnostic source
label, not cryptographic scheduler attestation. Continuous external alert delivery
and a Rondo-specific hard dollar cap are still separate operating/business gates.
The previously verified organization spending notification is not such a cap.

Preserve the existing Rondo safety-rejection fix, reviewed knowledge, named
operations check and rollback. Do not repeat paid model evaluation or rewrite the
service merely because older Jira says the provider failure is undiagnosed.

Claude's remaining concrete UI work:

1. Restore the existing `#relay` navigation destination on both NEVORA language
   pages. The complete local link sweep checked162 unique destinations and found
   only `/pages/nevora#relay` and `/pages/es-nevora#relay` missing.
2. Provide usable product/service header navigation at390px with JavaScript off.
   Current actual no-JS browser readback shows every header destination except
   the logo hidden; inquiry submission correctly remains disabled. Keep that
   non-delivery protection. The unchanged acceptance assertion still fails.
3. Finish the already recorded Spanish legal-page/language-map, current policy
   wording, Rondo identity/approved Lantern asset and privacy date follow-ups in
   the November12 Rondo/UI handoffs. These are not backend changes or newly
   invented icon decisions. Do not self-close independent UI findings.

Jose/business owners retain client-portfolio permissions/materials, commercial
policy, a defined ongoing dollar cap/incident coverage and final publication.
The private admin's own current staging/passkey handoff stays separate; these
three issues do not authorize its production activation.

## Changes and verification performed here

- Updated LiquidJS10.21.1 to10.30.1 and narrowly overrode Theme Check's minimatch
  to11.0.1. The original root audit reported six affected packages including one
  critical; fresh root and service audits both report **zero vulnerabilities**.
  [LiquidJS advisory](https://github.com/harttle/liquidjs/security/advisories/GHSA-gf2q-c269-pqgc),
  [minimatch advisory](https://github.com/isaacs/minimatch/security/advisories/GHSA-g3hv-75wg-m249).
- Reproduced npm-test failure on a clean checkout because a test required
  unbuilt theme artifacts. `pretest` now builds them; source test files run
  serially because they share compiled artifacts. No assertion was removed.
- Reproduced blocked inline scripts with real HTTP responses: home and both
  retired trial pages failed the new CSP regression. The local preview server
  now hashes the exact trusted compiled response scripts, including404 output.
  Unknown inline scripts/event handlers remain blocked; script unsafe-inline/
  unsafe-eval was not enabled. Four HTTP regressions and the full80-test suite pass.
- Updated the browser harness to the approved assisted-trial CTA/current menu
  and preview submission semantics. CSS-hidden inactive Rondo questions are no
  longer falsely classified as visible covered controls; the actual visible
  Rondo question is clicked and its selected state asserted at each laptop size.
  Both genuine missing-fragment/no-JS checks remain failing and are preserved.
- **80/80 root tests**,37-route build, Theme Check with no offenses,
  **198/198 backend tests in21 files with zero skips** using a new loopback-only
  PostgreSQL17/pgvector fixture, service typecheck/build and both audits pass.
- Client-hub browser: all eight complete EN/ES ×1440/390 ×live-fixture/preview
  configurations pass (340 live checks +148 preview checks;92 axe runs, zero
  violations). First English live attempt failed when overlapping servers
  rebuilt the same output with different fixture settings. The unchanged,
  isolated85-check rerun passes. Original failed output is retained; concurrent
  preview servers in one checkout are not qualified. Run these builds serially.
- Privacy browser regressions:4/4 pass. Broad actual Chromium suite:
  **87 passed /2 failed /0 runtime errors**. The two remaining failures are the
  real UI items above; the whole website is not labelled all-green. The earlier
  14-failure and13-failure receipts remain preserved.

Receipts are in [velani-development-evidence-20261112](velani-development-evidence-20261112/).
The exact unpublished-history secret scan completed with one triaged prose false
positive (`scheduler/operator` in an existing review paragraph); new staged code
has zero findings. The earlier broader historical scan hit its60-second bound and
is not represented as complete. No security rule or finding was silently disabled.
The PostgreSQL disk image checksum matched the retained official release; no
production test credential was used. This task claims no new independent review,
real-device test, hosted lost-response replay, whole-site production acceptance,
new production deployment, theme publication or paid model run.

## Publication and next action

Publish only this source/evidence to `development`, verify its remote SHA and
unchanged main, and reconcile Jira with these exact boundaries. GitHub CI is not
claimed: commits retain `[skip ci]` and the original no-dispatch instruction.
The development candidate is backend-qualified with two explicit site UI gates;
it is not a ready-to-promote whole-site release. Jose need not repeat the existing
client-hub messages or domain purchase/setup. Claude can finish the listed UI
items from this combined development source; then run the two failed checks and
the applicable combined acceptance before any exact-release promotion.
