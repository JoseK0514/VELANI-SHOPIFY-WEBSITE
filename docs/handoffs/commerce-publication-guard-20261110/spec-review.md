# Spec review: commerce publish guard

codeQualityStatus: CLEAR
recommendation: APPROVE
blockers: []

Reviewed uncommitted render/test changes against6bb6dd5. No application edits.

CRITICAL: None. HIGH: None. MEDIUM: None.

LOW advisory: tests cover main and unpublished but not development or missing/unknown roles. Add those boundary cases when convenient; inspection confirms the explicit allowlist currently fails closed for unknown roles.

Spec: “Before any publish, clear commerce_api_url.” `src/render.mjs:312` is a scoped additional safeguard: main/unknown renders an empty data-api; unpublished/development keeps the configured preview API. `src/night/commerce.js:39-40` refuses network calls when unconfigured and its handoff flow shows unavailable with recovery guidance. The guard does not clear the persisted theme setting; that remains a separate prepublication requirement. It also intentionally disables all live-theme billing, including a future production endpoint, until this safeguard is deliberately revised for production activation.

Independently ran `node --test tests/commerce-publish-guard.test.mjs`:8 passed. Did not independently rerun the reported53-test suite/build/theme check or observe hosted Shopify behavior. Tests render actual Liquid through the installed engine and assert output behavior, rather than matching the source guard text.

Previously loaded remove-ai-slops/programming perspectives applied: no deletion-only/tautological tests or needless production normalization/abstraction. Scope is one expression plus behavioral tests. ULW plan missing; fallback report used.
