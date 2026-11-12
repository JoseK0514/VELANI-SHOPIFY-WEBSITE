/* NEVORA billing on the Velani site (contract: NEVORA docs/handoffs/2026-11-07-commerce-backend.md, 2026-11-08-commerce-ui-gap-
 * fixes.md and 2026-11-09-claude-website-backend-contract.md). Shared by Plans, nevora-billing, nevora-billing-return, their
 * Spanish pages, and the retired nevora-verify page (which only scrubs old links). Since Nov 9 there is no signup, setup or
 * email sign-in here: those legacy endpoints answer 409 use_onboarding, and billing opens only through the Owner's handoff.
 * Rules kept here:
 * - The API origin comes only from the page (#velani-commerce data-api: the theme setting on Shopify, VELANI_COMMERCE_API in
 *   the local preview). With no origin, every action says billing isn't available; nothing guesses an endpoint.
 * - The commerce bearer token lives in this module's memory only: never storage, the URL, logs or analytics.
 * - Link fragments (#token=, #handoff=) are read once and scrubbed from the address bar immediately.
 * - Checkout and portal requests carry an Idempotency-Key that is kept while a retry is uncertain.
 * - The backend's status is the only source for readiness, dates, employee counts and payment. Dates show in the workplace's
 *   time zone from status.timeZone; when it is null they show in UTC and say so, never in a guessed zone.
 * - Checkout and portal carry the chosen language ({lang:"en"|"es"}); a retry keeps the same key and the same body. */
const cfg = document.getElementById('velani-commerce');
const API = (cfg && cfg.dataset.api || '').trim().replace(/\/+$/, '');
const LOCAL = /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(API);
const ES = /^es\b/i.test(document.documentElement.lang);
/** The page's language, and the language the Owner chose for billing (Plans offers English or Spanish; other pages keep theirs). */
const PAGE_LANG = ES ? 'es' : 'en';
let lang = PAGE_LANG;
const loc = () => lang === 'es' ? 'es' : 'en-US';
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
/** A countdown button keeps the width of its longest label, so its neighbour never shifts while the seconds change. */
function lockWidth(b) { if (b.style.minWidth) return; requestAnimationFrame(() => { b.style.minWidth = Math.ceil(b.getBoundingClientRect().width) + 'px'; }); }
/** Move focus to a heading once it can take it (an entrance animation may still be hiding it), so screen readers say it. */
export function focusSoon(el) {
  const go = () => { if (document.activeElement !== el) el.focus({ preventScroll: true }); };
  requestAnimationFrame(go); setTimeout(go, 400);
}
const uuid = () => crypto.randomUUID ? crypto.randomUUID() : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));

