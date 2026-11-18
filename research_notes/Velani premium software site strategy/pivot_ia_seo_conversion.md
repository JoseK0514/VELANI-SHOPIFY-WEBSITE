# Pivoting Velani's public site from agency services to a software-product company: IA, SEO and conversion (as of Nov 2026)

Scope note: planning research only. Nothing here requires or implies publishing, deleting pages, changing store settings, or editing live redirects. Where a recommendation would need a live-store action later (e.g. creating Shopify URL redirects, deleting a page), it is flagged as "needs separate authorization". Research ran 2026-11-18 using about 17 search/fetch calls, plus one local repo check (noted below). Vendor-sourced statistics are marked **[VENDOR]**.

Local context checked in this repo (not a web source): Spanish mirrors are separate Shopify pages with an `es-` handle prefix (`/pages/es`, `/pages/es-a-la-medida`, `/pages/es-productos`, `/pages/es-planes`, `/pages/es-nevora`, `/pages/es-contacto`, `/pages/es-prueba`, etc.). The theme emits `hreflang="en"`, `hreflang="es"` and `hreflang="x-default"` from an EN/ES pair map in `src/render.mjs` / `src/night.mjs`. `/pages/es-a-la-medida` appears to be the Spanish pair of `/pages/custom-development`.

## 1. Case studies of service-to-product pivots: how they handled the public site and existing clients

### Takeaway
The best-known service-to-product companies (37signals/Basecamp, Campaign Monitor, Wildbit/Postmark, FreshBooks, Harvest, Proposify, Typeform) all built a tool for their own or a client's use, let agency revenue fund it, then **stopped taking new clients once product revenue could carry the team**. The cutover was a business decision first. Public sources say almost nothing about how their websites changed. The pattern that does show up is a clean break: one product-led brand, with client work dropped rather than kept as a side offer. MetaLab/Tiny is the counter-example, where the agency stayed separate and funded products and acquisitions.

