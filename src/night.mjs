// "Night" design (approved 2026-11-02): header, footer, Home and NEVORA bodies, and NEVORA policy pages.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { company } from './content.mjs';
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

/** Turn a prototype fragment into site markup: icons inline, images from theme assets, real routes. */
export function site(html, target) {
  return html
    .replace(/\{\{icon:([\w-]+)\}\}/g, (_, n) => icon(n))
    .replace(/src="img\/([\w.-]+)\.webp"/g, (_, n) => 'src="' + asset('night-' + n + '.webp', target) + '"')
    .replace(/src="img\/([\w.-]+)\.png"/g, (_, n) => 'src="' + asset('night-' + n + '.png', target) + '"')
    .replace(/href="home\.html"/g, 'href="/"')
    .replace(/href="nevora\.html(#[\w-]+)?"/g, (_, h) => 'href="/pages/nevora' + (h || '') + '"')
    .replace(/interest=project/g, 'interest=custom-software')
    .replace(/ data-live="[^"]*"/g, '');
}

const between = (text, start, end) => { const s = text.indexOf(start); const t = text.indexOf(end, s); if (s < 0 || t < 0) throw new Error('night: marker not found ' + start); return text.slice(s, t); };
const homeSrc = read('home.body.html');
const nevSrc = read('nevora.body.html');
const mainOf = src => between(src, '<main id="main">', '</main>').slice('<main id="main">'.length);

/** Inside <main> for Home and NEVORA. The NEVORA local nav sits at the top of its section content. */
export function homeMain(target) { return site(mainOf(homeSrc), target); }
export function nevoraMain(target) { return site(between(nevSrc, '<nav class="lnav"', '<main id="main">') + mainOf(nevSrc), target); }

const NAV = [['NEVORA', '/pages/nevora', 'nevora'], ['Custom development', '/pages/custom-development', 'services'], ['About', '/pages/about', 'about'], ['NEVORA help', '/pages/nevora-support', 'nevora-help']];
/** current: the nav key for the preview build, or null in the Shopify layout, where Liquid marks it. */
// Official VELANI wordmark, traced 1:1 from docs/reference/velani-logo-official.pdf; colour comes from CSS.
const WORDMARK = readFileSync(new URL('./brand/velani-wordmark.svg', import.meta.url), 'utf8').trim()
  .replace(/^<svg[^>]*viewBox="([^"]*)"[^>]*>/, '<svg class="wm-velani" viewBox="$1" fill="currentColor" aria-hidden="true" focusable="false">');
export function header(current, target, { nevora = false } = {}) {
  const mark = key => target === 'shopify'
    ? `{% if velani_nav == '${key}' %} aria-current="page"{% endif %}`
    : (current === key ? ' aria-current="page"' : '');
  const links = NAV.map(([text, href, key]) => `<li><a href="${href}"${mark(key)}>${text}</a></li>`).join('');
  const menu = NAV.map(([text, href, key]) => `<a href="${href}"${mark(key)}>${text}</a>`).join('');
  const staticClass = target === 'shopify' ? `{% if velani_page == 'nevora' %} static{% endif %}` : (nevora ? ' static' : '');
  return `<a class="skip" href="#main">Skip to content</a><header class="gnav${staticClass}" id="gnav"><nav class="wrap gnav-in" aria-label="Main"><a class="wordmark" href="/" aria-label="The Velani home">${WORDMARK}</a><ul class="gnav-links">${links}</ul><a class="pill line" href="/pages/contact">Contact us</a><button class="gnav-menu" id="gmenu-btn" type="button" aria-expanded="false" aria-controls="gmenu" aria-label="Menu"><span class="i-open">${icon('list')}</span><span class="i-close" hidden>${icon('x')}</span></button></nav></header><div class="gmenu" id="gmenu" hidden><nav class="wrap" aria-label="Main menu">${menu}<a href="/pages/contact">Contact</a><a class="pill" href="/pages/contact">Contact us</a><small>The Velani is a brand of ${company.operator}.</small></nav></div>`;
}
export function footer(target) { return site(read('foot.html'), target); }

export const nightAssets = {
  css: { base: read('base.css'), home: read('home.css'), nevora: read('nevora.css'), pages: read('pages.css') },
  js: { motion: read('motion.js'), home: read('home.js'), nevora: read('nevora.js'), boot: "document.documentElement.className='js pre';\n" },
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
export function policyMain(slug) {
  const doc = POLICY_DOCS.find(d => d.slug === slug);
  const others = POLICY_DOCS.filter(d => d.slug !== slug);
  const toc = doc.sections.map((s, i) => `<a href="#p-${i}">${e(s.heading)}</a>`).join('');
  const body = doc.sections.map((s, i) => `<section id="p-${i}"><h2>${e(s.heading)}</h2>${s.blocks.map(b => b.p ? `<p>${inline(b.p)}</p>` : `<ul>${b.list.map(li => `<li>${inline(li)}</li>`).join('')}</ul>`).join('')}</section>`).join('');
  const eff = doc.effective ? `<p class="doc-meta">Effective ${e(POLICY_FACTS.EFFECTIVE_DATE)}</p>` : '';
  return `<section class="phero"><div class="wrap"><p class="kicker"><a href="/pages/nevora">NEVORA</a></p><h1 class="t1 rise">${e(doc.title)}</h1><p class="lede fade">${e(doc.summary)}</p>${eff}</div></section><section class="doc"><div class="wrap doc-grid"><aside class="doc-aside"><p class="doc-aside-t">On this page</p><nav aria-label="Page contents">${toc}</nav><p class="doc-aside-t">Also for NEVORA</p><nav aria-label="Other NEVORA pages">${others.map(d => `<a href="${POLICY_ROUTE['/' + d.slug]}">${e(d.title)}</a>`).join('')}</nav></aside><div class="doc-body">${body}<p class="doc-contact">Questions? Write to <a href="mailto:${company.email}">${company.email}</a>, or to ${e(company.operator)}, ${e(company.address)}.</p></div></div></section>`;
}
