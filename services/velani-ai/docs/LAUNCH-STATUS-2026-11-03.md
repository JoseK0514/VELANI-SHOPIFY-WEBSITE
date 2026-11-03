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

## Remaining gate

The Cloudflare connection is not authenticated yet. The owner must complete the secure connection flow before the Turnstile widget can be created.

Then create a Managed widget for `www.thevelani.com`, `thevelani.com` and `x19hvn-ar.myshopify.com`; install `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` directly in the same Vercel project's production and preview environments. Keep the secret sensitive. Add a Vercel/custom guide hostname to both widget domains and allowed origins only if using the standalone guide there.

After all four keys exist, redeploy the reviewed backend branch. Validate `/health/live`, `/health/ready`, `/v1/config`, real Turnstile verification and a cited answer. Missing/invalid CAPTCHA must remain rejected. Do not disable the production CAPTCHA requirement.

The website widget is on branch `claude/velani-night-nevora-setup-k9sbcy`, draft theme `192986808634`. Its `assistant_api_url` is still empty. Set that draft setting to `https://velani-ai.vercel.app` after backend validation and test on the preview theme. No live theme publication has been performed by this credential setup.

At the time of this note, no redeployment has been performed with the new variables because Turnstile is still pending; the currently running API still returns 503.
