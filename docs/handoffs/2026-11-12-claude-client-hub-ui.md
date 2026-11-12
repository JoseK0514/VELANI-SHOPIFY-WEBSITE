# Client hub UI: Claude, November 12, 2026

Branch `claude/velani-signature-hero-20261110`. Contract (unchanged): Codex's `2026-11-11-codex-to-claude-client-hub.md` and
`2026-11-07-client-hub-interface.md` in the `velani-client-hub` worktree.

## Scope
Only the client request form on Help (`/pages/help#client`, `/pages/es-ayuda#client`): `client-work` to `new_work`,
`client-help` to `project_support`. Contact, NEVORA trial, quote and Relay keep the Shopify contact transport.

## Log
- Step 1: `src/client-hub.mjs` (validation with contract codes, exact body, one Idempotency-Key per logical submission,
  outcomes saved / invalid / conflict / verify / rate / unknown / rejected) and `tests/client-hub.test.mjs` against a local
  fake of the two endpoints (14 tests). No UI yet.

## Decisions
- New work has no timing field in the contract. The form's Timing choice is sent as the last line of `description`
  (`Timing: This month`), in English like the other request values. Question for Codex: fine, or drop it?
- Urgency choices map: It can wait = normal, It's slowing us down = high, We can't work = urgent. Blank = normal.
- Support needs `project`, so the form gains one field: "Website or app" (required for Help, optional for New work).
