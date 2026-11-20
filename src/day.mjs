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
    svgCache.set(name, raw.replace(/\s(width|height)="[^"]*"/g, '').replace('<svg ', '<svg class="ic" aria-hidden="true" focusable="false" '));
  }
  return svgCache.get(name);
}
const CHEV = '<svg class="ic chev" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><path d="M3 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/** The words of the Day header, phone menu and footer per language. Hrefs are English paths; localize() moves them to Spanish. */
export const DAY_CHROME = {
  en: {
    skip: 'Skip to content', home: 'Velani home', main: 'Main', menu: 'Open menu', closeMenu: 'Close menu', menuDialog: 'Menu', menuLink: 'Menu',
    nav: [['NEVORA', '/pages/nevora', ['nevora']], ['Rondo', '/pages/nevora#rondo', ['rondo']], ['Relay', '/pages/nevora#relay', ['relay']], ['Plans', '/pages/plans', ['plans']], ['Support', '/pages/help', ['help', 'contact', 'nevora-help']]],
    signIn: 'Sign in', trialShort: 'Free trial', trial: 'Request a free trial',
    footer: 'Footer', legal: 'Legal', cookies: 'Cookie choices',
    disc: ['Screens on this website come from the NEVORA app, with fictional people and places.', 'NEVORA calculates pay from approved hours. It doesn’t pay employees or file payroll taxes. Rondo prepares changes; the Owner approves them. Relay is in design and has no release date.'],
    cols: [
      ['Products', [['NEVORA Workforce', '/pages/nevora'], ['Rondo', '/pages/nevora#rondo'], ['Relay', '/pages/nevora#relay', 'In design']]],
      ['Get started', [['Request a free trial', '/pages/contact?interest=nevora-demo'], ['Plans', '/pages/plans'], ['Sign in', '/pages/sign-in']]],
      ['Support', [['Help', '/pages/help'], ['Contact', '/pages/contact'], ['NEVORA support', '/pages/nevora-support'], ['Delete your account', '/pages/nevora-account-deletion']]],
      ['Company', [['About', '/pages/about'], ['Security', '/pages/security'], ['Accessibility', '/pages/accessibility']]],
    ],
    legalLinks: [['Legal', '/pages/legal'], ['Privacy', '/pages/privacy'], ['Cookies', '/pages/cookies'], ['Website terms', '/pages/website-terms'], ['NEVORA privacy', '/pages/nevora-privacy'], ['NEVORA terms', '/pages/nevora-terms']],
    copyright: '© 2026 VELANI LLC. All rights reserved.', hours: 'Monday to Friday, 8 am to 9 pm ET',
  },
  es: {
    skip: 'Saltar al contenido', home: 'Inicio de Velani', main: 'Principal', menu: 'Abrir menú', closeMenu: 'Cerrar menú', menuDialog: 'Menú', menuLink: 'Menú',
    nav: [['NEVORA', '/pages/nevora', ['nevora']], ['Rondo', '/pages/nevora#rondo', ['rondo']], ['Relay', '/pages/nevora#relay', ['relay']], ['Planes', '/pages/plans', ['plans']], ['Soporte', '/pages/help', ['help', 'contact', 'nevora-help']]],
    signIn: 'Entrar', trialShort: 'Prueba gratis', trial: 'Pide la prueba gratis',
    footer: 'Pie de página', legal: 'Legal', cookies: 'Opciones de cookies',
    disc: ['Las pantallas de este sitio vienen de la app NEVORA, con personas y lugares ficticios.', 'NEVORA calcula la paga a partir de las horas aprobadas. No paga a los empleados ni presenta impuestos de nómina. Rondo prepara cambios; el Owner los aprueba. Relay está en diseño y no tiene fecha de lanzamiento.'],
    cols: [
      ['Productos', [['NEVORA Workforce', '/pages/nevora'], ['Rondo', '/pages/nevora#rondo'], ['Relay', '/pages/nevora#relay', 'En diseño']]],
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
  const nav = t.nav.map(([label, href, keys]) => `<a href="${href}"${mark(keys)}>${label}</a>`).join('');
  const trialHref = '/pages/contact?interest=nevora-demo', signin = '/pages/sign-in';
  const html = `<a class="skip" href="#main">${t.skip}</a>`
    + `<header class="gn" id="gn"><div class="wrap"><a class="logo" href="/" aria-label="${t.home}">${WORDMARK}</a>`
    + `<nav class="gnav" aria-label="${t.main}">${nav}</nav>${langSwitch(lang, hrefs)}`
    + `<a class="signin" href="${signin}"${enOnly(lang, signin)}${mark(['signin'])}>${t.signIn}</a>`
    + `<a class="cta" href="${trialHref}">${t.trialShort}</a>`
    + `<button class="mb" type="button" aria-expanded="false" aria-controls="mm" aria-label="${t.menu}">${dayIcon('list')}</button>`
    + `<a class="mb-nojs" href="#ft">${t.menuLink}</a></div></header>`
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

/** A page body: icons inline, real routes kept, Spanish links moved by localize(). */
function body(name) { return read(name).replace(/\{\{icon:([\w-]+)\}\}/g, (_, n) => dayIcon(n)).replace(/\{\{chev\}\}/g, CHEV); }
const BODIES = { about: { en: 'about.body.html' } };
export function dayMain(kind, lang = 'en') {
  const file = BODIES[kind]?.[lang];
  if (!file) throw new Error('day: no ' + lang + ' body for ' + kind);
  return localize(body(file), lang);
}
export const dayAssets = { css: read('day.css'), js: read('day.js') };
