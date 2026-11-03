# Model comparison for the Velani assistant

Date: 2026-11-02. This was a bounded comparison of three model IDs returned by the configured Neon AI Gateway catalog. No database or user records were accessed. All inputs were synthetic.

## Recommendation

**GPT-6 Astra is a reasonable quality-first candidate for the expanded adviser**, subject to separate live validation of the new structured plan generator. An independent reviewer, blinded to model identity and timing, slightly preferred its practical focus in three of six cases and rated the other three as ties. The current GPT-6.1 model also passed every substantive criterion. This sample does not establish a large quality gap or a universally smartest model.

The comparison script did not change the application model setting. Model choice for the release belongs in explicit server configuration, and the new PlanModelEngine contract must be tested with that choice before use. These trials exercised conversational ModelEngine, not structured plan generation.

## Results

| Model | Valid answers | Provider failures | Median successful latency | Successful range |
| --- | --- | --- | --- | --- |
| `gpt-6-1-sol` | 6 / 6 | 0 | 8.94 seconds | 4.26–13.08 seconds |
| `gpt-6-astra` | 6 / 6 | 0 | 8.85 seconds | 6.10–14.82 seconds |
| `claude-opus-5-5` | 0 / 6 | 6 | Not applicable | Not applicable |

Both working candidates produced valid cited response objects and respected every requested action constraint. No blocking factual, reasoning or consent issues were found in the twelve successful answers by either reviewing agent.

Claude Opus 5.5 was present in the model catalog, but all six calls returned the application's sanitized `provider_unavailable` error quickly. Its reasoning quality therefore could not be evaluated. Catalog presence does not by itself prove a model is usable through a particular gateway and request contract. One additional authorized direct-SDK diagnostic using the same request contract returned HTTP 400, with no error code or parameter. This confirms a request/API-layer rejection but does not identify the exact field or cause. No adapter or parameter workaround was attempted, and no conclusion that Claude is less intelligent is supported. The comparison contained 18 calls; this diagnostic was a separate nineteenth request.

Observed latency was essentially tied by median and is not a controlled performance benchmark. Costs and provider token usage were not measured.

## Tasks and qualitative review

1. **Constraint feasibility:** both models correctly found that a worker required to transfer between two continuously staffed stores cannot do so without a 30-minute coverage gap. Astra proposed two minimally disruptive pauses; GPT-6.1 proposed one pause and a more disruptive full-store closure as a second option. Slight practical preference for Astra.
2. **Corrected Spanish business facts:** both used the updated three-store, eighteen-person, Wednesday-approval context instead of outdated conversation facts. Both gave three assigned steps with no new software or lead pressure. Tie.
3. **Calculation versus unsupported price:** both calculated a $960 four-week administrative-cost baseline and refused to invent pricing or guaranteed savings. Astra expressed the $672 total-cost ceiling for a hypothetical 30% saving more directly. Slight preference for Astra; GPT-6.1's framing was also sound.
4. **Conflicting current evidence:** both recognized equally current contradictory documents and declined to confirm general availability or the synthetic $39 claim. Tie.
5. **Two-week operational plan without software or sales:** both gave responsibilities, backup approval roles, two measures and practical steps under 350 words. Each handled different useful edge cases. Tie.
6. **Demanding Spanish follow-up:** both preserved Gusto, accurately limited language/integration/compliance claims and asked one useful question. Astra's bottleneck question more directly targeted the user's manual-review problem. Slight preference for Astra.

The Spanish comparison answers use plain pipe-separated rows. In the current text-only answer renderer these are readable text, not true table cells. Typed table content would improve presentation without allowing arbitrary model HTML.

The evidence-conflict test intentionally injected a fake current availability document into that case only. Its price and launch claims are **not real product facts**, were not seeded to the knowledge database, and must not be copied into marketing material.

## Method and limits

The test used the same application prompt, reviewed locale knowledge, JSON response contract, 3,000-token completion limit, 90-second deadline and zero automatic retries for all three models. Calls were sequential and interleaved by case. Provider default reasoning settings were left unchanged; defaults may differ across models. The report records source/prompt hashes and complete synthetic inputs and outputs.

Each model received only one trial per case. The sample is small, selected and not a held-out production study. The independent review concealed model names and timing, but was performed by an agent, not a human business owner. Valid JSON and real citation IDs do not prove every natural-language claim. This run is useful release evidence, not a general intelligence ranking or guarantee.

[Full inputs, outputs, timing and review notes](model-comparison-results.json).

## Reproduce

```sh
NODE_OPTIONS=--use-env-proxy npx tsx --env-file=.env scripts/compare-models.ts --run
```

The proxy flag is only needed in environments requiring an outbound proxy. The CLI requires `AI_API_KEY` and `AI_BASE_URL`, verifies the requested model IDs in the catalog, limits each run to 18 calls, and saves output under `artifacts/` by default. It makes real model requests. Use `--list` to inspect scenarios without credentials or model calls. Optional `--models=id,id`, `--case=case-id` and `--out=path.json` bound a rerun.

The CLI exits nonzero when a provider or response-contract failure occurs, including the Claude failures recorded above. It does not manufacture a passing result, silently substitute another model or change `.env`.
