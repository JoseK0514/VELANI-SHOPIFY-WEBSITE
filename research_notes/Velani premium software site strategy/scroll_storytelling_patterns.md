# Apple-style scroll storytelling and premium product-page patterns (late 2026)

Research scope: concrete techniques behind apple.com product pages and premium software marketing sites (Linear, Stripe, Vercel, Raycast, Arc, Things, Framer, Superhuman, Notion, Rippling). Notes on what Velani can reproduce honestly with real product UI for NEVORA (scheduling, time clock, payroll), Rondo (AI owner assistant) and Relay (orders, kitchen, inventory). Research date: 2026-11-18.

Source quality: the evidence base is uneven. Primary sources (NN/g, W3C, Stripe's own engineering post, web.dev) are strong. Almost every public claim about how Apple builds its pages comes from third-party reverse-engineering or blog opinion, and Apple publishes no build documentation. Findings below say which claims are verified and which are not.

## 1. What concrete scroll-storytelling devices does Apple use, and how is each built?

### Takeaway
Apple's story pages are built from a small set of devices: sticky "stage" containers where the product holds still while scroll advances the scene, scroll-scrubbed media (once canvas image sequences, now reportedly mostly scrubbed video), short CSS text fades and slides, scrolljacked step-throughs used sparingly, and dense spec or number callouts with footnotes. Apple's own overview and "tile" pages, though, are plain and CTA-dense, not cinematic. Treat the cinematic layer as something kept for a few key moments.

### Cited Findings
- **Canvas image sequence (older AirPods Pro technique).** The hero "light pass" on the AirPods Pro page turned scroll position into a frame index and drew that frame (one numbered still image) onto a `<canvas>`. CSS-Tricks rebuilt it using frame URLs from Apple's own image-sequence files. — [CSS-Tricks (via mirror)](https://multizone.cz/devfeed/let-s-make-one-of-those-fancy-scrolling-animations-used-on-apple-product-pages-6b47c85d.html); [CSS-Tricks](https://css-tricks.com/?p=308477)
- Drawing a frame takes one canvas call. Frames with transparency need `context.clearRect` before each draw. — [GSAP forum thread on the AirPods image sequence](https://gsap.com/community/forums/topic/25188-airpods-image-sequence-animation-using-scrolltrigger/)
- A pure-CSS variant puts all frames on one WebP spritesheet: 1.7 MB as separate WebP files versus 1.5 MB as one sheet. Image sequences are heavy. — [geyer.dev (via reader mirror)](https://hn.jakechampion.name/reader/https://geyer.dev/blog/css-image-sequence-animations)
- **Scrubbed video.** A 2015 reverse-engineering of an Apple MacBook page found that scroll position controlled a video's playhead. — [jmeyers44, "Scrubbing Video On Scroll" (2015)](https://jmeyers44.github.io/blog/2015/05/21/scrubbing-video-on-scroll/)
- A 2025 blog post says Apple has moved from JavaScript frame sequences to one compressed video tied to scroll, keeping image sequences "sparingly for key moments". The post gives no source and was not verified. — [Brad Holmes, Aug 19 2025](https://www.brad-holmes.co.uk/web-performance-ux/why-most-scroll-animations-miss-what-apple-gets-right/)
- **Disputed:** another developer says Apple does *not* scrub MP4 and draws still frames to canvas, and explains why naive MP4 scrubbing stutters. — [DEV Community](https://dev.to/alki/video-on-scroll-in-elementor-why-scrubbing-an-mp4-stutters-and-what-to-do-instead-156l)
- One guide reports that the AirPods Pro 3 page used 16 `<video>` elements, 12 sticky elements and zero canvases. This is unverified against Apple's live source. — [summarised from search result for Dappasol / aicssanimations guides](https://dappasol.com/guides/websites-like-apple/)
- **Sticky stage.** The common pattern is a tall outer container with a child set to `position: sticky`, so the product holds still while the page scrolls past it. Apple also uses sticky text that fades out once scrolled past. — [Dappasol guide](https://dappasol.com/guides/websites-like-apple/); [Ankit Trehan, Medium](https://ankittrehan2000.medium.com/creating-scroll-animations-similar-to-apples-airpods-pro-page-bc5c1c0814df)
- **Text reveals** are described as lightweight CSS transitions: text fades in, product names slide in, sections pin during scroll. This is the author's reading, not documented by Apple. — [Brad Holmes, 2025](https://www.brad-holmes.co.uk/web-performance-ux/why-most-scroll-animations-miss-what-apple-gets-right/)
- **Scrolljacked step-through.** NN/g's 2023 study cites the Apple Watch Ultra page using scrolljacking to "break down eight features step by step". This is the one Apple scrolljack with research documentation behind it. — [NN/g, Scrolljacking 101 (Aug 6 2023)](https://www.nngroup.com/articles/scrolljacking-101/)
- **Spec and number callouts with footnotes.** A fetch of the apple.com/macbook-pro page on 2026-11-18 returned a product-tile overview, not a cinematic story. It had two side-by-side model tiles, each with an eyebrow ("New"), headline, one-line tagline, color swatches, sizes, and spec rows (brightness in nits, contrast ratio, weight, chip, "Up to 24 hours" battery). Each spec carried a numbered footnote, and footnotes 1–4 explained test conditions at the bottom. "Learn more" appeared 4 times and "Buy" twice. There was **no** "compare" or "which is right for you" table on that page. — [apple.com/macbook-pro (fetched 2026-11-18)](https://www.apple.com/macbook-pro/)
  - The model names in that fetch ("PROLED XDR Display", "M6") are as returned by the fetch tool and were not checked further. The tool returned markdown text, not layout, so motion on this page could not be seen.

### Inferences
These are practitioner knowledge, not verified this session. Label them that way when used in the report.

**Catalogue of Apple devices, with how each could map to Velani:**

| Device | How it works | Velani honest equivalent |
|---|---|---|
| Hero statement + product reveal | Huge one-line product name or claim, then the object scales or settles into view as you begin scrolling | Product name ("NEVORA") and a plain-language promise, then a real schedule-week screenshot that settles from a slightly scaled-up crop to the full frame |
| Sticky stage / pinned scene | Outer section ~200–400vh tall; inner `position: sticky; top: 0; height: 100vh` holds the visual while 2–4 captions replace one another | Pin one real Relay kitchen-ticket screen; as captions advance, highlight the matching region (new order → fired → bumped) with an outline or spotlight. The screenshot stays real and only the highlight moves |
| Scale-on-scroll reveal | Element grows from a small inset card to full-bleed (or shrinks back) tied to scroll progress | A Rondo chat card that grows from a phone-sized card into a full desktop panel |
| Text-mask / gradient-fill headline | Large headline whose fill sweeps from dim gray to full white (or black) as it crosses the viewport; Apple uses this on manifesto-style lines | One manifesto line per product ("Payroll that matches the time clock."). Use it once, not on every heading |
| Staggered headline lines | Multi-line headline where each line fades and rises 10–30px with a 60–120ms stagger | Fine for section intros. Keep it short and run it once |
| Chapter pacing | Page broken into named chapters (design, performance, camera, battery, privacy, etc.) separated by full-height breathers and short eyebrow labels | Chapters per job-to-be-done: "Build the week", "Clock in", "Run payroll", each a real workflow |
| Scrubbed video or image sequence | Scroll scrubs a pre-rendered sequence | Mostly unnecessary for software. A screen recording scrubbed by scroll is possible but heavy, and a looping muted recording that plays when visible is cheaper and more honest |
| Number / stat callouts | Big figure plus short label plus footnote (e.g., "Up to 24 hrs") | Use only **measured, sourced** numbers, such as product facts ("3 roles: owner, manager, staff") or plan facts. Never invented performance stats. Footnote anything conditional |
| Compare / "which is right for you" | Side-by-side model columns with check rows; on Apple this usually sits on the category page more than on story pages | A three-product chooser (NEVORA / Rondo / Relay) by business problem, or a plan comparison, using factual rows only |
| Closing CTA rhythm | Repeated small CTA pairs ("Learn more" / "Buy") in the local sticky sub-nav and at each tile, plus a closing block | Sticky product sub-nav with one primary action (e.g., "See it work" or "Talk to us"; preview inquiry delivery stays disabled per project rules) repeated at chapter ends |
| Local sticky sub-nav | Product name left, chapter links or "Buy" right; stays pinned under the global nav | A product sub-nav for each product page. NN/g found sticky nav is also the user's escape hatch from scroll scenes (see Q4) |

- Apple's most effective device is pacing more than motion: one idea per screen-height, big type, then evidence (visual plus a footnoted number).
- Velani can copy that rhythm without any scrubbing technology.
- Apple's category and overview pages, like the MacBook Pro tile page above, show that even Apple pairs the cinematic story with a plain, scannable, CTA-heavy decision surface. A software site should have both.

### Gaps
- No primary or first-party source documents Apple's current (2026) implementation, such as video versus canvas or library choice. All build claims are third-party reverse-engineering and partly contradict each other.
- Could not verify a current Apple page with a "which is right for you" section in this session. The fetched MacBook Pro URL returned a tile overview without one.
- Did not fetch iPhone, Vision Pro or AirPods pages individually. The tool returns text only, so motion cannot be seen through it.

## 2. How do premium software sites present product UI, and what has become cliché or "AI-looking" by 2025–2026?

### Takeaway
Premium software sites win by showing *real* product UI, built in code or as crisp screenshots, with restrained, purposeful motion. The tells of generic and "AI slop" design by 2026 are purple-to-blue gradients, Inter as an unexamined default, three identical feature cards with identical radius and padding, gradient headline text, glowing-orb or "Linear-effect" dark-glow backgrounds used regardless of brand, generic stock or 3D blobs, and the same fade-in on every element.

### Cited Findings
- **Stripe builds product visuals in code, not bitmaps.** For the 2017 Connect page, Stripe drew a laptop in CSS (under 1 KB; gradients, box-shadows, transforms) that stays sharp at any size and can hold live DOM inside its "screen". The Express onboarding demo is an animated, code-built recreation of the real flow at about 5 KB total. The author says defining objects in CSS is less convenient than exporting a bitmap but worth it. — [Benjamin De Cock, Stripe blog, Jun 19 2017](https://stripe.com/blog/connect-front-end-experience)
- Stripe's demo animation starts when the section is fully in view (IntersectionObserver, `threshold: 1`, then `disconnect()`), with no scroll listeners. — [Stripe, 2017](https://stripe.com/blog/connect-front-end-experience)
- Stripe still employs "Design Engineer, Presence" roles that use design, animation and interaction to educate prospective users on public surfaces. — [Stripe careers listing](https://stripe.com/jobs/listing/design-engineer-presence/7144975)
- **The "Linear look".** Linear popularized dark-mode marketing sites. Critic Anthony Hobday says this "started a trend which many websites adopt even if it doesn't suit their brand", and that dark backgrounds enable lighting-style glow effects that are hard to do on light sites. — [summary of Hobday critique via search results](https://anthonyhobday.com/blog/20230119.html). Direct fetch returned 404 on 2026-11-18; the quote comes from search-result excerpts.
- The style is described as a dark background, linear gradients, blurs, "dynamic streamers" and micro-motion. Daryl Ginn reportedly coined "the Linear effect" for dark backgrounds, blurred gradient art and glowing animated accents on "nearly every new product page". A LogRocket follow-up noted that "over a year later, almost all of the websites showcased in this article look the same". — [LogRocket, "Linear design"](https://blog.logrocket.com/ux-design/linear-design); [UX Collective Bootcamp](https://bootcamp.uxdesign.cc/the-rise-of-linear-style-design-origins-trends-and-techniques-4fd96aab7646)
- Linear's own 2026 blog post on a design refresh concerns the product UI, not the marketing site. A June 2026 studio case study says an outside studio rebuilt Linear's site on a CMS. That is the studio's self-report. — [Linear blog: behind the latest design refresh](https://linear.app/blog/behind-the-latest-design-refresh); [search summary](https://contra.com/p/AbQlkoYg-linear-saa-s-website-revamp)
- **AI-slop tells (2026 practitioner sources):**
  - Inter as "the default font in nearly every AI design tool"
  - purple-to-blue gradients as "the most 'safe' choice" in heroes, CTAs and accents
  - oversized heroes
  - identical padding, radius and card heights across the page
  - too-smooth, symmetrical AI illustrations with a "plastic quality"
  - stock scenes (diverse people at laptops) or floating abstract 3D shapes
  - hover states that do nothing, buttons that snap, and the same fade-in on every element
  - vague aspirational headlines

  — [925 Studios, AI Slop Web Design guide (2026)](https://www.925studios.co/blog/ai-slop-web-design-guide)
- Asking for a "SaaS page" reliably produces a purple-to-blue hero, Inter, a centered layout and feature cards, because models default to the statistical center of their training data. Other named tells: gradient headline text, emoji icons, three equal feature cards. — [Superdesign, "Why AI design looks generic" (2026)](https://superdesign.dev/blog/why-ai-design-looks-generic); [DEV: 3 UI slop patterns](https://dev.to/kenimo49/3-ui-slop-patterns-in-ai-ui-generators-purple-gradients-inter-fonts-uniform-cards-11l6)
- Some anti-slop guidance flags a *second* wave of "tasteful" defaults as now generic too: cream plus terracotta and monochrome. — [avoid-ai-design repo description](https://github.com/funboy322/avoid-ai-design)
- **Fixes for tasteful versus generic** (925 Studios):
  - real product screenshots instead of stock or illustrations
  - one brand-fitting display face plus a readable body face
  - semantic color tokens, where each color has a function
  - scroll animation only where it serves navigation or storytelling
  - micro-interactions on primary CTAs and inputs
  - deliberate variation in hierarchy instead of uniform cards
  - restraint: "fewer, consistent design choices"
  - specific founder-voice copy (test: "would the CEO actually say this?")

  — [925 Studios (2026)](https://www.925studios.co/blog/ai-slop-web-design-guide)
- Caveat: the "AI slop" sources are mostly 2026 practitioner and vendor blogs, several of which sell fixes. Treat them as consensus opinion, not measured data. — [search synthesis](https://www.sailop.com/blog/ai-slop-2026-state-of-the-ai-generated-web)

### Inferences
- **Product UI presentation, ranked by how honest and premium it reads for Velani:**
  1. **Code-built or lightly animated recreations of real screens** (Stripe model). Sharp at any DPI, themeable navy and white, and they can "play" a real workflow such as a shift being dragged, a clock-in, a payroll total updating. They must mirror real NEVORA, Relay and Rondo screens, with no invented features.
  2. **Crisp, flat, real screenshots at true scale** with tight crops on one detail, such as the overtime warning chip or a kitchen ticket timer. Detail crops read as more confident than full-dashboard shots.
  3. **Short muted loops of real use** (5–10 s), played when in view, with a poster frame and a pause control.
  4. **Tilted or perspective "floating" screenshots.** Common since about 2018 and now dated when done with heavy 3D rotation, drop shadows and glow. A subtle tilt (≤10°) in a single hero moment is acceptable. Do not make it the default framing.
- **Cliché list for Velani to avoid**, consistent with its navy and white identity:
  - purple or blue-violet gradients and gradient text
  - glow orbs and blurred aurora backgrounds
  - glassmorphism panels used everywhere
  - a uniform bento grid of equal cards with icon, title and two lines
  - fake logo walls, testimonial carousels, made-up counters ("10,000+ businesses")
  - "AI sparkle" iconography for Rondo
  - fade-up on every block
- **Bento grids** are not banned. A bento made of *real, varied-size product crops* with one dominant cell (e.g., the actual week schedule) still reads well. Generic bento means equal cells holding icons in place of product.
- **Dark versus light sections:** use dark (navy) sections as chapter breaks or for one "focus" product scene, not as an all-dark Linear clone. Alternating section tone is a pacing tool (see Q3).

### Gaps
- No primary design write-ups were found this session for Raycast, Arc, Things, Framer, Superhuman, Notion, Rippling or Vercel marketing sites. Their specific techniques are not cited here and should not be presented as researched.
- The Hobday critique could not be fetched directly (404). Its points come from search excerpts only.
- No data found that measures conversion differences between tilted and flat screenshots, or live demos versus static images.

## 3. Typography, spacing, color and motion conventions that signal "premium"

### Takeaway
"Premium" comes down to restraint you can measure: custom easing curves instead of browser defaults, short durations for UI (~200–300 ms) and longer ones (up to ~500–800 ms) only for large showcase moves, animating only `transform` and `opacity`, one idea per viewport, and a deliberate type system. Spacing and type numbers below are mostly practitioner convention, not research.

### Cited Findings
- **Easing:** you "almost never want to use a built-in timing-function" (ease, ease-out, linear). Define custom cubic-bezier variables. Stripe's keyboard slide used `cubic-bezier(.2, 1, .2, 1)` at 800 ms with `fill: forwards`. — [Stripe, 2017](https://stripe.com/blog/connect-front-end-experience)
- **Duration:** "In most cases you'll want to stay under 500 milliseconds." — [Stripe, 2017](https://stripe.com/blog/connect-front-end-experience)
- Guidance attributed to Emil Kowalski (via third-party skill files, not his own text): keep UI animations under 300 ms; default to ease-out for entering and exiting; avoid ease-in for UI because it feels sluggish; a "strong ease-out" of `cubic-bezier(0.23, 1, 0.32, 1)`; 200 ms for standard transitions and about 500 ms for drawers. — [ui-skills summary](https://www.ui-skills.com/skills/emilkowalski/emil-design-eng); [skills.sh](https://skills.sh/emilkowalski)
- **Performance:** animate only `transform` and `opacity`; use `will-change` sparingly to promote layers; skip work for hidden elements; avoid jank "at all costs". Choose the tool by need: CSS transitions for hovers, the Web Animations API for interactive or chained sequences, rAF only for physics or springs. — [Stripe, 2017](https://stripe.com/blog/connect-front-end-experience)
- **Native scroll-driven CSS** (`animation-timeline: scroll()/view()`) became Baseline "newly available" when Firefox 159 enabled it by default. Support landed in Chrome and Edge 115, Firefox 159 and Safari 26. Safari 26.4 added threaded scroll-driven animations. — [web.dev, New to the web platform in October 2026](https://web.dev/blog/web-platform-10-2026); [lilting.ch](https://lilting.ch/en/articles/chrome-146-scroll-animation-safari-grid-lanes)
  - Older sources conflict, claiming Firefox shipped in 133 or was still behind a flag in early 2026. web.dev is the most authoritative. Parity for `view()` and `animation-range` in Firefox 159 was not confirmed.
- **Motion tell of generic sites:** "the same generic fade-in on every element" and buttons that snap instead of easing. — [925 Studios](https://www.925studios.co/blog/ai-slop-web-design-guide)
- **Typography tell of generic sites:** unexamined Inter; the recommended fix is one brand-fitting display face plus a readable body face. — [925 Studios](https://www.925studios.co/blog/ai-slop-web-design-guide)

### Inferences
These are practitioner conventions, not research findings. They are a working spec, so label them as defaults to tune.

- **Display type:**
  - Hero headline about 64–120px desktop and 40–56px mobile, using `clamp()`
  - negative tracking on large sizes (about −0.02 to −0.04em); slightly positive tracking on small all-caps eyebrows (about +0.04 to +0.08em)
  - line-height about 1.0–1.1 for display and 1.5–1.6 for body
  - body copy 17–21px on marketing pages, with a measure of about 45–75 characters (headlines often capped at 12–20ch so they break into deliberate lines)
- **Type pairing:** a distinctive but sober grotesk or neo-grotesk (or a restrained serif for manifesto lines) plus a highly legible text face, with tabular numerals for any figures (pay totals, hours). Inter is not forbidden, but defaulting to it unedited reads generic.
- **Spacing:**
  - section padding of about 120–200px desktop and 72–112px mobile
  - one idea per section; content column of about 980–1200px max, with full-bleed visuals breaking out of it
  - on story pages, whitespace commonly outweighs content area; generous negative space around one product crop reads premium
- **Color:** navy and white plus one functional accent at most, with semantic tokens (action, success, warning) mirroring the actual app's status colors. Shadows soft and low-contrast; no glow.
- **Motion budget:**
  - entrance reveals: opacity 0→1 plus translateY 12–24px, 400–700 ms, strong ease-out, staggered 60–100 ms, run once
  - UI micro-interactions: 150–250 ms
  - pinned scenes: driven by scroll position (no time-based easing); at most 1–2 per page
  - nothing animates on every block; no infinite decorative loops
- **Implementation preference for 2026:**
  - CSS `position: sticky` plus native scroll-driven animations with an `@supports` fallback (static layout)
  - IntersectionObserver for "play when visible"
  - avoid JS smooth-scroll libraries that override native scroll (see Q4)
  - this keeps the Shopify theme light and avoids heavy GSAP or Lenis dependencies, though GSAP ScrollTrigger remains the mature JS option if needed

### Gaps
- Found no published, measured specs (exact type sizes, section heights, easing curves) from Apple, Linear, Vercel or Raycast. Third-party "inspired-by" token files exist but are explicitly unofficial and were not used.
- Emil Kowalski's guidance was found only through secondary packaging. His primary source (animations.dev) was not fetched.
- No research found that ties specific type or spacing values to perceived premium-ness or conversion.

## 4. Engagement evidence: long scroll pages, scrolljacking, attention and conversion

### Takeaway
Users do scroll, but attention is heavily front-loaded. Scrolljacking (changing scroll speed or direction) measurably disorients users, especially task-oriented ones, on mobile, and when text must be read. Page length alone doesn't predict conversion; it should match visitor intent and offer complexity. For Velani, keep native scrolling, put the clear value proposition and CTA in the first screen, and use storytelling below it for visitors who want depth.

### Cited Findings
- **Attention distribution (NN/g eyetracking, 2018):**
  - 57% of viewing time was above the fold, down from 80% in 2010, a drop the report links to longer pages
  - about 74% of viewing time fell in the first two screenfuls (up to 2160px)
  - attention still drops sharply after the fold
  - on general sites, over 42% of viewing time fell in the top 20% of the page

  — [NN/g, Scrolling and Attention](https://www.nngroup.com/articles/scrolling-and-attention/); [NN/g original research](https://www.nngroup.com/articles/scrolling-and-attention-original-research/). The 120-participant sample comes from a secondary source: [UXmatters](https://uxmatters.com/mt/archives/2020/11/debunking-the-myth-of-the-fold.php)
  - Conflict: NN/g's 2023 scrolljacking article still quotes "80% of their time… above the page fold". That is the older 2010 figure; the 2018 update is 57%.
- **Scrolljacking (NN/g usability study; Sara Paul, Aug 6 2023):**
  - Effects: "The majority of our study participants were at least mildly disoriented by scrolljacking". Some refreshed the page or clicked away, and some thought the page was broken.
  - Length: disorientation "was severely exacerbated when scrolljacks were excessively lengthy". Every participant on Crypto.com's fully scrolljacked page was disoriented.
  - What works: scrolljacks "were best tolerated when they were used to progressively disclose relevant information". BBC News worked because its scrolljack was short and added context.
  - Who suffers: task-oriented users (Reachdesk, UT Austin) were the least tolerant, with one participant saying it "wasted" her time.
  - Worst case: changing scroll rate and direction while requiring users to read text (Reachdesk).
  - Horizontal scenes: the Therabody horizontal scrolljack was less frustrating because it had no text, but a user couldn't find their way back to the top.
  - Mobile: scrolljacks were more disorienting on mobile, and sticky nav (the escape route) was often collapsed there.
  - Recommendations:
    - use it only for critical info
    - test scroll rate (too fast means missed content, too slow means scroll fatigue)
    - mix in normal sections
    - never change direction
    - keep text minimal
    - avoid it on mobile ("in most cases, they are not" worth it)
    - put it below the fold, after the CTA has appeared above the fold
  - Overall: more pain than benefit.

  — [NN/g, Scrolljacking 101](https://www.nngroup.com/articles/scrolljacking-101/)
- Jakob Nielsen calls scrolljacking "a particularly egregious example" of innovation that breaks Jakob's Law (users expect your site to work like others). — [Jakob Nielsen, Substack](https://jakobnielsenphd.substack.com/p/jakobs-law)
- NN/g treats "scroll fading" (content fading in on scroll) as a separate pattern from scrolljacking. — [NN/g, Scroll fading 101](https://www.nngroup.com/articles/scroll-fading-101/)
- **Long versus short pages:**
  - A CXL guest post concludes neither wins outright: it depends on the product and the visitor's awareness. It cites a shorter page that lifted demo bookings 65% (3.53% → 5.85%); the test's origin was not given in the results.
  - A 2013 CXL case study reached a 79.3% improvement after six rounds of testing.

  — [CXL, Long form or short form](https://cxl.com/blog/long-form-or-short-form/); [CXL case study](https://cxl.com/blog/case-study/)
- Practitioner guidance: length should match awareness, intent, traffic source and offer complexity (low ticket plus warm traffic plus a familiar category points to a short page). — [Apexure](https://www.apexure.com/blog/landing-page-length); [Woobox](https://cdn.woobox.com/articles/long-vs-short-landing-pages)
- An academic study (Gafni & Dvir; pilot n=535, then experiments n=27,083) compared long and short landing pages. Its conclusions were not retrieved. — [arXiv 1806.00923](https://arxiv.org/pdf/1806.00923v1.pdf)

### Inferences
- **Pattern for Velani:**
  - first viewport: plain-language promise, product shot, primary CTA
  - then scannable chapters that each stand alone
  - storytelling scenes are optional depth, never a gate to the CTA or to prices and facts
- Small-business owners arriving with a task ("does this do tip pooling / payroll?") are NN/g's "task-oriented users", the group least tolerant of scroll gimmicks. Every product page needs scannable headings, a sticky sub-nav and anchor links so they can jump.
- Sticky (pinned) scenes that keep **native scroll speed** and only change what is shown are much lower-risk than true scrolljacking (altered speed, snapping or direction change). Avoid scroll snapping and horizontal-on-vertical scenes entirely, and disable pinned scenes on small screens in favor of stacked static content.
- Keep any pinned scene short (about 2–4 captions, roughly 200–300vh) and text-light.

### Gaps
- No published A/B evidence found that Apple-style scroll storytelling raises conversion for B2B or SMB software. Engagement benefits are asserted by practitioners, not measured.
- Baymard material on product-page length or scroll was not found in this session. Baymard focuses on e-commerce product detail pages and was not searched specifically.
- Results of the Gafni & Dvir long-versus-short study were not retrieved.

## 5. Accessibility constraints for motion-heavy pages

### Takeaway
Motion triggered by scrolling or interaction must be possible to switch off (WCAG 2.2 SC 2.3.3, Level AAA). The standard way is `prefers-reduced-motion` in both CSS and JS, ideally plus an on-page control, with parallax, zooms and slides replaced by fades or static states. Pinned and scrolljacked scenes also break keyboard and assistive-tech expectations, so content inside them must exist in normal document order.

### Cited Findings
- **SC 2.3.3 text:** "Motion animation triggered by interaction can be disabled, unless the animation is essential". "Essential" means removing it "would fundamentally change the information or functionality" and the result can't be achieved another way that conforms. — [W3C Understanding SC 2.3.3 (WCAG 2.2)](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
- **Vestibular rationale:** "Vestibular (inner ear) disorder reactions include dizziness, nausea and headaches", and "the impact of animation on people with vestibular disorders can be quite severe". — [W3C](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
- **Parallax** is the W3C's worked example: decorative elements moving as content scrolls, with a site-wide control to turn them off. Parallax is defined as "backgrounds move at a different rate to foregrounds". — [W3C](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
- **Sufficient techniques:** C39 (CSS `prefers-reduced-motion`), SCR40 (the same query in JavaScript), and letting users set a preference that prevents animation. — [W3C](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html); [W3C C39](https://w3.org/WAI/WCAG22/Techniques/css/C39)
- SC 2.3.3 covers interaction-triggered motion (scrolling counts). Auto-started animation falls under SC 2.2.2 (Pause, Stop, Hide). — [W3C](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
- Stripe's 2017 pattern: CSS `@media (prefers-reduced-motion)` sets `animation: none`, and JS checks `matchMedia` and stops the rAF loop after rendering one final static state. — [Stripe, 2017](https://stripe.com/blog/connect-front-end-experience)
- Replacing slides, zooms and parallax with opacity fades keeps the feedback while removing the vestibular trigger. Some sources also recommend a page-level toggle because the OS setting doesn't reach every user. — [Deque University](https://dequeuniversity.com/resources/wcag2.1/2.3.3-animations-from-interactions); [search synthesis of a11y guides](https://testparty.ai/blog/wcag-animation-interactions-guide)
  - Deque's note about incomplete `prefers-reduced-motion` browser support is dated; it is now universally supported per general knowledge, not verified this session.
- Scrolljacking is reported to interfere with assistive technologies. — [frontendchecklist.io](https://frontendchecklist.io/rules/accessibility/scrolljacking)
- NN/g found users relied on sticky navigation to escape scrolljacked sections, and that recovery was harder without it. — [NN/g](https://www.nngroup.com/articles/scrolljacking-101/)

### Inferences
**Accessibility checklist for Velani's motion layer:**
1. **Reduced motion:** every scroll-linked or entrance animation sits behind `@media (prefers-reduced-motion: no-preference)` (motion is opt-in by default). Under `reduce`, pinned scenes become a normal stacked sequence of screenshots plus captions, and fades replace movement.
2. **Video:** autoplaying or looping product videos get a visible pause control (SC 2.2.2) and a poster frame, and never autoplay under reduced motion.
3. **Source order:** captions and screenshots in a sticky scene exist in the DOM in reading order. Never use canvas-only text or text that exists only mid-animation. Screen readers and keyboard Tab order must reach all content without scrolling to a trigger point.
4. **Real text:** headlines with mask or fill effects stay real text, with contrast passing at the *start* state, or the effect is skipped. A dim-gray "unrevealed" state fails contrast unless purely decorative copy duplicates it.
5. **Focus:** focusing an element inside a pinned section must scroll it into view, and focus outlines must not be clipped by `overflow: hidden` stage containers. Do not trap focus.
6. **Scroll behavior:** no scroll-speed overrides, snap-jacking or horizontal-on-vertical scenes. Keep anchor links and Home/End/Page Down/Space working natively.
7. **Mobile:** disable pinned scenes below about 768px. NN/g found mobile scrolljacks especially disorienting.
8. **Optional extra:** an on-page "Reduce motion" toggle stored in localStorage, matching the W3C example of a site-wide control.
9. **Count-up numbers:** if used at all, the final value must be in the DOM, `aria-live` should not announce each tick, and under reduced motion the final value shows immediately.

### Gaps
- No user-testing data found on screen-reader behavior specifically inside CSS `position: sticky` scenes. The guidance above is standard practice, not tested evidence.
- The "35% of adults over 40 have vestibular disorders" figure seen in one search result could not be verified and is deliberately excluded.
