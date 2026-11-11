import test from 'node:test';
import assert from 'node:assert/strict';
import { Liquid } from 'liquidjs';
import { routes } from '../src/content.mjs';
import { ES_PATHS, ES_NEAREST } from '../src/content.es.mjs';
import { renderPage, renderBody, renderShopifyLayout, renderShopifySnippets } from '../src/render.mjs';

const PAIRS = { '/': '/pages/es', '/pages/nevora': '/pages/es-nevora', '/pages/plans': '/pages/es-planes', '/pages/products': '/pages/es-productos', '/pages/contact': '/pages/es-contacto', '/pages/about': '/pages/es-nosotros', '/pages/help': '/pages/es-ayuda', '/pages/custom-development': '/pages/es-a-la-medida', '/pages/sign-in': '/pages/es-entrar', '/pages/nevora-start': '/pages/es-prueba', '/pages/nevora-billing': '/pages/es-facturacion', '/pages/nevora-verify': '/pages/es-configurar', '/pages/nevora-billing-return': '/pages/es-pago' };
const ES = Object.values(PAIRS);
const text = html => html.replace(/<script[^]*?<\/script>|<style[^]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
const withoutHiddenSent = html => html.replace(/<div class="sent" id="inquiry-sent" tabindex="-1" hidden>[\s\S]*?<\/div>/, '');
const between = (html, start, end) => { const s = html.indexOf(start); assert.ok(s >= 0, start); return html.slice(s, html.indexOf(end, s) + end.length); };
// English UI words that must not appear in the Spanish header, phone menu, footer, cookie dialog or contact form
const DENY = /\b(Products|Websites|Custom apps|Plans|Support|About|Contact|Request free|Start a project|Skip to content|Menu|Main menu|Name|Email|Company|optional|Topic|Team size|Number of locations|Something else|Website preview|Cookie choices|Necessary|Preferences|Analytics|Sale or sharing|Always on|Reject all|Accept all|Save choices|All rights reserved|Client support|Monday|Friday|Language|Send inquiry|Check draft|Privacy notice|Back to home|Message sent|Trial request|In development|Coming soon|Scheduling|time clock|payroll)\b/;

test('the thirteen Spanish routes exist, pair with their English pages and use the same components', () => {
  assert.deepEqual(Object.fromEntries(Object.entries(ES_PATHS)), PAIRS);
  for (const [en, es] of Object.entries(PAIRS)) {
    assert.equal(routes[es].lang, 'es', es);
    assert.equal(routes[es].en, en, es);
    assert.equal(routes[en].es, es, en);
    assert.equal(routes[es].kind, routes[en].kind, es);
  }
});
test('each Spanish page is lang=es with one h1 and a Spanish title and description of 70 to 160 characters', () => {
  for (const path of ES) {
    const { html, status } = renderPage(path);
    assert.equal(status, 200, path);
    assert.match(html, /^<!doctype html><html lang="es"/, path);
    assert.equal((withoutHiddenSent(html).match(/<h1\b/g) || []).length, 1, path);
    const title = html.match(/<title>([^<]+)<\/title>/)[1];
    assert.match(title, / · Velani$|^Velani · /, path);
    assert.doesNotMatch(title, /\b(Products|Plans|Contact|Scheduling|software, websites)\b/, path);
    const desc = html.match(/<meta name="description" content="([^"]+)">/)[1];
    assert.ok(desc.length >= 70 && desc.length <= 160, path + ' description is ' + desc.length + ' characters');
    assert.match(desc, /[áéíóúñ]/, path + ' description reads as Spanish');
  }
  for (const path of Object.keys(PAIRS)) assert.match(renderPage(path).html, /^<!doctype html><html lang="en"/, path);
});
test('Spanish pages link to the Spanish version of a page whenever one exists', () => {
  for (const path of ES) {
    // The language switch is the one place that links to English on purpose (marked hreflang="en")
    const html = renderPage(path).html.replace(/<span class="lang-sw[^"]*" role="group"[\s\S]*?<\/a><\/span>/g, '');
    const english = [...html.matchAll(/href="(\/[^"]*)"/g)].map(m => m[1]).filter(href => ES_PATHS[href.split(/[?#]/)[0]]);
    assert.deepEqual(english, [], path);
    // Custom software leads to a project inquiry, every other Spanish page to the NEVORA trial request (same as English)
    assert.match(html, path === '/pages/es-a-la-medida' ? /href="\/pages\/es-contacto\?interest=custom-software"/ : /href="\/pages\/es-contacto\?interest=nevora-demo"/, path);
    // Pages that exist only in English are marked for browsers and assistive technology
    for (const m of html.matchAll(/<a [^>]*href="\/pages\/(privacy|nevora-privacy|website-terms|legal|cookies)"[^>]*>/g)) assert.match(m[0], /hreflang="en"/, path + ' ' + m[0]);
  }
  assert.match(renderPage('/pages/es-nevora').html, /<a href="\/pages\/es-planes">Planes<\/a>/);
});
test('no English UI is left in the Spanish header, phone menu, footer, cookie dialog or contact form', () => {
  for (const path of ES) {
    const html = renderPage(path).html;
    const chrome = between(html, '<a class="skip"', '</nav></div>') + between(html, '<footer class="foot">', '</footer>') + between(html, '<dialog class="cookie-dialog"', '</dialog>');
    const hit = text(chrome).match(DENY);
    assert.equal(hit, null, path + ': ' + (hit && hit[0]));
  }
  const contact = renderPage('/pages/es-contacto').html;
  const form = between(contact, '<div class="cform-hero contact-side">', '<div class="client-form">') + between(contact, '<form id="project-inquiry"', '</form>') + between(contact, '<div class="sent"', '</div>');
  const hit = text(form).match(DENY);
  assert.equal(hit, null, 'contact form: ' + (hit && hit[0]));
  assert.match(contact, /<input type="radio" name="topic_choice" value="custom-software"><b>Web o app<\/b>/);
});
test('the Spanish contact form sends the same topic values and team size as the English one', () => {
  const values = html => [...between(html, '<fieldset class="kinds topics field-topic">', '</fieldset>').matchAll(/value="([^"]*)"/g)].map(m => m[1]);
  assert.deepEqual(values(renderPage('/pages/es-contacto').html), values(renderPage('/pages/contact').html));
  assert.deepEqual(values(renderPage('/pages/es-contacto').html), ['custom-software', 'nevora', 'other']);
  assert.match(renderPage('/pages/es-contacto').html, /<input type="hidden" id="inquiry-interest" name="contact\[interest\]" value="">/);
  assert.match(renderPage('/pages/es-contacto').html, /<option value="More than 30 \(assisted setup\)">Más de 30 \(configuración asistida\)<\/option>/);
  const live = renderBody('/pages/es-contacto', { target: 'shopify' });
  assert.match(live, /\{% form 'contact', id: 'project-inquiry'/);
  assert.match(live, /data-inquiry-mode=\\?"live\\?"/);
});
test('the NEVORA time clock demo starts in Spanish on the Spanish page and offers English', () => {
  const html = renderPage('/pages/es-nevora').html;
  assert.match(html, /<div class="kio" id="kio" lang="es">/);
  assert.match(html, /data-k-t="Enter your PIN">Ingresa tu PIN</);
  assert.match(html, /data-k-t="Clock-in recorded">Entrada registrada</);
  assert.match(html, /<span id="kio-lang-t" lang="en">English<\/span>/);
  assert.match(renderPage('/pages/nevora').html, /data-k-t="Enter your PIN">Enter your PIN</);
});
test('every page has a language switch; it round-trips between the pairs and falls back to the closest Spanish page', () => {
  const sw = html => [...html.matchAll(/<span class="lang-sw[^"]*" role="group" aria-label="([^"]+)"><a href="([^"]+)" hreflang="en" lang="en" aria-label="English"( aria-current="true")?>EN<\/a><span class="lang-sep" aria-hidden="true">\|<\/span><a href="([^"]+)" hreflang="es" lang="es" aria-label="Español"( aria-current="true")?>ES<\/a><\/span>/g)];
  for (const [en, es] of Object.entries(PAIRS)) {
    const a = sw(renderPage(en).html), b = sw(renderPage(es).html);
    assert.ok(a.length >= 3 && b.length >= 3, en);
    for (const m of a) { assert.equal(m[1], 'Language'); assert.equal(m[2], en); assert.equal(m[4], es); assert.ok(m[3] && !m[5]); }
    for (const m of b) { assert.equal(m[1], 'Idioma'); assert.equal(m[2], en); assert.equal(m[4], es); assert.ok(!m[3] && m[5]); }
  }
  for (const path of Object.keys(routes).filter(p => !routes[p].lang && !PAIRS[p])) {
    const m = sw(renderPage(path).html);
    assert.ok(m.length >= 2, path);
    for (const x of m) { assert.equal(x[2], path); assert.equal(x[4], ES_NEAREST[path] || '/pages/es'); }
  }
});

const liquid = new Liquid({ templates: Object.fromEntries(Object.entries(renderShopifySnippets()).map(([name, src]) => [name + '.liquid', src])), extname: '.liquid' });
liquid.registerFilter('asset_url', name => '/assets/' + name);
const layout = renderShopifyLayout();
const page = (role, path, extra = {}) => {
  const slug = path === '/' ? '' : path.split('/').at(-1);
  const ctx = { theme: { role, id: 77 }, routes: { root_url: '/' }, template: { name: path === '/' ? 'index' : 'page', suffix: slug }, request: { locale: { iso_code: 'en' }, page_type: path === '/' ? 'index' : 'page', path }, settings: {}, canonical_url: 'https://www.thevelani.com' + path, shop: { url: 'https://www.thevelani.com' }, ...extra };
  return liquid.parseAndRender(layout, ctx, { globals: ctx });
};
const alternates = html => Object.fromEntries([...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)].map(m => [m[1], m[2]]));
test('hreflang pairs are reciprocal, absolute and default to English on the main theme', async () => {
  const abs = p => 'https://www.thevelani.com' + p;
  for (const [en, es] of Object.entries(PAIRS)) {
    const a = alternates(await page('main', en)), b = alternates(await page('main', es));
    assert.deepEqual(a, { en: abs(en), es: abs(es), 'x-default': abs(en) }, en);
    assert.deepEqual(b, a, es);
  }
  // Pages with no Spanish version name no alternates
  assert.deepEqual(alternates(await page('main', '/pages/legal')), {});
});
test('the main-theme layout renders Spanish pages in Spanish with es_US metadata and the Spanish chrome', async () => {
  const html = await page('main', '/pages/es-nevora');
  assert.match(html, /^<!doctype html><html lang="es"/);
  assert.match(html, /<title>NEVORA · Horarios, registro de tiempo y nómina · Velani<\/title>/);
  assert.match(html, /<meta property="og:locale" content="es_US"><meta property="og:locale:alternate" content="en_US">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.thevelani\.com\/pages\/es-nevora">/);
  assert.match(html, /<a class="skip" href="#main">Saltar al contenido<\/a>/);
  assert.match(html, /<header class="gnav static" id="gnav">/);
  assert.match(html, /<button class="gnav-ddbtn txt" type="button" aria-expanded="false" aria-controls="gnav-dd-nevora" data-cur>NEVORA/);
  assert.match(html, /<a class="gnav-signin" href="\/pages\/es-entrar">Entrar<\/a>/);
  assert.match(html, /<a href="\/pages\/nevora" hreflang="en" lang="en" aria-label="English">EN<\/a>/);
  assert.match(html, /<a href="\/pages\/es-nevora" hreflang="es" lang="es" aria-label="Español" aria-current="true">ES<\/a>/);
  assert.match(html, /Opciones de cookies/);
  const en = await page('main', '/pages/nevora');
  assert.match(en, /^<!doctype html><html lang="en"/);
  assert.match(en, /<meta property="og:locale" content="en_US"><meta property="og:locale:alternate" content="es_US">/);
  assert.match(en, /<a href="\/pages\/es-nevora" hreflang="es" lang="es" aria-label="Español">ES<\/a>/);
  // The switch keeps the visitor's place: About goes to Nosotros; an English-only page goes to its closest Spanish page
  const about = await page('main', '/pages/about');
  assert.match(about, /<a href="\/pages\/about" hreflang="en" lang="en" aria-label="English" aria-current="true">EN<\/a><span class="lang-sep" aria-hidden="true">\|<\/span><a href="\/pages\/es-nosotros" hreflang="es"/);
  const dev = await page('main', '/pages/custom-development');
  assert.match(dev, /<a href="\/pages\/es-a-la-medida" hreflang="es" lang="es" aria-label="Español">ES<\/a>/);
  const legal = await page('main', '/pages/legal');
  assert.match(legal, /<a href="\/pages\/es-ayuda" hreflang="es" lang="es" aria-label="Español">ES<\/a>/);
});
test('on an unpublished theme the switch and Spanish links stay in the same draft, and the page stays noindex', async () => {
  const ctx = { template: { name: 'index', suffix: 'velani-es-planes' }, request: { locale: { iso_code: 'en' }, page_type: 'index', path: '/' } };
  const html = await page('unpublished', '/pages/es-planes', ctx);
  assert.match(html, /<html lang="es"/);
  assert.match(html, /name="robots" content="noindex, nofollow"/);
  assert.match(html, /<a href="\/\?preview_theme_id=77&amp;view=velani-plans" hreflang="en"/);
  assert.match(html, /<a href="\/\?preview_theme_id=77&amp;view=velani-es-planes" hreflang="es"/);
  assert.match(html, /href="\/\?preview_theme_id=77&amp;view=velani-es-contacto&amp;interest=nevora-demo"/);
  const body = await liquid.parseAndRender(renderBody('/pages/es-planes', { target: 'shopify' }), { theme: { role: 'unpublished', id: 77 }, routes: { root_url: '/' } });
  assert.match(body, /href="\/\?preview_theme_id=77&amp;view=velani-es-contacto&amp;interest=nevora"/);
  assert.doesNotMatch(body, /href="\/pages\//);
  const home = await page('unpublished', '/', { template: { name: 'index', suffix: '' } });
  assert.match(home, /<a href="\/\?preview_theme_id=77" hreflang="en" lang="en" aria-label="English" aria-current="true">EN<\/a>/);
});
test('billing and setup utility pages are noindex on the main theme; acquisition pages are not', async () => {
  for (const path of ['/pages/nevora-billing', '/pages/nevora-billing-return', '/pages/nevora-verify', '/pages/es-facturacion', '/pages/es-pago', '/pages/es-configurar', '/pages/nevora-start', '/pages/es-prueba'])
    assert.match(await page('main', path), /<meta name="robots" content="noindex">/, path);
  for (const path of ['/pages/plans', '/pages/es-planes', '/pages/sign-in', '/pages/help'])
    assert.doesNotMatch(await page('main', path), /name="robots"/, path);
});

test('while online signup is closed, the old trial page sends visitors to the trial request in their language', async () => {
  const liquid = new Liquid();
  const en = renderBody('/pages/nevora-start', { target: 'shopify' }), es = renderBody('/pages/es-prueba', { target: 'shopify' });
  const closed = { settings: { commerce_api_url: '' }, theme: { role: 'main', id: 1 }, routes: { root_url: '/' } };
  assert.match(await liquid.parseAndRender(en, closed), /<script>location\.replace\("\/pages\/contact\?interest=nevora-demo"\)<\/script>/);
  assert.match(await liquid.parseAndRender(es, closed), /<script>location\.replace\("\/pages\/es-contacto\?interest=nevora-demo"\)<\/script>/);
  const open = { ...closed, settings: { commerce_api_url: 'https://commerce.example.test' } };
  assert.doesNotMatch(await liquid.parseAndRender(en, open), /location\.replace/);
  const draft = await liquid.parseAndRender(en, { ...closed, theme: { role: 'unpublished', id: 77 } });
  assert.match(draft, /location\.replace\("\/\?preview_theme_id=77&view=velani-contact&interest=nevora-demo"\)/, 'a draft stays in the draft');
  assert.match(await liquid.parseAndRender(en, closed), /<a class="hb fill" href="\/pages\/contact\?interest=nevora-demo">/, 'the page still offers the request button without a script');
});

test('the home first screen carries the live sample day in both languages, with a pause control and a status region', async () => {
  for (const [path, word] of [['/', 'Clock in'], ['/pages/es', 'Marcar entrada']]) {
    const html = renderBody(path, { target: 'shopify' });
    assert.match(html, /data-day data-now="478"/, path);
    assert.match(html, new RegExp('data-clock[^>]*>' + word + '<'), path);
    assert.match(html, /data-pp aria-label="[^"]+"/, path);
    assert.match(html, /role="status" data-day-status/, path);
    assert.equal((html.match(/class="hb fill"/g) || []).length >= 1, true);
  }
});

test('the four views of the live piece share one set of numbers: schedule, time clock, pay and Rondo agree', async () => {
  for (const path of ['/', '/pages/es']) {
    const html = renderBody(path, { target: 'shopify' });
    assert.equal((html.match(/role="tab" /g) || []).length, 4, path);
    assert.equal((html.match(/role="tabpanel"/g) || []).length, 4, path);
    const rows = [...html.matchAll(/class="day-row" data-state="(\w+)" data-due="(\d+)" data-week="(\d+)" data-sched="(\d+)" data-sun="\d"(?: data-auto="\d+")?(?: data-in="(\d+)")?/g)];
    assert.equal(rows.length, 5, path);
    // Mon–Fri minutes per person equal eight hours for every weekday chip in the schedule
    const sched = [...html.matchAll(/<tr><th scope="row">[^<]+<\/th>(.*?)<td class="day-wk">(\d+) h<\/td><\/tr>/g)];
    sched.forEach(([, cells, total], i) => {
      const days = cells.split('</td>').slice(0, 7).map(c => c.includes('day-chip'));
      assert.equal(days.filter(Boolean).length * 8, +total, 'weekly hours match the chips');
      assert.equal(days.slice(0, 5).filter(Boolean).length * 480, +rows[i][3], 'Mon–Fri minutes match the schedule');
      assert.equal(days[5], true, 'everyone on the Time clock view is scheduled on Saturday');
      assert.equal(+rows[i][4], +total, 'the hours Rondo reads match the schedule');
    });
    // At 7:58 the first paint agrees across views: today's pay and the week's pay at $15 an hour
    const now = +html.match(/data-now="(\d+)"/)[1], rate = +html.match(/data-rate="(\d+)"/)[1];
    const today = rows.reduce((m, r) => m + (r[5] ? now - r[5] : 0), 0), week = rows.reduce((m, r) => m + +r[3], 0) + today;
    const usd = v => '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2 });
    assert.match(html, new RegExp('data-pay>' + usd(today * rate / 60).replace('$', '\\$') + '<'), path);
    assert.match(html, new RegExp('data-week-pay>' + usd(week * rate / 60).replace(/[$]/g, '\\$') + '<'), path);
  }
});

test('Home is NEVORA and Rondo: no client panels, one filled action in the closing, and one quiet line to custom software', async () => {
  for (const [path, link] of [['/', '/pages/custom-development'], ['/pages/es', '/pages/es-a-la-medida']]) {
    const html = renderBody(path, { target: 'local' });
    assert.doesNotMatch(html, /id="websites"|id="apps"|Tool Box|Yavi/, path);
    const closing = html.slice(html.indexOf('id="velani"'));
    assert.equal((closing.match(/class="hb fill"/g) || []).length, 1, path);
    assert.equal((closing.match(/class="hb"/g) || []).length, 0, path);
    assert.match(closing, new RegExp('class="hfact halso fade">[^<]+<a class="ul" href="' + link + '"'), path);
    assert.equal((html.match(/data-ask="\d"/g) || []).length, 2, path);
  }
});
