# Five-issue verification — November 13, 2026

This supplements the [source delivery](2026-11-12-scrum174169156147146-followup.md)
for SCRUM-174, 169, 156, 147 and 146. Jose explicitly selected the existing
NEVORA finisher to retain integration and hosted-test ownership; this chat
verifies completion and owns the separate website policy work. The results
below are bound to their stated sources and do not close unrelated gates.

## Website development and hosted preview

Website application source is development
`4dde3c8f476b68e8ecbf345ee6308dedee1a6e08`, preserving the SCRUM-156 policy
delivery `5d2e5455f2727a2242c271394aff3ac5e98b1b01` and the later Relay,
no-JavaScript navigation and Rondo recovery fixes. It was freshly built in a
clean detached worktree; all 100 tests passed and theme checking reported no
findings. The client-hub backend's unchanged source separately passed types,
build and all 261 tests in 27 files against owned PostgreSQL 17/vector; its
database cluster was stopped afterward.

The owned unpublished Shopify theme is **193401127226**, named
**Velani SCRUM-156 dev 4dde3c8 (preview)**. It was duplicated once from existing
unpublished theme 193374224698. The live MAIN theme 193311572282 was not changed.
The [preview](https://www.thevelani.com/?preview_theme_id=193401127226&view=velani-es-nevora-privacy)
uses alternate theme views, not globally published Shopify Pages.

All 208 required theme files were read back. There are 117 byte matches and 91
parsed JSON matches: Shopify adds its generated header/formatting and, in 90
templates, only the empty per-section settings defaults omitted by the
generator. No arbitrary fields were ignored. The six text files changed by
the later website commits match their new source bytes; the other 202 required
remote checksums retain their verified identities. The duplicate's 38 unused
files and all 231 files in its original source theme remain unchanged. Preview
inquiry delivery and client-hub submissions are false; both assistant and
commerce API URLs are blank. The theme is unpublished and processing is false.

The final hosted browser run passed **20/20** cells: all five Spanish legal
pages at 390 and 1440 pixels in Chromium and WebKit. Each cell verified HTTP
200, the exact unpublished theme, Spanish content, single main/H1, internal
draft destinations, reciprocal English/Spanish navigation, no horizontal
overflow at normal/200% root text, and zero main-content WCAG A/AA axe findings.
Final page-error and assertion-error lists are empty. Physical devices, native
browser zoom and screen-reader use were not tested. All non-GET/HEAD browser
requests were intercepted and aborted; Shopify attempted analytics writes,
but no inquiry, payment, message or AI request was delivered by this test.

Retained failure/control evidence matters: the initial direct Node HTTP probe
could not reach the preview although actual browsers could; it was replaced
with actual browser navigation. Blocking service workers injected two Shopify
opaque-frame errors; the same-source allow control had none. One earlier run
stopped at WebKit's host-library precheck; all actual libraries subsequently
passed dlopen/ldd, and the documented Playwright precheck override was used.
Two later runs passed all 20 functional cells but emitted three generic WebKit
Load failed errors. The diagnostic run located them at rapid language
navigation alongside cancelled Shopify script loads. The final control waits
for each document's load event before moving/closing pages, retaining all
timeouts and assertions; it passed with zero page errors. Earlier failures
remain retained and are not relabeled passes.

Current public GETs still return 404 for all five canonical Spanish routes;
the English canonical routes return 200 from the unchanged live MAIN theme.
Unpublished acceptance does not establish public Spanish Page availability,
business/legal approval or publication. No global Page, menu, store policy,
store setting, theme publication or real inquiry was changed.

## NEVORA local policy qualification

Policy source `a8de13a9a65cdcc8d920645fbb38f3acc483fd7b` and its source-bound
guide rebuild `289e3f58dfe2070fcad6c862824df52acf33baa3` are local, based on
development `f6baaaa6d988f34fb1c3388d0e1fe4c410bcbfd5`. The exact app patch is
already supplied in the original delivery; the finisher must integrate it
before freezing and regenerate guides for its combined source.

The full root suite passed: **856 files passed / 33 skipped; 12,766 tests
passed / 895 skipped** (reported total 13,716; the remaining 55 are not counted
as passes). The build passed with sourceClean/sourceUnchanged true, 16,193
source hashes and 5,002 output hashes. Source identity and hashes were checked
again after the suite. Full lint had zero errors and one existing warning.
Release engineering passed 246 tests. All six rebuilt guides were verified
and 19 pages checked for text bounds; the operations sample was visually read.

The first broad run is retained: stale manuals were actually regenerated;
the restrictive 077 umask made a public-directory fixture fail; PID 1 in this
workspace does not reap descendant zombies; a parallel-load native CLI check
also hit its unchanged five-second deadline, with that original timing cause
unproven. A test-only Linux subreaper and ordinary umask 022 restored the normal
init environment without changing production behavior, assertions or limits.
The controlled worker suites passed 37/37. The complete qualified run used
one Vitest worker and reaped 211 orphan children. The wrapper is retained.
These are local policy-source results, not the finisher's final combined CI.

## Provider readback and remaining integration gates

Read-only Stripe inspection confirmed the original two metadata-only events
and original cancelled sandbox subscriptions retain their customer bindings,
provider trial dates and Tax=false. These observations do not verify paid
lifecycle or NEVORA's 30-day trial. Velani projects continue to use separately
reviewed Dashboard/Hosted Invoice Page contracts; no invoice, subscription,
charge, Tax registration or provider mutation was made here.

The original workforce recovery message and requested historical copy remain
provider-delivered. Original support-inbox placement and human acknowledgement
are not established. No mail was sent. Read-only Render metadata showed the
dedicated host suspended with auto-deploy off. This chat did not start or
consume the finisher's held finite hosted packet or alter a quota, enrollment,
original marker, job or lease.

The sole finisher, chat `01a1d175-7de0-7a80-b607-5418fde6ed50`, owns the Cloud
authority/account patch, durable billing retries, transactional trial expiry,
normal provisioned-Owner lifecycle, source/artifact qualification, development
integration and the authorized hosted worker/queue/monitor packet. Candidate
and actual-development CI, protected contexts, exact-source artifacts and
bounded hosted evidence must be verified on its final combined SHA. Earlier
local or source-32 passes do not substitute for those checks. Main/production,
independent finding closure, real Tax decisions and human response remain
outside this chat's source/preview acceptance.

Evidence is in [scrum-five-verification-20261113](scrum-five-verification-20261113/).
No complete five-issue release claim is made while these gates remain open.
