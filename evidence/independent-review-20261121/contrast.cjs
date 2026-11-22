// Text contrast on the sky backgrounds, measured from pixels (axe cannot read gradients): for each element, the most common
// pixel is the background and the darkest pixel against it is the text. Reduced motion, 1280 px, several visitor time zones.
const { chromium } = require('playwright');
const lum = ([r, g, b]) => { const f = c => { c /= 255; return c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
const CASES = [
  ['UTC', '/pages/nevora', ['#top .more', '#top .sub', '#sch-h + .lead', '.chead .eyebrow']],
  ['UTC', '/pages/plans', ['.more', '.eyebrow']],
  ['UTC', '/', ['.stp .when']],
  ['UTC', '/pages/sign-in', ['.si-fg']],
  ['UTC', '/pages/products', ['.eyebrow', '.pr-h .lead']],
  ['UTC', '/pages/about', ['.eyebrow']],
  ['UTC', '/pages/contact', ['.ct-head .eyebrow']],
  ['UTC', '/pages/sign-in', ['.more']],
  ['UTC', '/pages/help', ['.more']],
  ['UTC', '/pages/relay', ['#top .more', '#top .note']],
  ['Europe/Moscow', '/', ['.hero .more', '.hero .note', '.hero .sub']],
  ['Pacific/Auckland', '/', ['.hero .more', '.hero .note', '.hero .sub']],
  ['UTC', '/', ['#day .place', '.tl button small']],
  ['UTC', '/pages/nevora-billing', ['.acct-note']],
];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
  let worst = 99;
  for (const [tz, path, sels] of CASES) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce', timezoneId: tz, deviceScaleFactor: 1 });
    const p = await ctx.newPage(), tool = await ctx.newPage();
    await p.goto('http://127.0.0.1:4180' + path, { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
    for (const sel of sels) {
      const el = p.locator(sel).first();
      if (!(await el.count()) || !(await el.isVisible())) { console.log('SKIP', tz, path, sel, 'not visible'); continue; }
      await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
      const buf = await el.screenshot();
      const px = await tool.evaluate(async b64 => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, c.width, c.height).data; const out = []; for (let i = 0; i < d.length; i += 4) out.push([d[i], d[i + 1], d[i + 2]]); return out; }, buf.toString('base64'));
      const counts = new Map(); for (const q of px) { const k = q.join(','); counts.set(k, (counts.get(k) || 0) + 1); }
      const bg = [...counts.entries()].sort((a, c) => c[1] - a[1])[0][0].split(',').map(Number), Lb = lum(bg);
      let best = 1; for (const q of px) { const L = lum(q), cr = (Math.max(L, Lb) + .05) / (Math.min(L, Lb) + .05); if (cr > best) best = cr; }
      worst = Math.min(worst, best);
      console.log((best >= 4.5 ? 'PASS ' : 'FAIL ') + tz.padEnd(16) + path.padEnd(22) + sel.padEnd(22) + best.toFixed(2) + ':1 on ' + bg.join(','));
    }
    await ctx.close();
  }
  console.log('lowest', worst.toFixed(2));
  await b.close();
})();
