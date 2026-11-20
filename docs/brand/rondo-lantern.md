# Rondo — approved Lantern concept 1

The original vector was recovered from the Codex chat **Rondo icon/avatar
design**, thread `01a1b6ef-59b4-7280-927b-8f6f295aaebc`, imported turn 3,
item 47 (`rondo_premium_concepts`). Jose's subsequent instruction is retained
in turn 4, item 52:

> Go with Rondo concept 1 (Lantern). Refine it and build the final set for the
> NEVORA app and the Velani site.

This recovers the actual approved vector rather than selecting a replacement
concept or requiring the original Mac-local concept folder. The source uses a
48-unit grid, a ring centered at (24,24) with radius 13, an opening from -65 to
-35 degrees and a point of light at -50 degrees. The 6.2-unit halo and 3.3-unit
point retain the original geometry. Coordinates are rounded to two decimals,
as in the original concept code.

The ring is slightly heavier (2.75 instead of 2.25 units) and more opaque (.8
instead of .55) for contrast at small sizes. The separate 16px optical export
uses a full-opacity 1px ring and a 1.33px point. The site version uses pale blue
on flat navy; the app export uses white on teal. The monochrome master inherits
`currentColor`. Asset hashes and the original parameters are recorded in
`rondo-lantern-provenance.json`.

The website uses the same vector in the public adviser launcher/header,
assistant answers and fictional Owner examples in English and Spanish. Names,
scope labels and availability claims remain text. Inline marks are decorative
(`aria-hidden`, nonfocusable SVG); standalone exported SVGs have the accessible
name “Rondo”. The official Velani and NEVORA logos/favicons are retained.

The light travels the ring only during an actual pending answer. Verification
is explicitly static, and reduced motion disables the orbit. The existing
localized progress status supplies meaning without depending on motion. This
source delivery does not activate an assistant or publish a Shopify theme.

Exports (also copied into the built theme's assets):

- `rondo-lantern.svg`: monochrome master, 48px default.
- `rondo-lantern-16.svg`: optical monochrome 16px version.
- `rondo-lantern-site.svg`: 48px navy/pale-blue site badge.
- `rondo-lantern-app.svg`: 48px teal/white app badge, ready for the separate app
  UI owner; no NEVORA application component is changed by this website work.

These are source-derived vector exports, with no stock image or external asset
download. Any separate name/rights review retains its existing owner and scope.
