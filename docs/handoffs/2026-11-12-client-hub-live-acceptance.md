# Client hub acceptance — November 12, 2026

Claude's UI commit `17d35c2` is on `claude/velani-signature-hero-20261110`, worktree `/private/tmp/claude-501/-Users-josek0514-Desktop-NEVORA-UI-READINESS/1738624c-3cc0-422a-b25a-92a5127865f6/scratchpad/hero`. Existing backend `https://velani-ai.vercel.app` and the November7 fixed interface remain unchanged. Production service runtime is `3db0ea98bc3da6b3ae08b9e5d2c2b59a361e6a8d` (later Rondo work; hub transport unchanged).

Unpublished acceptance theme **193374224698**, duplicated from MAIN. No MAIN edits or publication. Its explicit `client_hub_preview_submissions` setting was enabled only for the authorized real test; other previews default to sending nothing. Live sending excludes review fixtures. Disable the acceptance setting after review; publish remains Jose's action.

## Actual Safari and inbox acceptance

The user expressly requested bilingual real submissions and inbox verification. Both synthetic requests used `support@thevelani.com`; no customer address was used. The messages explicitly say that no work or support response is requested.

| Language/type | Reference | Persisted request | Email jobs | Provider attempts |
|---|---|---:|---:|---|
| English / new_work | VEL-2611-0001 | 1 | support + confirmation | 1 each |
| Spanish / project_support, urgency normal | VEL-2611-0002 | 1 | support + confirmation | 1 each |

Both hosted success panels displayed their actual references. Repeated submit clicks did not create duplicate rows or email jobs. The frontend locks fields throughout verification/submission after the reviewed race fix. Local backend and transport tests cover concurrent/replayed/lost-response keys; this hosted acceptance did not capture a raw request key or simulate a network-lost-response replay.

Resend individually reports all four messages **delivered**, from `Velani <requests@thevelani.com>`, with the expected reference and reply-to. The Spanish client confirmation is in Spanish; the internal support notice preserves the complete Spanish description. Actual Gmail search in the existing business mailbox found **exactly four matching inbox messages**, including both support notices and both confirmations. Thus this is inbox evidence, not only API/provider submission evidence. No open/click tracking was enabled.

Provider IDs: English confirmation `01a1cfbc-d795-75d0-8215-8ddcce6e1a33`, English support `01a1cfbc-d754-742d-873e-0286eb480638`; Spanish confirmation `01a1cfbf-39d1-7f2b-8f7c-af118816dd59`, Spanish support `01a1cfbf-399f-704a-857a-40b388362d01`.

The two test requests/messages remain for review under existing retention. No permanent deletion was authorized for these hub requests. Claude's broader site browser suite still records14 pre-existing failures; this acceptance does not claim the entire website is regression-free.

## Preview addresses

- EN: https://www.thevelani.com/?preview_theme_id=193374224698&view=velani-help#client
- ES: https://www.thevelani.com/?preview_theme_id=193374224698&view=velani-es-ayuda#client

The new private admin has a restricted, read-only projection for these saved requests. That admin's real Owner/passkey and production activation gates are separate; this form acceptance does not claim the admin is open.
