/* NEVORA signup, trial and billing on the Velani site (contract: NEVORA docs/handoffs/2026-11-07-commerce-backend.md and
 * 2026-11-08-commerce-ui-gap-fixes.md). Shared by Plans, nevora-start, nevora-verify, nevora-billing and nevora-billing-return.
 * Rules kept here:
 * - The API origin comes only from the page (#velani-commerce data-api: the theme setting on Shopify, VELANI_COMMERCE_API in
 *   the local preview). With no origin, every action says billing isn't available; nothing guesses an endpoint.
 * - The commerce bearer token lives in this module's memory only: never storage, the URL, logs or analytics.
 * - Link fragments (#token=, #handoff=) are read once and scrubbed from the address bar immediately.
 * - Checkout and portal requests carry an Idempotency-Key that is kept while a retry is uncertain.
 * - The backend's status is the only source for readiness, dates, employee counts and payment. */
const cfg = document.getElementById('velani-commerce');
const API = (cfg && cfg.dataset.api || '').trim().replace(/\/+$/, '');
const LOCAL = /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(API);
const ES = /^es\b/i.test(document.documentElement.lang);
const LOC = ES ? 'es' : 'en-US';
let token = null;
/** The site's arrow-right icon (Phosphor regular), for buttons this script creates. */
const ARROW = '<svg class="icon" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/></svg>';

/** Read a one-time link value from the fragment and remove it from the address bar before anything else runs. */
export function takeFragment(name) {
  const m = new RegExp('^#' + name + '=([A-Za-z0-9_-]{20,256})$').exec(location.hash);
  if (/^#[a-z]+=/i.test(location.hash)) history.replaceState(history.state, '', location.pathname + location.search);
  return m ? m[1] : null;
}
export const configured = () => /^https:\/\/[^/]+$/.test(API) || LOCAL;
export const setToken = value => { token = value; };
export const hasToken = () => !!token;
export const clearToken = () => { token = null; };

/** One API call. Never throws: { ok, status, data } or { ok:false, status, code } (status 0 and code "network" when the
 * request didn't complete, so the caller treats the outcome as uncertain). */
export async function call(path, { method = 'GET', body, auth = false, key } = {}) {
  if (!configured()) return { ok: false, status: 503, code: 'not_configured' };
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && token) headers.Authorization = 'Bearer ' + token;
  if (key) headers['Idempotency-Key'] = key;
  let res;
  try {
    res = await fetch(API + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), cache: 'no-store', credentials: 'omit', redirect: 'error', referrerPolicy: 'no-referrer' });
  } catch { return { ok: false, status: 0, code: 'network' }; }
  let data = null;
  try { data = await res.json(); } catch { /* an empty or broken body is handled by status */ }
  if (res.ok) return { ok: true, status: res.status, data };
  if (res.status === 401) token = null;
  return { ok: false, status: res.status, code: (data && data.error && data.error.code) || 'error' };
}

/** Only an https page (a local http page in fixture mode) is ever navigated to from an API answer. */
export function safeUrl(value) {
  try {
    const u = new URL(value);
    if (u.protocol === 'https:') return u.href;
    if (LOCAL && u.protocol === 'http:' && /^(127\.0\.0\.1|localhost)$/.test(u.hostname)) return u.href;
  } catch { /* not a URL */ }
  return null;
}
const uuid = () => crypto.randomUUID ? crypto.randomUUID() : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));

