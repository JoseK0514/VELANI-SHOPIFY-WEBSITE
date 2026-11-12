// Rondo, Velani's AI adviser: the chat panel on every page. Talks to the Velani AI service through the headless client.
// The API address comes from the theme setting; the client keeps the session token in memory only.
// Answers are complete (not streamed), so the panel shows an honest "thinking" state, never fake typing.
import { VelaniAssistant, safeSourceUrl } from './velani-assistant.js?v=add851a64a';
(() => {
 const root = document.getElementById('ast-root'); if (!root) return;
 const api = (root.dataset.api || '').trim(); if (!api) return;
 const $ = id => document.getElementById(id);
 const launch = $('ast-launch'), panel = $('ast'), body = $('ast-body'), intro = $('ast-intro'), log = $('ast-log'), form = $('ast-form'), input = $('ast-in'), send = $('ast-send');
 const status = $('ast-status'), statusT = $('ast-status-t'), retryBtn = $('ast-retry'), discardBtn = $('ast-discard'), contactLink = $('ast-contact'), verify = $('ast-verify'), confirm = $('ast-confirm'), clearBtn = $('ast-clear');
 const T = {
  en: { launch: 'Ask Rondo', launchLabel: 'Ask Rondo, Velani’s AI adviser', sub: ['AI adviser', ' · Velani and NEVORA'], hi: 'Hi, I’m {name}.', lede: 'I’m Velani’s AI adviser. Ask me about NEVORA, the free trial, or the websites and apps we build.', scope: 'I can’t see employee accounts, and I can’t make changes, bookings or payments.',
   ask: 'Ask Rondo a question', label: 'Your question for Rondo', send: 'Send', close: 'Close', del: 'Delete this conversation', lang: 'Language',
   confirm: 'Delete this conversation from our servers?', yes: 'Delete', keep: 'Keep',
   switchQ: 'Switch to Spanish? This conversation will be deleted and a new one started in Spanish.', switchYes: 'Switch', switchNo: 'Keep English', switched: 'New conversation in English.',
   verify: 'Checking that your browser is not an automated program…', note: 'Rondo is an AI and can be wrong. Product details may change. Conversations are kept for up to 30 days.', privacy: 'Privacy notice',
   retry: 'Retry', discard: 'Discard', edit: 'Edit question', contact: 'Contact page',
   sugg: ['How does the time clock work?', 'How does the free trial work?', 'Can you build our website or app?'],
   sources: 'Sources', newTab: '(opens in a new tab)', demo: 'Try the time clock', quote: 'Ask for a quote', support: 'NEVORA support', talk: 'Contact us',
   deleted: 'Conversation deleted. Enquiries sent through the contact form are kept separately.',
   unavailable: 'Rondo isn’t available right now. Write to support@thevelani.com or use the contact page.',
   expired: 'This conversation expired. Your question is back in the box: send it to start a new conversation.',
   thinking: 'Rondo is thinking…', slow: 'Still working. Answers can take up to 45 seconds.', verifying: 'Waiting for the verification below…', seconds: 's' },
  es: { launch: 'Pregúntale a Rondo', launchLabel: 'Pregúntale a Rondo, el asesor de IA de Velani', sub: ['Asesor de IA', ' · Velani y NEVORA'], hi: 'Hola, soy {name}.', lede: 'Soy el asesor de IA de Velani. Pregúntame sobre NEVORA, la prueba gratis o los sitios web y aplicaciones que desarrollamos.', scope: 'No puedo ver cuentas de empleados ni hacer cambios, reservas o pagos.',
   ask: 'Escribe tu pregunta para Rondo', label: 'Tu pregunta para Rondo', send: 'Enviar', close: 'Cerrar', del: 'Eliminar esta conversación', lang: 'Idioma',
   confirm: '¿Eliminar esta conversación de nuestros servidores?', yes: 'Eliminar', keep: 'Conservar',
   switchQ: '¿Cambiar a inglés? Esta conversación se eliminará y empezará una nueva en inglés.', switchYes: 'Cambiar', switchNo: 'Seguir en español', switched: 'Nueva conversación en español.',
   verify: 'Comprobando que tu navegador no es un programa automatizado…', note: 'Rondo es una IA y puede equivocarse. Los detalles del producto pueden cambiar. Las conversaciones se conservan hasta 30 días.', privacy: 'Aviso de privacidad',
   retry: 'Reintentar', discard: 'Descartar', edit: 'Editar pregunta', contact: 'Página de contacto',
   sugg: ['¿Cómo funciona el reloj de entrada?', '¿Cómo funciona la prueba gratis?', '¿Pueden crear nuestro sitio web o aplicación?'],
   sources: 'Fuentes', newTab: '(se abre en una pestaña nueva)', demo: 'Probar el reloj de entrada', quote: 'Pedir una cotización', support: 'Soporte de NEVORA', talk: 'Contáctanos',
   deleted: 'Conversación eliminada. Las consultas enviadas por el formulario de contacto se conservan por separado.',
   unavailable: 'Rondo no está disponible en este momento. Escribe a support@thevelani.com o usa la página de contacto.',
   expired: 'Esta conversación caducó. Tu pregunta está de nuevo en el cuadro: envíala para empezar una conversación nueva.',
   thinking: 'Rondo está pensando…', slow: 'Sigue trabajando. Las respuestas pueden tardar hasta 45 segundos.', verifying: 'Esperando la verificación de abajo…', seconds: 's' },
 };
 let locale = /^es\b/i.test(document.documentElement.lang) ? 'es' : 'en', assistant = null, config = null, configPromise = null, configFailed = false;
 let activeWait = null, started = false, pending = null, countdown = 0, confirmMode = 'delete', switchTo = null, name = 'Rondo';
 const t = key => { const v = T[locale][key]; return typeof v === 'string' ? v.replace('{name}', name) : v; };
 const small = matchMedia('(max-width:600px)'), coarse = matchMedia('(hover:none)');

 // ---------- text in the chosen language
 const applyLocale = () => {
  panel.lang = locale; launch.lang = locale;
  $('ast-launch-t').textContent = t('launch'); launch.setAttribute('aria-label', t('launchLabel'));
  $('ast-t').textContent = name; { const [lead, rest] = t('sub'); const x = document.createElement('span'); x.className = 'ast-sub-x'; x.textContent = rest; $('ast-sub').replaceChildren(lead, x); } $('ast-hi').textContent = t('hi'); $('ast-lede').textContent = t('lede'); $('ast-scope').textContent = t('scope');
  input.placeholder = t('ask'); $('ast-in-l').textContent = t('label'); send.setAttribute('aria-label', t('send'));
  $('ast-close').setAttribute('aria-label', t('close')); clearBtn.setAttribute('aria-label', t('del')); $('ast-lang').setAttribute('aria-label', t('lang'));
  $('ast-verify-t').textContent = t('verify'); $('ast-note-t').textContent = t('note'); $('ast-note-a').textContent = t('privacy');
  retryBtn.textContent = t('retry'); contactLink.textContent = t('contact');
  const sugg = $('ast-sugg'); sugg.replaceChildren(...t('sugg').map(q => { const b = document.createElement('button'); b.type = 'button'; b.textContent = q; b.addEventListener('click', () => { input.value = q; submit(); }); return b; }));
  document.querySelectorAll('#ast-lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.locale === locale)));
 };

 // ---------- open and close; on phones the panel covers the page, so focus stays inside it
 const open = () => {
  panel.hidden = false; launch.setAttribute('aria-expanded', 'true'); requestAnimationFrame(() => panel.classList.add('in'));
  if (small.matches) { document.body.style.overflow = 'hidden'; panel.setAttribute('aria-modal', 'true'); }
  (coarse.matches ? $('ast-head-t') : input).focus({ preventScroll: true });
  loadConfig();
 };
 const close = () => {
  panel.classList.remove('in'); panel.hidden = true; panel.removeAttribute('aria-modal'); launch.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; launch.focus({ preventScroll: true });
 };
 launch.addEventListener('click', open); $('ast-close').addEventListener('click', close);
 panel.addEventListener('keydown', e => {
  if (e.key === 'Escape') { e.preventDefault(); if (!confirm.hidden) hideConfirm(); else close(); return; }
  if (e.key === 'Tab' && small.matches) {
   const items = [...panel.querySelectorAll('button:not([disabled]):not([hidden]),a[href]:not([hidden]),textarea:not([disabled]),iframe,[tabindex="0"]')].filter(el => el.offsetParent !== null || el === input);
   // Move focus ourselves so it wraps inside the panel in every browser (Safari's Tab skips buttons by default)
   if (!items.length) return; e.preventDefault();
   const i = items.indexOf(document.activeElement), next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : (i + 1) % items.length;
   items[next].focus();
  }
 });
 // On phones the launcher stays out of the first screen (hero actions and the scroll cue live at its bottom edge) and steps aside while a page form field has the keyboard
 let fieldFocus = false;
 const tuck = () => root.classList.toggle('ast-tucked', small.matches && panel.hidden && (fieldFocus || window.scrollY < innerHeight * 0.6));
 addEventListener('scroll', tuck, { passive: true }); addEventListener('resize', tuck);
 document.addEventListener('focusin', e => { fieldFocus = !!e.target.closest?.('input,textarea,select') && !root.contains(e.target); tuck(); });
 document.addEventListener('focusout', () => { fieldFocus = false; requestAnimationFrame(tuck); });
 small.addEventListener('change', () => { tuck(); const on = small.matches && !panel.hidden; document.body.style.overflow = on ? 'hidden' : ''; if (on) panel.setAttribute('aria-modal', 'true'); else panel.removeAttribute('aria-modal'); });

 // ---------- the service
 const loadConfig = () => {
  if (configPromise) return configPromise;
  configPromise = fetch(api + '/v1/config', { cache: 'no-store', credentials: 'omit' }).then(r => { if (!r.ok) throw new Error('config'); return r.json(); })
   .then(c => {
    config = c; configFailed = false;
    if (typeof c.assistantName === 'string' && /^[\p{L} .'-]{1,40}$/u.test(c.assistantName.trim())) { name = c.assistantName.trim(); applyLocale(); }
    if (status.dataset.kind === 'config') clearStatus();
    setEnabled(true); return c;
   })
   .catch(() => { configPromise = null; configFailed = true; setEnabled(false); showStatus(t('unavailable'), 'config'); retryBtn.hidden = false; retryBtn.disabled = false; retryBtn.textContent = t('retry'); contactLink.hidden = false; return null; });
  return configPromise;
 };
 const setEnabled = on => { input.disabled = !on; updateSend(); };
 const getAssistant = () => assistant || (assistant = new VelaniAssistant({ apiBaseUrl: api, locale, getCaptchaToken: captchaToken }));

 // ---------- Cloudflare Turnstile: a fresh token is needed once, when a conversation starts
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
  verify.hidden = false; activeWait?.verifying();
  try {
   await loadTurnstile();
   const waiting = nextToken();
   if (captcha.widget === null) {
    captcha.widget = window.turnstile.render('#ast-turnstile', { sitekey: c.turnstileSiteKey, action: 'velani-session', language: locale, appearance: 'interaction-only',
     callback: token => { captcha.token = token; captcha.at = Date.now(); captcha.waiting?.resolve(token); captcha.waiting = null; },
     'expired-callback': () => { captcha.token = null; }, 'error-callback': () => { captcha.waiting?.reject(new Error('challenge')); captcha.waiting = null; } });
   } else window.turnstile.reset(captcha.widget);
   const token = await waiting; captcha.token = null; return token;
  } finally { verify.hidden = true; activeWait?.thinking(); }
 }

 // ---------- messages (answers are inserted as text; links only from validated sources)
 const scroll = () => { body.scrollTop = body.scrollHeight; };
 const addYou = text => { const li = document.createElement('div'); li.className = 'ast-msg you'; li.textContent = text; log.append(li); intro.hidden = true; scroll(); return li; };
 const addWait = () => {
  const li = document.createElement('div'); li.className = 'ast-wait'; li.setAttribute('role', 'status');
  const dots = document.createElement('span'); dots.className = 'ast-dots'; dots.setAttribute('aria-hidden', 'true'); dots.append(...[0, 1, 2].map(() => document.createElement('i')));
  const label = document.createElement('span'); li.append(dots, label);
  // Honest progress: while the visitor's browser is being verified nothing is being answered yet; the 45-second note starts only once the question is sent
  let slow = 0; const thinking = () => { label.textContent = t('thinking'); clearTimeout(slow); slow = setTimeout(() => { label.textContent = t('slow'); }, 10000); };
  li.verifying = () => { clearTimeout(slow); label.textContent = t('verifying'); }; li.thinking = thinking; thinking();
  li.done = () => { clearTimeout(slow); li.remove(); log.removeAttribute('aria-busy'); if (activeWait === li) activeWait = null; };
  log.append(li); log.setAttribute('aria-busy', 'true'); scroll(); activeWait = li; return li;
 };
 const addAnswer = answer => {
  const li = document.createElement('div'); li.className = 'ast-msg ai';
  const who = document.createElement('p'); who.className = 'ast-who'; who.textContent = name; li.append(who);
  for (const para of String(answer.message).split(/\n{2,}/)) {
   const p = document.createElement('p'); const lines = para.split('\n');
   lines.forEach((line, i) => { if (i) p.append(document.createElement('br')); p.append(document.createTextNode(line)); }); li.append(p);
  }
  const sources = (answer.sources || []).map(s => ({ title: String(s.title || '').slice(0, 120), url: safeSourceUrl(s.url) })).filter(s => s.url && s.title);
  if (sources.length) {
   const p = document.createElement('p'); p.className = 'ast-src'; p.append(document.createTextNode(t('sources') + ': '));
   sources.forEach((s, i) => { if (i) p.append(document.createTextNode(' · ')); const a = document.createElement('a'); a.href = s.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = s.title; const sr = document.createElement('span'); sr.className = 'sr'; sr.textContent = ' ' + t('newTab'); a.append(sr); p.append(a); });
   li.append(p);
  }
  const act = action(answer, sources); if (act) { const d = document.createElement('div'); d.className = 'ast-acts'; d.append(act); li.append(d); }
  log.append(li); scroll(); return li;
 };
 // Suggested next steps go only to pages that exist on this site; Rondo itself never books, sends or pays
 const action = (answer, sources) => {
  const a = document.createElement('a');
  if (answer.action === 'show_demo') { const here = !!document.getElementById('try'); a.href = here ? '#try' : '/pages/nevora#try'; a.textContent = t('demo'); if (here) a.addEventListener('click', () => close()); return a; }
  if (answer.action === 'lead_form') { a.href = '/pages/contact?interest=nevora'; a.textContent = t('quote'); return a; }
  if (answer.action === 'human_help') { const support = sources.some(s => /\/pages\/nevora-support\b/.test(s.url)); a.href = support ? '/pages/nevora-support' : '/pages/contact'; a.textContent = support ? t('support') : t('talk'); return a; }
  return null;
 };

 // ---------- status line: retry the same request, edit a rejected question, or discard
 const clearStatus = () => { status.hidden = true; delete status.dataset.kind; statusT.textContent = ''; retryBtn.hidden = true; discardBtn.hidden = true; contactLink.hidden = true; clearInterval(countdown); };
 const showStatus = (text, kind = 'error') => { status.hidden = false; status.dataset.kind = kind; statusT.textContent = text; };
 const restoreQuestion = () => { if (!pending) return; input.value = pending.text; pending.el.remove(); pending = null; if (!log.children.length) intro.hidden = false; grow(); };
 const failed = error => {
  if (error.code === 'expired') {
   try { getAssistant().discardFailedRequest(); getAssistant().forgetLocally(); } catch {}
   started = false; clearBtn.hidden = true; restoreQuestion(); showStatus(t('expired'), 'info'); input.focus(); return;
  }
  showStatus(error.message, 'error');
  const f = getAssistant().failedRequest;
  if (error.code === 'rejected') { discardBtn.hidden = false; discardBtn.textContent = t('edit'); discardBtn.dataset.mode = 'edit'; return; }
  discardBtn.textContent = t('discard'); discardBtn.dataset.mode = 'discard';
  if (f?.retryable) {
   retryBtn.hidden = false; discardBtn.hidden = false;
   const wait = () => { const left = Math.ceil((f.retryAt - Date.now()) / 1000); if (left > 0) { retryBtn.disabled = true; retryBtn.textContent = t('retry') + ' (' + left + t('seconds') + ')'; } else { retryBtn.disabled = false; retryBtn.textContent = t('retry'); clearInterval(countdown); } };
   clearInterval(countdown); wait(); if (f.retryAt > Date.now()) countdown = setInterval(wait, 1000);
  } else if (f) discardBtn.hidden = false;
  if (error.code === 'server' || error.code === 'denied') contactLink.hidden = false;
  if (error.code === 'captcha') verify.hidden = false;
 };
 retryBtn.addEventListener('click', async () => {
  if (retryBtn.disabled) return;
  if (configFailed && !assistant?.failedRequest) { clearStatus(); loadConfig(); return; }
  clearStatus(); const wait = addWait(); updateSend();
  // A genuine retry sends the identical request ID and words again
  try { const answer = await getAssistant().retryLastRequest(); wait.done(); if (pending) { pending.el.removeAttribute('data-unsent'); pending = null; } if (answer?.message !== undefined) { started = true; clearBtn.hidden = false; addAnswer(answer); } else if (answer?.deleted) afterDelete(); }
  catch (error) { wait.done(); failed(error); }
  updateSend();
 });
 discardBtn.addEventListener('click', () => {
  try { getAssistant().discardFailedRequest(); } catch {}
  if (discardBtn.dataset.mode === 'edit') { restoreQuestion(); clearStatus(); updateSend(); input.focus(); input.setSelectionRange(input.value.length, input.value.length); return; }
  if (pending) { pending.el.remove(); pending = null; }
  clearStatus(); if (!log.children.length) intro.hidden = false; updateSend(); input.focus();
 });

 // ---------- sending: one request at a time; an edited question gets a new request ID
 const updateSend = () => { send.disabled = input.disabled || !input.value.trim() || (assistant?.busy ?? false) || !!assistant?.failedRequest; };
 const grow = () => { input.style.height = 'auto'; input.style.height = Math.min(140, input.scrollHeight) + 'px'; };
 input.addEventListener('input', () => { grow(); updateSend(); });
 input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); submit(); } });
 async function submit() {
  const text = input.value.trim(); if (!text || input.disabled) return;
  const a = getAssistant(); if (a.busy || a.failedRequest) return;
  clearStatus(); input.value = ''; grow();
  const el = addYou(text); el.setAttribute('data-unsent', ''); pending = { el, text };
  const wait = addWait(); const request = a.chat(text); updateSend();
  try { const answer = await request; wait.done(); el.removeAttribute('data-unsent'); pending = null; started = true; clearBtn.hidden = false; addAnswer(answer); }
  catch (error) { wait.done(); failed(error); }
  updateSend(); if (!coarse.matches) input.focus();
 }
 form.addEventListener('submit', e => { e.preventDefault(); submit(); });

 // ---------- one confirmation for deleting and for switching language mid-conversation (both delete the server copy)
 const showConfirm = mode => {
  confirmMode = mode;
  $('ast-confirm-t').textContent = mode === 'switch' ? t('switchQ') : t('confirm');
  $('ast-confirm-yes').textContent = mode === 'switch' ? t('switchYes') : t('yes');
  $('ast-confirm-no').textContent = mode === 'switch' ? t('switchNo') : t('keep');
  confirm.hidden = false; scroll(); $('ast-confirm-yes').focus();
 };
 const hideConfirm = () => { confirm.hidden = true; (confirmMode === 'switch' ? $('ast-lang').querySelector(`[data-locale="${switchTo || locale}"]`) : clearBtn)?.focus(); switchTo = null; };
 const afterDelete = () => { log.replaceChildren(); started = false; pending = null; clearBtn.hidden = true; intro.hidden = false; };
 const setLocale = next => { locale = next; assistant = null; applyLocale(); };
 clearBtn.addEventListener('click', () => showConfirm('delete'));
 $('ast-confirm-no').addEventListener('click', hideConfirm);
 $('ast-confirm-yes').addEventListener('click', async () => {
  const mode = confirmMode, next = switchTo; confirm.hidden = true; switchTo = null; clearStatus();
  try {
   if (assistant?.failedRequest) { try { assistant.discardFailedRequest(); } catch {} }
   try { if (assistant && (assistant.session || started)) await assistant.deleteSession(); }
   catch (error) { if (error.code !== 'expired') throw error; assistant.forgetLocally(); }
   afterDelete();
   if (mode === 'switch' && next) { setLocale(next); showStatus(t('switched'), 'info'); }
   else showStatus(t('deleted'), 'info');
   input.focus();
  } catch (error) { failed(error); }
  updateSend();
 });
 document.querySelectorAll('#ast-lang button').forEach(b => b.addEventListener('click', () => {
  const next = b.dataset.locale; if (next === locale || assistant?.busy) return;
  // A conversation keeps one language: switching starts a fresh session (after confirmation if one exists)
  if (started || assistant?.session) { switchTo = next; showConfirm('switch'); return; }
  if (assistant?.failedRequest) { try { assistant.discardFailedRequest(); } catch {} restoreQuestion(); }
  setLocale(next); clearStatus(); input.focus();
 }));

 applyLocale(); tuck(); root.hidden = false;
 window.__velaniAssistant = { get locale() { return locale; } };
})();
