# Second decisions pass and Codex review 3, 2026-11-04

Jose's decisions:
1. A demo that ends on day 30 without a plan: all of its data is deleted within 3 days, timecards and pay statements included. Written the same way on Plans (intro and day-30 step), Support FAQ, the demo contact form, the NEVORA privacy policy (new first line in "How long we keep information": the retention periods apply to workplaces on a plan) and account deletion. Each place tells the business to export first if it needs the records.
2. NEVORA is presented as finished (it ships together with the finished NEVORA): removed "Final features in progress" (NEVORA hero), "We are still finishing a few features" (FAQ), "we are finishing a few final features" (Plans), "with its final features in progress" (website terms, project terms) and "which features are still in progress" (About). The Faro card keeps its "In development" label until Jose decides otherwise.

Codex review 3 fixes:
- NEVORA header no longer overflows at 305 px of usable width (scrollWidth 308 -> 305).
- Cookie dialog: when the platform privacy service is unavailable, the checkboxes are disabled along with the buttons (tested by serving the page as Shopify without the privacy API).
- Plans: Start free demo and Ask for a quote under the introduction (first button at 548 px on a 320 x 568 phone; was about 2,800 px).
- Faro's last message: "Done. Maria is scheduled 2 to 8 pm, and I let her know."
- NEVORA heading: "Schedule. Clock in. Calculate pay."

Checks (all passed): unit 33, theme check, acceptance 77, browser 51, clipping 18 routes, layout 19, scroll 8, privacy 4.
