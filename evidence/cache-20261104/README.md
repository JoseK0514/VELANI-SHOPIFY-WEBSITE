# Stale validator and NEVORA feature list, 2026-11-04

Codex review 6 reported that the preview accepted -1, 0 and 1.5 locations and dropped the "website" topic. The theme's inquiry.js already had both fixes (readback matched). The cause: velani.js imports ./inquiry.js and ./privacy.js by a bare relative path, which Shopify's asset_url versioning does not cover, so the CDN and browsers kept serving an older inquiry.js.

Fix (scripts/build.mjs): in the theme build, every module import between assets carries a content fingerprint (./inquiry.js?v=<sha256 prefix>, ./privacy.js?v=..., ./velani-assistant.js?v=...). A changed dependency now always loads fresh. The shipped validator rejects -1, 0, 1.5 and keeps "website".

NEVORA phone feature list: icons sit beside their text; the section is 640 px tall at 390 px (was about 970 px).

All suites passed (unit 34, theme check, acceptance 77, browser 51, clipping 18 routes, layout 19, scroll 8, privacy 4).

NOT UPLOADED: Jose published theme 193020428602 ("Velani precision pass (preview)") as the live theme at 2026-11-04 18:26 UTC, and the Shopify connector refuses writes to the live theme. The three changed files (assets/velani.js, assets/velani-assist.js, assets/velani-nevora.css) wait for a duplicate of the live theme to upload into.

Also found: the Plans page (gid://shopify/Page/167254720826, handle plans) is still unpublished while the live menu links to /pages/plans.
