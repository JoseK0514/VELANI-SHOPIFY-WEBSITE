# Full-site inspection, 2026-11-04

Scope: all 18 routes plus the 404 page, at 390 (iPhone 13), 768, 1024 and 1440 px, with reduced motion and without JavaScript.

Method:
- A scripted browser probe measured overlaps, clipping, contrast (including pixels behind text on photos), focus rings, tap sizes, images, links, console errors and axe-core rules.
- 18 reviewers read the probe data and screenshots: 5 for copy (stop-slop rules), 6 for design critique, 7 for UI and interaction states.
- They returned 187 findings. Each was checked against the code and the rendered page before any change.

Fixed (source in src/ and public/assets/):
- NEVORA described as "in development" on Plans and software terms; now "available now" everywhere.
- Day-30 wording made the same everywhere: "we delete all of it within 3 days".
- Spanish described the same everywhere; product line "payroll calculation" on Home and NEVORA.
- Phone: both Home hero buttons now inside the first screen; About and Custom development heroes no longer sink below the fold.
- Phone notification no longer covers the app greeting; its "now" label passes contrast (5.0:1).
- Custom apps text clear of the phone frame; Booking headline clear of the phone screen; tablet photos moved away from the text.
- Header and NEVORA bar labels no longer wrap at 834 to 1023 px; NEVORA hero no longer overlaps its phone at 834 to 880 px.
- Two header items marked current on Custom development; now one.
- Buttons that linked to the page you were on (Support, NEVORA support) now go somewhere useful.
- Footer phone number no longer splits across lines; footer wordmark crop is the same at every width; Legal link added.
- Document pages: contents list kept on tablet and phone, text column aligned, 44 px chips, narrower measure, aside landmark fixed (axe clean).
- Account deletion: numbered steps and a list of what is kept.
- Contact: "optional" reads as a qualifier, "Number of locations", shorter team option, error border survives focus, status shown next to the button, message label follows the topic.
- Cookie dialog on phones: save confirmation visible.

Left for Jose:
- Backup retention sentence in the NEVORA privacy and account-deletion pages ("we are verifying...") needs the real number.
- The NEVORA app's own policies.ts should receive the website-side policy edits before the next regeneration.

Checks on the final build (all passed): unit 33, theme check, acceptance 77, browser 51, clipping 18 routes at 320 px and 200% zoom, layout 19, scroll 8, privacy 4.
Not run: assistant check (its Playwright version wants a browser build this container does not have).
Not uploaded: the 24 changed theme files were not sent to preview theme 193020428602; the upload was declined at the permission prompt.

Screenshots after the fixes: after/desktop-<page>.png and after/phone-<page>.png.
