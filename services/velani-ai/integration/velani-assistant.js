/** A dependency-free, headless client. API keys and database credentials never belong here. */
export const NOTICES = Object.freeze({
  en: 'AI assistant. Product details may change. Chat history is retained up to 30 days; submitted enquiries up to 90 days.',
  es: 'Asistente de IA. Los detalles del producto pueden cambiar. El historial del chat se conserva hasta 30 días; las consultas enviadas, hasta 90 días.',
});

const messages = {
  en: {
    network: 'Connection interrupted. You can retry the same request.',
    busy: 'Wait for the current request to finish.',
    pending: 'Retry or discard the failed request before sending another.',
    rate: 'Too many requests. Wait, then retry the same request.',
    expired: 'This chat session has expired. Start a new chat to continue.',
    denied: 'The request could not be authorized. Check the session and verification.',
    invalid: 'Check the information and try again.',
    server: 'The assistant is temporarily unavailable. You can retry the same request.',
    malformed: 'The server returned an unexpected response. You can retry the same request.',
    retry: 'No failed request is available to retry.',
    early: 'Wait for the retry delay to finish.',
    captcha: 'Complete the verification, then retry.',
  },
  es: {
    network: 'Se interrumpió la conexión. Puedes reintentar la misma solicitud.',
    busy: 'Espera a que termine la solicitud actual.',
    pending: 'Reintenta o descarta la solicitud fallida antes de enviar otra.',
    rate: 'Demasiadas solicitudes. Espera y reintenta la misma solicitud.',
    expired: 'Esta sesión ha caducado. Inicia un chat nuevo para continuar.',
    denied: 'No se pudo autorizar la solicitud. Comprueba la sesión y la verificación.',
    invalid: 'Revisa la información e inténtalo de nuevo.',
    server: 'El asistente no está disponible temporalmente. Puedes reintentar la misma solicitud.',
    malformed: 'El servidor devolvió una respuesta inesperada. Puedes reintentar la misma solicitud.',
    retry: 'No hay ninguna solicitud fallida para reintentar.',
    early: 'Espera a que termine el plazo de reintento.',
    captcha: 'Completa la verificación y vuelve a intentarlo.',
  },
};

export class AssistantError extends Error {
  constructor(message, { code, status = 0, retryable = false, retryAt = 0 } = {}) {
    super(message);
    this.name = 'AssistantError';
    this.code = code;
    this.status = status;
    this.retryable = retryable;
    this.retryAt = retryAt;
  }
}

/** Accept only public Velani HTTPS links; never insert a model-provided URL unchecked. */
export function safeSourceUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !['thevelani.com', 'www.thevelani.com'].includes(url.hostname)
      || url.username || url.password || url.port) return null;
    return url.href;
  } catch { return null; }
}

function apiBase(value) {
  const url = new URL(value);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:'))
    || url.username || url.password || url.search || url.hash) {
    throw new TypeError('Use an HTTPS API URL, or HTTP on localhost for development.');
  }
  return url.href.replace(/\/$/, '');
}

export class VelaniAssistant {
  #base;
  #locale;
  #getCaptchaToken;
  #fetch;
  #session = null;
  #failed = null;
  #busy = false;
  #timeoutMs;

  constructor({ apiBaseUrl, locale = 'en', getCaptchaToken, fetch: fetchImpl = globalThis.fetch, timeoutMs = 90_000 }) {
    if (!['en', 'es'].includes(locale)) throw new TypeError('Locale must be en or es.');
    if (typeof fetchImpl !== 'function') throw new TypeError('Fetch is required.');
    this.#base = apiBase(apiBaseUrl);
    this.#locale = locale;
    this.#getCaptchaToken = getCaptchaToken;
    // Browser fetch needs its Window receiver; private-field calls otherwise bind this client.
    this.#fetch = fetchImpl.bind(globalThis);
    this.#timeoutMs = timeoutMs;
  }

