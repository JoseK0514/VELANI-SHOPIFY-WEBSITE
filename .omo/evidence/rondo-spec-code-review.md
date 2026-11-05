# Rondo specification/code review

Reviewed committed diff 953e47a4840b90921a913a03e7eb635f201d5e42...77d57b9; clean checkout at review start. No implementation edits or paid calls. ULW status returned ULW_LOOP_PLAN_MISSING; fallback report path used.

codeQualityStatus: BLOCK
recommendation: REQUEST_CHANGES

## CRITICAL
None.

## HIGH
- `services/velani-ai/scripts/evaluate-rondo.ts:30-41`: specification says “Do not exceed $3”. Each invocation initializes reserved spend to zero and accepts a different `--out`; exclusive creation protects only one filename. Two ordinary runs with distinct output paths can each reserve $3, exceeding the single authorization. Require a canonical cumulative ledger, concurrency exclusion and prior reservations before transmission. Parent reports $0 spent, so this is a prospective defect, not evidence of overspending.

## MEDIUM
- `services/velani-ai/scripts/evaluate-rondo.ts:28-51`: specification requires “Reserve a conservative cost bound before each paid request”. Any HTTPS gateway is accepted, while prices always come from Neon. Bind the approved gateway to its applicable pricing or fail closed; another compatible provider can charge more than the reservation.
- Specification says “Contract checks alone do not establish answer quality.” Hard-case rubrics and honesty instructions exist, but no resulting model answers or semantic review were supplied. This is pending acceptance, not proof of poor model behavior. Do not claim difficult-question/impossible-proof quality verified.

## LOW
- Specification says “Keep deployment, configuration, knowledge rollback and remaining blockers documented for Claude.” External handoff still identifies baseline 953e47a and predates this change. Update it before claiming Rondo activation; hosted readiness remains pending.

## Scope and verification
No UI/theme changes or unrequested operational scope found. Existing model/JSON contract and security paths are preserved. Knowledge distinguishes current product, trial, fictional clock and planned in-app Rondo; external product/plans snapshots and pre-change knowledge backup were inspected. Earlier handoff explicitly reports hosted 503 and no activation.

Ran targeted Vitest app/budget suites: 18/18 passed. Budget tests exercise arithmetic and boundary behavior, but not cumulative CLI runs. Loaded remove-ai-slops and programming skills and TypeScript reference: no deletion-only, prompt-string, tautological tests or needless production parsing found; unchecked catalog assertion is a programming-perspective concern at the pricing boundary. No material slop violation identified.

Blockers: cumulative budget enforcement and gateway/pricing binding before paid evaluation; semantic and hosted acceptance before completed-product claims.

## Re-review at 8476b16
Gateway binding resolves the prior pricing-provider mismatch; tier checks and typed result records improve the implementation. However the HIGH budget finding remains: evaluate-rondo.ts now uses `resolve('artifacts/rondo-hard-evaluation.json')`, which resolves against process.cwd(). Running the same script from the repository root and then from services/velani-ai creates independent spend ledgers. Its imports/knowledge paths use import.meta.url, so both invocations otherwise work. Anchor the ledger to a fixed service/module directory; rejecting --out alone is insufficient. No paid calls made. Recommendation remains REQUEST_CHANGES / BLOCK. Hosted and semantic acceptance remain pending.

## Final source re-review at fcb833a (supersedes earlier source verdicts)
codeQualityStatus: WATCH
recommendation: APPROVE
blockers: [] for reviewed source

Confirmed ledger is anchored with fileURLToPath(new URL('../artifacts/rondo-hard-evaluation.json', import.meta.url)); process working-directory changes no longer create separate ledgers. Exclusive creation occurs before paid requests, alternate output arguments are rejected, exact authorized development gateway is enforced, and retries remain disabled. Previously identified HIGH and gateway-pricing MEDIUM source findings are resolved for this reviewed checkout and authorization. Preserve the ledger; copying the checkout or manually deleting spend evidence does not renew authorization.

Typecheck passed and budget tests passed 2/2 at fcb833a; earlier app/budget suites passed 18/18. No paid model calls made by reviewer; parent reports total task spending $0. Required remove-ai-slops/programming perspectives ran; no remaining material slop or programming-perspective source blocker.

Source approval is not model-quality or hosted approval. Semantic review of actual English/Spanish hard-case answers, hosted CAPTCHA/API acceptance, exact reviewed deployment/configuration and updated Claude handoff remain pending. No CRITICAL/HIGH source findings remain; prior acceptance/documentation observations remain WATCH until evidenced.

## Provider diagnostics review at 9a976e6

Reviewed ef39c16...9a976e6, restricted to the four changed engine, API and test files. `src/engine.ts:171` retains only a validated integer HTTP status (400–599) from a recognized OpenAI SDK APIError. A newly constructed ModelError discards the upstream message, headers, body and cause. `src/app.ts:97` writes only the status, request ID and existing application error code to the enabled server logger. The public 503 response uses the existing sanitized application message/code. Errors without an HTTP response, including network timeouts, may still have no upstream status to log. All paths are relative to services/velani-ai.

