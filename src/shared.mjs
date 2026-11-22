// Pieces every page shares: icons, Spanish links, the language switch, the wordmark, the assistant, the billing and assistant
// scripts, and the NEVORA policy pages. (The Night design that these came from was removed on November 21, 2026.)
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { company, routes } from './content.mjs';
import { ES_PATHS } from './content.es.mjs';
import { POLICY_DOCS, POLICY_FACTS } from './nevora-policies.mjs';
import { POLICY_DOCS_ES, POLICY_FACTS_ES } from './nevora-policies.es.mjs';

const dir = path.join(import.meta.dirname, 'shared');
const read = name => readFileSync(path.join(dir, name), 'utf8');
const root = path.join(import.meta.dirname, '..');
const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
/** Phosphor regular icons, inline (legal pages, the billing pages, the cookie dialog, the assistant). */
const svgCache = new Map();
export function icon(name) {
  if (!svgCache.has(name)) {
    const raw = readFileSync(path.join(root, 'node_modules/@phosphor-icons/core/assets/regular/' + name + '.svg'), 'utf8');
    svgCache.set(name, raw.replace(/\s(width|height)="[^"]*"/g, '').replace('<svg ', '<svg class="icon" aria-hidden="true" focusable="false" '));
  }
  return svgCache.get(name);
}

/** Links on a Spanish page go to the Spanish version of a page when one exists (query and #section kept). A link marked
 * hreflang="en" (the language switch, pages only in English) is left alone. */
export function localize(html, lang) {
  if (lang !== 'es') return html;
  return html.replace(/href="(\/[^"#?\s]*)([?#][^"\s]*)?"(?! hreflang="en")/g, (attribute, path, tail = '') => ES_PATHS[path] ? 'href="' + ES_PATHS[path] + tail + '"' : attribute);
}
/** Jose's approved Lantern concept 1; see docs/brand/rondo-lantern.md for provenance.
 * Adjacent text names Rondo, so these repeated marks are decorative. The exported SVG is named when used alone. */
const RONDO_SVG = readFileSync(path.join(root, 'src/brand/rondo-lantern.svg'), 'utf8')
  .replace(/\s(width|height)="[^"]*"/g, '').replace('role="img" aria-label="Rondo"', 'focusable="false"').trim();
const RONDO_MARK = (cls = '') => '<b class="rmark' + (cls ? ' ' + cls : '') + '" aria-hidden="true">' + RONDO_SVG + '</b>';
/** In the Shopify layout the two destinations are computed once per page (main theme or draft), see renderShopifyLayout. */
export const SHOPIFY_LANG_HREFS = { en: '{{ velani_en_href }}', es: '{{ velani_es_href }}' };
/** EN | ES: two links, the current language marked; each option is named and spoken in its own language. */
export function langSwitch(lang, hrefs, cls = '') {
  const opt = (code, name, href) => `<a href="${href}" hreflang="${code}" lang="${code}" aria-label="${name}"${code === lang ? ' aria-current="true"' : ''}>${code.toUpperCase()}</a>`;
  return `<span class="lang-sw${cls}" role="group" aria-label="${lang === 'es' ? 'Idioma' : 'Language'}">${opt('en', 'English', hrefs.en)}<span class="lang-sep" aria-hidden="true">|</span>${opt('es', 'Español', hrefs.es)}</span>`;
}
// Official VELANI wordmark, traced 1:1 from docs/reference/velani-logo-official.pdf; colour comes from CSS.
export const WORDMARK = readFileSync(new URL('./brand/velani-wordmark.svg', import.meta.url), 'utf8').trim()
  .replace(/^<svg[^>]*viewBox="([^"]*)"[^>]*>/, '<svg class="wm-velani" viewBox="$1" fill="currentColor" aria-hidden="true" focusable="false">');
// The Velani symbol ("Fan"), written by scripts/brand-icons.mjs; decorative next to the wordmark, which names the link.
export const MARK = readFileSync(new URL('./brand/velani-mark.svg', import.meta.url), 'utf8').trim()
  .replace(/^<svg[^>]*viewBox="([^"]*)"[^>]*>/, '<svg class="mk-velani" viewBox="$1" fill="currentColor" aria-hidden="true" focusable="false">');
/** The assistant launcher and panel; the API address is filled in by the layout (theme setting or preview environment). */
export function assistant(target, apiAttribute) {
  const html = read('assist.html').replace(/\{\{icon:([\w-]+)\}\}/g, (_, n) => icon(n)).replace(/\{\{rondo(?::([\w -]+))?\}\}/g, (_, cls) => RONDO_MARK(cls));
  return html.replace('<div class="ast-root" id="ast-root" hidden>', '<div class="ast-root" id="ast-root" hidden data-api="' + apiAttribute + '">');
}
export const sharedAssets = { assistCss: read('assist.css'), assist: read('assist.js'), assistClient: read('velani-assistant.js'), commerce: read('commerce.js') };

