// Velani client hub: the two client request kinds (new work, project support) go to the client-hub JSON API.
// Contract: docs/handoffs/2026-11-07-client-hub-interface.md in the client-hub worktree (fixed; do not change here).
// Nothing in this file writes to a URL, a log, analytics or browser storage.
export const HUB_API = 'https://velani-ai.vercel.app';
export const HUB_ACTION = 'velani-client-hub';
export const HUB_TOPICS = Object.freeze({ 'client-work': 'new_work', 'client-help': 'project_support' });
export const isHubTopic = topic => Object.hasOwn(HUB_TOPICS, topic);
export const HUB_LIMITS = Object.freeze({ name: 120, email: 254, company: 200, project: 200, description: 5000, descriptionMin: 20, token: 2048 });
// The form's urgency choices (kept in English in every language) and the contract's values
const URGENCY = { '': 'normal', 'It can wait': 'normal', "It's slowing us down": 'high', "We can't work": 'urgent', normal: 'normal', high: 'high', urgent: 'urgent' };
const REFERENCE = /^VEL-\d{4}-\d{4,}$/;
const CODES = new Set(['required', 'invalid', 'too_long', 'too_short', 'not_allowed', 'unknown']);
const text = value => (typeof value === 'string' ? value : '').normalize('NFC').replace(/\r\n?/g, '\n').trim();
const oneLine = value => !/[\u0000-\u001f\u007f]/.test(value);

/** Checks the form values against the contract's limits. Errors use the contract's codes, keyed by the form's field names
 * (message is sent as description). */
