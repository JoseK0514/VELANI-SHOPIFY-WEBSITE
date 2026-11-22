// The Velani symbol ("Fan", chosen Nov 22, 2026): four quarter circles on a 2 × 2 grid, three facing one way and one
// turned back. This script is its single source: it writes the SVGs and renders the PNG icons.
//   node scripts/brand-icons.mjs   (VELANI_CHROMIUM_EXECUTABLE=/path/to/chrome when Playwright's own browser is not installed)
// Each size is drawn on its own pixel grid (cells and gaps in whole pixels) instead of shrinking one drawing, so the gaps
// stay sharp at 16 and 32 px. Outputs (src/brand/):
//   velani-mark.svg          the symbol, 32-unit grid, currentColor (header, share images)
//   favicon.svg              browser icon: ink on light tabs, white on dark tabs
//   favicon-32.png           fallback browser icon: white symbol on the dark tile, readable on light and dark tabs
//   apple-touch-icon.png     180 px home-screen icon, full bleed (iOS rounds the corners)
//   velani-app-icon.svg/.png 1024 px app icon on the dark tile, for app listings and profile pictures
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(import.meta.dirname, '..');
const brand = name => path.join(root, 'src/brand', name);
const INK = '#1D1D1F', TILE = '#111317', WHITE = '#FFFFFF';
const FAN = ['br', 'tl', 'br', 'br']; // per cell (top-left, top-right, bottom-left, bottom-right): the corner the quarter circle is centred on

const n = v => +v.toFixed(2);
/** A quarter disc filling the square (x, y, s), centred on one of its corners. */
function quarter(x, y, s, corner) {
  const cx = corner.includes('r') ? x + s : x, cy = corner.includes('b') ? y + s : y;
  const dx = corner.includes('r') ? -1 : 1, dy = corner.includes('b') ? -1 : 1;
  const sweep = dx * dy > 0 ? 1 : 0;
  return `M${n(cx)} ${n(cy)}H${n(cx + dx * s)}A${s} ${s} 0 0 ${sweep} ${n(cx)} ${n(cy + dy * s)}Z`;
}
/** The symbol's path data with its top-left at (x, y), cells of `cell` and a gap of `gap`. */
function fanPath(x, y, cell, gap) {
  return FAN.map((c, i) => quarter(x + (i % 2) * (cell + gap), y + Math.floor(i / 2) * (cell + gap), cell, c)).join('');
}

// 32-unit master: cells 14, gap 2, one unit of margin (whole pixels at 16 and 32 px)
const MASTER = fanPath(1, 1, 14, 2);
const svg = (box, body, attrs = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${box} ${box}"${attrs}>${body}</svg>\n`;
const files = {
  'velani-mark.svg': svg(32, `<path d="${MASTER}"/>`, ' fill="currentColor" role="img" aria-label="Velani"'),
  'favicon.svg': svg(32, `<style>path{fill:${INK}}@media (prefers-color-scheme:dark){path{fill:${WHITE}}}</style><path d="${MASTER}"/>`),
  // 32 px tile: radius 7, symbol 20 px (cells 9, gap 2) from (6, 6)
  'favicon-32.svg': svg(32, `<rect width="32" height="32" rx="7" fill="${TILE}"/><path fill="${WHITE}" d="${fanPath(6, 6, 9, 2)}"/>`),
  // 180 px, full bleed: symbol 82 px (cells 40, gap 2) from (49, 49)
  'apple-touch-icon.svg': svg(180, `<rect width="180" height="180" fill="${TILE}"/><path fill="${WHITE}" d="${fanPath(49, 49, 40, 2)}"/>`),
  // 1024 px app icon: symbol 470 px (cells 227, gap 16) from (277, 277), the same share of the tile as the 180 px icon
  'velani-app-icon.svg': svg(1024, `<rect width="1024" height="1024" rx="230" fill="${TILE}"/><path fill="${WHITE}" d="${fanPath(277, 277, 227, 16)}"/>`),
};
for (const name of ['velani-mark.svg', 'favicon.svg', 'velani-app-icon.svg']) writeFileSync(brand(name), files[name]);

const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch(process.env.VELANI_CHROMIUM_EXECUTABLE ? { executablePath: process.env.VELANI_CHROMIUM_EXECUTABLE } : {});
for (const [png, size, source] of [['favicon-32.png', 32, 'favicon-32.svg'], ['apple-touch-icon.png', 180, 'apple-touch-icon.svg'], ['velani-app-icon.png', 1024, 'velani-app-icon.svg']]) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${files[source]}`);
  await page.screenshot({ path: brand(png), omitBackground: true });
  await page.close();
}
await browser.close();
console.log('brand icons written');
