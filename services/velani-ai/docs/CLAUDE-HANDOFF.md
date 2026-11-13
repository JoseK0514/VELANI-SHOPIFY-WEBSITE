# Rondo backend handoff and boundaries

Updated November 12, 2026 for SCRUM-153. [Start from current development](START-HERE-CLAUDE.md),
then use the [UI contract](CLAUDE-UI-START-HERE.md). The old backend feature
branches are retired. [Integration evidence and current limits](../../../docs/handoffs/2026-11-12-scrum153-rondo-backend-integration.md)
supersede older present-tense setup/launch claims in the November 3/5 documents.

## Implemented source

| Responsibility | Existing source |
|---|---|
| Validation, Origin/CAPTCHA/session/rate/error handling | src/app.ts, src/config.ts, src/vercel-handler.ts |
| Session ownership, UUID/hash idempotency, leases and committed results | src/repository.ts, src/experience-repository.ts |
| Reviewed knowledge, bounded model output and explicit provider deadlines | src/engine.ts, src/plan-engine.ts, src/prompts.ts, src/plan-prompts.ts |
| Durable admission budget | src/ai-budget.ts and runtime wiring |
| Conversation retention, private monitor and incident journal | src/conversation-retention.ts, src/neon-operations.ts, src/rondo-monitor.ts |
| Headless public widget client | integration/velani-assistant.js and src/night/velani-assistant.js at repository root |
| Schema and migration coordination | migrations/001 through008 and scripts/migrate.ts |
| Separate customer enquiry workflow | src/client-hub/; its UI/real-delivery acceptance is separate from chat |

Use routes and validation as the contract. Database tables do not grant a caller
another session, workforce authority, administrative operations or consent.

## Preserve these controls

- Public Rondo has no workforce database/tools, employee records, admin login,
  booking, payment or operational execution authority. Actions in model output
  are UI suggestions, not completed operations.
- Server validation, exact origins, production CAPTCHA, hashed bearer sessions,
  session expiry and private/no-store responses remain in force. Secrets and
  session/CAPTCHA tokens stay out of browser storage, logs and analytics.
- A new message gets a UUID. An unchanged retry preserves UUID and payload.
  Changed content starts a new operation. Retain the request-hash conflict,
  transactional session/lease fencing and stale-result rejection behavior.
- Lead capture requires its own explicit unchecked consent form; mentioning an
  email in chat does not save a lead. A saved enquiry is not email delivery.
- Provider calls have explicit deadlines and zero SDK retries. An upstream
  rejection offers an edit; no fallback or automatic resend. Keep local tests
  synthetic unless a separate finite provider allowance is explicitly approved.
- Budget attempts stay reserved, including failed, timed-out and unknown
  outcomes. Checkout/source copies do not renew an allowance. Preserve the
  approved finite monthly authorization, source/role isolation and counters.
- Deleting a conversation is not proof of provider, backup, enquiry or mailbox
  erasure. Reviewed knowledge expiry, retention scheduling, backup policy and
  public legal copy retain distinct ownership and evidence.

## Verification and remaining acceptance

The [SCRUM-153 receipt](../../../docs/handoffs/2026-11-12-scrum153-rondo-backend-integration.md)
records current source ancestry, the retained261-test database reports and the
checks actually run for this handoff update. It is a backend source/integration
review, not independent security or whole-release certification.

[Development operations](DEVELOPMENT-OPERATIONS.md) describes restricted runtime
and monitor roles, private function admission, durable budgets, pause/rollback
and credential boundaries. Its controls do not authorize activation. The
[remaining operating handoff](../../../docs/handoffs/2026-11-12-rondo-responder-closeout.md)
tracks independent outage coverage and actual responder acknowledgment separately
from named assignments. The existing SCRUM-190 finisher retains that work.

Claude owns remaining UI under SCRUM-157, policy presentation under156 and
truthful portfolio/demo work under158. SCRUM-164 records the November 12knowledge
refresh;191 tracks the next review. Use their current records rather than an old
README's source count or expiry date. Main/production promotion, Shopify
publication, new messages, customer-data changes and spending require their
existing explicit authorization.
