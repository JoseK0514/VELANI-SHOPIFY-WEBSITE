# Shopify assistant activation

Status checked on 2026-11-03. These are activation instructions, not a record of completed activation. No Shopify setting was changed during this review. The API is `https://velani-ai.vercel.app`.

## Target and current state

| Theme | Verified role | Assistant setting |
| --- | --- | --- |
| `192990773562` — Velani interaction fixes (preview) | `UNPUBLISHED` | `assistant_api_url` absent |
| `192986808634` — Velani pre-launch review fixes (preview) | `MAIN` | `assistant_api_url` absent |

Use **192990773562** for preview acceptance. Its widget assets, layout integration and AI assistant setting schema are already present. Its current `config/settings_data.json` contains `current.inquiries_enabled: true` and an empty `presets` object. The contact Liquid renders the real inquiry form only when both `settings.inquiries_enabled` and `theme.role == 'main'`; the unpublished preview therefore does not deliver inquiries.

**Do not change or publish the MAIN theme as part of these instructions.** Repository `AGENTS.md` says: “Only UNPUBLISHED Shopify themes may be created/changed. Read exact target role before writes.” It also says: “Keep preview inquiry delivery disabled and label preview outcomes truthfully.” The theme name containing “preview” is not evidence of its role. The former preview `192986808634` is now the live theme.

Preview URL: https://www.thevelani.com/?preview_theme_id=192990773562

## Backend prerequisite

The Cloudflare management token supplied for setup could list Turnstile widgets, but widget creation returned HTTP 403 / code 10000. Grant the setup token the Cloudflare **Account → Turnstile → Edit** permission for the intended account, then create a managed widget. The setup API token is not a runtime credential and does not belong in browser code or Vercel runtime variables.

Allow these widget hostnames: `www.thevelani.com`, `thevelani.com`, and `x19hvn-ar.myshopify.com`. Install the widget's public site key as `TURNSTILE_SITE_KEY` and its secret as `TURNSTILE_SECRET_KEY` in the Vercel environments being deployed. Keep secrets in the hosting credential store; do not place them in this document, source, logs or chat. Retain the existing database, AI and session-signing configuration. Redeploy after updating Vercel variables.

Before enabling the widget, require:

1. `GET /health/live` returns 200 and `{ "status": "ok" }`.
2. `GET /health/ready` returns 200 and `{ "status": "ready" }`.
3. `GET /v1/config` returns 200, `requireCaptcha: true`, and a nonempty `turnstileSiteKey`. This endpoint must expose only public configuration.
4. The config request and chat preflight work from the exact website origin. Vercel must retain allowed origins `https://www.thevelani.com`, `https://thevelani.com`, and `https://x19hvn-ar.myshopify.com`.
5. A session request without a CAPTCHA token is rejected. Do not disable the production CAPTCHA requirement or substitute test keys to obtain a green result.

## Read immediately before writing

The Shopify connector requires schema discovery and GraphQL validation before executing each operation. The query and mutation below were built from the Admin schema and submitted to its validation tool; that tool reports that final validation occurs during execution.

Inspect `QueryRoot`, `OnlineStoreTheme`, `OnlineStoreThemeFileConnection`, `OnlineStoreThemeFile`, `OnlineStoreThemeFileBodyText` and `PageInfo` if starting a fresh tool session, then validate and run:

```graphql
query AssistantActivationTarget($id: ID!) {
  theme(id: $id) {
    id
    name
    role
    updatedAt
    files(first: 10, filenames: ["config/settings_data.json"]) {
      nodes {
        filename
        checksumMd5
        body {
          ... on OnlineStoreThemeFileBodyText { content }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
}
```

```json
{ "id": "gid://shopify/OnlineStoreTheme/192990773562" }
```

Proceed only if the returned ID is exact and its role is `UNPUBLISHED`. Save the complete original file and checksum as rollback evidence. Preserve its generated-file comment and every existing setting. Build the replacement from this fresh content by adding or updating only `current.assistant_api_url` to `https://velani-ai.vercel.app` with no trailing path. If the content changes before the write, regenerate from the new content; the mutation has no checksum precondition.

