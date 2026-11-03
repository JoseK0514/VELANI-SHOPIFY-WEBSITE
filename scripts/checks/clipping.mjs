// Every route at 320px wide and at 200% zoom: no horizontal overflow, no clipped text, nothing past the right edge.
// Usage: VELANI_CHROMIUM_EXECUTABLE=/path/to/chromium node scripts/checks/clipping.mjs
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { routes } from '../../src/content.mjs';
const base = process.env.VELANI_PREVIEW_URL || 'http://127.0.0.1:4173';
const run = process.env.VELANI_BROWSER_RUN || 'clipping-' + new Date().toISOString().replace(/[:.]/g, '-');
const out = 'evidence/' + run;
await mkdir(out, { recursive: true });
const paths = Object.keys(routes);
const executablePath = process.env.VELANI_CHROMIUM_EXECUTABLE || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const findings = [];
for (const [label, w, h, zoom] of [['320px', 320, 640, 1], ['200% zoom', 640, 800, 2]]) {
  const ctx = await browser.newContext({ viewport: { width: w / zoom, height: h / zoom }, deviceScaleFactor: zoom });
  const p = await ctx.newPage();
  for (const path of paths) {
    await p.goto(base + path, { waitUntil: 'networkidle' });
    const H = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += 500) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(30); }
    await p.waitForTimeout(500);
    const problems = await p.evaluate(() => {
      const found = []; const vw = document.documentElement.clientWidth;
      if (document.documentElement.scrollWidth > vw + 1) found.push('page overflow ' + document.documentElement.scrollWidth);
      for (const el of document.querySelectorAll('h1,h2,h3,p,a,button,li,label,summary,span.t3,b')) {
        const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || (!el.offsetParent && cs.position !== 'fixed')) continue;
        const r = el.getBoundingClientRect(); if (!r.width) continue;
        if (el.scrollWidth > el.clientWidth + 2 && cs.overflowX !== 'visible' && el.clientWidth > 0) found.push('clipped ' + el.tagName + '.' + el.className + ' "' + el.textContent.trim().slice(0, 30) + '"');
        if (r.right > vw + 1 && !el.closest('[aria-hidden="true"],.sr,.skip')) found.push('past edge ' + el.tagName + '.' + el.className + ' "' + el.textContent.trim().slice(0, 30) + '" right=' + Math.round(r.right));
      }
      return [...new Set(found)].slice(0, 6);
    });
    if (problems.length) findings.push({ label, path, problems });
  }
  console.log((findings.some(f => f.label === label) ? 'FAIL ' : 'PASS ') + label + ': ' + paths.length + ' routes');
  await ctx.close();
}
await browser.close();
const summary = { status: findings.length ? 'failed' : 'passed', routes: paths.length, findings };
await writeFile(out + '/clipping.json', JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify({ ...summary, evidence: out }));
process.exit(findings.length ? 1 : 0);