/* ---------- words ---------- */
const W = {
  en: {
    opening: 'Opening your plan', yourPlan: 'Your NEVORA plan', back: 'Back to NEVORA', subscribe: 'Subscribe', manage: 'Manage billing', quote: 'Contact Velani',
    getLink: 'How to open billing', working: 'Opening billing', langQ: 'Billing language', utc: 'Dates are in UTC because your workplace’s time zone isn’t available.',
    trial: (d, p) => 'Free trial until ' + d + '. Your team’s plan will be ' + p + ' a month.',
    trialFact: () => 'Subscribe now and you keep every day of your trial. You aren’t charged until it ends.',
    paid: (p, d) => p + ' a month' + (d ? ', paid through ' + d : '') + '.',
    canceled: d => 'Your subscription is canceled. NEVORA keeps working' + (d ? ' through ' + d : ' through the paid period') + '.',
    grace: d => 'Your last payment didn’t go through. Update your card' + (d ? ' by ' + d : '') + ' to keep NEVORA running.',
    trialEnded: 'Your free trial has ended. Subscribe to turn NEVORA back on for your team.',
    payFailed: 'Your payment didn’t go through, so NEVORA is paused for your team. Update your card to turn it back on.',
    ended: 'Your subscription has ended. A new subscription starts right away, with no second free trial.',
    payRequired: 'A payment is needed to finish your subscription.',
    overLimit: (n, l) => n + ' active employees, and your plan covers ' + l + '. Change plans, or deactivate employees you no longer need. No one was removed and you weren’t charged.',
    overTop: n => n + ' active employees. Plans online cover up to 30. Write to support@thevelani.com for assisted setup; we reply within two business days.',
    setup: 'Your workplace is still being set up. Billing opens when it’s ready.',
    kept: 'Questions about your records? Email support@thevelani.com.',
    stripe: 'Stripe processes the payment.',
    expiredT: 'This billing link has expired', expired: 'Billing links work once and for a short time. Open billing again from NEVORA, in Settings.',
    unavailableT: 'Billing isn’t available right now', unavailable: 'We couldn’t reach billing. Nothing was charged. Try again in a minute.',
    limited: 'Too many tries. Wait a minute, then try again.',
    pending: 'Your payment is still being confirmed. Check again in a minute.',
    checkoutExpired: 'That checkout expired before it was finished. Nothing was charged. Choose Subscribe to start again.',
    support: 'We need to check your billing account. Email support@thevelani.com and we’ll sort it out.',
    yourTeam: 'Your team',
    mine: (n, p) => 'With <b>' + n + (n === 1 ? ' employee' : ' employees') + '</b>: 30 days free from the day your workplace is ready, then <b>' + p + ' a month</b>.', mineOver: 'With <b>more than 30 employees</b>: write to us first for assisted setup. Teams that qualify get the same 30 days free, from the day the workplace is set up.',
    over30: 'More than 30', quoted: 'Contact us', quoteNote: 'More than 30: write to us for assisted setup. We reply within two business days.', perMonth: 'a month', emp: n => n === 1 ? 'employee' : 'employees',
    valueText: (n, p) => n > 30 ? 'More than 30 employees, contact us for assisted setup' : n + ' ' + (n === 1 ? 'employee' : 'employees') + ', ' + p + ' a month',
  },
  es: {
    opening: 'Abriendo tu plan', yourPlan: 'Tu plan de NEVORA', back: 'Volver a NEVORA', subscribe: 'Suscríbete', manage: 'Administra la facturación', quote: 'Escribe a Velani',
    getLink: 'Cómo abrir la facturación', working: 'Abriendo la facturación', langQ: 'Idioma de la facturación', utc: 'Las fechas están en UTC porque la zona horaria de tu lugar de trabajo no está disponible.',
    trial: (d, p) => 'Prueba gratis hasta el ' + d + '. El plan de tu equipo será de ' + p + ' al mes.',
    trialFact: () => 'Si te suscribes ahora, conservas todos los días de tu prueba. No se te cobra hasta que termine.',
    paid: (p, d) => p + ' al mes' + (d ? ', pagado hasta el ' + d : '') + '.',
    canceled: d => 'Tu suscripción está cancelada. NEVORA sigue funcionando' + (d ? ' hasta el ' + d : ' hasta el final del período pagado') + '.',
    grace: d => 'Tu último pago no se completó. Actualiza tu tarjeta' + (d ? ' antes del ' + d : '') + ' para que NEVORA siga funcionando.',
    trialEnded: 'Tu prueba gratis terminó. Suscríbete para volver a activar NEVORA para tu equipo.',
    payFailed: 'Tu pago no se completó, así que NEVORA está en pausa para tu equipo. Actualiza tu tarjeta para activarlo de nuevo.',
    ended: 'Tu suscripción terminó. Una suscripción nueva empieza de inmediato, sin una segunda prueba gratis.',
    payRequired: 'Falta un pago para completar tu suscripción.',
    overLimit: (n, l) => n + ' empleados activos, y tu plan cubre ' + l + '. Cambia de plan o desactiva a los empleados que ya no necesitas. No se eliminó a nadie y no se te cobró.',
    overTop: n => n + ' empleados activos. Los planes en línea cubren hasta 30. Escribe a support@thevelani.com para una configuración asistida; respondemos en un plazo de dos días laborables.',
    setup: 'Todavía estamos configurando tu lugar de trabajo. La facturación se abre cuando esté listo.',
    kept: '¿Preguntas sobre tus registros? Escribe a support@thevelani.com.',
    stripe: 'Stripe procesa los pagos.',
    expiredT: 'Este enlace de facturación venció', expired: 'Los enlaces de facturación funcionan una vez y por poco tiempo. Abre la facturación otra vez desde NEVORA, en Configuración.',
    unavailableT: 'La facturación no está disponible ahora', unavailable: 'No pudimos conectar con la facturación. No se cobró nada. Intenta de nuevo en un minuto.',
    limited: 'Demasiados intentos. Espera un minuto y vuelve a intentarlo.',
    pending: 'Tu pago todavía se está confirmando. Vuelve a revisar en un minuto.',
    checkoutExpired: 'Ese pago venció antes de completarse. No se cobró nada. Elige Suscríbete para empezar de nuevo.',
    support: 'Tenemos que revisar tu cuenta de facturación. Escribe a support@thevelani.com y lo resolvemos.',
    yourTeam: 'Tu equipo',
    mine: (n, p) => 'Con <b>' + n + (n === 1 ? ' empleado' : ' empleados') + '</b>: 30 días gratis desde el día en que tu lugar de trabajo queda listo, luego <b>' + p + ' al mes</b>.', mineOver: 'Con <b>más de 30 empleados</b>: escríbenos primero para una configuración asistida. Los equipos que califican reciben los mismos 30 días gratis, desde el día en que el lugar de trabajo queda configurado.',
    over30: 'Más de 30', quoted: 'Escríbenos', quoteNote: 'Más de 30: escríbenos para una configuración asistida. Respondemos en un plazo de dos días laborables.', perMonth: 'al mes', emp: n => n === 1 ? 'empleado' : 'empleados',
    valueText: (n, p) => n > 30 ? 'Más de 30 empleados, escríbenos para una configuración asistida' : n + ' ' + (n === 1 ? 'empleado' : 'empleados') + ', ' + p + ' al mes',
  },
};
export let t = W[lang];
/** Switch the billing words and the language sent to Checkout and the Portal (Plans' English or Spanish choice). */
export function setLang(next) { lang = next === 'es' ? 'es' : 'en'; t = W[lang]; A = AW[lang]; R = RW[lang]; }
const PRICE = { small: '$19', team: '$29' };
/** The workplace's IANA time zone from status.timeZone, or null (then dates are UTC and labelled). Set from every status read. */
let zone = null;
export function setZone(st) {
  zone = null;
  if (st && typeof st.timeZone === 'string') try { new Intl.DateTimeFormat('en-US', { timeZone: st.timeZone }); zone = st.timeZone; } catch { /* unknown zone: UTC */ }
}
export const day = iso => new Date(iso).toLocaleDateString(loc(), { month: 'long', day: 'numeric', year: 'numeric', timeZone: zone || 'UTC' }) + (zone ? '' : ' (UTC)');
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
  if (s.state === 'trial') return { line: t.trial(s.trialEndsAt ? day(s.trialEndsAt) : '', price), fact: t.trialFact() + ' ' + t.stripe, acts: ['checkout'] };
  if (s.state === 'paid') return { line: s.reason === 'subscription_canceled' ? t.canceled(s.paidThrough && day(s.paidThrough)) : t.paid(price, s.paidThrough && day(s.paidThrough)), fact: t.stripe, acts: ['portal'] };
  if (s.state === 'grace') return { line: t.grace(s.graceEndsAt && day(s.graceEndsAt)), fact: t.stripe, acts: ['portal'] };
  const line = { trial_ended: t.trialEnded, payment_failed: t.payFailed, subscription_canceled: t.ended }[s.reason] || t.payRequired;
  return { line, fact: t.kept, acts: [s.reason === 'payment_failed' ? 'portal' : 'checkout'] };
}

