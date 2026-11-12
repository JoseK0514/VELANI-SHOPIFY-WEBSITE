# Hero conversation (2026-11-03)

Jose asked for a mini chat on the Home hero that shows the assistant handling a sick call. The four-card sequence was replaced by a conversation card:

- Header: N icon · "Faro · NEVORA assistant" · amber "In development" (the same status language the NEVORA page uses). Faro is a provisional name.
- Owner: "Carlos just called out sick for tonight."
- Assistant (after typing dots): "I know. Carlos marked himself out at 7:42. Maria is free and under 40 hours this week, and she said yes at 7:58. It only needs your approval."
- Owner: "Approve it."
- Assistant: "Done. Maria covers 2 to 8 pm. Timecards are updated for Friday's payroll."

Plays once over eight seconds with CSS keyframes (`.hchat`, `.msg` in `base.css`; markup in `home.body.html`). Typing dots are a pseudo-element on the assistant bubble while its text is still transparent. Reduced motion and no-JS show the whole conversation at once. On phones the card sits above the headline; on phones shorter than 600px it is hidden.

| Suite | Result |
| --- | --- |
| `npm test` | 33/33 |
| `npm run check:theme` | clean |
| acceptance | 77/77 |
| clipping | 18/18 |
| layout-audit | 19/19 |
| scroll-stability | 8/8 |
| privacy | 4/4 |
| browser | 51/51 (`../chat-browser-20261103`) |

Captures in `captures/`: desktop and phone at 2.6 s (typing) and at the end.
