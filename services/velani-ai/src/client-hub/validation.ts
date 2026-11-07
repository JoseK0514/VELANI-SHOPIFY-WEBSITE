import { z } from 'zod';
import type { ClientRequest } from './types.js';

export class ClientHubValidationError extends Error {
  constructor(readonly fields: Record<string, string[]>) { super('Invalid request fields.'); }
}
const singleLine = (maximum: number) => z.string().trim().max(maximum).regex(/^[^\p{Cc}\p{Zl}\p{Zp}]*$/u);
const schema = z.object({
  type: z.enum(['new_work', 'project_support']), name: singleLine(120).min(1),
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  company: singleLine(200).optional().default(''), project: singleLine(200).optional().default(''),
  description: z.string().transform(value => value.replace(/\r\n?/g, '\n').trim()).pipe(z.string().min(20).max(5000).regex(/^[^\x00-\x08\x0b\x0c\x0e-\x1f\x7f]*$/)),
  urgency: z.enum(['normal', 'high', 'urgent']).optional(), language: z.enum(['en', 'es']),
  turnstileToken: z.string().min(1).max(2048),
}).strict();

export function parseClientHubRequest(body: unknown, header: unknown): { key: string; input: ClientRequest; turnstileToken: string } {
  const key = z.uuid().safeParse(header);
  const parsed = schema.safeParse(body);
  const fields: Record<string, string[]> = {};
  const raw = typeof body === 'object' && body !== null && !Array.isArray(body) ? body as Record<string,unknown> : undefined;
  // Cross-field requirements must remain visible when an unrelated field fails.
  if (raw?.type === 'project_support' && (raw.project === undefined || (typeof raw.project === 'string' && !raw.project.trim()))) fields.project=['required'];
  if (raw?.type === 'new_work' && raw.urgency !== undefined) fields.urgency=['not_allowed'];
  if (!key.success) fields.idempotencyKey = [header === undefined ? 'required' : 'invalid'];
  if (!parsed.success) for (const issue of parsed.error.issues) {
    const field = issue.code === 'unrecognized_keys' ? '_form' : String(issue.path[0] ?? '_form');
    const code = issue.code === 'unrecognized_keys' ? 'unknown' : issue.code === 'too_big' ? 'too_long'
      : issue.code === 'too_small' ? (issue.minimum === 1 ? 'required' : 'too_short')
      : raw && raw[field] === undefined ? 'required' : 'invalid';
    (fields[field] ??= []).push(code);
  }
  if (!parsed.success || !key.success || Object.keys(fields).length) throw new ClientHubValidationError(fields);
  const { turnstileToken, urgency, ...input } = parsed.data;
  return { key: key.data, turnstileToken, input: { ...input, urgency: input.type === 'project_support' ? urgency ?? 'normal' : null } };
}
