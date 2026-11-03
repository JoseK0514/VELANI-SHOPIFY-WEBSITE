# NEVORA guide design plan

Audience: owners and operations managers of businesses with shift-based teams. One job: describe an operational problem, inspect the relevant NEVORA workflow, and leave with an editable plan.

Palette: midnight `#142a30`, ink `#1b2a28`, teal `#0f6e66`, mist `#edf3f1`, paper `#ffffff`, line `#d3dfda`. These extend the inspected product clock's visual language rather than adding an unrelated AI aesthetic.

Type: Manrope for deliberate display and interface headings; Source Sans 3 for longer explanations. Locally served font files keep the page independent of a font CDN at runtime. System fallbacks remain readable.

Layout: a calm full-width masthead, an oversized introduction, then a single split workspace. The left side collects the business context and holds conversation. The larger right side shows a four-stage workflow and an editable plan. On mobile the input precedes the result, with accessible horizontal stage tabs.

```
VELANI                                      Product · EN / ES
Bring your week into focus.          What this guide creates
----------------------------------------------------------------
Describe your team         |  Schedule → Time → Approval → Payroll
Sample prompts            |  Selected workflow explanation
Create my plan            |  Genuine clock image where relevant
--------------------------|-------------------------------------
Conversation              |  Generated plan + editable next steps
                          |  Download · Print · Share with consent
```

Signature: the four-stage workflow acts as the spine of the experience. An active stage expands into a factual explanation and a business-specific suggestion, making the distinction visible. No fake admin dashboard or animated thinking theater.

Critique before build: a generic chatbot card would hide the useful output. The design therefore gives the workflow and plan most of the space, keeps sources adjacent, and places export beside the plan. The genuine PIN screenshot is a clearly labeled product preview, not a live employee clock.

Interaction quality: keyboard-operable tabs, visible focus, readable failure states with manual same-ID retries, reduced-motion support, no email gate on downloads, explicit confirmation for business-memory updates, and independent consent for sharing a plan.

## Asset provenance

- `public/assets/nevora-clock.webp`: inspected genuine `night-k-pin.webp` product preview from the earlier public-site audit; source `https://www.thevelani.com/cdn/shop/t/11/assets/night-k-pin.webp?v=147086403733253853221793657916`. Shown as a sample product preview, never an active time clock.
- Manrope variable font: `https://github.com/google/fonts/tree/main/ofl/manrope`.
- Source Sans 3 variable font: `https://github.com/google/fonts/tree/main/ofl/sourcesans3`.
- Both fonts use the SIL Open Font License. The source attribution and complete license texts are included in `public/assets/fonts-LICENSE.txt`.

Fonts are locally subset to Latin/Spanish plus punctuation and arrows, then compressed as WOFF2. The Source Sans 3 derivative is renamed Velani Text to respect the upstream reserved font name. Both font files total about 48 KB.

## Frontend verification

Chromium tests with an intercepted API verified plan generation, explicit profile saves, editable actions and notes, escaped Markdown downloads, saving before sharing, two unchecked consent controls, correct shared-plan revision, current-plan chat context, English/Spanish interface switching, same-ID retry after a provider failure, deletion and empty browser storage. The workflow also passed at 390px and 320px without horizontal document overflow. Session-expiry tests verified that a fresh conversation does not carry an old plan ID or profile revision. Saved-profile tests verified that an unchanged old brief is replaced for regeneration while independently edited briefs are preserved.

The genuine product preview and both responsive layouts were visually inspected. These browser tests validate client behavior with controlled responses; live model/database tests are separate.
