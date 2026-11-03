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

Second pass (Jose: "look how cheap this looks" on the live phone page): on phones the form loses its card and the fields become the surfaces; the footer becomes two aligned columns and its links now match the header (NEVORA · Websites · Custom apps · Plans · Support · About · Contact). All suites rerun on this build with the same results (acceptance 77/77, clipping 18/18, layout 19/19, scroll 8/8, privacy 4/4, browser 51/51, unit 33/33, theme clean). Captures in `captures/` are from this build.

Theme upload: the first staging of the four changed files was declined at the permission prompt (themeFilesUpsert), so the preview theme kept the previous contact page at that point. Final build checksums: assets/velani.css 59c8a0a2b3ae4920f8432371ae5a93d1, assets/velani.js 995ff38a08e1ec8ff7c6c613a1053c97, sections/velani-contact.liquid 8e205ee66bc39b7a279da1253ab75ec8, layout/theme.liquid 77de86c47fdcab66e0451df0355f6a99. See `preview-theme-readback.txt` for the upload result.