/* ---------- checkout and portal ---------- */
const op = { kind: null, lang: null, key: null };
/** Start (or safely retry) a Stripe Checkout or Customer Portal session and go there. Returns a message for the page when
 * the Owner has to act, or null after navigating. A lost response is retried with the same key; only an explicit
 * checkout_expired starts a new operation. */
export async function openBilling(kind, depth = 0) {
  if (op.kind !== kind || op.lang !== lang || !op.key) { op.kind = kind; op.lang = lang; op.key = uuid(); }
  const body = { lang: op.lang }; // the same body for every retry of this operation
  let r;
  for (let attempt = 0; attempt < 3; attempt++) {
    r = await call('/v1/' + kind, { method: 'POST', body, auth: true, key: op.key });
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
  const billingHref = (document.querySelector('a[href*="nevora-billing"],a[href*="es-facturacion"]') || {}).href || '/pages/nevora-billing';
  const quoteHref = (document.querySelector('#price a[href*="interest=nevora"]') || {}).href || '/pages/contact?interest=nevora';
  const icon = (acts.querySelector('.hb .icon') || document.createElement('i')).outerHTML;
  h1.setAttribute('tabindex', '-1');
  const show = (title, line, buttons, note, focus = true) => {
    h1.textContent = title; text.textContent = line || ''; text.hidden = !line;
    acts.replaceChildren(...buttons); acts.hidden = !buttons.length;
    fact.textContent = note || ''; fact.hidden = !note;
    hero.removeAttribute('aria-busy');
    document.documentElement.classList.remove('owner-loading');
    if (focus && title !== t.opening) focusSoon(h1);
  };
  // The page's own addresses in the chosen language (Spanish pages for Spanish), keeping a theme preview's query.
  const inLang = (href, es) => { try { const u = new URL(href, location.href); if (lang === 'es') u.pathname = es; return u.href; } catch { return href; } };
  const link = (label, href, fill) => { const a = document.createElement('a'); a.className = 'hb' + (fill ? ' fill' : ''); a.href = href; a.innerHTML = '<span></span>' + icon; a.firstChild.textContent = label; return a; };
  const button = (label, run) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'hb fill'; b.innerHTML = '<span></span>' + icon; b.firstChild.textContent = label;
    b.addEventListener('click', async () => {
      if (b.disabled) return;
      b.disabled = true; b.setAttribute('aria-busy', 'true'); b.firstChild.textContent = t.working;
      const out = await run();
      if (!out) return; // navigating to Stripe
      b.disabled = false; b.removeAttribute('aria-busy'); b.firstChild.textContent = label;
      if (out.expired) return show(t.expiredT, t.expired, [link(t.getLink, inLang(billingHref, '/pages/es-facturacion'), true)]);
      fact.hidden = false; fact.textContent = out.text; fact.setAttribute('role', 'alert');
    });
    return b;
  };
  // A handoff works once, so every failure offers a fresh billing link rather than a retry of the same one.
  const fail = (title, line) => show(title, line, [link(t.getLink, inLang(billingHref, '/pages/es-facturacion'), true)]);

  hero.setAttribute('aria-busy', 'true'); h1.textContent = t.opening; text.hidden = true; acts.hidden = true; fact.hidden = true;
  document.documentElement.classList.remove('owner-loading');
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
    const st = s.data;
    setZone(st);
    // The handoff always lands on the English Plans page (/pages/plans#handoff=…, no query), so the Owner chooses the billing
    // language here. It changes these words, the dates and the {lang} sent to Checkout and the Portal, where Stripe's pages
    // and the return pages follow it. Nothing is stored and the address isn't changed.
    const copy = hero.querySelector('.hcopy');
    const choice = document.createElement('div'); choice.className = 'owner-lang'; choice.setAttribute('role', 'group');
    const render = focus => {
      const v = ownerView(st), back = safeUrl(st.applicationUrl);
      const buttons = v.acts.map(a => a === 'quote' ? link(t.quote, inLang(quoteHref, '/pages/es-contacto'), true) : button(a === 'portal' ? t.manage : t.subscribe, () => openBilling(a)));
      if (back) buttons.push(link(t.back, back, false));
      copy.lang = lang;
      show(st.businessName || t.yourPlan, v.line, buttons, [v.fact, zone ? '' : t.utc].filter(Boolean).join(' '), focus);
      choice.setAttribute('aria-label', t.langQ);
      choice.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
      fact.after(choice);
    };
    for (const [code, label] of [['en', 'English'], ['es', 'Español']]) {
      const b = document.createElement('button'); b.type = 'button'; b.dataset.lang = code; b.lang = code; b.textContent = label;
      b.addEventListener('click', () => { if (code === lang) return; setLang(code); render(false); b.focus(); });
      choice.append(b);
    }
    render(true);
    // The page is now the Owner's own plan: the trial walkthrough and the header's Start free trial are for new businesses.
    document.documentElement.classList.add('owner-view');
    // The price card starts at the business's real team size (active employees, Owners excluded).
    if (priceCard) priceCard.set(st.activeEmployees);
  })();
}

