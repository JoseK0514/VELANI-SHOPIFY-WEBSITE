# Premium and accessibility review: NEVORA signup, trial and billing UI

Date: 2026-11-08. Reviewer: Claude. Scope:
- **Velani:** Plans (marketing and Owner view), Start trial, Set up your workplace, Plan and billing, and Confirming payment, in English and Spanish where the page exists.
- **NEVORA app recovery pages:** billing (all states), the employer message, and the paused tablet.

All tests used the local fake billing API, fictional businesses and the unpublished preview theme 193180827962.

## Method

- **Lenses:**
  - Visual, layout and interaction: premium-ui-layout, premium-ui-typography, premium-ui-interactions, law-of-continuity, make-interfaces-feel-better and high-end-visual-design.
  - Formal taste critique: tastemaker. Its knowledge-base files are not installed, so IDs are cited from its own tables.
  - Copy: stop-slop and better-writing rules.
- **Evidence:**
  - 48 screenshots: every page and state at 1440 and 390.
  - An automated deep accessibility walk: axe in every state, focus after each async change, live regions, 24px targets, and reflow at 640 (200% zoom) and 320.
  - A frame-by-frame check of the Owner handoff.
  - Type-size counts per page, and a scan of the copy strings for em dashes, passive voice and filler.
- **Attempted but produced nothing:** three parallel reviewer agents stalled without reporting.

## Fixed in this review (Velani `4008011`, `c450f7c`; NEVORA `56cb2091`, `1ea5511a`)

| # | Finding | Why it mattered | Fix |
|---|---|---|---|
| 1 | Owners arriving from NEVORA saw the marketing hero ("Try NEVORA free…") flash before their own plan | Undercuts trust at the moment an Owner arrives to pay | A boot class hides the hero copy before the first paint. Verified frame by frame in Chrome and Safari. |
| 2 | Each step swap re-read the whole card aloud *and* moved focus to the heading | Screen readers heard every step twice, plus all the card's rows | Cards are no longer live regions. Focus on the new heading announces the step, and one short status line announces progress changes. |
| 3 | NEVORA billing and Plans' Owner view changed with no announcement | Screen-reader users were never told the plan had loaded | Focus moves to the new heading once it can take it (one frame later, with one retry). |
| 4 | The trial date appeared three times on billing pages: band, sentence and row | Listing instead of editing (TS-010) | Rows carry dates. The sentence says "You aren't charged until it ends", and a healthy billing page leads with "Your free trial is running" or "Your plan is active". |
| 5 | Step changes jumped | Abrupt state changes read as unfinished (TS-004) | Cards and button rows rise in over 0.42 s, with none under reduced motion. |
| 6 | The "Send it again in 29 s" countdown resized every second | Its neighbour moved under the cursor | Tabular digits and a locked width. Verified as 0 px drift. |
| 7 | The phone number was the loudest element on payment and setup pages | The one-thing rule (TS-003): the task, not support, should lead | 20px on account pages; Contact keeps the large number. |
| 8 | Done and next progress markers were near-identical grey dots | Progress didn't read at a glance | Done steps show a check. |
| 9 | The price slider looked different per browser | Craft consistency (CR-403 family) | Custom track and handle, with a focus ring. |
| 10 | Owner view still showed "Your 30 days" and the header's Start free trial | Wrong audience | Both hidden in the Owner view. |
| 11 | Standalone links (NEVORA address, support email) were 20–22px tall | Small targets | 44px targets. |
| 12 | Passive or repeated copy: "Payments are handled by Stripe", "your hours can be added", "in line to be set up", "Owners aren't counted" twice | Stiff, machine-like phrasing | Active, edited wording in English and Spanish. |
| 13 | One Spanish title ran to 3 lines at 1024 | The 2-line heading rule | "Facturación no disponible." |

## Taste verdict (tastemaker)

**Reading this as:**
- **Plans:** an identity surface for small-business owners. Register: confident and calm. Stakes: medium. Ceiling: **Characterful**.
- **Signup, setup, billing and payment:** convention-governed, money-adjacent flows. Ceiling: **Coherent**. Distinctiveness there would be a lapse (TS-011).
- **NEVORA recovery pages:** Coherent, using the app's Direction B system.

**Craft score:**

| Dimension | Score |
|---|---|
| Spacing | ✓, on the site's existing scale |
| Type | ✓/~. Signup uses 3 sizes and billing 5. Plans has 8, but the extras come from the approved calendar plus the price figure; setup's 8 include the shared form field sizes. |
| Color | ✓. No axe contrast failures in any state, and one reserved accent. |
| Shadow | ✓. Flat cards on Velani; the approved Direction B elevation on NEVORA. |
| Alignment | ✓. One left edge with the logo, checked at every width. |
| Density | ✓ for the context. |

**Rung vs. ceiling:**
- **Plans reaches Characterful.** The team-size card turns "the price is your headcount" into an object you can use (TS-001 strength, worth protecting).
- **The flows reach their Coherent ceiling.** They have one voice and designed edge cases (TS-005): every link problem has a next step, and the payment page never claims success from a redirect.
- **The NEVORA pages are Coherent** and consistent with the 404 and policy pages.

**Grade:** **Tasteful** for their context.

**Protect:**
- the team-size card;
- the honest payment-return language;
- one primary action per state;
- the split layout shared with Contact and Sign in.

**The climb (not done, recommended next):**
1. On "Your workplace is ready", show a real NEVORA screen (Owner Today) beside the address and Owner ID, so the first thing a new owner sees is their own app. It is the one place in the flow that has earned a moment of delight.
2. On Plans, let the hero's "$19 / $29" line respond to the team-size card (set the card, see the hero's price), so the page has a single price story.
3. When Codex adds a language flag, build Spanish setup and payment-return pages, so Spanish signups finish in Spanish.

## Accessibility summary

- **axe:** 0 violations across 31 states, including contrast.
- **Reflow:** no sideways scroll at 200% zoom (640) or 320.
- **Focus:** lands on the new heading after every async step and on the field after an error. Errors use `role="alert"` and `aria-invalid` with `aria-describedby`.
- **Targets:** standalone controls are 44px or more. Links inside sentences are under 24px, which WCAG 2.5.8 exempts.
- **Not verified:** a real screen reader (VoiceOver/NVDA), and Windows High Contrast mode.

## Open items outside this review

- **Legal and retention wording:** the terms pages still say no checkout and deletion within 3 days. Jose's decision.
- **Codex follow-ups** (`docs/handoffs/2026-11-08-claude-to-codex-commerce-followups.md` in the NEVORA checkout):
  - the tablet return path;
  - a lang flag for Spanish emails;
  - a time zone in the status;
  - CORS for the site's domain.

This review assesses craft, taste and accessibility. It does not verify the live billing API, Stripe, email delivery, or that the pricing is right for the business. "Tasteful" is not "good to ship".
