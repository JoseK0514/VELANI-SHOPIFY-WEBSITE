import test from 'node:test';
import assert from 'node:assert/strict';
import { Liquid } from 'liquidjs';
import { renderBody, renderShopifyLayout } from '../src/render.mjs';

const liquid = new Liquid();
liquid.registerFilter('asset_url', name => '/assets/' + name);
test('unpublished navigation stays in the exact draft without published page resources', async () => {
  const html = await liquid.parseAndRender(renderBody('/', { target: 'shopify' }), { theme: { role: 'unpublished', id: 123 }, routes: { root_url: '/' } });
  assert.match(html, /href="\/\?preview_theme_id=123&amp;view=velani-contact"/);
  assert.match(html, /href="\/\?preview_theme_id=123&amp;view=velani-custom-development#web-applications"/);
  assert.doesNotMatch(html, /href="\/pages\//);
});
test('main-theme links retain canonical company page destinations', async () => {
  const html = await liquid.parseAndRender(renderBody('/', { target: 'shopify' }), { theme: { role: 'main', id: 123 }, routes: { root_url: '/' } });
  assert.match(html, /href="\/pages\/contact"/);
  assert.doesNotMatch(html, /preview_theme_id|view=velani-/);
});
test('native layout includes the real social card and uses theme page metadata', () => {
  const html = renderShopifyLayout();
  assert.match(html, /property="og:image"/);
  assert.match(html, /velani-social\.webp/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /velani_page_title/);
});
