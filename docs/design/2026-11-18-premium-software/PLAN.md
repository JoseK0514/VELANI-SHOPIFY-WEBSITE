# Velani as a software company: redesign plan

November 18, 2026. Planning and mockup only. No theme was uploaded, published or changed, and no store resource, policy, menu or setting was touched.

- Mockup: [`velani-premium-home.html`](velani-premium-home.html) (source with placeholders: `home.template.html`)
- Research report: [`reports/Velani premium software site strategy.md`](../../../reports/Velani%20premium%20software%20site%20strategy.md), with notes in `research_notes/Velani premium software site strategy/`
- NEVORA screens in the mockup are rebuilt from the Direction B system on NEVORA `claude-codex-collab-nevora` @ `f01ebc1a` (read-only clone; NEVORA was not changed)

## 1. What changes

| Today | After |
|---|---|
| Header: NEVORA · Custom software · Company | NEVORA · Rondo · Relay · Plans · Company |
| Websites, booking apps, online stores and business tools are sold as services | Gone from the header, home, products page and footer |
| Abstract teal light-swirl images and a large empty wordmark band | The product is the picture: real NEVORA screens, built in HTML |
| Product cards in a three-up grid | A typographic product index: three names, three statuses |
| Same fade-in on every block | One scroll moment per chapter: a sunrise hero, a pinned day with a rolling clock and changing sky, a word-lit statement, a staged Rondo chat, Apple-style product tiles |
| Mostly dark pages | Mostly light pages; night appears only where the story reaches it |
| NEVORA shown in the older app look | NEVORA shown in Direction B (Inter, teal band, glass figures, 22px white cards, ink payday tile) on MacBook, iPad and iPhone frames |

What stays: the Velani wordmark, published prices ($19 up to 15 employees, $29 for 16 to 30), "Request a free trial", the EN/ES pairs, the legal and NEVORA policy pages, the preview inquiry safeguards and the commerce publication guard.

## 2. Design system (version 2, "Open to close")

Version 1 (dark ink chapters, dense dashboards) was rejected as generic and gloomy. It is kept as `v1-velani-premium-home.html` for the record.

- **Concept**: the homepage is one Saturday at a café in San Juan. A pinned "day" chapter moves the sky and a rolling clock from 5:45 AM to 10:00 PM as you scroll, with one NEVORA moment per hour: the schedule notification, clock-in, Rondo finding cover, timecards, payroll.
- **Light first**: page `#FBFBFD`, tiles `#F5F5F7`, ink `#1D1D1F`. Dawn sky in the hero; the day's sky is interpolated between dawn, morning, noon, golden hour, dusk and night. Rondo lives in the night `#0A1024` that the day ends on.
- **Type**: the system face (SF Pro on Apple devices, Inter elsewhere) for the site, set large and tight; a thin weight for the clock. DM Sans stays available as a tweak if Jose prefers the current brand face. Inter appears inside NEVORA screens because the app uses it.
- **Product imagery**: real Direction B screens inside crafted MacBook, iPad and iPhone frames; the NEVORA app icon from the iOS project on the lock screen. No stock photos or AI renders.
- **Accent**: NEVORA teal `#0B6E69` for actions and links; mint `#7FE3D5` on night. Amber and green only as product status.
- **Status words** are fixed: NEVORA "Available now", Rondo "Included in NEVORA", Relay "In design".
- **Motion**: transform, opacity and color only; ease `cubic-bezier(.22,1,.36,1)`. Native scroll everywhere; no scroll hijacking, snapping or smooth-scroll library. Reduced motion keeps the moments and colors but drops movement.

## 3. Pages

| Route (EN / ES) | Plan |
|---|---|
| `/` · `/pages/es` | Rebuild as in the mockup: hero with Owner Home, product index, the week, statement, Rondo, bilingual, Relay, plans |
| `/pages/nevora` · `/pages/es-nevora` | The deep story: the week scene in full (schedule, Clocker with the PIN demo, timecards, pay), Rondo, plans. Reuse the existing working Clocker demo, restyled to Direction B |
| `/pages/products` · `/pages/es-productos` | Becomes the product index plus a short status note per product |
| `/pages/plans` · `/pages/es-planes` | Keep content, restyle: price at display size, conditions as a plain list |
| Relay | New section on Products and Home; waitlist goes through the existing contact `?interest=relay` path (preview delivery stays off) |
| `/pages/custom-development` · `/pages/es-a-la-medida` | Repurpose in place to a short "Custom work by request" page linked from the footer and Contact only. No deletion and no redirect in this build |
| `/pages/about` | Velani company page: San Juan, the products, how NEVORA started. No client gallery |
| Contact, Help, legal, NEVORA policies | Keep; restyle only the shared header and footer |

