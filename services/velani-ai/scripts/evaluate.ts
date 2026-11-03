import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { z } from 'zod';
import { ModelEngine, ModelError } from '../src/engine.js';
import type { Answer, KnowledgeDocument } from '../src/types.js';

const evalCaseSchema = z.object({
  id: z.string(), locale: z.enum(['en', 'es']), message: z.string(),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })).optional(),
  expectedAction: z.enum(['none', 'show_demo', 'lead_form', 'human_help']).optional(),
  reviewNotes: z.string(),
});
const cases = z.array(evalCaseSchema).parse(JSON.parse(await readFile(new URL('../knowledge/evals.json', import.meta.url), 'utf8')));
const args = process.argv.slice(2);

if (args.includes('--list')) {
  console.log(cases.map((test) => `${test.id} (${test.locale})`).join('\n'));
} else {
  const apiKey = process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY;
  const model = process.env.AI_MODEL ?? process.env.OPENAI_MODEL;
  const baseURL = process.env.AI_BASE_URL ?? process.env.OPENAI_BASE_URL;
  if (!apiKey || !model) {
    console.error('Live evaluation was not run. Configure AI_API_KEY and AI_MODEL (and AI_BASE_URL for a gateway). No mocked quality score is generated.');
    process.exitCode = 2;
  } else {
    const requestedIds = args.find((arg) => arg.startsWith('--case='))?.slice('--case='.length).split(',');
    const selected = requestedIds ? cases.filter((test) => requestedIds.includes(test.id)) : cases;
    if (selected.length === 0 || requestedIds?.some((id) => !cases.some((test) => test.id === id))) {
      throw new Error('Unknown evaluation case. Use --list to inspect available cases.');
    }
    const outputArgument = args.find((arg) => arg.startsWith('--out='))?.slice('--out='.length);
    const startedAt = new Date().toISOString();
    const outputPath = resolve(outputArgument || `artifacts/evaluation-${startedAt.replace(/[:.]/g, '-')}.json`);
    const knowledge = JSON.parse(await readFile(new URL('../knowledge/nevora.json', import.meta.url), 'utf8')) as KnowledgeDocument[];
    const engine = new ModelEngine({ apiKey, model, baseURL, timeoutMs: 60000 });
    const results: Array<{
      id: string; locale: string; input: { message: string; history: unknown[] }; reviewNotes: string;
      answer?: Answer; error?: string; latencyMs: number; contractCheck: 'pass' | 'fail';
      expectedAction?: string; actionCheck: 'pass' | 'fail' | 'not_requested'; semanticReview: 'pending';
    }> = [];
    for (const test of selected) {
      const started = performance.now();
      const common = {
        id: test.id, locale: test.locale, input: { message: test.message, history: test.history ?? [] },
        reviewNotes: test.reviewNotes, expectedAction: test.expectedAction, semanticReview: 'pending' as const,
      };
      try {
        const answer = await engine.answer({
          message: test.message, locale: test.locale, history: test.history ?? [],
          knowledge: knowledge.filter((document) => document.locale === test.locale),
        });
        results.push({
          ...common, answer, latencyMs: Math.round(performance.now() - started), contractCheck: 'pass',
          actionCheck: test.expectedAction ? (answer.action === test.expectedAction ? 'pass' : 'fail') : 'not_requested',
        });
        console.log(`${test.id}: response received (${Math.round(performance.now() - started)} ms); semantic review pending`);
      } catch (error) {
        const code = error instanceof ModelError ? error.code : 'evaluation_error';
        results.push({ ...common, error: code, latencyMs: Math.round(performance.now() - started), contractCheck: 'fail', actionCheck: 'not_requested' });
        console.log(`${test.id}: ${code}`);
      }
      // Keep a partial report if the process is interrupted; never record keys, headers or raw provider errors.
      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, JSON.stringify({
        startedAt, model, evaluationType: 'live_model',
        scope: 'Direct model with reviewed locale knowledge; database retrieval, widget and lead persistence require separate tests.',
        qualityVerdict: 'PENDING_HUMAN_REVIEW',
        reviewInstructions: 'Inspect every answer against its reviewNotes. Check factual support, language, helpfulness, context use, action honesty and resistance to prompt injection. Contract checks and action matches are not a semantic-quality score.',
        completed: results.length, requested: selected.length, results,
      }, null, 2) + '\n', { mode: 0o600 });
    }
    const contractFailures = results.filter((result) => result.contractCheck === 'fail').length;
    const actionFailures = results.filter((result) => result.actionCheck === 'fail').length;
    console.log(`Saved ${results.length} live cases to ${outputPath}. Contract failures: ${contractFailures}; action mismatches: ${actionFailures}. Human semantic review remains required.`);
    if (contractFailures || actionFailures) process.exitCode = 1;
  }
}
