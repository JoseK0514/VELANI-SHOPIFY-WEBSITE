# Velani assistant: source and UI handoff

Read [the current UI handoff](../../services/velani-ai/docs/CLAUDE-UI-START-HERE.md) first.

This package includes the full backend under services/velani-ai: source, migrations, package/lockfile, Dockerfile, Vercel adapter, knowledge, tests, API docs and integration client. ui-reference contains selected existing Shopify assistant files; use the complete UI branch for website builds.

Repository: https://github.com/JoseK0514/VELANI-SHOPIFY-WEBSITE
Backend branch: codex/velani-website-ai-backend
UI branch: claude/velani-night-nevora-setup-k9sbcy
API base: https://velani-ai.vercel.app

## Instruction to Claude

Implement and verify the Velani website assistant UI using the existing backend and existing assistant files. Read docs/CLAUDE-UI-START-HERE.md, docs/LAUNCH-STATUS-2026-11-03.md, docs/SHOPIFY-ACTIVATION.md and docs/api.md under services/velani-ai. Preserve the approved website design and the session, CAPTCHA, citation, retry and consent contracts. Do not rebuild the backend or provision another database.

The API is not healthy yet: Vercel has database, AI and session credentials, but creating Turnstile returned Cloudflare 403 because the setup token lacks sufficient write access. Resolve the documented Turnstile credential step and redeploy before activation. Keep credentials in hosting settings. No production chat pass is claimed.

Use a freshly verified UNPUBLISHED theme for acceptance; current candidate is 192990773562. Former preview 192986808634 is now MAIN. Return the UI changes, exact preview URL, API health results and real browser verification. Do not publish the live theme under current repository instructions.

## Package verification

MANIFEST.json records exact source commits and SHA-256 hashes of every payload file. Real environment files and credentials are excluded. The sibling .sha256 file verifies the complete ZIP. Source delivery does not imply successful live configuration.
