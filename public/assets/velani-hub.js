// The client request form on Support (new work or help): sends to the Velani client hub as JSON, never through Shopify.
// On an unpublished theme and in the local preview it checks the draft and sends nothing. Nothing typed here is written to
// a URL, the console, analytics or browser storage.
import { validateHub, createHubClient, isHubTopic, HUB_LIMITS } from './client-hub.js';

const STRINGS = {
  en: {
    errors: { name: { required: 'Enter your name.' }, email: { required: 'Enter an email address we can reply to.', invalid: 'Enter an email address we can reply to.' },
      project: { required: 'Tell us which website or app this is about.' }, message: { required: ['Tell us what you need.', 'Tell us what happened.'], too_short: 'Write at least ' + HUB_LIMITS.descriptionMin + ' characters.' } },
    tooLong: n => 'Use ' + n + ' characters or fewer.', oneLine: 'Use one line of plain text.', check: 'Check this field.',
    one: '1 field needs attention: ', many: n => n + ' fields need attention: ',
    status: { checking: 'Checking your draft…', verifying: 'Running a quick security check…', sending: 'Sending your request…',
      conflict: 'This request changed after it was first sent, so we could not match the two. Nothing new was saved. Send it again and it will go as a new request.',
      verify: 'The security check did not finish, so nothing was sent. Your request is still here. Send it again.',
      rate: wait => 'Too many requests for now. Your request is still here. Try again ' + wait + '.',
      unknown: wait => 'We could not confirm that your request was saved. Your request is still here. Try again' + (wait ? ' ' + wait : '') + '. Sending it again will not create a duplicate.',
      rejected: 'This request could not be sent from this page, and nothing was saved. Please write to support@thevelani.com.',
      form: 'We could not read this request. Check the fields and send it again.' },
    wait: s => s < 90 ? 'in about a minute' : s < 5400 ? 'in about ' + Math.round(s / 60) + ' minutes' : 'in about ' + Math.round(s / 3600) + ' hours',
    retry: 'Try again', savedH: 'Request received.', savedTitle: 'Request received',
    submitted: 'A confirmation email is on its way to you.', pending: 'We saved your request. The confirmation email may take a little longer.',
    next: { 'client-work': 'We reply by email within two business days. Paid work starts only after you approve a written quote.', 'client-help': 'We reply by email within two business days. If you can’t work, write to support@thevelani.com, Monday to Friday, 8 am to 9 pm ET.' },
    refK: 'Your reference', sampleK: 'Sample reference', copied: 'Reference copied.', copyFailed: 'Select the reference to copy it.',
  },
  es: {
    errors: { name: { required: 'Escribe tu nombre.' }, email: { required: 'Escribe un correo electrónico al que podamos responderte.', invalid: 'Escribe un correo electrónico al que podamos responderte.' },
      project: { required: 'Dinos de qué sitio web o app se trata.' }, message: { required: ['Cuéntanos qué necesitas.', 'Cuéntanos qué pasó.'], too_short: 'Escribe al menos ' + HUB_LIMITS.descriptionMin + ' caracteres.' } },
    tooLong: n => 'Usa ' + n + ' caracteres o menos.', oneLine: 'Usa una sola línea de texto.', check: 'Revisa este campo.',
    one: '1 campo necesita atención: ', many: n => n + ' campos necesitan atención: ',
    status: { checking: 'Revisando tu borrador…', verifying: 'Haciendo una comprobación de seguridad rápida…', sending: 'Enviando tu solicitud…',
      conflict: 'Esta solicitud cambió después del primer envío y no pudimos relacionar las dos. No se guardó nada nuevo. Envíala otra vez y saldrá como una solicitud nueva.',
      verify: 'La comprobación de seguridad no terminó, así que no se envió nada. Tu solicitud sigue aquí. Envíala otra vez.',
      rate: wait => 'Hay demasiadas solicitudes por ahora. Tu solicitud sigue aquí. Inténtalo de nuevo ' + wait + '.',
      unknown: wait => 'No pudimos confirmar que tu solicitud se guardó. Tu solicitud sigue aquí. Inténtalo de nuevo' + (wait ? ' ' + wait : '') + '. Enviarla otra vez no crea un duplicado.',
      rejected: 'Esta solicitud no se pudo enviar desde esta página y no se guardó nada. Escríbenos a support@thevelani.com.',
      form: 'No pudimos leer esta solicitud. Revisa los campos y envíala otra vez.' },
    wait: s => s < 90 ? 'en un minuto aproximadamente' : s < 5400 ? 'en unos ' + Math.round(s / 60) + ' minutos' : 'en unas ' + Math.round(s / 3600) + ' horas',
    retry: 'Intentar de nuevo', savedH: 'Solicitud recibida.', savedTitle: 'Solicitud recibida',
    submitted: 'Te enviamos un correo de confirmación.', pending: 'Guardamos tu solicitud. El correo de confirmación puede tardar un poco más.',
    next: { 'client-work': 'Te respondemos por correo en un plazo de dos días laborables. El trabajo con costo empieza solo después de que apruebes una cotización por escrito.', 'client-help': 'Te respondemos por correo en un plazo de dos días laborables. Si no puedes trabajar, escribe a support@thevelani.com, de lunes a viernes, de 8 am a 9 pm ET.' },
    refK: 'Tu referencia', sampleK: 'Referencia de ejemplo', copied: 'Referencia copiada.', copyFailed: 'Selecciona la referencia para copiarla.',
  },
};
const FIXTURES = ['sent', 'pending', 'conflict', 'rate', 'unavailable', 'verify', 'unknown', 'invalid', 'verifying', 'sending'];
const SAMPLE = 'VEL-0000-0000';