/* ---------- words ---------- */
const W = {
  en: {
    opening: 'Opening your plan', yourPlan: 'Your NEVORA plan', back: 'Back to NEVORA', subscribe: 'Subscribe', manage: 'Manage billing', quote: 'Ask for a quote',
    getLink: 'Get a billing link', working: 'Opening billing',
    trial: (d, p) => 'Free trial until ' + d + '. Your team’s plan will be ' + p + ' a month.',
    trialFact: d => 'Subscribe now and you keep every day of your trial. Your first charge is on ' + d + '.',
    paid: (p, d) => p + ' a month' + (d ? ', paid through ' + d : '') + '.',
    canceled: d => 'Your subscription is canceled. NEVORA keeps working' + (d ? ' through ' + d : ' through the paid period') + '.',
    grace: d => 'Your last payment didn’t go through. Update your card' + (d ? ' by ' + d : '') + ' to keep NEVORA running.',
    trialEnded: 'Your free trial has ended. Subscribe to turn NEVORA back on for your team.',
    payFailed: 'Your payment didn’t go through, so NEVORA is paused for your team. Update your card to turn it back on.',
    ended: 'Your subscription has ended. A new subscription starts right away, with no second free trial.',
    payRequired: 'A payment is needed to finish your subscription.',
    overLimit: (n, l) => n + ' active employees, and your plan covers ' + l + '. Change plans, or deactivate employees you no longer need. No one was removed and you weren’t charged.',
    overTop: n => n + ' active employees. Self-service plans cover up to 30, so ask us for a quote.',
    setup: 'Your workplace is still being set up. Billing opens when it’s ready.',
    kept: 'Your schedules, timecards and pay records are safe, and you can still export them.',
    stripe: 'Payments are handled by Stripe.',
    expiredT: 'This billing link has expired', expired: 'Billing links work once and for a short time. Open billing again from NEVORA, or get a sign-in link by email.',
    unavailableT: 'Billing isn’t available right now', unavailable: 'We couldn’t reach billing. Nothing was charged. Try again in a minute.',
    limited: 'Too many tries. Wait a minute, then try again.',
    pending: 'Your payment is still being confirmed. Check again in a minute.',
    checkoutExpired: 'That checkout expired before it was finished. Nothing was charged. Choose Subscribe to start again.',
    support: 'We need to check your billing account. Email support@thevelani.com and we’ll sort it out.',
    yourTeam: 'Your team',
    sentT: 'Check your email.', sent: e => 'We sent a link to ' + e + '. Open it within 24 hours to set up your workplace.',
    sentFact: 'No email after a few minutes? Check your spam folder, or send it again.', again: 'Send it again', againIn: s => 'Send it again in ' + s + ' s', other: 'Use a different email', resent: 'Sent again. Check your inbox.',
    badEmail: 'Enter an email address like name@business.com.', signupDown: 'Signup is paused for a moment. Try again in a few minutes.', offline: 'We couldn’t reach NEVORA. Check your connection and try again.',
    over30: 'More than 30', quoted: 'Quote', quoteNote: 'Teams of more than 30 get a quote from us.', perMonth: 'a month', emp: n => n === 1 ? 'employee' : 'employees',
    valueText: (n, p) => n > 30 ? 'More than 30 employees, ask for a quote' : n + ' ' + (n === 1 ? 'employee' : 'employees') + ', ' + p + ' a month',
  },
  es: {
    opening: 'Abriendo tu plan', yourPlan: 'Tu plan de NEVORA', back: 'Volver a NEVORA', subscribe: 'Suscríbete', manage: 'Administra la facturación', quote: 'Pide una cotización',
    getLink: 'Recibe un enlace de facturación', working: 'Abriendo la facturación',
    trial: (d, p) => 'Prueba gratis hasta el ' + d + '. El plan de tu equipo será de ' + p + ' al mes.',
    trialFact: d => 'Si te suscribes ahora, conservas todos los días de tu prueba. El primer cargo es el ' + d + '.',
    paid: (p, d) => p + ' al mes' + (d ? ', pagado hasta el ' + d : '') + '.',
    canceled: d => 'Tu suscripción está cancelada. NEVORA sigue funcionando' + (d ? ' hasta el ' + d : ' hasta el final del período pagado') + '.',
    grace: d => 'Tu último pago no se completó. Actualiza tu tarjeta' + (d ? ' antes del ' + d : '') + ' para que NEVORA siga funcionando.',
    trialEnded: 'Tu prueba gratis terminó. Suscríbete para volver a activar NEVORA para tu equipo.',
    payFailed: 'Tu pago no se completó, así que NEVORA está en pausa para tu equipo. Actualiza tu tarjeta para activarlo de nuevo.',
    ended: 'Tu suscripción terminó. Una suscripción nueva empieza de inmediato, sin una segunda prueba gratis.',
    payRequired: 'Falta un pago para completar tu suscripción.',
    overLimit: (n, l) => n + ' empleados activos, y tu plan cubre ' + l + '. Cambia de plan o desactiva a los empleados que ya no necesitas. No se eliminó a nadie y no se te cobró.',
    overTop: n => n + ' empleados activos. Los planes en línea cubren hasta 30, así que pídenos una cotización.',
    setup: 'Todavía estamos configurando tu lugar de trabajo. La facturación se abre cuando esté listo.',
    kept: 'Tus horarios, tarjetas de tiempo y registros de pago están seguros, y todavía puedes exportarlos.',
    stripe: 'Stripe procesa los pagos.',
    expiredT: 'Este enlace de facturación venció', expired: 'Los enlaces de facturación funcionan una vez y por poco tiempo. Abre la facturación otra vez desde NEVORA o recibe un enlace por correo.',
    unavailableT: 'La facturación no está disponible ahora', unavailable: 'No pudimos conectar con la facturación. No se cobró nada. Intenta de nuevo en un minuto.',
    limited: 'Demasiados intentos. Espera un minuto y vuelve a intentarlo.',
    pending: 'Tu pago todavía se está confirmando. Vuelve a revisar en un minuto.',
    checkoutExpired: 'Ese pago venció antes de completarse. No se cobró nada. Elige Suscríbete para empezar de nuevo.',
    support: 'Tenemos que revisar tu cuenta de facturación. Escribe a support@thevelani.com y lo resolvemos.',
    yourTeam: 'Tu equipo',
    sentT: 'Revisa tu correo.', sent: e => 'Te enviamos un enlace a ' + e + '. Ábrelo dentro de 24 horas para configurar tu lugar de trabajo.',
    sentFact: '¿No te llega después de unos minutos? Revisa la carpeta de correo no deseado o envíalo otra vez.', again: 'Envíalo otra vez', againIn: s => 'Envíalo otra vez en ' + s + ' s', other: 'Usa otro correo', resent: 'Lo enviamos otra vez. Revisa tu bandeja de entrada.',
    badEmail: 'Escribe un correo como nombre@negocio.com.', signupDown: 'El registro está en pausa por un momento. Intenta de nuevo en unos minutos.', offline: 'No pudimos conectar con NEVORA. Revisa tu conexión e intenta de nuevo.',
    over30: 'Más de 30', quoted: 'Cotización', quoteNote: 'Los equipos de más de 30 reciben una cotización.', perMonth: 'al mes', emp: n => n === 1 ? 'empleado' : 'empleados',
    valueText: (n, p) => n > 30 ? 'Más de 30 empleados, pide una cotización' : n + ' ' + (n === 1 ? 'empleado' : 'empleados') + ', ' + p + ' al mes',
  },
};
export const t = ES ? W.es : W.en;
const PRICE = { small: '$19', team: '$29' };
export const day = iso => new Date(iso).toLocaleDateString(LOC, { month: 'long', day: 'numeric', year: 'numeric' });
/** The band the backend will bill: from actual active employees (Owners excluded), never chosen here. */
export const bandFor = s => s.plan || (s.activeEmployees > 15 ? 'team' : 'small');

