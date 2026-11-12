# Jose's decisions on F05, F06 and F09 (2026-11-04)

- **F05, availability.** Jose: NEVORA is 90% done; present it as ready to deliver. Wording used everywhere: "Available now" with "Final features in progress" on the product page, the About page and the website terms' product-availability note; "in development" removed from product copy and the footer note. Kept: the Faro assistant card's "In development", because that is still true. The NEVORA repository's own README (`/home/user/NEVORA/README.md:7,16`) says SaaS is paused for a one-company delivery and no production deployment is implied; Jose should reconcile that with the public statement.
- **F06, day 30.** Jose: all information is deleted. Wording: "we delete all of it within 3 days" on Plans, the demo fine print and the Plans FAQ. The NEVORA privacy policy's retention schedule (three years for attendance, timecards and pay statements) still conflicts for a demo that holds real records; that policy needs a demo-specific clause or the promise must be narrowed.
- **F09, sign-in.** From the NEVORA code and docs (read-only analysis): each workplace has its own sign-in address given by the employer; there is no shared login; sign-in is Employee ID and password, with passkey or Face ID where offered; new employees activate from an invitation email; recovery uses Forgot access with the Employee ID and registered email, otherwise the manager or Owner. The NEVORA support and account-deletion pages now say this, and the two in-app links (`/login`, `/forgot-access`) that pointed nowhere on the public site were replaced with text.

| Suite | Result |
| --- | --- |
| `npm test` (availability test updated) | 33/33 |
| `npm run check:theme` | clean |
| acceptance | 77/77 |
| layout-audit | 19/19 |
| clipping | 18/18 |
| privacy | 4/4 |
| browser (status check updated to "Available now") | 51/51 |
