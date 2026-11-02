# The Velani — company website design for review
Date: 2026-11-02. Status: PROPOSED; not an implemented or approved site.

## Intent

Build a complete software-company website for The Velani with two clear paths: explore a Velani product or discuss custom software. The page system should feel intentional and credible on phones and desktops. Product status, policy accuracy and working interactions are part of the design.

## Scope and boundaries

Deliver Home, Products, NEVORA, Custom Development, About, Contact, Help/FAQ, a legal index and the applicable policy pages. Include navigation, footer, a project inquiry flow, consent choices, a useful 404 and contact success/error/uncertain states. NEVORA is In development; an inquiry is not an account signup, demo appointment, purchase or waitlist subscription.

The initial proposal is inquiry-only. Product subscriptions, payments, client contracts, an account portal, newsletters, CRM integrations and live AI features are not activated by this build. Their policies and acceptance gates are recorded separately. No client case studies or commercial proof will be invented.

The company's marketing work must not alter NEVORA source, design, permissions, activation or recovery behavior.

## Approaches and decision

1. **Unpublished Shopify theme — recommended and accepted in principle.** The domain and store already exist. Liquid gives editable content without new hosting. Tradeoff: a theme draft does not isolate shared pages, menus, policies, app scripts or product publication.
2. **Separate company-site application.** More freedom for application-like features, with additional hosting, domain cutover and maintenance. No current requirement needs this migration.

Jose's “Okey” accepted the preceding unpublished-theme recommendation. Detailed visual direction and this written design remain proposals for review.

## Proposed information architecture

| Surface | Proposed route | Visitor outcome |
| --- | --- | --- |
| Home | / | Understand the company and choose product or custom development |
| Products | /pages/products | See the current product and its truthful availability |
| NEVORA | /pages/nevora | Understand workforce-management capabilities and ask a question |
| Custom Development | /pages/custom-development | Understand engagement types, process and how to begin |
| About | /pages/about | Understand what Velani builds and how it approaches work |
| Contact | /pages/contact | Submit a minimal, specific inquiry |
| Help / FAQ | /pages/help | Find answers about inquiries, product status and engagements |
| Legal index | /pages/legal | Find current policies, scope and effective dates |
| Privacy | /pages/privacy | Understand collection, purposes, vendors, retention and rights |
| Cookies and choices | /pages/cookies | Understand processing and reopen consent controls |
| Website terms | /pages/website-terms | Understand permitted site use and which contracts govern paid work |
| Software and project information | /pages/software-project-terms | Understand product-specific and engagement-specific terms |
| Accessibility | /pages/accessibility | Read the accessibility approach and report a barrier |
| Security contact | /pages/security | Find a verified private reporting channel |
| Missing page | actual 404 response | Recover to a valid route or contact page |

Routes are a proposal. Shopify paths and policy aliases must be verified during implementation. Do not silently create globally published pages in order to make a theme preview work.

Header: Products, Custom Development, About; Contact is the named action. The footer includes Help, all applicable policies, Cookie choices and confirmed company details. Use route-specific page titles and selected navigation.

## Home narrative

1. A precise company statement with two visible actions.
2. NEVORA as a concrete product: development status, what it connects, a relevant product visual or an explicitly illustrative workflow.
3. Custom development: web applications, mobile applications, internal systems and integrations. These are proposed service categories; they are not a record of completed client projects.
4. How an engagement proceeds: discovery, agreed scope, design/build, delivery and support defined in the agreement.
5. Questions people need answered before contacting Velani.
6. A concise project invitation and complete footer.

Give each section a purpose and a distinct composition. Do not repeat a row of three rounded cards for every topic. The initial proof is the actual product direction and a clear process.

## Proposed visual direction — not yet approved

The organizing idea is a software company's working index: a strong typographic opening, a clear product view, and a direct path into a project conversation. Use spacious, asymmetric compositions that become a natural single column on phones.

- Palette proposal: paper #F7F9FC, white #FFFFFF, ink #15232C, navy #101F2B, blue #2459D3, muted #51626D. Tokenize them once; verify every actual foreground/background pair before acceptance.
- Type proposal: Sora for a small number of display headings; Source Sans 3 for body, navigation and legal reading. Confirm licensing and self-host the selected files. Use system fallbacks and stable line metrics.
- Layout: maximum 1200px marketing width; 65–75-character reading measure for policy text; a consistent spacing scale and predictable header/footer.
- Typography: fluid display size with controlled line breaks; body at least 16px; readable mobile legal text; no clipped headings or tiny decorative labels.
- One signature: a truthful, interactive overview of the relationship between product work and custom projects. A NEVORA illustration may show Schedule → Time → Review. It is labelled as an illustration unless it is a source-verified runtime capture.
- Keep actual NEVORA screenshots in their approved product style. Use fictional data, a pinned source, and an accurate development label.
- Use motion to clarify a state or a relationship, with a complete static presentation and reduced-motion behavior.

Reject generic neon gradients, fake terminals, robot art, fabricated live activity, floating feature tiles, copied logo walls, fake testimonials, arbitrary counters, stock offices and placeholder product dashboards. No invented client stories, prices, certifications or “available now” labels.

This direction is a recommendation for review. No palette, new logo or mockup has been approved or applied.

## Product and service pages

