import OpenAI from 'openai';
import { ModelError, type ModelCompletion, type ModelEngineOptions } from './engine.js';
import { businessProfileSchema, generatedPlanSchema } from './experience-validation.js';
import { buildPlanMessages } from './plan-prompts.js';
import type { PlanEngine, WorkflowPlan } from './experience-types.js';
import type { KnowledgeDocument, Message } from './types.js';

export class PlanKnowledgeUnavailableError extends Error {
  readonly code = 'knowledge_unavailable';
  constructor() { super('Current product knowledge is unavailable.'); this.name = 'PlanKnowledgeUnavailableError'; }
}

const ALLOWED_HOSTS = new Set(['www.thevelani.com', 'thevelani.com']);
const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;

function currentDocuments(input: KnowledgeDocument[], now: Date): KnowledgeDocument[] {
  const result: KnowledgeDocument[] = [];
  const ids = new Set<string>();
  let remaining = 32000;
  for (const document of [...input].sort((a, b) => Number(Boolean(b.isCore)) - Number(Boolean(a.isCore)))) {
    if (result.length === 24) break;
    if (!/^[a-zA-Z0-9_-]{1,120}$/.test(document.id) || ids.has(document.id) || !['en', 'es'].includes(document.locale)) continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(document.reviewedAt) || !/^\d{4}-\d{2}-\d{2}$/.test(document.validUntil)) continue;
    const reviewed = Date.parse(`${document.reviewedAt}T00:00:00.000Z`);
    const expiry = Date.parse(`${document.validUntil}T23:59:59.999Z`);
    if (!Number.isFinite(reviewed) || !Number.isFinite(expiry) || reviewed > now.getTime() || expiry < now.getTime() || expiry < reviewed) continue;
    let url: URL;
    try { url = new URL(document.url); } catch { continue; }
    if (url.protocol !== 'https:' || !ALLOWED_HOSTS.has(url.hostname) || url.username || url.password || url.port) continue;
    if (typeof document.content !== 'string' || !document.content.trim() || document.content.length > 6000 || document.content.length > remaining) continue;
    if (typeof document.title !== 'string' || !document.title.trim()) continue;
    result.push({ ...document, title: document.title.slice(0, 240), content: document.content.trim() });
    ids.add(document.id); remaining -= document.content.length;
  }
  return result;
}

function recentHistory(input: Message[]): Message[] {
  const result: Message[] = [];
  let remaining = 32000;
  for (const message of input.slice(-40).reverse()) {
    if (!['user', 'assistant'].includes(message.role) || typeof message.content !== 'string') continue;
    const content = message.content.slice(0, Math.min(4000, remaining));
    if (content) result.unshift({ role: message.role, content });
    remaining -= content.length;
    if (remaining === 0) break;
  }
  return result;
}

export class PlanModelEngine implements PlanEngine {
  readonly model: string;
  private readonly complete: NonNullable<ModelEngineOptions['complete']>;
  private readonly timeoutMs: number;
  private readonly now: () => Date;

  constructor(options: ModelEngineOptions) {
    if (!options.model?.trim() || !options.apiKey?.trim()) throw new ModelError('invalid_input');
    this.model = options.model.trim();
    this.timeoutMs = options.timeoutMs ?? 60000;
    if (!Number.isFinite(this.timeoutMs) || this.timeoutMs <= 0 || this.timeoutMs > 90000) throw new ModelError('invalid_input');
    this.now = options.now ?? (() => new Date());
    if (options.complete) this.complete = options.complete;
    else {
      const client = new OpenAI({ apiKey: options.apiKey, baseURL: options.baseURL, timeout: this.timeoutMs, maxRetries: 0 });
      this.complete = async (request, signal) => {
        const result = await client.chat.completions.create(request, { signal });
        const choice = result.choices[0];
        return { content: choice?.message.content ?? null, finishReason: choice?.finish_reason ?? null, refusal: choice?.message.refusal ?? null };
      };
    }
  }

  async generate(input: Parameters<PlanEngine['generate']>[0]): Promise<WorkflowPlan> {
    const profile = businessProfileSchema.safeParse(input.profile);
    if (!profile.success || typeof input.brief !== 'string' || !input.brief.trim() || input.brief.length > 4000 || !['en', 'es'].includes(input.locale)) throw new ModelError('invalid_input');
    const now = this.now();
    const knowledge = currentDocuments(input.knowledge, now);
    if (knowledge.length === 0) throw new PlanKnowledgeUnavailableError();
    const messages = buildPlanMessages({ brief: input.brief.trim(), locale: input.locale, profile: profile.data, history: recentHistory(input.history), knowledge, date: now.toISOString().slice(0, 10) });
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let completion: ModelCompletion;
    try {
      const deadline = new Promise<never>((_, reject) => {
        timer = setTimeout(() => { controller.abort(); reject(new ModelError('provider_timeout')); }, this.timeoutMs);
      });
      completion = await Promise.race([
        this.complete({ model: this.model, messages, response_format: { type: 'json_object' }, max_completion_tokens: 6000, stream: false }, controller.signal),
        deadline,
      ]);
    } catch {
      throw new ModelError(controller.signal.aborted ? 'provider_timeout' : 'provider_unavailable');
    } finally { if (timer) clearTimeout(timer); }
    if (completion.refusal || completion.finishReason !== 'stop' || !completion.content || completion.content.length > 24000) throw new ModelError('invalid_model_response');
    let candidate: unknown;
    try { candidate = JSON.parse(completion.content); } catch { throw new ModelError('invalid_model_response'); }
    const parsed = generatedPlanSchema.safeParse(candidate);
    if (!parsed.success) throw new ModelError('invalid_model_response');
    const plan = parsed.data;
    // Contact details never belong in this public workflow artifact, even if the visitor supplied them.
    if (EMAIL.test(JSON.stringify(plan))) throw new ModelError('invalid_model_response');
    const byId = new Map(knowledge.map(document => [document.id, document]));
    const sourceIds = [...new Set(plan.workflow.flatMap(step => step.sourceIds))];
    if (sourceIds.length > 12 || sourceIds.some(id => !byId.has(id))) throw new ModelError('invalid_model_response');
    return {
      ...plan,
      sources: sourceIds.map(id => { const document = byId.get(id)!; return { id, title: document.title, url: document.url }; }),
      model: this.model,
    };
  }
}
