# Real work on the devices, and the hero's morning (2026-11-03)

Jose asked for real client work on the phone and the laptop, and for "something that comes up" on the hero.

- **Phone (Booking and loyalty panel, Custom development).** `night-ai-phone.webp` now shows the Yavi Barber rewards card from the barber loyalty app Velani built (`/home/user/barbershop`, evidence capture `docs/admin-mobile-v2/evidence/app-redesign-implementation/public-rewards-390-webkit.png`, no personal data: 10 visits, 2 rewards). Mapped onto the phone photo with a perspective transform, rounded corners, and the dynamic island kept. Blank original kept at `docs/reference/night-ai-phone-blank.webp`.
- **Laptop (Websites panel, Home and Custom development).** `night-ai-laptop.webp` now shows the Tool Box LLC equipment-rental homepage (`/home/user/tool-box-pr/index.html`, served locally with outside requests blocked; the Booqable equipment list and date picker, which load from the live API, were hidden for the capture). The earlier fictional barbershop composite is kept at `docs/reference/night-ai-laptop-site.webp`.
- **Home Custom apps panel.** The phone frame (`night-booking.webp`) now shows the same Yavi rewards screen instead of the fictional booking mock (kept at `docs/reference/night-booking-fictional.webp`).
- **Home hero.** Four messages arrive one by one over five seconds: three morning problems (a sick call, "who covers 2 to 8?", payroll on paper) and NEVORA's answer (swap approved, Maria covers, timecards ready). CSS keyframes only; still under reduced motion and without JavaScript; hidden on phones shorter than 600px.
- Footer note now also credits "websites and apps Velani built for its clients".

| Suite | Result |
| --- | --- |
| `npm test` | 33/33 |
| `npm run check:theme` | clean |
| acceptance | 77/77 |
| clipping (320px, 200% zoom) | 18/18 |
| layout-audit | 19/19 |
| scroll-stability | 8/8 |
| privacy | 4/4 |
| browser | 51/51 (`../clients-browser-20261103`) |

Captures in `captures/` (hero on desktop and phone after the sequence, Websites and Custom apps panels on Home, Websites and Booking panels on Custom development, plus the two composited assets at full size).

Open: Jose confirms with Yavi Barber and Tool Box LLC that their work may appear on thevelani.com.

Theme files changed: assets/velani.css 0b62d0e39a52b253a768a31dd4cacb14, sections/velani-home.liquid 1dea9df815adfd78fddae3fb042f37f2, layout/theme.liquid 9807b75106b9d64437e1e09ed4dd3fc7, assets/night-ai-phone.webp 0c10f2d24eea9904c8f93d58ad1ee890, assets/night-ai-laptop.webp d8ecd52d803b002b7effc79721a9a435, assets/night-booking.webp 47bebb79d901531726fdee3f8432b626.
