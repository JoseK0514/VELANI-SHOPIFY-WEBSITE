// Velani assistant: the chat panel on every page. Talks to the Velani AI service through the headless client.
// The API address comes from the theme setting; the client keeps the session token in memory only.
import { VelaniAssistant, safeSourceUrl } from './velani-assistant.js';
(() => {
 const root = document.getElementById('ast-root'); if (!root) return;
 const api = (root.dataset.api || '').trim(); if (!api) return;
 const $ = id => document.getElementById(id);
 const launch = $('ast-launch'), panel = $('ast'), body = $('ast-body'), intro = $('ast-intro'), log = $('ast-log'), form = $('ast-form'), input = $('ast-in'), send = $('ast-send');
 const status = $('ast-status'), statusT = $('ast-status-t'), retryBtn = $('ast-retry'), discardBtn = $('ast-discard'), verify = $('ast-verify'), confirm = $('ast-confirm');
 const T = {
  en: { launch: 'Ask about NEVORA', title: 'Velani assistant', sub: 'Answers about NEVORA and our work', lede: 'Ask about scheduling, the time clock, payroll calculation or the software we build.', ask: 'Ask a question', send: 'Send', close: 'Close', del: 'Delete this conversation', confirm: 'Delete this conversation from our servers?', yes: 'Delete', keep: 'Keep', verify: 'Checking that your browser is not an automated program…', note: 'AI assistant. Answers can be wrong, and product details may change. Conversations are kept for up to 30 days.', privacy: 'Privacy notice', retry: 'Retry', discard: 'Discard', label: 'Your question',
   sugg: ['How does the time clock work?', 'How does my business get NEVORA?', 'Do you build custom software?'],
   sources: 'Sources', demo: 'Try the time clock', quote: 'Ask for a quote', support: 'NEVORA support', contact: 'Contact us', unsent: 'Not sent', deleted: 'The conversation was deleted. Enquiries sent through the contact form are kept separately.',
   unavailable: 'The assistant is not available right now. Write to support@thevelani.com or use the contact page.', expired: 'This conversation expired. Send your message again to start a new one.', waitUntil: 'Retry available in', seconds: 's', thinking: 'Thinking…' },
  es: { launch: 'Pregunta sobre NEVORA', title: 'Asistente de Velani', sub: 'Respuestas sobre NEVORA y nuestro trabajo', lede: 'Pregunta sobre horarios, el reloj de entrada, el cálculo de nómina o el software que desarrollamos.', ask: 'Escribe una pregunta', send: 'Enviar', close: 'Cerrar', del: 'Eliminar esta conversación', confirm: '¿Eliminar esta conversación de nuestros servidores?', yes: 'Eliminar', keep: 'Conservar', verify: 'Comprobando que tu navegador no es un programa automatizado…', note: 'Asistente de IA. Las respuestas pueden contener errores y los detalles del producto pueden cambiar. Las conversaciones se conservan hasta 30 días.', privacy: 'Aviso de privacidad', retry: 'Reintentar', discard: 'Descartar', label: 'Tu pregunta',
   sugg: ['¿Cómo funciona el reloj de entrada?', '¿Cómo obtiene NEVORA mi negocio?', '¿Desarrollan software a la medida?'],
   sources: 'Fuentes', demo: 'Probar el reloj de entrada', quote: 'Pedir una cotización', support: 'Soporte de NEVORA', contact: 'Contáctanos', unsent: 'No enviado', deleted: 'La conversación se eliminó. Las consultas enviadas por el formulario de contacto se conservan por separado.',
   unavailable: 'El asistente no está disponible en este momento. Escribe a support@thevelani.com o usa la página de contacto.', expired: 'Esta conversación caducó. Envía tu mensaje de nuevo para empezar otra.', waitUntil: 'Podrás reintentar en', seconds: 's', thinking: 'Pensando…' },
 };
 let locale = 'en', assistant = null, config = null, configPromise = null, started = false, pendingMsg = null, countdown = 0, wasOpen = false;
 const t = key => T[locale][key];
 const small = matchMedia('(max-width:600px)'), coarse = matchMedia('(hover:none)');

 // ---------- text in the chosen language
 const applyLocale = () => {
  panel.lang = locale; launch.lang = locale;
  $('ast-launch-t').textContent = t('launch'); launch.setAttribute('aria-label', t('launch'));
  $('ast-t').textContent = t('title'); $('ast-sub').textContent = t('sub'); $('ast-lede').textContent = t('lede');
  input.placeholder = t('ask'); $('ast-in-l').textContent = t('label'); send.setAttribute('aria-label', t('send'));
  $('ast-close').setAttribute('aria-label', t('close')); $('ast-clear').setAttribute('aria-label', t('del'));
  $('ast-confirm-t').textContent = t('confirm'); $('ast-confirm-yes').textContent = t('yes'); $('ast-confirm-no').textContent = t('keep');
  $('ast-verify-t').textContent = t('verify'); $('ast-note-t').textContent = t('note'); $('ast-note-a').textContent = t('privacy');
  retryBtn.textContent = t('retry'); discardBtn.textContent = t('discard');
  const sugg = $('ast-sugg'); sugg.replaceChildren(...t('sugg').map(q => { const b = document.createElement('button'); b.type = 'button'; b.textContent = q; b.addEventListener('click', () => { input.value = q; submit(); }); return b; }));
  document.querySelectorAll('#ast-lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.locale === locale)));
 };
 document.querySelectorAll('#ast-lang button').forEach(b => b.addEventListener('click', () => {
  if (started || b.dataset.locale === locale) return;
  locale = b.dataset.locale; assistant = null; applyLocale(); clearStatus(); input.focus();
 }));

 // ---------- open and close
 const open = () => {
  panel.hidden = false; launch.setAttribute('aria-expanded', 'true'); requestAnimationFrame(() => panel.classList.add('in'));
  if (small.matches) document.body.style.overflow = 'hidden';
  (coarse.matches ? $('ast-head-t') : input).focus({ preventScroll: true });
  loadConfig();
 };
 const close = () => {
  panel.classList.remove('in'); panel.hidden = true; launch.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; launch.focus({ preventScroll: true });
 };
 launch.addEventListener('click', open); $('ast-close').addEventListener('click', close);
 panel.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); close(); } });
 small.addEventListener('change', () => { document.body.style.overflow = small.matches && !panel.hidden ? 'hidden' : ''; });

 // ---------- the service
 const loadConfig = () => {
  if (configPromise) return configPromise;
  configPromise = fetch(api + '/v1/config', { cache: 'no-store', credentials: 'omit' }).then(r => { if (!r.ok) throw new Error('config'); return r.json(); })
   .then(c => { config = c; setEnabled(true); return c; })
   .catch(() => { configPromise = null; setEnabled(false); showStatus(t('unavailable'), 'error'); return null; });
  return configPromise;
 };
 const setEnabled = on => { input.disabled = !on; updateSend(); };
 const getAssistant = () => assistant || (assistant = new VelaniAssistant({ apiBaseUrl: api, locale, getCaptchaToken: captchaToken }));

 // ---------- Cloudflare Turnstile: a token is needed once, when the conversation starts
 const captcha = { widget: null, token: null, at: 0, waiting: null, script: null };
 const loadTurnstile = () => captcha.script || (captcha.script = new Promise((resolve, reject) => {
  if (window.turnstile) return resolve();
  const s = document.createElement('script'); s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; s.async = true;
  s.onload = () => resolve(); s.onerror = () => { captcha.script = null; reject(new Error('turnstile')); }; document.head.append(s);
 }));
 const nextToken = () => new Promise((resolve, reject) => {
  const timer = setTimeout(() => { captcha.waiting = null; reject(new Error('timeout')); }, 120000);
  captcha.waiting = { resolve: token => { clearTimeout(timer); resolve(token); }, reject: err => { clearTimeout(timer); reject(err); } };
 });
 async function captchaToken() {
  const c = config || await loadConfig(); if (!c) throw new Error('config');
  if (!c.requireCaptcha) return undefined;
  if (!c.turnstileSiteKey) throw new Error('site key');
  if (captcha.token && Date.now() - captcha.at < 240000) { const token = captcha.token; captcha.token = null; return token; }
  verify.hidden = false;
  try {
   await loadTurnstile();
   const waiting = nextToken();
   if (captcha.widget === null) {
    captcha.widget = window.turnstile.render('#ast-turnstile', { sitekey: c.turnstileSiteKey, action: 'velani-session', language: locale, appearance: 'interaction-only',
     callback: token => { captcha.token = token; captcha.at = Date.now(); captcha.waiting?.resolve(token); captcha.waiting = null; },
     'expired-callback': () => { captcha.token = null; }, 'error-callback': () => { captcha.waiting?.reject(new Error('challenge')); captcha.waiting = null; } });
   } else window.turnstile.reset(captcha.widget);
   const token = await waiting; captcha.token = null; return token;
  } finally { verify.hidden = true; }
 }

 // ---------- messages
 const scroll = () => { body.scrollTop = body.scrollHeight; };
 const addYou = text => { const li = document.createElement('div'); li.className = 'ast-msg you'; li.textContent = text; log.append(li); intro.hidden = true; scroll(); return li; };
 const addWait = () => { const li = document.createElement('div'); li.className = 'ast-wait'; li.setAttribute('aria-hidden', 'true'); li.append(...[0, 1, 2].map(() => document.createElement('i'))); log.append(li); log.setAttribute('aria-busy', 'true'); scroll(); return li; };
 const addAnswer = answer => {
  const li = document.createElement('div'); li.className = 'ast-msg ai';
  for (const para of String(answer.message).split(/\n{2,}/)) {
   const p = document.createElement('p'); const lines = para.split('\n');
   lines.forEach((line, i) => { if (i) p.append(document.createElement('br')); p.append(document.createTextNode(line)); }); li.append(p);
  }
  const sources = (answer.sources || []).map(s => ({ title: s.title, url: safeSourceUrl(s.url) })).filter(s => s.url);
  if (sources.length) {
   const p = document.createElement('p'); p.className = 'ast-src'; p.append(document.createTextNode(t('sources') + ': '));
   sources.forEach((s, i) => { if (i) p.append(document.createTextNode(' · ')); const a = document.createElement('a'); a.href = s.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = s.title; p.append(a); });
   li.append(p);
  }
  const act = action(answer, sources); if (act) { const d = document.createElement('div'); d.className = 'ast-acts'; d.append(act); li.append(d); }
  log.append(li); log.removeAttribute('aria-busy'); scroll(); return li;
 };
 const action = (answer, sources) => {
  const a = document.createElement('a');
  if (answer.action === 'show_demo') { const here = !!document.getElementById('try'); a.href = here ? '#try' : '/pages/nevora#try'; a.textContent = t('demo'); if (here) a.addEventListener('click', () => close()); return a; }
  if (answer.action === 'lead_form') { a.href = '/pages/contact?interest=nevora'; a.textContent = t('quote'); return a; }
  if (answer.action === 'human_help') { const support = sources.some(s => /nevora-support/.test(s.url)); a.href = support ? '/pages/nevora-support' : '/pages/contact?interest=nevora'; a.textContent = support ? t('support') : t('contact'); return a; }
  return null;
 };

 // ---------- status line, retry and discard
 const clearStatus = () => { status.hidden = true; statusT.textContent = ''; retryBtn.hidden = true; discardBtn.hidden = true; clearInterval(countdown); };
 const showStatus = (text, kind = 'error') => { status.hidden = false; status.dataset.kind = kind; statusT.textContent = text; };
 const failed = error => {
  if (error.code === 'expired') { getAssistant().discardFailedRequest(); getAssistant().forgetLocally(); started = false; showStatus(t('expired'), 'info'); if (pendingMsg) { pendingMsg.removeAttribute('data-unsent'); pendingMsg = null; } return; }
  showStatus(error.message, 'error');
  const f = getAssistant().failedRequest;
  if (f?.retryable) {
   retryBtn.hidden = false; discardBtn.hidden = false;
   const wait = () => { const left = Math.ceil((f.retryAt - Date.now()) / 1000); if (left > 0) { retryBtn.disabled = true; retryBtn.textContent = t('retry') + ' (' + left + t('seconds') + ')'; } else { retryBtn.disabled = false; retryBtn.textContent = t('retry'); clearInterval(countdown); } };
   clearInterval(countdown); wait(); if (f.retryAt > Date.now()) countdown = setInterval(wait, 1000);
  } else { discardBtn.hidden = false; }
  if (error.code === 'captcha') verify.hidden = false;
 };
 retryBtn.addEventListener('click', async () => {
  if (retryBtn.disabled) return; clearStatus(); const wait = addWait(); updateSend();
  try { const answer = await getAssistant().retryLastRequest(); wait.remove(); if (pendingMsg) { pendingMsg.removeAttribute('data-unsent'); pendingMsg = null; } if (answer?.message !== undefined) { started = true; $('ast-clear').hidden = false; addAnswer(answer); } }
  catch (error) { wait.remove(); log.removeAttribute('aria-busy'); failed(error); }
  updateSend();
 });
 discardBtn.addEventListener('click', () => { try { getAssistant().discardFailedRequest(); } catch {} if (pendingMsg) { pendingMsg.remove(); pendingMsg = null; } clearStatus(); if (!log.children.length) intro.hidden = false; updateSend(); input.focus(); });

 // ---------- sending
 const updateSend = () => { send.disabled = input.disabled || !input.value.trim() || (assistant?.busy ?? false) || !!assistant?.failedRequest; };
 const grow = () => { input.style.height = 'auto'; input.style.height = Math.min(140, input.scrollHeight) + 'px'; };
 input.addEventListener('input', () => { grow(); updateSend(); });
 input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); submit(); } });
 async function submit() {
  const text = input.value.trim(); if (!text || input.disabled) return;
  const a = getAssistant(); if (a.busy || a.failedRequest) return;
  clearStatus(); input.value = ''; grow(); updateSend();
  pendingMsg = addYou(text); pendingMsg.setAttribute('data-unsent', ''); const wait = addWait(); updateSend();
  try { const answer = await a.chat(text); wait.remove(); pendingMsg.removeAttribute('data-unsent'); pendingMsg = null; started = true; $('ast-clear').hidden = false; addAnswer(answer); }
  catch (error) { wait.remove(); log.removeAttribute('aria-busy'); failed(error); }
  updateSend(); if (!coarse.matches) input.focus();
 }
 form.addEventListener('submit', e => { e.preventDefault(); submit(); });

 // ---------- deleting the conversation on the server
 $('ast-clear').addEventListener('click', () => { confirm.hidden = false; scroll(); $('ast-confirm-yes').focus(); });
 $('ast-confirm-no').addEventListener('click', () => { confirm.hidden = true; $('ast-clear').focus(); });
 $('ast-confirm-yes').addEventListener('click', async () => {
  confirm.hidden = true; clearStatus();
  try { await getAssistant().deleteSession(); log.replaceChildren(); started = false; pendingMsg = null; $('ast-clear').hidden = true; intro.hidden = false; showStatus(t('deleted'), 'info'); input.focus(); }
  catch (error) { failed(error); }
  updateSend();
 });

 applyLocale(); root.hidden = false;
 window.__velaniAssistant = { get locale() { return locale; } };
})();
