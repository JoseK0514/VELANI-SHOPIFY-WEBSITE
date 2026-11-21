import test from 'node:test';
import assert from 'node:assert/strict';
import { routes } from '../src/content.mjs';
import { renderPage, renderBody, renderShopifyLayout, renderShopifySnippets } from '../src/render.mjs';
import { dayHeader, dayFooter } from '../src/day.mjs';

const dayRoutes = Object.entries(routes).filter(([, page]) => page.day).map(([path]) => path);

test('every page is on the Day design (Night removed November 21)', () => {
  for (const [path, page] of Object.entries(routes)) {
    assert.ok(page.day, path + ' names its Day body');
    const html = renderPage(path).html;
    assert.match(html, /velani-day\.css/, path);
    assert.match(html, /<header class="gn" id="gn">/, path);
    assert.doesNotMatch(html, /velani\.css|velani-motion\.js|class="gnav" id="gnav"|dm-sans-latin|night-/, path);
    assert.match(html, /<meta name="color-scheme" content="light">/, path);
  }
});

test('the Day header: five product links, sign-in, one trial action and a phone menu dialog', () => {
  const html = dayHeader('plans', 'preview', { lang: 'en', hrefs: { en: '/pages/plans', es: '/pages/es-planes' } });
  const nav = html.match(/<nav class="gnav"[^>]*>(.*?)<\/nav>/)[1];
  assert.deepEqual([...nav.matchAll(/>([^<]+)<\/a>/g)].map(m => m[1]), ['NEVORA', 'Rondo', 'Relay', 'Plans', 'Support']);
  assert.match(nav, /href="\/pages\/plans" aria-current="page">Plans/);
  assert.equal((html.match(/aria-current="page"/g) || []).length, 2, 'current link in the bar and in the menu');
  assert.match(html, /^<a class="skip" href="#main">/);
  assert.match(html, /class="cta" href="\/pages\/contact\?interest=nevora-demo">Free trial</);
  assert.match(html, /class="signin" href="\/pages\/sign-in"/);
  assert.match(html, /<button class="mb" type="button" aria-expanded="false" aria-controls="mm" aria-label="Open menu">/);
  assert.match(html, /<div class="mm" id="mm" role="dialog" aria-modal="true" aria-label="Menu" hidden>/);
  assert.doesNotMatch(html, /mb-nojs/, 'without JavaScript the header links show as a row instead (day.css)');
  assert.doesNotMatch(html, /custom-development|Custom software|Websites/);
});

test('the Day footer links the product pages, support and legal, without custom work or project terms', () => {
  const html = dayFooter('preview', { lang: 'en', hrefs: { en: '/pages/about', es: '/pages/es-nosotros' } });
  for (const href of ['/pages/nevora', '/pages/plans', '/pages/sign-in', '/pages/help', '/pages/contact', '/pages/nevora-support', '/pages/nevora-account-deletion', '/pages/about', '/pages/security', '/pages/accessibility', '/pages/legal', '/pages/privacy', '/pages/cookies', '/pages/website-terms', '/pages/nevora-privacy', '/pages/nevora-terms']) assert.ok(html.includes('href="' + href + '"'), href);
  assert.doesNotMatch(html, /custom-development|software-project-terms|Project terms/);
  assert.match(html, /<button type="button" data-cookie-open data-live="the cookie choices dialog" disabled>Cookie choices<\/button>/);
  assert.match(html, /It doesn’t pay employees or file payroll taxes\./);
  assert.match(html, /Monday to Friday, 8 am to 9 pm ET/);
});

test('Spanish Day chrome: Spanish words, Spanish pages where they exist, English-only pages marked', () => {
  const header = dayHeader(null, 'preview', { lang: 'es', hrefs: { en: '/pages/about', es: '/pages/es-nosotros' } });
  assert.match(header, /href="\/pages\/es-nevora">NEVORA</);
  assert.match(header, /href="\/pages\/es-planes">Planes</);
  assert.match(header, /href="\/pages\/es-contacto\?interest=nevora-demo">Prueba gratis</);
  assert.match(header, /aria-label="Abrir menú"/);
  const footer = dayFooter('preview', { lang: 'es', hrefs: { en: '/pages/about', es: '/pages/es-nosotros' } });
  assert.match(footer, /href="\/pages\/security" hreflang="en">Seguridad</);
  assert.match(footer, /href="\/pages\/es-privacy">Privacidad</);
  assert.match(footer, />Opciones de cookies</);
});

