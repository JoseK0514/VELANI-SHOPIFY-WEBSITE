# Velani entrance — release 0.2.2

The owner rejected the original thin V / curtain reveal. This revision replaces it with a sculptural titanium V on porcelain, oversized tight typography, and a reveal through the V's negative space. Implemented in the development homepage; the public Shopify theme has not been changed.

## Experience

A close view of the metal turns and pulls back into a recognizable V. VELANI rises into view as one large typographic unit. After a short hold, the camera pushes toward the sculpture and an expanding triangular opening reveals the real page. The entire sequence lasts 3,350 milliseconds. A small NEVORA identifier is the only secondary copy.

- [Desktop recording](velani-entrance-desktop.mp4)
- [Mobile recording](velani-entrance-mobile.mp4)
- [Looping preview](velani-entrance.gif)
- [Desktop still](entrance-desktop.png) / [mobile still](entrance-mobile.png)
- [Art direction and design decisions](entrance-design-plan.md)

The recordings reveal the existing NEVORA development guide. The same entrance can reveal the live Shopify homepage using the installation below. Aesthetic approval remains with the owner.

## Preserved behavior

- Once per tab session. Only the marker `sessionStorage['velani:entrance:v2'] = 'seen'` is stored. An old v1 marker may remain in an already-open tab after upgrading; neither value contains visitor details or authentication tokens.
- Skip works immediately; Escape and Tab also dismiss. A timer closes the dialog independently of animation events.
- Optional footer Replay preserves the visitor's scroll and focus.
- Reduced-motion users go directly to the page. Changing that preference during playback closes it.
- Fragment links, history restoration, restored scroll, hidden tabs, already-focused controls and Shopify theme-editor mode bypass automatic playback.
- No JavaScript, unsupported native dialog or missing entrance CSS leaves the page available. Missing WebGL/renderer uses an animated vector fallback.
- No sound, video downloads, third-party animation libraries or AI calls. WebGL draws only while the entrance is open; its context is disposed on pagehide.
- Controls follow the page's English or Spanish `lang` attribute.

## Files

- `public/entrance.css`: porcelain/graphite palette, composition, typography and triangular reveal.
- `public/entrance-renderer.js`: standalone WebGL sculpture, studio reflections and camera path.
- `public/entrance.js`: playback, rendering lifecycle, first-visit marker, input and reduced motion.
- `public/index.html`: accessible dialog, canvas, vector fallback and replay control.
- `public/app.js`: preserves `[data-entrance-control]` during pending AI operations.
- `integration/shopify/velani-entrance.liquid`: Shopify markup and asset includes.

The sculpture is an authored V interpretation, not an imported approved logo. The included local Manrope font is served as `velani-entrance.woff2` for consistent typography across hosts, with an optional Arial fallback that avoids late font swaps. Preserve its supplied font license.

## Shopify installation

1. Work in a duplicate theme. Copy `public/entrance.css`, `public/entrance-renderer.js`, `public/entrance.js` and `public/velani-entrance.woff2` into `assets/` using these exact filenames.
2. Copy `integration/shopify/velani-entrance.liquid` into `snippets/`.
3. Immediately after the opening `<body>` in `layout/theme.liquid`, insert once:

   ```liquid
   {% render 'velani-entrance' %}
   ```

4. Optionally add the replay button to the homepage/NEVORA footer, using the theme's text-button styling:

   ```html
   <button type="button" id="replay-entrance" class="text-button" data-entrance-control hidden>
     Replay intro
   </button>
   ```

5. Open the theme preview outside the editor in a fresh tab. The snippet is limited to the homepage and the `nevora` page; the shared marker prevents repeat playback between them.
6. Verify the actual theme's typography, other dialogs, mobile, Skip, reduced motion, WebGL fallback and a direct `#try` link before publishing. Live Shopify, native Safari and Firefox, and real-device performance remain unverified.

Keep the stylesheet before the scripts, and the renderer script before the controller script. Do not tie dismissal to AI requests. If another theme script disables all buttons, exempt `[data-entrance-control]`.

## Local preview and verification

Run `npm run dev`, then visit `http://localhost:3001`; the footer offers Replay. Clear only the new marker to test automatic playback again:

```js
sessionStorage.removeItem('velani:entrance:v2');
location.reload();
```

Chromium behavior checks cover first visit, automatic completion, repeat suppression, Skip/Escape/Tab, replay focus/scroll, Spanish controls, reduced motion and preference changes, no JavaScript, blocked storage, missing stylesheet, missing renderer, and WebGL fallback. Additional checks protect Skip during a pending mocked AI request and prevent overlap with an existing modal. Desktop, mobile and landscape layouts were inspected. Typecheck, build and frontend-serving checks are run separately from the visual renderer checks.

The headless environment uses software WebGL. The recordings demonstrate the implemented sequence, not a hardware-device frame-rate guarantee. The renderer adapts between 350,000 and 600,000 pixels and antialiases the silhouette to keep work bounded; measure frame rate on target phones before publishing. No model calls or database writes are required for these checks.
