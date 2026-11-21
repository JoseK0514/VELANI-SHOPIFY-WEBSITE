// For each page: classes used in the page (after its scripts run and its demos are clicked) that no loaded stylesheet mentions,
// and that some other Day stylesheet does define (so the page is missing a style it was meant to have).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const A = '/home/user/VELANI-SHOPIFY-WEBSITE/public/assets/';
const all = fs.readdirSync(A).filter(f => /^velani-day.*\.css$/.test(f));
const tokens = css => new Set([...css.matchAll(/\.([a-zA-Z][\w-]*)/g)].map(m => m[1]));
const defined = Object.fromEntries(all.map(f => [f, tokens(fs.readFileSync(A + f, 'utf8'))]));
const pages = process.argv[2].split(',');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
  for (const p0 of pages) {
    const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
    await p.goto('http://127.0.0.1:4180' + p0); await p.waitForTimeout(700);
    // exercise the demos so script-built markup exists
    for (const sel of ['[data-q="1"]', '#ans-ok', '#ap-ok', '#pub', '#tc-ok']) { const el = await p.$(sel); if (el) { try { await el.scrollIntoViewIfNeeded(); await el.click({ timeout: 1500 }); await p.waitForTimeout(300); } catch {} } }
    const { classes, sheets } = await p.evaluate(() => ({ classes: [...new Set([...document.querySelectorAll('main [class]')].flatMap(e => [...e.classList]))], sheets: [...document.styleSheets].map(s => (s.href || '').split('/').pop()).filter(Boolean) }));
    const loaded = new Set(sheets.flatMap(s => [...(defined[s] || [])]));
    const missing = classes.filter(c => !loaded.has(c)).map(c => [c, all.filter(f => defined[f].has(c))]).filter(([, where]) => where.length);
    console.log(p0, missing.length ? missing.map(([c, w]) => c + ' (in ' + w.map(x => x.replace('velani-day-', '').replace('.css', '')).join('/') + ')').join(', ') : 'ok');
  }
  await b.close();
})();
