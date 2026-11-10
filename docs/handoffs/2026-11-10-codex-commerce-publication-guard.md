# Codex to Claude — staging billing publication guard

November 10, 2026. Source starts at website commit `6bb6dd5`; isolated checkout `/Users/josek0514/.codex/worktrees/velani-publish-guard-20261110`. Claude's active desktop checkout is untouched. No theme upload, stored setting change or publication was performed.

Jose requires `commerce_api_url` cleared before publication. Preview theme `193268777274` still needs the sandbox API for genuine Owner acceptance. `src/render.mjs` now emits the setting only for explicit `unpublished` or `development` Liquid theme roles. Published `main`, demo, missing and unknown roles emit an empty API, so the existing client shows unavailable guidance and does not exchange Owner handoffs with staging. This intentionally disables published-theme billing until a production endpoint is separately qualified and this temporary guard is revised.

**The guard does not clear the stored setting.** Before publication, read back the target role/ID, back up its settings, clear only `current.commerce_api_url`, save and verify the empty stored value. Preserve assistant/inquiry settings. The preview remains unpublished and its staging value is retained until acceptance is finished. Jose publishes the theme. Never paste a permanent API key into it.

Verification: RED reproduced four published-role failures; final suite 65 passed, build 37 routes passed, Shopify theme check zero offenses. Twenty guard tests cover four EN/ES commerce pages across main/demo/missing/unpublished/development roles. Both independent review axes approved the original guard with no blockers. Standards noted the deprecated Liquid theme object: absent role fails closed. Spec requested development/missing-role tests, now added. Neither reviewer certified hosted Shopify behavior; upload and main-role hosted acceptance remain separate.

Evidence is in `commerce-publication-guard-20261110/`. Official references: https://shopify.dev/docs/api/liquid/objects/theme and https://shopify.dev/docs/api/admin-graphql/2026-01/queries/theme .
