# Velani site baseline, 2026-11-07 (Phase 0, no changes)

Live theme at the time: **193114145082 "Velani tab icon (preview)"**, role MAIN (read from `Shopify.theme` in the live HTML).

## Parity

- Snapshot of every live text file: `evidence/live-193114145082-20261107/` (76 files by download, 54 template JSON files rebuilt from the API listing; md5 matches the API for every non-JSON file).
- `node scripts/check-live-parity.mjs evidence/live-193114145082-20261107` on branch `claude/velani-hub-20261107` (from `a69802d`): **PASS**, 130 files, 44 identical, 86 accepted, 0 failing.
- Three live files the build never produced and nothing references (old `assets/velani-home.js`, the pet theme's `sections/header-group.json` and `footer-group.json`) are now listed as legacy in the parity script.

## Pages checked

19 English pages + 5 Spanish pages, each at 320, 390 and 1440 (Chromium, reduced motion, full page after scrolling through): 72 screenshots in `evidence/baseline-live-20261107/` (local only, not committed; ~45 MB). Codex's Nov 6 audit captures are in `/tmp/velani-audit-2026-11-06/`.

| Check | Result |
|---|---|
| HTTP status | 200 on all 24 |
| Sideways scroll | none at 320, 390 or 1440 |
| axe-core 4.10.2 (WCAG 2.0/2.1/2.2 A+AA + best practice) at 390 and 1440 | **0 violations** on all 48 runs (automated only; no screen-reader pass) |
| One `<h1>` per page | yes, all 24 |
| Canonical | self-referencing on all 24 |
| Images without `alt` | 0 |
| Raw-HTML renderability (JavaScript off vs on) | same text on every page (e.g. Home 1,932 vs 1,944 characters; NEVORA 4,351 vs 4,658; the difference is the time-clock demo and chat). Crawlers that don't run JS see the whole page. |
| Structured data | `Organization` JSON-LD on every page (name, legal name, address, phone, support hours). No `WebSite`, `SoftwareApplication` (NEVORA) or `BreadcrumbList`. |
| hreflang | correct EN/ES pairs on the 5 translated pages; English-only pages have none |
| Meta descriptions | present everywhere; six legal pages are short (69–84 characters) |

## Crawling and AI readers

- `robots.txt` (Shopify default): `User-agent: *` / `Allow: /` with the usual private paths blocked. **No AI crawler is blocked.** It also carries Shopify's own comment block that tells shopping agents to promote Shop Pay; that is Shopify's text, not Velani's.
- Requests as GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, Google-Extended, CCBot and Applebot-Extended all got **200**.
- `/llms.txt` and `/agents.md` existed but were **Shopify's generic shopping-agent instructions** (carts, Shop Pay, checkout). Nothing about Velani, NEVORA or custom work. A store with no products to buy was describing itself as a shop.
- `sitemap.xml` listed 24 pages plus two stale entries: the **"Animals and Pet Supplies example products" collection** and the **empty News blog**.

## Findings carried into Phase 1

1. Stale sitemap entries (pet collection, News blog). → deleted, with 301s to home.
2. ES switch on English-only pages (About, Support, Custom development, legal) dropped visitors on the Spanish home, and `#section` was lost on every switch. → Spanish About and Support added; Custom development goes to Productos#websites; the section carries over.
3. Products menu: hover opened it, so a click on the caret while hovering *closed* it; keyboard focus also opened it, so Enter toggled it shut. → one open state, set only by the caret.
4. NEVORA privacy said "restore history of six hours… we are verifying"; the app policy at f5fa463b says seven days plus purpose-limited recovery snapshots. → copied verbatim.
5. "Rondo" meant two things (website chat and the NEVORA assistant). → "Rondo on this site" / "Rondo in NEVORA".
6. llms.txt was Shopify's shopping text. → Velani's own summary via `templates/llms.txt.liquid`.

## Left for later (not in Phase 1)

- The store's old **Main menu** still lists pet-shop links (Shop by collection, Bandanas, Collars, Leashes, Harness, On sale). The theme doesn't render it, but it is store data; delete or replace it on Jose's yes.
- 7 draft example products (pet and coffee) remain as drafts; they are not public.
- `/agents.md` and `/llms-full.txt` still serve Shopify's shopping text; an `agents.md.liquid` can replace them if Jose wants.
- Add `WebSite` and `SoftwareApplication` (NEVORA) structured data with the Phase 2 build.
- Legal and NEVORA policy pages stay English-only (Jose: policies later); their ES switch still goes to the Spanish home.
- Website-side NEVORA policy edits (sign-in guidance, regional wording, retention list, 3-day trial deletion) are still not in the app's `policies.ts`; mirror them when Codex changes the trial end to 30 days in Release 1.1.
