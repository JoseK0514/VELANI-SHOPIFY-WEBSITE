# Velani website: full inspection, 2026-11-05

**Scope:** unpublished theme **193106706746** "Velani Rondo + fixes (preview)", the theme waiting to be published. I also spot-checked the live site (theme 193100644666) where noted.

**Method:** four independent read-only reviews (visual, accessibility and motion, copy and conversion, engineering), each using the matching skills. I then reproduced the most serious findings myself.

**What was not touched:** nothing was changed, published, sent or billed. Rondo's paid chat calls were blocked and no form was submitted.

## Verdict

The site is in good technical shape. There are zero axe violations on 21 pages and in every open state, every text colour passes AA contrast, there is no sideways scrolling or layout shift, the source matches the build, and fallbacks for reduced motion and no-JavaScript work.

What holds it back:

1. **A layout bug on tablets that the live site already has.** At iPad sizes, cards and screenshots cover headings and buttons.
2. **Legal wording that doesn't match the store.** Tracking pixels are installed while the privacy and cookie pages say none are.
3. **A handful of claims that contradict each other between pages.**
4. **Thin proof:** no people, no pricing guidance, and client work shown as screenshots only.

Fix items 1–3 before publishing. Item 4 needs your content.

## Confirmed by me (reproduced, not just reported)

| # | Finding | How I confirmed it |
|---|---|---|
| 1 | **Tablet overlap.** At 834 px, cards and screenshots cover headings and buttons on Home (Meet Rondo, Websites), Products (NEVORA, Relay: "Every order…" and **Join the waitlist** hidden) and Custom development (**Websites** heading and **Start a project** covered). At 1024 px it still happens on Products (Relay) and Custom development (Websites). **The live site has it too:** 5, 3 and 6 overlaps at 834; 2 and 2 at 1024. | Geometry check on preview and live, plus screenshots |
| 2 | **Tracking pixels vs privacy wording.** Every page loads a Mailchimp app pixel (purposes: analytics, marketing, sale of data; shares all events), a second app pixel (account 484024, analytics, unrestricted) and Shopify's own pixels. The privacy notice, cookies page and cookie dialog say Velani "has not added advertising or analytics tools". | Read `webPixelsConfigList` and saw the pixel scripts load on the live About page |
| 3 | **"Scroll to NEVORA" arrow** on home is a keyboard stop with opacity 0, even while focused. | Focused it in Chromium; computed opacity 0 |
| 4 | **"Nothing to install"** (NEVORA page) vs "iOS app" licence (NEVORA terms), "Include the app version" (support) and "If you've uninstalled the app" (account deletion). | Extracted page text |
| 5 | **Chat says "Conversation deleted" when it wasn't.** If the session has expired, the delete button and the language switch forget the chat locally but report it as deleted. The server copy remains until retention runs, and retention isn't scheduled yet. | Read the code I wrote: `assist.js`, expired branch of the confirmation |

## Reviewer claims I'm correcting (not real problems)

- **"The contact form says it sends nothing"** (V-03, C-07). Correct for an unpublished preview, by design. The real Shopify form appears when the theme is published. Still do one real test inquiry after publishing.
- **"Ask Rondo goes to the quote form"** (C-01). The reviewer followed the link's fallback address. Clicking it opens the chat (my hosted test, 8 of 8). The fallback only applies if the chat is ever switched off.
- **"Inner pages canonicalise to home"** (C-09). Preview links use `?view=`. The published theme uses `/pages/…` with per-page canonicals. A related real issue is E-10 below.

## Fix before publishing (High)

