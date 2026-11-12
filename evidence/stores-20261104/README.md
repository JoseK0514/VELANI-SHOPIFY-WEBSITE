# Real store screen, project captions, location check, assistant wording, 2026-11-04

- Online stores now shows the Tool Box LLC online store (https://www.tool-boxpr.com, captured from the public site: rental equipment with prices and a Reserve button), straight in a framed window over a softened version of the old terminal photo. On right-side panels the window sits on the left.
- Each service carries a one-line caption naming the project and what Velani built (Tool Box website and store, Yavi Barber booking and rewards app, NEVORA).
- The Yavi phone screen is 22% brighter.
- Number of locations: blank, or a whole number from 1 to 9999; -1, 0, 2.5, words and 10000 get "Enter the number of locations, for example 2." (shared validator, new unit test).
- Website privacy and cookie notices describe the AI assistant as applying "when the assistant is turned on".

Neon findings for Jose (read-only): the NEVORA production database per the NEVORA docs is project "NEVORA" (rough-fire-63258908, 6-hour restore history). A second project "nevora-release1-production-20261101" (frosty-sun-66889369) keeps 7 days. Both hold manual snapshots and copy branches with no expiry (pre-development-promotion-main-backup-2026-09-29; release1-pre-final-9553e728-20261101 and its restore-probe branch; development, testing and preview branches). The backup sentence in the NEVORA policies stays unchanged until Jose sets an expiry rule for those copies.

Checks (all passed): unit 34, theme check, acceptance 77, browser 51, clipping 18 routes, layout 19, scroll 8, privacy 4; probe on Custom development at 1440 and 390 clean.