export function validateHub(fields = {}) {
  const type = HUB_TOPICS[fields.interest];
  const values = { type, name: text(fields.name), email: text(fields.email), company: text(fields.company), project: text(fields.project), message: text(fields.message),
    timing: text(fields.timing), urgency: URGENCY[text(fields.urgency)] };
  const errors = {};
  if (!type) errors.interest = 'invalid';
  if (!values.name) errors.name = 'required'; else if (values.name.length > HUB_LIMITS.name) errors.name = 'too_long'; else if (!oneLine(values.name)) errors.name = 'invalid';
  if (!values.email) errors.email = 'required'; else if (values.email.length > HUB_LIMITS.email) errors.email = 'too_long';
  else if (!/^[^\s@<>"\\,;]+@[^\s@<>"\\,;]+\.[^\s@<>"\\,;]+$/u.test(values.email)) errors.email = 'invalid';
  if (values.company.length > HUB_LIMITS.company) errors.company = 'too_long'; else if (!oneLine(values.company)) errors.company = 'invalid';
  if (!values.project && type === 'project_support') errors.project = 'required';
  else if (values.project.length > HUB_LIMITS.project) errors.project = 'too_long'; else if (!oneLine(values.project)) errors.project = 'invalid';
  const description = describe(values);
  if (!values.message) errors.message = 'required'; else if (values.message.length < HUB_LIMITS.descriptionMin) errors.message = 'too_short';
  else if (description.length > HUB_LIMITS.description) errors.message = 'too_long';
  if (type === 'project_support' && !values.urgency) errors.urgency = 'invalid';
  return { valid: Object.keys(errors).length === 0, errors, values };
}
// New work has no timing field in the contract: the chosen timing travels as the last line of the description.
const describe = values => values.message + (values.type === 'new_work' && values.timing ? '\n\nTiming: ' + values.timing : '');

/** The JSON body exactly as the contract lists it: no Shopify contact[...] names, no unknown fields. */
export function buildHubBody(values, { language, turnstileToken }) {
  const body = { type: values.type, name: values.name, email: values.email };
  if (values.company) body.company = values.company;
  if (values.project) body.project = values.project;
  body.description = describe(values);
  if (values.type === 'project_support') body.urgency = values.urgency || 'normal';
  body.language = language === 'es' ? 'es' : 'en';
  body.turnstileToken = turnstileToken;
  return body;
}

/** Seconds to wait from a Retry-After header (seconds or an HTTP date); 0 when absent or unreadable. */
export function retryAfterSeconds(header, now = Date.now()) {
  if (!header) return 0;
  if (/^\s*\d+\s*$/.test(header)) return Math.min(Number(header), 86400);
  const at = Date.parse(header);
  return Number.isNaN(at) ? 0 : Math.max(0, Math.min(Math.ceil((at - now) / 1000), 86400));
}

/** Server field names to the form's field names. */
const FIELD_OF = { description: 'message', name: 'name', email: 'email', company: 'company', project: 'project', urgency: 'urgency', type: 'interest', language: '_form', _form: '_form' };

/**
 * One client per form. submit() keeps one Idempotency-Key per logical submission: the same key while the values are
 * unchanged (timeouts, network errors, 503, 429, a failed verification), a new key after any edit and after a 409.
 * Outcomes: saved | invalid | conflict | verify | rate | unknown | rejected. A reference is only ever the server's.
 */
export function createHubClient({ api = HUB_API, fetchImpl = (...a) => globalThis.fetch(...a), uuid = () => globalThis.crypto.randomUUID(), timeoutMs = 20000, now = () => Date.now() } = {}) {
  const base = String(api).replace(/\/+$/, '');
  let key = null, print = null, pending = null;
  async function loadConfig() {
    const abort = new AbortController(); const timer = setTimeout(() => abort.abort(), timeoutMs);
    try {
      const response = await fetchImpl(base + '/v1/client-hub/config', { method: 'GET', headers: { Accept: 'application/json' }, credentials: 'omit', redirect: 'error', referrerPolicy: 'no-referrer', cache: 'no-store', signal: abort.signal });
      if (!response.ok) return { available: false };
      const data = await response.json();
      if (data?.enabled !== true || typeof data.turnstileSiteKey !== 'string' || !data.turnstileSiteKey || data.turnstileAction !== HUB_ACTION) return { available: false, disabled: data?.enabled === false };
      return { available: true, turnstileSiteKey: data.turnstileSiteKey, turnstileAction: data.turnstileAction };
    } catch { return { available: false }; }
    finally { clearTimeout(timer); }
  }
  function submit(values, { language, turnstileToken }) {
    if (pending) return pending;
    const body = buildHubBody(values, { language, turnstileToken });
    const { turnstileToken: _token, ...rest } = body; const next = JSON.stringify(rest);
    if (!key || next !== print) { key = uuid(); print = next; }
    const used = key;
    const abort = new AbortController(); const timer = setTimeout(() => abort.abort(), timeoutMs);
    pending = (async () => {
      let response;
      try {
        response = await fetchImpl(base + '/v1/client-hub/requests', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': used }, body: JSON.stringify(body),
          credentials: 'omit', redirect: 'error', referrerPolicy: 'no-referrer', signal: abort.signal });
      } catch { return { kind: 'unknown', retryAfter: 0 }; }
      let data = null;
      try { data = await response.json(); } catch {}
      const retryAfter = retryAfterSeconds(response.headers?.get?.('Retry-After'), now());
      const code = data?.error?.code;
      if (response.status === 201 || response.status === 200) {
        if (data?.status === 'received' && typeof data.reference === 'string' && REFERENCE.test(data.reference)) {
          key = null; print = null;
          return { kind: 'saved', reference: data.reference, confirmationEmail: data.confirmationEmail === 'submitted' ? 'submitted' : 'pending', replay: response.status === 200 };
        }
        return { kind: 'unknown', retryAfter: 0 };
      }
      if (response.status === 422) {
        const fields = {};
        for (const [name, codes] of Object.entries(data?.error?.fields || {})) {
          const first = Array.isArray(codes) ? codes[0] : codes;
          if (name === 'turnstileToken') return { kind: 'verify' };
          if (name === 'idempotencyKey') { key = null; print = null; fields._form = 'invalid'; continue; }
          fields[FIELD_OF[name] || '_form'] = CODES.has(first) ? first : 'invalid';
        }
        if (!Object.keys(fields).length) fields._form = 'invalid';
        return { kind: 'invalid', fields };
      }
      if (response.status === 409) { key = null; print = null; return { kind: 'conflict' }; }
      if (response.status === 403 && code === 'verification_failed') return { kind: 'verify' };
      if (response.status === 429) return { kind: 'rate', retryAfter };
      if (response.status === 503 || response.status >= 500) return { kind: 'unknown', retryAfter };
      // 400 invalid_json, 403 origin_not_allowed, 413, 415 and anything else: this page cannot send the request as it is
      return { kind: 'rejected', code: typeof code === 'string' ? code : '' };
    })().finally(() => { clearTimeout(timer); pending = null; });
    return pending;
  }
  return { loadConfig, submit, get key() { return key; } };
}
