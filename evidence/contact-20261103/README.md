# Contact page polish (2026-11-03)

Local preview (127.0.0.1:4173, Chromium at /opt/pw-browsers/chromium) after the contact form rewrite: numbered field groups, "What happens next" column, one-line terms in the hero, trust line under the button.

| Suite | Result |
| --- | --- |
| `npm test` | 33/33 |
| `npm run check:theme` | clean |
| `scripts/checks/acceptance.mjs` | 77/77 (`acceptance/`; the two contact assertions updated to the new headings and the next-steps column) |
| `scripts/checks/clipping.mjs` | 18/18 routes at 320px and 200% zoom (`clipping/`) |
| `scripts/checks/layout-audit.mjs` | 19/19 (`layout/`) |
| `npm run check:privacy` | 4/4 |
| `scripts/checks/scroll-stability.mjs` | 8/8 routes (`scroll/`) |
| `npm run check:browser` | 51/51 (`../contact-browser-20261103`) |
| `scripts/checks/assistant.mjs` | not rerun; no assistant file changed |

Captures in `captures/`: desktop (1440) and iPhone 13 for the general, quote and demo variants, plus the invalid-submit state and the checked-draft state.

Theme upload: the four rebuilt files (assets/velani.css b69f1ae3bb46d266800f9911d0bf6605, assets/velani.js 995ff38a08e1ec8ff7c6c613a1053c97, sections/velani-contact.liquid 8e205ee66bc39b7a279da1253ab75ec8, layout/theme.liquid 4e0e2614a19ffcc1dabcb3257dd6277c) were staged (all four POSTs returned 201) but the themeFilesUpsert to theme 193020428602 was declined at the permission prompt, so the preview theme still carries the previous contact page. The staged targets expire after 24 hours; a new staging is needed to upload later.
