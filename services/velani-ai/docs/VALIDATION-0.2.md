# Release 0.2 validation

Validated on 2026-11-02. This is a development release; no production Shopify changes or hosting deployment were performed.

- TypeScript typecheck and compiled build passed.
- 110 automated tests passed across API, database, model-contract, plan-generation and static-file coverage. PostgreSQL integration cases ran against isolated local schemas and were not skipped.
- The production dependency audit reported zero vulnerabilities after removing an unnecessary static-serving dependency. Public files are now registered from the public directory only, with tests for private-file and traversal rejection.
- Migrations 002 and 003 were applied to the existing isolated development Neon project. The restricted runtime role successfully created profiles/plans and saved an explicitly consented plan snapshot.
- Real English and Spanish API smoke tests verified plan generation, original profile context, corrections from three to four locations, editable actions/notes, Markdown export, consented sharing and deletion. Their synthetic records were cleaned up.
- The model comparison completed six valid conversational cases each for GPT-6.1 and GPT-6 Astra. The Claude candidate returned HTTP request errors and could not be ranked for answer quality. See the comparison report for the exact method and limits.
- Both candidates produced valid English and Spanish structured plans. Release 0.2 selects GPT-6 Astra provisionally for chat and plans, based on its slight practical preference in the conversational review and successful plan checks. This is not a claim that it is universally best.
- Real Chromium testing used the selected Astra configuration and the live Neon database. It verified plan generation, the saved original brief, a corrected business profile in plan-aware chat, editing, download, two explicit sharing consents, successful enquiry storage, EN/ES UI, deletion, empty local/session storage, and rejection of private file requests.
- Browser layouts were checked at 1440, 390 and 320 pixels; no horizontal overflow occurred. The frontend also passed mocked regressions for failures/retries, expiry, stale profile regeneration and in-dialog enquiry retry.
- The Docker image built with the frontend and administrative scripts included. Its non-root runtime served the guide successfully and its readiness endpoint connected to Neon successfully.

The browser test's factual follow-up is useful evidence of memory: after the visitor changed the saved location count to four, Astra recognized that the older plan still named three cafés, suggested specific updates, and noticed that the saved challenge text also retained the older count. It did not claim to have changed the plan itself.

## Evidence

- `guide-browser-test.json`: selected-model live browser plan and follow-up.
- `guide-desktop.png`: initial desktop guide.
- `guide-plan-desktop.png`: generated plan in the desktop UI.
- `guide-plan-mobile.png`: mobile UI after a language switch; an existing generated plan retains its original language until regenerated.
- `example-workflow-plan.md`: actual downloaded synthetic plan including visitor edits.
- `model-comparison.md` / JSON: bounded conversational comparison.
- `plan-model-comparison.md` / JSON: structured-plan comparison.

## Practical limits

These are small synthetic evaluations, not production usage or a comprehensive model benchmark. Generated advice and product claims still need review. Owner verification of current commercial/product facts, published privacy text, a production retention schedule, spending controls, hosting and Shopify integration remain release tasks. The public guide has no employee-data access and implements none of the proposed authenticated workforce copilots.
