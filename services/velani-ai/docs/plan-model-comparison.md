# Live workflow-plan model comparison

Evaluated on 2026-11-02: the existing `gpt-6-1-sol` baseline and `gpt-6-astra`, using the same declared business details and plan request. Each produced one English plan and one Spanish plan through the current `PlanModelEngine`. The task describes 42 people across three locations, existing spreadsheets, Friday hour approval, and no new software this month.

**Both produced useful, grounded plans in this small sample. No decisive quality winner was established.** This was an agent review of four responses, not a blind human comparison, repeated-trial reliability study or general model leaderboard.

## Observed quality

| Criterion | GPT-6.1 baseline | GPT-6 Astra |
| --- | --- | --- |
| Preserved team size, location count and Friday context | Yes | Yes |
| Honored the no-new-software constraint | Proposed changes to existing spreadsheet processes | Proposed changes to existing spreadsheet processes |
| Supplied practical ownership and a two-week sequence | Yes | Yes; especially explicit primary/backup review roles |
| Distinguished suggestions from documented product behavior | Yes | Yes |
| Preserved development status and unverified availability | Yes | Yes |
| Avoided unsupported payment, tax-filing or integration claims | Yes | Yes |
| Used natural Spanish | Yes | Yes |
| Explained a useful uncertainty | Current time-recording and payroll handoff details | Cross-location swap policy; Thursday pre-review explicitly identified as a suggestion |
| Blocking factual or usability problem found | None in these two plans | None in these two plans |

Both models supplied four correctly ordered, cited workflow stages and practical actions. Both kept scheduled time separate from actual reported hours and allowed later corrections. Neither proposed buying or migrating software this month. The Spanish plans adapted the language of the saved English profile while preserving its meaning.

The baseline's separate live chat check also recognized a saved profile correction from three locations to four, identified the plan as stale and suggested targeted updates. The Astra plan comparison did not test that chat behavior, so it is not scored as a model difference here.

## Timing

GPT-6 Astra plan generation took **25.7 seconds in English** and **26.8 seconds in Spanish**. The baseline smoke operation took 31.4 and 32.8 seconds respectively, but those measurements also include persistence, replay, editing, download, a saved-profile correction and a separate chat answer. **These timings are not directly comparable.** Provider usage cost was not collected.

## Evidence and limits

[plan-model-comparison.json](plan-model-comparison.json) contains the four real plan outputs, synthetic inputs for the candidate, review notes and measurement boundaries. No API keys or bearer tokens are included.

The baseline plans were read from the completed live API smoke artifact. Its first action owner was edited by that test; that field must not be treated as the baseline model's original wording. The baseline retrieval query also appends the saved challenge. All 12 current articles were included for both models, but retrieval ordering can differ.

Use this as an integration and quality signal alongside the conversation benchmark. Keep model selection configurable and expand the comparison to diverse businesses, conflicting requirements, long context and repeated trials before asserting superiority. The completed evidence does not justify claiming the system is the smartest possible or guaranteed accurate.