/** What the Owner sees for one status: a line, an optional fact and the actions, in order (the first is primary). */
export function ownerView(s) {
  const price = PRICE[bandFor(s)];
  if (s.setup && s.setup !== 'ready') return { line: t.setup, acts: [] };
  if (s.reason === 'employee_limit_exceeded') {
    if (s.activeEmployees > 30) return { line: t.overTop(s.activeEmployees), acts: ['quote'] };
    return { line: t.overLimit(s.activeEmployees, s.employeeLimit), acts: [s.plan ? 'portal' : 'checkout'] };
  }
  if (s.state === 'trial') return { line: t.trial(s.trialEndsAt ? day(s.trialEndsAt) : '', price), fact: s.trialEndsAt ? t.trialFact(day(s.trialEndsAt)) + ' ' + t.stripe : t.stripe, acts: ['checkout'] };
  if (s.state === 'paid') return { line: s.reason === 'subscription_canceled' ? t.canceled(s.paidThrough && day(s.paidThrough)) : t.paid(price, s.paidThrough && day(s.paidThrough)), fact: t.stripe, acts: ['portal'] };
  if (s.state === 'grace') return { line: t.grace(s.graceEndsAt && day(s.graceEndsAt)), fact: t.stripe, acts: ['portal'] };
  const line = { trial_ended: t.trialEnded, payment_failed: t.payFailed, subscription_canceled: t.ended }[s.reason] || t.payRequired;
  return { line, fact: t.kept, acts: [s.reason === 'payment_failed' ? 'portal' : 'checkout'] };
}

/* ---------- checkout and portal ---------- */
const op = { kind: null, key: null };
/** Start (or safely retry) a Stripe Checkout or Customer Portal session and go there. Returns a message for the page when
 * the Owner has to act, or null after navigating. A lost response is retried with the same key; only an explicit
 * checkout_expired starts a new operation. */