NEVORA explains scheduling, recorded time, employee requests and payroll review workflows without claiming a production release, legal payroll correctness certification or operational native notifications. Its action is Ask about NEVORA. It does not expose a private app URL or generate credentials.

Custom Development explains the problem types, what a first conversation covers, and how scope, milestones, ownership, fees and support will be agreed in writing. A page does not itself promise a fixed timeline, price, response deadline, warranty, IP transfer or maintenance term.

About uses confirmed company facts. It contains no invented founding story, team size, location or leadership profile. Help answers only what is known; omit unused surfaces rather than create empty documentation, careers or status pages.

## Inquiry flow

Use Shopify's supported Liquid contact form as the proposed transport. Preserve content_for_header and supported abuse protection; do not directly call or bypass hCaptcha libraries.

Proposed required fields: name, email, message. Company and inquiry category are optional. No attachment, telephone, budget or sensitive employee/payroll data is required. Provide a privacy link and a warning not to include credentials or sensitive records. Sending an inquiry does not opt someone into marketing.

Define idle, invalid, submitting, accepted, rejected, challenge, offline, rate-limited and uncertain outcomes. Keep geometry and entered values stable on a rejected submission; focus the first invalid field; announce concise feedback; prevent duplicate local clicks. Do not automatically retry a POST after an uncertain result.

Show acceptance only from the platform's posted-success result. This is not proof of inbox delivery. Shopify native contact POST is not assumed to provide an application idempotency guarantee; do not claim exactly-once delivery. A controlled mailbox receipt check needs separate authorization and configuration before launch.

In preview/local QA, intercept delivery and use fictional values. Do not submit a real contact form or send test email during this planning step.

## Privacy and policy behavior

The website notice covers website processing. NEVORA application/customer workforce processing needs its own product notice, terms and data-processing agreement when applicable. Client engagement data processing belongs in the applicable contract.

The policy map and draft copy in POLICIES-DRAFT.md include identity/contact fields, data categories, purposes, processors, retention, rights, international processing, cookies, terms and accessibility. Business choices are OPEN fields, never inferred from the old coffee policies.

Use Shopify's Customer Privacy API to read and update consent through visitor interaction. Never manipulate Shopify consent cookies directly. Add no optional analytics or marketing service during the draft. Actual Shopify/app pixels and privacy configuration still need a network/storage inventory; absence of newly added scripts does not prove no processing.

Offer equally usable accept/reject choices and granular settings where applicable, preserve necessary processing, support reopening choices and the applicable opt-out signals. If the API fails, optional integrations remain blocked. Do not assert a global zero-cookie or “we never share” promise without evidence.

## Shopify draft isolation and publication

1. Before any mutation, export the exact theme and the shared resources that will be affected, with IDs, roles, timestamps and checksums. Current evidence is an inventory, not a complete recoverable store backup.
2. Prepare versioned source separately from the NEVORA repository. A new GitHub destination has not been selected or created.
3. After design approval, duplicate/create a clearly named UNPUBLISHED theme. Capture its actual returned ID and role. Allow file writes only after checking that exact theme is still unpublished.
4. Keep policy replacements in source/draft content. Do not call shopPolicyUpdate while staging: it changes store-wide policy records.
5. Use only verified, safely unpublished content records for any Shopify preview. If unpublished pages cannot be reviewed as complete routes, use a labelled local render for full route review; do not publish pages as a preview shortcut.
6. Reuse none of the older unpublished themes without explicit preservation and selection.
7. Publishing the company site is a later, concrete change set covering theme assignment, pages, menus, policies and aliases, legacy catalog/channel visibility, redirects, optional tracking, contact destinations, search indexing and the storefront password. A theme publish alone does not complete the migration.
8. Hiding product/cart links does not disable legacy checkout or remove direct old routes. Existing sample catalog publication and old policy endpoints must be addressed in that later reviewed change set. No product, policy, page, menu or old theme is deleted during draft work.
9. Record rollback/restoration instructions for each affected shared resource before publication.

## Content and asset ownership

Only confirmed name/domain and inspected source are facts. Copy, colors, type, services taxonomy and inquiry-only launch are proposals. Use approved, licensed assets and real fictional-data product captures. Do not borrow a logo, case study, photo or template claim from another company. Confirm all public legal contacts before inserting them.

## Quality and acceptance

ACCEPTANCE.md defines conditions, expected results and evidence. Every route must have deliberate mobile/desktop composition, valid destinations and honest state. The build must pass its actual Shopify/Liquid validation, link/route checks, accessibility and cross-browser checks. Performance targets must be measured; test planning is not test execution. Legal publication remains blocked by unresolved owner facts or mismatched processing.

## Open decisions

- Legal entity, jurisdiction, public address and privacy/contact channels: requested from Jose, pending.
- Business audience/geographies and translated release scope: not confirmed; initial proposal is English business buyers.
- Inquiry transport recipient, mailbox access and retention rules: verify and confirm.
- Approved source/identity assets and visual direction: proposed above.
- Service commercial terms and future product billing: separate agreements/decisions, not invented.
- GitHub destination and any hosted preview URL: not created.
- Pixel/third-party inventory, privacy configuration and global legacy-route cutover: inspect before publication.

## Handoff state

Planning and draft copy only. No theme mutation, page/policy/menu update, source-code scaffold, dependency installation, real inquiry, notification, payment, CI dispatch, password removal or deployment was performed for this package. NEVORA branches and evidence remain untouched.

