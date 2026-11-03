# Assistant launch status — 2026-11-03

Target: Vercel project `velani-ai` (`prj_E1Vl2AEpTlJlBam4MTKG7oEHB7x2`), team `team_Lzbw410WwXGWHTuUXuamRI1N`, service origin `https://velani-ai.vercel.app`.

## Completed

- Installed the existing restricted `DATABASE_URL` as a **sensitive** Vercel variable for **production and preview**.
- Installed the existing `AI_API_KEY` as a **sensitive** Vercel variable for **production and preview**.
- Confirmed both keys exist through Vercel metadata without decrypting them.
- Preserved the previously configured `SESSION_HASH_SECRET`; no credential rotation was performed.
- Independently verified database connectivity as role `velani_ai_app` to database `velani_ai`.
- Independently verified gateway authentication and availability of the configured model.
- Preserved Claude's `npm ci --include=dev` build fix from commit `55c17ab`.

No secret values are included in this document, repository or ordinary handoff artifacts.

## Remaining gate: Cloudflare token permissions

The owner supplied a Cloudflare API token directly and authorized using it. The token successfully lists the account and its Turnstile widgets; the account had no widgets. Creating the Managed widget returned HTTP 403 with Cloudflare error `10000`, `Authentication error`. No widget or Turnstile key was created, and no secret values were logged or committed.

Update the same token in Cloudflare **My Profile → API Tokens → Edit** to grant **Account → Turnstile → Edit** for the intended account. Read access works; the create operation is not authorized by the current token. Alternatively, the owner can create the widget in the Turnstile dashboard and install its keys directly in Vercel.

Intended widget: `Velani website assistant`, Managed mode, `no_clearance`, domains `www.thevelani.com`, `thevelani.com`, `x19hvn-ar.myshopify.com`, and `velani-ai.vercel.app` (for a standalone guide test). Install `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` in the same Vercel project's production and preview environments; store the secret as sensitive. Add the standalone Vercel origin to `ALLOWED_ORIGINS` before testing that guide; preserve the three existing origins.

After these keys exist, redeploy the reviewed backend branch or its known ready deployment (`dpl_BtssgR3pAtgB6MXkoKrWCrCJjHBq`) to the same project. Do not deploy the repository's main branch, which does not yet contain this service. Validate `/health/live`, `/health/ready`, `/v1/config`, real Turnstile verification and a cited answer. Missing/invalid CAPTCHA must remain rejected. Do not disable the production CAPTCHA requirement.

## Website state changed

The website widget source is on branch `claude/velani-night-nevora-setup-k9sbcy`. Shopify Admin GraphQL now reports theme `192986808634` as **MAIN**, updated `2026-11-03T01:25:31Z`; it is no longer an unpublished preview. Its settings have `inquiries_enabled: true` and no `assistant_api_url`. The public homepage omits the assistant while that setting is absent.

The repository's `AGENTS.md` permits changes only to UNPUBLISHED themes. Alternative theme `192990773562` (`Velani interaction fixes (preview)`) was confirmed **UNPUBLISHED** and already includes the widget assets, layout and setting schema. Its preview is https://www.thevelani.com/?preview_theme_id=192990773562. Re-read its exact role and settings immediately before any write, and set `current.assistant_api_url` to `https://velani-ai.vercel.app` after backend validation. Preserve all other settings. Do not apply this change to theme `192986808634` under the current repository instructions. No live theme changes were made in this setup.

## Verification

- Vercel environment metadata confirms `DATABASE_URL`, `AI_API_KEY`, and `SESSION_HASH_SECRET` as sensitive for production and preview.
- `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` remain absent.
- Public `/health/live`, `/health/ready`, and `/v1/config` each still return HTTP 503 `service_unavailable`, as expected while required production configuration is incomplete.
- Static integration review found no blocking mismatch: the widget uses the matching config, session, chat and delete endpoints, `velani-session` Turnstile action, UUID request IDs and an in-memory bearer token.
- No redeployment was triggered with incomplete settings. Successful browser chat has **not** been demonstrated.