| ID | Where | Problem | Fix |
|---|---|---|---|
| V-01 | Home, Products, Custom development at 769–1100 px | Cards and screenshots overlap text and buttons (confirmed #1) | Below 1200 px, stack each panel: text first, visual underneath. Above that, use a real two-column grid instead of absolute positioning. |
| V-02 | Products, Websites panel, 1440 | Heading and text run across the laptop photo's own headline and orange button | Add a left shade over the photo (or mirror it) and keep the text column at 520 px or less |
| E-01 | All pages | Pixels vs privacy wording (confirmed #2) | **Your decision:** remove the pixels in Shopify → Settings → Customer events, or name them in the notices and the cookie dialog. If Mailchimp stays, handle its "sale of data" setting in consent. |
| E-02 | Rondo chat | "Conversation deleted" when the session had expired (confirmed #5) | Say "This conversation already ended; it is removed within 30 days". Fix together with Codex's retention schedule. |
| A-01 | NEVORA page, phones and 200% zoom | With the local menu open, Tab moves behind the menu to covered controls; the page behind isn't blocked | Put the toggle before the links, focus the first link, make the page behind inert, label the button "Close menu" |
| A-02 | Home | Invisible focused arrow (confirmed #3) | Remove the fade from the cue, or make it fully visible on focus |
| A-03 | Header, desktop | The Products menu doesn't close with Escape; there's no `aria-expanded` | Escape closes it; use a disclosure button with `aria-expanded` |
| C-02 | NEVORA page vs legal pages | "Nothing to install" vs the iOS app (confirmed #4) | **Your decision:** is there a NEVORA app? Then align either the NEVORA page or the legal pages. |
| C-03 | Plans, Help, contact, privacy | "Delete the workplace and **all** of its data within 3 days" vs privacy's "we are verifying how long backups are kept", 90-day logs and 24-month request records | Say "its data", and add backup wording once you've confirmed it |
| C-04 / C-10 | Help, Contact, Security, confirmations | "We reply within two business days" vs support's "We aim to respond" vs project terms' "no support guarantee". The quote confirmation promises "a price for your team" while other pages promise a discussion. | Use "We aim to reply within two business days" everywhere. Quote confirmation: "…to discuss your team and locations." |
| C-05 / C-06 | Home, NEVORA | "NEW IN NEVORA · In development" vs "coming to NEVORA". The Rondo section says in the present tense that Rondo "watches your day" and "remembers", with "in development" only under the button. | "Coming to NEVORA · In development". Write the section in the future tense and say the website chat works today. |
| C-11 | NEVORA page | "You can delete an account in the app or on the web" vs the deletion page "you can ask us…within 30 days" | "You can request account deletion… we aim to complete it within 30 calendar days" |

## Should fix soon (Medium)

**Layout and design**
- **V-04, A-06, A-16:** on phones, the Ask Rondo button sits over buttons and footer links after scrolling, over the open phone menu, and over form fields at 200% zoom. Shrink it to a round 44 px "R", hide it while the menu is open or a field has focus, and reserve space at the page bottom.
- **V-05:** heading sizes drift: titles at 84, 80.6 or 64 px, and NEVORA page sections at 43 or 52 px; the NEVORA page uses 15 text sizes. Fix one scale: 80, 52, 32, 20, 17 and 12–14 px.
- **V-07, E-11:** images aren't sized for the screen:
  - background photos are 1920 px and soft on iPad and retina screens;
  - other images are far larger than shown (`night-desk` 5.3×, the long phone shot 4×, the NEVORA wordmark 8.7×).
  - Use responsive images (`srcset`) with portrait crops for phones.
- **V-16:** the same full-height panel pattern repeats 14 times, and every page ends with the same 900 px closing panel. Keep it on home only; use a shorter call-to-action band elsewhere.

**Accessibility and interaction**
- **A-04:** in Chrome, moving keyboard focus inside the sticky header scrolls the page up by about 480 px. Caused by `scroll-padding-top` on `html`.
- **A-05:** in the PIN demo, focus is lost after Continue (Chromium), and "Clock-in recorded" isn't announced.
- **A-07, A-12:** the Rondo question box has no visible focus state, and form fields have a weak one. Use the site's 2 px blue ring.
- **A-08:** on the contact form, switching the topic leaves an old error on a field that's now optional.
- **A-09:** on the general contact form, "Free NEVORA trial" with more than 30 people doesn't switch to a quote. Only the trial page does.
- **A-10:** in Windows High Contrast, the PIN dots, the NEVORA wordmark and the chat button's outline disappear.

**Engineering, performance and SEO**
- **E-03:** every link and the contact form depend on Shopify's deprecated `theme.role`. Add a publish build without preview branching, and a test with `theme` undefined.
- **E-04:** the Products hero image is lazy-loaded: phone LCP is 3.7 s against about 2.0 s on home and NEVORA. Load it eagerly at high priority and preload it.
- **E-05:** the live contact form shows browser validation bubbles instead of the site's own messages, and after a Shopify error it loses company, topic, team size and locations.
- **E-06:** first-screen headings and intros stay hidden until a deferred script runs: Plans LCP is 2.6 s. Don't hide the first section.
- **E-07, E-08:** the chat waits forever if `/v1/config` never answers, and a Turnstile that fails to load shows an empty box. Add a timeout, keep the box disabled until config arrives, and say "Verification couldn't load".
- **E-09:** `/collections/all`, `/cart` and `/search` return 200 "not found" pages, and the sitemap still lists the old pet-store collection and blog. Remove those in Shopify.
- **E-10:** `/?view=velani-privacy` and 17 similar pages are indexable duplicates of real pages. Add noindex and the right canonical, or drop those templates.

**Copy and conversion**
- **C-14, C-15:** "One price per business" sits next to "set by quote", and trial forms offer "More than 30". Say "One price per business, quoted for your team and locations".
- **C-16:** Relay has three status labels. Use one: "In design · No dates yet".
- **C-17:** "Join the waitlist" lands on a generic contact heading. Add a Relay heading and page title.
- **C-18:** "NEVORA" vs "NEVORA Workforce". Pick one.
- **C-19, C-20:** About and the terms say "by quote" but never mention the free trial, and the terms have no trial section.
- **C-21:** support hours say "ET" for a San Juan company. Confirm the time zone; the structured data has none.
- **C-22:** "workplace" vs "workspace", and how to close a trial isn't explained.
- **C-23, C-08:** form error messages leave the visitor stuck ("Inquiry delivery is not available."). Add the email and phone.
- **C-24:** the home hero chat shows Rondo doing work next to "Available now". Add "Example conversation, fictional people".
- **C-26:** structured data is Organization only. Add the NEVORA product and the FAQ.
- **C-27, C-35:** meta descriptions:
  - the Plans description leads with data deletion;
  - Home (194) and Products (223 characters) are too long;
  - About (49) and NEVORA terms (27) are too thin.
- **C-28, V-21:** "Brighter work ahead." doesn't say what Velani does.
- **C-32:** "Payroll from approved hours" reads as running payroll. Say "pay statements".

**Needs your content** (C-25, C-29, C-30, C-31, V-17, V-18, V-19):
- Spanish pages;
- real people on About;
- client results as case studies, with each client shown once (the Tool Box site currently appears four times);
- pricing guidance, since Plans shows no price;
- a business-specific `llms.txt`. Shopify's default calls Velani an "online store" with a checkout (C-12).

## Polish (Low)

- **Visual:** misaligned Rondo feature grid (V-06); 10–11 px status labels (V-08); duplicate time labels in the timeline (V-09); demo dates that contradict each other (V-10); see-through phone notification (V-11); white flash before the owner screenshot loads (V-12); inconsistent header button and label colours (V-13); phone cover crops with no subject (V-14); a stat label 35 px out of line (V-15); empty right third on Plans, About and legal pages (V-22).
- **Accessibility:** small targets on phones (A-11), listed in `targets-390.json`; screenshot viewer scroll area without a name (A-13); empty `aria-label` on the NEVORA logo heading (A-14); generic form error summary (A-15).
- **Engineering:**
  - chat action links leave the preview (E-12);
  - dead `velani-home.js` (E-13);
  - the chat code loads before Rondo is opened (E-14);
  - about 70% of `velani.css` is unused on each page (E-15);
  - Shopify's unused checkout CSS and prefetch, about 430 KB on desktop (E-16);
  - the JSON-LD has no logo, and the share images are 380–490 KB (E-17);
  - a pageless template gives an indexable 200 (E-18);
  - the asset fingerprint step can fail silently (E-19);
  - the README and handoff counts are out of date (E-20);
  - there are no unit tests for the chat client or the live form branch (E-21);
  - 26 old files remain on the theme (E-22).
- **Copy:** wording fixes C-33 to C-47, for example "Enquiries" → "Inquiries", one Spanish term for the time clock, and "portal password" → "NEVORA password".

## Performance (preview, preview bar blocked)

Phones were measured at 390 px with 4× CPU slowdown and Fast 3G; desktop is unthrottled. CLS is 0 everywhere. Shopify's own scripts add about 258 KB on phones and about 690 KB on desktop.

| Page | Phone LCP | Desktop LCP | Phone transfer |
|---|---|---|---|
| Home | 2.09 s | 0.42–0.48 s | 739 KB |
| NEVORA | 2.03–2.05 s | 0.45–0.48 s | 535 KB |
| Products | **3.67 s** (lazy hero) | 0.96–1.35 s | 663 KB |
| Plans | 2.6 s (hidden lede) | 0.48–0.78 s | 406 KB |
| Custom development | 1.69 s | 0.34–0.63 s | 810 KB |
| Contact | 1.54 s | 0.48 s | 406 KB |

## What is strong (keep)

- **Contrast and colour:** every text colour passes AA, the lowest at 4.75:1; one amber for status and one blue for focus.
- **Type and readability:** one typeface; 17 px body text; about 65-character lines on legal pages.
- **Accessibility basics:** zero axe violations; the cookie dialog, screenshot viewer and phone menu keep focus, close with Escape and return focus; one h1 per page; a working skip link; reflow holds at 320 px and 200% zoom.
- **Chat safety:** session token in memory only, answers rendered as text, only Velani links allowed, honest disclaimers.
- **Product storytelling:** the live PIN demo, the approval-chat story and the "what each person sees" section.
- **Engineering:** source and live match; theme assets cached for a year; no layout shift.

## Coverage and gaps

- **Skills applied:**
  - ui-ux-pro-max, design-critique, tastemaker, better-ui and high-end-visual-design;
  - critique-color, -typography, -composition, -visual-hierarchy, -brand-consistency, -information-density and -affordance;
  - accessibility-ui-expert and accessibility-audit, interfaces-that-feel, animation-principles and motion-system;
  - stop-slop, better-writing, ux-copy and seo-ai-visibility;
  - engineering:debug and code-review, shopify-liquid, web-design-engineer.
- **Not applicable to a Liquid theme:** shopify-hydrogen, shopify-pos-ui, shopify-payments-apps, shopify-onboarding-dev, react-ui-patterns.
- **Not installed here:** impeccable, review-animations (animation-principles was used instead), build-awwwards-quality-sites, premium-ui-director, premium-ui-qa, premium-ui-layout, premium-ui-image-direction, superdesign, visual-regression-reviewer, and 21st-ui (installed but used for generating components, not review).
- **Not verified:**
  - real screen readers (VoiceOver, NVDA);
  - real phones and tablets;
  - Rondo's answer, error and retry states on the hosted site (paid);
  - the contact success state on the published theme;
  - Safari keyboard journeys (Playwright's WebKit skips links on Tab).

**Evidence** is in the session scratchpad under `inspect/`: `visual/` (screenshots, contact sheets, metrics), `a11y/` (106 screenshots, 62 axe results, contrast, targets, motion), `copy/` (page text, Rondo panel), `eng/` (performance JSON, theme-check, live HTML) and `verify/` (my reproductions).
