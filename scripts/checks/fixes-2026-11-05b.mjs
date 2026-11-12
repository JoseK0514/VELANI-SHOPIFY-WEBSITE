// Inspection fixes, second pass (2026-11-05): tablet layout, keyboard and menus, Rondo states, contact form, consent and copy.
// Local preview only, with a stand-in Rondo API and Turnstile (nothing is sent anywhere). Chromium and WebKit; 1440, 1024, 834, 390.
// Usage: PLAYWRIGHT_FROM=/path/with/playwright node scripts/checks/fixes-2026-11-05b.mjs
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
const pw = process.env.PLAYWRIGHT_FROM ? createRequire(process.env.PLAYWRIGHT_FROM + '/package.json')('playwright') : await import('@playwright/test');
const API = 'https://velani-ai.test', PORT = 4195, base = `http://127.0.0.1:${PORT}`, out = 'evidence/fixes-2026-11-05b'; await mkdir(out, { recursive: true });
const server = spawn(process.execPath, ['scripts/serve.mjs', '--port', String(PORT)], { env: { ...process.env, VELANI_ASSISTANT_API: API }, stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise(r => server.stdout.once('data', r));
const results = []; let fails = 0; const ok = (c, m) => { results.push((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + m); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const TURNSTILE = `window.turnstile={render(sel,o){window.__ts=o;setTimeout(()=>o.callback('tok-'+Math.random()),50);return 'w1'},reset(){const o=window.__ts;setTimeout(()=>o.callback('tok-'+Math.random()),50)}};`;
// Stand-in Rondo API. opts.hangConfig: /v1/config never answers. state.expireDelete: DELETE answers 401 (the session had expired)
function backend(ctx, state, opts = {}) {
 return ctx.route(API + '/**', async route => {
  const req = route.request(), url = new URL(req.url()), m = req.method();
  const json = (status, body) => route.fulfill({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': base }, body: JSON.stringify(body) });
  if (m === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': base, 'access-control-allow-headers': 'content-type,authorization', 'access-control-allow-methods': 'GET,POST,DELETE' } });
  if (url.pathname === '/v1/config') { if (opts.hangConfig) return; return json(200, { assistantName: 'Rondo', requireCaptcha: true, turnstileSiteKey: 'k' }); }
  if (url.pathname === '/v1/sessions') return json(201, { sessionToken: 's1', sessionId: 'id1', expiresAt: new Date(Date.now() + 3600e3).toISOString() });
  if (url.pathname === '/v1/session' && m === 'DELETE') { state.deletes = (state.deletes || 0) + 1; return state.expireDelete ? json(401, { error: { code: 'session_expired', message: 'x' } }) : route.fulfill({ status: 204, headers: { 'access-control-allow-origin': base } }); }
  if (url.pathname === '/v1/chat') return json(200, { message: 'Answer', sources: [], action: 'lead_form', confidence: 'grounded', model: 'test' });
  return json(404, { error: { code: 'not_found', message: 'x' } });
 });
}
const visible = (p, sel) => p.evaluate(s => { const el = document.querySelector(s); if (!el) return false; const cs = getComputedStyle(el), r = el.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.05 && r.width > 0 && r.height > 0; }, sel);
const PRICE = 'quoted for your number of employees, your business and the features you use';
try {
 for (const engine of ['chromium', 'webkit']) {
  const b = await pw[engine].launch();
  // ---------- V-01: text and visuals never overlap, 769 to 1920 ----------
  for (const w of [769, 834, 900, 1024, 1100, 1180, 1200, 1280, 1440, 1920]) {
   const ctx = await b.newContext({ viewport: { width: w, height: w < 1000 ? 1112 : 820 }, reducedMotion: 'reduce' }); const p = await ctx.newPage();
   const hits = [];
   for (const path of ['/', '/pages/products', '/pages/custom-development', '/pages/nevora', '/pages/about', '/pages/plans']) {
    await p.goto(base + path, { waitUntil: 'networkidle' });
    hits.push(...(await p.evaluate(() => {
     const res = [];
     for (const panel of document.querySelectorAll('.hpanel')) {
      const vis = [...panel.querySelectorAll('.hshot,.hwin,.hchat,.rcard,.hduo,.hweb')].filter(v => { const s = getComputedStyle(v), r = v.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0; });
      const txt = [...panel.querySelectorAll('.hcopy h1,.hcopy h2,.hcopy p,.hcopy a')].filter(t => t.getBoundingClientRect().width > 0);
      for (const v of vis) { const a = v.getBoundingClientRect(); for (const t of txt) { const r = t.getBoundingClientRect(); if (Math.min(a.right, r.right) - Math.max(a.left, r.left) > 4 && Math.min(a.bottom, r.bottom) - Math.max(a.top, r.top) > 4) res.push(location.pathname + '#' + panel.id + ' ' + v.className.split(' ')[0] + '×' + t.tagName); } }
     }
     return res;
    })));
   }
   ok(hits.length === 0, `${engine} ${w}: no panel text overlaps a visual on 6 pages (${hits.slice(0, 4).join(', ') || 'none'})`);
   if (engine === 'chromium' && [834, 1024].includes(w)) for (const path of ['/', '/pages/products', '/pages/custom-development', '/pages/nevora']) { await p.goto(base + path, { waitUntil: 'networkidle' }); await p.screenshot({ path: `${out}/${engine}-${w}${path.replace(/\//g, '_')}.png`, fullPage: true }); }
   await ctx.close();
  }
  for (const vp of [{ w: 1440, h: 900 }, { w: 1024, h: 768 }, { w: 834, h: 1112 }, { w: 390, h: 844, m: true }]) {
   const tag = engine + ' ' + vp.w;
   const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: vp.m ? 2 : 1, isMobile: !!vp.m, hasTouch: !!vp.m });
   await ctx.route('https://challenges.cloudflare.com/**', r => r.fulfill({ status: 200, contentType: 'text/javascript', body: TURNSTILE }));
   const state = {}; await backend(ctx, state);
   const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
   // ---------- copy: app, price, Relay waitlist ----------
   await p.goto(base + '/pages/nevora', { waitUntil: 'networkidle' });
   const nev = await p.evaluate(() => document.querySelector('main').innerText);
   const nevAll = await p.evaluate(() => document.querySelector('main').textContent.replace(/\s+/g, ' '));
   ok(/On the web and in the NEVORA app\./.test(nev) && !/nothing to install/i.test(nev), `${tag}: NEVORA page says it runs on the web and in the NEVORA app`);
   ok(/Rondo is being built to/.test(nev) && /answers questions about Velani and NEVORA today/.test(nev) && /Example conversation with fictional people\./.test(nev) && /request account deletion/.test(nev), `${tag}: Rondo section is future tense, says the website chat works today; deletion is a request`);
   ok(nevAll.toLowerCase().includes(PRICE), `${tag}: NEVORA price answer uses the quote wording`);
   // ---------- A-01: NEVORA local menu (narrow screens) ----------
   if (vp.w < 960) {
    await p.click('#lnav-tog'); await sleep(200);
    const s = await p.evaluate(() => ({ inList: document.getElementById('lnav-list').contains(document.activeElement), inert: ['main > #top', 'main > #faq', 'footer', '#ast-root'].map(x => document.querySelector(x)?.inert), lock: document.body.style.overflow, label: document.getElementById('lnav-tog').getAttribute('aria-label') }));
    ok(s.inList && s.inert.every(Boolean) && s.lock === 'hidden' && s.label === 'Close menu', `${tag}: NEVORA menu takes focus, the page behind is inert and locked, button says Close menu (${JSON.stringify(s)})`);
    ok(!(await visible(p, '#ast-launch')), `${tag}: Ask Rondo is hidden while the NEVORA menu is open`);
    await p.keyboard.press('Escape'); await sleep(150);
    const c = await p.evaluate(() => ({ focus: document.activeElement.id, open: document.getElementById('lnav-tog').getAttribute('aria-expanded'), inert: document.querySelector('main > #top').inert, lock: document.body.style.overflow }));
    ok(c.focus === 'lnav-tog' && c.open === 'false' && !c.inert && c.lock === '', `${tag}: Escape closes the NEVORA menu and returns focus to its button`);
   }
   // ---------- A-05: PIN demo ----------
   await p.locator('#kio').scrollIntoViewIfNeeded();
   for (const d of '1234') await p.click(`#kio [data-d="${d}"]`);
   await p.click('#kio-go'); await sleep(250);
   const pin = await p.evaluate(() => ({ focus: document.activeElement.id, live: document.getElementById('kio-live').textContent }));
   ok(pin.focus === 'kio-ok-h' && /^Clock-in recorded at \d/.test(pin.live), `${tag}: after Continue focus is on the result and "${pin.live}" is announced`);
   await p.click('#kio-done'); for (const d of '5678') await p.click(`#kio [data-d="${d}"]`);
   await p.focus('#kio-go'); await p.keyboard.press('Enter'); await sleep(250);
   ok(await p.evaluate(() => document.activeElement.id === 'kio-ok-h'), `${tag}: Continue by keyboard also lands on the result`);
   // ---------- A-02: scroll cue ----------
   await p.goto(base + '/', { waitUntil: 'networkidle' });
   await p.focus('a.hcue'); const cue = await p.evaluate(() => +getComputedStyle(document.querySelector('a.hcue')).opacity);
   ok(cue >= 0.85, `${tag}: focused "Scroll to NEVORA" is visible (opacity ${cue})`);
   ok(/Coming to NEVORA/i.test(await p.locator('#rondo .hkick').innerText()), `${tag}: home Rondo label says Coming to NEVORA`);
   // ---------- A-03: Products menu (desktop header) ----------
   if (vp.w >= 834) {
    ok((await p.getAttribute('.gnav-ddlink', 'href')) === '/pages/products', `${tag}: Products still links to the Products page`);
    await p.hover('.gnav-ddlink'); await sleep(300);
    ok((await p.getAttribute('.gnav-ddbtn', 'aria-expanded')) === 'true' && await visible(p, '.gnav-ddmenu'), `${tag}: hover opens the Products menu and the button says expanded`);
    await p.keyboard.press('Escape'); await sleep(300);
    ok((await p.getAttribute('.gnav-ddbtn', 'aria-expanded')) === 'false' && !(await visible(p, '.gnav-ddmenu')), `${tag}: Escape closes the hover-opened menu`);
    await p.mouse.move(5, vp.h - 5); await sleep(200);
    await p.focus('.gnav-ddbtn'); await sleep(250);
    ok((await p.getAttribute('.gnav-ddbtn', 'aria-expanded')) === 'true' && await visible(p, '.gnav-ddmenu'), `${tag}: keyboard focus opens the menu`);
    await p.keyboard.press('Escape'); await sleep(300);
    ok((await p.getAttribute('.gnav-ddbtn', 'aria-expanded')) === 'false' && !(await visible(p, '.gnav-ddmenu')) && await p.evaluate(() => document.activeElement.classList.contains('gnav-ddbtn')), `${tag}: Escape closes it and focus stays on the button`);
    await p.keyboard.press('Enter'); await sleep(250);
    ok((await p.getAttribute('.gnav-ddbtn', 'aria-expanded')) === 'true' && await visible(p, '.gnav-ddmenu'), `${tag}: the button reopens it`);
    await p.keyboard.press('Escape');
   }
   // ---------- A-04: focus in the sticky header does not scroll the page (Chromium) ----------
   if (engine === 'chromium' && vp.w >= 834) {
    await p.goto(base + '/pages/about', { waitUntil: 'networkidle' });
    await p.evaluate(() => scrollTo(0, 1500)); await sleep(300); await p.evaluate(() => scrollBy(0, -40)); await sleep(500);
    const y0 = await p.evaluate(() => scrollY); await p.focus('.gnav-links li:nth-child(3) a'); await sleep(400); const y1 = await p.evaluate(() => scrollY);
    ok(Math.abs(y1 - y0) <= 2, `${tag}: focusing a header link leaves the page where it was (${y0} → ${y1})`);
    await p.goto(base + '/pages/nevora#faq', { waitUntil: 'networkidle' }); await sleep(600);
    const land = await p.evaluate(() => { const h = document.getElementById('faq-t').getBoundingClientRect(); return Math.round(h.top); });
    ok(land >= 56 && land < 260, `${tag}: an in-page anchor still lands below the sticky bar (heading at ${land}px)`);
   }
   // ---------- launcher while the phone menu is open; while a field has focus ----------
   if (vp.m) {
    await p.goto(base + '/pages/about', { waitUntil: 'networkidle' }); await p.evaluate(() => scrollTo(0, 700)); await sleep(500);
    ok(await visible(p, '#ast-launch'), `${tag}: Ask Rondo shows after scrolling`);
    await p.click('#gmenu-btn'); await sleep(250);
    ok(!(await visible(p, '#ast-launch')) && await p.evaluate(() => document.getElementById('ast-root').inert), `${tag}: Ask Rondo is hidden and inert while the phone menu is open`);
    await p.click('#gmenu-btn'); await sleep(200);
    await p.evaluate(() => scrollTo(0, document.body.scrollHeight)); await sleep(600);
    ok(!(await visible(p, '#ast-launch')), `${tag}: Ask Rondo steps aside at the footer`);
   }
   // ---------- contact form: A-08, A-09, A-12, C-17, C-23 ----------
   await p.goto(base + '/pages/contact', { waitUntil: 'networkidle' });
   await p.focus('#inquiry-name'); await sleep(350);
   ok(!(await visible(p, '#ast-launch')), `${tag}: Ask Rondo stays hidden while a form field has focus`);
   const ring = await p.evaluate(() => { const cs = getComputedStyle(document.activeElement); return cs.outlineStyle + ' ' + cs.outlineWidth; });
   ok(ring === 'solid 2px', `${tag}: contact fields show the 2px focus ring (${ring})`);
   await p.click('[data-inquiry-submit]'); await sleep(200);
   ok(/Enter your name/.test(await p.innerText('#error-name')) && /Check the highlighted fields and try again/.test(await p.innerText('.form-status')), `${tag}: errors explain what to fix`);
   ok(/Tell us/.test(await p.innerText('#error-message')), `${tag}: message is required for a general topic`);
   await p.selectOption('#inquiry-interest', 'nevora'); await sleep(150);
   ok((await p.innerText('#error-message')) === '' && (await p.getAttribute('#inquiry-message', 'aria-invalid')) === null, `${tag}: switching to a NEVORA topic clears the now-optional message's error`);
   await p.selectOption('#inquiry-interest', 'nevora-demo'); await p.selectOption('#inquiry-team', { label: 'More than 30 (by quote)' }); await sleep(150);
   ok((await p.inputValue('#inquiry-interest')) === 'nevora' && await visible(p, '.quote-note'), `${tag}: general form, free trial with more than 30 becomes a NEVORA quote with the note`);
   await p.selectOption('#inquiry-team', { label: '11–20' }); await sleep(150);
   ok((await p.inputValue('#inquiry-interest')) === 'nevora-demo' && !(await visible(p, '.quote-note')), `${tag}: back to 11–20 returns to the free trial`);
   await p.goto(base + '/pages/contact?interest=relay', { waitUntil: 'networkidle' });
   const relay = await p.evaluate(() => ({ h: document.querySelector('.cform-hero h1').innerText.replace(/\s+/g, ' ').trim(), t: document.title, topic: document.getElementById('inquiry-interest').value }));
   ok(relay.h === 'Join the NEVORA Relay waitlist.' && relay.t === 'NEVORA Relay waitlist · Velani' && relay.topic === 'relay', `${tag}: Relay waitlist heading and title (${relay.h} | ${relay.t})`);
   // ---------- price wording ----------
   for (const path of ['/pages/plans', '/pages/help']) { await p.goto(base + path, { waitUntil: 'networkidle' }); ok((await p.evaluate(() => document.querySelector('main').textContent.replace(/\s+/g, ' '))).toLowerCase().includes(PRICE), `${tag}: ${path} states the price is quoted for employees, business and features`); }
   await p.goto(base + '/pages/plans', { waitUntil: 'networkidle' });
   ok(/Email support@thevelani\.com to close it\./.test(await p.evaluate(() => document.querySelector('main').innerText)), `${tag}: Plans says how to close the workplace`);
   // ---------- consent: every Shopify purpose (a stand-in Customer Privacy API) ----------
   const cp = await ctx.newPage();
   await cp.addInitScript(() => { window.Shopify = { customerPrivacy: { currentVisitorConsent: () => ({ analytics: 'no', marketing: 'no', preferences: 'no', sale_of_data: 'no' }), setTrackingConsent: (v, cb) => { window.__consent = v; cb(); } } }; document.addEventListener('readystatechange', () => { if (document.readyState === 'interactive') document.documentElement.dataset.platform = 'shopify'; }); });
   await cp.goto(base + '/pages/cookies', { waitUntil: 'networkidle' });
   await cp.locator('.foot [data-cookie-open]').click(); await sleep(300);
   ok(/Mailchimp/.test(await cp.innerText('#cookie-dialog')) && (await cp.locator('#cookie-dialog [data-consent]').count()) === 4, `${tag}: cookie choices name Shopify and Mailchimp and offer four choices`);
   await cp.click('[data-cookie-accept]'); await sleep(300);
   const acc = await cp.evaluate(() => window.__consent);
   await cp.click('[data-cookie-reject]'); await sleep(300);
   const rej = await cp.evaluate(() => window.__consent);
   ok(JSON.stringify(acc) === JSON.stringify({ analytics: true, marketing: true, preferences: true, sale_of_data: true }) && JSON.stringify(rej) === JSON.stringify({ analytics: false, marketing: false, preferences: false, sale_of_data: false }), `${tag}: Accept and Reject set analytics, marketing, preferences and sale_of_data (${JSON.stringify(rej)})`);
   ok(!/has not added|added no tools/.test(await cp.evaluate(() => document.querySelector('main').innerText)), `${tag}: cookies page no longer says no analytics tools were added`);
   await cp.close();
   // ---------- E-06: first section visible without the motion script ----------
   const np = await ctx.newPage(); await np.route('**/velani-motion.js', r => r.abort());
   await np.goto(base + '/pages/plans', { waitUntil: 'load' });
   const first = await np.evaluate(() => { const h = document.querySelector('main h1'), l = document.querySelector('main .lede'); return { h: getComputedStyle(h).visibility, l: +getComputedStyle(l).opacity }; });
   ok(first.h === 'visible' && first.l === 1, `${tag}: Plans heading and intro show without waiting for the motion script (${JSON.stringify(first)})`);
   await np.close();
   // ---------- Rondo: E-12 draft links, E-02 expired wording, A-07 ring ----------
   await p.goto(base + '/pages/nevora', { waitUntil: 'networkidle' });
   if (vp.m) { await p.evaluate(() => scrollTo(0, 900)); await sleep(500); }
   await p.click('#ast-launch'); await p.waitForFunction(() => !document.getElementById('ast-in').disabled);
   if (!vp.m) { await p.focus('#ast-in'); ok(await p.evaluate(() => getComputedStyle(document.getElementById('ast-form')).outlineStyle === 'solid'), `${tag}: the question box shows a focus ring`); }
   await p.evaluate(() => document.getElementById('ast-contact').setAttribute('href', '/?preview_theme_id=77&view=velani-contact'));
   await p.fill('#ast-in', 'price please'); await p.press('#ast-in', 'Enter'); await p.locator('.ast-msg.ai').waitFor();
   ok((await p.getAttribute('.ast-msg.ai .ast-acts a', 'href')) === '/?preview_theme_id=77&view=velani-contact&interest=nevora', `${tag}: Rondo's quote link stays in the draft theme`);
   state.expireDelete = true; await p.click('#ast-clear'); await p.click('#ast-confirm-yes'); await sleep(400);
   const st = await p.innerText('#ast-status-t');
   ok(/had already ended/.test(st) && /within 30 days/.test(st) && !/deleted/i.test(st), `${tag}: an expired conversation is not reported as deleted ("${st}")`);
   state.expireDelete = false; await p.fill('#ast-in', 'again'); await p.press('#ast-in', 'Enter'); await p.locator('.ast-msg.ai').waitFor();
   await p.click('#ast-clear'); await p.click('#ast-confirm-yes'); await sleep(400);
   ok(/^Conversation deleted\./.test(await p.innerText('#ast-status-t')), `${tag}: a confirmed delete says Conversation deleted`);
   ok(errs.length === 0, `${tag}: no page errors (${errs.join(' | ')})`);
   await ctx.close();
   // ---------- E-07 / E-08: configuration that never answers; verification that cannot load ----------
   if (vp.w === 1440 || vp.m) {
    const c2 = await b.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: !!vp.m, hasTouch: !!vp.m }); await backend(c2, {}, { hangConfig: true });
    const p2 = await c2.newPage(); await p2.goto(base + '/pages/about', { waitUntil: 'domcontentloaded' }); await sleep(800);
    if (vp.m) { await p2.evaluate(() => scrollTo(0, 700)); await sleep(500); }
    await p2.click('#ast-launch'); await sleep(500);
    ok(await p2.locator('#ast-in').isDisabled(), `${tag}: the question box stays disabled while the configuration loads`);
    await sleep(10200);
    ok(/isn’t available/.test(await p2.innerText('#ast-status-t')) && await p2.locator('#ast-retry').isVisible() && await p2.locator('#ast-contact').isVisible() && await p2.locator('#ast-in').isDisabled(), `${tag}: a configuration that never answers ends in the unavailable state with Retry and Contact`);
    await c2.close();
    const c3 = await b.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: !!vp.m, hasTouch: !!vp.m }); await backend(c3, {});
    await c3.route('https://challenges.cloudflare.com/**', r => r.fulfill({ status: 503, body: '' }));
    const p3 = await c3.newPage(); await p3.goto(base + '/pages/about', { waitUntil: 'networkidle' });
    if (vp.m) { await p3.evaluate(() => scrollTo(0, 700)); await sleep(500); }
    await p3.click('#ast-launch'); await p3.waitForFunction(() => !document.getElementById('ast-in').disabled);
    await p3.fill('#ast-in', 'hello'); await p3.press('#ast-in', 'Enter'); await p3.locator('.ast-wait').waitFor({ state: 'detached', timeout: 20000 });
    ok(/Verification couldn’t load/.test(await p3.innerText('#ast-status-t')) && await p3.locator('#ast-verify').isHidden() && await p3.locator('#ast-contact').isVisible(), `${tag}: verification that cannot load hides the empty box and offers the contact page`);
    await p3.screenshot({ path: `${out}/${engine}-${vp.w}-verify-failed.png` });
    await c3.close();
   }
  }
  await b.close();
 }
} finally { server.kill(); await writeFile(out + '/results.txt', results.join('\n') + '\n'); console.log(`\n${results.length - fails} passed, ${fails} failed`); process.exitCode = fails ? 1 : 0; }
