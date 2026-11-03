# Pre-launch review, 2026-11-03

Five read-only reviews ran against the local preview of commit 500ddfd: copy (64 findings), desktop visual (22), code (6 bugs, dead code, 12 risks), mobile visual (21) and interaction/scroll (final report pending). The accepted findings were fixed in commit a5c15df and uploaded to the unpublished theme **192986808634** ("Velani pre-launch review fixes (preview)"), 29 files verified by checksum (`evidence/shopify-preview-192986808634-readback-20261103.txt`).

## Verified after the fixes (local Chromium, commit a5c15df)

- `npm test` 32/32 · `npm run check:theme` 0 offenses
- `npm run check:browser` 51/51 (`evidence/browser-review-fixes-20261103b`)
- `npm run check:privacy` 4/4 (`evidence/privacy-regression-2026-11-03T00-42-49-065Z`)
- `scripts/checks/acceptance.mjs` 76/76 (`evidence/acceptance-review-fixes-20261103`)
- `scripts/checks/scroll-stability.mjs` 9/9 routes, CLS 0, no overflow (`evidence/scroll-review-fixes-20261103`)
- `scripts/checks/clipping.mjs` 18 routes × 320px and 200% zoom, clean (`evidence/clipping-review-fixes-20261103b`)
- Earlier runs with the pre-fix button label (`browser-review-fixes-20261103`, `privacy-regression-…00-34-07…`) are kept as failed evidence of the stale label, not of the site.

## Not changed: owner decisions

1. NEVORA policy text (generated from the NEVORA app's policy source, `src/nevora-policies.mjs`; fix at the source):
   - Terms, "App license": "For the iOS app, Apple's standard end-user license agreement applies…" states App Store distribution.
   - Privacy, "Your choices and requests": "NEVORA currently serves the participating employer and its authorized workforce in Puerto Rico" reads as a live customer.
   - Privacy and account deletion: "We are verifying the maximum time any backup or exported copy is kept…" publishes an unconfirmed fact.
   - "acknowledgements" (British spelling) in the terms.
2. Facts to confirm before publishing: hosting in Northern Virginia, 30-day deletion window, two-business-day support response, WCAG 2.2 AA target statement, "Calle Tulipan" without an accent.
3. The website terms now say "operated by VELANI LLC. Velani is a brand of VELANI LLC." (was "doing business as Velani"); restore "doing business as" only if the DBA is registered.
4. Assets: the owner screenshot (`night-owner.webp`) is cropped through the Settings row and should be re-exported from the app; the app screens carry a "NEVORA Workforce" sub-brand the website never mentions.
5. Left as designed: About rows use a smaller heading size than Custom development rows; the textarea keeps its resize handle; the home page keeps several content widths.
