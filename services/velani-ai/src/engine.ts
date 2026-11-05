import OpenAI, { APIError } from 'openai';
import { z } from 'zod';
import { buildModelMessages, type ModelMessage } from './prompts.js';
import type { Answer, AnswerEngine, KnowledgeDocument, Message } from './types.js';

const outputSchema = z.object({
  message: z.string().trim().min(1).max(7000),
  sourceIds: z.array(z.string().min(1).max(120)).max(8),
  action: z.enum(['none', 'show_demo', 'lead_form', 'human_help']),
  confidence: z.enum(['grounded', 'needs_human']),
}).strict();

export type ModelErrorCode = 'invalid_input' | 'provider_unavailable' | 'provider_timeout' | 'invalid_model_response';
type ProviderHint = 'token_budget' | 'structured_output' | 'safety_filter';

function providerHint(error: APIError): ProviderHint | undefined {
  // Reduce upstream text to fixed diagnostic labels; never retain its text, headers or body.
  const message = error.message.slice(0, 4096);
  if (/(output|completion|reasoning).{0,40}(token|budget).{0,40}(exceed|limit|insufficient|small)|max_(?:completion_)?tokens.{0,40}(exceed|invalid|must)/i.test(message)) return 'token_budget';
  if (/content_filter|content policy|safety filter|moderation|jailbreak|prompt injection/i.test(message)) return 'safety_filter';
  if (/response_format|invalid.{0,30}json|json.{0,30}(invalid|parse|malformed|failed)/i.test(message)) return 'structured_output';
  return undefined;
}

/** Safe to log the code/message; deliberately does not retain a provider error or raw response. */
export class ModelError extends Error {
  readonly code: ModelErrorCode;
  readonly providerStatus?: number;
  readonly providerHint?: ProviderHint;
  constructor(code: ModelErrorCode, providerStatus?: number, hint?: ProviderHint) {
    super(code);
    this.name = 'ModelError';
    this.code = code;
    if (typeof providerStatus === 'number' && Number.isInteger(providerStatus) && providerStatus >= 400 && providerStatus <= 599) this.providerStatus = providerStatus;
    if (hint) this.providerHint = hint;
  }
}

export interface ModelRequest {
  model: string;
  messages: ModelMessage[];
  response_format: { type: 'json_object' };
  max_completion_tokens: number;
  stream: false;
}

export interface ModelCompletion {
  content: string | null;
  finishReason: string | null;
  refusal?: string | null;
}

export interface ModelEngineOptions {
  apiKey: string;
  baseURL?: string;
  model: string;
  timeoutMs?: number;
  /** Dependency injection for deterministic contract tests; production uses the OpenAI-compatible API. */
  complete?: (request: ModelRequest, signal: AbortSignal) => Promise<ModelCompletion>;
  now?: () => Date;
}

const MAX_HISTORY_CHARS = 32000;
const MAX_KNOWLEDGE_CHARS = 32000;
const MAX_DOCUMENT_CHARS = 6000;
// Includes the model's internal reasoning as well as the validated visitor-facing JSON.
export const MAX_COMPLETION_TOKENS = 6000;
const ALLOWED_SOURCE_HOSTS = new Set(['www.thevelani.com', 'thevelani.com']);
const EMAIL_PATTERN = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+/g;

function boundedHistory(history: Message[]): Message[] {
  const selected: Message[] = [];
  let remaining = MAX_HISTORY_CHARS;
  for (const entry of history.slice(-40).reverse()) {
    if ((entry.role !== 'user' && entry.role !== 'assistant') || typeof entry.content !== 'string') continue;
    const content = entry.content.slice(0, Math.min(4000, remaining));
    if (content) selected.unshift({ role: entry.role, content });
    remaining -= content.length;
    if (remaining === 0) break;
  }
  return selected;
}

function reviewedDocuments(knowledge: KnowledgeDocument[], now: Date): KnowledgeDocument[] {
  const documents: KnowledgeDocument[] = [];
  const ids = new Set<string>();
  let remaining = MAX_KNOWLEDGE_CHARS;
  // Keep critical product boundaries before less essential search results.
  const prioritized = [...knowledge].sort((a, b) => Number(Boolean(b.isCore)) - Number(Boolean(a.isCore)));
  for (const document of prioritized) {
    if (documents.length >= 24) break;
    if (!/^[a-zA-Z0-9_-]{1,120}$/.test(document.id) || ids.has(document.id)) continue;
    if (document.locale !== 'en' && document.locale !== 'es') continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(document.reviewedAt) || !/^\d{4}-\d{2}-\d{2}$/.test(document.validUntil)) continue;
    const reviewedAt = Date.parse(`${document.reviewedAt}T00:00:00.000Z`);
    const expiresAt = Date.parse(`${document.validUntil}T23:59:59.999Z`);
    if (!Number.isFinite(reviewedAt) || !Number.isFinite(expiresAt) || reviewedAt > now.getTime() || expiresAt < now.getTime() || expiresAt < reviewedAt) continue;
    let url: URL;
    try { url = new URL(document.url); } catch { continue; }
    if (url.protocol !== 'https:' || !ALLOWED_SOURCE_HOSTS.has(url.hostname) || url.username || url.password || url.port) continue;
    if (typeof document.content !== 'string' || !document.content.trim() || typeof document.title !== 'string' || !document.title.trim()) continue;
    // Never silently truncate a document into a potentially misleading fragment.
    if (document.content.length > MAX_DOCUMENT_CHARS || document.content.length > remaining) continue;
    documents.push({ ...document, title: document.title.slice(0, 240), content: document.content.trim() });
    ids.add(document.id);
    remaining -= document.content.length;
  }
  return documents;
}

