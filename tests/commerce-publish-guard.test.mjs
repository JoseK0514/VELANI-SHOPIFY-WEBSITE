import test from 'node:test';
import assert from 'node:assert/strict';
import { Liquid } from 'liquidjs';
import { renderBody } from '../src/render.mjs';

const liquid = new Liquid();
liquid.registerFilter('asset_url', name => '/assets/' + name);
const staging = 'https://br-hidden-mud-bbnc2fxk-commerceapi.compute.c-15.us-east-1.aws.neon.tech';
const render = (path, role) => liquid.parseAndRender(renderBody(path, { target: 'shopify' }), {
  theme: { role, id: 193268777274 }, routes: { root_url: '/' }, settings: { commerce_api_url: staging }
});
for (const path of ['/pages/plans', '/pages/nevora-billing', '/pages/nevora-billing-return', '/pages/es-facturacion']) {
  for (const role of ['main', 'demo', undefined]) {
    test(`${role ?? 'missing'} role on ${path} cannot use a leftover staging setting`, async () => {
      const html = await render(path, role);
      assert.match(html, /<template id="velani-commerce" data-api=""><\/template>/);
      assert(!html.includes(staging));
    });
  }
  for (const role of ['unpublished', 'development']) {
    test(`${role} ${path} retains the sandbox API for acceptance`, async () => {
      assert((await render(path, role)).includes('data-api="' + staging + '"'));
    });
  }
}
