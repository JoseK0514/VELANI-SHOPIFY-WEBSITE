import test from 'node:test';
import assert from 'node:assert/strict';
import { Liquid } from 'liquidjs';
import { renderBody, renderShopifyLayout, renderShopifySnippets } from '../src/render.mjs';

// The layout renders its header and footer from theme snippets ({% render %}); Shopify's global objects (theme, routes, settings,
// request) are visible inside snippets, so the test passes the page context as globals too
const liquid = new Liquid({ templates: Object.fromEntries(Object.entries(renderShopifySnippets()).map(([name, src]) => [name + '.liquid', src])), extname: '.liquid' });
liquid.registerFilter('asset_url', name => '/assets/' + name);
const parseAndRender = liquid.parseAndRender.bind(liquid);
liquid.parseAndRender = (tpl, ctx = {}) => parseAndRender(tpl, ctx, { globals: ctx });
test('unpublished navigation stays in the exact draft without published page resources', async () => {
  const html = await liquid.parseAndRender(renderBody('/', { target: 'shopify' }), { theme: { role: 'unpublished', id: 123 }, routes: { root_url: '/' } });
  assert.match(html, /href="\/\?preview_theme_id=123&amp;view=velani-contact&amp;interest=nevora-demo"/);
  assert.match(html, /href="\/\?preview_theme_id=123&amp;view=velani-custom-development#booking"/);
  assert.doesNotMatch(html, /href="\/pages\//);
});
test('main-theme links retain canonical company page destinations', async () => {
  const html = await liquid.parseAndRender(renderBody('/', { target: 'shopify' }), { theme: { role: 'main', id: 123 }, routes: { root_url: '/' } });
  assert.match(html, /href="\/pages\/contact\?interest=nevora-demo"/);
  assert.match(html, /href="\/pages\/nevora"/);
  assert.doesNotMatch(html, /preview_theme_id|view=velani-/);
});
test('native layout includes the real social card and uses theme page metadata', () => {
  const html = renderShopifyLayout();
  assert.match(html, /property="og:image"/);
  assert.match(html, /velani-social\.png/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /velani_page_title/);
});
test('the published theme is indexable while drafts stay noindex', async () => {
  const layout = renderShopifyLayout();
  const ctx = role => ({ theme: { role, id: 9 }, routes: { root_url: '/' }, template: { name: 'index', suffix: '' }, request: { locale: { iso_code: 'en' }, page_type: 'index' }, settings: {} });
  const main = await liquid.parseAndRender(layout, ctx('main'));
  const draft = await liquid.parseAndRender(layout, ctx('unpublished'));
  assert.doesNotMatch(main, /noindex/);
  assert.match(draft, /name="robots" content="noindex, nofollow"/);
  assert.match(main, /<title>NEVORA · Scheduling, time clock and payroll calculation · Velani<\/title>/);
  assert.match(main, /velani-home\.css/);
});
test('the NEVORA page loads its own assets and marks its nav item', async () => {
  const layout = renderShopifyLayout();
  const html = await liquid.parseAndRender(layout, { theme: { role: 'main', id: 9 }, routes: { root_url: '/' }, template: { name: 'page', suffix: 'nevora' }, request: { locale: { iso_code: 'en' }, page_type: 'page' }, settings: {} });
  assert.match(html, /velani-nevora\.js/);
  assert.match(html, /<header class="gnav" id="gnav">/);
  assert.doesNotMatch(html, /class="lnav"/, 'one header on every page: the NEVORA page has no local nav');
  // Phase 1: four flat links; NEVORA carries the current-page mark in the bar and in the phone menu
  assert.match(html, /<a href="[^"]*nevora[^"]*" aria-current="page">NEVORA<\/a>/);
  assert.match(html, /<a class="gmenu-sub" href="\/pages\/nevora" aria-current="page">NEVORA<\/a>/);
});
test('live contact page never shows the preview form on the published theme', async () => {
  const body = renderBody('/pages/contact', { target: 'shopify' }).replace(/\{% form [^%]*%\}/, '<form>').replace('{% endform %}', '</form>').replace(/\{\{ 'shopify[^}]*\}\}/, '');
  const off = await liquid.parseAndRender(body, { theme: { role: 'main', id: 9 }, routes: { root_url: '/' }, settings: { inquiries_enabled: false } });
  assert.doesNotMatch(off, /preview/i);
  assert.match(off, /mailto:support@thevelani\.com/);
  const draft = await liquid.parseAndRender(body, { theme: { role: 'unpublished', id: 9 }, routes: { root_url: '/' }, settings: { inquiries_enabled: true } });
  assert.match(draft, /data-inquiry-mode="preview"/);
  const live = await liquid.parseAndRender(body, { theme: { role: 'main', id: 9 }, routes: { root_url: '/' }, settings: { inquiries_enabled: true } });
  assert.match(live, /data-inquiry-mode="live"/);
  assert.match(live, /Send inquiry/);
  assert.doesNotMatch(live, /preview/i);
});
test('the assistant appears only when an API address is configured', async () => {
  const layout = renderShopifyLayout();
  assert.match(layout, /\{% if settings\.assistant_api_url != blank %\}[\s\S]*id="ast-root"[\s\S]*velani-assist\.js[\s\S]*\{% endif %\}/);
  const ctx = api => ({ theme: { role: 'main', id: 9 }, routes: { root_url: '/' }, template: { name: 'index', suffix: '' }, request: { locale: { iso_code: 'en' }, page_type: 'index' }, settings: { assistant_api_url: api } });
  assert.doesNotMatch(await liquid.parseAndRender(layout, ctx('')), /ast-root/);
  const on = await liquid.parseAndRender(layout, ctx('https://velani-ai.example'));
  assert.match(on, /id="ast-root" hidden data-api="https:\/\/velani-ai\.example"/);
  assert.match(on, /velani-assist\.js/);
  const { renderPage } = await import('../src/render.mjs');
  const saved = process.env.VELANI_ASSISTANT_API;
  delete process.env.VELANI_ASSISTANT_API;
  assert.doesNotMatch(renderPage('/').html, /ast-root/);
  process.env.VELANI_ASSISTANT_API = 'http://127.0.0.1:3001';
  assert.match(renderPage('/').html, /data-api="http:\/\/127\.0\.0\.1:3001"[\s\S]*velani-assist\.js/);
  if (saved === undefined) delete process.env.VELANI_ASSISTANT_API; else process.env.VELANI_ASSISTANT_API = saved;
});
