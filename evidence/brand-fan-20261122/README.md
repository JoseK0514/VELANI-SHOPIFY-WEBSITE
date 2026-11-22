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

## Unpublished Shopify theme update

- Target read first: theme `193710227770`, role `UNPUBLISHED`. The live theme `193311572282` (`MAIN`) was read before and
  after and is unchanged (`updatedAt` 2026-11-11).
- The 12 changed files were uploaded from the commit `c627743` build through private staged uploads (HTTP 201 each), then
  written with `themeFilesUpsert` (URL bodies, two jobs, both done). No other file changed.
- Read back from Shopify: all 12 `checksumMd5` values equal the local `md5sum`:

  | File | MD5 |
  | --- | --- |
  | `assets/apple-touch-icon.png` | b00f6d4da832dffc28bbce8119a4050e |
  | `assets/favicon-32.png` | c999ac2740f18f213ae6e09ea5cf89dc |
  | `assets/favicon.svg` | c0a303b24c0ad9d5e890dc09deb47e4b |
  | `assets/velani-day.css` | 40ea23899f555ebec9257f6a03cd78fc |
  | `assets/velani-social.png` | 852c448576f6064c6cb8296f06ce2b1c |
  | `assets/velani-social-es.png` | 0992d331958acae953b354a443541db0 |
  | `assets/velani-social-rondo.png` | a1dd6c192c5e7409c39b59a14978c7b0 |
  | `assets/velani-social-rondo-es.png` | 05bb1bce90e9b761a1fbd030dc588cdc |
  | `assets/velani-social-relay.png` | 9e82c851cca6e1a6757b2a152fa5e209 |
  | `assets/velani-social-relay-es.png` | 8307bea487bb8e7bfd8ecd10bd767473 |
  | `snippets/velani-day-header-en.liquid` | e08e6e1b547c6745de9ccc7fe7ca11cb |
  | `snippets/velani-day-header-es.liquid` | 71beea6bccbe039513d3fb2647fed13d |

- The theme was renamed "Velani Day design c627743 (preview)". Nothing was published; no store data changed.
- Hosted rendering is still not verified (no theme screenshot permission; previews need a Shopify sign-in).
