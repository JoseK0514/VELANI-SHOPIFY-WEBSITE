# Audit handoff F01–F25: verification and fixes (2026-11-03)

The attached handoff audited the LIVE site (theme 193011548474, published earlier on 3 November). The preview theme 193020428602 already differed. Every finding was re-checked on the preview build before changing anything.

Reproduction script: `scratchpad/audit/verify.cjs` (tablet overlap, pixel-sampled contrast over the laptop image, root font 32px at 390 wide); captures in `captures/`.

| ID | Status on the preview before this pass | Action | Verification |
| --- | --- | --- | --- |
| F01 | Already resolved (plain form, "Anything else (optional)" label) | none | acceptance + browser axe (51/51) |
| F02 | Reproduced: phone bottom 826 vs copy top 755 at 768×1024 (71px overlap) | Phones and tablets lay the panel out in flow: shot first, copy pushed to the bottom; panel grows with content | 768×1024: shot bottom 826, copy top 858 (32px gap) |
| F03 | Reproduced at 1024×768: label 2.23–2.65:1, button 2.95–3.6:1 over the laptop | Below 1180px the laptop image shifts left and the copy scrim deepens | 1024×768 worst pixels: label 6.58/6.82, button 7.93/8.86, heading 13.3+, body 14.4+; 390 and 1440 all ≥ 8 |
| F04 | Reproduced (cropped owner screen on phones) | "Open the full-size screen" link under the crop opens the full image | capture `phone-owner.png` |
| F05 | Awaiting business decision | none (wording left as is) | — |
| F06 | Awaiting business decision; interim wording | "within 3 days, except records we must keep by law" on Plans, demo fine print and the Plans FAQ, with a pointer to the NEVORA privacy policy | unit tests |
| F07 | Reproduced | Team size options 1–10 · 11–20 · 21–30 · More than 30 (quoted separately) | acceptance 77/77 |
| F08 | Reproduced | Choosing a NEVORA topic in the general form reveals team size and locations and makes the message optional | `phone-contact-topic.png`; console check true/false |
| F09 | Awaiting business decision (real sign-in entry point) | none | — |
| F10 | Platform-generated (Shopify robots.txt, agents.md, llms.txt, UCP) | none possible from the theme | live probe 2026-11-03 |
| F11 | Platform: /collections/all returns 200 with the not-found section | Retired templates now carry title "Page not found" and a noindex meta | theme check clean; needs the collection deleted in admin |
| F12 | Platform (blog sitemap) | none possible from the theme | needs the blog deleted in admin |
| F13 | Reproduced on Home (two overview links labelled "Start a project") | Overview links now read "See custom development" | acceptance |
| F14 | Reproduced | /policies/* aliases land on the relevant document: privacy, terms, and an explanation for refund/shipping | theme check clean (Liquid `request.path`) |
| F15, F16 | Awaiting Jose's materials (project story, founder profile) | none | — |
| F17, F23 | Already improved on the preview (company-wide title and description, Organization JSON-LD, nav order) | none further | unit tests |
| F18 | Already resolved on the preview (Yavi Barber and Tool Box screens, NEVORA screens) | none further | captures |
| F19 | Design direction chosen by Jose (full-screen panels); not changed | none | — |
| F20, F21 | F21: Help now states "Reply within two business days" beside the email; F20 needs validated statements | partial | unit tests |
| F22 | Products page removed from the build; the Shopify page still exists | needs the page unpublished in admin | — |
| F24 | Reproduced in code: Save/Reject stayed enabled when the platform service was unavailable | Controls disabled in that state and the message says to close and try later | privacy suite 4/4 |
| F25 | Reproduced: home hero copy at −44px, NEVORA hero copy at −155px with root font 32px at 390 | Same flow layout as F02 | both heroes: copy top 0 or below the shot, no clipping, no horizontal overflow |

Suites on the final build: unit 33/33, theme clean, acceptance 77/77 (team-size option in the test updated), clipping 18/18, layout 19/19, scroll 8/8, privacy 4/4, browser 51/51 (`../audit-browser-20261103`).