## 4. Build phases

Each phase ends with a checkpoint for Jose before the next one starts.

1. **Decisions** (no code). Answer the open questions in section 6.
2. **Copy and IA in source.** Update `src/content.mjs`, `src/content.es.mjs`, `src/night.mjs` nav strings, the footers and the custom-development pair. Run the copy through the stop-slop rules and the Spanish glossary. Checkpoint: copy review in EN and ES.
3. **Tokens and components.** New tokens in `src/night/base.css`; Direction B product components as HTML partials (Owner Home, schedule week, Clocker, timecards, pay statement, employee phone, Rondo chat, Relay tickets), with sample data taken from the existing fictional set. Checkpoint: component sheet.
4. **Scroll engine.** One file under 10 KB compressed. CSS `animation-timeline: view()` behind `@supports` and `prefers-reduced-motion: no-preference`; the existing IntersectionObserver path in `src/night/motion.js` as the fallback. JS only writes CSS custom properties with `style.setProperty`, which the CSP allows. Scenes are `<scroll-scene>` custom elements so the Shopify theme editor's `shopify:section:load`/`unload` re-runs them. Under 900px the pinned stage turns off and each step shows its own screen.
5. **Pages.** Home, then NEVORA, then Products and Plans, then About and the repurposed custom page. English first, Spanish mirror in the same change for each page.
6. **Verification** (local; not hosted acceptance). `npm test`, `npm run build`, `npm run check:theme`, `npm run check:browser` in Chromium, Firefox and WebKit, plus new Playwright runs: screenshots at 0/25/50/75/100% of each scene at 390, 834 and 1440px; reduced motion; JavaScript off (every heading and screen visible); CLS under 0.1 across a scripted scroll; zero CSP violations; axe. Keep failed runs in `evidence/`.
7. **Unpublished theme review.** Only after Jose authorizes it: upload to an unpublished theme, read back, and check Lighthouse on Shopify's CDN.
8. **After launch** (separate authorization). Add measurement (section 5). Use the Canva campaign skill to produce the launch posts from an approved brief, and the growth-pulse skill once there is traffic and analytics to read.

## 5. What to measure

Events, each tagged with `lang`: `cta_click {cta, location}`, `product_view`, `tour_start`, `tour_complete`, scroll depth on NEVORA, `trial_request`, `waitlist_signup` (Relay, kept separate). The number the redesign has to move is trial requests per visitor, compared EN against ES. Wire events as no-ops until Jose approves an analytics tool; a paid plan is new spending.

## 6. Open questions for Jose

1. **Rondo status.** The nav says "In development"; the Products page says Rondo "is available". The mockup uses "Included in NEVORA". Which is true for a trial customer today?
2. **Custom work.** Keep a quiet "Custom work by request" page for existing clients, or remove the offer entirely?
3. **Redirects.** A true 301 off `/pages/custom-development` means deleting or hiding the live page first. Repurposing in place needs no store change. Is that acceptable for now?
4. **Relay waitlist.** Use the existing contact path (`?interest=relay`), or build a dedicated email-only form?
5. **Puerto Rico payroll.** Can marketing mention Puerto Rico overtime rules? Only if NEVORA's calculation has been verified against Act 4-2017; never as a compliance guarantee.
6. **Hero line.** "Software for the shift." is a proposal. Keep, or keep the current "Your team's week, from first shift to payday."?

## 7. Notes on the mockup

- Every person, place and figure is fictional sample data from the existing site and NEVORA mocks. Figures add up: 21 shifts and 168 scheduled hours; 167:44 approved hours × the $15.00 sample rate = $2,516.00; today's punches total 35:47.
- The lock-screen notification uses NEVORA's real "Horario publicado" (schedule published) notification. The hero tablet's clock shows the viewer's real time.
- Rondo's chat is a scripted sample in English and Spanish. The Approve button changes nothing.
- Relay's kitchen screen is a concept and says so on the screen.
- The **Tweaks** button (bottom right) shows design notes, switches to DM Sans and previews reduced motion.
- Source: `home.template.html` (page), `screens.html` and `screens.css` (NEVORA screens), `build.py` (assembles `velani-premium-home.html`).
- The UI/UX Pro Max search database isn't installed in this environment, so its built-in rule tables were used instead of database queries.
