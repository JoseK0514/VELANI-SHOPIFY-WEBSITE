# Velani site structure plan

November 19, 2026. Planning only. Nothing here publishes a theme, creates Shopify Page resources, adds redirects or changes menus or store settings; each of those needs Jose's separate go-ahead.

Mockups: homepage `velani-premium-home.html`, NEVORA page `velani-nevora.html`. Wider plan: `PLAN.md`.

## 1. Rules every page follows

1. **Velani is the company; NEVORA is the product family.** Rondo lives inside NEVORA. Relay is NEVORA's next product.
2. **One action everywhere:** "Request a free trial". Every page has it in the header; marketing pages repeat it where interest peaks.
3. **The day is the visual language.** Each marketing page sits in the light of an hour: dawn for openings, night for money and Rondo, dawn again for the final call to action.
4. **No website-creation services** in menus, product lists or page copy.
5. **No location callouts** in marketing copy. The legal pages keep the company's registered contact details.
6. **Every marketing page has a Spanish twin** with the same design, linked with the EN | ES switch and hreflang.

## 2. Sitemap

```
Velani (home)                       /                          ES /pages/es
├── NEVORA Workforce                /pages/nevora              ES /pages/es-nevora
│   ├── Rondo            (new)      /pages/rondo               ES /pages/es-rondo
│   └── Plans                       /pages/plans               ES /pages/es-planes
├── Relay                (new)      /pages/relay               ES /pages/es-relay
├── About                           /pages/about               ES /pages/es-nosotros
├── Support                         /pages/help                ES /pages/es-ayuda
│   ├── Contact                     /pages/contact             ES /pages/es-contacto
│   ├── NEVORA support              /pages/nevora-support
│   ├── How to sign in              /pages/sign-in             ES /pages/es-entrar
│   └── Delete your account         /pages/nevora-account-deletion
├── Start (product flows, restyle only)
│   ├── Your free trial             /pages/nevora-start        ES /pages/es-prueba
│   ├── Set up your workplace       /pages/nevora-verify       ES /pages/es-configurar
│   ├── Plan and billing            /pages/nevora-billing      ES /pages/es-facturacion
│   └── Billing return              /pages/nevora-billing-return  ES /pages/es-pago
└── Legal                           /pages/legal
    ├── Privacy notice              /pages/privacy
    ├── Cookies and preferences     /pages/cookies
    ├── Website terms               /pages/website-terms
    ├── NEVORA privacy policy       /pages/nevora-privacy
    ├── NEVORA terms of use         /pages/nevora-terms
    ├── Accessibility               /pages/accessibility
    └── Security contact            /pages/security

Kept out of menus:  /pages/products, /pages/es-productos  (light product index, decision 3)
Removed:            /pages/custom-development, /pages/es-a-la-medida, /pages/software-project-terms  (decision 2)
```

## 3. Header

**Desktop, every page** (translucent bar, 48px):

`[VELANI]   NEVORA   Rondo   Relay   Plans   Support          EN | ES   Sign in   [Free trial]`

- "Company" and "Custom software" dropdowns are removed. About moves to the footer.
- The bar turns dark over night sections.

**Product pages** (NEVORA, Rondo, Relay, Plans) add a second sticky bar, Apple style:

| Page | Left | Section links | Button |
|---|---|---|---|
| NEVORA | NEVORA Workforce | Schedule · Your team · Time clock · Rondo · Timecards · Payroll · Plans | Request a free trial |
| Rondo | Rondo | How it works · Approvals · Questions | Request a free trial |
| Relay | Relay | What it does · Waitlist | Join the waitlist |
| Plans | NEVORA Plans | Plans · What's included · Questions | Request a free trial |

**Phone:** the logo, a Free trial button and a menu button. The menu opens full screen with the six header links in large type, then Sign in and EN | ES.

## 4. Footer

Light grey, small type, Apple style. Four columns, then a bottom bar.

| Products | Get started | Support | Company |
|---|---|---|---|
| NEVORA Workforce | Request a free trial | Help | About |
| Rondo | Plans | Contact | Security |
| Relay (In design) | Sign in | NEVORA support | Accessibility |
| | Set up your workplace | Delete your account | |

