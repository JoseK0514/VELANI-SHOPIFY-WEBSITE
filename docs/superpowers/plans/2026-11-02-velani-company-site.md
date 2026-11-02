# The Velani company site implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Build the selected navy-and-white company website as a tested preview and an unpublished Shopify theme.
**Architecture:** One content/render source generates local full-route HTML and native Shopify sections/JSON templates. Shared CSS, licensed fonts and browser interactions are packaged into the theme. Inquiry delivery remains disabled in preview; shared Shopify policies/pages/menus/settings are not mutated.
**Tech Stack:** Node 24, plain HTML/CSS/ES modules, Liquid/JSON theme outputs, Shopify Admin GraphQL, official Phosphor assets, DM Sans, Playwright and axe.
**Spec:** ../specs/DESIGN-BRIEF.md; approved visual ../../reference/approved-homepage.png; company facts ../../reference/nevora-company-facts.md.

## Global constraints
- NEVORA is In development; no signup, billing, production/native/AI completion claims.
- Preserve NEVORA, the MAIN theme, older drafts, originals and failed evidence.
- No real inquiry, notification, optional analytics integration, publication, password/DNS/store-policy changes.
- Customer Privacy API choices only follow visitor action. No direct Shopify cookie manipulation.
- Public company identity/contact: VELANI LLC, support@thevelani.com, 1654 Calle Tulipan, Suite 100, San Juan, PR 00927.
- Website notices describe website processing. Do not reuse workforce retention/backup claims.
- A draft theme/fixture render is not certification of hosted Shopify behavior.

## Review focus
- Preview form must never deliver mail, even on repeat clicks, unavailable JS or network uncertainty.
- Arbitrary URL/query values and long/unicode input must not become HTML, script or permanent storage.
- Privacy API absence/failure must preserve honest choices and block optional integrations.
- Keyboard/mobile menu/dialog behavior and consent focus must work at narrow sizes.
- Every legal/contact/footer destination must resolve without leaked legacy store copy or false availability.

## File map
src/content.mjs: canonical company/page copy and routes.
src/render.mjs: semantic reusable header/footer/page rendering and target asset adapter.
src/inquiry.mjs: inquiry validation and safe preview submission state.
src/privacy.mjs: supported Shopify consent adapter and local non-delivery preview behavior.
public/assets/velani.css: approved tokens, layout, responsive and state styling.
public/assets/velani.js: menu, forms and consent interaction wiring.
scripts/build.mjs: deterministic preview/theme compilation and manifests.
scripts/serve.mjs: read-only local preview server, real 404 and safe preview POST rejection.
scripts/check-theme.mjs: parse/validate actual Liquid and template outputs.
scripts/browser-check.mjs: real browser flows, screenshots, links, runtime and accessibility checks.
scripts/package-theme.mjs: importable theme ZIP and checksums.
tests/: meaningful validation, rendering/safety and request/consent behavior.

## Task 1: Working route and theme foundation
Consumes canonical route/content inputs; produces renderPage(route,{target}) and deterministic preview/theme outputs.
- [ ] Write route/render safety tests: required pages, safe strings/assets, honest product status, no live preview action, actual missing-route result.
- [ ] Run and preserve RED result for missing foundation.
- [ ] Implement content/render/build/server, licensed assets and approved home composition.
- [ ] Run node tests and actual build; compare results; commit.

## Task 2: Inquiry, navigation and cookie choices
Interfaces: validateInquiry(fields) → {valid,errors,values}; createInquiryController({mode,onState}) → {submit,reset,state}; createPrivacyAdapter(window) → {read,save}.
- [ ] Test validation, unicode/limits, duplicate preview submit, rejected/uncertain transport, no automatic retry and absent/failing privacy API.
- [ ] Observe RED before implementing the behavior.
- [ ] Implement shared behavior with no localStorage of personal form content and no real preview transport.
- [ ] Verify focused unit suite, rendered forms and full suite; commit.

## Task 3: Complete content, policies and responsive quality
Consumes shared page/rendering/behavior modules. Produces all company, service detail, contact, FAQ, legal and fallback pages.
- [ ] Finish factual copy and reading templates with appropriate preview-policy scope.
- [ ] Theme parse/template checks, full-route/link/metadata checks and full test suite.
- [ ] Run actual Chromium/WebKit/Firefox where available: 390/969/1440, keyboard, menu, valid/invalid/uncertain form, consent dialog, reduced motion, overflow, axe.
- [ ] Inspect reference vs real screenshots, fix material defects in a batch, confirm and commit.

## Task 4: Preserve, stage and hand over
Consumes validated theme bundle. Produces source/evidence archive, immutable baseline and exact Shopify draft receipt if accepted.
- [ ] Export original theme files/data and resource metadata before store mutation.
- [ ] Discover/validate actual GraphQL types; duplicate/create UNPUBLISHED theme and verify exact role before writes.
- [ ] Upload assets/sections/templates only to that exact draft; verify accepted file operations.
- [ ] Do not publish pages to make preview routes work. Preserve full local route preview when Shopify resource access limits hosted acceptance.
- [ ] One fresh-context whole-branch review; remedy Important/Critical findings with observed regressions; retain originals.
- [ ] Final local build, theme ZIP/hash/import checks and scoped acceptance; record branch/HEAD, draft ID, preview limitations and launch conditions.

