# NEVORA Preview environment cleanup — 2026-11-08

**Complete:** removed `NEVORA_CLOCKER_UI_V2` only from Preview on branch `claude-codex-collab-nevora`, as explicitly requested by Jose.

## Exact resource

- Project: `nevora`, `prj_gGWZI2AJQoCXuvxCZhU67JHeToCK`.
- Team: `team_Lzbw410WwXGWHTuUXuamRI1N`.
- Removed variable ID: `DCbESEnVzMKpD6on`.
- Before: target `[preview]`, branch `claude-codex-collab-nevora`, type sensitive, no custom environment IDs.
- No Production copy was present in the complete metadata response; hiddenProductionEnvCount was 0.

The connected Vercel tool could not access this project (404). The existing authenticated Vercel CLI resolved the project by name, confirming the exact project/team IDs above. No new permissions or connection were created.

Deletion used the CLI's explicit project, environment and branch filters:

```sh
vercel env remove NEVORA_CLOCKER_UI_V2 \
  --environment preview \
  --git-branch claude-codex-collab-nevora \
  --project prj_gGWZI2AJQoCXuvxCZhU67JHeToCK \
  --scope josekarlo-5933s-projects --yes --json
```

Exit status 0. A fresh API metadata readback confirmed 33 variables became 32, exactly the intended variable ID disappeared, no variables were added, all other IDs/scopes/types/custom-environment metadata matched, and no `NEVORA_CLOCKER_UI_V2` entries remained. No variable values were decrypted, displayed or written into this handoff.

No application source, Production setting, domain, database or deployment was changed. No application test/build or redeploy was needed for this configuration-only cleanup. Jose supplied that the current app no longer reads this flag; this task verified removal and scope, not runtime behavior.