/* ---------- The retired setup page: scrub an old one-time link so it never stays in the address bar ---------- */
if (document.querySelector('[data-verify-retired]')) takeFragment('token');

/* ---------- Plan and billing, and Confirming payment ---------- */
const AW = { es: {
  opening: ['Abriendo tu facturación.', 'Un momento mientras revisamos tu enlace.'],
  expired: ['Este enlace venció.', 'Cada enlace de facturación funciona una vez y por poco tiempo. Abre la facturación otra vez desde NEVORA, en Configuración.'],
  session: ['Tu sesión terminó.', 'Por seguridad, abre la facturación otra vez desde NEVORA, en Configuración.'],
  down: ['Facturación no disponible.', 'No pudimos conectar con NEVORA. No se cobró nada. Intenta de nuevo en unos minutos.'],
  newLink: 'Cómo abrir la facturación',
  signOut: 'Salir', signedOut: ['Saliste de la facturación.', 'Para volver, abre la facturación desde NEVORA, en Configuración.'],
  trialOn: 'Tu prueba gratis está activa.', paidOn: 'Tu plan está activo.',
  plan: 'Plan', free: 'Prueba gratis', perMonth: p => p + ' al mes', trialEnds: 'La prueba termina', paidThrough: 'Pagado hasta', payBy: 'Paga antes del', employees: 'Empleados', of: (n, l) => n + ' de ' + l,
}, en: {
  opening: ['Opening your billing.', 'One moment while we check your link.'],
  expired: ['This link has expired.', 'Each billing link works once and for a short time. Open billing again from NEVORA, in Settings.'],
  session: ['Your session ended.', 'For your security, open billing again from NEVORA, in Settings.'],
  down: ['Billing isn’t available right now.', 'We couldn’t reach NEVORA. Nothing was charged. Try again in a few minutes.'],
  newLink: 'How to open billing',
  signOut: 'Sign out', signedOut: ['You’re signed out of billing.', 'To come back, open billing from NEVORA, in Settings.'],
  trialOn: 'Your free trial is running.', paidOn: 'Your plan is active.',
  plan: 'Plan', free: 'Free trial', perMonth: p => p + ' a month', trialEnds: 'Trial ends', paidThrough: 'Paid through', payBy: 'Pay by', employees: 'Employees', of: (n, l) => n + ' of ' + l,
} };
const RW = { es: {
  checking: ['Confirmando el pago.', 'Estamos revisando tu suscripción con NEVORA. Esta página se actualiza sola.'],
  done: ['Ya estás suscrito.', null],
  trialKept: d => 'Tu plan empieza cuando termine tu prueba gratis, el ' + d + '. Conservas todos los días de prueba.',
  paidKept: d => 'NEVORA está pagado hasta el ' + d + '.',
  updated: ['Facturación actualizada.', 'Tus datos de facturación están al día.'],
  waiting: ['Todavía no vemos un pago.', 'Si terminaste de pagar, puede tardar unos minutos en llegar y tu plan se actualiza solo. Si saliste del pago, no se cobró nada.'],
  failed: ['Tu pago no se completó.', 'No se cobró nada. Actualiza tu tarjeta en la facturación e intenta de nuevo.'],
  billing: 'Plan y facturación', retry: 'Intenta de nuevo',
}, en: {
  checking: ['Confirming payment.', 'We’re checking your subscription with NEVORA. This page updates by itself.'],
  done: ['You’re subscribed.', null],
  trialKept: d => 'Your plan starts when your free trial ends on ' + d + '. You keep every trial day.',
  paidKept: d => 'NEVORA is paid through ' + d + '.',
  updated: ['Billing updated.', 'Your billing details are up to date.'],
  waiting: ['We haven’t seen a payment yet.', 'If you finished paying, it can take a few minutes to arrive, and your plan updates by itself. If you left checkout, nothing was charged.'],
  failed: ['Your payment didn’t go through.', 'Nothing was charged. Update your card in billing and try again.'],
  billing: 'Plan and billing', retry: 'Try again',
} };
let A = AW[lang], R = RW[lang];
function accountShell(root) {
  const h1 = root.querySelector('h1'), lede = root.querySelector('[data-setup-lede]'), acts = root.querySelector('[data-setup-acts]'), card = root.querySelector('[data-setup-card]');
  const form = root.querySelector('form');
  const ui = {
    h1, lede, acts, card, form, title: h1.textContent, text: lede.textContent,
    head: ([title, line], focus) => { h1.textContent = title; lede.textContent = line || ''; lede.hidden = !line; if (focus) h1.focus(); },
    buttons: list => { acts.replaceChildren(...list); acts.hidden = !list.length; },
    link: (label, href, fill) => { const a = document.createElement('a'); a.className = 'hb' + (fill ? ' fill' : ''); a.href = href; a.innerHTML = '<span></span>' + ARROW; a.firstChild.textContent = label; return a; },
    button: (label, run, fill = true) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'hb' + (fill ? ' fill' : ''); b.innerHTML = '<span></span>' + ARROW; b.firstChild.textContent = label; b.addEventListener('click', () => run(b)); return b; },
    show: what => { if (form) form.hidden = what !== 'form'; card.hidden = what !== 'card'; },
    rows: st => {
      const esc = x => String(x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
      const row = (k, v) => '<div><dt>' + k + '</dt><dd><span>' + esc(v) + '</span></dd></div>';
      const price = { small: '$19', team: '$29' }[st.plan];
      let html = row(A.plan, price ? A.perMonth(price) : A.free);
      if (st.state === 'trial' && st.trialEndsAt) html += row(A.trialEnds, day(st.trialEndsAt));
      if (st.paidThrough && st.state !== 'trial') html += row(A.paidThrough, day(st.paidThrough));
      if (st.graceEndsAt && st.state === 'grace') html += row(A.payBy, day(st.graceEndsAt));
      if (st.setup === 'ready' || !st.setup) html += row(A.employees, A.of(st.activeEmployees, st.employeeLimit));
      return '<dl class="setup-facts">' + html + '</dl>';
    },
  };
  return ui;
}
/** Exchange a one-time #handoff= (from NEVORA or Stripe) for a session and read the status. */
async function openSession(value) {
  const x = await call('/v1/handoff/exchange', { method: 'POST', body: { token: value } });
  if (!x.ok || !x.data || typeof x.data.accessToken !== 'string') return { problem: x.status === 400 || x.status === 401 ? 'expired' : 'down' };
  setToken(x.data.accessToken);
  const st = await call('/v1/status', { auth: true });
  if (!st.ok || !st.data) return { problem: st.status === 401 ? 'session' : 'down' };
  setZone(st.data);
  return { status: st.data };
}
function billingPage(root) {
  const ui = accountShell(root);
  const quoteHref = (document.querySelector('a[href*="interest=nevora"]') || {}).href || '/pages/contact?interest=nevora';
  // Without a handoff (or after one ends) the page shows how to open billing and billing support: the rendered words.
  const offs = [...root.querySelectorAll('[data-off]')], offActs = [...ui.acts.childNodes];
  const toInstructions = head => { ui.head(head, true); offs.forEach(x => { x.hidden = false; }); ui.buttons(offActs); ui.show('none'); };
  function status(st) {
    const v = ownerView(st);
    // The rows carry the dates and the price, so a healthy plan's line says only how it stands.
    const brief = st.reason ? v.line : st.state === 'trial' ? A.trialOn : st.state === 'paid' ? A.paidOn : v.line;
    ui.head([st.businessName || t.yourPlan, brief], true);
    const actions = v.acts.map(a => a === 'quote' ? ui.link(t.quote, quoteHref, true) : ui.button(a === 'portal' ? t.manage : t.subscribe, async b => {
      b.disabled = true; b.setAttribute('aria-busy', 'true'); const label = b.firstChild.textContent; b.firstChild.textContent = t.working;
      const out = await openBilling(a); if (!out) return;
      b.disabled = false; b.removeAttribute('aria-busy'); b.firstChild.textContent = label;
      if (out.expired) return toInstructions(A.session);
      note.textContent = out.text; note.setAttribute('role', 'alert');
    }));
    const back = safeUrl(st.applicationUrl);
    if (back) actions.push(ui.link(t.back, back, false));
    ui.buttons(actions);
    ui.card.innerHTML = ui.rows(st) + '<p class="setup-note"></p><button class="setup-out" type="button">' + A.signOut + '</button>';
    const note = ui.card.querySelector('.setup-note'); note.textContent = [v.fact, zone ? '' : t.utc].filter(Boolean).join(' ');
    ui.card.querySelector('.setup-out').addEventListener('click', async () => { await call('/v1/logout', { method: 'POST', body: {}, auth: true }); clearToken(); toInstructions(A.signedOut); });
    ui.show('card');
  }
  const handoff = /^#handoff=/.test(location.hash) ? takeFragment('handoff') : (takeFragment('token'), null); // an old #token= sign-in link is scrubbed and ignored
  if (!handoff || !configured()) return; // the rendered instructions stay
  offs.forEach(x => { x.hidden = true; });
  ui.head(A.opening, false); ui.buttons([]); ui.show('none'); root.setAttribute('aria-busy', 'true');
  openSession(handoff).then(r => {
    root.removeAttribute('aria-busy');
    if (r.problem) return toInstructions(A[r.problem]);
    status(r.status);
  });
}
/** Stripe sends the Owner back with a one-time #handoff=. Coming back proves nothing: we poll the status until the plan
 * shows the subscription (or a failure), for about two minutes, then say honestly that it hasn't arrived yet. */