export async function openBilling(kind, depth = 0) {
  if (op.kind !== kind || !op.key) { op.kind = kind; op.key = uuid(); }
  let r;
  for (let attempt = 0; attempt < 3; attempt++) {
    r = await call('/v1/' + kind, { method: 'POST', body: {}, auth: true, key: op.key });
    if (r.status !== 0) break;
    await new Promise(done => setTimeout(done, attempt ? 3000 : 1000));
  }
  if (r.ok) {
    const url = safeUrl(r.data && r.data.url);
    if (url) { location.assign(url); return null; }
    return { text: t.unavailable };
  }
  if (r.code === 'checkout_expired') { op.key = null; return { text: t.checkoutExpired }; }
  if (r.code === 'use_billing_portal' && depth === 0) return openBilling('portal', 1);
  if (r.code === 'subscription_required' && depth === 0) return openBilling('checkout', 1);
  if (r.code === 'assisted_quote_required') return { text: t.overTop(31), quote: true };
  if (r.code === 'subscription_sync_pending') return { text: t.pending };
  if (r.code === 'customer_reconciliation_required') return { text: t.support };
  if (r.status === 401) return { text: t.expired, expired: true };
  if (r.status === 429) return { text: t.limited };
  return { text: t.unavailable };
}

/* ---------- Plans: the Owner's handoff from NEVORA ---------- */
function plans() {
  const hero = document.getElementById('top');
  const handoff = takeFragment('handoff');
  if (!hero || !handoff) return;
  const h1 = hero.querySelector('h1'), text = hero.querySelector('.hcopy > p.fade:not(.hfact)'), acts = hero.querySelector('.hacts'), fact = hero.querySelector('.hfact');
  // The page's own links (already rewritten for a theme preview) give the billing and quote addresses.
  const billingHref = (acts.querySelector('a[href*="nevora-billing"]') || {}).href || '/pages/nevora-billing';
  const quoteHref = (document.querySelector('.price-over a') || {}).href || '/pages/contact?interest=nevora';
  fact.removeAttribute('data-trial-end');
  const icon = (acts.querySelector('.hb .icon') || document.createElement('i')).outerHTML;
  const show = (title, line, buttons, note) => {
    h1.textContent = title; text.textContent = line || ''; text.hidden = !line;
    acts.replaceChildren(...buttons); acts.hidden = !buttons.length;
    fact.textContent = note || ''; fact.hidden = !note;
    hero.removeAttribute('aria-busy');
  };
  const link = (label, href, fill) => { const a = document.createElement('a'); a.className = 'hb' + (fill ? ' fill' : ''); a.href = href; a.innerHTML = '<span></span>' + icon; a.firstChild.textContent = label; return a; };
  const button = (label, run) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'hb fill'; b.innerHTML = '<span></span>' + icon; b.firstChild.textContent = label;
    b.addEventListener('click', async () => {
      if (b.disabled) return;
      b.disabled = true; b.setAttribute('aria-busy', 'true'); b.firstChild.textContent = t.working;
      const out = await run();
      if (!out) return; // navigating to Stripe
      b.disabled = false; b.removeAttribute('aria-busy'); b.firstChild.textContent = label;
      if (out.expired) return show(t.expiredT, t.expired, [link(t.getLink, billingHref, true)]);
      fact.hidden = false; fact.textContent = out.text; fact.setAttribute('role', 'alert');
    });
    return b;
  };
  // A handoff works once, so every failure offers a fresh billing link rather than a retry of the same one.
  const fail = (title, line) => show(title, line, [link(t.getLink, billingHref, true)]);

  hero.setAttribute('aria-busy', 'true'); h1.textContent = t.opening; text.hidden = true; acts.hidden = true; fact.hidden = true;
  if (!configured()) return fail(t.unavailableT, t.unavailable);
  (async () => {
    const x = await call('/v1/handoff/exchange', { method: 'POST', body: { token: handoff } });
    if (!x.ok || !x.data || typeof x.data.accessToken !== 'string') {
      if (x.status === 400 || x.status === 401) return fail(t.expiredT, t.expired);
      return fail(t.unavailableT, x.status === 429 ? t.limited : t.unavailable);
    }
    setToken(x.data.accessToken);
    const s = await call('/v1/status', { auth: true });
    if (!s.ok || !s.data) return fail(s.status === 401 ? t.expiredT : t.unavailableT, s.status === 401 ? t.expired : t.unavailable);
    const st = s.data, v = ownerView(st);
    const back = safeUrl(st.applicationUrl);
    const buttons = v.acts.map(a => a === 'quote' ? link(t.quote, quoteHref, true) : button(a === 'portal' ? t.manage : t.subscribe, () => openBilling(a)));
    if (back) buttons.push(link(t.back, back, false));
    show(st.businessName || t.yourPlan, v.line, buttons, v.fact);
    // The price card starts at the business's real team size (active employees, Owners excluded).
    if (priceCard) priceCard.set(st.activeEmployees);
  })();
}

