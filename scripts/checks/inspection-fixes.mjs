// Inspection fixes (2026-11-05) on the local preview: larger-team quote switch, Plans closure wording, Products links and
// description, Relay waitlist, Rondo availability label, "Ask Rondo" opening the chat. Chromium and WebKit, 1440 and 390.
// Usage: PLAYWRIGHT_FROM=/path/with/playwright node scripts/checks/inspection-fixes.mjs
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
const pw = process.env.PLAYWRIGHT_FROM ? createRequire(process.env.PLAYWRIGHT_FROM + '/package.json')('playwright') : await import('@playwright/test');
const PORT = 4191, base = `http://127.0.0.1:${PORT}`, out = 'evidence/inspection-fixes-2026-11-05'; await mkdir(out, { recursive: true });
const server = spawn(process.execPath, ['scripts/serve.mjs', '--port', String(PORT)], { env: { ...process.env, VELANI_ASSISTANT_API: 'https://velani-ai.test' }, stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise(r => server.stdout.once('data', r));
const results = []; let fails = 0; const ok = (c, m) => { results.push((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + m); };
try {
 for (const engine of ['chromium', 'webkit']) {
  const b = await pw[engine].launch();
  for (const vp of [{ w: 1440, h: 900 }, { w: 390, h: 844, m: true }]) {
   const tag = engine + ' ' + vp.w;
   const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: vp.m ? 2 : 1, isMobile: !!vp.m, hasTouch: !!vp.m });
   await ctx.route('https://velani-ai.test/**', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': base }, body: JSON.stringify({ assistantName: 'Rondo', requireCaptcha: true, turnstileSiteKey: 'k' }) }));
   const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
   // 1. trial form, team of more than 30
   await p.goto(base + '/pages/contact?interest=nevora-demo', { waitUntil: 'networkidle' });
   const h1 = () => p.evaluate(() => { const h = document.querySelector('.cform-hero h1'); return [...h.children].filter(s => getComputedStyle(s).display !== 'none').map(s => s.textContent).join(''); });
   ok(/Request your free NEVORA trial/.test(await h1()), `${tag}: trial form starts as a trial request`);
   await p.fill('#inquiry-name', 'Ana Test'); await p.fill('#inquiry-email', 'ana@example.com');
   await p.selectOption('#inquiry-team', { label: 'More than 30 (by quote)' }); await p.waitForTimeout(200);
   const q = await p.evaluate(() => ({ btn: [...document.querySelector('[data-inquiry-submit]').children].filter(s => getComputedStyle(s).display !== 'none').map(s => s.textContent).join('') || document.querySelector('[data-inquiry-submit]').textContent, topic: document.querySelector('#inquiry-interest').value, note: !document.querySelector('.quote-note').hidden, kept: document.querySelector('#inquiry-name').value, label: document.querySelector('.cform-hero h1').getAttribute('aria-label'), fine: getComputedStyle(document.querySelector('.fine.v-m') || document.body).display }));
   ok(/Ask for a NEVORA quote/.test(await h1()) && q.topic === 'nevora' && q.note && q.kept === 'Ana Test' && /quote/i.test(q.label || ''), `${tag}: more than 30 switches heading, topic and note to a quote; typed name kept (${q.btn})`);
   await p.screenshot({ path: `${out}/${engine}-${vp.w}-trial-over-30.png` });
   await p.selectOption('#inquiry-team', { label: '11–20' }); await p.waitForTimeout(200);
   ok(/Request your free NEVORA trial/.test(await h1()) && (await p.inputValue('#inquiry-interest')) === 'nevora-demo', `${tag}: choosing 11–20 switches back to the trial`);
   // 2. Plans
   await p.goto(base + '/pages/plans', { waitUntil: 'networkidle' });
   const plans = await p.evaluate(() => ({ h: [...document.querySelectorAll('h2')].map(h => h.textContent).find(t => /trial can end/.test(t)), items: document.querySelectorAll('.rail.r2 > *').length, text: document.querySelector('.rail.r2')?.innerText || '', ovx: document.documentElement.scrollWidth - innerWidth }));
   ok(plans.h === 'Two ways the trial can end.' && plans.items === 2 && /Close the workplace/.test(plans.text) && /Export your schedules/.test(plans.text) && plans.ovx <= 0, `${tag}: Plans shows two ways the trial ends, export before closing`);
   await p.locator('.rail.r2').scrollIntoViewIfNeeded(); await p.waitForTimeout(900); await p.screenshot({ path: `${out}/${engine}-${vp.w}-plans-day30.png` });
   // 3. Products
   await p.goto(base + '/pages/products', { waitUntil: 'networkidle' });
   const prod = await p.evaluate(() => ({ links: [...document.querySelectorAll('main a')].map(a => a.textContent.trim() + '→' + a.getAttribute('href')), desc: document.querySelector('meta[name=description]')?.content || '' }));
   ok(prod.links.includes('Explore websites→/pages/custom-development#web-applications') && prod.links.includes('Explore custom apps→/pages/custom-development') && prod.links.filter(l => l.startsWith('Start a project')).every(l => l.endsWith('/pages/contact')), `${tag}: Products: explanation links say Explore; Start a project goes to the contact form`);
   ok(prod.links.includes('Join the waitlist→/pages/contact?interest=relay'), `${tag}: Relay button says Join the waitlist`);
   ok(/NEVORA Relay for orders/.test(prod.desc), `${tag}: Products has a search description`);
   // 4. Rondo label and Ask Rondo
   await p.goto(base + '/pages/about', { waitUntil: 'networkidle' });
   if (vp.m) { await p.click('#gmenu-btn'); await p.waitForTimeout(400); }
   else { await p.hover('.gnav-ddlink'); await p.waitForTimeout(400); }
   const chip = await p.evaluate(m => { const a = [...document.querySelectorAll(m ? '#gmenu a' : '.gnav-ddmenu a')].find(x => /Rondo/.test(x.textContent)); const c = a?.querySelector('.nav-soon'); const r = a?.getBoundingClientRect(); return { text: c?.textContent, wraps: c ? c.getBoundingClientRect().height > 24 : null, right: r ? r.right <= innerWidth : null }; }, !!vp.m);
   ok(chip.text === 'In development' && !chip.wraps && chip.right, `${tag}: Rondo is labelled In development in the ${vp.m ? 'phone' : 'desktop'} menu`);
   await p.screenshot({ path: `${out}/${engine}-${vp.w}-rondo-menu.png` });
   await p.goto(base + '/pages/nevora', { waitUntil: 'networkidle' });
   await p.locator('[data-open-rondo]').scrollIntoViewIfNeeded(); await p.click('[data-open-rondo]'); await p.waitForTimeout(600);
   ok(await p.locator('#ast').isVisible() && p.url().endsWith('/pages/nevora'), `${tag}: "Ask Rondo" on the NEVORA page opens the chat instead of the quote form`);
   ok(/Don’t share passwords/.test(await p.locator('#ast-note').innerText()), `${tag}: chat note asks people not to share passwords, payment details or employee records`);
   ok(errs.length === 0, `${tag}: no page errors (${errs.join(' | ')})`);
   await ctx.close();
  }
  await b.close();
 }
} finally { server.kill(); await writeFile(out + '/results.txt', results.join('\n') + '\n'); console.log(`\n${results.length - fails} passed, ${fails} failed`); process.exitCode = fails ? 1 : 0; }