test('the Shopify layout renders every page with the Day snippets, head and colours (Night removed November 21)', () => {
  const layout = renderShopifyLayout();
  assert.doesNotMatch(layout, /velani_design|velani\.css|velani-motion|dm-sans|color-scheme" content="dark"|render 'velani-(header|footer)-/, 'no Night branch is left');
  assert.match(layout, /\{% if velani_lang == 'es' %\}\{% render 'velani-day-header-es'/);
  assert.match(layout, /<link rel="stylesheet" href="\{\{ 'velani-day\.css' \| asset_url \}\}">/);
  assert.match(layout, /<meta name="color-scheme" content="light"><meta name="theme-color" content="#FBFBFD">/);
  assert.match(layout, /\{% when 'nevora' %\}[^]*?\{% capture velani_head %\}[^]*?velani-day-nevora\.css[^]*?\{% when /, 'each page captures its own Day assets');
  const snippets = renderShopifySnippets();
  assert.deepEqual(Object.keys(snippets).sort(), ['velani-day-footer-en', 'velani-day-footer-es', 'velani-day-header-en', 'velani-day-header-es']);
  assert.match(snippets['velani-day-header-en'], /\{% if velani_nav == 'plans' %\} aria-current="page"\{% endif %\}/);
  assert.match(snippets['velani-day-footer-en'], /<dialog class="cookie-dialog" id="cookie-dialog"/, 'the cookie dialog travels with the Day footer');
});

test('About on Day: real routes and facts, one copy button with a fallback, no custom work', () => {
  const body = renderBody('/pages/about');
  assert.match(renderBody('/pages/about', { target: 'shopify' }), /\{% if theme\.role == 'main' %\}\/pages\/nevora\{% else %\}/, 'links follow the unpublished-theme preview');
  assert.match(body, /<h1 id="ab-t">Software for small businesses\.<\/h1>/);
  assert.match(body, /Velani started in 2026\./);
  assert.match(body, /href="\/pages\/nevora"/);
  assert.match(body, /href="\/pages\/contact\?interest=nevora-demo">Request a free trial</);
  assert.match(body, /<a class="mail-a" id="ab-mail" href="mailto:support@thevelani\.com">/, 'the address stays a link when copying is not available');
  assert.doesNotMatch(body, /custom-development|fixed price|written scope|<script/);
  assert.equal((body.match(/<h1/g) || []).length, 1);
});

test('Home on Day: the day in five moments, Rondo with approval, starting, plans and both languages', () => {
  const html = renderBody('/');
  assert.equal((html.match(/<h1/g) || []).length, 1);
  assert.match(html, /<h1 id="h1">Open to close\.<\/h1>/);
  const order = ['id="hero"', 'id="day"', 'id="rondo"', 'id="nevora"', 'id="start"', 'id="plans"', 'id="lang"'].map(k => html.indexOf(k));
  assert.ok(order.every((v, i) => v > -1 && (i === 0 || v > order[i - 1])), 'sections in order');
  assert.equal((html.match(/<article class="mo/g) || []).length, 5, 'five moments');
  assert.equal((html.match(/data-go="\d"/g) || []).length, 5, 'five timeline buttons');
  assert.match(html, /<button class="ok" type="button" id="ok" aria-pressed="false"/);
  assert.match(html, /Nothing changes until you approve\./);
  assert.match(html, /\$19<small>\/month<\/small>[^]*\$29<small>\/month<\/small>/);
  assert.match(html, /Your 30 days start when it’s created in NEVORA\./, 'trial start follows workplace provisioning');
  assert.match(html, /Prices are in US dollars and may change before online billing opens\./);
  assert.match(html, /it doesn’t pay employees or file payroll taxes/);
  assert.match(html, /href="\/pages\/contact\?interest=nevora-demo">Request a free trial</);
  assert.doesNotMatch(html, /custom-development|Custom software|claude\.ai|\{\{|style="list-style/);
});

test('Home device screens are pictures: named once, hidden from screen readers inside, icons from one sprite', () => {
  const html = renderBody('/', { target: 'shopify' });
  assert.match(html, /<div class="hs" role="img" aria-label="NEVORA on a MacBook, an iPad time clock and an iPhone\. Sample data from Northside Café\.">/);
  assert.match(html, /<div class="stage" aria-hidden="true">/);
  assert.equal((html.match(/<svg class="spr" aria-hidden="true"/g) || []).length, 1);
  for (const [, id] of html.matchAll(/<use href="#(i-[\w-]+)"/g)) assert.ok(html.includes('<symbol id="' + id + '"'), id);
  assert.match(html, /src="\{\{ 'nevora-wm-ink\.png' \| asset_url \}\}"/);
  assert.match(html, /src="\{\{ 'day-nevora-icon\.png' \| asset_url \}\}"/);
  assert.doesNotMatch(html, /data:image/);
});

test('NEVORA on Day: one chapter per job in order, the anchors the header uses, facts and FAQ', () => {
  const html = renderBody('/pages/nevora');
  assert.equal((html.match(/<h1/g) || []).length, 1);
  const order = ['id="ln"', 'class="zh"', 'class="hl"', 'id="schedule"', 'id="team"', 'id="clock"', 'id="rondo"', 'id="timecards"', 'id="payroll"', 'id="plans"', 'id="faq"', 'id="close"'].map(k => html.indexOf(k));
  assert.ok(order.every((v, i) => v > -1 && (i === 0 || v > order[i - 1])), 'chapters in order');
  assert.match(html, /<p class="relay" id="relay">/, 'the header and footer Relay link lands on the Relay line');
  assert.match(html, /href="\/pages\/contact\?interest=relay">Join the waitlist/);
  assert.match(html, /<nav aria-label="NEVORA sections">/);
  assert.equal((html.match(/<details>/g) || []).length, 6);
  assert.match(html, /On day 30, the Owner picks a plan in NEVORA\. Nothing is charged until you do\./);
  assert.match(html, /Prices are in US dollars and may change before online billing opens\./);
  assert.match(html, /The phone app is coming to the App Store and Google Play\./);
  assert.match(html, /id="sd-chip">Not published</);
  assert.doesNotMatch(html, /\bDraft\b|claude\.ai|\{\{|custom-development|style="padding-top/);
});

test('every in-page link on a Day page lands on an element of that page', () => {
  for (const path of dayRoutes) {
    const html = renderPage(path).html;
    for (const [, id] of html.matchAll(/href="#([\w-]+)"/g)) assert.ok(html.includes('id="' + id + '"'), path + ' #' + id);
  }
});

test('Plans on Day keeps the billing contract of velani-commerce.js', () => {
  const html = renderBody('/pages/plans');
  const hero = html.slice(html.indexOf('id="top"'), html.indexOf('data-pcard'));
  assert.match(hero, /<div class="center hcopy">\s*<h1 id="h1">/, 'the handoff swaps the hero copy in #top .hcopy');
  assert.match(hero, /<p class="lead fade">/, 'the line the handoff replaces: .hcopy > p.fade:not(.hfact)');
  assert.match(hero, /<div class="hacts"><a class="hb fill" href="\/pages\/contact\?interest=nevora-demo">/);
  assert.match(hero, /<p class="hfact">Your 30 free days start when your workplace is provisioned \(created in NEVORA\)\./);
  assert.equal((html.match(/data-pcard/g) || []).length, 1);
  for (const hook of ['id="pc-n"', 'data-count', 'data-unit', 'data-amt', 'data-per>', 'data-note', 'data-pc-live', 'data-step="-1"', 'data-step="1"', 'data-price-mine']) assert.ok(html.includes(hook), hook);
  assert.equal((html.match(/<div class="pc-meter"[^>]*>(.*?)<\/div>/)[1].match(/<i/g) || []).length, 30, 'thirty marks');
  assert.match(html, /<input id="pc-n" type="range" min="1" max="31" value="8"[^>]* disabled>/, 'the slider waits for the script; without it the card reads 8 employees at $19');
  // velani-commerce.js takes the first #price link containing interest=nevora as the quote: it must be the quote, not the trial
  const price = html.slice(html.indexOf('id="price"'), html.indexOf('</section>', html.indexOf('id="price"')));
  assert.match(price.match(/href="[^"]*interest=nevora[^"]*"/)[0], /interest=nevora"/);
  assert.match(html, /href="\/pages\/nevora-billing"/);
  assert.match(html, /Prices are in US dollars and may change before online billing opens\./);
  assert.match(html, /<template id="velani-commerce" data-api="[^"]*"><\/template><script type="module" src="\/assets\/velani-commerce\.js"><\/script>/);
  assert.doesNotMatch(html, /custom-development|Start a project|\bDraft\b/);
});

test('Contact on Day: four topics, Jose\'s form and safeguards, the side following the topic', async () => {
  const html = renderBody('/pages/contact');
  assert.equal((html.match(/<h1/g) || []).length, 1);
  assert.match(html, /<form id="project-inquiry" class="inquiry-form" method="post" action="\/\?velani_preview_inquiry=1" data-inquiry-mode="preview" novalidate>/);
  for (const id of ['inquiry-name', 'inquiry-email', 'inquiry-company', 'inquiry-team', 'inquiry-locations', 'inquiry-message', 'inquiry-interest', 'inquiry-sent']) assert.ok(html.includes('id="' + id + '"'), id);
  assert.match(html, /data-inquiry-submit/);
  assert.match(html, /Preview\. This form checks your draft and sends nothing\./);
  for (const k of ['trial', 'big', 'relay', 'other']) assert.ok(html.includes('class="tp-' + k + '"'), k);
  assert.match(html, /Your 30 free days start when your workplace is created in NEVORA/);
  assert.doesNotMatch(html, /custom-software|Web or app|Start a project|website or an app/);
  // On Shopify: Shopify's contact form only on the published theme with inquiries on; email there otherwise; the preview check elsewhere
  const live = renderBody('/pages/contact', { target: 'shopify' });
  assert.match(live, /\{% if settings\.inquiries_enabled and theme\.role == 'main' %\}\{% form 'contact', id: 'project-inquiry'/);
  assert.match(live, /\{% elsif theme\.role == 'main' %\}<div class="client-write">/);
  assert.match(live, /\{% else %\}<form id="project-inquiry"[^>]*data-inquiry-mode="preview"/);
});

test('Help on Day: answers, two keys, deletion, and Jose\'s client form folded into one quiet line', () => {
  const html = renderBody('/pages/help');
  assert.equal((html.match(/<h1/g) || []).length, 1);
  assert.equal((html.match(/<details data-topic=/g) || []).length, 13, 'thirteen answers');
  assert.match(html, /<input type="search" id="q"/);
  assert.match(html, /id="signin"[^]*id="delete"[^]*<details class="clientd" id="client-d">[^]*id="close"/, 'sections in order');
  assert.match(html, /<summary><span>Already a Velani client\?<span>/);
  assert.match(html, /<form id="project-inquiry" class="inquiry-form" data-inquiry-mode="hub" data-hub="preview"/, 'the client form keeps its preview mode off the published theme');
  assert.match(html, /Your 30 free days start when your workplace is created in NEVORA/);
  assert.match(html, /Forgot password\?/);
  assert.match(html, /href="\/pages\/nevora-account-deletion"/);
  assert.match(html, /Never email your password, a verification code, bank details or payroll documents\./);
  assert.doesNotMatch(html, /custom-development|Does Velani build custom software|\{\{/);
  const live = renderBody('/pages/help', { target: 'shopify' });
  assert.match(live, /data-hub="\{% if theme\.role == 'main' or settings\.client_hub_preview_submissions %\}live\{% else %\}preview\{% endif %\}"/);
});

test('Sign in on Day: Jose\'s three facts, the two keys, and support at the end with no offer', () => {
  const html = renderBody('/pages/sign-in');
  assert.equal((html.match(/<h1/g) || []).length, 1);
  for (const h of ['Your address and ID', 'Forgot your password?', 'Your 4-digit PIN']) assert.ok(html.includes('<h2>' + h + '</h2>'), h);
  assert.match(html, /Two different keys\./);
  assert.match(html, /href="\/pages\/nevora-support">NEVORA support</);
  assert.doesNotMatch(html, /project-inquiry|Request a free trial|custom-development|\{\{/);
});

test('Rondo and Relay have their own Day pages, and the header, footer, Home and About link to them', () => {
  for (const path of ['/pages/rondo', '/pages/relay']) assert.ok(routes[path]?.day, path);
  const header = dayHeader(null, 'preview', { lang: 'en', hrefs: { en: '/', es: '/pages/es' } }), footer = dayFooter('preview', { lang: 'en', hrefs: { en: '/', es: '/pages/es' } });
  for (const html of [header, footer, renderBody('/'), renderBody('/pages/about')]) {
    assert.match(html, /href="\/pages\/rondo"/); assert.match(html, /href="\/pages\/relay"/);
    assert.doesNotMatch(html, /\/pages\/nevora#(rondo|relay)/);
  }
  const es = dayHeader(null, 'preview', { lang: 'es', hrefs: { en: '/', es: '/pages/es' } });
  assert.match(es, /href="\/pages\/es-rondo">Rondo</, 'Spanish pages link the Spanish Rondo page');
  assert.match(es, /href="\/pages\/es-relay">Relay</, 'Spanish pages link the Spanish Relay page');
  assert.match(dayFooter('preview', { lang: 'es', hrefs: { en: '/', es: '/pages/es' } }), /href="\/pages\/security" hreflang="en">/, 'English-only pages are marked on Spanish pages');
});

test('Rondo on Day: owner-only assistant, approval before change, sources named', () => {
  const html = renderBody('/pages/rondo');
  assert.equal((html.match(/<h1/g) || []).length, 1);
  assert.match(html, /<div class="ln" id="ln" data-bar>/);
  for (const id of ['top', 'ask', 'approve', 'knows', 'owner', 'faq']) assert.ok(html.includes('id="' + id + '"'), id);
  assert.match(html, /Nothing changes until the Owner approves, and NEVORA checks the change again before it applies\./);
  assert.match(html, /Only the business Owner\./);
  assert.match(html, /href="\/pages\/contact\?interest=nevora-demo"/);
  assert.doesNotMatch(html, /claude\.ai|\{\{/);
});

test('Relay on Day: in design, no date or price, and the waitlist is the Contact form (no form of its own)', () => {
  const html = renderBody('/pages/relay');
  assert.equal((html.match(/<h1/g) || []).length, 1);
  assert.match(html, /Relay is in design and has no release date yet\./);
  assert.match(html, /There’s no price yet\.|There's no price yet\./);
  assert.match(html, /href="\/pages\/contact\?interest=relay">Join the waitlist</);
  assert.doesNotMatch(html, /<form|<input|type="email"|nothing is sent|mockup/i);
  assert.match(html, /Concept screen/);
});

test('no designer notes from the mockups reach a Day page', () => {
  for (const path of dayRoutes) assert.doesNotMatch(renderBody(path), /class="dn"|Apple's|Apple’s "|Tweaks/, path);
});

test('legal and NEVORA policy pages use the Day chrome and keep Jose\'s documents unchanged', () => {
  const legal = Object.entries(routes).filter(([, p]) => p.legal || p.kind === 'policy' || p.kind === 'legal-index');
  assert.equal(legal.length, 15, 'the project terms page left with custom work (decision 2)');
  for (const [path, page] of legal) {
    assert.equal(page.day, 'doc', path);
    const html = renderPage(path).html;
    assert.match(html, /velani-day\.css[^]*velani-day-legal\.css/, path);
    assert.match(html, /<header class="gn" id="gn">/, path);
    assert.match(html, /<section class="phero">/, path);
    assert.doesNotMatch(html, /velani-motion\.js|velani\.css"/, path);
  }
  // The bodies are the same documents as before: Jose's sections and contents list
  const body = renderBody('/pages/nevora-privacy');
  assert.equal((body.match(/<section id="p-\d+">/g) || []).length, (body.match(/<a href="#p-\d+">/g) || []).length);
  assert.match(renderPage('/missing-page').html, /velani-day-legal\.css/, 'the not-found page uses the legal look');
});

test('the trial and billing pages are on Day and keep every hook velani-commerce.js reads', () => {
  for (const [path, step] of [['/pages/nevora-start', 'start'], ['/pages/es-prueba', 'start'], ['/pages/nevora-verify', 'verify'], ['/pages/es-configurar', 'verify'], ['/pages/nevora-billing', 'billing'], ['/pages/es-facturacion', 'billing'], ['/pages/nevora-billing-return', 'return'], ['/pages/es-pago', 'return']]) {
    assert.equal(routes[path].day, 'account', path);
    const html = renderPage(path).html;
    assert.match(html, /<header class="gn"/, path + ' Day header');
    assert.match(html, /velani-day-account\.css/, path + ' its stylesheet');
    assert.doesNotMatch(html, /class="hpanel|night-/, path + ' no Night panels or photos');
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, path + ' one heading');
    if (step === 'start') assert.match(html, /location\.replace\(/, path + ' still sends visitors to the trial request while signup is closed');
    if (step === 'verify') { assert.match(html, /data-verify-retired/, path); assert.match(html, /id="velani-commerce"/, path); }
    if (step === 'billing' || step === 'return') {
      assert.match(html, new RegExp('id="setup"[^>]*data-account-page="' + step + '"'), path);
      for (const hook of ['data-setup-lede', 'data-setup-acts', 'data-setup-card', 'data-off', 'data-announce', 'id="setup-t" tabindex="-1"', 'id="velani-commerce"', 'velani-commerce.js']) assert.match(html, new RegExp(hook.replace('.', '\\.')), path + ' ' + hook);
      assert.match(html, /href="mailto:support@thevelani\.com\?subject=/, path + ' billing support by email');
      assert.doesNotMatch(html, /data-setup-acts[^]*?interest=nevora-demo[^]*?data-setup-card/, path + ' billing visitors get support, not a new trial');
    }
  }
});

test('Rondo and Relay have Spanish pages with Spanish words, the other language marked, and Spanish links', () => {
  const rondo = renderPage('/pages/es-rondo').html, relay = renderPage('/pages/es-relay').html;
  assert.match(rondo, /<h2 id="ap-h">Tú apruebas cada cambio\.<\/h2>/);
  assert.match(rondo, /data-q="3" lang="en">Who was late this week\?</, 'the English questions are marked English');
  assert.match(rondo, /href="\/pages\/es-contacto\?interest=nevora-demo"/);
  assert.match(rondo, /href="\/pages\/es-nevora"/);
  assert.match(relay, /<h2 id="jb-h">Tres trabajos\. Un sistema\.<\/h2>/);
  assert.match(relay, /href="\/pages\/es-contacto\?interest=relay"/, 'the waitlist opens the Spanish Contact page on the Relay topic');
  for (const html of [rondo, relay]) {
    assert.match(html, /velani-day-(rondo|relay)\.js/);
    assert.doesNotMatch(html.replace(/<a [^>]*aria-label="English"[^>]*>EN<\/a>/g, ''), /href="\/pages\/(contact|nevora|rondo|relay)[?"#]/, 'no links to English pages that have Spanish versions, besides the language switch');
  }
});

test('Spanish pages draw the app screens in Spanish; English pages keep them in English', () => {
  const pick = html => html.replace(/<script[^]*?<\/script>/g, '');
  const esHome = pick(renderPage('/pages/es').html), enHome = pick(renderPage('/').html);
  for (const words of ['REGISTRO DE TIEMPO', 'Entrada registrada', 'Período de pago', 'Despachar', 'Pregúntale a Rondo']) assert.match(esHome, new RegExp(words), 'Spanish Home ' + words);
  for (const words of ['TIME CLOCK', 'Clock-in recorded', 'Pay period', '>Bump<', 'Ask Rondo']) assert.match(enHome, new RegExp(words), 'English Home ' + words);
  assert.match(pick(renderPage('/pages/es-nevora').html), /Próximo turno/);
  assert.match(pick(renderPage('/pages/es-relay').html), /Para recoger · Marisol/);
  const esRondo = pick(renderPage('/pages/es-rondo').html);
  assert.match(esRondo, /class="nv ro-scene"[^]*data-words>Dana Kim está libre/, 'the hero phone keeps the hooks rondo.js plays');
  for (const path of ['/pages/es', '/pages/es-nevora', '/pages/es-rondo', '/pages/es-relay']) assert.doesNotMatch(pick(renderPage(path).html), /\{\{|(?<!lang="en")>(Home|Schedule|Payroll|Bump|Approve|AM|PM)</, path + ' no English screen labels outside text marked English');
});

test('share images: every one a page names exists at 1200 by 630, and Spanish pages share Spanish images', async () => {
  const { readFileSync, existsSync } = await import('node:fs');
  const size = file => { const b = readFileSync(new URL('../public/assets/' + file, import.meta.url)); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
  const named = new Set(['velani-social.png', 'velani-social-es.png']);
  for (const [path, page] of Object.entries(routes)) if (page.og) {
    named.add(page.og[0]);
    if (page.lang === 'es') assert.match(page.og[0], /-es\.png$/, path + ' uses a Spanish image');
    else assert.doesNotMatch(page.og[0], /-es\.png$/, path);
    assert.ok(page.og[1].length > 20, path + ' describes its image');
  }
  for (const file of named) { assert.ok(existsSync(new URL('../public/assets/' + file, import.meta.url)), file); assert.deepEqual(size(file), [1200, 630], file); }
  assert.ok(!existsSync(new URL('../public/assets/velani-social-custom.png', import.meta.url)));
  const layout = renderShopifyLayout();
  assert.match(layout, /\{% when 'es-ayuda' %\}[^]*?\{% assign velani_og = 'velani-social-es\.png' %\}[^]*?\{% when /, 'a Spanish page without its own image shares the Spanish one');
  assert.match(layout, /\{% when 'rondo' %\}[^]*?\{% assign velani_og = 'velani-social-rondo\.png' %\}/);
});

test('pages that show Rondo answers load the stylesheet that draws the answer card and approve button', async () => {
  const { readFileSync } = await import('node:fs');
  const { DAY_PAGE_ASSETS } = await import('../src/day.mjs');
  const devices = readFileSync(new URL('../src/day/devices.css', import.meta.url), 'utf8');
  for (const rule of ['.c-a{', '.c-who{', '.rm-badge{', '.src{', '.prep{', '.prep .prep-t{', '.ok{']) assert.ok(devices.includes(rule), 'devices.css draws ' + rule);
  for (const [path, day] of [['/', 'home'], ['/pages/nevora', 'nevora'], ['/pages/rondo', 'rondo'], ['/pages/es-nevora', 'nevora'], ['/pages/es-rondo', 'rondo']]) {
    assert.ok(DAY_PAGE_ASSETS[day].includes('velani-day-devices.css'), path + ' loads devices.css');
    assert.match(renderPage(path).html, /velani-day-devices\.css/, path);
  }
  for (const js of ['nevora.js', 'rondo.js']) assert.doesNotMatch(readFileSync(new URL('../src/day/' + js, import.meta.url), 'utf8'), /<h4>/, js + ' builds no h4 (the card title is p.prep-t under an h2)');
});