function returnPage(root) {
  const ui = accountShell(root);
  root.querySelectorAll('[data-off]').forEach(x => { x.hidden = true; });
  const billingHref = (document.querySelector('a[href*="nevora-billing"],a[href*="es-facturacion"]') || {}).href || (ES ? '/pages/es-facturacion' : '/pages/nevora-billing');
  const handoff = takeFragment('handoff');
  const stop = (text, list) => { ui.head(text, true); ui.buttons(list); ui.show('none'); };
  if (!handoff) return stop(A.expired, [ui.link(t.getLink, billingHref, true)]);
  ui.head(R.checking, false); ui.buttons([]);
  ui.card.innerHTML = '<ol class="setup-steps"><li data-state="done">' + (ES ? 'Volviste del pago' : 'Back from checkout') + '</li><li data-state="now" aria-current="step">' + (ES ? 'Confirmando con NEVORA' : 'Confirming with NEVORA') + '</li><li data-state="next">' + (ES ? 'Plan actualizado' : 'Plan updated') + '</li></ol>';
  ui.show('card'); root.setAttribute('aria-busy', 'true');
  const started = Date.now(); let first = null, timer = 0;
  const finish = (st, kind) => {
    root.removeAttribute('aria-busy'); clearTimeout(timer);
    const back = safeUrl(st.applicationUrl), list = [];
    if (kind === 'done') {
      const line = st.state === 'trial' && st.trialEndsAt ? R.trialKept(day(st.trialEndsAt)) : st.paidThrough ? R.paidKept(day(st.paidThrough)) : '';
      ui.head([R.done[0], line], true);
      if (back) list.push(ui.link(t.back, back, true));
    } else if (kind === 'updated') {
      ui.head([R.updated[0], ownerView(st).line], true);
      if (back) list.push(ui.link(t.back, back, true));
    } else if (kind === 'failed') {
      ui.head(R.failed, true); list.push(ui.button(t.manage, async b => { b.disabled = true; const out = await openBilling('portal'); if (out) { b.disabled = false; ui.lede.textContent = out.text; } }));
      if (back) list.push(ui.link(t.back, back, false));
    } else {
      ui.head(R.waiting, true); list.push(ui.link(R.billing, billingHref, true));
      if (back) list.push(ui.link(t.back, back, false));
    }
    ui.buttons(list); ui.card.innerHTML = ui.rows(st) + '<p class="setup-note"></p>'; ui.card.querySelector('.setup-note').textContent = t.stripe + (zone ? '' : ' ' + t.utc); ui.show('card');
  };
  const judge = st => {
    if (!first) first = st;
    if (st.reason === 'payment_failed' && st.state !== 'grace') return 'failed';
    if (st.reason === 'subscription_canceled' && st.state === 'paid') return 'updated';
    const covered = (st.state === 'paid' || st.state === 'trial' || st.state === 'grace') && st.plan;
    if (covered && st.reason !== 'payment_failed') {
      // A plan that was already there when we arrived may be a portal visit: still a good outcome, the details are current.
      return 'done';
    }
    return null;
  };
  async function poll() {
    if (document.visibilityState !== 'visible' || !navigator.onLine) return;
    const r = await call('/v1/status', { auth: true });
    if (r.status === 401) return stop(A.session, [ui.link(t.getLink, billingHref, true)]);
    if (r.ok && r.data) { setZone(r.data); const k = judge(r.data); if (k) return finish(r.data, k); if (Date.now() - started > 120000) return finish(r.data, 'waiting'); }
    timer = setTimeout(poll, Date.now() - started < 30000 ? 3000 : 6000);
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && root.hasAttribute('aria-busy')) { clearTimeout(timer); poll(); } });
  (async () => {
    const x = await call('/v1/handoff/exchange', { method: 'POST', body: { token: handoff } });
    if (!x.ok || !x.data || typeof x.data.accessToken !== 'string') { root.removeAttribute('aria-busy'); return stop(x.status === 400 || x.status === 401 ? A.expired : A.down, [ui.link(t.getLink, billingHref, true)]); }
    setToken(x.data.accessToken); poll();
  })();
}
const accountRoot = document.querySelector('[data-account-page]');
if (accountRoot && configured()) (accountRoot.dataset.accountPage === 'billing' ? billingPage : returnPage)(accountRoot);
else if (accountRoot) takeFragment('handoff'); // billing is off: scrub any one-time link and keep the billing-support words

