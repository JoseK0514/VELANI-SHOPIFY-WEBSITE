# SCRUM-153 — Rondo backend integration and current Claude handoff

November 12, 2026. This supersedes the November 5 source-integration snapshot in
[SCRUM-153](https://thevelani-team.atlassian.net/browse/SCRUM-153).

## Result and source

The Rondo backend is integrated into the website development line. GitHub PR1 is
MERGED (November 12,22:49UTC); the earlier backend commit
`fb6a79b26d3748da9e556149e74de4dd1b6a57b4` is an ancestor of reviewed development
`daca3fc17f35fc8142c8ec7ccf91c6ccab39c261`. Only development and main remain
working branches. This update changes documentation only on top of that source;
it does not activate an environment or modify application/UI code.

The concrete handoff defect was stale active checkout instructions: three Claude
entry documents still selected retired feature branches and presented older
setup/model/retention statements as current. Their historical Git blob IDs are
preserved in the [qualification receipt](scrum153-evidence-20261112/qualification.json).
The active README and three entry documents now direct Claude to development,
the current rejection/edit contract and the separately owned operating gates:

- [Source checkout](../../services/velani-ai/docs/START-HERE-CLAUDE.md).
- [Current widget contract](../../services/velani-ai/docs/CLAUDE-UI-START-HERE.md).
- [Backend boundaries and source map](../../services/velani-ai/docs/CLAUDE-HANDOFF.md).
- [Current development operations](../../services/velani-ai/docs/DEVELOPMENT-OPERATIONS.md).

## Review and evidence

The bounded review covered actual route validation/Origin/CAPTCHA/session/error
handling, consent and enquiry semantics, request hashes/session/lease recovery,
provider rejection classification and durable budget reservation. It did not
identify a new demonstrated runtime defect. This is a technical integration
review, not independent whole-system security or release certification.

Fresh verification for this update:

- 13 actual Fastify-to-client cases passed,0 failed / 0 pending: reference and Shopify
 clients in EN/ES,422/503 rejection/edit, refused unchanged resend, fresh edited
 UUID and temporary-outage delay. All responses/providers were synthetic.
- TypeScript typecheck and build exited 0.
- npm production dependency audit exited 0 with 0 reported vulnerabilities.
- 122 non-documentation backend/client inputs match qualified source
 a456364bade4a32d3114980c7cc24bf2bb321725 byte-for-byte by Git blob.

The retained [full database report](branch-consolidation-evidence-20261112/backend-tests.json)
records 261 passed / 0 failed / 0 pending, with corresponding
[typecheck/build checks](branch-consolidation-evidence-20261112/backend-checks.json).
Those tests were not rerun for this documentation change. Their local PostgreSQL
16.2 scope is preserved; earlier 260-case PostgreSQL 17 evidence is separate and
no new hosted PostgreSQL 17 equivalence or selected-environment restore proof is inferred.
The [input manifest](scrum153-evidence-20261112/unchanged-backend-inputs.json)
and qualification receipt bind the reused component evidence to current source.
Raw fresh output locations are recorded there. The temporary owned dependency
link was removed, and no database/server was started for these checks.

## Completion boundary and remaining owners

SCRUM-153's backend source-integration and usable-handoff work is complete after
this documentation update reaches development. The original records and
activation prerequisites remain preserved; no gate has been waived.

| Remaining work | Existing issue/owner |
|---|---|
| Runtime retention/budget, independent outage coverage, actual alert/delivery and human acknowledgment | SCRUM-155, existing consolidated finisher |
| Widget/site UI, Relay/no-JS, local/hosted/physical browser acceptance and exact unpublished theme | SCRUM-157, Claude |
| Public policy/Spanish presentation and business approval | SCRUM-156, Claude/business |
| Current knowledge refresh / next review | completed164 / future operational191 |
| NEVORA application CI and hosted workforce/Stripe acceptance | SCRUM-190, existing finisher; separate repository/service |

Development remains the primary operating/acceptance line at production
standards. Main/production promotion still needs Jose's approval of the exact
verified release. No new paid model call, real email/push, customer data change,
credential copying, schema mutation, runtime activation, CI dispatch, Shopify
write or production operation occurred here. Earlier CAPTCHA/provider receipts
retain their actual source and do not authorize another paid test.