Above the columns: the sample-data and payroll disclaimers ("NEVORA calculates pay; it doesn't pay employees or file payroll taxes").
Bottom bar: `© 2026 VELANI LLC` · Privacy · Cookies · Website terms · NEVORA privacy · NEVORA terms · Legal · `EN | ES` · support@thevelani.com · Monday to Friday, 8 am to 9 pm ET.

## 5. Homepage, final order

| # | Section | Job | Action | Status |
|---|---|---|---|---|
| 1 | Hero: "Open to close." | Promise and product in the first screen; sky follows the visitor's time | Request a free trial · Watch the day | Mocked |
| 2 | Statement | "Software for small businesses…" | none | Mocked |
| 3 | The day (5:45 AM to 10:00 PM) | Show NEVORA working, one hour at a time | Free trial at 10:00 PM | Mocked |
| 4 | Rondo | Ask in plain words, EN/ES | Learn about Rondo → /pages/rondo | Mocked |
| 5 | Products | NEVORA, Rondo, Relay tiles | Learn more · Join the waitlist | Mocked |
| 6 | How starting works | Lower the risk: request → Jose replies within two business days → set up together → pick a plan on day 30 | Request a free trial · See plans | Mocked |
| 7 | Plans | $19 / $29, what's included | See plans | Mocked |
| 8 | En español | Bilingual promise | none | Mocked |
| 9 | Footer | Section 4 | | Restyle |

Reserved, only with real material: a signed note from Jose (before Plans) and a customer quote (after the day). No placeholders.

## 6. Pages

| Page | Job | Sections | Light | Status |
|---|---|---|---|---|
| **NEVORA** | Let an owner try NEVORA before asking | Zoom hero · highlights · schedule · team · time clock · Rondo · timecards · payroll · plans · questions · closing | full day | Mocked |
| **Rondo** (new, approved, **mocked**: `velani-rondo.html`) | Explain the assistant honestly | Hero question that types itself · pick-a-question demo (EN/ES) · "You approve every change" · what it can and can't do · who sees it (Owner only) · questions | noon to night | To design |
| **Relay** (new, approved, **mocked**: `velani-relay.html`) | Collect waitlist sign-ups without promising dates | Kitchen screen concept · three things it will do (orders, kitchen screen, inventory) · "In design" status · waitlist form · questions | golden hour | To design |
| **Plans** (**mocked**: `velani-plans.html`) | Decide and start | Two plan cards · everything included · day-30 timeline · more than 30 employees · questions | dawn | Restyle |
| **About** (**mocked**: `velani-about.html`) | Who builds this and why | Velani in one line · why NEVORA exists · how we work with you (setup, support hours, languages) · contact | morning | Rewrite |
| **Help** | Find an answer or a person | Search-style topic tiles (sign in, PINs, schedule, pay statements, billing, account deletion) · contact · support hours | white | Restyle |
| **Contact** | One form for trial, Relay waitlist and questions | Topic picker driven by `?interest=` · form · reply promise | white | Restyle, keep form logic and preview safeguards |
| Sign in, free trial, set up, billing, billing return | Product flows | Same content, new header, footer and type | white | Restyle only |
| Legal (8 pages) and NEVORA policies (4) | Trust | Same text, readable policy typography, new header and footer | white | Restyle only |
| Products | Index for old links | Three product tiles | white | Keep light, out of menus |
| 404 | Get people back | "This page closed early." · links to Home, NEVORA, Help | night | To design |
| Cookie banner | Consent | Same choices, new style | | Restyle |

## 7. Every current URL