/* ---------- Signup: email only, then "Check your email" ---------- */
const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
function signup(form) {
  const hero = form.closest('.hpanel'), h1 = hero.querySelector('h1'), lead = hero.querySelector('.hcopy > p.fade:not(.hfact)');
  const input = form.querySelector('input'), button = form.querySelector('button'), label = button.querySelector('span'), error = form.querySelector('.field-error');
  const fact = hero.querySelector('[data-signup-fact]'), sendText = label.textContent, factHtml = fact.innerHTML, titleText = h1.textContent, leadText = lead.textContent;
  hero.querySelectorAll('[data-off]').forEach(x => { x.hidden = true; });
  form.hidden = false; fact.hidden = false;
  let busy = false, sentTo = null, timer = 0;
  const fail = text => { error.textContent = text; input.setAttribute('aria-invalid', 'true'); input.focus(); };
  const clear = () => { error.textContent = ''; input.removeAttribute('aria-invalid'); };
  input.addEventListener('input', clear);
  async function send(email) {
    const r = await call('/v1/signup', { method: 'POST', body: { email } });
    if (r.ok) return null;
    if (r.code === 'invalid_email' || r.status === 400) return t.badEmail;
    if (r.status === 429) return t.limited;
    if (r.status === 503) return t.signupDown;
    return t.offline;
  }
  const cooldown = (btn, seconds) => {
    let left = seconds; btn.disabled = true; btn.firstChild.textContent = t.againIn(left);
    clearInterval(timer); timer = setInterval(() => { left -= 1; if (left <= 0) { clearInterval(timer); btn.disabled = false; btn.firstChild.textContent = t.again; } else btn.firstChild.textContent = t.againIn(left); }, 1000);
  };
  const showSent = () => {
    h1.textContent = t.sentT; lead.textContent = t.sent(sentTo); form.hidden = true;
    const again = document.createElement('button'); again.type = 'button'; again.className = 'hb'; again.innerHTML = '<span></span>' + button.querySelector('.icon').outerHTML;
    const other = again.cloneNode(true); other.firstChild.textContent = t.other;
    const acts = document.createElement('div'); acts.className = 'hacts'; acts.dataset.sent = ''; acts.append(again, other);
    fact.textContent = t.sentFact; fact.removeAttribute('role'); fact.before(acts);
    cooldown(again, 30);
    again.addEventListener('click', async () => {
      if (again.disabled) return; again.disabled = true;
      const problem = await send(sentTo);
      fact.textContent = problem || t.resent; fact.setAttribute('role', 'status');
      cooldown(again, problem ? 10 : 60);
    });
    other.addEventListener('click', () => {
      clearInterval(timer); acts.remove(); sentTo = null;
      h1.textContent = titleText; lead.textContent = leadText; fact.innerHTML = factHtml; form.hidden = false; input.select(); input.focus();
    });
    h1.setAttribute('tabindex', '-1'); h1.focus();
  };
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    const email = input.value.trim();
    if (!EMAIL.test(email)) return fail(t.badEmail);
    busy = true; button.disabled = true; button.setAttribute('aria-busy', 'true'); label.textContent = button.dataset.sending;
    const problem = await send(email);
    busy = false; button.disabled = false; button.removeAttribute('aria-busy'); label.textContent = sendText;
    if (problem) return fail(problem);
    sentTo = email; showSent();
  });
}
const signupForm = document.querySelector('[data-signup]');
if (signupForm && configured()) signup(signupForm);