CRITICAL, HIGH, MEDIUM, LOW findings: none. Applied previously loaded remove-ai-slops and programming criteria. The new test exercises the actual SDK error shape and verifies sensitive properties are discarded. No material violations found.

Independently passed typecheck and 45 engine/API tests. No model calls or deployment performed during review. Parent reports three attempts and $1.507388 reserved, including two unsuccessful attempts. The reservation amount is an upper bound. Spanish answer acceptance and verification of hosted diagnostic output remain pending.

codeQualityStatus: CLEAR
recommendation: APPROVE for deploying the reviewed diagnostic patch
blockers: []

## Diagnostic hints and comparison review at c78ff7d

Reviewed 9a976e6...c78ff7d. The engine inspects at most 4096 characters of the gateway error message and emits only a fixed diagnostic enum or undefined. The server alone gets the hint. Gateway messages can echo request text, so a label gives a hypothesis and cannot establish the cause of a 400. The selected evaluation model is explicit and determines catalog lookup. Both configured choices use the same exclusive checkout ledger. This patch makes no automatic model switch. Inspected ledger metadata: five attempts with $2.104418 reserved out of $3, leaving $0.895582 of unreserved allowance at inspection. Existing ledger prevents a fresh suite invocation. No paid review calls.

Typecheck and 35 focused engine/budget tests passed independently. Applied the previously loaded programming/remove-ai-slops criteria. The diagnostic has a real operational need and the tests cover classified, unknown and redacted outcomes. No material violation. CRITICAL/HIGH/MEDIUM/LOW findings: none. codeQualityStatus CLEAR, recommendation APPROVE, source blockers []. Hosted Spanish workflow and injection behavior require separate evaluation. Retain the combined failures as evidence.

## Completion limit review at 4ac2754

The actual chat request now caps completion at 6000 tokens. The bounded evaluator reserves the request's actual max_completion_tokens and persists the reservation before transmission (evaluate-rondo.ts:82). Its preliminary probe at line 69 still uses 3000, but cannot authorize or transmit inference. Ledger inspected at $2.682939 reserved across ten attempts, leaving $0.317061. The proposed $0.13 reservation would fit if its bound is recomputed for the actual request and persisted before sending. No paid reviewer calls. Existing answer validation stays intact. A larger global chat limit raises potential cost per live turn on both models. It does not show the combined HTTP 400 cause.

MEDIUM: scripts/compare-models.ts:52 records maxCompletionTokens: 3000 while the shared ModelEngine now issues 6000. Comparisons through that script would misreport their test conditions. Update before relying on that script's reports. LOW: stale 3000 in preliminary budget probe understates the minimum feasible call size, although the transmission guard uses the correct amount. CRITICAL/HIGH: none. Required skill perspectives reviewed. Contract test observes an actual provider request option. Independently passed 35 engine/budget tests. codeQualityStatus WATCH, recommendation APPROVE controlled bounded retest, blockers []. Actual behavior on the original combined case remains pending.

## Re-review at 1c316dc

Both previous stale-limit findings are resolved. The comparison metadata and evaluator preflight now import the same 6000-token limit that the engine places in its request. The evaluator's client and engine deadlines both use 75 seconds and actual transmission still requires reserving the requested limit. Typecheck passed. Ledger inspection confirmed $2.812445 reserved of $3 across 11 rows including $0.129506 marked reserved_before_submission. Remaining unreserved allowance was $0.187555. No paid reviewer calls. The reserved experiment had no observed result at inspection. CRITICAL/HIGH/MEDIUM/LOW findings: none. Required skill perspectives checked, no material violation. codeQualityStatus CLEAR, recommendation APPROVE, source blockers [].

## Runtime rollback and error contract at 759a44d

Reviewed 1c316dc...759a44d. The engine restores the shared 3000-token ceiling and the bounded evaluator restores 45-second deadlines. The application maps sanitized ModelError status 400 to HTTP 503 with provider_request_rejected and a rephrase suggestion. It omits Retry-After for that branch, retains lease cleanup and keeps upstream status, hint and raw error details out of the public response. This review verified local API behavior. The underlying reason for the reproducible compound rejection remains unknown.

Typecheck and all 52 focused engine, API and budget tests passed independently. Required skill perspectives applied. The new HTTP regression checks an observable contract and a failed-turn side effect. No material violations. No source findings at CRITICAL/HIGH/MEDIUM/LOW. codeQualityStatus CLEAR, recommendation APPROVE, blockers []. Ledger inspection confirmed 11 attempts, six received and five failed, with $2.812445 reserved out of $3 and measured billing unavailable. I made zero paid requests. The seven rubric verdicts on five successful GPT-6.1 replies stand separately from the combined scenario's five failures. Hosted deployment of this rollback was outside this review.
