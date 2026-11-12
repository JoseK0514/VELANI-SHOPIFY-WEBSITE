// Phase 0 baseline: screenshots + axe + SEO facts + no-JS renderability for every public page.
// Usage: node baseline.mjs <outDir> [baseUrl] [themeId]
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire(process.env.PLAYWRIGHT_FROM + '/package.json');
const { chromium } = require('playwright');

const out = process.argv[2];
const base = process.argv[3] || 'https://www.thevelani.com';
const themeId = process.argv[4] || '';
const axeSrc = fs.readFileSync(new URL('./axe.min.js', import.meta.url), 'utf8');
const EN = ['/', '/pages/about', '/pages/nevora', '/pages/products', '/pages/custom-development', '/pages/plans',
  '/pages/contact', '/pages/help', '/pages/legal', '/pages/privacy', '/pages/cookies', '/pages/website-terms',
  '/pages/software-project-terms', '/pages/accessibility', '/pages/security', '/pages/nevora-privacy',
  '/pages/nevora-terms', '/pages/nevora-support', '/pages/nevora-account-deletion'];
const ES = ['/pages/es', '/pages/es-nevora', '/pages/es-productos', '/pages/es-planes', '/pages/es-contacto'];
const pages = (process.env.PAGES ? process.env.PAGES.split(',') : [...EN, ...ES]);
const widths = (process.env.WIDTHS || '320,390,1440').split(',').map(Number);
fs.mkdirSync(path.join(out, 'shots'), { recursive: true });

const browser = await chromium.launch();
const report = [];
const hideBar = () => {
  const s = document.createElement('style');
  s.textContent = '#preview-bar-iframe,#PBarNextFrameWrapper,#PBarNextFrame{display:none!important}';
  document.documentElement.appendChild(s);
};
function url(p) {
  if (!themeId) return base + p;
  return base + p + (p.includes('?') ? '&' : '?') + 'preview_theme_id=' + themeId;
}
for (const p of pages) {
  const slug = p === '/' ? 'home' : p.replace(/^\/pages\//, '').replace(/\W+/g, '_');
  const entry = { page: p, widths: {} };
  // No-JS renderability + SEO facts
  {
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
    const pg = await ctx.newPage();
    const r = await pg.goto(url(p), { waitUntil: 'domcontentloaded' });
    entry.status = r.status();
    entry.nojs = await pg.evaluate(() => {
      const q = (s) => document.querySelector(s);
      const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => {
        try { const j = JSON.parse(s.textContent); return [].concat(j['@graph'] || j).map((x) => x['@type']).flat(); } catch { return ['INVALID']; }
      }).flat();
      return {
        title: document.title, lang: document.documentElement.lang,
        description: q('meta[name=description]')?.content || null,
        canonical: q('link[rel=canonical]')?.href || null,
        robots: q('meta[name=robots]')?.content || null,
        ogImage: q('meta[property="og:image"]')?.content || null,
        h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim().replace(/\s+/g, ' ')),
        hreflang: [...document.querySelectorAll('link[rel=alternate][hreflang]')].map((l) => l.hreflang + '=' + new URL(l.href).pathname),
        jsonld: ld,
        textChars: document.body.innerText.replace(/\s+/g, ' ').length,
        imgsNoAlt: [...document.querySelectorAll('img:not([alt])')].length,
        esLink: q('a[hreflang=es][aria-label="Español"]')?.getAttribute('href') || null,
        enLink: q('a[hreflang=en][aria-label="English"]')?.getAttribute('href') || null,
      };
    });
    await ctx.close();
  }
  for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w < 800 ? 844 : 900 }, reducedMotion: 'reduce', deviceScaleFactor: 1 });
    await ctx.addInitScript(hideBar);
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
    await pg.goto(url(p), { waitUntil: 'load', timeout: 45000 }).catch(() => {});
    await pg.waitForTimeout(1500);
    console.error('  ' + p + ' ' + w + ' loaded');
    await pg.evaluate(async () => { const h = () => document.documentElement.scrollHeight; for (let y = 0; y < h(); y += Math.round(innerHeight * 0.7)) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } scrollTo(0, 0); await new Promise((r) => setTimeout(r, 400)); });
    const m = await pg.evaluate(() => ({
      jsTextChars: document.body.innerText.replace(/\s+/g, ' ').length,
      hScroll: document.documentElement.scrollWidth > window.innerWidth + 1,
      scrollW: document.documentElement.scrollWidth,
      themeId: window.Shopify?.theme?.id, themeName: window.Shopify?.theme?.name,
    }));
    let axe = null;
    if (w === 1440 || w === 390) {
      await pg.addScriptTag({ content: axeSrc });
      axe = await Promise.race([new Promise((r) => setTimeout(() => r('AXE_TIMEOUT'), 60000)), pg.evaluate(async () => {
        const r = await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] });
        return r.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, sample: v.nodes.slice(0, 2).map((n) => n.target.join(' ')) }));
      })]);
    }
    await pg.screenshot({ path: path.join(out, 'shots', `${slug}-${w}.png`), fullPage: true, timeout: 60000, animations: 'disabled' }).catch((e) => errs.push('SHOT ' + e.message.slice(0, 80)));
    entry.widths[w] = { ...m, errs, axe };
    await ctx.close();
  }
  report.push(entry);
  process.stdout.write(`${p} ${entry.status} nojs=${entry.nojs.textChars} js=${entry.widths[1440]?.jsTextChars}\n`);
}
await browser.close();
fs.writeFileSync(path.join(out, 'baseline.json'), JSON.stringify(report, null, 2));
