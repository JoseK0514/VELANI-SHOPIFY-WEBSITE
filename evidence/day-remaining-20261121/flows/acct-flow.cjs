// The Day trial and billing pages. Mode "closed" (port 4180, no API): the trial page sends visitors to the trial request.
// Mode "fixture" (port 4199 with the LOCAL commerce fixture on 4198): billing and payment flows from one-time handoffs.
const { chromium } = require('playwright');
const O = '/tmp/claude-0/-home-user-VELANI-SHOPIFY-WEBSITE/57f47087-ade9-59d6-9006-7bef7b7a3e28/scratchpad/';
const mode = process.argv[2] || 'closed';
let seq = 0; const T = n => 'fixture-' + n + '-' + String(Date.now()) + String(seq++).padStart(3, '0');
const B = mode === 'closed' ? 'http://127.0.0.1:4180' : 'http://127.0.0.1:4199';
const res = []; const ok = (n, c, x = '') => res.push((c ? 'PASS ' : 'FAIL ') + n + (x ? '  [' + String(x).slice(0, 220) + ']' : ''));
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const errs = [], outside = [];
  const open = async (u, wait = 900) => { const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (/Content Security Policy|Refused/.test(m.text())) errs.push(m.text()); }); p.on('request', r => { const o = new URL(r.url()).origin; if (o !== B && o !== 'http://127.0.0.1:4198' && !r.url().startsWith('data:')) outside.push(r.url()); }); await p.goto(u); await p.waitForTimeout(wait); return p; };
  const h1 = p => p.$eval('h1', h => h.textContent.trim());
  if (mode === 'closed') {
    for (const [from, to] of [['/pages/nevora-start', '/pages/contact?interest=nevora-demo'], ['/pages/es-prueba', '/pages/es-contacto?interest=nevora-demo']]) {
      const p = await open(B + from); ok(from + ' sends visitors to the trial request', p.url() === B + to, p.url()); await p.close();
    }
    for (const path of ['/pages/nevora-billing', '/pages/es-facturacion']) {
      const p = await open(B + path);
      ok(path + ' shows billing support while billing is closed', await p.isVisible('[data-setup-acts] a.hb.fill[href^="mailto:"]'), await p.textContent('#setup'));
      ok(path + ' card stays hidden', !(await p.isVisible('[data-setup-card]')));
      await p.close();
    }
    let p = await open(B + '/pages/nevora-verify#token=abcdefghijklmnopqrstuvwxyz');
    ok('verify scrubs an old #token= link', p.url() === B + '/pages/nevora-verify', p.url());
    ok('verify offers the trial request', await p.isVisible('.acct-card a.pillbtn[href*="interest=nevora-demo"]'));
    await p.close();
  } else {
    let p = await open(B + '/pages/nevora-start');
    ok('start stays put when signup is configured', p.url() === B + '/pages/nevora-start', p.url());
    await p.screenshot({ path: O + 'acct-start-d.png' }); await p.close();
    p = await open(B + '/pages/nevora-billing#handoff=' + T('trial'), 1800);
    ok('billing: the handoff leaves the address bar', !/handoff/.test(p.url()), p.url());
    ok('billing: business name heading and trial line', (await h1(p)) === 'Northside Coffee' && /free trial is running/i.test(await p.textContent('[data-setup-lede]')), await h1(p) + ' | ' + await p.textContent('[data-setup-lede]'));
    ok('billing: plan facts card shows', await p.isVisible('[data-setup-card] .setup-facts'), await p.textContent('[data-setup-card]'));
    ok('billing: support email hidden once signed in', !(await p.isVisible('[data-off]')));
    ok('billing: actions are Day buttons', (await p.$$('[data-setup-acts] .hb')).length >= 1, await p.textContent('[data-setup-acts]'));
    await p.screenshot({ path: O + 'acct-billing-trial-d.png', fullPage: true });
    const out = await p.$('.setup-out'); if (out) { await out.click(); await p.waitForTimeout(800); ok('billing: sign out returns to instructions', /signed out/i.test(await h1(p)), await h1(p)); }
    await p.close();
    p = await open(B + '/pages/es-facturacion#handoff=' + T('paid'), 1800);
    ok('es billing: paid line in Spanish', /plan está activo/i.test(await p.textContent('[data-setup-lede]')), await p.textContent('[data-setup-lede]'));
    await p.close();
    p = await open(B + '/pages/nevora-billing#handoff=' + T('expired'), 1800);
    ok('billing: an expired link says so', /expired/i.test(await h1(p)), await h1(p));
    await p.close();
    p = await open(B + '/pages/nevora-billing-return#handoff=' + T('paid'), 2500);
    ok('return: confirms the subscription', /subscribed|updated/i.test(await h1(p)), await h1(p) + ' | ' + (await p.textContent('#setup')).replace(/\s+/g, ' ').slice(0, 160));
    await p.screenshot({ path: O + 'acct-return-d.png', fullPage: true }); await p.close();
    const m = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 }); const mp = await m.newPage(); mp.on('pageerror', e => errs.push(e.message));
    await mp.goto(B + '/pages/nevora-billing#handoff=' + T('trial')); await mp.waitForTimeout(1800);
    ok('billing phone: no sideways scroll', await mp.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await mp.screenshot({ path: O + 'acct-billing-trial-m.png', fullPage: true }); await m.close();
  }
  ok('only the local site and fixture were contacted', outside.length === 0, outside.join(' '));
  ok('no script errors or CSP reports', errs.length === 0, errs.join(' | '));
  console.log(res.join('\n')); await b.close();
})();
