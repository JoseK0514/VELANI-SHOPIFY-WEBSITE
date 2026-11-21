// Day Contact on the real local preview: topics, side copy, button words, more-than-30, errors, preview check, no sends.
const { chromium } = require('playwright');
const B = 'http://127.0.0.1:4180/pages/contact';
const res = []; const ok = (n, c, x = '') => res.push((c ? 'PASS ' : 'FAIL ') + n + (x ? '  [' + String(x).slice(0, 200) + ']' : ''));
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const errs = [], posts = [];
  const open = async q => { const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (/Content Security Policy|Refused/.test(m.text())) errs.push(m.text()); }); p.on('request', r => { if (r.method() !== 'GET') posts.push(r.method() + ' ' + r.url()); }); await p.goto(B + q); await p.waitForTimeout(500); return p; };
  const vis = async (p, sel) => (await p.$$eval(sel, els => els.filter(e => e.checkVisibility()).map(e => e.textContent.trim()))).join(' | ');
  for (const [q, h1, val] of [['', 'Tell us what you need.', 'other'], ['?interest=nevora-demo', 'Request your free trial.', 'nevora-demo'], ['?interest=nevora', 'Set up NEVORA for a larger team.', 'nevora'], ['?interest=relay', 'Join the NEVORA Relay waitlist.', 'relay']]) {
    const p = await open(q);
    const checked = await p.$eval('input[name="topic_choice"]:checked', e => e.value).catch(() => '(none)');
    ok('topic "' + (q || 'none') + '": heading and choice', (await vis(p, '#ct-t span')) === h1 && (checked === val || (val === 'other' && checked === '(none)')), (await vis(p, '#ct-t span')) + ' / ' + checked);
    await p.close();
  }
  let p = await open('?interest=nevora-demo');
  ok('trial: team fields shown', await p.isVisible('#inquiry-team'));
  ok('trial: button says Send trial request', (await p.textContent('[data-inquiry-submit]')).trim() === 'Send trial request', await p.textContent('[data-inquiry-submit]'));
  await p.selectOption('#inquiry-team', 'More than 30 (assisted setup)'); await p.waitForTimeout(150);
  ok('more than 30 on a trial: becomes assisted setup, note shown', (await vis(p, '#ct-t span')) === 'Set up NEVORA for a larger team.' && await p.isVisible('.quote-note') && (await p.$eval('input[name="topic_choice"]:checked', e => e.value)) === 'nevora', await vis(p, '#ct-t span'));
  ok('more than 30: button says Request assisted setup', (await p.textContent('[data-inquiry-submit]')).trim() === 'Request assisted setup');
  await p.selectOption('#inquiry-team', '11–20'); await p.waitForTimeout(150);
  ok('back to 11–20: trial again', (await vis(p, '#ct-t span')) === 'Request your free trial.');
  await p.check('input[value="relay"]', { force: true }); await p.waitForTimeout(150);
  ok('choose Relay: side and button follow', (await vis(p, '#ct-t span')) === 'Join the NEVORA Relay waitlist.' && (await p.textContent('[data-inquiry-submit]')).trim() === 'Join the waitlist');
  await p.check('input[value="other"]', { force: true }); await p.waitForTimeout(150);
  ok('switch to Something else: message label says it is needed', (await p.textContent('label[for="inquiry-message"]')).trim() === 'What needs to work better', await p.textContent('label[for="inquiry-message"]'));
  await p.click('[data-inquiry-submit]'); await p.waitForTimeout(200);
  ok('empty submit: summary names the fields, focus on the first', /field/.test(await p.textContent('.form-status')) && (await p.evaluate(() => document.activeElement.id)) === 'inquiry-name', await p.textContent('.form-status'));
  ok('errors under their fields', (await p.textContent('#error-name')).length > 0 && (await p.getAttribute('#inquiry-name', 'aria-invalid')) === 'true');
  await p.fill('#inquiry-name', 'Ana Test'); await p.fill('#inquiry-email', 'ana@example.com'); await p.fill('#inquiry-message', 'A question about NEVORA for my café, with a few details so the message is long enough to pass the check.');
  await p.click('[data-inquiry-submit]'); await p.waitForTimeout(500);
  ok('preview check: confirmation shown, says nothing was sent', await p.isVisible('#inquiry-sent') && /Nothing was sent/.test(await p.textContent('#inquiry-sent')), (await p.textContent('#inquiry-sent')).replace(/\s+/g, ' ').slice(0, 160));
  ok('focus on the confirmation', await p.evaluate(() => !!document.activeElement.closest('#inquiry-sent')));
  await p.close();
  ok('no form was sent over the network', posts.length === 0, posts.join(' '));
  ok('no script errors or CSP reports', errs.length === 0, errs.join(' | '));
  console.log(res.join('\n')); await b.close();
})();
