import test from 'node:test';
import assert from 'node:assert/strict';
import { routes } from '../src/content.mjs';
import { renderPage, renderBody, renderShopifyLayout, renderShopifySnippets } from '../src/render.mjs';
import { dayHeader, dayFooter } from '../src/day.mjs';

const dayRoutes = Object.entries(routes).filter(([, page]) => page.day).map(([path]) => path);

test('pages opt into the Day design one at a time; every other page keeps Night', () => {
  assert.ok(dayRoutes.includes('/pages/about'));
  for (const [path, page] of Object.entries(routes)) {
    const html = renderPage(path).html;
    if (page.day) {
      assert.match(html, /velani-day\.css/, path);
      assert.match(html, /<header class="gn" id="gn">/, path);
      assert.doesNotMatch(html, /velani-motion\.js|class="gnav" id="gnav"|dm-sans-latin/, path);
      assert.match(html, /<meta name="color-scheme" content="light">/, path);
    } else {
      assert.doesNotMatch(html, /velani-day\.(css|js)|<header class="gn"/, path);
    }
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

test('the Shopify layout picks the Day snippets, head and colours per page', () => {
  const layout = renderShopifyLayout();
  assert.match(layout, /\{% assign velani_design = 'night' %\}/, 'Night is the default');
  assert.match(layout, /\{% when 'about' %\}[^]*?\{% assign velani_design = 'day' %\}[^]*?\{% when /);
  assert.match(layout, /\{% if velani_design == 'day' %\}\{% if velani_lang == 'es' %\}\{% render 'velani-day-header-es'/);
  assert.match(layout, /\{% if velani_design == 'day' %\}<link rel="stylesheet" href="\{\{ 'velani-day\.css' \| asset_url \}\}">/);
  assert.match(layout, /\{% if velani_design == 'day' %\}<meta name="color-scheme" content="light">/);
  const snippets = renderShopifySnippets();
  for (const name of ['velani-day-header-en', 'velani-day-header-es', 'velani-day-footer-en', 'velani-day-footer-es']) assert.ok(snippets[name], name);
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
  assert.match(html, /src="\{\{ 'night-nevora-wm-ink\.png' \| asset_url \}\}"/);
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