/* ---------- Setup: verify the link, the setup form, progress, ready ---------- */
const S = {
  opening: ['Opening your link.', 'One moment while we check your link.'],
  expired: ['This link has expired.', 'Each link works once and expires after a while. Ask for a new one and use the newest email.'],
  noLink: ['Open the link from your email.', 'For your security, each link works once. If you already used it, ask for a new one.'],
  down: ['Setup isn’t available right now.', 'We couldn’t reach NEVORA. Nothing was lost. Try the link again in a few minutes.'],
  session: ['Your session ended.', 'For your security, setup pages stay open for a few hours. Ask for a new link to continue.'],
  pending: ['Setting up your workplace.', 'We have your details. Your workplace is in line to be set up.'],
  provisioning: ['Setting up your workplace.', 'We’re preparing your workplace and your Owner account now.'],
  slow: 'It’s taking longer than usual. You can close this page. To check later, open Plan and billing and ask for a sign-in link.',
  usually: 'This usually takes a few minutes. Keep this page open; it updates by itself.',
  ready: ['Your workplace is ready.', d => d ? 'Your free trial runs until ' + d + '.' : 'Your free trial has started.'],
  newLink: 'Get a new link', billing: 'Plan and billing', open: 'Open NEVORA', copy: 'Copy', copied: 'Copied',
  address: 'NEVORA address', ownerId: 'Owner ID', password: 'Password', passwordText: 'The one you just chose', trial: 'Free trial', until: d => 'Until ' + d,
  save: 'Save your NEVORA address. Your team gets their own invitations from NEVORA.',
  steps: ['Details received', 'Preparing your workplace', 'Ready to sign in'],
  required: 'Fill this in.', businessLong: 'Use 120 characters or fewer.', phone: 'Enter a 10-digit phone number.', password12: 'Use at least 12 characters.',
  employees: 'Enter a number from 1 to 30.', over30: 'More than 30 employees get a quote from us.', tz: 'Choose a time zone.',
  conflict: 'These details were already submitted. We’re setting up the workplace you sent first.', failed: 'We couldn’t set up your workplace with these details. Check them and try again.',
};
function setupPage(root) {
  const h1 = root.querySelector('h1'), lede = root.querySelector('[data-setup-lede]'), acts = root.querySelector('[data-setup-acts]');
  const form = root.querySelector('#setup-form'), card = root.querySelector('[data-setup-card]'), status = form.querySelector('[data-form-status]');
  const startHref = (document.querySelector('a[href*="nevora-start"]') || {}).href || '/pages/nevora-start';
  const billingHref = '/pages/nevora-billing';
  root.querySelectorAll('[data-off]').forEach(x => { x.hidden = true; });
  const head = ([title, line], focus) => { h1.textContent = title; lede.textContent = line; if (focus) h1.focus(); };
  const buttons = list => { acts.replaceChildren(...list); acts.hidden = !list.length; };
  const link = (label, href, fill) => { const a = document.createElement('a'); a.className = 'hb' + (fill ? ' fill' : ''); a.href = href; a.innerHTML = '<span></span>' + ARROW; a.firstChild.textContent = label; return a; };
  const show = what => { form.hidden = what !== 'form'; card.hidden = what !== 'card'; };
  const stop = (text, list) => { head(text, true); buttons(list); show('none'); };

  /* Polling: every 3 s for a minute, then 6 s, then 15 s; paused while hidden or offline; gives a calm note after 10 minutes. */
  let since = 0, timer = 0, polling = false;
  const wait = () => { const s = (Date.now() - since) / 1000; return s < 60 ? 3000 : s < 300 ? 6000 : 15000; };
  async function poll() {
    if (!polling) return;
    if (document.visibilityState !== 'visible' || !navigator.onLine) return; // resumed by the listeners below
    const r = await call('/v1/status', { auth: true });
    if (!polling) return;
    if (r.status === 401) { polling = false; return stop(S.session, [link(S.newLink, startHref, true)]); }
    if (r.ok && r.data) return route(r.data);
    timer = setTimeout(poll, wait());
  }
  const resume = () => { if (polling && document.visibilityState === 'visible' && navigator.onLine) { clearTimeout(timer); poll(); } };
  document.addEventListener('visibilitychange', resume); addEventListener('online', resume);

  function progress(state) {
    if (!since) since = Date.now();
    head(state === 'provisioning' ? S.provisioning : S.pending, false); buttons([]);
    const done = state === 'provisioning' ? 1 : 1, now = state === 'provisioning' ? 1 : 1;
    card.innerHTML = '<ol class="setup-steps"></ol><p class="setup-note"></p>';
    const ol = card.querySelector('ol');
    S.steps.forEach((label, i) => { const li = document.createElement('li'); li.dataset.state = i < done ? 'done' : i === now ? 'now' : 'next'; li.textContent = label; if (i === now) li.setAttribute('aria-current', 'step'); ol.append(li); });
    card.querySelector('.setup-note').textContent = (Date.now() - since) > 600000 ? S.slow : S.usually;
    if ((Date.now() - since) > 600000) buttons([link(S.billing, billingHref, false)]);
    show('card');
    polling = true; clearTimeout(timer); timer = setTimeout(poll, wait());
  }
  function ready(st) {
    polling = false; clearTimeout(timer);
    const end = st.trialEndsAt ? day(st.trialEndsAt) : '';
    head([S.ready[0], S.ready[1](end)], true);
    const app = safeUrl(st.applicationUrl);
    buttons(app ? [link(S.open, app, true)] : []);
    const row = (k, v, copy) => '<div><dt>' + k + '</dt><dd><span>' + v + '</span>' + (copy ? '<button class="copy" type="button" data-copy="' + copy + '">' + S.copy + '</button>' : '') + '</dd></div>';
    const esc = x => String(x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    const host = app ? new URL(app).host : '';
    card.innerHTML = '<dl class="setup-facts">' + (app ? row(S.address, '<a href="' + esc(app) + '">' + esc(host) + '</a>', esc(app)) : '') + row(S.ownerId, esc(st.ownerEmployeeId || 'OWNER'), esc(st.ownerEmployeeId || 'OWNER')) + row(S.password, S.passwordText) + '</dl><p class="setup-note">' + S.save + '</p>';
    card.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', async () => { try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = S.copied; setTimeout(() => { b.textContent = S.copy; }, 1600); } catch { /* clipboard blocked: the value stays visible to copy by hand */ } }));
    show('card');
  }
  function route(st) {
    if (st.setup === 'required') return showForm();
    if (st.setup === 'pending' || st.setup === 'provisioning') return progress(st.setup);
    if (st.setup === 'ready') return ready(st);
    stop(S.down, [link(S.newLink, startHref, true)]);
  }

  /* The form: checks before sending, the backend's codes after. Values stay when something needs fixing. */
  const field = name => form.querySelector('[name="' + name + '"]');
  const setErr = (name, text) => { const input = field(name), p = form.querySelector('#setup-' + name + '-error'); if (p) p.textContent = text || ''; if (text) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid'); };
  form.querySelectorAll('input,select').forEach(i => i.addEventListener('input', () => setErr(i.name, '')));
  const tzSel = field('timeZone');
  try { const mine = Intl.DateTimeFormat().resolvedOptions().timeZone; if ([...tzSel.options].some(o => o.value === mine)) tzSel.value = mine; } catch { /* keep Eastern */ }
  const toggle = form.querySelector('.pw-toggle');
  toggle.addEventListener('click', () => { const pw = field('password'), on = pw.type === 'password'; pw.type = on ? 'text' : 'password'; toggle.textContent = on ? toggle.dataset.hide : toggle.dataset.show; toggle.setAttribute('aria-pressed', String(on)); });
  function showForm() { head([h1.dataset.title, lede.dataset.text], false); buttons([]); show('form'); field('businessName').focus(); }
  h1.dataset.title = h1.textContent; lede.dataset.text = lede.textContent;
  let sending = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    status.textContent = '';
    const v = n => field(n).value.trim();
    const digits = v('phone').replace(/\D/g, ''), count = Number(v('employeeCount'));
    const errors = {};
    for (const n of ['businessName', 'locationName', 'firstName', 'lastName']) if (!v(n)) errors[n] = S.required;
    if (!/^1?\d{10}$/.test(digits)) errors.phone = S.phone;
    if (!Number.isInteger(count) || count < 1) errors.employeeCount = S.employees; else if (count > 30) errors.employeeCount = S.over30;
    if (field('password').value.length < 12) errors.password = S.password12;
    if (!tzSel.value) errors.timeZone = S.tz;
    form.querySelectorAll('input,select').forEach(i => setErr(i.name, errors[i.name]));
    const first = form.querySelector('[aria-invalid="true"]'); if (first) return first.focus();
    const body = { password: field('password').value, firstName: v('firstName'), lastName: v('lastName'), phone: digits.length === 11 ? digits.slice(1) : digits, businessName: v('businessName'), timeZone: tzSel.value, locationName: v('locationName'), employeeCount: count };
    sending = true; const button = form.querySelector('button[type="submit"]'), label = button.firstChild.textContent; button.disabled = true; button.setAttribute('aria-busy', 'true'); button.firstChild.textContent = button.dataset.sending;
    let r;
    for (let attempt = 0; attempt < 3; attempt++) { r = await call('/v1/setup', { method: 'POST', body, auth: true }); if (r.status !== 0) break; await new Promise(d => setTimeout(d, attempt ? 3000 : 1000)); }
    sending = false; button.disabled = false; button.removeAttribute('aria-busy'); button.firstChild.textContent = label;
    if (r.ok || r.code === 'setup_pending') { field('password').value = ''; return progress('pending'); }
    if (r.status === 401) return stop(S.session, [link(S.newLink, startHref, true)]);
    if (r.code === 'setup_already_submitted') { status.textContent = S.conflict; field('password').value = ''; return progress('pending'); }
    const map = { password: 'password', phone: 'phone', time: 'timeZone', employee: 'employeeCount', quote: 'employeeCount', business: 'businessName', location: 'locationName', first: 'firstName', last: 'lastName' };
    const hit = Object.keys(map).find(k => (r.code || '').includes(k));
    if (hit) { setErr(map[hit], hit === 'quote' ? S.over30 : { password: S.password12, phone: S.phone, time: S.tz, employee: S.employees }[hit] || S.failed); return field(map[hit]).focus(); }
    status.textContent = r.status === 429 ? t.limited : r.status === 0 || r.status >= 500 ? S.down[1] : S.failed;
  });

  /* Start: read and scrub the link, verify it, then follow the status. */
  const token = takeFragment('token');
  if (!token) return stop(S.noLink, [link(S.newLink, startHref, true)]);
  stop(S.opening, []);
  root.setAttribute('aria-busy', 'true');
  (async () => {
    const x = await call('/v1/verify', { method: 'POST', body: { token } });
    root.removeAttribute('aria-busy');
    if (!x.ok || !x.data || typeof x.data.accessToken !== 'string') {
      if (x.status === 400 || x.status === 401) return stop(S.expired, [link(S.newLink, startHref, true)]);
      return stop(S.down, [link(S.newLink, startHref, true)]);
    }
    setToken(x.data.accessToken);
    const st = await call('/v1/status', { auth: true });
    if (!st.ok || !st.data) return stop(st.status === 401 ? S.session : S.down, [link(S.newLink, startHref, true)]);
    route(st.data);
  })();
}
const setupRoot = document.querySelector('[data-setup-page]');
if (setupRoot && configured()) setupPage(setupRoot);

