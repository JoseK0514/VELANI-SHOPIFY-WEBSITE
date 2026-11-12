// Renders the PNG tab and home-screen icons from src/brand/favicon.svg (Safari and iOS use these; the SVG covers other browsers).
// Usage: PLAYWRIGHT_FROM=/path/with/playwright node scripts/favicon-png.mjs
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
const pw = process.env.PLAYWRIGHT_FROM ? createRequire(process.env.PLAYWRIGHT_FROM + '/package.json')('playwright') : await import('@playwright/test');
const svg = await readFile(new URL('../src/brand/favicon.svg', import.meta.url), 'utf8');
const square = svg.replace(/rx="14"/, 'rx="0"'); // iOS rounds the home-screen icon itself
const b = await pw.chromium.launch();
for (const [file, size, src] of [['favicon-32.png', 32, svg], ['apple-touch-icon.png', 180, square]]) {
  const p = await b.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await p.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${src}`);
  await p.screenshot({ path: new URL('../src/brand/' + file, import.meta.url).pathname, omitBackground: true });
  await p.close();
}
await b.close();
console.log('icons written');
