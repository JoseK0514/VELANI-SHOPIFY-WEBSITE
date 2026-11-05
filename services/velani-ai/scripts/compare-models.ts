import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { z } from 'zod';
import { ModelEngine, ModelError, MAX_COMPLETION_TOKENS } from '../src/engine.js';
import type { Answer, KnowledgeDocument } from '../src/types.js';

const schema = z.array(z.object({
  id: z.string(), locale: z.enum(['en', 'es']), message: z.string(),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })).optional(),
  expectedAction: z.enum(['none', 'show_demo', 'lead_form', 'human_help']).optional(),
  fixture: z.literal('conflicting_availability').optional(), reviewCriteria: z.array(z.string()),
}));
const args = process.argv.slice(2);
const cases = schema.parse(JSON.parse(await readFile(new URL('../knowledge/comparison-cases.json', import.meta.url), 'utf8')));
if (args.includes('--list')) {
  console.log(cases.map(test => `${test.id} (${test.locale})`).join('\n'));
} else {
  const apiKey = process.env.AI_API_KEY;
  const baseURL = process.env.AI_BASE_URL;
  if (!apiKey || !baseURL) throw new Error('Set AI_API_KEY and AI_BASE_URL; no keys are printed.');
  if (!args.includes('--run')) throw new Error('Use --run to make live paid model calls.');
  const models = (args.find(arg => arg.startsWith('--models='))?.slice(9) ?? 'gpt-6-1-sol,gpt-6-astra,claude-opus-5-5').split(',');
  if (models.length < 1 || models.length > 3 || new Set(models).size !== models.length) throw new Error('Choose one to three unique model IDs.');
  const selectedIds = args.find(arg => arg.startsWith('--case='))?.slice(7).split(',');
  const selected = selectedIds ? cases.filter(test => selectedIds.includes(test.id)) : cases;
  if (!selected.length || selectedIds?.some(id => !cases.some(test => test.id === id))) throw new Error('Unknown comparison case.');
  if (models.length * selected.length > 18) throw new Error('This bounded comparison supports at most 18 live calls per run.');
  const output = resolve(args.find(arg => arg.startsWith('--out='))?.slice(6) ?? 'artifacts/model-comparison.json');
  const catalogResponse = await fetch(baseURL.replace(/\/$/, '') + '/models', {
    headers: { Authorization: `Bearer ${apiKey}` }, signal: AbortSignal.timeout(15000),
  });
  if (!catalogResponse.ok) throw new Error('Model catalog could not be verified.');
  const catalog = await catalogResponse.json() as { data?: Array<{ id: string }> };
  const modelIds = new Set(catalog.data?.map(entry => entry.id));
  if (models.some(model => !modelIds.has(model))) throw new Error('At least one requested model is absent from the verified catalog.');
  const knowledge = JSON.parse(await readFile(new URL('../knowledge/nevora.json', import.meta.url), 'utf8')) as KnowledgeDocument[];
  const promptSource = await readFile(new URL('../src/prompts.ts', import.meta.url), 'utf8');
  const engineSource = await readFile(new URL('../src/engine.ts', import.meta.url), 'utf8');
  const startedAt = new Date().toISOString();
  type Result = {
    model: string; caseId: string; locale: string; message: string; history: unknown[];
    reviewCriteria: string[]; fixture?: string; latencyMs: number;
    contract: 'pass' | 'fail'; actionCheck: 'pass' | 'fail' | 'not_requested';
    answer?: Answer; error?: string; semanticReview: 'pending';
  };
  const results: Result[] = [];
  const metadata = {
    startedAt, models, casesPerModel: selected.length, requestedCalls: models.length * selected.length,
    verifiedCatalog: models, promptSha256: createHash('sha256').update(promptSource).digest('hex'),
    engineSha256: createHash('sha256').update(engineSource).digest('hex'),
    conditions: { timeoutMs: 90000, maxCompletionTokens: MAX_COMPLETION_TOKENS, temperature: 'provider default', reasoningEffort: 'provider default', retries: 0 },
    evaluationType: 'small_live_cross_model_comparison',
    limitations: [
      'One sample per model per case; not a statistically powered benchmark.',
      'Shared application prompt and output contract, not provider-specific tuning.',
      'Provider default reasoning effort can differ even with equal output-token limits.',
      'Agent semantic review is not blind human business-owner acceptance.',
      'A synthetic conflicting-availability document is used only for its named case and is not a product fact.',
      'These are direct-engine tests; database retrieval, plan generation and frontend are separately tested.',
    ],
  };
  const save = async () => {
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, JSON.stringify({ ...metadata, completedCalls: results.length, results }, null, 2) + '\n', { mode: 0o600 });
  };
  // Sequential, interleaved model order gives every case the same knowledge and avoids burst charges.
  const engines = new Map(models.map(model => [model, new ModelEngine({ apiKey, baseURL, model, timeoutMs: 90000 })]));
  for (const test of selected) {
    const documents = knowledge.filter(document => document.locale === test.locale);
    if (test.fixture === 'conflicting_availability') documents.push({
      id: 'synthetic-conflicting-availability-en', title: 'Commercial availability update',
      url: 'https://www.thevelani.com/pages/nevora', locale: 'en', reviewedAt: '2026-11-02', validUntil: '2026-12-02', isCore: true,
      content: 'NEVORA is generally available for instant self-service signup. Its public fixed subscription price is $39 per month for any team size. This commercial availability note is current.',
    });
    for (const model of models) {
      const start = performance.now();
      const common = { model, caseId: test.id, locale: test.locale, message: test.message,
        history: test.history ?? [], reviewCriteria: test.reviewCriteria, fixture: test.fixture, semanticReview: 'pending' as const };
      try {
        const answer = await engines.get(model)!.answer({ message: test.message, locale: test.locale, history: test.history ?? [], knowledge: documents });
        results.push({ ...common, latencyMs: Math.round(performance.now() - start), contract: 'pass',
          actionCheck: test.expectedAction ? answer.action === test.expectedAction ? 'pass' : 'fail' : 'not_requested', answer });
      } catch (error) {
        results.push({ ...common, latencyMs: Math.round(performance.now() - start), contract: 'fail', actionCheck: 'not_requested',
          error: error instanceof ModelError ? error.code : 'comparison_error' });
      }
      const last = results.at(-1)!;
      console.log(`${model} / ${test.id}: ${last.contract} (${last.latencyMs}ms)`);
      await save();
    }
  }
  console.log(`Saved ${results.length} live results. Read every answer against its criteria; no automatic intelligence score is produced.`);
  if (results.some(result => result.contract === 'fail' || result.actionCheck === 'fail')) process.exitCode = 1;
}
