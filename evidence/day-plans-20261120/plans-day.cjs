// Day Plans on the real local preview with Jose's commerce fixture: team-size card, extras, Owner handoff scenarios.
const { chromium } = require('playwright');
const B = 'http://127.0.0.1:4199/pages/plans';
const res = []; const ok = (n, c, x = '') => res.push((c ? 'PASS ' : 'FAIL ') + n + (x ? '  [' + String(x).slice(0, 220) + ']' : ''));
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await c.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (/Content Security Policy|Refused/.test(m.text())) errs.push(m.text()); });
  await p.goto(B); await p.waitForTimeout(700);
  ok('card: slider enabled by commerce script', !(await p.isDisabled('#pc-n')));
  ok('card: steps shown', await p.isVisible('[data-step="1"]'));
  ok('card: starts at 8 employees, $19, $2.38 each', (await p.textContent('[data-count]')) === '8' && (await p.textContent('[data-amt]')) === '$19' && /\$2\.38/.test(await p.textContent('[data-per-emp]')));
  ok('plan card 1 marked Your plan', await p.$eval('.pc[data-band="1"]', e => e.classList.contains('sel')));
  await p.focus('#pc-n'); for (let i = 0; i < 8; i++) await p.keyboard.press('ArrowRight'); await p.waitForTimeout(150);
  ok('keyboard to 16: $29, plan 2 marked', (await p.textContent('[data-amt]')) === '$29' && await p.$eval('.pc[data-band="2"]', e => e.classList.contains('sel')), await p.getAttribute('#pc-n', 'aria-valuetext'));
  ok('per employee follows: $1.81', /\$1\.81/.test(await p.textContent('[data-per-emp]')), await p.textContent('[data-per-emp]'));
  await p.keyboard.press('End'); await p.waitForTimeout(150);
  ok('31+: quote instead of price, no per-employee, no plan marked', !/\$/.test(await p.textContent('[data-amt]')) && (await p.textContent('[data-per-emp]')) === '' && (await p.$$eval('.pc.sel', x => x.length)) === 0, await p.textContent('[data-amt]'));
  ok('price line below the plans says it', !(await p.isHidden('[data-price-mine]')), await p.textContent('[data-price-mine]'));
  ok('calendar shows real dates', !/^Day$/.test(await p.textContent('.cal[data-off="0"] small')), await p.getAttribute('.cal[data-off="0"]', 'aria-label'));
  // Owner handoff from NEVORA (fixture scenarios)
  for (const [sc, expect] of [['trial', /Northside Coffee/], ['expired', /./], ['over-30', /Northside Coffee/]]) {
    const q = await c.newPage(); q.on('pageerror', e => errs.push(sc + ': ' + e.message));
    await q.goto(B + '#handoff=fixture-' + sc + '-' + Date.now()); await q.waitForTimeout(1500);
    const h1 = (await q.textContent('#top h1')).trim(), btns = await q.$$eval('#top .hacts a, #top .hacts button', x => x.map(e => e.textContent.trim() + ' -> ' + (e.getAttribute('href') || 'button')));
    ok('handoff ' + sc + ': hero replaced', expect.test(h1) && h1 !== 'Try NEVORA free for 30 days.', h1 + ' | ' + btns.join(' ; '));
    ok('handoff ' + sc + ': fragment scrubbed', !q.url().includes('handoff='));
    if (sc === 'over-30') ok('handoff over-30: quote goes to assisted setup, not the trial', btns.some(x => /interest=nevora$/.test(x)) && !btns.some(x => /nevora-demo/.test(x)), btns.join(' ; '));
    if (sc === 'trial') { ok('handoff trial: language choice shown', await q.isVisible('.owner-lang')); await q.screenshot({ path: '/tmp/claude-0/-home-user-VELANI-SHOPIFY-WEBSITE/57f47087-ade9-59d6-9006-7bef7b7a3e28/scratchpad/real-plans-handoff.png' }); }
    await q.close();
  }
  ok('no script errors or CSP reports', errs.length === 0, errs.join(' | '));
  console.log(res.join('\n')); await b.close();
})();