## Prepared mutation — not yet executed

Discover `Mutation`, `OnlineStoreThemeFilesUpsertFileInput`, `ThemeFilesUpsertPayload`, `OnlineStoreThemeFileOperationResult` and `OnlineStoreThemeFilesUserErrors`, then validate:

```graphql
mutation EnableAssistant(
  $themeId: ID!
  $files: [OnlineStoreThemeFilesUpsertFileInput!]!
) {
  themeFilesUpsert(themeId: $themeId, files: $files) {
    upsertedThemeFiles { filename checksumMd5 }
    userErrors { field message filename }
  }
}
```

Variables shape below is illustrative. Replace `value` with the entire freshly read file, preserving its comment and all other settings. Do not send the shortened sample as a blind overwrite.

```json
{
  "themeId": "gid://shopify/OnlineStoreTheme/192990773562",
  "files": [
    {
      "filename": "config/settings_data.json",
      "body": {
        "type": "TEXT",
        "value": "{\n  \"current\": {\n    \"inquiries_enabled\": true,\n    \"assistant_api_url\": \"https://velani-ai.vercel.app\"\n  },\n  \"presets\": {}\n}\n"
      }
    }
  ]
}
```

Require no `userErrors`, then re-run the read query. Confirm the role remains `UNPUBLISHED`, the API address is exact, and no other JSON value changed. The same one-file mutation can restore the backed-up content if acceptance fails, after rechecking the target role and concurrent settings changes.

## Browser acceptance

Test the hosted preview, not only a local harness. Confirm `Shopify.theme.id` is `192990773562` and its browser role is `unpublished` before interacting. Shopify can remove the preview query during navigation; confirm the actual theme rather than relying on the address bar.

The inspected `src/night/assist.js` and `src/night/velani-assistant.js` on `claude/velani-night-nevora-setup-k9sbcy` match the backend's session, chat and deletion contract. The startup sequence is:

1. Layout emits `#ast-root[data-api]` and loads `assets/velani-assist.js` when the setting is nonempty.
2. Opening `#ast-launch` displays `#ast` and fetches `/v1/config`.
3. First send renders Turnstile at `#ast-turnstile` with action **`velani-session`**.
4. The browser posts `{ "locale": "en", "captchaToken": "…" }` to `/v1/sessions`. The API returns a session ID, expiry and bearer token; keep the token private and in memory only.
5. It posts `{ "requestId": "<new UUID>", "message": "How does NEVORA’s time clock work?" }` to `/v1/chat` with that bearer token. Expect 200 with `message`, `sources` and `action`.
6. The panel renders `.ast-msg.ai`. Citations must resolve to public Velani HTTPS pages; answer text must not execute markup.

On desktop and a narrow touch viewport, verify open/close, keyboard focus, question entry, a real answer, a follow-up retaining context, readable sources and no horizontal overflow. On a fresh conversation choose Español before sending and verify Spanish output. Verify the demo action reaches the time-clock demo and the quote/support actions reach their expected pages; do not submit a real inquiry. Check that preview inquiry delivery remains disabled.

Use `#ast-clear`, then `#ast-confirm-yes` to delete the synthetic test conversation. Expect authenticated `DELETE /v1/session` to return 204, clear the log and allow a fresh conversation. Record status codes and UI outcomes without recording session tokens, CAPTCHA tokens or credentials.

If automated browsers cannot complete a genuine Turnstile challenge, report that limit and complete the human browser check; do not treat a stubbed challenge as hosted acceptance. A working API without a completed real browser challenge is not end-to-end acceptance.

The existing local widget test is `scripts/checks/assistant.mjs`. It uses an in-memory backend and a scripted CAPTCHA for functional coverage; it cannot prove production Turnstile validity. No launch-blocking wire-contract mismatch was found in this review, but the production browser path remains unverified until the backend and widget are enabled.
