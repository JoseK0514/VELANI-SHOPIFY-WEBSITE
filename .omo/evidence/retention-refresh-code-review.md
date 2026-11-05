# Retention, knowledge refresh and client sync — final source review

**codeQualityStatus** CLEAR  
**recommendation** APPROVE  
**blockers** []

CRITICAL, HIGH, MEDIUM and LOW: no active findings. All earlier findings below are closed. On final inspection, `scripts/retention.ts` counts eligible rows only in the dry-run branch. Applied runs use DELETE row counts and the same advisory lock as the cron. Both review skill perspectives were applied; no remaining violations found. The executor reports that four real PostgreSQL retention regressions passed again after the last change, together with typecheck and build. The reviewer independently inspected the final branch logic, checked client byte identity and previously ran eight HTTP/client tests and typecheck.

Final operational evidence audit: inspected `services/velani-ai/docs/evidence/retention-activation-2026-11-05.json` and the updated launch handoff. The production deployment `dpl_CniQFLC1BWmEJ5G3gKLZSX9o8zMG` for `0ca8a753` is recorded READY, and the installed daily `0 15 * * *` cron references that deployment. The secret metadata identifies a production-only sensitive value. The authenticated manual run returned HTTP 200 and zero sessions, with a matching 14:29:40 UTC aggregate production log. Unauthenticated access returned 401. The first automatic tick remains unobserved as explicitly recorded. The installed schedule and manual applied-run evidence meet the stated acceptance criteria.

Independently recomputed the 16 document hashes from source and matched every entry in the readback manifest. Evidence records 10 core entries, bilingual Relay/Plans retrieval, 133 passing tests and no skips, four fresh retention regressions, typecheck/build success and isolated database cleanup. The guarded rollback file exists in the deployed source revision. No remaining task requirement or contradiction found. No new API calls or tests during this final evidence audit.

## Audit history — superseded findings and verdicts

# Launch specification review

Baseline d6ed79fff0bc362e752e269baf66d24a424d5361 against the current working tree. Claude handoff and proposed entries checked at 3be6321b8eafd25f537280098907f262e187d808. No production mutation or model call.

HIGH — `services/velani-ai/scripts/retention.ts:17`: The manual retention transaction takes its REPEATABLE READ snapshot when executing the advisory-lock SELECT. If an automatic cleanup holds the lock and deletes eligible sessions, a waiting manual --apply later sees stale rows and its DELETE can raise SQLSTATE 40001, rolling back manual lead/rate cleanup as well. The new overlap test covers two cron jobs, leaving the explicitly required manual/cron combination untested. Ensure a fresh post-lock snapshot or bounded retry, and test this overlap. This is a concurrency inference from both transaction paths, not a claim of an observed production failure.

MEDIUM — `services/velani-ai/knowledge/nevora.json:126` and `:136`: Both new entries imply visitors can open Ask Rondo on the main site. Direct public GETs of the homepage and NEVORA page identified main theme 193100644666 and neither contained the label or widget marker. Claude's pinned handoff places the working chat on unpublished preview 193106706746. Qualify these two records as applying where chat is enabled.

CRITICAL/LOW — none. Independent comparison confirmed client byte identity, all eight proposed entries merged, the other eight retained and ten core entries. Public plans, trial timing, export/deletion policy and Relay development status align with supplied first-party snapshots. No theme/UI paths changed. Eight standalone HTTP/client tests passed. Required remove-ai-slops and programming perspectives reviewed, no additional material violations.

Pending operational evidence: full isolated PostgreSQL suite with restricted-role cascade and mixed cleanup checks, typecheck/build, exact revision deployment and installed production-only schedule/secret scope, first applied run and count, production knowledge before/after hashes and retrieval, and distinction between manual trigger and observed automatic tick. These are deployment gates separate from code findings.

codeQualityStatus BLOCK. recommendation REQUEST_CHANGES. Blockers: mixed retention correctness and live availability wording before publication.

## Re-review of corrected launch source

Both original findings are resolved. The manual operator now uses the normal READ COMMITTED transaction with the shared advisory lock and reports actual DELETE row counts. The mixed-run regression holds a row lock, observes the waiting cron delete and manual advisory-lock acquisition, then verifies both complete with counts 1 and 0. The bilingual knowledge now explicitly qualifies Ask Rondo availability to locations with chat enabled and identifies the Shopify preview. The pinned integration client still matches Git blob f9ab868f765b2c819e5152b60a66d997d0f29b7c. Independent typecheck passed. The executor reports an isolated full-suite pass of 133/133 and atomic knowledge publication. This pass did not repeat production verification.

CRITICAL/HIGH: none. MEDIUM, nonblocking under remove-ai-slops/programming: scripts/retention.ts:20 still selects counts for all three tables during --apply, then immediately replaces them with actual DELETE counts. Perform that count query only for a dry run to avoid redundant scans under the shared lock. LOW: none.

codeQualityStatus WATCH. recommendation APPROVE reviewed source. blockers []. Remaining acceptance evidence: production document verification/retrieval, installed production schedule, first applied run and distinct automatic-tick evidence.
