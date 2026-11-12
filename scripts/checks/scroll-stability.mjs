// Scrolls each route on a phone the way a finger would and records layout shift, long frames, header flips and overflow.
// Usage: VELANI_CHROMIUM_EXECUTABLE=/path/to/chromium node scripts/checks/scroll-stability.mjs [/,/pages/nevora,...]
import { chromium, devices } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
const base = process.env.VELANI_PREVIEW_URL || 'http://127.0.0.1:4173';
const run = process.env.VELANI_BROWSER_RUN || 'scroll-' + new Date().toISOString().replace(/[:.]/g, '-');
const out = 'evidence/' + run;
await mkdir(out, { recursive: true });
const paths = (process.argv[2] || '/,/pages/nevora,/pages/custom-development,/pages/about,/pages/contact,/pages/help,/pages/privacy,/pages/nevora-privacy').split(',');
const executablePath = process.env.VELANI_CHROMIUM_EXECUTABLE || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const ctx = await browser.newContext({ ...devices['iPhone 13'] });
const rows = [];
for (const path of paths) {
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(() => {
    window.__cls = 0; window.__shifts = []; window.__long = 0; window.__tuckFlips = 0;
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) { window.__cls += e.value; if (e.value > 0.01) window.__shifts.push((e.sources || []).map(s => s.node && (s.node.className || s.node.nodeName)).join('|') + ':' + e.value.toFixed(3)); } }).observe({ type: 'layout-shift', buffered: true });
    let last = performance.now(); const tick = t => { if (t - last > 50) window.__long++; last = t; requestAnimationFrame(tick); }; requestAnimationFrame(tick);
    addEventListener('DOMContentLoaded', () => { const n = document.getElementById('gnav'); let st = null; if (n) new MutationObserver(() => { const t = n.classList.contains('tuck'); if (t !== st) { if (st !== null) window.__tuckFlips++; st = t; } }).observe(n, { attributes: true, attributeFilter: ['class'] }); });
  });
  await p.goto(base + path, { waitUntil: 'networkidle' }); await p.waitForTimeout(600);
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 60) { await p.mouse.wheel(0, 60); await p.waitForTimeout(16); }
  await p.waitForTimeout(400);
  for (let i = 0; i < 10; i++) { await p.mouse.wheel(0, 80); await p.waitForTimeout(16); }
  const flipsAtBottom = await p.evaluate(() => window.__tuckFlips);
  for (let y = H; y > 0; y -= 120) { await p.mouse.wheel(0, -120); await p.waitForTimeout(16); }
  await p.waitForTimeout(400);
  const r = await p.evaluate(() => ({ cls: +window.__cls.toFixed(4), shifts: window.__shifts.slice(0, 4), long: window.__long, flips: window.__tuckFlips, overflowX: document.documentElement.scrollWidth - innerWidth }));
  const row = { path, ...r, flipsAtBottom, errors: errs.slice(0, 3), height: H };
  row.ok = r.cls < 0.05 && r.overflowX === 0 && errs.length === 0 && r.long < 15;
  rows.push(row); console.log((row.ok ? 'PASS ' : 'FAIL ') + path.padEnd(28) + JSON.stringify({ ...r, flipsAtBottom, errs: row.errors }));
  await p.close();
}
await browser.close();
const summary = { status: rows.every(r => r.ok) ? 'passed' : 'failed', thresholds: { cls: '< 0.05 per route', long: '< 15 frames over 50 ms', overflowX: 0, errors: 0 }, rows };
await writeFile(out + '/scroll-stability.json', JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify({ status: summary.status, routes: rows.length, evidence: out }));
process.exit(summary.status === 'passed' ? 0 : 1);
