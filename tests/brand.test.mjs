import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderPage, renderShopifySnippets } from '../src/render.mjs';

const brand = name => readFileSync(new URL('../src/brand/' + name, import.meta.url));
const pngSize = buf => [buf.readUInt32BE(16), buf.readUInt32BE(20)];
// The Velani symbol ("Fan", chosen November 22): four quarter circles on a 32-unit grid, written by scripts/brand-icons.mjs
const FAN = 'M15 15H1A14 14 0 0 1 15 1ZM17 1H31A14 14 0 0 1 17 15ZM15 31H1A14 14 0 0 1 15 17ZM31 31H17A14 14 0 0 1 31 17Z';

test('the symbol and the browser icon are the Fan drawing; the old V icon is gone', () => {
  const mark = brand('velani-mark.svg').toString(), favicon = brand('favicon.svg').toString();
  assert.ok(mark.includes(`d="${FAN}"`) && /fill="currentColor"/.test(mark));
  assert.ok(favicon.includes(`d="${FAN}"`), 'favicon.svg draws the symbol');
  assert.match(favicon, /@media \(prefers-color-scheme:dark\)\{path\{fill:#FFFFFF\}\}/, 'white on dark browser tabs');
  assert.doesNotMatch(favicon, /radialGradient|342\.24/, 'no trace of the serif V tile');
});

test('PNG icons have the sizes the pages declare', () => {
  assert.deepEqual(pngSize(brand('favicon-32.png')), [32, 32]);
  assert.deepEqual(pngSize(brand('apple-touch-icon.png')), [180, 180]);
  assert.deepEqual(pngSize(brand('velani-app-icon.png')), [1024, 1024]);
});

test('the header and phone menu show the symbol before the wordmark, hidden from screen readers', () => {
  for (const path of ['/', '/pages/es-nevora']) {
    const html = renderPage(path).html;
    const logos = html.match(/<a class="logo" href="[^"]*" aria-label="[^"]+"><svg class="mk-velani" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" focusable="false"><path d="[^"]+"\/><\/svg><svg class="wm-velani"/g) || [];
    assert.equal(logos.length, 2, path + ': header and phone menu');
    assert.match(html, /<link rel="icon" href="[^"]*favicon\.svg" type="image\/svg\+xml"><link rel="icon" href="[^"]*favicon-32\.png" type="image\/png" sizes="32x32"><link rel="apple-touch-icon" href="[^"]*apple-touch-icon\.png">/, path);
  }
  const snippets = Object.values(renderShopifySnippets()).join('\n');
  assert.ok((snippets.match(/class="mk-velani"/g) || []).length >= 4, 'English and Spanish theme headers, with their menus');
});
