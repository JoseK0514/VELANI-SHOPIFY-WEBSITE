// "Day" design (approved 2026-11-20): header, phone menu, footer and page bodies for the pages that have moved from Night.
// A route opts in with design: 'day' (src/content.mjs); every other route keeps the Night design until it moves.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { company } from './content.mjs';
import { ES_PATHS } from './content.es.mjs';
import { localize, langSwitch, WORDMARK, SHOPIFY_LANG_HREFS } from './night.mjs';

const dir = path.join(import.meta.dirname, 'day');
const root = path.join(import.meta.dirname, '..');
const read = name => readFileSync(path.join(dir, name), 'utf8');
const svgCache = new Map();
/** Phosphor bold icons (Day uses the bold weight beside 17px text); decorative, the text beside them carries the meaning. */
export function dayIcon(name) {
  if (!svgCache.has(name)) {
    const raw = readFileSync(path.join(root, 'node_modules/@phosphor-icons/core/assets/bold/' + name + '-bold.svg'), 'utf8');
    svgCache.set(name, raw.replace(/\s(width|height)="[^"]*"/g, '').replace('<svg ', '<svg class="dic" aria-hidden="true" focusable="false" '));
  }
  return svgCache.get(name);
}
const CHEV = '<svg class="dic chev" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><path d="M3 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/** The words of the Day header, phone menu and footer per language. Hrefs are English paths; localize() moves them to Spanish. */
export const DAY_CHROME = {
  en: {
    skip: 'Skip to content', home: 'Velani home', main: 'Main', menu: 'Open menu', closeMenu: 'Close menu', menuDialog: 'Menu',
    nav: [['NEVORA', '/pages/nevora', ['nevora']], ['Rondo', '/pages/rondo', ['rondo']], ['Relay', '/pages/relay', ['relay']], ['Plans', '/pages/plans', ['plans']], ['Support', '/pages/help', ['help', 'contact', 'nevora-help']]],
    signIn: 'Sign in', trialShort: 'Free trial', trial: 'Request a free trial',
    footer: 'Footer', legal: 'Legal notices', cookies: 'Cookie choices',
    disc: ['Screens on this website come from the NEVORA app, with fictional people and places.', 'NEVORA calculates pay from approved hours. It doesn’t pay employees or file payroll taxes. Rondo prepares changes; the Owner approves them. Relay is in design and has no release date.'],
    cols: [
      ['Products', [['NEVORA Workforce', '/pages/nevora'], ['Rondo', '/pages/rondo'], ['Relay', '/pages/relay', 'In design']]],
      ['Get started', [['Request a free trial', '/pages/contact?interest=nevora-demo'], ['Plans', '/pages/plans'], ['Sign in', '/pages/sign-in']]],
      ['Support', [['Help', '/pages/help'], ['Contact', '/pages/contact'], ['NEVORA support', '/pages/nevora-support'], ['Delete your account', '/pages/nevora-account-deletion']]],
      ['Company', [['About', '/pages/about'], ['Security', '/pages/security'], ['Accessibility', '/pages/accessibility']]],
    ],
    legalLinks: [['Legal', '/pages/legal'], ['Privacy', '/pages/privacy'], ['Cookies', '/pages/cookies'], ['Website terms', '/pages/website-terms'], ['NEVORA privacy', '/pages/nevora-privacy'], ['NEVORA terms', '/pages/nevora-terms']],
    copyright: '© 2026 VELANI LLC. All rights reserved.', hours: 'Monday to Friday, 8 am to 9 pm ET',
  },
  es: {
    skip: 'Saltar al contenido', home: 'Inicio de Velani', main: 'Principal', menu: 'Abrir menú', closeMenu: 'Cerrar menú', menuDialog: 'Menú',
    nav: [['NEVORA', '/pages/nevora', ['nevora']], ['Rondo', '/pages/rondo', ['rondo']], ['Relay', '/pages/relay', ['relay']], ['Planes', '/pages/plans', ['plans']], ['Soporte', '/pages/help', ['help', 'contact', 'nevora-help']]],
    signIn: 'Entrar', trialShort: 'Prueba gratis', trial: 'Pide la prueba gratis',
    footer: 'Pie de página', legal: 'Avisos legales', cookies: 'Opciones de cookies',
    disc: ['Las pantallas de este sitio vienen de la app NEVORA, con personas y lugares ficticios.', 'NEVORA calcula la paga a partir de las horas aprobadas. No paga a los empleados ni presenta impuestos de nómina. Rondo prepara cambios; el dueño los aprueba. Relay está en diseño y no tiene fecha de lanzamiento.'],
    cols: [
      ['Productos', [['NEVORA Workforce', '/pages/nevora'], ['Rondo', '/pages/rondo'], ['Relay', '/pages/relay', 'En diseño']]],
      ['Empieza', [['Pide la prueba gratis', '/pages/contact?interest=nevora-demo'], ['Planes', '/pages/plans'], ['Entrar', '/pages/sign-in']]],
      ['Soporte', [['Ayuda', '/pages/help'], ['Contacto', '/pages/contact'], ['Soporte de NEVORA', '/pages/nevora-support'], ['Eliminar tu cuenta', '/pages/nevora-account-deletion']]],
      ['Empresa', [['Nosotros', '/pages/about'], ['Seguridad', '/pages/security'], ['Accesibilidad', '/pages/accessibility']]],
    ],
    legalLinks: [['Legal', '/pages/legal'], ['Privacidad', '/pages/privacy'], ['Cookies', '/pages/cookies'], ['Términos del sitio', '/pages/website-terms'], ['Privacidad de NEVORA', '/pages/nevora-privacy'], ['Términos de NEVORA', '/pages/nevora-terms']],
    copyright: '© 2026 VELANI LLC. Todos los derechos reservados.', hours: 'lunes a viernes, 8 a. m. a 9 p. m. ET',
  },
};

/** On a Spanish page, a link to a page that exists only in English says so. */
const enOnly = (lang, href) => lang === 'es' && !ES_PATHS[href.split(/[?#]/)[0]] ? ' hreflang="en"' : '';
/** The current-page mark: Liquid in the theme snippet (velani_nav is set per page in the layout), plain in the preview. */
const marker = (target, current) => keys => target === 'shopify'
  ? `{% if ${keys.map(k => `velani_nav == '${k}'`).join(' or ')} %} aria-current="page"{% endif %}`
  : (keys.includes(current) ? ' aria-current="page"' : '');

export function dayHeader(current, target, { lang = 'en', hrefs = SHOPIFY_LANG_HREFS } = {}) {
  const t = DAY_CHROME[lang], mark = marker(target, current);
  const nav = t.nav.map(([label, href, keys]) => `<a href="${href}"${enOnly(lang, href)}${mark(keys)}>${label}</a>`).join('');
  const trialHref = '/pages/contact?interest=nevora-demo', signin = '/pages/sign-in';
  const html = `<a class="skip" href="#main">${t.skip}</a>`
    + `<header class="gn" id="gn"><div class="wrap"><a class="logo" href="/" aria-label="${t.home}">${WORDMARK}</a>`
    + `<nav class="gnav" aria-label="${t.main}">${nav}</nav>${langSwitch(lang, hrefs)}`
    + `<a class="signin" href="${signin}"${enOnly(lang, signin)}${mark(['signin'])}>${t.signIn}</a>`
    + `<a class="cta" href="${trialHref}">${t.trialShort}</a>`
    + `<button class="mb" type="button" aria-expanded="false" aria-controls="mm" aria-label="${t.menu}">${dayIcon('list')}</button></div></header>`
    + `<div class="mm" id="mm" role="dialog" aria-modal="true" aria-label="${t.menuDialog}" hidden><div class="mm-top"><a class="logo" href="/" aria-label="${t.home}">${WORDMARK}</a><button class="mx" type="button" aria-label="${t.closeMenu}">${dayIcon('x')}</button></div>`
    + `<nav class="mm-nav" aria-label="${t.main}">${nav}</nav>`
    + `<div class="mm-2"><a class="pillbtn" href="${trialHref}">${t.trial}</a><a class="mm-s" href="${signin}"${enOnly(lang, signin)}>${t.signIn}</a>${langSwitch(lang, hrefs)}</div></div>`;
  return localize(html, lang);
}

export function dayFooter(target, { lang = 'en', hrefs = SHOPIFY_LANG_HREFS } = {}) {
  const t = DAY_CHROME[lang];
  const a = ([label, href, note]) => `<a href="${href}"${enOnly(lang, href)}>${label}${note ? `<span class="fs">${note}</span>` : ''}</a>`;
  const html = `<footer class="ft" id="ft"><div class="wrap"><div class="disc">${t.disc.map(p => `<p>${p}</p>`).join('')}</div>`
    + `<nav class="cols" aria-label="${t.footer}">${t.cols.map(([h, links]) => `<div><h2 class="fh">${h}</h2>${links.map(a).join('')}</div>`).join('')}</nav>`
    + `<div class="base"><span>${t.copyright}</span><nav class="legal" aria-label="${t.legal}">${t.legalLinks.map(a).join('')}<button type="button" data-cookie-open data-live="the cookie choices dialog" disabled>${t.cookies}</button></nav>${langSwitch(lang, hrefs)}</div>`
    + `<p class="sup"><a href="mailto:${company.email}">${company.email}</a> · ${t.hours}</p></div></footer>`;
  return localize(html, lang);
}

const asset = (name, target) => target === 'shopify' ? "{{ '" + name + "' | asset_url }}" : '/assets/' + name;
/** The NEVORA app screens drawn in HTML (sample data), shared by the pages that show devices. */
const SCREENS = Object.fromEntries([...read('screens.html').matchAll(/<!--@(\w+)-->\n(.*?)(?=\n<!--@|$)/gs)].map(([, k, v]) => [k, v.trim()]));
const WIFI = '<svg class="wifi" viewBox="0 0 17 12" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8.5 2.4c2.4 0 4.6.9 6.3 2.5l1.2-1.2A10.2 10.2 0 0 0 8.5.7 10.2 10.2 0 0 0 1 3.7l1.2 1.2a8.6 8.6 0 0 1 6.3-2.5Zm0 3.3c1.5 0 2.8.5 3.9 1.5l1.2-1.2a7.3 7.3 0 0 0-10.2 0l1.2 1.2c1-1 2.4-1.5 3.9-1.5Zm0 3.3c.7 0 1.2.2 1.7.6L8.5 11.3 6.8 9.6c.5-.4 1-.6 1.7-.6Z"/></svg>';
const statusBar = time => `<div class="sb"><span>${time}</span><span class="sbi"><span class="bars"><i></i><i></i><i></i><i></i></span>${WIFI}<span class="bat"><i></i></span></span></div>`;
const STRIP = Array.from({ length: 10 }, (_, d) => `<span>${d}</span>`).join('') + '<span></span>';
/** Icons inside the app screens repeat many times, so they share one hidden sprite at the top of the page body. */
function sprite(html) {
  const names = [...new Set([...html.matchAll(/\{\{I:([\w-]+)\}\}/g)].map(m => m[1]))].sort();
  if (!names.length) return html;
  const symbols = names.map(n => {
    const raw = readFileSync(path.join(root, 'node_modules/@phosphor-icons/core/assets/bold/' + n + '-bold.svg'), 'utf8');
    return `<symbol id="i-${n}" viewBox="0 0 256 256">${raw.match(/<svg[^>]*>(.*)<\/svg>/s)[1]}</symbol>`;
  }).join('');
  return `<svg class="spr" aria-hidden="true" focusable="false">${symbols}</svg>` + html.replace(/\{\{I:([\w-]+)\}\}/g, (_, n) => `<svg class="i" aria-hidden="true" focusable="false"><use href="#i-${n}"/></svg>`);
}
/** Theme images used by the screens and tiles, with their real sizes (width and height stop the page from shifting). */
const IMAGES = { NV_INK: ['night-nevora-wm-ink.png', 907, 122], NV_WHITE: ['night-nevora-wm-white.png', 907, 122], ICON: ['day-nevora-icon.png', 120, 120] };
/** A page body: screens and icons filled in, images from theme assets, real routes kept, Spanish links moved by localize(). */
/** A Spanish page is its English body with each phrase pair from src/day/es/<page>.json applied (English stays the one source).
 * Every pair must match, so a change to the English wording stops the build until the Spanish follows it. */
function spanish(kind) {
  const pairs = JSON.parse(read('es/' + kind + '.json'));
  return pairs.reduce((html, [en, es]) => { if (!html.includes(en)) throw new Error('day: Spanish ' + kind + ' phrase no longer in the English body: ' + en.slice(0, 80)); return html.split(en).join(es); }, read(BODIES[kind].en));
}
function body(name, target, raw) {
  const html = (raw ?? read(name)).replace(/\{\{(SCR_\w+)\}\}/g, (_, k) => { if (!SCREENS[k]) throw new Error('day: no screen ' + k); return SCREENS[k]; })
    .replace(/\{\{SB:([0-9:]+)\}\}/g, (_, t) => statusBar(t)).replace(/\{\{STRIP\}\}/g, STRIP)
    .replace(/src="\{\{(NV_INK|NV_WHITE|ICON)\}\}"/g, (_, k) => { const [file, w, h] = IMAGES[k]; return `src="${asset(file, target)}" width="${w}" height="${h}"`; })
    .replace(/\{\{icon:([\w-]+)\}\}/g, (_, n) => dayIcon(n)).replace(/\{\{chev\}\}/g, CHEV)
    // The team-size meter: 30 marks, the first 8 on and the rest of the first band lit (the card starts at 8 employees)
    .replace('{{ticks}}', () => Array.from({ length: 30 }, (_, i) => '<i' + (i < 8 ? ' class="pc-on"' : i < 15 ? ' class="pc-in"' : '') + '></i>').join(''));
  const left = html.match(/\{\{(?!\s)[^}]*\}\}/g);
  if (left && left.some(x => !x.startsWith('{{I:'))) throw new Error('day: unfilled ' + left.join(' '));
  return sprite(html);
}
const BODIES = { about: { en: 'about.body.html' }, home: { en: 'home.body.html' }, nevora: { en: 'nevora.body.html' }, plans: { en: 'plans.body.html' }, help: { en: 'help.body.html' }, signin: { en: 'signin.body.html' }, rondo: { en: 'rondo.body.html' }, relay: { en: 'relay.body.html' } };
/** Pages with their own stylesheet and script beside the shared Day ones. */
export const DAY_PAGE_ASSETS = { home: ['velani-day-devices.css', 'velani-day-home.css', 'velani-day-home.js'], nevora: ['velani-day-devices.css', 'velani-day-nevora.css', 'velani-day-nevora.js'], plans: ['velani-day-plans.css', 'velani-day-plans.js'], contact: ['velani-day-contact.css', 'velani-day-contact.js'], doc: ['velani-day-legal.css'], help: ['velani-day-contact.css', 'velani-day-help.css', 'velani-day-help.js'], signin: ['velani-day-help.css', 'velani-day-signin.css', 'velani-day-signin.js'], rondo: ['velani-day-devices.css', 'velani-day-product.css', 'velani-day-rondo.css', 'velani-day-rondo.js'], relay: ['velani-day-devices.css', 'velani-day-product.css', 'velani-day-relay.css', 'velani-day-relay.js'] };
export function dayMain(kind, lang = 'en', target = 'preview') {
  if (lang === 'es') {
    // Links to pages that exist only in English say so (localize() moves the rest to their Spanish pages)
    return localize(body(null, target, spanish(kind)), 'es').replace(/href="(\/pages\/(?!es\b|es-)[^"#?]*)([^"]*)"(?! hreflang)/g, (m, path) => ES_PATHS[path] ? m : m + ' hreflang="en"');
  }
  const file = BODIES[kind]?.[lang];
  if (!file) throw new Error('day: no ' + lang + ' body for ' + kind);
  return localize(body(file, target), lang);
}
export const dayAssets = { css: read('day.css'), js: read('day.js'), pages: { devices: { css: read('devices.css') }, home: { css: read('home.css'), js: read('home.js') }, nevora: { css: read('nevora.css'), js: read('nevora.js') }, plans: { css: read('plans.css'), js: read('plans.js') }, contact: { css: read('contact.css'), js: read('contact.js') }, help: { css: read('help.css'), js: read('help.js') }, signin: { css: read('signin.css'), js: read('signin.js') }, product: { css: read('product.css') }, legal: { css: read('legal.css') }, rondo: { css: read('rondo.css'), js: read('rondo.js') }, relay: { css: read('relay.css'), js: read('relay.js') } } };
