// Rondo and Relay (Day) on the real local preview: section bar, Rondo demos, Relay waitlist link, no sends.
const { chromium } = require('playwright');
const B = 'http://127.0.0.1:4180';
const res = []; const ok = (n, c, x = '') => res.push((c ? 'PASS ' : 'FAIL ') + n + (x ? '  [' + String(x).slice(0, 200) + ']' : ''));
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const errs = [], posts = [];
  const open = async u => { const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (/Content Security Policy|Refused/.test(m.text())) errs.push(m.text()); }); p.on('request', r => { if (r.method() !== 'GET') posts.push(r.method() + ' ' + r.url()); }); await p.goto(u); await p.waitForTimeout(600); return p; };
  let p = await open(B + '/pages/rondo');
  ok('Rondo: header marks Rondo', (await p.$eval('.gn .gnav a[aria-current="page"]', a => a.textContent).catch(() => '')) === 'Rondo');
  ok('Rondo: the header trial steps aside for the section bar', !(await p.isVisible('.gn .cta')) && await p.isVisible('.ln .cta'));
  const qs = await p.$$('#ask [data-q], #ask button[aria-pressed]');
  ok('Rondo: question picker present', qs.length >= 3, qs.length);
  if (qs.length > 1) { await qs[1].scrollIntoViewIfNeeded(); await qs[1].click(); await p.waitForTimeout(800); ok('Rondo: a question gets an answer with its source', (await qs[1].getAttribute('aria-pressed')) === 'true' && /schedule|punches|timecards/i.test(await p.textContent('#ask')), (await p.textContent('#ask')).replace(/\s+/g, ' ').slice(0, 160)); }
  const approve = await p.$('#approve button');
  if (approve) { await approve.scrollIntoViewIfNeeded(); await approve.click(); await p.waitForTimeout(900); ok('Rondo: Approve plays the approval', /approved|Applied/i.test(await p.textContent('#approve')), (await p.textContent('#approve')).replace(/\s+/g, ' ').slice(0, 160)); }
  await p.evaluate(() => document.getElementById('owner').scrollIntoView()); await p.waitForTimeout(400);
  ok('Rondo: section bar marks Owner only and turns dark', /Owner/.test(await p.$eval('.ln nav a.on', a => a.textContent).catch(() => '')) && await p.$eval('#ln', e => e.classList.contains('dark')));
  ok('Rondo: phone screen scaled to fit', await p.$$eval('.fit', f => f.every(x => x.style.zoom !== '')));
  await p.close();
  p = await open(B + '/pages/relay');
  ok('Relay: header marks Relay', (await p.$eval('.gn .gnav a[aria-current="page"]', a => a.textContent).catch(() => '')) === 'Relay');
  ok('Relay: no form in the page body', (await p.$$('main form, main input')).length === 0);
  const join = p.locator('#waitlist a.pillbtn'); await join.scrollIntoViewIfNeeded(); await join.click(); await p.waitForURL('**/pages/contact?interest=relay'); await p.waitForTimeout(500);
  ok('Relay: Join the waitlist opens Contact on the Relay topic', (await p.$eval('input[name="topic_choice"]:checked', e => e.value)) === 'relay');
  await p.close();
  ok('no network sends', posts.length === 0, posts.join(' '));
  ok('no script errors or CSP reports', errs.length === 0, errs.join(' | '));
  console.log(res.join('\n')); await b.close();
})();
