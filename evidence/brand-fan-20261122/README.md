# Velani symbol "Fan", November 22, 2026

The user asked for a Velani brand symbol without a V, attractive and unusual, that works as an app icon and as the browser
icon. They picked **Fan** ("go with fan"): four quarter circles on a 2 × 2 grid, three facing one way and one turned back.

## Exploration (`exploration/`)

Kept in the order they were made, with what was dropped and why. These sheets are scratch work; nothing in them ships
except Fan.

| File | Round | Outcome |
| --- | --- | --- |
| `velani-symbols.png`, `velani-symbols-r2.png`, `velani-symbols-final.png` | 1 and 2: meaning-led marks (the working day, shifts, "vela") | Dropped as lookalikes: Wi-Fi (Rise), spinner (Week), menu (Shift sun), AI sparkle (Daystar), horseshoe (Day dial), pinwheel (Turn), sailboat clip art (Vela) |
| `velani-symbols-r3.png`, `velani-symbols-r3b.png`, `velani-turnover.png` | 3: two readings per mark | Turnover (setting sun over rising sun) developed into a sheet; Faro (bow tie), Gnomon (busy), Puerta (toaster) and Halftone (grey at 16 px) dropped |
| `round4-sketch.png` | 4: San Juan places (window, door, tile, punch card, garita) | Stopped by the user: "it can be shapes ... that attracts peoples visual" |
| `round5-sketch.png`, `round5b-sketch.png` | 5: pure form | Dropped: Weave (App Store logo), Slice (Linear logo), Trio (radiation sign), Notch and Eclipse (notification badge), Twist (reads as S), Petals and Lancet (X, bow tie), Steps (quotation mark) |
| `gen.png` | 5: 72 generated 2 × 2 compositions from quarter circles, petals, half discs and dots | Fan is no. 17, Dune 46, Bloom 22, Piece 32 |
| `finalists.png`, `velani-symbols-r5.png` | 5: finalists | Fan, Dune, Bloom, Piece |
| `velani-icon-test.png` | App icon and browser icon test, after the user's reminder | Each finalist and Turnover as an iPhone icon, Android circle mask, home screen, light and dark tabs, a search result, and real 16/32 px rasters. Fan and Turnover passed; Bloom failed at 16 px (jagged X); Dune looked small in a tab; Piece crowded. Shrinking the 48-unit drawing blurred every gap to grey, so the shipped icons are drawn on their own pixel grids |

## What shipped

- `scripts/brand-icons.mjs` (was `favicon-png.mjs`) is the single source of the symbol. It writes:
  - `src/brand/velani-mark.svg`, `favicon.svg` (ink, white on dark tabs) and `velani-app-icon.svg`;
  - `favicon-32.png` (dark tile), `apple-touch-icon.png` (180, full bleed) and `velani-app-icon.png` (1024, for listings and
    profile pictures).
- The old serif-V tab icon is gone.
- Header and phone menu: the symbol (18 px, `aria-hidden`) before the wordmark; the link keeps its label. English and Spanish,
  preview and theme snippets.
- Share images: the symbol beside the wordmark on the six Velani-branded images (NEVORA- and Plans-branded images are
  unchanged).
- `tests/brand.test.mjs`: symbol geometry, no trace of the V, PNG sizes, header markup in both languages and theme snippets.

`brand-check.png` shows the app icon, the 180 px icon, and the 32 px tab icon zoomed and at size. `hdr-desktop.png`,
`hdr-phone.png` and `hdr-menu.png` show the header (1280 px, 390 px, phone menu open).

## Verification

- `npm test`: 124/124 (3 new brand tests).
- `npm run check:theme`: no offenses.
- `scripts/browser-check.mjs`: 101/101, no runtime errors, posts or external requests (`report.json`, screenshots).
- Day check on all 43 routes: 903/903 (`day-check.txt`), covering CSP, axe, keyboard, phone menu and 320 px.
- Theme output against the uploaded commit `1e22602`: 12 files differ (3 icons, `velani-day.css`, 6 share images, the two
  header snippets).

Not verified: hosted Shopify rendering, Safari and Firefox, and real home-screen installs on iOS and Android.