export function initHubForm(form, sent, deps = {}) {
  const lang = /^es\b/i.test(document.documentElement.lang) ? 'es' : 'en', L = STRINGS[lang];
  const live = form.dataset.hub === 'live';
  // Review states (#hub-state=pending and so on) exist only where the page says so: never on the published theme
  const wanted = !live && form.hasAttribute('data-hub-fixtures') ? (/^#hub-state=([a-z]+)$/.exec(location.hash) || [])[1] : '';
  const fixture = FIXTURES.includes(wanted) ? wanted : '';
  const client = live && !fixture ? (deps.createClient || createHubClient)({ api: form.dataset.hubApi }) : null;
  const fieldset = form.querySelector('fieldset'), button = form.querySelector('[data-inquiry-submit]'), status = form.querySelector('.form-status'), off = form.querySelector('[data-hub-off]');
  const fields = Object.fromEntries(['name', 'email', 'company', 'project', 'message', 'interest', 'timing', 'urgency'].map(key => [key, form.querySelector('#inquiry-' + key)]));
  form.querySelector('.client-send').before(status); // the summary sits directly above the Send button
  const shown = ['name', 'email', 'company', 'project', 'message'];
  const read = () => Object.fromEntries(Object.entries(fields).map(([key, input]) => [key, input && !input.closest('[data-k][hidden]') ? input.value : '']));
  const print = values => JSON.stringify(values);
  const kindKey = () => fields.interest.value === 'client-help' ? 'help' : 'work';

  // Two kinds of request share the form: the choice sets the topic, the wording, and timing or urgency
  const kinds = [...form.querySelectorAll('input[name="client_kind"]')];
  const setKind = value => { const key = value === 'client-help' ? 'help' : 'work'; fields.interest.value = value; kinds.forEach(r => { r.checked = r.value === value; });
    form.querySelectorAll('[data-k]').forEach(el => { el.hidden = el.dataset.k !== key; el.querySelectorAll('select').forEach(s => { s.disabled = el.hidden; }); });
    fields.project.required = key === 'help'; };
  kinds.forEach(r => r.addEventListener('change', () => { if (r.checked) { setKind(r.value); edited(); } }));
  const asked = new URL(location.href).searchParams.get('interest');
  setKind(isHubTopic(asked) ? asked : 'client-work');

  // ---------- errors beside each field, and the summary above the button
  let tried = false, retryLabel = false, waitTimer = null, busy = false;
  const errorText = (key, code) => { const own = L.errors[key]?.[code]; if (own) return Array.isArray(own) ? own[kindKey() === 'help' ? 1 : 0] : own;
    if (code === 'too_long') return L.tooLong(key === 'message' ? fields.message.maxLength : HUB_LIMITS[key]); if (code === 'invalid' && key !== 'email') return L.oneLine; return L.check; };
  const labelOf = key => { const l = form.querySelector('label[for="' + fields[key].id + '"]'); const c = l.cloneNode(true); c.querySelectorAll('[hidden],.opt').forEach(n => n.remove()); return c.textContent.replace(/\s+/g, ' ').trim(); };
  function showErrors(errors) {
    for (const key of shown) { const p = form.querySelector('#error-' + key); p.textContent = errors[key] ? errorText(key, errors[key]) : '';
      if (errors[key]) fields[key].setAttribute('aria-invalid', 'true'); else fields[key].removeAttribute('aria-invalid'); }
  }
  const say = (state, text, alert = false) => { status.dataset.state = state; status.setAttribute('role', alert ? 'alert' : 'status'); status.textContent = text; };
  function summarize(errors) {
    const keys = shown.filter(k => errors[k]);
    if (!keys.length) { if (status.dataset.state === 'invalid') say('', ''); return; }
    const names = keys.map(labelOf).join(', ');
    say('invalid', (keys.length === 1 ? L.one : L.many(keys.length)) + names + (/[?!.]$/.test(names) ? '' : '.'), true);
  }
  let serverErrors = {};
  const check = () => { const checked = validateHub(read()); const errors = { ...checked.errors }; for (const k of Object.keys(serverErrors)) if (!errors[k]) errors[k] = serverErrors[k]; return { ...checked, errors, valid: checked.valid }; };
  // While the security check runs and while the request is on its way, every field and both request kinds are locked,
  // so what is sent is exactly what was checked. They open again with the outcome, values kept.
  const controls = [...form.querySelectorAll('input:not([type="hidden"]), textarea, select')]; let locked = false;
  function lock(on) { if (on === locked) return; locked = on; fieldset.classList.toggle('is-locked', on); fieldset.setAttribute('aria-busy', String(on));
    for (const el of controls) { if (el.matches('textarea, input:not([type="radio"])')) el.readOnly = on; else if (on) { el.dataset.wasOff = String(el.disabled); el.disabled = true; } else { el.disabled = el.dataset.wasOff === 'true'; delete el.dataset.wasOff; } } }
  const setButton = () => { lock(busy); button.disabled = busy || !!waitTimer; form.setAttribute('aria-busy', String(busy));
    button.querySelectorAll('[data-k]').forEach(el => { el.hidden = retryLabel || el.dataset.k !== kindKey(); });
    let r = button.querySelector('[data-retry]'); if (!r) { r = document.createElement('span'); r.dataset.retry = ''; r.textContent = L.retry; button.append(r); } r.hidden = !retryLabel; };
  // Any edit starts a new logical submission: a server error on that field is gone, the retry wording and any wait end
  function edited(event) {
    const key = event && Object.keys(fields).find(k => fields[k] === event.target); if (key) delete serverErrors[key];
    if (retryLabel || ['conflict', 'verify', 'unknown', 'form', 'rejected'].includes(status.dataset.state)) { retryLabel = false; if (status.dataset.state !== 'invalid') say('', ''); }
    setButton();
    if (tried) { const c = check(); showErrors(c.errors); summarize(c.errors); }
  }
  form.addEventListener('input', edited); form.addEventListener('change', edited);
  form.addEventListener('focusout', () => { if (tried) { const c = check(); showErrors(c.errors); summarize(c.errors); } });
  const minH = parseInt(fields.message.dataset.min || '150', 10);
  fields.message.addEventListener('input', () => { fields.message.style.height = 'auto'; fields.message.style.height = Math.min(600, Math.max(minH, fields.message.scrollHeight)) + 'px'; });

  // ---------- unavailable: the form stays off, with the address to write to as plain selectable text
  function turnOff() { fieldset.disabled = true; fieldset.hidden = true; off.hidden = false; say('', ''); const note = form.querySelector('.client-preview'); if (note) note.hidden = true; }

  // ---------- Cloudflare Turnstile, the way the assistant loads it, with the client hub's own site key and action
  const captcha = { widget: null, waiting: null, script: null };
  const loadTurnstile = () => captcha.script || (captcha.script = new Promise((resolve, reject) => {
    if (window.turnstile) return resolve();
    const s = document.createElement('script'); s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; s.async = true;
    const fail = () => { clearTimeout(timer); captcha.script = null; s.remove(); reject(new Error('turnstile')); };
    const timer = setTimeout(fail, 15000);
    s.onload = () => { clearTimeout(timer); window.turnstile ? resolve() : fail(); }; s.onerror = fail; document.head.append(s);
  }));
  async function freshToken(config) {
    await loadTurnstile();
    const waiting = new Promise((resolve, reject) => { const timer = setTimeout(() => { captcha.waiting = null; reject(new Error('timeout')); }, 120000);
      captcha.waiting = { resolve: t => { clearTimeout(timer); resolve(t); }, reject: e => { clearTimeout(timer); reject(e); } }; });
    const stop = why => () => { captcha.waiting?.reject(new Error(why)); captcha.waiting = null; };
    if (captcha.widget === null) captcha.widget = window.turnstile.render('#hub-turnstile', { sitekey: config.turnstileSiteKey, action: config.turnstileAction, language: lang, appearance: 'interaction-only',
      callback: token => { captcha.waiting?.resolve(token); captcha.waiting = null; }, 'error-callback': stop('challenge'), 'timeout-callback': stop('challenge timeout'), 'unsupported-callback': stop('unsupported') });
    else window.turnstile.reset(captcha.widget);
    return waiting;
  }

  // ---------- the saved panel: the reference, and what happens next
  function showSaved(result, topic, preview) {
    sent.querySelector('[data-sent-h]').textContent = L.savedH;
    sent.querySelector('[data-sent-p]').textContent = (result.confirmationEmail === 'submitted' ? L.submitted : L.pending) + ' ' + L.next[topic];
    const note = sent.querySelector('[data-sent-preview]'); if (note) note.hidden = !preview;
    const ref = sent.querySelector('[data-sent-ref]'), value = ref.querySelector('[data-ref]'), copy = ref.querySelector('[data-ref-copy]'), said = ref.querySelector('[data-ref-live]');
    ref.querySelector('.sent-ref-k').textContent = preview ? L.sampleK : L.refK; value.textContent = result.reference; ref.hidden = false;
    copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(result.reference); said.textContent = L.copied; }
      catch { const range = document.createRange(); range.selectNodeContents(value); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(range); said.textContent = L.copyFailed; } });
    document.title = L.savedTitle + ' · Velani';
    form.hidden = true; sent.hidden = false; sent.scrollIntoView({ block: 'center' }); sent.focus({ preventScroll: true });
  }

  function holdFor(seconds) { clearTimeout(waitTimer); waitTimer = null; if (seconds > 0) waitTimer = setTimeout(() => { waitTimer = null; setButton(); }, Math.min(seconds, 3600) * 1000); }
  function outcome(result, topic, preview) {
    busy = false;
    if (result.kind === 'saved') { setButton(); return showSaved(result, topic, preview); }
    if (result.kind === 'invalid') {
      serverErrors = Object.fromEntries(Object.entries(result.fields).filter(([k]) => shown.includes(k)));
      tried = true; const c = check(); showErrors(c.errors); setButton();
      const first = shown.find(k => c.errors[k]);
      if (first) { summarize(c.errors); fields[first].focus(); } else { say('form', L.status.form, true); status.focus(); }
      return;
    }
    if (result.kind === 'rate') { holdFor(result.retryAfter || 60); say('rate', L.status.rate(L.wait(result.retryAfter || 60)), true); }
    else if (result.kind === 'unknown') { retryLabel = true; holdFor(result.retryAfter); say('unknown', L.status.unknown(result.retryAfter ? L.wait(result.retryAfter) : ''), true); }
    else if (result.kind === 'conflict') say('conflict', L.status.conflict, true);
    else if (result.kind === 'verify') say('verify', L.status.verify, true);
    else say('rejected', L.status.rejected, true);
    setButton(); status.focus();
  }
  const FIXTURE_RESULT = { sent: { kind: 'saved', reference: SAMPLE, confirmationEmail: 'submitted' }, pending: { kind: 'saved', reference: SAMPLE, confirmationEmail: 'pending' }, conflict: { kind: 'conflict' }, rate: { kind: 'rate', retryAfter: 900 },
    verify: { kind: 'verify' }, unknown: { kind: 'unknown', retryAfter: 0 }, invalid: { kind: 'invalid', fields: { email: 'invalid', project: 'required' } } };

  let config = null;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || waitTimer) return;
    const checked = validateHub(read()); serverErrors = {};
    showErrors(checked.errors);
    if (!checked.valid) { tried = true; summarize(checked.errors); fields[shown.find(k => checked.errors[k])]?.focus(); return; }
    const topic = fields.interest.value;
    busy = true; setButton();
    if (!client) {
      // Preview: the draft is checked and nothing is sent. A review state from the address shows instead when one is named.
      say('checking', L.status.checking);
      if (fixture === 'verifying' || fixture === 'sending') { say(fixture, L.status[fixture]); return; }
      await new Promise(resolve => setTimeout(resolve, 300));
      say('', ''); return outcome(FIXTURE_RESULT[fixture] || FIXTURE_RESULT.sent, topic, true);
    }
    say('verifying', L.status.verifying);
    config = await config;
    if (!config?.available) { busy = false; setButton(); return turnOff(); }
    let token;
    try { token = await freshToken(config); } catch { return outcome({ kind: 'verify' }, topic, false); }
    // Second guard behind the lock: if anything changed while the check ran, nothing is sent. The form is checked again
    // and the next Send starts a new submission with a new key.
    const now = validateHub(read());
    if (print(now.values) !== print(checked.values)) { busy = false; say('', ''); setButton(); tried = true; showErrors(now.errors); summarize(now.errors); return; }
    say('sending', L.status.sending);
    outcome(await client.submit(checked.values, { language: lang, turnstileToken: token }), topic, false);
  });

  // ---------- start: ask the client hub whether requests are open (live only); a preview asks nothing
  if (fixture === 'unavailable') { turnOff(); form.scrollIntoView({ block: 'center' }); return; }
  fieldset.disabled = false; setButton();
  if (fixture) form.scrollIntoView({ block: 'center' });
  if (client) { config = client.loadConfig(); config.then(c => { if (!c.available) turnOff(); });
    // The security check's script loads when the visitor first enters the form, so Send does not wait for it
    form.addEventListener('focusin', () => { Promise.resolve(config).then(c => { if (c?.available) loadTurnstile().catch(() => {}); }); }, { once: true }); }
}
