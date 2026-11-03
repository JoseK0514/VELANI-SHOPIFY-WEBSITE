// Layout density audit for the calmer layout pass: page length, words, text sizes, text edges, separators,
// top-bar links and repeated screenshots on Home and NEVORA, at 1440px and on an iPhone 13.
// Needs the preview server (npm run dev). Usage: VELANI_CHROMIUM_EXECUTABLE=/path/to/chromium node scripts/checks/layout-audit.mjs
import { chromium, devices } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
const base = process.env.VELANI_PREVIEW_URL || 'http://127.0.0.1:4173';
const executablePath = process.env.VELANI_CHROMIUM_EXECUTABLE || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
const out = 'evidence/' + (process.env.VELANI_BROWSER_RUN || 'layout-' + new Date().toISOString().replace(/[:.]/g, '-'));
await mkdir(out, { recursive: true });

// Targets from the approved plan. Screens = page height / viewport height.
const targets = {
  '/': { desktop: { screens: 5.6 }, phone: { screens: 10 }, separators: 6 }, // five full-screen panels: one screen each on desktop, about two on a phone
  '/pages/nevora': { desktop: { screens: 9.5 }, phone: { screens: 12 }, words: 660, separators: 12, topBarLinks: 8 }, // 660: the uppercase chapter labels and step numbers added after the calmer pass
};
const shared = { sizes: 9, edges: 6 };

const measure = () => {
  const main = document.querySelector('main'); const vis = e => e.offsetParent && e.getBoundingClientRect().width > 0;
  const textEls = [...main.querySelectorAll('*')].filter(e => vis(e) && !e.closest('.kio') && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()));
  const sizes = [...new Set(textEls.map(e => getComputedStyle(e).fontSize))].sort((a, b) => parseFloat(a) - parseFloat(b));
  // Row-leading edges: the left edge of each text block with nothing beside it on its left (demo, screenshots and the NEVORA bar excluded)
  const blocks = [...main.querySelectorAll('h1,h2,h3,p,.pill,.more,li,dt,dd,summary,figcaption')].filter(e => vis(e) && !e.closest('.kio,.slab,.lnav') && !e.parentElement.closest('h1,h2,h3,p,li,dt,dd,summary,figcaption'));
  const box = e => e.getBoundingClientRect();
  const lead = blocks.filter(e => { const a = box(e); return !blocks.some(o => o !== e && !o.contains(e) && !e.contains(o) && box(o).right <= a.left + 1 && box(o).bottom > a.top + 2 && box(o).top < a.bottom - 2); });
  const edges = [...new Set(lead.map(e => Math.round(box(e).left)))].sort((a, b) => a - b);
  let separators = 0; main.querySelectorAll('*').forEach(e => { if (!vis(e) || e.closest('.kio,.slab') || e.matches('a,button,input,select,textarea')) return; const cs = getComputedStyle(e); if (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none') separators++; });
  const imgs = {}; [...main.querySelectorAll('img')].filter(vis).filter(i => !/wm-|tabbar/.test(i.src)).forEach(i => { const n = i.src.split('/').pop(); imgs[n] = (imgs[n] || 0) + 1; });
  // Links only, as in the before measurement (16 on NEVORA); menu buttons are reported separately
  const topBarLinks = [...document.querySelectorAll('header a, .lnav a')].filter(vis).length;
  const topBarButtons = [...document.querySelectorAll('header button, .lnav button')].filter(vis).length;
  const words = (main.innerText || '').trim().split(/\s+/).filter(Boolean).length;
  return { height: document.documentElement.scrollHeight, vh: innerHeight, words, sizes, edges, separators, imgs, topBarLinks, topBarButtons };
};

const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const rows = [];
try {
  for (const [label, opts] of [['desktop', { viewport: { width: 1440, height: 900 } }], ['phone', { ...devices['iPhone 13'] }]]) {
    const ctx = await browser.newContext({ ...opts, reducedMotion: 'reduce' });
    for (const path of Object.keys(targets)) {
      const p = await ctx.newPage(); await p.goto(base + path, { waitUntil: 'networkidle' }); await p.waitForTimeout(400);
      const m = await p.evaluate(measure); const t = targets[path]; const screens = +(m.height / m.vh).toFixed(1);
      const checks = [
        ['screens', screens, t[label].screens],
        ['text sizes', m.sizes.length, shared.sizes],
        ['text edges', m.edges.length, shared.edges],
        ['separator lines', m.separators, t.separators],
        ...(t.words ? [['words', m.words, t.words]] : []),
        ...(t.topBarLinks && label === 'desktop' ? [['top-bar links', m.topBarLinks, t.topBarLinks]] : []),
      ];
      for (const [name, value, max] of checks) { const pass = value <= max; rows.push({ label, path, name, value, max, pass }); console.log(`${pass ? 'PASS' : 'FAIL'} ${label} ${path} ${name}: ${value} (target ≤ ${max})`); }
      const repeats = Object.entries(m.imgs).filter(([, n]) => n > 1).map(([n, c]) => `${n} ×${c}`);
      console.log(`INFO ${label} ${path} ${m.height}px, top-bar buttons ${m.topBarButtons}, sizes ${m.sizes.join(' ')}, edges ${m.edges.join(' ')}${repeats.length ? ', repeated image files ' + repeats.join(', ') : ''}`);
      await p.screenshot({ path: `${out}/${label}-${path === '/' ? 'home' : path.split('/').pop()}.png`, fullPage: true });
      await p.close();
    }
    await ctx.close();
  }
} finally { await browser.close(); }
const summary = { status: rows.every(r => r.pass) ? 'passed' : 'failed', passed: rows.filter(r => r.pass).length, failed: rows.filter(r => !r.pass).length, rows, evidence: out };
await writeFile(out + '/summary.json', JSON.stringify(summary, null, 1));
console.log(JSON.stringify({ status: summary.status, passed: summary.passed, failed: summary.failed, evidence: out }));
if (summary.status !== 'passed') process.exitCode = 1;
