# Apple-style scroll storytelling on a Shopify OS 2.0 theme: implementation options and constraints (as of 18 Nov 2026)

Context checked in the repo (not web-sourced): the local preview server (`scripts/serve.mjs`) sends `script-src 'self'` plus SHA-256 hashes of each compiled inline script (no `'unsafe-inline'`/`'unsafe-eval'`), `style-src 'self'`, and `style-src-attr 'unsafe-inline'`. So `<style>` elements injected at runtime are blocked, while style attributes and CSSOM writes are allowed. `src/night/motion.js` (~19 KB uncompressed) already does reveal-on-scroll with IntersectionObserver plus classes, and sets per-word `--i` custom properties via `el.style.setProperty`. `tests/preview-csp.test.mjs` asserts the hash policy. That is the local preview policy; the hosted Shopify storefront policy is a separate question (see Shopify section).

## 1. Browser support (late 2026) for scroll-driven animations, sticky, View Transitions, @starting-style and scroll-state queries; safe fallbacks

### Takeaway
CSS scroll-driven animations (`animation-timeline: scroll()/view()`, `view-timeline`, `animation-range`) became Baseline "Newly available" on 27 Oct 2026, when Firefox 159 turned them on by default. Chrome/Edge have had them since 115 and Safari/iOS since 26.0 (Sept 2025). Because Firefox stable support is about 3 weeks old and many users are still on older Safari/iOS, they should be a progressive enhancement behind `@supports`, with an IntersectionObserver class-toggle fallback. Same-document View Transitions and `@starting-style` are Baseline. Cross-document View Transitions and scroll-state container queries are not, so treat them as optional extras.

