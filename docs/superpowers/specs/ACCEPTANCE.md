# The Velani — conditions and expected results
Status: TEST DESIGN ONLY. All runtime/browser cases below are NOT RUN.

| ID | Condition | Expected result / required evidence |
| --- | --- | --- |
| C01 | Visit Home, Products, NEVORA, Custom Development, About, Contact and Help | Correct purpose, complete content, truthful CTAs and valid routes; no leftover coffee/pet copy or sample storefront UI |
| C02 | Visit every legal route and every legacy /policies alias | Correct operator, scope, contact and version; old policy aliases included in the reviewed cutover; no OPEN token or unverified legal claim |
| C03 | NEVORA appears on any route | In development is clear; no live signup, pricing, production/native readiness or unavailable feature promise |
| V01 | View core and legal pages at 320, 390, 768, 1024, 1440 and 1920 CSS px | Deliberate hierarchy, no horizontal overflow, clipping, overlaps or unreadable legal text; batched screenshots |
| V02 | Inspect hero, product, service and contact pages together | Shared tokens and controls; varied purposeful composition; no generic glows, fake metrics, client logos or invented proof |
| V03 | Slow image/font loading, reduced motion, disabled JS | Stable geometry; content and navigation remain usable; no hidden-until-animation body or mandatory animation |
| A01 | Use keyboard only, including mobile menu, forms and cookie controls | Logical order, visible unobscured focus, Escape/restore where relevant, no trap, real labels and status messages |
| A02 | Run accessibility scans and manual reading/zoom checks | No unresolved serious/critical automated violations; manual WCAG 2.2 AA review with 200% zoom, contrast and 44px proposed touch targets |
| F01 | Submit blank/invalid inquiry with delivery intercepted | Field-associated errors, first invalid field focused, values preserved, no success state or external email |
| F02 | Platform explicitly accepts a fictional intercepted inquiry | Accepted state only after that response; one local submission; no claim of actual inbox delivery |
| F03 | Rejected, offline, rate-limited, challenge or dropped response | Specific recovery, preserved values, no automatic POST retry; uncertainty is explicit |
| F04 | Native Shopify inquiry integration in the actual draft | Supported Liquid form and CAPTCHA path; verified recipient/configuration; real delivery remains NOT RUN until separately authorized |
| P01 | First visit and rejected/absent consent | Optional integrations remain blocked where required; actual Shopify storage/network activity is recorded and policy matches it |
| P02 | Accept, reject, granular save, reopen and withdraw choices | Supported Customer Privacy API updates from visitor action; accessible UI; no direct cookie edits or automatic consent |
| P03 | Privacy API fails or applicable opt-out signal is present | Optional integrations fail closed; verified signal behavior; no unsubstantiated privacy claims |
| P04 | Inquiry is submitted or policy request is received | Correct actual recipient and agreed retention/rights procedure; no automatic newsletter enrolment or sensitive payload logging |
| T01 | Validate final Liquid, JSON templates and theme assets | Actual selected tools pass; report commands, source/theme ID and findings; static fixture render is not hosted Shopify acceptance |
| T02 | Run real Chromium, WebKit and Firefox through principal routes/states | No unexpected console/page/runtime errors; no broken internal, fragment, footer or asset links |
| T03 | Missing resource and malformed/old route | Actual 404 or explicitly mapped meaningful redirect; no soft-404 loop or unrelated blanket homepage redirect |
| T04 | Measure representative mobile production-like pages | Target LCP ≤2.5s and CLS ≤0.1 under documented conditions; INP ≤200ms assessed when real field data exists; no fabricated performance score |
| T05 | Inspect metadata and indexability | Unique titles/descriptions, accurate OG/favicons, correct canonical, appropriate final sitemap/robots; drafts are not indexed |
| S01 | Write any draft theme file | Exact returned target ID checked UNPUBLISHED immediately before write; MAIN and old drafts preserved |
| S02 | Stage policies/pages/menus | No store-wide policy/menu/settings mutation disguised as a theme change; content preview method proved |
| S03 | Review eventual publication change set | Baseline export/restoration proof; old samples/direct checkout/routes and global policies addressed; explicit decision covers actual resources |
| S04 | Confirm project boundaries | No NEVORA code/config, role permissions, provider activation, real notifications, payments or release action changed |

## Evidence format

Every executed case records date, exact local source/tree and theme ID/role where applicable, environment, browser/version, viewport, expected result, actual result, evidence path and unresolved findings. Keep failures and original evidence. A plan, a stub response or a screenshot alone cannot certify a working deployed site.

Use fictional form data and blocked/intercepted delivery. Do not silently rerun a real inquiry, purchase or notification to obtain a green result.

## Review gates

After design approval: implementation checks, one batched mobile/desktop visual pass, a consolidated fix pass, and a confirmation pass. Independent review verifies the scoped result. Broaden testing only for an actual failure or unresolved risk. Publication, policy/legal finality and actual delivery remain separately evidenced decisions.

