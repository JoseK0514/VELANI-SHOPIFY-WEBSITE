// "Night" design (approved 2026-11-02): header, footer, Home and NEVORA bodies, and NEVORA policy pages.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { company, routes } from './content.mjs';
import { CHROME_ES, ES_PATHS } from './content.es.mjs';
import { POLICY_DOCS, POLICY_FACTS } from './nevora-policies.mjs';

const dir = path.join(import.meta.dirname, 'night');
const read = name => readFileSync(path.join(dir, name), 'utf8');
const root = path.join(import.meta.dirname, '..');
const svgCache = new Map();
export function icon(name) {
  if (!svgCache.has(name)) {
    const raw = readFileSync(path.join(root, 'node_modules/@phosphor-icons/core/assets/regular/' + name + '.svg'), 'utf8');
    svgCache.set(name, raw.replace(/\s(width|height)="[^"]*"/g, '').replace('<svg ', '<svg class="icon" aria-hidden="true" focusable="false" '));
  }
  return svgCache.get(name);
}
const asset = (name, target) => target === 'shopify' ? "{{ '" + name + "' | asset_url }}" : '/assets/' + name;
const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** Links on a Spanish page go to the Spanish version of a page when one exists (query and #section kept). A link marked
 * hreflang="en" (the language switch, pages only in English) is left alone. */
export function localize(html, lang) {
  if (lang !== 'es') return html;
  return html.replace(/href="(\/[^"#?\s]*)([?#][^"\s]*)?"(?! hreflang="en")/g, (attribute, path, tail = '') => ES_PATHS[path] ? 'href="' + ES_PATHS[path] + tail + '"' : attribute);
}
/** The time-clock demo's Spanish words come from kiosk.js's own table, so the server-rendered Spanish page and the script agree. */
export const KIOSK_ES = (() => { const m = read('kiosk.js').match(/const ES=(\{[^}]*\});/); if (!m) throw new Error('night: kiosk ES table not found'); return JSON.parse(m[1].replace(/'/g, '"')); })();
function kiosk(lang) {
  const html = read('kiosk.html');
  if (lang !== 'es') return html;
  // The demo starts in Spanish on Spanish pages: same markup, Spanish words, and the switch offers English
  return html
    .replace('<div class="kio" id="kio">', '<div class="kio" id="kio" lang="es">')
    .replace(/data-k-t="([^"]+)">([^<]*)</g, (_, en) => 'data-k-t="' + en + '">' + (KIOSK_ES[en] || en) + '<')
    .replace(/aria-label="([^"]+)" data-k-l="([^"]+)"/g, (_, label, en) => 'aria-label="' + (KIOSK_ES[en] || en) + '" data-k-l="' + en + '"')
    .replace('<span id="kio-lang-t" lang="es">Español</span>', '<span id="kio-lang-t" lang="en">English</span>')
    .replace('<small id="kio-ap">PM</small>', '<small id="kio-ap">p.\u00a0m.</small>')
    .replace('Tuesday, October 27', 'Martes, 27 de octubre')
    .replace('Oct 27&nbsp;· 2:17 PM</b><span id="kio-dot">.</span>', '27 oct&nbsp;· 2:17 p.\u00a0m.</b><span id="kio-dot"></span>');
}
/** Turn a prototype fragment into site markup: icons inline, images from theme assets, real routes. */
/** Rondo's mark: a round badge with the R and a three-quarter ring of light (the same markup everywhere; size comes from the context) */
const RONDO_MARK = (cls = '') => '<b class="rmark' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><svg viewBox="0 0 32 32" focusable="false"><circle cx="16" cy="16" r="14.25"/><path d="M16 1.75A14.25 14.25 0 1 1 1.75 16"/></svg>R</b>';
export function site(html, target, lang = 'en') {
  return html
    .replace('{{kiosk}}', () => kiosk(lang))
    .replace(/\{\{icon:([\w-]+)\}\}/g, (_, n) => icon(n))
    .replace(/\{\{wordmark\}\}/g, () => WORDMARK)
    .replace(/\{\{rondo(?::([\w -]+))?\}\}/g, (_, cls) => RONDO_MARK(cls))
    .replace(/src="img\/([\w.-]+)\.webp"/g, (_, n) => 'src="' + asset('night-' + n + '.webp', target) + '"')
    .replace(/href="img\/([\w.-]+)\.webp"/g, (_, n) => 'href="' + asset('night-' + n + '.webp', target) + '"')
    .replace(/src="img\/([\w.-]+)\.png"/g, (_, n) => 'src="' + asset('night-' + n + '.png', target) + '"')
    .replace(/href="home\.html"/g, 'href="/"')
    .replace(/href="nevora\.html(#[\w-]+)?"/g, (_, h) => 'href="/pages/nevora' + (h || '') + '"')
    .replace(/interest=project/g, 'interest=custom-software')
    .replace(/ data-live="[^"]*"/g, '');
}

const between = (text, start, end) => { const s = text.indexOf(start); const t = text.indexOf(end, s); if (s < 0 || t < 0) throw new Error('night: marker not found ' + start); return text.slice(s, t); };
const SRC = { en: { home: read('home.body.html'), nevora: read('nevora.body.html'), products: read('products.body.html') }, es: { home: read('home.es.body.html'), nevora: read('nevora.es.body.html'), products: read('products.es.body.html') } };
const mainOf = src => between(src, '<main id="main">', '</main>').slice('<main id="main">'.length);

/** Inside <main> for Home, NEVORA and Products. The NEVORA local nav sits at the top of its section content. */
export function homeMain(target, lang = 'en') { return localize(site(mainOf(SRC[lang].home), target, lang), lang); }
// The global header is hidden on the NEVORA page, so its local nav carries the language switch (wide bar and narrow menu)
export function nevoraMain(target, lang = 'en') { const src = SRC[lang].nevora; return localize(site(mainOf(src), target, lang).replace(/\{\{lang:([\w-]+)\}\}/g, (_, cls) => langSwitch(lang, { en: '/pages/nevora', es: '/pages/es-nevora' }, ' ' + cls)), lang); }
export function productsMain(target, lang = 'en') { return localize(site(mainOf(SRC[lang].products), target, lang), lang); }

/* Products: one header item with a short menu (NEVORA Workforce, Rondo, NEVORA Relay); the phone menu lists them under a Products label. */
const PRODUCTS = [['NEVORA Workforce', '/pages/nevora', 'Scheduling, time clock and payroll calculation'], ['Rondo in NEVORA', '/pages/nevora#rondo', 'The assistant that answers the Owner’s questions'], ['NEVORA Relay<span class="nav-soon">In design</span>', '/pages/nevora#relay', 'Orders, kitchen display and inventory']];
const NAV = [['Websites', '/pages/custom-development#web-applications', 'websites'], ['Custom apps', '/pages/custom-development', 'services'], ['Plans', '/pages/plans', 'plans'], ['Support', '/pages/help', 'help'], ['About', '/pages/about', 'about']];
/** Header menus (Nov 7 flow map): [key, label, nav keys that mark it current, items [name, href, note]]. */
const GROUPS = [
  ['nevora', 'NEVORA', ['nevora', 'products', 'plans'], [PRODUCTS[0], ['Plans and pricing', '/pages/plans', 'Free for 30 days, then one price per business'], ...PRODUCTS.slice(1)]],
  ['custom', 'Custom software', ['services', 'websites'], [['Websites', '/pages/custom-development#web-applications', 'Sites that bring in calls and bookings'], ['Booking apps', '/pages/custom-development#booking', 'Booking, reminders and rewards cards'], ['Online stores', '/pages/custom-development#online-stores', 'Products, delivery pricing and payment'], ['Business tools', '/pages/custom-development#business-systems', 'Requests, approvals and records in one place']]],
  ['company', 'Company', ['about', 'help', 'contact'], [['About', '/pages/about', 'What we make and how we work'], ['Support', '/pages/help', 'Monday to Friday, 8 am to 9 pm ET'], ['Contact', '/pages/contact', 'Start a project or ask a question']]],
];
/** The client page: NEVORA's sign-in, and requests for new work or help from Velani clients. */
const SIGN_IN = '/pages/sign-in';
/** The words of the header, the phone menu and the language switch, per language (Spanish in src/content.es.mjs). */
export const CHROME = {
  en: { skip: 'Skip to content', home: 'Velani home', main: 'Main', mainMenu: 'Main menu', menu: 'Menu', products: 'Products', productsMenu: 'Products menu', productsList: PRODUCTS, nav: NAV, groups: GROUPS, signIn: 'Sign in', signInHref: SIGN_IN, rondoNevora: 'Rondo in NEVORA', rondoSoon: 'In development', relaySoon: 'Soon', contact: 'Contact', trial: 'Request a free trial', trialLong: 'Request a free NEVORA trial', project: 'Start a project', support: 'Client support', hours: company.hours, brandOf: 'Velani is a brand of ', langGroup: 'Language', closingLine: 'Try NEVORA free, or tell us what you want built.' },
  es: CHROME_ES,
};
/** In the Shopify layout the two destinations are computed once per page (main theme or draft), see renderShopifyLayout. */
export const SHOPIFY_LANG_HREFS = { en: '{{ velani_en_href }}', es: '{{ velani_es_href }}' };
/** EN | ES: two links, the current language marked; each option is named and spoken in its own language. */
export function langSwitch(lang, hrefs, cls = '') {
  const opt = (code, name, href) => `<a href="${href}" hreflang="${code}" lang="${code}" aria-label="${name}"${code === lang ? ' aria-current="true"' : ''}>${code.toUpperCase()}</a>`;
  return `<span class="lang-sw${cls}" role="group" aria-label="${CHROME[lang].langGroup}">${opt('en', 'English', hrefs.en)}<span class="lang-sep" aria-hidden="true">|</span>${opt('es', 'Español', hrefs.es)}</span>`;
}
/** current: the nav key for the preview build, or null in the Shopify layout, where Liquid marks it. */
// Official VELANI wordmark, traced 1:1 from docs/reference/velani-logo-official.pdf; colour comes from CSS.
export const WORDMARK = readFileSync(new URL('./brand/velani-wordmark.svg', import.meta.url), 'utf8').trim()
  .replace(/^<svg[^>]*viewBox="([^"]*)"[^>]*>/, '<svg class="wm-velani" viewBox="$1" fill="currentColor" aria-hidden="true" focusable="false">');
export function header(current, target, { nevora = false, lang = 'en', hrefs = SHOPIFY_LANG_HREFS } = {}) {
  const t = CHROME[lang], nevoraSlug = lang === 'es' ? 'es-nevora' : 'nevora';
  const mark = key => target === 'shopify'
    ? `{% if velani_nav == '${key}' %} aria-current="page"{% endif %}`
    : (current === key ? ' aria-current="page"' : '');
  const productsMark = target === 'shopify'
    ? `{% if velani_nav == 'nevora' or velani_nav == 'products' %} aria-current="page"{% endif %}`
    : (current === 'nevora' || current === 'products' ? ' aria-current="page"' : '');
  // Three menus, each a disclosure: only its button opens and closes it (Escape, a click outside or leaving it also closes it); one open at a time
  const groupMark = keys => target === 'shopify'
    ? `{% if ${keys.map(k => `velani_nav == '${k}'`).join(' or ')} %} data-cur{% endif %}`
    : (keys.includes(current) ? ' data-cur' : '');
  const enOnly = href => lang === 'es' && !ES_PATHS[href.split(/[?#]/)[0]] ? ' hreflang="en"' : '';
  const plain = html => html.replace(/<[^>]+>/g, '');
  const links = t.groups.map(([key, label, keys, items]) => `<li class="gnav-dd"><button class="gnav-ddbtn txt" type="button" aria-expanded="false" aria-controls="gnav-dd-${key}"${groupMark(keys)}>${label}${icon('caret-down')}</button><div class="gnav-ddmenu" id="gnav-dd-${key}"><ul aria-label="${plain(label)}">` + items.map(([name, href, note]) => `<li><a href="${href}"${enOnly(href)}><b>${name}</b><span>${note}</span></a></li>`).join('') + '</ul></div></li>').join('');
  const signIn = cls => `<a class="${cls}" href="${t.signInHref}"${enOnly(t.signInHref)}${mark('signin')}>${t.signIn}</a>`;
  const menu = signIn('gmenu-signin') + t.groups.map(([, label, , items]) => `<p class="gmenu-k">${label}</p>` + items.map(([name, href]) => `<a class="gmenu-sub" href="${href}"${enOnly(href)}>${name}</a>`).join('')).join('');
  const staticClass = '';
  const cta = (cls, trial) => target === 'shopify' ? `{% if velani_nav == 'services' %}<a class="${cls}" href="/pages/contact?interest=custom-software">${t.project}</a>{% else %}<a class="${cls}" href="/pages/contact?interest=nevora-demo">${trial}</a>{% endif %}` : (current === 'services' ? `<a class="${cls}" href="/pages/contact?interest=custom-software">${t.project}</a>` : `<a class="${cls}" href="/pages/contact?interest=nevora-demo">${trial}</a>`);
  const html = `<a class="skip" href="#main">${t.skip}</a><header class="gnav${staticClass}" id="gnav"><nav class="wrap gnav-in" aria-label="${t.main}"><a class="wordmark" href="/" aria-label="${t.home}">${WORDMARK}</a><ul class="gnav-links">${links}</ul>${langSwitch(lang, hrefs, ' gnav-lang')}${signIn('gnav-signin')}${cta('pill line', t.trial)}<button class="gnav-menu" id="gmenu-btn" type="button" aria-expanded="false" aria-controls="gmenu" aria-label="${t.menu}"><span class="i-open">${icon('list')}</span><span class="i-close" hidden>${icon('x')}</span></button></nav></header><div class="gmenu" id="gmenu" hidden><nav class="wrap" aria-label="${t.mainMenu}">${menu}${langSwitch(lang, hrefs, ' gmenu-lang')}${cta('pill', t.trialLong)}<small>${t.support} · <a href="mailto:${company.email}">${company.email}</a>${company.phone ? ` · <a href="tel:+1${company.phone.replace(/-/g, '')}">${company.phone}</a>` : ''} · ${t.hours}<br>${t.brandOf}${company.operator}.</small></nav></div>`;
  return localize(html, lang);
}
export function footer(target, { lang = 'en', hrefs = SHOPIFY_LANG_HREFS } = {}) { return localize(site(read(lang === 'es' ? 'foot.es.html' : 'foot.html'), target).replace('{{lang}}', () => langSwitch(lang, hrefs, ' foot-lang')), lang); }
/** Custom development: client screenshots open full screen (an inline script at the end of the section). */
export function zoomScript(target) { return site(read('zoom.html'), target); }
/** The assistant launcher and panel; the API address is filled in by the layout (theme setting or preview environment). */
export function assistant(target, apiAttribute) { return site(read('assist.html'), target).replace('<div class="ast-root" id="ast-root" hidden>', '<div class="ast-root" id="ast-root" hidden data-api="' + apiAttribute + '">'); }

export const nightAssets = {
  css: { base: read('base.css'), home: read('home.css'), nevora: read('nevora.css'), pages: read('pages.css'), kiosk: read('kiosk.css'), assist: read('assist.css'), polish: read('polish.css') },
  js: { motion: read('motion.js'), nevora: read('nevora.js') + '\n' + read('kiosk.js'), assist: read('assist.js'), assistClient: read('velani-assistant.js'), commerce: read('commerce.js') },
};

/* NEVORA policy pages (Privacy, Support, Account deletion, Terms), from the NEVORA app's approved policy source. */
const APP_ONLY = new Set(['/login', '/forgot-access']);
const POLICY_ROUTE = { '/privacy': '/pages/nevora-privacy', '/terms': '/pages/nevora-terms', '/support': '/pages/nevora-support', '/account-deletion': '/pages/nevora-account-deletion' };
function inline(parts) {
  return parts.map(x => {
    if (typeof x === 'string') return e(x);
    if (x.fact) return e(POLICY_FACTS[x.fact]);
    if (x.strong) return '<strong>' + e(x.strong) + '</strong>';
    if (x.href) {
      if (APP_ONLY.has(x.href)) return e(x.text);
      return '<a href="' + e(POLICY_ROUTE[x.href] || x.href) + '">' + e(x.text) + '</a>';
    }
    return '';
  }).join('');
}
/** The website names each policy page ("NEVORA privacy policy"); the policy source keeps its own document titles. */
const siteTitle = slug => routes[POLICY_ROUTE['/' + slug]]?.title || POLICY_DOCS.find(d => d.slug === slug).title;
export function policyMain(slug) {
  const doc = POLICY_DOCS.find(d => d.slug === slug);
  const others = POLICY_DOCS.filter(d => d.slug !== slug);
  const toc = doc.sections.map((s, i) => `<a href="#p-${i}">${e(s.heading)}</a>`).join('');
  const body = doc.sections.map((s, i) => `<section id="p-${i}"><i>${String(i + 1).padStart(2, '0')}</i><h2>${e(s.heading)}</h2>${s.blocks.map(b => b.p ? `<p>${inline(b.p)}</p>` : b.steps ? `<ol>${b.steps.map(li => `<li>${inline(li)}</li>`).join('')}</ol>` : `<ul>${b.list.map(li => `<li>${inline(li)}</li>`).join('')}</ul>`).join('')}</section>`).join('');
  const eff = doc.effective ? `<p class="doc-meta">Effective ${e(POLICY_FACTS.EFFECTIVE_DATE)}</p>` : '';
  return `<section class="phero"><div class="wrap"><h1 class="t1 rise">${e(siteTitle(slug))}</h1><p class="lede fade">${e(doc.summary)}</p>${eff}</div></section><section class="doc"><div class="wrap doc-grid"><div class="doc-aside"><details class="doc-toc" open><summary class="doc-aside-t">On this page</summary><nav aria-label="Page contents">${toc}</nav></details><p class="doc-aside-t">Also for NEVORA</p><nav aria-label="Other NEVORA pages">${others.map(d => `<a href="${POLICY_ROUTE['/' + d.slug]}">${e(siteTitle(d.slug))}</a>`).join('')}</nav></div><div class="doc-body">${body}<div class="doc-end"><h2 class="t3">Questions</h2><p>Write to <a href="mailto:${company.email}">${company.email}</a>${body.includes(e(company.address)) ? '' : ', or to ' + e(company.operator) + ', ' + e(company.address)}.</p><div class="acts">${slug === 'support' ? '<a class="pill line" href="/pages/contact">Contact page</a>' : '<a class="pill line" href="/pages/nevora-support">NEVORA support</a>'}</div></div></div></div></section>`;
}
