# Straight screens and the second Codex review, 2026-11-04

Jose noticed that two pictures looked crooked: the Yavi phone (Booking and loyalty) and the NEVORA monitor (Business tools).

- Phone: the screen corners were measured from the original photo (docs/reference/night-ai-phone-blank.webp) by fitting a line to each screen edge (edges.py). The old mapping's top edge sloped the wrong way, 40 px off at the top-right corner (shots/phone-screen-edges-old-green-new-red.png). The phone was rebuilt with the measured corners, the photo's own screen shape as the mask, and status-bar space above the app (phone2.py).
- Monitor: the mapping was geometrically right, but the monitor is turned about 40% toward the camera, so a flat app on it always reads as slanted (shots/monitor-angled-attempt-rejected.png). Business tools now shows the NEVORA web Home screen straight, in a framed window over a softened room photo (night-ai-room.webp). The original monitor photo is restored as night-ai-dash.webp and is no longer used on the page.
- Booking photo moved so the headline clears the phone at 1440 x 1000.

From the second Codex review:
- Phone Home: company message and buttons first, then the Faro card with equal 20 px side margins. The conversation starts when the card scrolls into view.
- Home NEVORA and Custom apps on phones: the gap between device and copy is 32 px (was about 240 px). Phone closing section shorter.
- Desktop header on Custom development: Start a project (the NEVORA demo stays everywhere else).
- Kept: full-screen desktop panels and the closing brand panel (approved site language). Online stores photo stays until a real store project exists.

Checks (all passed): unit 33, theme check, acceptance 77, browser 51, clipping 18 routes, layout 19, scroll 8, privacy 4. Probe on Home and Custom development at 1440, 1024 and 390: no overlaps, axe clean; one phone contrast flag was the rounded corners of a light chat bubble (dark text on #bbd8ff), not a real failure.