/* ---------- Plans: the team-size price card ---------- */
function pcard(root) {
  const range = root.querySelector('#pc-n'), out = root.querySelector('[data-count]'), unit = root.querySelector('[data-unit]');
  const amt = root.querySelector('[data-amt]'), per = root.querySelector('[data-per]'), note = root.querySelector('[data-note]');
  const ticks = [...root.querySelectorAll('.pc-meter i')], steps = [...root.querySelectorAll('[data-step]')];
  const baseNote = note.textContent;
  const set = value => {
    const n = Math.max(1, Math.min(31, Math.round(Number(value) || 1)));
    range.value = String(n); root.dataset.n = String(n);
    const team = n > 15, over = n > 30, price = team ? '$29' : '$19';
    out.textContent = over ? t.over30 : String(n); unit.textContent = over ? t.emp(2) : t.emp(n);
    amt.textContent = over ? t.quoted : price; per.hidden = over; note.textContent = over ? t.quoteNote : baseNote;
    ticks.forEach((tick, i) => { tick.className = i < Math.min(n, 30) ? 'pc-on' : (!over && i < (team ? 30 : 15)) ? 'pc-in' : ''; });
    range.setAttribute('aria-valuetext', t.valueText(n, price));
    steps[0].disabled = n <= 1; steps[1].disabled = n >= 31;
  };
  range.disabled = false; steps.forEach(b => { b.hidden = false; b.addEventListener('click', () => set(Number(range.value) + Number(b.dataset.step))); });
  range.addEventListener('input', () => set(range.value));
  set(range.value);
  return { set };
}
const cardRoot = document.querySelector('[data-pcard]');
const priceCard = cardRoot ? pcard(cardRoot) : null;
if (document.getElementById('top') && cardRoot) plans();