| URL | Decision |
|---|---|
| `/`, `/pages/es` | New homepage |
| `/pages/nevora`, `/pages/es-nevora` | New NEVORA page |
| `/pages/plans`, `/pages/es-planes` | Restyle |
| `/pages/about`, `/pages/es-nosotros` | Rewrite (no location, no client gallery) |
| `/pages/help`, `/pages/es-ayuda` | Restyle |
| `/pages/contact`, `/pages/es-contacto` | Restyle; add the Relay waitlist topic |
| `/pages/products`, `/pages/es-productos` | Keep as a light index outside the menus (decision 3) |
| `/pages/custom-development`, `/pages/es-a-la-medida` | Remove (decision 2) |
| `/pages/sign-in`, `/pages/es-entrar` | Restyle |
| `/pages/nevora-start`, `/pages/es-prueba` | Restyle |
| `/pages/nevora-verify`, `/pages/es-configurar` | Restyle |
| `/pages/nevora-billing`, `/pages/es-facturacion` | Restyle |
| `/pages/nevora-billing-return`, `/pages/es-pago` | Restyle |
| `/pages/legal`, `/pages/privacy`, `/pages/cookies`, `/pages/website-terms`, `/pages/accessibility`, `/pages/security` | Restyle |
| `/pages/software-project-terms` | Remove (decision 2) |
| `/pages/nevora-support`, `/pages/nevora-privacy`, `/pages/nevora-terms`, `/pages/nevora-account-deletion` | Restyle |
| New: `/pages/rondo`, `/pages/es-rondo`, `/pages/relay`, `/pages/es-relay` | Build (approved); the four Shopify Page resources are created at publish time with Jose's go-ahead |

## 8. Where buttons go

| Button | Today | Plan |
|---|---|---|
| Request a free trial | `/pages/contact?interest=nevora-demo` | Same until online trial signup opens, then `/pages/nevora-start` |
| Join the waitlist (Relay) | `/pages/contact?interest=relay` | Same, from the new Relay page |
| Sign in | `/pages/sign-in` | Same |
| Learn more (NEVORA) | | `/pages/nevora` |
| Learn about Rondo | | `/pages/rondo` |

Preview inquiry delivery stays disabled; nothing sends until Jose turns it on.

## 9. Build order

1. **Shared frame:** header, phone menu, footer, tokens, type. Every existing page picks up the new look at once.
2. **Homepage and NEVORA** from the mockups, EN and ES.
3. **Plans, Rondo, Relay, About.** Mock each first, then build.
4. **Help, Contact and the product flows**, restyled.
5. **Legal pages, 404 and cookie banner**, restyled.
6. **Checks:** `npm test`, build, theme check, browser checks in three engines, reduced motion, no JavaScript, phone widths, links and hreflang. Then the unpublished theme, only with Jose's go-ahead.

## 10. Decisions (Jose, November 19)

1. **Rondo is included in NEVORA.** Every page uses "Included in NEVORA". The old "In development" label goes away.
2. **Custom work is removed.** The custom development pages (EN and ES) and the software and project terms leave the site, menus, footer, legal index and every page that links to them. In the theme this is a source change. Deleting the live Shopify Page resources and adding 301 redirects (custom development → Contact, its Spanish pair → Contacto, project terms → Legal) happens only at publish time, with Jose's go-ahead.
3. **Products page (Claude's recommendation, accepted):** keep it at its URL as a light three-tile index, outside the menus, so old links still work with no store change. Retire it with a redirect to NEVORA in the same publish step as item 2 if traffic shows nobody needs it.
4. **Rondo and Relay pages are approved,** EN and ES. Their four Shopify Page resources are created only at publish time, with Jose's go-ahead.
5. **"How starting works" is added (Claude's recommendation, accepted)** between the product tiles and Plans: Today → within two business days → setup day → day 30. It is in the homepage mockup.

## 11. Mockup status (November 20)

All six marketing mockups are built from one source (`build.py`) with a shared header, phone menu, footer and product-page frame, and link to each other: Home, NEVORA, Rondo, Relay, Plans, About. Every page passes axe WCAG 2.x A/AA with 0 violations, has no horizontal scroll at 320px and no script errors. The Relay screens keep the Puerto Rican menu items (Jose, November 20).

Plans and About passed a second review (see `REVIEW-2026-11-20.md`): slider focus ring, real-calendar fallback, readable unlit headlines and a price per employee. Still to mock up: Help and Contact. Then the real theme build on an unpublished theme, then the Spanish pages.
