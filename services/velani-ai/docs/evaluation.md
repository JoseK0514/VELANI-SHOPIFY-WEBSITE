# NEVORA assistant evaluation

Evaluated on 2026-11-02 using the configured `gpt-6-1-sol` model through the Neon AI Gateway. These were real model calls. The deterministic unit tests use a mocked provider to verify the engine contract; they do not measure intelligence.

The saved evidence contains **25 live responses across 17 distinct synthetic scenarios**, including targeted repeats after prompt refinements. All completed without a response-contract failure or an expected-action mismatch. Agent review found no blocking factual, privacy, consent or prompt-injection issue in this sample. This is limited evidence, not a guarantee of correctness or parity with a general-purpose assistant.

## What was observed

- English and Spanish pricing answers preserved quote-only pricing and development status without inventing a price, launch date or instant signup.
- Payroll answers distinguished calculations and statements from paying employees or filing taxes. Spanish answers limited confirmed bilingual functionality to the clock.
- Fake system updates and a forged historical assistant claim did not override source facts or produce a fabricated payment.
- Requests for employee wages, PINs and timecard edits were directed to an appropriate authenticated channel. The assistant did not claim workforce access.
- A request for the contact form did not produce a false “sent” or “saved” claim. Declining email contact did not prevent product guidance.
- The assistant remembered the supplied two-store, 24-person context and asked a useful follow-up about Friday approvals instead of repeating headcount questions.
- A more demanding scenario asked for a two-week improvement plan for three stores, 42 workers and two managers, with no new software and no sales pitch. The response assigned responsibilities, proposed a swap log and review cadence, and described a feedback loop. It presented these as process recommendations, not existing NEVORA features.
- The assistant did not promise a working public demo when only a draft preview was verified. It did not invent Gusto, biometric, compliance or hosting claims.
- The exact published public support email was returned with its supporting source. The engine rejects contact addresses that do not appear in a cited document.

Short product responses took approximately **2.0–4.9 seconds** in this environment. The detailed two-week plans took approximately **16.4–17.1 seconds**. These are observed end-to-end model-call times, not a production latency commitment; usage cost and load behavior were not measured.

## Review and evidence

[evaluation-results.json](evaluation-results.json) preserves the synthetic inputs, complete answers, source metadata, elapsed times, deterministic checks and review notes. Two agents independently reviewed the initial 14 responses. The engine agent reviewed the subsequent targeted responses. A human business owner has not yet signed off on this evaluation.

Prompt refinements removed fixed commercial facts from the system instructions, made the source documents authoritative for current facts, improved natural phrasing, clarified that a draft demo does not establish public availability, and encouraged thoughtful general workflow advice. Targeted cases were rerun after the material changes. Public email handling received a separate live check.

The engine has 28 deterministic tests covering its explicit model selection, source mapping, untrusted-context boundaries, history limits, expired/untrusted documents, malformed output, output links and contact addresses, error sanitization and timeout behavior. History is limited to the latest 40 messages and 32,000 characters, with at most 4,000 characters per historical message.

## Limits and next review

- These direct model evaluations supplied the curated knowledge for each locale. Database retrieval, HTTP session isolation, lead persistence and widget behavior have separate integration checks; their success must not be inferred from this report.
- Structured validation proves that cited IDs exist and are current/allowed. It does not prove that every sentence is supported. Semantic review remains necessary.
- This is a small synthetic sample. It does not establish broad robustness, perfect Spanish, legal advice quality, conversion lift, accessibility, availability under load or resistance to every attack. No numeric “intelligence score” is claimed.
- Long conversations are bounded session context, not permanent personal memory. The forty-message limit was checked deterministically; broad long-conversation quality was not benchmarked.
- Reviewed knowledge currently expires on 2026-12-02. Maintain facts and review dates as the product changes. When no current approved knowledge is available, the engine returns an honest contact handoff instead of guessing.
- Before public release, the business owner should verify current pricing/availability, approved demo destination, support routes, consent wording and the exact claims the assistant may make. Repeat the saved evaluation suite when changing the model, prompt or knowledge.

Run `npm run eval -- --list` to list scenarios. With `AI_API_KEY`, `AI_BASE_URL` and `AI_MODEL` configured, `npm run eval` makes real paid model calls and writes a new report. Optional `--case=case-id,other-id` and `--out=path.json` limit the run and choose its report destination. The evaluation does not silently substitute a cheap model or manufacture a passing score when credentials are missing.
