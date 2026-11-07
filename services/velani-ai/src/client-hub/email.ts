import type { ClientRequest, DeliveryFailure, TransactionalEmail } from './types.js';
export type { TransactionalEmail } from './types.js';
const escape = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);

export function requestEmail(input: ClientRequest, reference: string, kind: 'support' | 'confirmation'): TransactionalEmail {
  const spanish = input.language === 'es';
  const title = kind === 'support' ? `${reference} · ${input.type === 'new_work' ? 'New work' : 'Project support'}`
    : `${spanish ? 'Solicitud recibida' : 'Request received'} · ${reference}`;
  const details = `Reference: ${reference}\nType: ${input.type}\nName: ${input.name}\nEmail: ${input.email}\nCompany: ${input.company || '—'}\nProject: ${input.project || '—'}\nUrgency: ${input.urgency || '—'}\nLanguage: ${input.language}\n\nDescription:\n${input.description}`;
  const acknowledgement = spanish
    ? `Hola ${input.name}:\n\nHemos recibido tu solicitud. Tu referencia es ${reference}.\n\nEl equipo de Velani revisará tu mensaje y responderá por correo. Puedes responder a este correo para añadir información. La prioridad indicada no garantiza un plazo de respuesta.\n\nGracias,\nVelani`
    : `Hello ${input.name},\n\nWe have received your request. Your reference is ${reference}.\n\nThe Velani team will review your message and reply by email. You can reply to this email to add information. Requested urgency does not guarantee a response time.\n\nThank you,\nVelani`;
  const text = kind === 'support' ? details : acknowledgement;
  return { from: 'Velani <requests@thevelani.com>', to: kind === 'support' ? 'support@thevelani.com' : input.email,
    reply_to: kind === 'support' ? input.email : 'support@thevelani.com', subject: title, text,
    html: `<!doctype html><html lang="${input.language}"><head><meta charset="utf-8"><title>${escape(title)}</title></head><body style="font-family:Arial,sans-serif;color:#101a29;line-height:1.6"><h1 style="font-size:22px">${escape(title)}</h1><div style="white-space:pre-wrap">${escape(text)}</div></body></html>` };
}

export class EmailDeliveryError extends Error implements DeliveryFailure {
  constructor(readonly code: string, readonly retryable: boolean, readonly ambiguous: boolean) { super('Email submission could not be confirmed.'); }
}
export interface EmailSender { send(email: TransactionalEmail, idempotencyKey: string): Promise<string> }
export class ResendSender implements EmailSender {
  constructor(private readonly apiKey: string, private readonly fetcher: typeof fetch = fetch) {}
  async send(email: TransactionalEmail, idempotencyKey: string): Promise<string> {
    let response: Response;
    try {
      response = await this.fetcher('https://api.resend.com/emails', { method: 'POST',
        headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
        body: JSON.stringify(email), signal: AbortSignal.timeout(8000), redirect: 'error' });
    } catch { throw new EmailDeliveryError('network_unconfirmed', true, true); }
    if (!response.ok) throw new EmailDeliveryError(`provider_${response.status}`, response.status === 429 || response.status >= 500, response.status >= 500);
    try {
      const result = await response.json() as { id?: unknown };
      if (typeof result.id !== 'string' || !result.id || result.id.length > 200) throw new Error();
      return result.id;
    } catch { throw new EmailDeliveryError('response_unconfirmed', true, true); }
  }
}
