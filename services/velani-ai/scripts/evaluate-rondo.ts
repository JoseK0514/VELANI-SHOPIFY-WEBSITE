import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import OpenAI from 'openai';
import { z } from 'zod';
import { ModelEngine, ModelError } from '../src/engine.js';
import type { Answer, KnowledgeDocument } from '../src/types.js';
import { SYSTEM_PROMPT } from '../src/prompts.js';
import { reserveEvaluationCost } from './evaluation-budget.js';

const caseSchema = z.object({
  id: z.string(), locale: z.enum(['en', 'es']), message: z.string(), reviewNotes: z.string(),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })).optional(),
  expectedAction: z.enum(['none', 'show_demo', 'lead_form', 'human_help']).optional(),
});
interface EvaluationResult extends z.infer<typeof caseSchema> {
  status: 'reserved' | 'received' | 'failed';
  semanticReview: 'pending';
  reservedUpperBoundUsd?: number;
  providerUsage?: { promptTokens: number; completionTokens: number; totalTokens: number } | null;
  answer?: Answer;
  actionCheck?: boolean | null;
  error?: string;
  latencyMs?: number;
}
const cases = z.array(caseSchema).parse(JSON.parse(await readFile(new URL('../knowledge/rondo-hard-evals.json', import.meta.url), 'utf8')));
const args = process.argv.slice(2);
if (!args.includes('--run')) {
  console.log(cases.map(test => `${test.id}: ${test.reviewNotes}`).join('\n'));
  console.log('No model calls. Use --run with an authorized development AI_API_KEY; maximum budget $3.');
} else {
  const budgetUsd = Number(args.find(arg => arg.startsWith('--budget-usd='))?.split('=')[1] ?? 3);
  if (!Number.isFinite(budgetUsd) || budgetUsd <= 0 || budgetUsd > 3) throw new Error('Budget must be greater than zero and at most $3.');
  const apiKey = process.env.AI_API_KEY;
  const baseURL = process.env.AI_BASE_URL;
  const model = process.env.AI_MODEL;
  if (!apiKey || !baseURL || !model || !['gpt-6-astra', 'gpt-6-1-sol'].includes(model)) {
    throw new Error('Use the authorized development gateway and explicitly select gpt-6-astra or gpt-6-1-sol.');
  }
  // This authorization is for this existing development gateway, whose prices we verify below.
  if (baseURL !== 'https://br-snowy-brook-bcc6b3zm-api.ai.c-16.us-east-1.aws.neon.tech/v1') {
    throw new Error('Use the authorized Velani development gateway; another host needs separate pricing and authorization.');
  }
  if (args.some(arg => arg.startsWith('--out='))) throw new Error('The authorized suite uses one fixed spend ledger; alternate output paths are not allowed.');
  const outputPath = resolve(fileURLToPath(new URL('../artifacts/rondo-hard-evaluation.json', import.meta.url)));
  await mkdir(dirname(outputPath), { recursive: true });
  const report = {
    startedAt: new Date().toISOString(), model, budgetUsd, reservedUpperBoundUsd: 0,
    pricingSource: 'https://neon.com/models.json', pricing: { inputPerMillion: 0, outputPerMillion: 0 },
    promptHash: createHash('sha256').update(SYSTEM_PROMPT).digest('hex'),
    scope: 'Direct model and real response validator with current locale knowledge; hosted CAPTCHA/database/widget require separate acceptance.',
    results: [] as EvaluationResult[],
    semanticVerdict: 'PENDING_REVIEW',
  };
  // Never overwrite a previous spend ledger. The owner must account for prior runs before a new one.
  await writeFile(outputPath, JSON.stringify(report, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  const persist = () => writeFile(outputPath, JSON.stringify(report, null, 2) + '\n', { mode: 0o600 });
  const catalogResponse = await fetch(report.pricingSource, { signal: AbortSignal.timeout(20_000) });
  if (!catalogResponse.ok) throw new Error('Could not verify current gateway pricing; no paid calls made.');
  const catalog = await catalogResponse.json() as { neon?: { models?: Record<string, { released?: boolean; cost?: { input: number; output: number; cache_write?: number; tiers?: Array<{ tier?: { type?: string; size?: number } }> } }> } };
  const entry = catalog.neon?.models?.[model];
  // This suite's small prompts are far below the published 272k context tier. Fail closed if base rates rise.
  if (!entry?.released || !entry.cost || entry.cost.input > 10 || entry.cost.output > 50 || (entry.cost.cache_write ?? 0) > 12.5
    || entry.cost.tiers?.some(tier => tier.tier?.type !== 'context' || !tier.tier.size || tier.tier.size < 200_000)) {
    throw new Error('Model pricing changed or is unavailable; review budget before spending.');
  }
  report.pricing = { inputPerMillion: Math.max(entry.cost.input, entry.cost.cache_write ?? 0), outputPerMillion: entry.cost.output };
  reserveEvaluationCost(0, 3000, report.pricing, 0, budgetUsd);
  const client = new OpenAI({ apiKey, baseURL, maxRetries: 0, timeout: 75_000 });
  let servedModels: string[];
  try { servedModels = (await client.models.list()).data.map(item => item.id); }
  catch { throw new Error('Gateway catalog check failed; no paid calls made.'); }
  if (!servedModels.includes(model)) throw new Error('Configured model is not served by this branch.');
  const knowledge = JSON.parse(await readFile(new URL('../knowledge/nevora.json', import.meta.url), 'utf8')) as KnowledgeDocument[];
  for (const test of cases) {
    const row: EvaluationResult = { ...test, status: 'reserved', semanticReview: 'pending' };
    const started = performance.now();
    const engine = new ModelEngine({ apiKey, model, baseURL, timeoutMs: 75_000, complete: async (request, signal) => {
      const inputBytes = Buffer.byteLength(JSON.stringify(request.messages));
      if (inputBytes + 1024 >= 200_000) throw new Error('Evaluation context exceeds reviewed price tier.');
      const reservation = reserveEvaluationCost(inputBytes, request.max_completion_tokens, report.pricing, report.reservedUpperBoundUsd, budgetUsd);
      report.reservedUpperBoundUsd = Math.round((report.reservedUpperBoundUsd + reservation) * 1_000_000) / 1_000_000;
      row.reservedUpperBoundUsd = reservation;
      report.results.push(row);
      await persist();
      const completion = await client.chat.completions.create(request, { signal });
      row.providerUsage = completion.usage ? { promptTokens: completion.usage.prompt_tokens, completionTokens: completion.usage.completion_tokens, totalTokens: completion.usage.total_tokens } : null;
      const choice = completion.choices[0];
      return { content: choice?.message.content ?? null, finishReason: choice?.finish_reason ?? null, refusal: choice?.message.refusal ?? null };
    } });
    try {
      const answer = await engine.answer({ message: test.message, locale: test.locale, history: test.history ?? [], knowledge: knowledge.filter(doc => doc.locale === test.locale) });
      Object.assign(row, { answer, status: 'received', actionCheck: test.expectedAction ? answer.action === test.expectedAction : null });
    } catch (error) {
      if (!report.results.includes(row)) {
        // Rejected before transmission, so no cost reservation or paid retry is needed.
        console.log(`${test.id}: stopped before inference (budget/preflight); remaining cases not run.`);
        process.exitCode = 1;
        break;
      }
      Object.assign(row, { status: 'failed', error: error instanceof ModelError ? error.code : 'evaluation_failed' });
      process.exitCode = 1;
    }
    row.latencyMs = Math.round(performance.now() - started);
    await persist();
    console.log(`${test.id}: ${row.status}; reserved total $${report.reservedUpperBoundUsd.toFixed(6)} (an upper bound, not an invoice).`);
    if (row.actionCheck === false) process.exitCode = 1;
  }
  console.log(`Saved ${report.results.length}/${cases.length} cases. Inspect every answer against its rubric; no automatic intelligence score is claimed.`);
}