### Cited Findings
- 37signals: Basecamp launched Feb 2004 as an internal tool for the web-design firm. Within about a year it earned more than the design business, and the company stopped client work to focus on software. Sources disagree on the date (end of 2004 vs. mid-2005 "last client project"). These are secondary sources; no primary Jason Fried text was verified in this session. — [Wikipedia: 37signals](https://en.wikipedia.org/wiki/37signals); [Built In: How Basecamp grew](https://builtin.com/articles/how-basecamp-grew-side-project-one-world-s-most-thriving-startups); [Creative Bloq: Jason Fried](https://creativebloq.com/agencies/jason-fried-9087171)
- Campaign Monitor (from the Sydney agency Freshview): built in 2004 because existing tools didn't fit client newsletters. The founders "fully shifted their focus to the SaaS business and stopped taking on design clients". Self-funded for about a decade, then $250M from VCs in 2014. — [David Hart, "Agencies who switched to SaaS"](https://davidhart.substack.com/p/agencies-who-switched-to-saas)
- Wildbit (Postmark, Beanstalk, Newsberry): a two-person Philadelphia web agency started in 2000 used consulting profits to fund products and "gradually moved away from client work". They productized internal knowledge more than once, which is relevant to Velani having three products. — [David Hart](https://davidhart.substack.com/p/agencies-who-switched-to-saas)
- FreshBooks (from the agency Anicon): the agency subsidized the product and the team "gradually moved away from consulting". They bootstrapped for about a decade before raising in 2014. — [David Hart](https://davidhart.substack.com/p/agencies-who-switched-to-saas)
- Harvest (from the agency Iridesco): built as an internal timesheet tool and run alongside the agency. Growth was described as "slow, deliberate", and the author thinks it was slower than it would have been with full focus. — [David Hart](https://davidhart.substack.com/p/agencies-who-switched-to-saas)
- Proposify (from the agency Headspace): built an MVP in 2013, then sold the agency and raised a seed round in 2014. That is a hard cut, not a parallel run. — [David Hart](https://davidhart.substack.com/p/agencies-who-switched-to-saas)
- Typeform: a lead-capture form for a client project at two small Barcelona web agencies became a standalone product. — [David Hart](https://davidhart.substack.com/p/agencies-who-switched-to-saas)
- The author's overall lesson: what holds agencies back is "an unwillingness to make the level of commitment required to give their products the best chance of success." — [David Hart](https://davidhart.substack.com/p/agencies-who-switched-to-saas)
- MetaLab/Tiny (counter-model): MetaLab stayed an agency, and its profits "funded Tiny's earliest acquisitions". The agency is a separate daughter company of Tiny, not merged into a product brand. — [Tiny: MetaLab](https://tiny.com/companies/metalab); [Wikipedia: MetaLab](https://en.wikipedia.org/wiki/MetaLab,_Ltd.)
- SegMetrics: "In 2020 we decided to shut down the agency and focus on SegMetrics full-time." Their MRR chart marks each company-wide decision (stopping client onboarding, restructuring). — [Indie Hackers: Pivoting from an agency](https://www.indiehackers.com/post/d4xS8won6pjxoMU1kmUe)
- Founder anecdotes on the tension: "I could spend 10 hours on client work and earn $3k or invest 40 hours into the SaaS". "At an agency the customer is King, but with SaaS, the product is King." Anecdotal, self-reported. — [Indie Hackers](https://www.indiehackers.com/post/z7aawav5zElZkMEAHG7f); [Medium/Marker: From agency to SaaS](https://medium.com/marker-blog/from-agency-to-saas-startup-5-lessons-for-making-the-transition-821065ba6b56)
- Cautionary pattern: using an agency as a funnel for a SaaS can backfire. — [Bootstrappers.com cautionary tale](https://bootstrappers.com/how-this-founder-turned-his-creative-agency-into-a-funnel-for-his-saas-business-a-cautionary-tale/) (title only; not read in full)

### Inferences
- Precedent favors a clear public cut: the homepage, nav and metadata say "software company". Existing service clients are handled privately (support continues, no new intake), not through a services page in the main nav. Campaign Monitor, Proposify and 37signals all stopped taking new design clients rather than marketing both.
- If Velani still wants occasional custom work, the MetaLab model (a separate, quiet offering) fits better than a co-equal "Custom development" nav item. On the site, that means a low-prominence path (footer link or a line on /pages/contact), not a product-level page.
- The "built for ourselves" origin story (Basecamp, Harvest, FreshBooks) is a credibility asset. Velani can tell a true version ("we built and ran client storefronts and booking systems; those lessons became NEVORA") in place of a portfolio.

### Gaps
- No primary or archived evidence (e.g. Wayback snapshots) was gathered on how 37signals, Campaign Monitor or Wildbit changed their websites during the transition, or how they messaged existing clients. A Wayback Machine review of 37signals.com from 2004 to 2006 would close this.
- Mailchimp (out of the Rocket Science Group web agency), Slack (from the game Glitch), Hanno and Metalab's Flow were not researched with sources in this session, so no claims about them are made.
- Lenny's Newsletter, First Round Review and Signal v. Noise were not reached.

## 2. Information architecture for a focused product company

### Takeaway
Organize the site around the products (Workforce, Rondo, Relay) and one plans/pricing path. Merge or retire service pages. Turn the portfolio into a short "built by Velani" credibility strip or an "about/origin" section, not a gallery. Keep a discreet custom-work path through contact rather than a primary page. Market data supports making "Try for free" and "Take a tour" first-class CTAs alongside or instead of "Book a demo" for a small-business product.

### Cited Findings
- On a random sample of about 5,000 B2B SaaS sites: "Book a Demo" CTAs appear on 61%, "Try for Free" on 22%, and interactive-demo CTAs on 18% (up from 12% in 2024). **[VENDOR: Navattic]** — [Navattic, State of the Interactive Product Demo 2026](https://navattic.com/report/state-of-the-interactive-product-demo-2026)
- Among top-performing demos, 62% are hosted on product pages and 48% on homepages. 52% appear in more than one location, and 80% sit above the fold or in the navbar. **[VENDOR: Navattic]** — [Navattic 2026](https://navattic.com/report/state-of-the-interactive-product-demo-2026)
- Agency-to-product advice warns against bespoke client work on the product: "doing bespoke work for individual clients on a product is something you want to avoid if you can." — [Indie Hackers](https://www.indiehackers.com/post/z7aawav5zElZkMEAHG7f)

### Inferences (proposed IA for Velani; inferred from findings above plus the repo's route list, not from an external IA standard)
- **Keep / promote:** Home (company plus three products), `/pages/products` (product index), `/pages/nevora` (Workforce), plus dedicated product pages for Rondo and Relay when content is ready, `/pages/plans`, the trial path (`/pages/prueba` → EN equivalent), `/pages/contact`, About, Help, legal and billing utility pages.
- **Retire or repurpose:** `/pages/custom-development` and `/pages/es-a-la-medida`. Two options:
  1. *Repurpose in place* (lowest SEO risk; no redirect needed): rewrite as a short, unlinked-from-nav "Custom work by request" page ("We occasionally take on select custom builds for existing customers; contact us"), linked only from the footer and contact page. Keep it indexable, or apply noindex (see §3).
  2. *Retire with a 301* to the nearest relevant page (e.g. `/pages/products` or `/pages/contact`). On Shopify this requires deleting or hiding the page in the live store first (see §3), so it **needs separate authorization**.
- **Portfolio/case studies:** convert to a "Built by Velani" credibility section on About: a few logos or outcomes with client permission, framed as where the product know-how came from. Do not keep a full portfolio gallery, which signals agency. If portfolio URLs exist and have backlinks, 301 each to the closest equivalent (About or the relevant product), not all to the homepage.
- **Waitlist product (Rondo or Relay, whichever is pre-launch):** keep a real product page with a waitlist form rather than a thin "coming soon" stub. That gives it something to rank on later and avoids a thin or soft-404-like page.

### Gaps
- No independent (non-vendor) study was found comparing nav structures or "custom work" placement for conversion. The proposed IA is reasoned from precedent, not measured.
- Apple-like premium IA patterns (e.g. one product per page, "Compare" pages) were not researched with sources here; another researcher may cover design.

## 3. SEO and migration: redirects on Shopify, hreflang for EN/ES pairs, soft-404s, structured data

### Takeaway
Use page-to-closest-equivalent 301s, never mass redirects to the homepage, which Google may treat as soft 404s. Keep redirects for at least a year. Update hreflang pairs and sitemaps in the same change. On Shopify, **admin URL redirects only fire when the old URL already returns 404**, so a retired page must first be deleted or hidden in the live store. That is a live action outside this build's permissions. Repurposing a page in place, or using the `seo.hidden` metafield, avoids that. SoftwareApplication rich results require a rating or review, so Velani likely isn't eligible yet. The markup is still useful for entity clarity, but don't fabricate ratings.

### Cited Findings
**Google on redirects and removed content**
- "We recommend that you use HTTP permanent redirects if possible, such as 301 and 308." Avoid chains, "ideally no more than 3 and fewer than 5". — [Google Search Central: Site moves with URL changes](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- "Don't redirect many old URLs to one irrelevant single URL destination, such as the home page of the new site." This may be treated as a soft 404. Consolidating several pages into one new page is a valid redirect case. — [Google Search Central](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- For content not being moved, make sure "those URLs correctly return an HTTP 404 or 410 error response code". — [Google Search Central](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- "Keep the redirects for as long as possible", "generally at least 1 year". Update your own internal links and high-volume external links to the new URLs. — [Google Search Central](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- Each new URL should have a self-referencing canonical. Update hreflang annotations to the new URLs, submit updated sitemaps, and monitor Search Console indexing reports and logs. — [Google Search Central](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)

**Google on hreflang**
- "If two pages don't both point to each other, the tags will be ignored." Each page lists every variant "including itself". URLs must be fully qualified. — [Google: Localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- `x-default` "was designed for language selector pages". Language codes are ISO 639-1 with an optional ISO 3166-1 region, and a region alone isn't valid. — [Google: Localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- Annotations go in `<head>` and must not be combined with other attributes such as `media`. Use one consistent method. — [Google: Localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)

**Shopify URL redirects**
- Admin path: Content > Menus > View URL redirects > Create URL redirect. CSV import and export are supported. — [Shopify Help: Creating and managing URL redirects](https://help.shopify.com/en/manual/online-store/menus-and-links/url-redirect)
- "You can redirect only from broken URLs." "If the URL still loads a valid webpage, then the URL redirect won't work." — [Shopify Help](https://help.shopify.com/en/manual/online-store/menus-and-links/url-redirect)
- Limits: 100,000 redirects on most plans, 20,000,000 on Plus. `/apps`, `/cart`, `/orders`, `/shop` and some fixed paths can't be redirected. `/pages/` isn't in the restricted list. — [Shopify Help](https://help.shopify.com/en/manual/online-store/menus-and-links/url-redirect)
- The help page contradicts itself on market/language subfolders: one section says a redirect "applies to all language or market subfolders", another says redirects "don't automatically apply to all market subfolders". Velani's ES pages are separate `/pages/es-*` handles, not Markets subfolders, so each ES page needs its own redirect anyway. — [Shopify Help](https://help.shopify.com/en/manual/online-store/menus-and-links/url-redirect)
- The help page implies but doesn't state a 301 status code ("301 redirects are cached by browsers and search engines"). Third-party guides say Shopify can't create temporary 302 redirects. — [Shopify Help](https://help.shopify.com/en/manual/online-store/menus-and-links/url-redirect); [tiny-img: Shopify redirects](https://tiny-img.com/blog/shopify-redirects/)
- The `seo.hidden` metafield (namespace `seo`, key `hidden`, value 1, `number_integer`) adds noindex/nofollow and removes the resource from the sitemap. Merchants report the nofollow can't be turned off. It is reversible by deleting the metafield. Note that it is a store-data write, not a theme change. — [Shopify.dev: Manage SEO / meta tags](https://shopify.dev/docs/apps/marketing/seo); [Shopify Community thread](https://community.shopify.com/t/products-removed-from-sitemap-automatically-get-noindex-nofollow-upon-ticking-seo-hidden/200714); [Shopify blog: noindex a Shopify page](https://www.shopify.com/blog/noindex-shopify-page)

**Structured data**
- SoftwareApplication rich results: `name` is required, and "You must include one of the following properties: aggregateRating or review". For free apps, set `offers.price` to 0. `applicationCategory` (e.g. `BusinessApplication`) and `operatingSystem` are recommended. — [Google: Software app structured data](https://developers.google.com/search/docs/appearance/structured-data/software-app)

### Inferences
- **Practical Velani migration plan (planning only):**
  1. Build a redirect map listing each retired EN URL and its ES pair, each going to its closest equivalent. Example: `/pages/custom-development` → `/pages/contact` (or a repurposed page), and `/pages/es-a-la-medida` → `/pages/es-contacto`. Map EN→EN and ES→ES; never send ES to an EN page.
  2. Remove retired pairs from the theme's hreflang pair map **in the same release** that retires them, so no hreflang points at a redirected or 404 URL. Keep x-default → EN.
  3. Update internal links (nav, footer, `llms.txt.liquid`, in-page CTAs) so nothing links to retired URLs.
  4. Activating redirects requires deleting or hiding the Shopify page and creating admin redirects. Both are live-store writes that **need separate owner authorization** under AGENTS.md. Until then, repurposing in place is the zero-risk option and can ship inside an unpublished theme.
- A theme-level JavaScript or meta-refresh "redirect" from inside a page template is not an HTTP 301. It may confuse crawlers, and the page still returns 200 with thin content (soft-404 risk). Inferred; not verified against a Google doc in this session. Prefer admin redirects when authorized, or real repurposed content.
- Product-focused pages vs. service pages: no credible ranking study was found. Logically, a product page targets product and category queries ("employee scheduling software for small business"), while service pages targeted "web design agency [city]". Retiring service pages will likely lose that local-agency traffic. This is acceptable because it no longer matches the offer, but check Search Console for which queries currently land on `/pages/custom-development` before retiring it.
- Add SoftwareApplication JSON-LD (name, applicationCategory `BusinessApplication`, `offers` with real price or 0 for the trial tier, operatingSystem "Web") to the product pages. Add `aggregateRating`/`review` only when genuine reviews exist; fabricating them breaks Google's guidelines and AGENTS.md's truthfulness rules. Without them, expect no rich result.

### Gaps
- No authoritative source was found on how long Google takes to drop or consolidate a retired small-site page, or on quantified traffic loss from retiring service pages.
- Shopify's exact HTTP status for admin redirects (301 vs. 302) isn't stated on the help page; verify with `curl -I` on a test redirect once authorized.
- Whether `seo.hidden` officially applies to Online Store *pages* (vs. products/articles) is disputed across sources.

## 4. Conversion design: free trial (no card) and waitlist; demo vs. trial; interactive demos

### Takeaway
For a small-business product with a no-card trial, the main CTA should be "Start free trial", with "Take a tour" (interactive or simulated demo) as the secondary. "Book a demo" is the enterprise default but adds friction for SMB buyers. For a waitlist product, use a single primary CTA ("Join the waitlist"), one email field, and an honest status line. Evidence that interactive demos lift conversion comes almost entirely from vendors; treat it as directional and test it yourself.

### Cited Findings
- Navattic 2026 benchmarks for top-1% demos (ranked by CTR, at least 100 engaged users each): 56% engagement, 48% completion, 71% CTR, 2.2 min. Top 10%: 53% / 40% / 32% / 3.0 min. **[VENDOR: Navattic; own customers only; the report has internal inconsistencies, e.g. mid/bottom CTR shown as 64% in text vs 69%/59% in the table]** — [Navattic 2026](https://navattic.com/report/state-of-the-interactive-product-demo-2026)
- Ungated demos (66% of top demos) get higher engagement and completion (58%/49%) than gated ones (52%/42%). Gated demos get slightly higher CTR (72% vs 69%). Of gated demos, 75% use a single form field. **[VENDOR]** — [Navattic 2026](https://navattic.com/report/state-of-the-interactive-product-demo-2026)
- Flows of 1–6 steps have the highest completion. Multi-flow demos have 57% completion vs 35% for single-flow. Dialog text works best at 10–20 words on step 1. Desktop sessions average 2.7 min vs 1.2 min on mobile, and 52% of demos have a mobile strategy. **[VENDOR]** — [Navattic 2026](https://navattic.com/report/state-of-the-interactive-product-demo-2026)
- Navattic claims interactive demos convert 12% better than product videos, citing a Wistia 2025 report. The earlier Navattic report claimed a 16% website conversion lift. HockeyStack data showed 1.5x better MQL→SQL for visitors who engaged a demo. **[VENDOR, second-hand]** — [Navattic 2026](https://navattic.com/report/state-of-the-interactive-product-demo-2026); [HockeyStack: Do interactive demos work](https://hockeystack.com/lab-blog-posts/do-interactive-demos-work)
- Arcade publishes its own "interactive demo statistics". **[VENDOR, not read in full]** — [Arcade](https://www.arcade.software/post/interactive-demo-statistics)

### Inferences
- **CTA hierarchy for Velani:**
  - NEVORA Workforce (trial, no card): primary "Start free trial", secondary "Take a 2-minute tour" (an in-page simulated UI or recorded demo, ungated), tertiary "See plans". Use one primary per viewport and repeat it in the nav.
  - Waitlist product: primary "Join the waitlist" (email only), secondary "See what it does" (tour). Avoid a "Start trial" button that leads nowhere.
  - Custom work: no CTA in hero or nav; a single text link in the footer or contact page.
- An **in-page simulated UI** (built in the theme, no third-party script) avoids vendor cost, CSP/privacy issues and extra JS weight, and fits the "premium, Apple-like" look. Keep it to 1–6 steps, short captions, ungated, with a mobile variant. Vendor tools (Navattic, Arcade, Storylane) add analytics and visitor identification but also third-party tracking, which conflicts with privacy-first analytics and would add spend. Spending is restricted by AGENTS.md.
- Demo engagement → trial start is the funnel step to measure. No independent evidence was found that demos raise *paid* conversion for SMB tools.
- Per AGENTS.md, preview inquiry delivery must stay disabled. Waitlist and trial forms in preview should be labeled as preview/non-delivering.

### Gaps
- No independent (non-vendor, peer-reviewed or A/B-published) study of interactive-demo lift was found.
- No credible data was found on waitlist page conversion benchmarks (visit → waitlist signup).
- Storylane's own research was not fetched.

## 5. Growth measurement: minimal KPIs, privacy-respecting analytics, trial-conversion benchmarks

### Takeaway
Track a small funnel: sessions by landing page → product-page view → CTA click (trial / tour / waitlist) → trial start or waitlist signup → (in-app) activation → paid. Add tour engagement and scroll depth on product pages. A cookieless tool such as Plausible covers custom events, funnels and scroll depth without a consent banner (vendor claim). Published benchmarks for no-card trial-to-paid cluster around **~17–25%**, but definitions differ widely and most figures are vendor or agency compilations.

### Cited Findings
- Plausible supports custom events (`window.plausible('Signup')`), pageview goals, scroll-depth goals (automatic 1–100% tracking), and funnels (including strict-order funnels). It claims no cookies, no personal data and no persistent identifiers, so no consent banner is needed. **[VENDOR claims; verify on plausible.io; some results were mirror domains]** — [Plausible changelog](https://plausible.io/changelog); [Plausible WordPress plugin page](https://wordpress.org/plugins/plausible-analytics/)
- Opt-in (no card) vs. opt-out (card required) trial-to-paid:
  - First Page Sage: ~18.2% vs ~48.8% (86 SaaS companies); another summary of the same firm gives 17.3% vs 49.1%. **[agency report, figures via secondary summaries]** — [Flint summary](https://www.flint.com/blog/b2b-saas-free-trial-conversion-rate-statistics); [Shno compilation](https://www.shno.co/marketing-statistics/free-trial-conversion-statistics)
  - 1Capture: median B2B trial-to-paid 18.5%, top quartile 35–45%. **[VENDOR]** — [Shno compilation](https://www.shno.co/marketing-statistics/free-trial-conversion-statistics)
  - Visionary Marketing (May 2026, 84,200 trials): opt-in 25.2%, opt-out 60.4%, freemium 4.7%. **[agency]** — [Visionary Marketing](https://visionary-marketing.co.uk/blog/saas-free-trial-conversion-statistics-2026)
  - ChartMogul is reported to have found opt-in trials converting at 8.9%; not verified at the primary source. — [Userpilot](https://userpilot.com/blog/free-trial-conversion-rate/)
  - Userpilot gives "good" 4–6% and "great" 10–15% for no-card trials, apparently measured per signup, so not comparable. **[VENDOR]** — [Userpilot](https://userpilot.com/blog/free-trial-conversion-rate/)
- These sources use inconsistent definitions (trial-to-paid vs. signup-to-paid, time windows, traffic mix). — [Userpilot](https://userpilot.com/blog/free-trial-conversion-rate/); [Shno](https://www.shno.co/marketing-statistics/free-trial-conversion-statistics)

### Inferences
- **Minimal KPI set for Velani's marketing site** (each one a named event; Spanish pages tagged with a `lang` property so EN and ES can be compared):
  1. Visit → product-page view rate (do visitors find the products?).
  2. CTA click-through by CTA type and location (`cta_click` {cta: trial|tour|waitlist|plans|contact, location: hero|nav|section|footer}).
  3. Tour engagement: `tour_start`, `tour_complete` (completion %).
  4. Trial starts (`trial_start`) and waitlist signups (`waitlist_signup`) per unique visitor: the headline conversion metrics.
  5. Scroll depth on product pages (does the story get read?).
  6. Downstream (in product or billing, not the theme): trial → activated → paid.
  7. Retired-URL health: 404 hits and redirect hits from Search Console and logs after any authorized migration.
- At small traffic volumes, A/B tests won't reach significance quickly. Track trends monthly, make one major change at a time, and annotate releases.
- Use about 15–25% opt-in trial-to-paid as a rough sanity band, not a target. Velani's own baseline matters more.
- Any analytics script added to a theme must respect the repo's preview CSP tests and AGENTS.md (no live enablement or spending without authorization). A paid Plausible plan would be new spending.

### Gaps
- OpenView's PLG benchmarks (OpenView shut down in 2024), ProfitWell/Paddle and ChartMogul primary reports were not accessed directly. No 2026 primary benchmark specific to *small-business* SaaS trial conversion was found.
- No credible benchmark was found for marketing-site visit → trial-start rate for SMB SaaS.
- Plausible's current pricing and plan tiers for funnels and properties were not verified on the official site.
