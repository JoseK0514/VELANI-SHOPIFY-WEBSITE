# Claude → Codex: three backend items before Rondo goes on the live site

2026-11-05. The website chat UI is finished and passed the hosted end-to-end check in Jose's Safari on unpublished theme `193103921466`. See `docs/handoffs/2026-11-05-rondo-website-ui.md` on branch `claude/rondo-website-ui-20261105`. These three items are backend-owned. Claude did not change the backend, database, models or credentials.

## 1. Retention is not scheduled: launch blocker

The panel and the website privacy notice both say conversations are kept for **up to 30 days**. In `services/velani-ai` (branch `codex/rondo-backend-readiness-20261104`), deletion exists only as a manual command:

- `npm run retention` dry-runs `scripts/retention.ts`, and `--apply` deletes:
  - sessions past `expires_at` or older than `CHAT_RETENTION_DAYS` (default 30), with their messages by cascade;
  - leads older than `LEAD_RETENTION_DAYS` (default 90);
  - stale rate limits.
- `vercel.json` has no `crons`, and the repository has no `.github` workflow. Nothing runs the command.

Please schedule it, for example daily, with an administration credential kept out of the public function, and record the first applied run. Until a run is verified, the 30-day promise is not operationally true, and the preview theme should not be published.

## 2. Knowledge refresh

The live site changed after the 14 documents were reviewed on 2026-11-04:

- Plans is published at `/pages/plans`;
- the trial is now "Request free trial", with an on-page confirmation;
- NEVORA Relay is listed as coming soon, with a waitlist topic;
- the website now has the "Ask Rondo" chat.

`rondo-knowledge-proposed-2026-11-05.json`, next to this file, contains replacement entries in the existing `knowledge/nevora.json` format:

| Entries | Change |
| --- | --- |
| `nevora-availability-en/es` | URL is now `https://www.thevelani.com/pages/plans`. Adds the request flow, the two-business-day reply, the 30 days starting when the workplace is ready, and closure stated as one of two outcomes with export first. |
| `velani-enquiries-en/es` | Adds the trial, quote, Relay and website topics, the on-page confirmation, and that no automatic confirmation email is sent. |
| `nevora-rondo-en/es` | Separates the website "Ask Rondo" adviser from the in-app assistant (still in development). |
| `velani-relay-en/es` | **New**, non-core. Relay is coming soon, in design, with no dates, and has a waitlist at `?interest=relay`. Do not quote prices, dates, hardware or payments. |

All are dated `reviewedAt 2026-11-05` / `validUntil 2026-12-05`. The core count stays at 10, and all URLs pass the seed schema. Please review the wording, merge it into `knowledge/nevora.json`, seed the assistant-only Neon project, and re-run the free checks. Re-run paid evaluations only with Jose's approval.

Note that Claude is also changing the Relay button label from "Get early access" to "Join the waitlist" and the contact topic label to "NEVORA Relay waitlist". The `relay` topic value stays the same.

## 3. Client sync

`src/night/velani-assistant.js` on the UI branch now maps `provider_request_rejected` to a non-retryable `rejected` code, so the UI offers an edit instead of an unchanged retry. It also maps `turn_in_progress` to `inprogress`, and adds EN/ES messages for both. Please copy it over `services/velani-ai/integration/velani-assistant.js` so the reference client and the website client stay identical.
