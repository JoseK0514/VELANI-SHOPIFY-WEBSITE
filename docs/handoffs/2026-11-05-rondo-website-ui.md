# Rondo website chat: UI finished, installed on an unpublished preview

## Latest status (end of 2026-11-05)

**The theme to publish is `193106706746` "Velani Rondo + fixes (preview)", role `UNPUBLISHED`.** Preview: https://www.thevelani.com/?preview_theme_id=193106706746. It contains everything below plus the later work on this branch. `assistant_api_url` is set and `inquiries_enabled` is unchanged.

1. **The repository matches the live site again** (`ba6e76b`).
   - Every change made directly in Shopify since `9d291b8` is ported into source.
   - `scripts/check-live-parity.mjs <snapshot>` builds the theme and compares it with a downloaded snapshot of `193103921466`: 76 of 77 files are identical or accepted. The one remaining difference is intentional: the contact page's "Back to home" link now uses the renderer's standard `routes.root_url` form, which goes to the same place.
   - The share images and their generator script are now in the repository.
   - **From now on, change the site in the repository and deploy the build. Don't hand-edit Shopify.**
2. **Inspection fixes** (`a993a15`):
   - **Trial form:** choosing "More than 30 (by quote)" turns the page into a quote request (heading, button, topic, a short note) and keeps what was typed.
   - **Plans, Help and Contact:** the trial now ends in one of two ways, continue by quote or close the workplace, with export as the step before closing.
   - **Rondo:** labelled "In development" in both menus. "Ask Rondo" on the NEVORA page opens the chat. The chat note asks people not to share passwords, payment details or employee records.
   - **Products:** links that only describe a service say "Explore"; Relay's button says "Join the waitlist"; the page has its own search description; the contact topic is now "NEVORA Relay waitlist".
3. **Checks on `193106706746`:**
   - Hosted fixes: 24/24 in Chromium and WebKit at 1440 and 390.
   - Hosted Rondo free checks: 78 pass, plus the same 2 mid-scroll observations on the phone contact page.
   - Crawl of all 17 pages in both engines at both sizes: no sideways scroll, broken images or page errors.
   - Locally: 34 unit tests, theme check clean, Rondo UI 166/166, inspection fixes 44/44.
   - Evidence is in `evidence/hosted-193106706746-2026-11-05/` and `evidence/inspection-fixes-2026-11-05/`.
4. **Rondo end-to-end** passed in Jose's Safari on `193103921466` (details below). The new theme uses the same chat code, apart from the added privacy line and the "Ask Rondo" page button.
5. **Codex** (`docs/handoffs/2026-11-05-claude-to-codex-rondo-launch.md`):
   - **Retention is not scheduled, and this is a launch blocker.** Deletion only happens when someone runs `npm run retention -- --apply`.
   - A knowledge refresh: `rondo-knowledge-proposed-2026-11-05.json` has 6 updated documents and 2 new Relay documents.
   - A sync of the reference client.
6. **Waiting on Jose:**
   - publishing the theme, after Codex schedules retention;
   - a starting price or price guidance;
   - client results for case studies;
   - the real About team;
   - Spanish site copy;
   - a WhatsApp number, if wanted;
   - a trademark check on "Rondo" and "Relay";
   - a final legal and consent review of the chat wording.
7. **Sitemap.** Plans isn't in Shopify's page sitemap yet. Its page ID is newer than the cached sitemap range, and the page isn't hidden. Recheck after Shopify regenerates the sitemap, and submit the sitemap in Google Search Console if it doesn't appear.

---

Claude, 2026-11-05. This updates `services/velani-ai/docs/CLAUDE-UI-START-HERE.md` (backend branch `codex/rondo-backend-readiness-20261104` at `d6ed79f`) for the UI side. Backend, database, models and credentials were not touched.

## Where it is

| Item | Value |
| --- | --- |
| UI branch | `claude/rondo-website-ui-20261105`, based on `claude/velani-night-nevora-setup-k9sbcy` (`9d291b8`) |
| Unpublished theme | **193103921466** "Velani Rondo chat (preview)", role `UNPUBLISHED`, copied from MAIN `193100644666` |
| Preview URL | https://www.thevelani.com/?preview_theme_id=193103921466 |
| Setting changed | `current.assistant_api_url = "https://velani-ai.vercel.app"` (only change; `inquiries_enabled` untouched) |
| MAIN theme | `193100644666`, not modified, not published |

