// Rondo panel states with a stand-in API and a stand-in Turnstile (functional coverage only; it proves nothing about
// Cloudflare or the production model). Starts its own preview on port 4183 with VELANI_ASSISTANT_API=https://velani-ai.test.
// Usage: node scripts/checks/rondo-ui.mjs   (ENGINES=chromium,webkit by default)
import { createRequire } from 'node:module';
// PLAYWRIGHT_FROM lets the check use another installed Playwright whose browsers are present
const { chromium, webkit } = process.env.PLAYWRIGHT_FROM ? createRequire(process.env.PLAYWRIGHT_FROM + '/package.json')('playwright') : await import('@playwright/test');
import AxeBuilder from '@axe-core/playwright';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
const API = 'https://velani-ai.test', PORT = 4183, base = `http://127.0.0.1:${PORT}`;
const out = 'evidence/rondo-ui-' + new Date().toISOString().slice(0, 10); await mkdir(out, { recursive: true });
const server = spawn(process.execPath, ['scripts/serve.mjs', '--port', String(PORT)], { env: { ...process.env, VELANI_ASSISTANT_API: API }, stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((resolve, reject) => { const t = setTimeout(() => reject(new Error('preview did not start')), 60000); server.stdout.on('data', d => { if (/http:\/\/|listening|4183/i.test(String(d))) { clearTimeout(t); resolve(); } }); });
const results = []; let failures = 0;
const ok = (cond, msg) => { results.push({ status: cond ? 'passed' : 'failed', msg }); if (!cond) failures++; console.log((cond ? 'PASS ' : 'FAIL ') + msg); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const TURNSTILE = `window.turnstile={render(sel,o){window.__ts=o;setTimeout(()=>o.callback('tok-'+Math.random()),window.__tsDelay||50);return 'w1'},reset(){const o=window.__ts;setTimeout(()=>o.callback('tok-'+Math.random()),50)}};`;
// Scripted backend: a question's first word picks the reply
function backend(page, log) {
  let n = 0; const seen = new Map();
  return page.route(API + '/**', async route => {
    const req = route.request(), url = new URL(req.url()), m = req.method();
    const json = (status, body, headers = {}) => route.fulfill({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': base, ...headers }, body: JSON.stringify(body) });
    if (m === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': base, 'access-control-allow-headers': 'content-type,authorization', 'access-control-allow-methods': 'GET,POST,DELETE' } });
    if (url.pathname === '/v1/config') { if (page.__configFail) return json(503, { error: { code: 'service_unavailable', message: 'x' } }); return json(200, { assistantName: 'Rondo', requireCaptcha: true, turnstileSiteKey: '1x00000000000000000000AA' }); }
    const body = req.postDataJSON?.() ?? null; log.push({ m, path: url.pathname, body, auth: !!req.headers().authorization });
    if (url.pathname === '/v1/sessions') { if (!body?.captchaToken) return json(403, { error: { code: 'captcha_required', message: 'x' } }); return json(201, { sessionToken: 's' + (++n), sessionId: 'id' + n, expiresAt: new Date(Date.now() + 3600e3).toISOString() }); }
    if (url.pathname === '/v1/session' && m === 'DELETE') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': base } });
    if (url.pathname === '/v1/chat') {
      const q = body.message.toLowerCase(); const count = (seen.get(body.requestId) || 0) + 1; seen.set(body.requestId, count);
      await sleep(q.startsWith('slow') ? 11500 : 250);
      if (q.startsWith('reject')) return json(503, { error: { code: 'provider_request_rejected', message: 'Rephrase' } });
      if (q.startsWith('down') && count < 2) return json(503, { error: { code: 'service_unavailable', message: 'x' } });
      if (q.startsWith('limit') && count < 2) return json(429, { error: { code: 'rate_limited', message: 'x' } }, { 'retry-after': '2', 'access-control-expose-headers': 'Retry-After' });
      if (q.startsWith('busy') && count < 2) return json(409, { error: { code: 'turn_in_progress', message: 'x' } });
      if (q.startsWith('expire')) return json(401, { error: { code: 'session_expired', message: 'x' } });
      const es = log.filter(l => l.path === '/v1/sessions').at(-1)?.body?.locale === 'es';
      const sources = q.includes('clock') || q.includes('reloj') ? [{ id: 'k1', title: 'NEVORA', url: 'https://www.thevelani.com/pages/nevora' }, { id: 'bad', title: 'Evil', url: 'https://evil.example/x' }, { id: 'js', title: 'JS', url: 'javascript:alert(1)' }] : [];
      const action = q.includes('clock') || q.includes('reloj') ? 'show_demo' : q.includes('price') ? 'lead_form' : q.includes('password') ? 'human_help' : 'none';
      const text = (es ? 'Respuesta en español' : 'Answer') + ' to: ' + body.message + (q.includes('markup') ? '\n\n<img src=x onerror="window.__xss=1"><b>bold</b>' : '') + (q.includes('follow') ? '\n\nYou asked earlier: ' + (log.filter(l => l.path === '/v1/chat').at(-2)?.body?.message || '') : '');
      return json(200, { message: text, sources, action, confidence: 'grounded', model: 'test' });
    }
    return json(404, { error: { code: 'not_found', message: 'x' } });
  });
}
const engines = (process.env.ENGINES || 'chromium,webkit').split(',');
try {
  for (const name of engines) {
    const browser = await { chromium, webkit }[name].launch();
    for (const vp of [{ w: 1440, h: 900 }, { w: 390, h: 844, mobile: true }]) {
      const tag = `${name} ${vp.w}`;
      const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: vp.mobile ? 2 : 1, isMobile: !!vp.mobile && name !== 'firefox', hasTouch: !!vp.mobile });
      await ctx.route('https://challenges.cloudflare.com/**', r => r.fulfill({ status: 200, contentType: 'text/javascript', body: TURNSTILE }));
      const p = await ctx.newPage(); const log = []; const errors = [];
      p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/status of (503|429|409|401|403)/.test(m.text()) && !(name === 'webkit' && /Refused to apply a stylesheet/.test(m.text()))) errors.push(m.text()); }); // WebKit: Playwright's screenshot injects a caret-hiding style that the preview CSP refuses, with or without the assistant
      await backend(p, log);
      const send = async text => { await p.fill('#ast-in', text); await p.press('#ast-in', 'Enter'); };
      const settle = () => p.locator('.ast-wait').waitFor({ state: 'detached', timeout: 20000 });
      const last = () => p.locator('.ast-msg.ai').last();
      await p.goto(base + '/pages/nevora', { waitUntil: 'networkidle' });
      const launch = p.locator('#ast-launch');
      if (vp.mobile) {
        ok(await launch.isHidden(), `${tag}: on phones the launcher stays off the first screen`);
        await p.evaluate(() => scrollBy(0, 900)); await sleep(500);
        ok(await launch.isVisible(), `${tag}: the launcher appears after scrolling`);
      }
      ok(await launch.isVisible() && /ask rondo/i.test(await launch.innerText()), `${tag}: launcher reads "Ask Rondo"`);
      // launcher must not cover page actions
      const overlap = await p.evaluate(() => { const l = document.getElementById('ast-launch').getBoundingClientRect(); return [...document.querySelectorAll('a.pill, button.pill, .gnav a, .lnav a')].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.bottom > l.top && r.top < l.bottom && r.right > l.left && r.left < l.right; }).map(e => e.textContent.trim()); });
      ok(overlap.length === 0, `${tag}: launcher overlaps no visible page action at load (${overlap.join(', ') || 'none'})`);
      await launch.click(); await p.locator('#ast').waitFor({ state: 'visible' });
      await p.waitForFunction(() => !document.getElementById('ast-in').disabled);
      ok((await p.locator('#ast-t').innerText()) === 'Rondo' && /AI adviser/.test(await p.locator('#ast-sub').innerText()) && /Hi, I’m Rondo/.test(await p.locator('#ast-hi').innerText()), `${tag}: panel names Rondo, an AI adviser`);
      ok(/can’t see employee accounts/.test(await p.locator('#ast-scope').innerText()), `${tag}: welcome states what Rondo cannot do`);
      ok((await p.locator('#ast-sugg button').count()) === 3 && await p.locator('#ast-send').isDisabled(), `${tag}: three suggestions; send disabled while empty`);
      const ovx = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); ok(ovx <= 0, `${tag}: no horizontal overflow with the panel open`);
      await p.screenshot({ path: `${out}/${name}-${vp.w}-welcome.png` });
      // first question: Turnstile then session (locale en, fresh token) then chat
      await p.evaluate(() => { window.__tsDelay = 1500; }); await p.locator('#ast-sugg button').first().click(); await sleep(700);
      ok(/Waiting for the verification/.test(await p.locator('.ast-wait').innerText()) && await p.locator('#ast-verify').isVisible(), `${tag}: while verification is pending the panel says so (not "thinking")`);
      await settle();
      const sess = log.find(l => l.path === '/v1/sessions');
      ok(sess?.body?.locale === 'en' && /^tok-/.test(sess?.body?.captchaToken || ''), `${tag}: session created with locale en and a fresh verification token`);
      ok(/Answer to: How does the time clock work/.test(await last().innerText()), `${tag}: suggestion sends and the answer appears`);
      const links = last().locator('.ast-src a'); ok((await links.count()) === 1 && (await links.getAttribute('href')) === 'https://www.thevelani.com/pages/nevora', `${tag}: only the valid Velani source is linked (unsafe ones dropped)`);
      ok((await last().locator('.ast-acts a').getAttribute('href')) === '#try', `${tag}: demo action points at the time clock on this page`);
      await p.screenshot({ path: `${out}/${name}-${vp.w}-answer.png` });
      await send('markup please'); await settle();
      ok(await p.evaluate(() => !window.__xss && !document.querySelector('.ast-log img, .ast-log b:not(.rmark)')), `${tag}: answers render as text, never markup`);
      await send('a follow up'); await settle();
      const chats = log.filter(l => l.path === '/v1/chat'); ok(chats.every(c => c.auth) && log.filter(l => l.path === '/v1/sessions').length === 1, `${tag}: follow-ups reuse the same session with the bearer token`);
      // duplicate submissions: double Enter sends once
      const before = log.filter(l => l.path === '/v1/chat').length; await p.fill('#ast-in', 'price question'); await p.press('#ast-in', 'Enter'); await p.press('#ast-in', 'Enter'); await p.click('#ast-send', { force: true }).catch(() => {}); await settle();
      ok(log.filter(l => l.path === '/v1/chat').length === before + 1, `${tag}: repeated Enter or clicks send one request`);
      ok((await last().locator('.ast-acts a').getAttribute('href')) === '/pages/contact?interest=nevora', `${tag}: lead_form goes to the real contact route`);
      // service failure -> retry reuses identical requestId and payload
      await send('down for a bit'); await settle();
      ok(await p.locator('#ast-retry').isVisible() && await p.locator('#ast-contact').isVisible() && /temporarily unavailable/.test(await p.locator('#ast-status-t').innerText()), `${tag}: service failure explains, offers Retry and the contact page`);
      ok(await p.locator('#ast-send').isDisabled(), `${tag}: no new question while a failed one is pending`);
      await p.click('#ast-retry'); await settle();
      const downs = log.filter(l => l.path === '/v1/chat' && /^down/.test(l.body.message)); ok(downs.length === 2 && downs[0].body.requestId === downs[1].body.requestId && downs[0].body.message === downs[1].body.message, `${tag}: retry reuses the same request ID and words`);
      ok(/Answer to: down/.test(await last().innerText()), `${tag}: retried question gets its answer`);
      // rate limit with Retry-After countdown
      await send('limit test'); await settle();
      ok(await p.locator('#ast-retry').isDisabled() && /\(\d+s\)/.test(await p.locator('#ast-retry').innerText()), `${tag}: rate limit counts down before Retry is allowed`);
      await sleep(2300); ok(!(await p.locator('#ast-retry').isDisabled()), `${tag}: Retry enables after Retry-After`); await p.click('#ast-retry'); await settle();
      // turn in progress
      await send('busy test'); await settle(); ok(/still being answered/.test(await p.locator('#ast-status-t').innerText()), `${tag}: 409 in progress says so`); await p.click('#ast-retry'); await settle();
      // provider rejection: Edit puts the words back; editing sends with a new ID
      await send('reject this compound question'); await settle();
      ok(/could not be answered as written/.test(await p.locator('#ast-status-t').innerText()) && await p.locator('#ast-retry').isHidden() && (await p.locator('#ast-discard').innerText()) === 'Edit question', `${tag}: rejected question offers Edit, not an automatic or unchanged retry`);
      const rejCount = log.filter(l => /^reject/.test(l.body?.message || '')).length; await sleep(1500); ok(log.filter(l => /^reject/.test(l.body?.message || '')).length === rejCount, `${tag}: rejected question is not resent automatically`);
      await p.click('#ast-discard'); ok((await p.inputValue('#ast-in')) === 'reject this compound question' && (await p.locator('.ast-msg.you[data-unsent]').count()) === 0, `${tag}: Edit returns the question to the box`);
      const rej = log.filter(l => /^reject/.test(l.body?.message || '')).at(-1).body.requestId;
      await p.fill('#ast-in', 'edited question, one thing'); await p.press('#ast-in', 'Enter'); await settle();
      ok(log.filter(l => l.path === '/v1/chat').at(-1).body.requestId !== rej, `${tag}: edited question uses a new request ID`);
      // slow answer: honest progress text after 10 s
      await send('slow one'); await sleep(10600); ok(/Still working/.test(await p.locator('.ast-wait').innerText()), `${tag}: long wait says answers can take up to 45 seconds`); await settle();
      // Escape and focus
      await p.focus('#ast-in'); await p.keyboard.press('Escape');
      ok(await p.locator('#ast').isHidden() && await p.evaluate(() => document.activeElement.id === 'ast-launch'), `${tag}: Escape closes and focus returns to the launcher`);
      await p.keyboard.press('Enter'); await p.locator('#ast').waitFor({ state: 'visible' }); ok((await p.locator('.ast-msg').count()) > 4, `${tag}: keyboard reopens with the conversation kept`);
      if (vp.mobile) { for (let i = 0; i < 40; i++) await p.keyboard.press('Tab'); ok(await p.evaluate(() => document.getElementById('ast').contains(document.activeElement)), `${tag}: Tab stays inside the full-screen panel`); }
      // language switch mid-conversation: confirm, delete, new session in es
      const deletesBefore = log.filter(l => l.m === 'DELETE').length;
      await p.click('#ast-lang [data-locale=es]'); ok(await p.locator('#ast-confirm').isVisible() && /Switch to Spanish/.test(await p.locator('#ast-confirm-t').innerText()), `${tag}: switching language mid-conversation asks first`);
      await p.click('#ast-confirm-yes'); await sleep(400);
      ok(log.filter(l => l.m === 'DELETE').length === deletesBefore + 1 && (await p.locator('.ast-msg').count()) === 0 && (await p.locator('#ast-hi').innerText()).startsWith('Hola'), `${tag}: old conversation deleted on the server; panel now in Spanish`);
      await send('¿Cómo funciona el reloj?'); await settle();
      ok(log.filter(l => l.path === '/v1/sessions').at(-1).body.locale === 'es' && /Respuesta en español/.test(await last().innerText()) && /Fuentes/.test(await last().innerText()), `${tag}: new session in es; Spanish answer and labels`);
      // expired session puts the question back
      await send('expire now'); await settle();
      ok(/caducó/.test(await p.locator('#ast-status-t').innerText()) && (await p.inputValue('#ast-in')) === 'expire now', `${tag}: expired session explains and returns the question to the box`);
      // delete with confirmation
      await p.click('#ast-lang [data-locale=en]'); if (await p.locator('#ast-confirm').isVisible()) await p.click('#ast-confirm-yes'); await sleep(300); await p.fill('#ast-in', ''); 
      await send('hello again'); await settle(); await p.click('#ast-clear');
      ok(await p.locator('#ast-confirm').isVisible() && await p.evaluate(() => document.activeElement.id === 'ast-confirm-yes'), `${tag}: delete asks for confirmation with focus on Delete`);
      await p.keyboard.press('Escape'); ok(await p.locator('#ast-confirm').isHidden() && await p.locator('#ast').isVisible(), `${tag}: Escape cancels the confirmation without closing the panel`);
      await p.click('#ast-clear'); const d0 = log.filter(l => l.m === 'DELETE').length; await p.click('#ast-confirm-yes'); await sleep(400);
      ok(log.filter(l => l.m === 'DELETE').length === d0 + 1 && log.filter(l => l.m === 'DELETE').at(-1).auth && (await p.locator('.ast-msg').count()) === 0 && /deleted/.test(await p.locator('#ast-status-t').innerText()), `${tag}: authenticated delete clears the conversation`);
      await p.screenshot({ path: `${out}/${name}-${vp.w}-deleted.png` });
      // Page errors are judged before axe runs: WebKit reports the scanner's own injected styles against the preview's CSP
      ok(errors.length === 0, `${tag}: no page errors (${errors.slice(0, 3).join(' | ')})`);
      const ax = await new AxeBuilder({ page: p }).include('#ast').analyze(); ok(ax.violations.length === 0, `${tag}: axe on the open panel: ${ax.violations.map(v => v.id + ':' + v.nodes.length).join(',') || 'clean'}`);
      await ctx.close();
      // configuration failure: panel explains instead of breaking
      const c2 = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: !!vp.mobile && name !== 'firefox', hasTouch: !!vp.mobile }); const p2 = await c2.newPage(); p2.__configFail = true; await backend(p2, []);
      await p2.goto(base + '/', { waitUntil: 'networkidle' }); await p2.evaluate(() => scrollBy(0, 900)); await sleep(500); await p2.click('#ast-launch'); await sleep(600);
      ok(await p2.locator('#ast-in').isDisabled() && /isn’t available/.test(await p2.locator('#ast-status-t').innerText()) && await p2.locator('#ast-contact').isVisible() && await p2.locator('#ast-retry').isVisible(), `${tag}: unavailable service disables the box and offers Retry and the contact page`);
      p2.__configFail = false; await p2.click('#ast-retry'); await sleep(600); ok(!(await p2.locator('#ast-in').isDisabled()) && await p2.locator('#ast-status').isHidden(), `${tag}: Retry recovers when the service returns`);
      await p2.screenshot({ path: `${out}/${name}-${vp.w}-home-open.png` });
      await c2.close();
    }
    await browser.close();
  }
} finally {
  server.kill();
  await writeFile(out + '/results.json', JSON.stringify({ failures, results }, null, 1));
  console.log(`\n${results.length - failures} passed, ${failures} failed → ${out}`);
  process.exitCode = failures ? 1 : 0;
}
