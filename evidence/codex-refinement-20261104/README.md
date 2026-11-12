# Custom development refinement after the Codex review, 2026-11-04

Codex reviewed the live published theme. The unpublished preview (193020428602) already had several of its fixes, so each point was re-measured on the preview at 1440x1000, 1280x800, 1024x768, 390x844 and 320x568 (before/).

| Codex point | On the preview | Decision |
| --- | --- | --- |
| Websites text over a bright laptop at 1024 and 1280 | Fixed in the inspection pass: the laptop shows the Tool Box site and the copy sits on the dark side | No change |
| Empty laptop, wallpaper on the phone | Preview shows the Tool Box homepage and the Yavi Barber rewards card | No change |
| Closing section without phone gutters | Preview has 20 px gutters and a nowrap phone number | No change |
| Phone hero buried under imagery | Fixed in the inspection pass; buttons now inside the first screen at 390x844 and 320x568 | No change |
| Phone service panels open on decoration (Websites anchor showed a lamp) | Still true | Fixed: on phones each service is a framed 4:3 image of the device with the heading straight under it (also Home Websites). Page 6225 -> 5545 px at 390 |
| No quick way to reach the four services | Still true | Fixed: four text links under the opening |
| Generic business-tools chart | Still true | Fixed: the monitor shows the real NEVORA owner web screen (Velani-built); photo shifted so the copy stays on the dark wall |
| Online stores shows a payment terminal | Still true | Not changed: no real online-store screen exists in Velani's client work (Tool Box checkout is a third-party service; its own pages render as empty forms). Needs a real store project from Jose |
| Phone menu pushes the NEVORA demo on Custom development | Still true | Fixed: on Custom development the phone menu's main button is Start a project |
| Shorten every desktop panel and the closing brand panel | Design direction | Kept: full-screen panels and the closing panel are the approved site language |

Checks on the final build (all passed): unit 33, theme check, acceptance 77, browser 51, clipping 18 routes, layout 19, scroll 8, privacy 4; probe on Custom development and Home at 1440, 1024 and 390: 0 overlaps, 0 contrast failures, 0 axe violations.
Original monitor photo kept at docs/reference/night-ai-dash-generic.webp.