### Cited Findings
**Scroll-driven animations**
- web-features lists "scroll-driven-animations" as Baseline Newly Available since 2026-10-27, with Widely Available expected 2029-04-27. Support: Chrome 115 (2023-07-18), Edge 115 (2023-07-21), Firefox 159 (2026-10-27, desktop and Android), Safari 26 (2025-09-15, macOS and iOS). The feature groups `animation-timeline`, `scroll-timeline` and `view-timeline` with no per-property breakdown. — [web-features explorer: scroll-driven-animations](https://web-platform-dx.github.io/web-features-explorer/features/scroll-driven-animations)
- MDN Firefox 159 release notes: "Firefox 159 was released on October 27, 2026" and "Scroll-driven animations are now enabled by default." — [MDN Firefox 159](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/159)
- Several mid-2026 blog posts (Aug–Sept 2026) still describe Firefox as flagged (`layout.css.scroll-driven-animations.enabled`). They predate 159 and are stale. MDN now lists Firefox 160 as stable. — [MDN Firefox releases index](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases); [10LOC post (stale claim)](https://10loc.dev/posts/animation-timeline-scroll-driven-css)
- Safari 26.0 (iOS/iPadOS 26) added `animation-timeline: view()` and `animation-range`, plus a fix so scroll-driven animations on pages using `requestAnimationFrame` animate correctly after back/forward navigation. — [WebKit: Features in Safari 26.0](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/)
- Safari 26.5 shipped several scroll-driven animation fixes, including `animation-play-state: paused` not pausing correctly. A Safari 27.3 beta note says accelerated scroll-driven animations have run in the remote layer tree since Safari 26.3. — [Safari 26.5 release notes](https://developer.apple.com/documentation/safari-release-notes/safari-26_5-release-notes.md); [WebKit Features for Safari 26.5](https://webkit.org/?p=17938) (summarized via search, not fetched in full)
- Scroll-driven animations are an Interop 2026 focus area covering `animation-timeline`, `scroll-timeline` and `view-timeline` (published 12 Feb 2026). Other 2026 areas relevant here: view transitions (including cross-document), scroll snap, anchor positioning, container style queries. Scroll-state queries are not a focus area. — [web.dev: Interop 2026](https://web.dev/blog/interop-2026)
- Practical gotchas from a Nov 2026 write-up: the `animation` shorthand resets `animation-timeline`, so declare `animation-timeline` after it. `overflow: hidden` creates a scroll container that can capture the timeline, so use `overflow: clip`. Feature-detect with `@supports (animation-timeline: view())` or `CSS.supports('animation-timeline: scroll()')`. The spec is still an Editor's Draft. — [dev.to: Scroll-driven animations are Baseline at last (4 Nov 2026)](https://dev.to/richicodes/scroll-driven-animations-are-baseline-at-last-3c8g)
- Older Firefox guidance says to set a non-zero `animation-duration` (any value) for scroll timelines to work. It is unclear whether 159 still needs this. — [search summary of MDN-derived pages; unverified for 159](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline/scroll)

**Performance rationale**
- Chrome: scroll-driven animations "running off the main thread" stay smooth under heavy main-thread JS, while the equivalent scroll-listener JS version "becomes janky and sluggish." Tokopedia, redBus and Policybazaar replaced custom JS scroll effects with CSS scroll-driven animations. — [Chrome: scroll animation performance case study](https://developer.chrome.com/blog/scroll-animation-performance-case-study); [Chrome: Scroll-driven animations case studies](https://developer.chrome.com/blog/css-ui-ecommerce-sda)

**View Transitions**
- View Transitions (same-document) are Baseline Newly Available since 2025-10-14: Chrome 111, Edge 111, Firefox 144 (2025-10-14), Safari 18 / iOS 18 (2024-09-16). — [web-features: view-transitions](https://web-platform-dx.github.io/web-features-explorer/features/view-transitions)
- Cross-document View Transitions (`@view-transition { navigation: auto }`) have limited availability: Chrome/Edge 126 (June 2024), Safari/iOS 18.2 (Dec 2024), and not supported in Firefox (bug 1860854), "blocked since December 2024 by Firefox (23 months)." — [web-features: cross-document-view-transitions](https://web-platform-dx.github.io/web-features-explorer/features/cross-document-view-transitions)
- Interop 2026 includes cross-document view transitions, `blocking="render"`, `<link rel="expect">` and `:active-view-transition-type()`. — [web.dev: Interop 2026](https://web.dev/blog/interop-2026)

**@starting-style**
- Baseline Newly Available since 2024-08-06 (Widely Available expected 2027-02-06): Chrome 117, Edge 117, Firefox 129, Safari/iOS 17.5. — [web-features: starting-style](https://web-platform-dx.github.io/web-features-explorer/features/starting-style)

**Scroll-state container queries**
- web-features "container-scroll-state-queries": limited availability. Chrome/Edge 144 (Jan 2026). Not supported in Firefox (bug 1931980) or Safari/iOS. — [web-features: container-scroll-state-queries](https://web-platform-dx.github.io/web-features-explorer/features/container-scroll-state-queries)
- Conflict: other sources say Chrome 133 first supported scroll-state queries (likely the initial `stuck`/`snapped`/`scrollable` subset; the 144 figure probably covers later sub-features). One search summary claimed the WebKit Interop post said Safari and Firefox shipped it in 2025, but caniuse and web-features both say otherwise. Treat it as Chromium-only. — [caniuse: scroll-state queries](https://caniuse.com/mdn-css_at-rules_container_scroll-state_queries); [Camoa dev guide: Chrome 133+ only, IntersectionObserver fallback](https://camoa.github.io/dev-guides/css/modern-css/container-scroll-state/)

**position: sticky**
- Lenis docs: since Lenis runs on native scroll, `position: sticky` keeps working, but `position: fixed` "seems to lag on MacOS Safari pre-M1." — [Lenis README](https://github.com/darkroomengineering/lenis)
- `overflow: hidden` on an ancestor creates a scroll container (the same root cause that breaks sticky and captures scroll timelines). Use `overflow: clip` instead. — [dev.to (4 Nov 2026)](https://dev.to/richicodes/scroll-driven-animations-are-baseline-at-last-3c8g)

### Inferences
- **Recommended layering:**
  1. Base CSS shows all content in its final state.
  2. `@supports (animation-timeline: view())` blocks add scroll-linked keyframes for clip-path, scale, opacity and translate.
  3. Where unsupported (Firefox <159, Safari <26, older Chromium), a small IntersectionObserver script toggles `.in` classes so discrete transitions still play. This extends what `motion.js` already does.
  4. Under `prefers-reduced-motion: reduce`, neither runs.

  This needs no library and works with the current CSP. A JS check (`CSS.supports('animation-timeline: view()')`) can decide whether to attach the IntersectionObserver fallback, so supporting browsers don't get double animation.
- Pinned scenes should use native `position: sticky` inside a tall wrapper (e.g., a `300vh` section containing a `100vh` sticky stage), with a `view-timeline` on the wrapper driving children via `timeline-scope` or named timelines. This avoids JS pinning, which rewrites `position`/`transform` and causes CLS and jank. Check per-property support for `timeline-scope` separately (not verified here).
- View Transitions are not a scroll-storytelling tool. Same-document VT suits in-page state changes such as product-UI tabs. Cross-document VT is a progressive enhancement that is a no-op in Firefox.
- Use `@starting-style` for enter animations of elements revealed by class toggles or `[hidden]` removal, such as product-UI panels, with no JS style writes.
- Use IntersectionObserver for stuck-header styling. Don't depend on scroll-state queries.

### Gaps
- Individual support for `timeline-scope`, `view-timeline-inset` and `animation-range` named ranges (`entry`, `exit`, `contain`, `cover`) in Firefox 159 and Safari 26.x was not verified.
- The share of iOS users still on iOS <26 (no scroll-driven animations) in late 2026 was not found.
- Whether Firefox 159 still needs a non-zero `animation-duration` hack is unknown.
- I found no authoritative 2025–2026 source on new `position: sticky` bugs in iOS Safari 26 (for example, dynamic toolbar or `100vh` vs `100svh/dvh` interplay). Test with `svh`/`dvh` units on real devices.

## 2. JS library options (GSAP/ScrollTrigger, Motion, Lenis): licensing, size, INP/LCP cost; viability of no-library

### Takeaway
GSAP and all its plugins, including ScrollTrigger, have been free for commercial use since 30 Apr 2025 under Webflow's proprietary "Standard No Charge" license. It is not OSI open source and is terminable for non-compliance. Motion (motion.dev) is MIT and its `scroll()` is about 5 kB. Lenis is MIT, but it adds main-thread smoothing and is not advisable here. For a vanilla, strict-CSP Shopify theme, a no-library approach (CSS scroll-driven animations, IntersectionObserver, and at most a ~2–3 KB rAF progress helper for canvas/video scrubbing) is viable and fits Shopify's 10 KB-per-JS-file Theme Check default.

### Cited Findings
- **GSAP license:** the "Standard 'No Charge' GSAP License" is effective 30 Apr 2025 and was last modified 30 May 2025. Permitted Uses include "the implementation and/or use of GSAP Products on any website, web application, or digital interface." Commercial use is covered, and formerly paid plugins (SplitText, MorphSVG) are free. Prohibited without written consent: no-code visual animation builders that compete with Webflow's animation builder, and reverse engineering to create Competitive Products. Webflow can terminate "in its discretion" for non-compliance, and continued use after amendments counts as acceptance. — [GSAP Standard License](https://gsap.com/community/standard-license/); [GSAP pricing: 100% free](https://gsap.com/pricing/); [Webflow update: GSAP becomes free](https://webflow.com/updates/gsap-becomes-free)
- jsDelivr shows GSAP 3.15.0 as a published version (README). — [jsDelivr gsap@3.15.0 README](https://cdn.jsdelivr.net/npm/gsap@3.15.0/README.md)
- **Motion:** "Independent MIT open source," and the MIT license is "irrevocable." Motion's own comparison lists animate-mini core at 2.6 kB, full `animate` at 18 kB and GSAP at 23.5 kB. These are vendor-published figures from a competitor, so treat them as indicative. — [Motion feature comparison](https://motion.dev/docs/feature-comparison)
- Motion's `scroll()` is "5.1kb" and builds scroll-linked animations (parallax, progress, storytelling). Motion's vanilla JS API includes `animate()`, `scroll()` and `inView()`. — [Motion scroll docs](https://motion.dev/docs/scroll)
- Motion's "web animation performance tier list" ranks compositor-driven animations (CSS and WAAPI on transform/opacity) above main-thread JS. — [Motion blog: performance tier list](https://motion.dev/blog/web-animation-performance-tier-list) (title seen in search, not fetched)
- **Lenis:** MIT, v1.3.27, "a few KB", zero dependencies. `respectReducedMotion` defaults to `true` and disables smoothing, "while scroll keeps running on the main thread." Known limitations: no CSS scroll-snap support (needs the `lenis/snap` package), capped at 60fps on Safari and 30fps in Low Power Mode, does not smooth over iframes, `syncTouch` is unstable on iOS <16, and nested scroll containers need configuration. — [Lenis GitHub README](https://github.com/darkroomengineering/lenis)
- **Shopify Theme Check:** `AssetSizeJavaScript` default `threshold_in_bytes: 10000` (compressed, per single JS file, including remote scripts). For large bundles it recommends "an import on interaction pattern." The check is disabled by default for `shopify theme check`. — [Shopify Theme Check: asset-size-javascript](https://shopify.dev/docs/storefronts/themes/tools/theme-check/checks/asset-size-javascript)
- Shopify performance guidance: avoid heavy frameworks when Liquid and CSS can do the job. `defer` non-critical scripts, use dynamic `import()` in event listeners, use import maps with bare specifiers, and don't ship your own `es-module-shims` (Shopify includes it). — [Shopify: Performance best practices](https://shopify.dev/docs/storefronts/themes/best-practices/performance)
- The "16 KB JS bundle" figure seen on third-party blogs could not be found in Shopify's official docs. The official Theme Check default is 10 KB. — [Shopify performance doc (no 16 KB rule)](https://shopify.dev/docs/storefronts/themes/best-practices/performance); [ryze.ai blog (unofficial claim)](https://www.get-ryze.ai/blog/reducing-shopify-theme-javascript-for-better-lighthouse-scores)

### Inferences
- **CSP compatibility:** all three libraries ship as external files, which `script-src 'self'` allows if they are copied into `/assets`. GSAP and Motion animate by writing `element.style` properties (CSSOM), which `style-src` does not block (see Section 5 / CSP finding). None needs `eval`. Self-host rather than using a CDN, to avoid widening `script-src`.
- **INP/LCP cost:**
  - GSAP core plus ScrollTrigger exceeds the 10 KB Theme Check default. Load it with `defer`, or lazily per section, and keep it off the LCP path.
  - Scroll listeners and ScrollTrigger updates run on the main thread and compete with input handling. CSS scroll timelines don't.
  - Lenis intercepts wheel and touch input and runs a rAF loop, adding constant main-thread work. It degrades native scrolling feel (fps caps on Safari, scroll-snap conflict). Smooth-scroll hijacking is not advisable for an accessibility-focused, premium-feel brand site. Native scrolling plus CSS timelines gives Apple's actual feel, since apple.com uses native scroll.
- Use GSAP only if the team needs complex timeline choreography (sequenced multi-element timelines and SVG morphing) that CSS can't express, and accept the proprietary license. Motion `scroll()` is the lighter MIT alternative and can drive ScrollTimeline-backed WAAPI where supported.
- **No-library verdict:** viable and preferred.
  - CSS scroll-driven animations for reveals, scale and clip-path.
  - `position: sticky` for pinning.
  - IntersectionObserver for the fallback and for lazy activation.
  - A small vanilla module (computing `progress = (scrollY - start) / (end - start)` in a passive scroll or rAF loop) only for canvas/video scrubbing, the one effect CSS can't do.

### Gaps
- No independent 2026 benchmark quantifying INP/LCP deltas for GSAP vs Motion vs Lenis on Shopify themes was found.
- Exact minified+gzipped sizes for GSAP 3.15 core and ScrollTrigger were not verified from a primary source (Motion's 23.5 kB GSAP figure is a competitor's number).
- Lenis's exact gzipped size was not stated in its README.

## 3. Image-sequence vs video scrubbing vs CSS/DOM UI animation

### Takeaway
Apple's signature product scrubs use canvas-drawn image sequences, with a single still fallback on slow connections. They are heavy: one tutorial example used about 1,600 requests and ~56 MB across multiple sequences. Video scrubbing via `currentTime` only works smoothly with an all-intra encode (every frame a keyframe). For software UI, pure HTML/CSS/SVG animation of real DOM is lighter, sharper at any DPR, accessible, translatable and authorable. Prefer it for Velani's product-UI stories, and reserve image sequences or video for genuinely 3D or photographic moments.

### Cited Findings
- **Apple technique:**
  - Mechanics: a fixed `<canvas>`, a tall scroll area (e.g., body ~5× viewport), sequentially numbered frames (`0001.jpg`…), progress = scrollTop / maxScroll, frame = `Math.min(frameCount-1, Math.floor(progress*frameCount))`, drawn in `requestAnimationFrame`, all frames preloaded.
  - The example uses 148 frames. Apple loads a single fallback image on slow mobile connections.
  - Weight: about 1,600 requests and ~56 MB for multiple sequences.
  - Reader comments (unverified) report iOS Safari problems and say Apple moved some pages to synchronized video.
  - Source: [CSS-Tricks, Jurn van Wissen, 22 May 2020](https://css-tricks.com/lets-make-one-of-those-fancy-scrolling-animations-used-on-apple-product-pages/)
- **Video scrubbing:**
  - `video.currentTime` seeks cheaply only to keyframes, so a normal encode (a keyframe every few seconds) yields only a handful of distinct frames across a scroll.
  - Fix: re-encode with `ffmpeg -i source.mp4 -g 1 -an performance-scrub.mp4` (all-intra, no audio), so seeks are frame-accurate.
  - Sources: [steveharrison/scroll-video](https://hn.jakechampion.name/reader/https://github.com/steveharrison/scroll-video); [hontran.dev: scroll-scrubbed video stutters fix](https://www.hontran.dev/blog/scroll-scrubbed-video-stutters-fix); [muffinman.io: scrubbing videos using JavaScript](https://muffinman.io/blog/scrubbing-videos-using-javascript/)
- **Canvas from decoded frames:** keep an array of `ImageBitmap`s in memory and paint the matching one to a visible canvas. Reported as lag-free "on pretty much all devices," with no memory figures. An older thread warned that large sprites can crash iOS Safari. — [dev.to: Playing with video scrubbing animations](https://dev.to/abhishekcghosh/playing-with-video-scrubbing-animations-on-the-web-29k)
- **WebKit fixes:** Safari 26.0 fixed MP4 seeking with B-frames and "seeking and scrubbing reaching the requested time," and a canvas redraw-on-parent-resize issue. — [WebKit Features in Safari 26.0](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/)
- **Shopify perf guidance:** animate with `transform` and `opacity`, never hide the LCP image behind fade or reveal animations, and use `<img>` (not CSS background) for hero content. — [Shopify: Performance best practices](https://shopify.dev/docs/storefronts/themes/best-practices/performance)

### Inferences
- **Suggested budgets** (engineering judgment, not a sourced standard):
  - Image sequence: 60–120 frames of WebP/AVIF at about 1280 px wide and 15–40 KB each, so about 1.5–4 MB per scene. Load only when the scene approaches the viewport (IntersectionObserver rootMargin ~1 viewport), never on the LCP path, and show a poster `<img>` until ready.
  - Video alternative: an all-intra H.264/HEVC MP4 is usually larger per second than inter-frame video but a single request. Keep it ≤3–5 MB and muted, with `playsinline` and `preload="metadata"`.
  - Decoded memory: 120 × 1280×720 RGBA frames ≈ 440 MB, which is dangerous on iOS. Decode lazily, keep a sliding window, or reduce resolution on mobile.
- **For software UI** (dashboards, forms, assistant chat): build the UI as real HTML/CSS (or inline SVG) and animate it with scroll-driven keyframes, for example:
  - a `clip-path: inset()` reveal of a panel
  - `transform: scale()` from a "device" frame to full-bleed
  - staggered list items via `--i` custom properties
  - a typing or cursor effect via CSS steps

  This costs kilobytes, stays crisp, is screen-reader readable, works with Shopify locales (EN/ES in this repo), and degrades to a static UI without JS or under reduced motion.
- `clip-path` and `scale` transitions: prefer `transform: scale()` where possible because it's compositor-friendly. `clip-path` animations may not be compositor-accelerated in all engines, so profile in DevTools before using them on large elements.
- Draw canvas frames with `drawImage` from pre-decoded `ImageBitmap`s (`createImageBitmap`) in a rAF loop gated by IntersectionObserver, and stop the loop when offscreen. Canvas needs no CSP changes beyond `img-src 'self'` (or the Shopify CDN host).

### Gaps
- No primary Apple documentation of their current (2025–2026) technique was found. "Apple moved some pages to synchronized video" is an unverified reader comment.
- No 2026 benchmarks of all-intra video seeking vs canvas sequences on current iOS Safari 26.x.
- No documented iOS Safari canvas or decoded-image memory ceiling was found; it needs real-device testing.

## 4. Shopify specifics: performance requirements, limits, schema patterns, image tags, editor events, CSP

### Takeaway
Shopify's Theme Store bar is a minimum average Lighthouse performance score of 60 across home, product and collection pages. A private custom theme doesn't strictly need that bar but should aim well above it. Hard limits that shape scene authoring: 25 sections per JSON template, 50 blocks per section, theme-block nesting 8 levels, 256 KB per Liquid file, and a 20 MB per-file limit for assets in Theme Check. JS scenes must re-initialize on `shopify:section:load` and clean up on `shopify:section:unload`. Theme code cannot set HTTP response headers on hosted storefronts. A strict CSP on Shopify can only be added as a `<meta>` tag and must accommodate Shopify-injected scripts. That differs from the repo's local preview server, which sets headers.

### Cited Findings
- **Performance bar:** "a minimum average Lighthouse performance score of 60" across home, product and collection pages. Shopify tests on a benchmark store at submission, and the weighted speed score is not the Theme Store bar. — [Shopify: Performance best practices](https://shopify.dev/docs/storefronts/themes/best-practices/performance); [Shopify: Testing for performance](https://shopify.dev/docs/storefronts/themes/best-practices/performance/testing-for-performance)
- **Image and resource guidance:**
  - Use `image_url` and `image_tag`; they handle `srcset`, `width`/`height` and CDN delivery.
  - Mark the LCP image `fetchpriority="high"`, apply `loading="lazy"` only below the initial viewport, and never lazy-load the LCP image.
  - Use `<picture>` for separate mobile and desktop heroes.
  - Use preload "for only 1 or 2 resources the browser discovers late."
  - Self-host fonts on the Shopify CDN, and use `size-adjust` and fallback font overrides to cut CLS.
  - Serve assets from `/assets` (Shopify CDN).
  - Use Speculation Rules for likely next navigations.
  - Tap targets ≥48×48 px.
  - Source: [Shopify: Performance best practices](https://shopify.dev/docs/storefronts/themes/best-practices/performance)
- **Theme limits:**
  - JSON templates per theme: 1,000. Sections per JSON template: 25.
  - Section groups: 20 per theme, 25 sections each.
  - Blocks per section: 50 (`max_blocks` can lower it). Blocks per template or group: 1,250.
  - Theme-block nesting depth: 8. `blocks/` files per theme: 300. Statically rendered `{% content_for %}` blocks don't count toward block limits.
  - File sizes: JSON template 512 KB; Liquid (section, snippet, layout) 256 KB; single `liquid` setting 50 KB; `settings_data.json` 1.5 MB.
  - Package: 50 MB compressed; 250 MB total non-asset code; 100,000 files.
  - Schema `name` max 25 characters.
  - Source: [Shopify: Theme limits](https://shopify.dev/docs/storefronts/themes/architecture/limits)
- **Asset size:** Theme Check's max-file-size lists a 20 MB limit for the `assets` path. A community report shows a 230 MB video in assets failing with 413 via `shopify theme serve`, so large videos belong in Shopify Files/video hosting, not theme assets. — [Shopify Theme Check: max-file-size](https://shopify.dev/docs/storefronts/themes/tools/theme-check/checks/max-file-size); [Shopify Community: 413 uploading large video](https://community.shopify.com/t/shopify-cli-uploading-large-video-request-entity-too-large-theme-serve-sync-update-error/132475)
- **Theme editor events:**

  | Event | `event.detail` |
  |---|---|
  | `shopify:section:load` | `{sectionId}` |
  | `shopify:section:unload` | `{sectionId}` |
  | `shopify:section:select` | `{sectionId, load}` |
  | `shopify:section:deselect` | `{sectionId}` |
  | `shopify:section:reorder` | `{sectionId}` |
  | `shopify:block:select` | `{blockId, sectionId, load}` |
  | `shopify:block:deselect` | `{blockId, sectionId}` |
  | `shopify:inspector:activate` / `shopify:inspector:deactivate` | (none listed) |

  - Section and block events bubble and are not cancellable.
  - On re-render, "any associated JavaScript that runs when the page loads won't run again." On load, "Re-execute any JavaScript needed for the section to work... as if the page had just been loaded." On unload, remove listeners and variables to avoid leaks.
  - `Shopify.designMode` is `true` in the editor (Liquid: `request.design_mode`).
  - Source: [Shopify: Integrate sections and blocks with the theme editor](https://shopify.dev/docs/storefronts/themes/best-practices/editor/integrate-sections-and-blocks)
- **CSP on Liquid storefronts:**
  - Hydrogen (headless) gets a nonce-based CSP via `createContentSecurityPolicy` with cdn.shopify.com allowances. — [Shopify Hydrogen: createContentSecurityPolicy](https://shopify.dev/docs/api/hydrogen/latest/utilities/createcontentsecuritypolicy)
  - Liquid themes can't set response headers or generate per-request nonces, so a theme CSP must be a `<meta http-equiv>` tag in `layout/theme.liquid` using hashes. Community reports say a meta-tag CSP works for `object-src 'none'; base-uri` but breaks once `script-src` is restricted, because of Shopify-injected scripts. Community/third-party sources only. — [Shopify Community: object-src meta CSP](https://community.shopify.com/t/partial-fix-add-object-src-none-csp-meta-tag-to-improve-pagespeed-best-practices-score/662038); [Shopify Community: CSP meta tag that works with Shopify](https://community.shopify.com/t/creating-a-content-security-meta-tag-that-works-with-shopify/181585); [Report URI: Shopify platform guide](https://docs.ams.report-uri.com/md/platforms/shopify.md) (fetch returned 403; summarized from search)
  - Chrome ignores `upgrade-insecure-requests` in a report-only policy. — [Shopify app-bridge issue #551](https://gh.r-mj.com/Shopify/shopify-app-bridge/issues/551); [MDN: upgrade-insecure-requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/upgrade-insecure-requests)

### Inferences
- **Authorable scene pattern:**
  - One section file per scene type, e.g. `sections/scroll-scene.liquid`, rendering a wrapper with `data-scene` and a CSS custom property for length (e.g., `--scene-length: 300` → `300vh`) from a `range` setting.
  - Theme blocks (`blocks/*.liquid`) or section blocks for steps: heading, body, image, UI-panel and stat, each with a `select` setting for the effect preset (fade-up, clip-reveal, scale-in) mapped to classes, not inline JS.
  - Shared markup in `{% render 'scene-step' %}` snippets.
  - Settings feed CSS via `class` and `data-*` attributes. Write custom properties in `style=""` attributes; the repo's `style-src-attr 'unsafe-inline'` allows these, but a stricter Shopify meta CSP without `style-src-attr` would block them. Prefer class presets to keep CSP options open.
- Keep scene choreography in a static `assets/scenes.css` (cacheable, CSP-safe `'self'`/CDN). Avoid Liquid-generated `<style>` blocks inside sections if the eventual Shopify CSP will forbid inline `<style>` (Shopify's own section `{% style %}`/`{% stylesheet %}` tags emit inline or bundled CSS; verify their output under the chosen CSP).
- **JS module pattern:** a custom element (`<scroll-scene>`) whose `connectedCallback`/`disconnectedCallback` set up and tear down observers. Custom elements reinitialize automatically when the theme editor swaps section HTML, which covers `section:load`/`unload` without global listeners. Add `shopify:block:select` handling that scrolls the scene to the selected step and pauses autoplay in `Shopify.designMode`.
- **LCP:** the first scene's first frame or poster should be a server-rendered `{{ image | image_url: width: 1600 | image_tag: fetchpriority: 'high', loading: 'eager', sizes: '100vw', widths: '...' }}` with no reveal animation. Later scene images use `loading: 'lazy'`. Preload at most the one late-discovered asset, such as the DM Sans woff2 placed above `{{ content_for_header }}`.
- **CSP strategy on hosted Shopify:** the preview server's header CSP cannot be reproduced exactly on the storefront. `content_for_header` injects Shopify scripts, and their hashes may vary. A restrictive `script-src` meta tag risks breaking checkout, analytics and editor scripts. Theme code should stay compatible with a strict policy (no inline handlers, no `eval`, no runtime `<style>` injection, external `/assets` files only) whether or not the meta CSP is enforced. Per AGENTS.md, only unpublished themes may be changed.
- The Theme Store 10 KB/JS-file check is a guideline for private themes, but it's a useful budget: split per-scene modules and load each via dynamic `import()` when its section nears the viewport.

### Gaps
- No official Shopify doc found stating exactly which CSP headers hosted Online Store storefronts send in 2026, or how `content_for_header` inline scripts interact with a merchant meta CSP. This needs empirical inspection on the unpublished preview theme.
- The Shopify `video` setting type and `video_tag` filter (for hosting scrub videos in Shopify Files) were not covered by results. Check the Liquid reference.
- Whether Theme Store requirements explicitly mandate `prefers-reduced-motion` support was not verified.
- The output of Shopify's `{% stylesheet %}`/`{% javascript %}` section tags under a strict `style-src` was not verified.

## 5. Accessibility and robustness: reduced motion, no-JS, CLS, focus in pinned sections, Playwright testing, CLS/INP verification

### Takeaway
Build every scene so the final, readable state is the default CSS. Add motion only inside `@media (prefers-reduced-motion: no-preference)` plus `@supports`, or via JS classes added after load. Under the current CSP, JS may drive animation through CSSOM property writes (`el.style.setProperty('--progress', p)`). CSP blocks `<style>` injection, `setAttribute('style')`, and possibly `cssText`. Test with Playwright: scripted scrolling, screenshots at fixed progress points, emulated reduced motion, and PerformanceObserver-based CLS and event-timing (INP proxy) collection.

### Cited Findings
- **CSP and JS style writes (MDN `style-src`):** blocked without `'unsafe-inline'`: `<style>` elements, inline `style=""` attributes, `setAttribute("style", ...)`, and `style.cssText = ...`. Not blocked: "styles properties that are set directly on the element's `style` property... allowing users to safely manipulate styles via JavaScript" (e.g., `el.style.display = 'none'`). MDN elsewhere says no browser blocks CSSOM string-parsing methods, which conflicts with its `cssText` example, so test `cssText`/`insertRule` before relying on either. — [MDN: CSP style-src](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/style-src)
- A CSP Level 3 implementation report confirms `element.style.prop = ...` and `setProperty()` are not blocked by `style-src` (single-user test). — [Elixir Forum CSP L3 findings](https://elixirforum.com/t/proposal-mix-phx-gen-csp-csp-level-3-support-for-phoenix/74742/6)
- Lenis `respectReducedMotion` defaults to true, which shows the expected norm that smoothing and animated programmatic scroll are disabled under reduced motion. — [Lenis README](https://github.com/darkroomengineering/lenis)
- Shopify: don't hide the LCP image behind fade or reveal animations. Animate `transform`/`opacity`, not layout properties. Use font `size-adjust` overrides to reduce CLS. — [Shopify: Performance best practices](https://shopify.dev/docs/storefronts/themes/best-practices/performance)
- **Playwright CLS:** register a `PerformanceObserver` for `layout-shift` via `page.addInitScript()` before page scripts run, and sum entries without `hadRecentInput`. Headless CLS misses scroll-only shifts unless the test scripts the scroll (`page.mouse.wheel`/`window.scrollTo`). The `web-vitals` library uses `buffered: true` but reports CLS and INP only at visibility change or pagehide, which is awkward in tests. INP needs a real interaction (click or keypress) and an Event Timing read. — [Checkly: Measuring page performance using Playwright](https://www.checklyhq.com/learn/playwright/performance/); [TestingBot: Playwright performance](https://testingbot.com/support/web-automate/playwright/performance); [FocusReactive: Testing web application performance with Playwright](https://focusreactive.com/testing-web-application-performance-with-playwright/); [web-vitals (mirror)](https://gitee.com/mirrors_GoogleChrome/web-vitals)
- Shopify's Lighthouse-based score is the Theme Store gate, measured on Shopify's benchmark store, not a local render. — [Shopify: Testing for performance](https://shopify.dev/docs/storefronts/themes/best-practices/performance/testing-for-performance)

### Inferences
- **Reduced-motion pattern:**
  - Wrap all scroll keyframes in `@media (prefers-reduced-motion: no-preference) and (scripting: enabled)`, or gate on a `.js` root class that `motion.js` already sets, alongside `@supports (animation-timeline: view())`.
  - In JS, read `matchMedia('(prefers-reduced-motion: reduce)')` (already done in `motion.js`) and skip canvas/video scrubbing, showing the poster or final frame.
  - Listen for `change` so toggling the OS setting mid-session stops motion.
- **No-JS readability:** text sits in real DOM in the final position. Pinned stages use `position: sticky` (pure CSS), so without JS or scroll-timeline support a scene is simply a tall section with sticky content. Consider collapsing the scene length (`--scene-length` → auto) when neither scroll timelines nor JS are available, to avoid long empty scroll distances.
- **Avoid CLS:**
  - Reserve canvas/video dimensions with `width`/`height` attributes or `aspect-ratio`.
  - Animate only `transform`, `opacity`, `clip-path` and `filter`. Never animate `top`, `height` or margins.
  - Don't inject DOM above the fold after load.
  - Use `svh`/`lvh` instead of `vh` for sticky stage heights on iOS to avoid toolbar-driven resizes.
  - Keep word-splitting (as `motion.js` does) layout-neutral, with inline-block spans of the same metrics.
- **Focus in pinned sections:**
  - Content that is visually hidden at a given scroll progress must not be focusable. Either keep all step text visible but transformed, or toggle `inert` on off-stage steps via IntersectionObserver.
  - When a focused element sits inside a sticky stage, ensure `scroll-margin`/`scroll-padding-top` accounts for the fixed nav (`#gnav`), so keyboard tabbing doesn't hide focus under the header (WCAG 2.2 SC 2.4.11 Focus Not Obscured).
  - Don't trap scroll or focus. Native scroll and no hijacking keep keyboard (Space/PageDown), screen-reader and find-in-page behavior intact.
  - Decorative canvas/video gets `aria-hidden="true"` with a text alternative in the DOM; product-UI mockups need meaningful labels or `role="img"` with `aria-label` if purely illustrative.
- **Playwright test plan** (fits existing `tests/` style):
  1. For each scene, scroll to 0/25/50/75/100% of its range via `window.scrollTo` then `page.waitForTimeout`/rAF, and take a screenshot per breakpoint (390, 834, 1440 px).
  2. Repeat with `page.emulateMedia({ reducedMotion: 'reduce' })` and assert the final-state screenshot.
  3. Repeat with `javaScriptEnabled: false` and assert all headings and copy are visible (non-zero bounding boxes, opacity 1).
  4. Collect `layout-shift` entries across the full scripted scroll and assert CLS < 0.1.
  5. Collect `event` timing entries (`durationThreshold: 16`) after clicking UI-panel controls and assert < 200 ms.
  6. Listen for `securitypolicyviolation` events and console CSP errors, and fail on any.
  7. Run in Chromium, WebKit and Firefox projects. WebKit on Linux approximates Safari engine behavior but not iOS GPU/memory.
- A local Playwright/Lighthouse run is not hosted Shopify acceptance (AGENTS.md). Final CWV verification needs the unpublished preview theme on Shopify's CDN, plus field data (CrUX/Shopify Web Performance dashboard) after launch.

### Gaps
- No source confirmed whether Web Animations API (`element.animate()`) keyframes are subject to `style-src`. Spec intent suggests not, as they don't parse style attributes, but test under the actual CSP.
- No authoritative source found for how screen readers treat content inside `position: sticky` stages during scroll-linked animation; it needs manual VoiceOver/NVDA testing.
- Playwright guidance came from vendor blogs (Checkly, TestingBot, FocusReactive), not official Playwright docs; API details should be checked against the installed Playwright version.