/* NEVORA policy pages (Privacy, Support, Account deletion, Terms), from the NEVORA app's approved policy source. */
const APP_ONLY = new Set(['/login', '/forgot-access']);
const POLICY_ROUTE = { '/privacy': '/pages/nevora-privacy', '/terms': '/pages/nevora-terms', '/support': '/pages/nevora-support', '/account-deletion': '/pages/nevora-account-deletion' };
function inline(parts, facts = POLICY_FACTS) {
  return parts.map(x => {
    if (typeof x === 'string') return e(x);
    if (x.fact) return e(facts[x.fact]);
    if (x.strong) return '<strong>' + e(x.strong) + '</strong>';
    if (x.href) {
      if (APP_ONLY.has(x.href)) return e(x.text);
      return '<a href="' + e(POLICY_ROUTE[x.href] || x.href) + '">' + e(x.text) + '</a>';
    }
    return '';
  }).join('');
}
/** The website names each policy page ("NEVORA privacy policy"); the policy source keeps its own document titles. */
const siteTitle = (slug, lang = 'en') => routes[lang === 'es' ? ES_PATHS[POLICY_ROUTE['/' + slug]] : POLICY_ROUTE['/' + slug]]?.title;
export function policyMain(slug, lang = 'en') {
  const docs = lang === 'es' ? POLICY_DOCS_ES : POLICY_DOCS;
  const facts = lang === 'es' ? POLICY_FACTS_ES : POLICY_FACTS;
  const doc = docs.find(d => d.slug === slug);
  const others = docs.filter(d => d.slug !== slug);
  const t = lang === 'es'
    ? { effective: 'Vigente desde el', toc: 'En esta página', contents: 'Contenido de la página', also: 'También sobre NEVORA', other: 'Otras páginas de NEVORA', questions: 'Preguntas', write: 'Escribe a', postal: ', o por correo postal a ', contact: 'Página de contacto', support: 'Soporte de NEVORA' }
    : { effective: 'Effective', toc: 'On this page', contents: 'Page contents', also: 'Also for NEVORA', other: 'Other NEVORA pages', questions: 'Questions', write: 'Write to', postal: ', or to ', contact: 'Contact page', support: 'NEVORA support' };
  const renderInline = parts => inline(parts, facts);
  const toc = doc.sections.map((s, i) => `<a href="#p-${i}">${e(s.heading)}</a>`).join('');
  const body = doc.sections.map((s, i) => `<section id="p-${i}"><i>${String(i + 1).padStart(2, '0')}</i><h2>${e(s.heading)}</h2>${s.blocks.map(b => b.p ? `<p>${renderInline(b.p)}</p>` : b.steps ? `<ol>${b.steps.map(li => `<li>${renderInline(li)}</li>`).join('')}</ol>` : `<ul>${b.list.map(li => `<li>${renderInline(li)}</li>`).join('')}</ul>`).join('')}</section>`).join('');
  const eff = doc.effective ? `<p class="doc-meta">${t.effective} ${e(facts.EFFECTIVE_DATE)}</p>` : '';
  return localize(`<section class="phero"><div class="wrap"><h1 class="t1 rise">${e(siteTitle(slug, lang))}</h1><p class="lede fade">${e(doc.summary)}</p>${eff}</div></section><section class="doc"><div class="wrap doc-grid"><div class="doc-aside"><details class="doc-toc" open><summary class="doc-aside-t">${t.toc}</summary><nav aria-label="${t.contents}">${toc}</nav></details><p class="doc-aside-t">${t.also}</p><nav aria-label="${t.other}">${others.map(d => `<a href="${POLICY_ROUTE['/' + d.slug]}">${e(siteTitle(d.slug, lang))}</a>`).join('')}</nav></div><div class="doc-body">${body}<div class="doc-end"><h2 class="t3">${t.questions}</h2><p>${t.write} <a href="mailto:${company.email}">${company.email}</a>${body.includes(e(company.address)) ? '' : t.postal + e(company.operator) + ', ' + e(company.address)}.</p><div class="acts">${slug === 'support' ? '<a class="pill line" href="/pages/contact">' + t.contact + '</a>' : '<a class="pill line" href="/pages/nevora-support">' + t.support + '</a>'}</div></div></div></div></section>`, lang);
}
