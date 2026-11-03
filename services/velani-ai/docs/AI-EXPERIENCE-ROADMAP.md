# Proposed AI experience roadmap for Velani and NEVORA

Status: recommendations following a read-only review. These capabilities have not been implemented by this document. The existing development assistant remains a product-advice and explicit-enquiry service.

## What the current evidence establishes

The first version used one configured model, GPT-6.1, for 25 real responses across 17 distinct synthetic scenarios. Agent review found useful responses and no blocking issues in that sample. The 62 automated tests cover software behavior, not general intelligence. There has been no comparative model benchmark, broad long-conversation study, production conversion experiment or human business-owner acceptance test.

Neon remains an appropriate database and available model gateway. Changing the database is unlikely to make the assistant reason better. Better model selection, verified knowledge, contextual memory, useful tools and ongoing evaluation are the important next improvements.

## Intelligence upgrades

1. Compare several available frontier models and supported reasoning settings against the same realistic Velani scenarios. Include approximately 100 questions and multi-turn conversations, a held-out set, repeat trials for variable answers, and blind human review. Measure factual accuracy, usefulness, constraint handling, correction handling, Spanish, appropriate handoffs, latency and cost. Keep the current model as a baseline rather than assuming it wins.
2. Expand the approved knowledge from the current 12 articles to a maintained feature/status catalog, implementation guides, authentic screenshots, supported integrations, limitations and commercial policies. Track evidence and review dates. Add semantic retrieval and reranking when the corpus needs them; an embedding index alone does not create knowledge.
3. Give the assistant narrowly defined tools: generate a workflow plan, render a diagram, open a verified tour step, and calculate a scenario from explicit assumptions. Use code for arithmetic and hard constraints. A second model pass can review difficult answers selectively. Adding agents to every response is not a quality guarantee.
4. Maintain explicit conversation facts and a rolling summary: team size, locations, tools, main problem, constraints and corrected details. Preserve provenance and let users correct the summary. Current memory is a bounded 40-message window; optional cross-session memory needs its own disclosed design.
5. Review real failures and user feedback under the site's data policy, turn important misses into regression scenarios, and review proposed knowledge changes before publishing them. Track task completion and helpfulness as well as conversion; avoid optimizing the assistant only to request contact details.

## Recommended signature website experience

**Show NEVORA for my business**

Place an interactive area early on the homepage, alongside stable product information and genuine interface examples. The visitor can choose a sample business or describe their own situation without registering.

Example: “We run three cafés with 42 people. Shift swaps and Friday time approvals are messy.”

1. Extract a small, editable business summary and ask only the most useful missing question.
2. Show the relevant, verified scheduling → time capture → approval → payroll-calculation workflow.
3. Let the visitor ask questions while the guide selects approved screenshots or implemented demo steps. Keep navigation under visitor control.
4. Generate a one-page workflow plan: their problem, suggested process, relevant documented capabilities, uncertainties, and practical evaluation steps.
5. Offer a download first. Separately offer to share the reviewed plan with Velani through the existing consented enquiry flow.

Use a large visual workspace with a compact conversation panel. Reveal truthful progress and useful intermediate results; do not claim invisible analysis has happened. Support mobile and keyboard use, and keep a readable homepage available without starting the AI interaction.

A possible section line: “Describe your team. Explore a clearer way to run the week.” This is proposed copy, not a claim of current availability.

## Additional surfaces

| Surface | Proposed AI capability | Concrete output | Requirements |
| --- | --- | --- | --- |
| Public experimental demo | Scenario Studio: change a fictional shift constraint or call-out and inspect options | Proposed changes, reasons, checked constraints and honest infeasibility | A real deterministic constraint checker and a clear experimental label; this is not an existing verified NEVORA feature |
| Custom-development page | Project brief builder | Workflow diagram, scope priorities, integration questions and phased approach | Reviewable assumptions; no invented binding quote or delivery promise |
| Authenticated NEVORA manager workspace | Time-review assistant, then scheduling copilot | Linked missing clock-outs/corrections; later a draft schedule with before/after changes | Real permission-scoped APIs, deterministic validation, audit history and manager approval |
| Authenticated onboarding | Spreadsheet or document import assistant | Structured draft, field mapping and highlighted uncertainty | Appropriate private-data handling; validate before committing; no employee records through the public bot |
| Product help | Context-aware bilingual guide; optional voice | Guidance tied to the permitted current screen and documented tasks | Explicit screen context, opt-in microphone access, visible recording state and accessible text alternative |
| Internal operations | Enquiry briefs and knowledge-gap review | Source-linked lead summary, unanswered topics and draft content updates | Authorized access and human review; notification or outreach requires an explicitly configured workflow |

For workforce assistance, show verifiable exceptions rather than accusations about employees. Do not infer employee quality or make autonomous disciplinary, pay-reduction or employment decisions. These are distinct from the public website's product-advice purpose.

## Build sequence

**First:** compare models, improve approved knowledge, and define a quality baseline. Keep the public assistant isolated from workforce data.

**Next:** add the homepage's guided business preview and downloadable workflow plan. These create a visible result using established facts and the existing backend.

**Then:** build a clearly labeled fictional Scenario Studio if it passes constraint and usability tests; add one authenticated time-review feature to the actual product. Treat public demonstration and production product integration as separate deliverables.

**Later:** extend to scheduling drafts, verified imports and optional voice based on observed demand and measurable usefulness.

Success should be demonstrated by completed tasks, useful plan downloads, qualified enquiries, factual accuracy, response latency and repeat usage. Measure changes against the current experience before publishing performance claims. A credible explanation of the AI's sources, limits and approval controls can accompany working examples; avoid unsupported “most advanced” or “fully autonomous” claims.
