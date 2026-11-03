# Three additions (2026-11-03): phone notification, laptop screen, footer wordmark

Jose's three ideas, built in code on the local preview (127.0.0.1:4173, Chromium at /opt/pw-browsers/chromium).

1. **Home NEVORA panel.** The phone rises 48px as the panel enters, then an iOS-style banner slides in: NEVORA · now · "Maria requested a shift swap with you". Maria is fictional like Alexandra; swap requests are a real feature. Still image under reduced motion and without JavaScript.
2. **Laptop screen.** `night-ai-laptop.webp` is now the blank Canva laptop (kept at `docs/reference/night-ai-laptop-blank.webp`) with an original fictional website ("Norte Barbería", designed and rendered in code at 1440×900) mapped onto the display by a perspective transform measured on the bezel edge. Used by the Websites panel on Home and on Custom development.
3. **Footer.** The VELANI wordmark, full width, cut by the bottom edge, with the hero light behind it at 28% opacity under a vertical mask.

| Suite | Result |
| --- | --- |
| `npm test` | 33/33 |
| `npm run check:theme` | clean |
| acceptance | 77/77 |
| clipping (320px, 200% zoom) | 18/18 |
| layout-audit | 19/19 |
| scroll-stability | 8/8 |
| privacy | 4/4 |
| browser | 51/51 (`../three-browser-20261103`) |

Captures in `captures/`: NEVORA panel with the notification (desktop and phone), the laptop panel on Home and on Custom development, the footer.

Theme files changed: assets/velani.css de53378561bde007831fe7ae49cf34fc, assets/night-ai-laptop.webp f1c8a69ef3ae4c59a6e03458956f4744, sections/velani-home.liquid b55678dcb55e1b1ecc3eb41dab302b84, layout/theme.liquid 53ba41f93970a521cceb46dec0460a32.
