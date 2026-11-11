# Velani round 9 (2026-11-10)

- start: worktree scratchpad/hero at 919dbbd; no prior round-9 commits.
- A1–A3 done locally: success panel names Jose + "See how NEVORA works" filled + quiet Home link (trial topic only; other topics keep Back to home pill); header slot closed on request page; Plans join = Home join on #f2f6f5. Tests 55/55, check:theme clean.
- Part A uploaded to 193311572282: 6/6 checksums match (velani.css, velani.js, contact, es-contacto, help, es-ayuda). Hosted preview-mode success checked.
- Part B built locally: shared light system for every page outside Home/NEVORA (`main:not(:has(.sig))`), light header on every page starting with `.phero` or `.contact-split`; Custom software rewritten as two stories (needed / decided / delivered) + plain how-it-works, one action; About restyled (one hero action); Help/Sign in on pale ground with white cards, request-type control and hidden Urgency field fixed; Legal index as plain rows without labels; policy docs without 01–05 numbering (CSS) or uppercase labels; billing pages hide the empty card; verify page join; 404 actions with arrows; Products rebuilt as a light page of three equal cards (old dark panels said Rondo was in development).
- Fixes found by checks: Company menu overflowed the window on the request page once the header slot was closed (menu now opens from its right edge there); summary named both wordings of the message label on Help; three 360px headlines wrapped to 3 lines.
- Checks: npm test 57/57; check:theme clean; axe WCAG 2.2 AA 0 violations in 160 runs (32 pages x 5 widths, reduced motion), no sideways scroll, headings <= 2 lines; Help form by keyboard EN 1440 / ES 390 (preview mode).
- Uploaded to 193311572282 (UNPUBLISHED) in three batches; every uploaded file's checksumMd5 matches the build: velani.css, velani.js, sections contact, es-contacto, help, es-ayuda, about, es-nosotros, custom-development, es-a-la-medida, products, es-productos, legal, not-found. settings_data.json untouched. Nothing published.
- Fix round after looking at hosted slices: on Support the success panel was off-screen (page scrolled to top) and the hidden NEVORA action showed; both fixed (2761933). Summary no longer ends "?.".
- Hosted evidence: evidence/signature-hero-20261110/r9-* (177 files): slices at 1440 and 390 for custom, about, help, sign-in (EN+ES), plans, trial, nevora-support, legal, privacy, nevora-privacy, products (EN+ES), billing, verify, 404, home; r9-trial-*-success, r9-helpform-*-error/success, r9-plans-join-*.
- Commits: 01fac61 (9A), 88e5b0a (9B), 2761933 (fixes); pushed to origin claude/velani-signature-hero-20261110.

## Still short / not done
- Policy numbering 01–05 is hidden with CSS, not removed from markup (policy sections were not re-uploaded). Policy text still names Puerto Rico and the San Juan address: policy wording was not changed, by instruction.
- The Yavi Barber screenshot shows the shop's own address line (Aguadilla). It is the client's real screen, not site copy.
- Plans and every other ending now use Home's join exactly; Home's join passes through a neutral dark midtone, so "no grey midtone" depends on accepting Home's.
- Dark-header focus ring is still the pale blue #bbd8ff (visible, 2px); light header ring is teal.
- Hero image on Custom/About/verify is the same steel-teal glow as Plans, less vivid than Home's.
- About's Yavi image sits in a pale box while the other two are framed screens. Billing page repeats the email address under the email button (existing copy).
- Spanish pages for sign-in, verify, billing were checked by axe/overflow only, not by eye. About half of the 177 hosted slices were looked at. Not run: WebKit/Safari, a real phone, a screen reader. The live form was never submitted.
- Old root scratch scripts (*.mjs, staged*.json) in the worktree are untracked leftovers from earlier rounds.

## For Codex
- Products page no longer says Rondo is "in development"; it says Rondo, the assistant for the Owner, is available. Confirm that is true in production.
- The client request form (Help) and trial request keep the same field names, topics (client-work, client-help, nevora-demo) and preview/live switch; only velani.js presentation changed (success scroll, summary text, hidden second wording). Confirm the live contact form still posts after publish.
- Products anchors kept: #nevora, #relay, #websites, #apps. Custom software dropped the in-page jump row; #web-applications, #online-stores, #booking, #business-systems, #how still exist.

## Round 10
- Items 3–5 + focus ring: support line now "If NEVORA is down and your team can’t clock in, email us." (ES equivalent) wherever the support block uses it; header button is the trial on every page (Custom software too, outline); About ends on the trial only with the quiet custom-software line; dark header focus ring is paper white.
- Items 1–2: Custom software, About and the setup pages now use Home’s first-screen image, filter and shade. One shared join rule for every page (Home, NEVORA, Plans, Custom, About, setup): the dark side carries teal to the edge and brightens into white or #F2F6F5; the old per-page joins and Home’s .hmorn layer are retired. Phones: dark first screens keep 150px under the action; the copy scrim is off there as on Home.
- Checks: npm test 57/57, check:theme clean, axe 0 violations in 100 runs (20 pages x 5 widths), no sideways scroll, headings <= 2 lines.
- Round 10 fixes after looking at hosted shots: the copy scrim's edge showed against the new join (scrim off on these first screens); ending join is 150px on phones so it stays clear of the text; NEVORA's ending join now starts from its pale ground.
- Round 10 upload to 193311572282 (UNPUBLISHED): velani.css, velani-home.css, velani-nevora.css, velani.js, layout/theme.liquid (hero preload only), header snippets EN/ES, sections about, es-nosotros, custom-development, es-a-la-medida, help, es-ayuda, nevora-verify, es-configurar, nevora-start, es-prueba; checksums match the build.
- Hosted evidence: evidence/signature-hero-20261110/r10-<page>-<width>-01 (first screen), -02 (first-screen join), -03 (ending join) at 1440 and 390 for home, nevora, plans, custom (EN+ES), about (EN+ES), verify, help.
- Round 10 still short: the join is a visible soft teal glow about 300px tall (200 on phones), not an invisible seam; the pale end shows a faint step on a 1x capture, not checked on an 8-bit panel by eye. Plans keeps its darker first-screen shade (as approved) while Custom/About/setup use Home's lighter shade. Sign in has no "can't work" line, so the new support sentence appears on Help only (and wherever the support call block uses that wording). The quiet ending line is on Home and About only. Looked at about half of the 48 r10 shots plus local captures; no WebKit, real phone or screen reader.