Preview enquiry delivery stays off: the contact page renders the real Shopify form only when `theme.role == 'main'`.

## What changed in the UI

Files: `src/night/assist.html`, `src/night/assist.js`, `src/night/assist.css`, `src/night/velani-assistant.js` (plus the built copies in `public/assets/`).

- **Identity.** Launcher "Ask Rondo" with the R mark used by the home page chat card. Panel title comes from `/v1/config` `assistantName` (validated), subtitle "AI adviser · Velani and NEVORA". Welcome: "Hi, I'm Rondo", what to ask, three suggestions, and a scope line: Rondo cannot see employee accounts or make changes, bookings or payments.
- **Language.** EN/ES toggle in the header, always available. Before a conversation it switches at once. During a conversation it asks first, deletes the current conversation on the server (authenticated `DELETE /v1/session`), then starts a fresh session in the new locale.
- **Honest loading.** "Rondo is thinking…" while the request is in flight. After 10 s: "Still working. Answers can take up to 45 seconds." While Cloudflare verification is pending it says "Waiting for the verification below…" instead (bug found on the hosted preview and fixed).
- **Errors.**
  - `provider_request_rejected` (503) is no longer treated as retryable: the panel offers **Edit question**, which puts the words back in the box. Sending the edited text uses a new UUID. Nothing is resent automatically.
  - `turn_in_progress` (409) now says the previous message is still being answered.
  - 429 counts down from `Retry-After` before Retry is enabled.
  - 401 (expired) returns the question to the box and starts a new session on the next send.
  - Service failures offer Retry and the contact page.
  - A `/v1/config` failure disables the box and offers Retry and the contact page.
  - A genuine Retry reuses the identical request ID and payload (`retryLastRequest`).