export class ModelEngine implements AnswerEngine {
  readonly model: string;
  private readonly complete: NonNullable<ModelEngineOptions['complete']>;
  private readonly timeoutMs: number;
  private readonly now: () => Date;

  constructor(options: ModelEngineOptions) {
    if (!options.model?.trim() || !options.apiKey?.trim()) throw new ModelError('invalid_input');
    this.model = options.model.trim();
    this.timeoutMs = options.timeoutMs ?? 45000;
    if (!Number.isFinite(this.timeoutMs) || this.timeoutMs <= 0 || this.timeoutMs > 120000) throw new ModelError('invalid_input');
    this.now = options.now ?? (() => new Date());
    if (options.complete) {
      this.complete = options.complete;
    } else {
      const client = new OpenAI({ apiKey: options.apiKey, baseURL: options.baseURL, timeout: this.timeoutMs, maxRetries: 0 });
      this.complete = async (request, signal) => {
        const result = await client.chat.completions.create(request, { signal });
        const choice = result.choices[0];
        return {
          content: choice?.message.content ?? null,
          finishReason: choice?.finish_reason ?? null,
          refusal: choice?.message.refusal ?? null,
        };
      };
    }
  }

  async answer(input: Parameters<AnswerEngine['answer']>[0]): Promise<Answer> {
    if (!input.message?.trim() || input.message.length > 8000 || (input.locale !== 'en' && input.locale !== 'es')) {
      throw new ModelError('invalid_input');
    }
    const now = this.now();
    const knowledge = reviewedDocuments(input.knowledge, now);
    if (knowledge.length === 0) {
      return {
        message: input.locale === 'es'
          ? 'No tengo información revisada y vigente de NEVORA disponible para verificar sus funciones, precios o disponibilidad. Puedes consultar directamente con el equipo de Velani mediante la opción de contacto.'
          : 'I don’t have current, reviewed NEVORA information available to verify its features, pricing or availability. You can check directly with the Velani team through the contact option.',
        sources: [], action: 'human_help', confidence: 'needs_human', model: this.model,
      };
    }
    const messages = buildModelMessages({
      message: input.message,
      locale: input.locale,
      history: boundedHistory(input.history),
      knowledge,
      date: now.toISOString().slice(0, 10),
      profile: input.profile,
      plan: input.plan,
    });
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let completion: ModelCompletion;
    try {
      const deadline = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new ModelError('provider_timeout'));
        }, this.timeoutMs);
      });
      completion = await Promise.race([
        this.complete({
          model: this.model,
          messages,
          response_format: { type: 'json_object' },
          max_completion_tokens: MAX_COMPLETION_TOKENS,
          stream: false,
        }, controller.signal),
        deadline,
      ]);
    } catch (error) {
      if (controller.signal.aborted || (error instanceof ModelError && error.code === 'provider_timeout')) throw new ModelError('provider_timeout');
      throw new ModelError('provider_unavailable', error instanceof OpenAI.APIError ? error.status : undefined,
        error instanceof OpenAI.APIError ? providerHint(error) : undefined);
    } finally {
      if (timer) clearTimeout(timer);
    }

    if (completion.refusal || completion.finishReason !== 'stop' || !completion.content || completion.content.length > 16000) {
      throw new ModelError('invalid_model_response');
    }
    let candidate: unknown;
    try { candidate = JSON.parse(completion.content); } catch { throw new ModelError('invalid_model_response'); }
    const parsed = outputSchema.safeParse(candidate);
    if (!parsed.success) throw new ModelError('invalid_model_response');
    const result = parsed.data;
    const documentById = new Map(knowledge.map((document) => [document.id, document]));
    if (new Set(result.sourceIds).size !== result.sourceIds.length || result.sourceIds.some((id) => !documentById.has(id))) {
      throw new ModelError('invalid_model_response');
    }
    // The UI obtains clickable links from reviewed metadata, never model-generated text.
    if (/https?:\/\/|javascript\s*:|data:[^\s,;]+(?:;base64)?,|www\.|\[[^\]]*\]\s*\(|<\s*\/?\s*[a-z][^>]*>/i.test(result.message)) {
      throw new ModelError('invalid_model_response');
    }
    const citedPublicEmails = new Set(result.sourceIds.flatMap((id) =>
      documentById.get(id)!.content.match(EMAIL_PATTERN) ?? []).map((email) => email.toLowerCase()));
    if ((result.message.match(EMAIL_PATTERN) ?? []).some((email) => !citedPublicEmails.has(email.toLowerCase()))) {
      throw new ModelError('invalid_model_response');
    }
    if (result.action === 'show_demo' && result.sourceIds.length === 0) throw new ModelError('invalid_model_response');
    return {
      message: result.message,
      sources: result.sourceIds.map((id) => {
        const document = documentById.get(id)!;
        return { id: document.id, title: document.title, url: document.url };
      }),
      action: result.action,
      confidence: result.confidence,
      model: this.model,
    };
  }
}
