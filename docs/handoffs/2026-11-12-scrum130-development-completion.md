# SCRUM-130 development changes — November 12, 2026

Jose requested completing the remaining work and merging it into development.
This delivery starts from actual remote development `5d2e5455f2727a2242c271394aff3ac5e98b1b01`,
preserving the concurrently delivered Spanish policies and corrected product facts.
Application commits are `a69a2d4` and `2db93b4`.

## Delivered

- Restore `#relay` in both NEVORA languages on the existing Relay waitlist copy.
- Provide real header links with JavaScript disabled. Disclosure-only controls
  are hidden in that state; links wrap with 44px minimum height. Inquiry
  submission remains disabled without JavaScript.
- Keep the human-contact action available after a Rondo 422 safety refusal.
  An edited question receives a new request ID; an explicit retry after a
  generic 503 preserves the previous ID. No automatic resend is added.
- Add an actual Chromium/WebKit regression against owned local API fixtures
  for English and Spanish 422/503 recovery, with external requests prohibited.

The visual target is the existing Velani site: retain its palette, typography,
header, page composition and established components. The fallback follows the
Refero craft guide's native links, keyboard focus and anchor guidance. Live
Refero research was unavailable because its subscription is inactive; existing
site screenshots and source were used as the concrete reference lock.

## Actual evidence

- Website build/source tests: **100/100**; theme syntax: **zero findings**.
- Combined Chromium/WebKit route, accessibility and interaction suite:
  **156 passed / zero failed / zero blocked**, zero runtime errors or external
  requests, at navigation candidate a69a2d4.
- Additional JavaScript-disabled English/Spanish checks in both browsers at
  320, 390, 834 and 1440px: **16/16**, including native Tab/Enter navigation,
  Relay targets, no horizontal overflow and disabled inquiry submission.
- Rondo recovery: original **four failures / four passes** reproduced the
  missing human-help action. Corrected source passed **8/8**, including language,
  no automatic resend, request identity and recovery controls. Only local
  fictional API fixtures were used; there were no provider or mail calls.

The earlier WebKit host-validation block and stale-preview Spanish-route failures
are retained as failed preparation evidence, not application acceptance. The
browser cache's already validated libraries required the documented scoped
host-precheck override. Restarting the preview from the rebased source resolved
the stale route module; no assertion, CSP or runtime error check was relaxed.
Reports and representative screenshots are in the adjacent evidence directory.

## Owner confirmation and external gates

Jose confirmed that Tool Box/Yavi public portfolio use is approved, including
the names, logos and screenshots covered by the question. This is recorded in
SCRUM-158 comment10334. No new contract or renewed permission request is pending
for that stated scope.

The actual approved Lantern concept1 asset is not in the repository or attached
to Jira; the historical tracker names a Mac-local folder. Faithful export and
integration require that source asset, without asking Jose to choose again.
Actual iPhone/Safari/accessibility-device acceptance and exact hosted-theme
review/publication retain their original owners and evidence requirements.
These development changes do not publish Shopify, promote main/production,
enable real inquiries, activate the public AI backend or claim those gates done.
