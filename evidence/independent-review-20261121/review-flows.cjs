// Behaviour behind the independent review's fixes, in the browser.
const { chromium } = require('playwright');
const B = 'http://127.0.0.1:4180';
const res = []; const ok = (n, c, x = '') => res.push((c ? 'PASS ' : 'FAIL ') + n + (x ? '  [' + String(x).slice(0, 200) + ']' : ''));
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
  const errs = [];
  for (const [path, done, applied, pending, left] of [['/pages/rondo', 'Done: ', /^Approved\. NEVORA checked/, 'Not yet: ', /Left as is/], ['/pages/es-rondo', 'Hecho: ', /^Aprobado\. NEVORA revisó/, 'Todavía no: ', /Se quedó igual/]]) {
    const p = await (await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })).newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.goto(B + path); await p.waitForTimeout(600);
    const before = await p.$$eval('#ap-chk [data-st]', x => x.map(e => e.textContent));
    ok(path + ' steps start as not yet', before.every(t => t === pending), before.join('|'));
    await p.locator('#ap-ok').scrollIntoViewIfNeeded(); await p.click('#ap-ok'); await p.waitForTimeout(400);
    const after = await p.$$eval('#ap-chk [data-st]', x => x.map(e => e.textContent));
    ok(path + ' steps become done', after.every(t => t === done), after.join('|'));
    ok(path + ' the outcome is announced once', applied.test(await p.textContent('#ap-live')), await p.textContent('#ap-live'));
    await p.click('#ap-no').catch(() => {});
    const no = await p.$('#ap-no'); if (no && await no.isVisible()) { await no.click(); await p.waitForTimeout(300); ok(path + ' Not now announces nothing changed', left.test(await p.textContent('#ap-live')), await p.textContent('#ap-live')); }
    const ans = await p.textContent('#ans'); ok(path + ' no h4 in the answer card', !(await p.$('#ans h4')));
  }
  for (const [path, one, sw] of [['/pages/nevora', '1 of 4 digits', 'es'], ['/pages/es-nevora', '1 de 4 dígitos', 'en']]) {
    const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.goto(B + path); await p.waitForTimeout(600);
    await p.locator('.kv-pin [data-k="1"]').first().scrollIntoViewIfNeeded(); await p.click('.kv-pin [data-k="1"]'); await p.waitForTimeout(200);
    ok(path + ' PIN count for screen readers', (await p.textContent('[data-pin-live]')) === one, await p.textContent('[data-pin-live]'));
    ok(path + ' language button marked ' + sw, (await p.getAttribute('.lang-b span', 'lang')) === sw);
    await p.click('.lang-b'); await p.waitForTimeout(300);
    ok(path + ' after switching, the button names the other language', (await p.getAttribute('.lang-b span', 'lang')) === (sw === 'es' ? 'en' : 'es'), await p.textContent('.lang-b span'));
  }
  ok('no script errors', errs.length === 0, errs.join(' | '));
  console.log(res.join('\n')); await b.close();
})();
