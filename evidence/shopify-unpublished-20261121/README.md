# Unpublished Shopify theme upload, November 21, 2026

Store: The Velani (`www.thevelani.com`), through the Shopify connector. Nothing was published, and no store data was
changed (no pages, menus, policies, settings or products).

## What was uploaded

- Source: commit `1e22602` (clean tree), `npm run build` then `npm run package:theme`.
  - Archive: `dist/velani-unpublished.zip`, 197 files, 7,065,343 bytes.
  - SHA-256 starts `47fc9501ec54f1e8`; the full hash is in `dist/theme-manifest.json` at build time.
- Theme list before writing: 14 themes. The live theme (`MAIN`) is `193311572282` "Velani signature hero (preview)".
- Upload steps:
  1. `stagedUploadsCreate` (FILE, application/zip): a private, signed slot that expires in 24 hours.
  2. HTTP POST of the archive to it: 201.
  3. `themeCreate(role: UNPUBLISHED)` from that staged URL.
- Result: theme **`193710227770` "Velani Day design 1e22602 (preview)", role `UNPUBLISHED`**. Processing finished with no failure.
  - The live theme is unchanged: same id, still `MAIN`, `updatedAt` 2026-11-11.

## Read back

- **Files:** 196 of the archive's 197 files arrived, and Shopify added its standard `templates/gift_card.liquid`.
  - The import skipped `templates/robots.txt.liquid`, although earlier preview themes and the live theme have it.
  - Re-read the target role (`UNPUBLISHED`), then added it with `themeFilesUpsert` (base64, exact bytes).
- **Checksums** (Shopify `checksumMd5` = local `md5sum`):

  | File | MD5 |
  | --- | --- |
  | `templates/robots.txt.liquid` | d31df357e930241b952797ec71322efb |
  | `layout/theme.liquid` | c7bef368514691ca45d38907c68fa458 |
  | `assets/velani-day.css` | 4e59d23edfb29cbf44498a7b74a90177 |

## Not verified (hosted acceptance is still open)

- The Shopify connector refused `theme_screenshot` and `theme_bash`: "This connector requires additional permissions." So
  no page of this theme was seen rendered on Shopify.
- An anonymous request to `https://www.thevelani.com/?preview_theme_id=193710227770` is redirected to `/` and gets the live
  theme. Unpublished previews need a signed-in Shopify session.
- Hosted rendering, links, forms (preview mode), billing hooks and both languages remain to be checked:
  - by the owner, signed in to Shopify, using the preview links; or
  - by a session whose Shopify connector has theme read and screenshot permissions.