  get locale() { return this.#locale; }
  get busy() { return this.#busy; }
  get session() {
    return this.#session ? { sessionId: this.#session.sessionId, expiresAt: this.#session.expiresAt } : null;
  }
  get failedRequest() {
    if (!this.#failed) return null;
    const { operation, error } = this.#failed;
    return { kind: operation.kind, requestId: operation.body?.requestId, retryable: error.retryable, retryAt: error.retryAt };
  }

  async start() {
    if (this.#session) {
      this.#checkExpiry();
      return this.session;
    }
    return this.#run({ kind: 'session' });
  }

  async chat(message) {
    if (typeof message !== 'string' || !message.trim() || message.length > 4000) throw this.#error('invalid');
    return this.#run({ kind: 'chat', path: '/v1/chat', body: { requestId: crypto.randomUUID(), message: message.trim() } });
  }

  async captureLead(input) {
    if (!input || input.consent !== true || input.consentVersion !== 'lead-v1'
      || typeof input.name !== 'string' || !input.name.trim()
      || typeof input.email !== 'string' || !input.email.trim()) throw this.#error('invalid');
    const body = { requestId: crypto.randomUUID(), name: input.name.trim(), email: input.email.trim(), consent: true, consentVersion: 'lead-v1' };
    for (const key of ['company', 'teamSize', 'locations', 'message']) {
      if (input[key] !== undefined && typeof input[key] !== 'string') throw this.#error('invalid');
      if (input[key]?.trim()) body[key] = input[key].trim();
    }
    return this.#run({ kind: 'lead', path: '/v1/leads', body });
  }

  async deleteSession() {
    if (!this.#session) return { deleted: true };
    return this.#run({ kind: 'delete', path: '/v1/session' });
  }

  async retryLastRequest() {
    if (!this.#failed?.error.retryable) throw this.#error('retry');
    if (this.#failed.error.retryAt > Date.now()) throw this.#error('early');
    return this.#run(this.#failed.operation, true);
  }

  discardFailedRequest() {
    if (this.#busy) throw this.#error('busy');
    this.#failed = null;
  }

  /** Clears this tab only. It does not delete anything on the server. */
  forgetLocally() {
    if (this.#busy) throw this.#error('busy');
    this.#session = null;
    this.#failed = null;
  }

  #error(code, extra = {}) { return new AssistantError(messages[this.#locale][code], { code, ...extra }); }

  #checkExpiry() {
    if (this.#session && Date.parse(this.#session.expiresAt) <= Date.now()) throw this.#error('expired');
  }

  async #createSession() {
    let captchaToken;
    try { captchaToken = await this.#getCaptchaToken?.(); }
    catch { throw this.#error('captcha', { retryable: true }); }
    const body = { locale: this.#locale };
    if (captchaToken) body.captchaToken = captchaToken;
    const result = await this.#request('/v1/sessions', 'POST', body, false);
    if (typeof result?.sessionToken !== 'string' || !result.sessionToken
      || typeof result?.sessionId !== 'string' || !Number.isFinite(Date.parse(result?.expiresAt))) {
      throw this.#error('malformed', { retryable: true });
    }
    this.#session = result;
    return this.session;
  }

  async #run(operation, retry = false) {
    if (this.#busy) throw this.#error('busy');
    if (this.#failed && !retry) throw this.#error('pending');
    this.#busy = true;
    try {
      let result;
      if (operation.kind === 'session') result = await this.#createSession();
      else {
        this.#checkExpiry();
        if (!this.#session) await this.#createSession();
        result = await this.#request(operation.path, operation.kind === 'delete' ? 'DELETE' : 'POST', operation.body, true);
        if (operation.kind === 'chat') {
          if (typeof result?.message !== 'string' || !Array.isArray(result?.sources)) throw this.#error('malformed', { retryable: true });
          result = {
            ...result,
            sources: result.sources.filter(source => source && typeof source.title === 'string' && safeSourceUrl(source.url))
              .map(source => ({ id: source.id, title: source.title, url: safeSourceUrl(source.url) })),
            action: ['none', 'show_demo', 'lead_form', 'human_help'].includes(result.action) ? result.action : 'none',
          };
        }
        if (operation.kind === 'lead' && (result?.saved !== true || typeof result.id !== 'string')) throw this.#error('malformed', { retryable: true });
        if (operation.kind === 'delete') this.#session = null;
      }
      this.#failed = null;
      return result;
    } catch (cause) {
      const error = cause instanceof AssistantError ? cause : this.#error('network', { retryable: true });
      this.#failed = { operation, error };
      throw error;
    } finally { this.#busy = false; }
  }

  async #request(path, method, body, authenticated) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.#timeoutMs);
    try {
      const headers = { Accept: 'application/json' };
      if (body) headers['Content-Type'] = 'application/json';
      if (authenticated) headers.Authorization = `Bearer ${this.#session.sessionToken}`;
      const response = await this.#fetch(`${this.#base}${path}`, {
        method, headers, ...(body ? { body: JSON.stringify(body) } : {}),
        credentials: 'omit', cache: 'no-store', redirect: 'error', signal: controller.signal,
      });
      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        const serverCode = details?.error?.code;
        const retryHeader = response.headers.get('Retry-After');
        const delay = retryHeader ? Number(retryHeader) : NaN;
        const retryAt = Number.isFinite(delay) ? Date.now() + Math.max(0, delay) * 1000
          : retryHeader ? (Date.parse(retryHeader) || 0) : 0;
        const retryable = [408, 425, 429, 500, 502, 503, 504].includes(response.status)
          || (response.status === 409 && serverCode !== 'request_id_conflict') || serverCode === 'captcha_required';
        const code = serverCode === 'captcha_required' ? 'captcha' : response.status === 429 ? 'rate' : response.status === 401 ? 'expired'
          : response.status === 403 ? 'denied' : retryable ? 'server' : 'invalid';
        throw this.#error(code, { status: response.status, retryable, retryAt });
      }
      if (response.status === 204) return { deleted: true };
      try { return await response.json(); }
      catch { throw this.#error('malformed', { retryable: true }); }
    } catch (cause) {
      if (cause instanceof AssistantError) throw cause;
      throw this.#error('network', { retryable: true });
    } finally { clearTimeout(timeout); }
  }
}