- **Safety.** Answers are inserted as text only. Source links must pass `safeSourceUrl` (HTTPS `thevelani.com` / `www.thevelani.com`) and have a title; they open in a new tab with a screen-reader note. Actions go only to existing routes: `/pages/nevora#try`, `/pages/contact?interest=nevora`, `/pages/nevora-support`, `/pages/contact`.
- **Keyboard and layout.**
  - Escape closes the delete/switch confirmation first, then the panel. Focus returns to the launcher.
  - On phones the panel is full screen with `aria-modal`, and Tab wraps inside it in every engine (Safari's Tab skips buttons by default, so the wrap is done in script).
  - On phones the launcher stays off the first screen, because the hero actions and the "Scroll to NEVORA" cue sit at its bottom edge. It appears once the visitor scrolls, and steps aside while a page form field has the keyboard.
- **Client change for Codex.** `src/night/velani-assistant.js` now differs from `services/velani-ai/integration/velani-assistant.js`: two messages (`rejected`, `inprogress`) and the error mapping above. Please copy it into the reference client when convenient.

## Checks actually run

| Check | Result |
| --- | --- |
| API `GET /health/live`, `/health/ready`, `/v1/config` | 200, 200, 200 (`assistantName: Rondo`, `requireCaptcha: true`, public key present) |
| CORS preflight from `https://www.thevelani.com` | 204 with exact `Access-Control-Allow-Origin` |
| Session without CAPTCHA / chat without session | 400 `invalid_request` / 401 `session_required` |
| `npm test` | 34 passed, 0 failed |
| `npm run check:theme` | clean |
| `scripts/checks/rondo-ui.mjs` (stand-in API and stand-in Turnstile; Chromium and WebKit; 1440 and 390) | **166 passed, 0 failed**. Covers welcome, suggestions, session with fresh token, answer, sources (unsafe dropped), actions, text-only rendering, follow-up reusing the session, duplicate-submission guard, 503 retry with identical ID/payload, 429 countdown, 409, provider rejection → edit with new ID, slow-answer text, verification-waiting text, Escape/focus, phone focus wrap, mid-conversation language switch with server delete, Spanish answer, expiry, delete confirmation, config failure and recovery, axe clean on the open panel, no page errors |
| `scripts/checks/rondo-hosted-free.mjs` on the real unpublished preview (Chromium and WebKit; 1440 and 390) | **78 passed, 2 observations**. The page reports theme `193103921466` `unpublished`; launcher visible with no first-view overlap on Home, NEVORA, Plans, Contact, Products; real config across origins; Escape and focus; real Turnstile widget renders with the configured key; no session without a token; **no `/v1/chat` request left the browser** (blocked locally, so no AI cost). Observations: on the phone contact page, after one full screen of scrolling, the floating launcher sits over the support email link until the page scrolls further, which is normal for a floating button. Third-party noise ignored: Shopify preview 401s, Cloudflare iframe console probes. |

Evidence: `evidence/rondo-ui-2026-11-05/` (results.json, screenshots), `evidence/rondo-hosted-2026-11-05/` (results, screenshots, including the failed pre-fix capture), `evidence/shopify/193103921466-rondo-chat/` (before/after files; the original `settings_data.json` checksum on Shopify was `0cb17f68d4cb4ba956308ed29ad5e9a1`, after `3f31c18bc5cbcc079716e4d3000dd283`).

## End-to-end acceptance on the hosted preview (human check, 2026-11-05)

Jose approved $1.05 of additional paid testing (on top of the $2.812445 already reserved of the earlier $3). It was capped at four questions; **three were used, all answered, none failed**. Actual provider billing was not measured.

| Step | Result |
| --- | --- |
| App's built-in browser (Claude desktop) | Cloudflare showed "Verify you are human"; the person's tick was rejected ("verification failed"); the browser identifies itself as Claude. Panel showed the correct timeout state ("Complete the verification, then retry." with Retry/Discard). No session, no chat, nothing billed. Evidence: `app-browser-364-verification-timeout-state.jpg` |
| Jose's own Safari, desktop, preview `193103921466` | Real Turnstile verification passed and a real session was created |
| English question: "How does the free NEVORA trial work for a café with 12 employees?" | Answered; source "Trial, setup, pricing and end-of-trial choices"; action "Ask for a quote" |
| Context follow-up: "What happens to our data if we don't continue after that?" | Answered and explicitly referred to the trial and "your café's workplace"; same source; no action |
| ES switch mid-conversation | Confirmation, server deletion of the English conversation, new Spanish session |
| Spanish question: "¿Cómo funciona el reloj de entrada en una tableta compartida?" | Correct Spanish answer (4-digit PIN at a shared tablet, separate from the portal password; public sample clock stores nothing); source "Reloj compartido con PIN, idiomas y límites de la demostración" opened https://www.thevelani.com/pages/nevora in a new tab. Evidence: `human-safari-1440-spanish-answer.jpg` |
| Delete (trash, then Eliminar) | Conversation cleared; "Conversación eliminada." shown; welcome returned. Evidence: `human-safari-1440-after-delete.jpg` |

Steps 2–6 were run by Jose. Claude read the results from Safari screenshots (read-only) and Jose's report; network status codes from that browser were not captured. The English exchange was deleted by the language switch before Claude could screenshot it, so the English results rest on Jose's report. Not covered by the human pass: a phone-sized real device, keyboard-only use in Safari, and the provider-rejection path (covered by the stand-in tests only).

## Before public launch

- **Retention and consent.** The panel says conversations are kept for up to 30 days, which matches the website privacy notice. The retention job's schedule is not yet confirmed operationally, and the consent wording has not been reviewed (backend handoff). Confirm both before publishing this theme.
- **Knowledge sync.** The live site now has NEVORA Relay (coming soon), "Request free trial" wording, and a trial confirmation page. The 14 knowledge documents predate these. Review them before launch (due 2026-12-02 at the latest).
- **Repository drift.** The live Shopify theme carries changes made directly in Shopify since `9d291b8` that are **not** in this repository:
  - client-work viewer and phone crops;
  - "trial" wording;
  - per-page share images;
  - Rondo nav link and NEVORA section;
  - Products dropdown;
  - Relay panel and contact topic;
  - home light reveal;
  - "Request free trial" and the sent confirmation.

  This commit therefore changes only the assistant files. The theme files were edited by splicing the assistant block into the live versions (see `evidence/shopify/193103921466-rondo-chat/after/`). **Do not deploy a full `npm run build` theme over the live theme until the repository is reconciled**, or those changes will be lost.

## Rollback

- Set `assistant_api_url` back to empty (or restore `before/settings_data.json`) on `193103921466` to hide the panel.
- The theme is unpublished, so the live site is unaffected either way.
