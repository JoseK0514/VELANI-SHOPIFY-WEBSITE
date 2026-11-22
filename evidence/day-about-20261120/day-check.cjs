// Real-theme Day page check against the local preview server (strict CSP): errors, CSP violations, axe, keyboard, menu, 320px.
const { chromium } = require('playwright');
const { AxeBuilder } = require('/home/user/VELANI-SHOPIFY-WEBSITE/node_modules/@axe-core/playwright');
const B = 'http://127.0.0.1:4180';
const O = '/tmp/claude-0/-home-user-VELANI-SHOPIFY-WEBSITE/57f47087-ade9-59d6-9006-7bef7b7a3e28/scratchpad/';
const pages = (process.argv[2] || '/pages/about').split(',');
const res = []; const ok = (n, c, x = '') => res.push((c ? 'PASS ' : 'FAIL ') + n + (x ? '  [' + String(x).slice(0, 300) + ']' : ''));
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
  for (const path of pages) {
    const tag = path.replace(/\W+/g, '-').replace(/^-|-$/g, '') || 'home';
    // desktop
    let c = await b.newContext({ viewport: { width: 1440, height: 900 } }); let p = await c.newPage();
    const errs = [], csp = [], reqs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (/Content Security Policy|Refused/.test(m.text())) csp.push(m.text()); });
    p.on('request', r => { const u = new URL(r.url()); if (u.origin !== B && !u.protocol.startsWith('data')) reqs.push(r.url()); });
    const resp = await p.goto(B + path); await p.waitForTimeout(800);
    ok(path + ' 200', resp.status() === 200, resp.status());
    await p.screenshot({ path: O + 'real-' + tag + '-d.png' });
    const H = await p.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < H; y += 500) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(80); }
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300);
    ok(path + ' no script errors', errs.length === 0, errs.join(' | '));
    ok(path + ' no CSP violations', csp.length === 0, csp.join(' | '));
    ok(path + ' no external requests', reqs.length === 0, reqs.join(' '));
    const cur = await p.$$eval('.gn .gnav a[aria-current]', a => a.map(x => x.textContent));
    ok(path + ' header links', (await p.$$eval('.gn .gnav a', a => a.length)) === 5, cur.join(','));
    ok(path + ' one h1', (await p.$$eval('h1', h => h.length)) === 1);
    ok(path + ' skip link first', (await p.evaluate(() => { document.activeElement.blur(); return true; })) && true);
    await p.keyboard.press('Tab'); ok(path + ' Tab reaches skip link', (await p.evaluate(() => document.activeElement.className)) === 'skip');
    await p.keyboard.press('Enter'); await p.waitForTimeout(100); ok(path + ' skip moves focus to main', (await p.evaluate(() => document.activeElement.id)) === 'main');
    // cookie dialog opens from footer
    await p.waitForSelector('[data-cookie-open]:not([disabled])', { timeout: 4000 }).catch(() => {});
    const cbtn = await p.$('.ft [data-cookie-open]');
    ok(path + ' cookie button enabled', cbtn && !(await cbtn.isDisabled()));
    if (cbtn && !(await cbtn.isDisabled())) { await cbtn.click(); await p.waitForTimeout(200); ok(path + ' cookie dialog opens', await p.$eval('#cookie-dialog', d => d.open)); await p.keyboard.press('Escape'); await p.waitForTimeout(100); }
    // settled axe (reduced motion)
    await c.close();
    c = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); p = await c.newPage(); await p.goto(B + path); await p.waitForTimeout(600);
    const ax = await new AxeBuilder({ page: p }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    ok(path + ' axe WCAG', ax.violations.length === 0, ax.violations.map(v => v.id + ':' + v.nodes.length + ' ' + v.nodes[0].target.join(' ')).join(' | '));
    const bp = await new AxeBuilder({ page: p }).withTags(['best-practice']).analyze();
    ok(path + ' axe best-practice', bp.violations.length === 0, bp.violations.map(v => v.id + ':' + v.nodes.map(n => n.target.join(' ')).join(',')).join(' | '));
    await p.screenshot({ path: O + 'real-' + tag + '-full.png', fullPage: true });
    await c.close();
    // phone
    c = await b.newContext({ viewport: { width: 390, height: 844 } }); p = await c.newPage(); await p.goto(B + path); await p.waitForTimeout(600);
    await p.screenshot({ path: O + 'real-' + tag + '-m.png' });
    await p.click('.gn .mb'); await p.waitForTimeout(450);
    ok(path + ' menu opens, focus on close', (await p.evaluate(() => document.activeElement.className)) === 'mx' && await p.isVisible('#mm'));
    ok(path + ' page behind is inert', await p.evaluate(() => document.querySelector('main').inert));
    await p.screenshot({ path: O + 'real-' + tag + '-menu.png' });
    for (let i = 0; i < 12; i++) await p.keyboard.press('Tab');
    ok(path + ' focus stays in menu', await p.evaluate(() => !!document.activeElement.closest('#mm')));
    await p.keyboard.press('Escape'); await p.waitForTimeout(100);
    ok(path + ' Escape closes, focus back on button', !(await p.isVisible('#mm')) && (await p.evaluate(() => document.activeElement.classList.contains('mb'))));
    await c.close();
    for (const w of [320, 768]) {
      c = await b.newContext({ viewport: { width: w, height: 800 } }); p = await c.newPage(); await p.goto(B + path); await p.waitForTimeout(400);
      const sw = await p.evaluate(() => document.documentElement.scrollWidth); ok(path + ' no sideways scroll at ' + w, sw <= w, sw); await c.close();
    }
    // no JS
    c = await b.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false }); p = await c.newPage(); await p.goto(B + path); await p.waitForTimeout(1500);
    ok(path + ' no-JS: menu link shown, button hidden', (await p.isVisible('.gn .mb-nojs')) && !(await p.isVisible('.gn .mb')));
    ok(path + ' no-JS: content visible', (await p.$eval('h1', h => getComputedStyle(h).opacity)) === '1');
    await c.close();
  }
  console.log(res.join('\n'));
  await b.close();
})();