/* ---------- Plans: the team-size price card ---------- */
function pcard(root) {
  const t = W[PAGE_LANG]; // the card is part of the page, so it keeps the page's language
  const range = root.querySelector('#pc-n'), out = root.querySelector('[data-count]'), unit = root.querySelector('[data-unit]');
  const amt = root.querySelector('[data-amt]'), per = root.querySelector('[data-per]'), note = root.querySelector('[data-note]');
  const ticks = [...root.querySelectorAll('.pc-meter i')], steps = [...root.querySelectorAll('[data-step]')];
  const baseNote = note.textContent, mine = document.querySelector('[data-price-mine]'), live = root.querySelector('[data-pc-live]');
  let said = false, timer = 0;
  const set = value => {
    const n = Math.max(1, Math.min(31, Math.round(Number(value) || 1)));
    range.value = String(n); root.dataset.n = String(n);
    const team = n > 15, over = n > 30, price = team ? '$29' : '$19';
    out.textContent = over ? t.over30 : String(n); unit.textContent = over ? t.emp(2) : t.emp(n);
    amt.textContent = over ? t.quoted : price; per.hidden = over; note.textContent = over ? t.quoteNote : baseNote;
    ticks.forEach((tick, i) => { tick.className = i < Math.min(n, 30) ? 'pc-on' : (!over && i < (team ? 30 : 15)) ? 'pc-in' : ''; });
    range.setAttribute('aria-valuetext', t.valueText(n, price));
    steps[0].disabled = n <= 1; steps[1].disabled = n >= 31;
    if (mine) { mine.innerHTML = over ? t.mineOver : t.mine(n, price); mine.hidden = false; }
    if (live && said) { clearTimeout(timer); timer = setTimeout(() => { live.textContent = over ? out.textContent + '. ' + amt.textContent : t.valueText(n, price); }, 350); }
    said = true;
  };
  range.disabled = false; steps.forEach(b => { b.hidden = false; b.addEventListener('click', () => set(Number(range.value) + Number(b.dataset.step))); });
  range.addEventListener('input', () => set(range.value));
  set(range.value);
  return { set };
}
const cardRoot = document.querySelector('[data-pcard]');
const priceCard = cardRoot ? pcard(cardRoot) : null;
if (document.getElementById('top') && cardRoot) plans();
