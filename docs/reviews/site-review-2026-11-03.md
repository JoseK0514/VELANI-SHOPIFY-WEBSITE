# Site review after launch (2026-11-03)

Reviewed the published site (www.thevelani.com, theme 193011548474) from the live captures in `evidence/live-20261103/`, a slow-4G phone run and the Shopify theme listing. Findings are ranked by what they buy Jose, with the effort to fix.

## A. Fix soon (small effort)

| # | Finding | Why it matters | Fix |
| --- | --- | --- | --- |
| A1 | Home panel images 4 and 5 load only when scrolled near; on a slow phone connection the Custom apps panel is blank for about 0.9 s before the screens appear. | A black panel for a second reads as broken. | Load the five home panel images eagerly (about 200 KB total) with a short fade-in on load. |
| A2 | Home `<title>` and description still lead with NEVORA ("Velani · NEVORA scheduling, time clock…"). | Search results and link previews describe a narrower company than the site now shows. | "Velani · Software, websites and custom apps for your business" plus a matching description. |
| A3 | The social-share image is the wordmark on black. | WhatsApp, LinkedIn and iMessage previews are the first impression for most shared links. | A 1200×630 card from the hero image with the wordmark and "Brighter work ahead." |
| A4 | `/pages/products` duplicates the home page (same three panels). It is not in the menu but it is live and indexable. | Two home pages dilute search and confuse anyone who lands there. | Remove the page from the build and let Shopify 404 it, or redirect it to `/`. |
| A5 | The live theme still carries the pet-store leftovers from the original Shopify theme: `velani-bandanas.png`, `velani-collars.png`, `velani-cat-collars.png`, `velani-hero.png`, `zz-velani-bundle7.css`, `global.js`, `base.css`, and the `announcement-bar`, `collection-cards`, `featured-products`, `newsletter`, `story-split`, `value-grid`, `main-*` sections and `product-card` snippet. None are loaded. | Clutter for anyone who opens the theme editor; stray files are what break later. | Delete them in the next unpublished copy before it is published. |
| A6 | Anchor offset on panel pages (the scroll chevron lands 54 px short) and the chevron does not pause under the cursor. | Already in source; waits for the next preview cycle. | Ship with the next cycle. |
| A7 | The theme library holds ten unpublished Velani previews from today and the old "Canyon", "Balance" and "The Velani" themes. | Housekeeping; a wrong click publishes an old one. | Jose deletes the old previews in admin, keeping the live theme and the one before it. |

## B. Worth doing (medium effort)

| # | Finding | Why | Fix |
| --- | --- | --- | --- |
| B1 | Spanish. Puerto Rico businesses are the market and the site is English-only (the time clock already speaks Spanish). | The single largest reach gap. | A Spanish set of routes (`/es/…`) from the same source, with a language switch in the header and `hreflang` tags. Phase 2 in the plan; it should move up. |
| B2 | No proof on the site: no outcomes, no client voices, no numbers (client names were excluded on purpose). | A premium look without evidence still asks the visitor to trust. | Two or three anonymised outcomes Jose can stand behind ("A barbershop moved booking online; walk-in calls dropped") or a short line of facts (years, projects delivered, response time). Needs Jose's facts. |
| B3 | The free demo is the strongest offer, but the desktop header still says "Contact". | The header is on every page; the demo is the lead magnet. | Make the header button "Start free demo" on all pages except NEVORA (which already has it), and keep Contact in the menu. |
| B4 | Custom apps panel on the home is the one composed panel (phone and tablet screens floating on a gradient); the other four are photographs. | It is the weakest of the five and the one that pops in last. | A generated dark photograph with a phone showing the booking screen, like the NEVORA panel, or a real device mock built in code. |
| B5 | Organization structured data is missing. | Brand search results and knowledge panels use it; cheap to add. | JSON-LD `Organization` with name, URL, logo, phone, address and hours in the layout. |
| B6 | The site has no analytics by design. | Jose cannot see which page converts. | Shopify's own analytics already count storefront sessions and the contact form; no new tool needed. If more is wanted later, the cookie dialog is ready for it. |
| B7 | WhatsApp is the way many Puerto Rico businesses prefer to talk. | A WhatsApp link beside the phone number could outperform the form. | Jose's call; needs a business WhatsApp number. |

## C. Fine as is (noted so they are not re-raised)

- Accessibility: axe clean on WCAG 2.2 AA across all routes; reduced motion stills the hero drift and the chevron; keyboard paths work.
- Performance: 1920×1080 webp photos at 26–47 KB each, one 45 KB stylesheet, fonts preloaded, hero images preloaded, no layout shift, no long frames on an emulated phone.
- Copy: no client names, no invented results, the demo terms stated next to every offer, NEVORA described as calculating pay statements only.
- Legal: unchanged text in the new layout; contact and address on every document.
- Inquiries: Shopify's live form with its spam protection; the message is optional for the demo; sensitive-data warnings in place.

## Suggested order

1. A1–A5 in one preview cycle (an afternoon), plus A6 which is already in source. Jose publishes.
2. B3 and B5 in the same cycle if Jose agrees to the header change.
3. B1 Spanish as the next project; B2 and B7 once Jose has the facts and the number.
