import test from 'node:test';
import assert from 'node:assert/strict';
import { Liquid } from 'liquidjs';
import { renderBody, renderShopifyLayout } from '../src/render.mjs';

const liquid = new Liquid();
liquid.registerFilter('asset_url', name => '/assets/' + name);
test('unpublished navigation stays in the exact draft without published page resources', async () => {
  const html = await liquid.parseAndRender(renderBody('/', { target: 'shopify' }), { theme: { role: 'unpublished', id: 123 }, routes: { root_url: '/' } });
  assert.match(html, /href="\/\?preview_theme_id=123&amp;view=velani-contact&amp;interest=nevora"/);
  assert.match(html, /href="\/\?preview_theme_id=123&amp;view=velani-custom-development#web-applications"/);
  assert.doesNotMatch(html, /href="\/pages\//);
});
test('main-theme links retain canonical company page destinations', async () => {
  const html = await liquid.parseAndRender(renderBody('/', { target: 'shopify' }), { theme: { role: 'main', id: 123 }, routes: { root_url: '/' } });
  assert.match(html, /href="\/pages\/contact\?interest=nevora"/);
  assert.match(html, /href="\/pages\/nevora-support"/);
  assert.doesNotMatch(html, /preview_theme_id|view=velani-/);
});
test('native layout includes the real social card and uses theme page metadata', () => {
  const html = renderShopifyLayout();
  assert.match(html, /property="og:image"/);
  assert.match(html, /velani-social\.webp/);
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
  assert.match(main, /<title>The Velani: Brighter work ahead<\/title>/);
  assert.match(main, /velani-home\.css/);
});
test('the NEVORA page loads its own assets and marks its nav item', async () => {
  const layout = renderShopifyLayout();
  const html = await liquid.parseAndRender(layout, { theme: { role: 'main', id: 9 }, routes: { root_url: '/' }, template: { name: 'page', suffix: 'nevora' }, request: { locale: { iso_code: 'en' }, page_type: 'page' }, settings: {} });
  assert.match(html, /velani-nevora\.js/);
  assert.match(html, /class="gnav static"/);
  assert.match(html, /<a href="\/pages\/nevora" aria-current="page">NEVORA<\/a>/);
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
