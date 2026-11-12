// Hosted preview, free checks: no /v1/chat request ever leaves the browser (blocked locally), so no AI cost.
import { createRequire } from 'node:module';
const pw = createRequire('/Users/josek0514/Desktop/tool-box-pr/package.json')('playwright');
const S = process.argv[2], T = '193103921466', B = 'https://www.thevelani.com';
const hide = '#preview-bar-iframe,#PBarNextFrameWrapper{display:none!important}';
const res = []; const ok = (c, m) => { res.push((c ? 'PASS ' : 'FAIL ') + m); console.log((c ? 'PASS ' : 'FAIL ') + m); };
for (const engine of ['chromium', 'webkit']) {
 const b = await pw[engine].launch();
 for (const vp of [{ w: 1440, h: 900 }, { w: 390, h: 844, m: true }]) {
  const tag = engine + ' ' + vp.w;
  const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: vp.m ? 2 : 1, isMobile: !!vp.m, hasTouch: !!vp.m });
  const p = await ctx.newPage(); const errs = []; const api = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)); });
  p.on('response', r => { if (r.url().startsWith('https://velani-ai.vercel.app')) api.push(r.request().method() + ' ' + new URL(r.url()).pathname + ' ' + r.status()); });
  await p.route('https://velani-ai.vercel.app/v1/chat', r => r.abort('blockedbyclient'));
  await p.goto(`${B}/?preview_theme_id=${T}`, { waitUntil: 'load' }); await p.addStyleTag({ content: hide }); await p.waitForTimeout(1500);
  const th = await p.evaluate(() => window.Shopify?.theme); ok(th?.id == 193103921466 && th?.role === 'unpublished', `${tag}: page is the unpublished Rondo theme (${th?.id} ${th?.role})`);
  for (const path of ['/', '/pages/nevora', '/pages/plans', '/pages/contact?interest=nevora-demo', '/pages/products']) {
   await p.goto(`${B}${path}${path.includes('?') ? '&' : '?'}preview_theme_id=${T}`, { waitUntil: 'load' }); await p.addStyleTag({ content: hide }); await p.waitForTimeout(1200);
   if (vp.m) { ok(!(await p.locator('#ast-launch').isVisible()), `${tag} ${path}: phone launcher stays off the first screen`); await p.evaluate(() => scrollBy(0, innerHeight)); await p.waitForTimeout(600); }
   const r = await p.evaluate(() => { const l = document.getElementById('ast-launch'); /* after one screen of scrolling on phones; content passes under a floating button */ if (!l) return { none: true }; const lr = l.getBoundingClientRect(); const hits = [...document.querySelectorAll('a,button,input,select,textarea')].filter(e => e !== l && !l.contains(e) && !e.closest('#ast')).filter(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width && r.height && cs.visibility !== 'hidden' && r.bottom > lr.top && r.top < lr.bottom && r.right > lr.left && r.left < lr.right; }).map(e => (e.textContent || e.name || e.id).trim().slice(0, 30)); return { text: l.innerText.trim(), visible: lr.width > 0, hits, ovx: document.documentElement.scrollWidth - innerWidth }; });
   ok(r.visible && /ask rondo/i.test(r.text) && r.ovx <= 0, `${tag} ${path}: launcher "${r.text}" visible, no sideways scroll`);
   ok(r.hits.length === 0, `${tag} ${path}: launcher covers no control at first view / after one screen on phones (${r.hits.join(', ') || 'none'})`);
  }
  // open, config from the hosted origin, keyboard
  await p.goto(`${B}/pages/nevora?preview_theme_id=${T}`, { waitUntil: 'load' }); await p.addStyleTag({ content: hide }); await p.waitForTimeout(1200);
  if (vp.m) { await p.evaluate(() => scrollBy(0, innerHeight)); await p.waitForTimeout(600); }
  await p.focus('#ast-launch'); await p.keyboard.press('Enter'); await p.waitForFunction(() => !document.getElementById('ast-in').disabled, null, { timeout: 15000 });
  console.log('   config seen:', api.filter(a=>a.includes('config')).join(',')); ok((await p.locator('#ast-t').innerText()) === 'Rondo' && !(await p.locator('#ast-in').isDisabled()), `${tag}: hosted config loads across origins; panel titled Rondo`);
  await p.waitForTimeout(500); await p.screenshot({ path: `${S}/hosted/${engine}-${vp.w}-welcome.png` });
  await p.keyboard.press('Escape'); ok(await p.locator('#ast').isHidden() && await p.evaluate(() => document.activeElement.id === 'ast-launch'), `${tag}: Escape closes; focus back on the launcher`);
  // language before a conversation switches immediately
  await p.click('#ast-launch'); await p.click('#ast-lang [data-locale=es]'); ok((await p.locator('#ast-hi').innerText()).startsWith('Hola') && await p.locator('#ast-confirm').isHidden(), `${tag}: Spanish before any conversation switches at once`);
  await p.click('#ast-lang [data-locale=en]');
  // real Turnstile: automated browsers get the interactive check, which only a person may complete
  if (vp.w === 1440 || engine === 'chromium') {
   await p.fill('#ast-in', 'Free check: verification only'); await p.press('#ast-in', 'Enter'); await p.waitForTimeout(9000);
   const v = await p.evaluate(() => ({ verify: !document.getElementById('ast-verify').hidden, frame: document.querySelector('#ast-turnstile').children.length > 0, wait: document.querySelector('.ast-wait')?.innerText || '' }));
   ok(v.verify && v.frame && /Waiting for the verification/.test(v.wait), `${tag}: real Turnstile widget renders with the configured key; panel says it is waiting for verification (${v.wait})`);
   await p.screenshot({ path: `${S}/hosted/${engine}-${vp.w}-turnstile.png` });
   ok(!api.some(a => a.startsWith('POST /v1/sessions')), `${tag}: no session is requested without a verification token`);
  }
  ok(!api.some(a => a.startsWith('POST /v1/chat')), `${tag}: no chat request reached the API (no AI cost)`);
  ok(errs.filter(e => !/blockedbyclient|ERR_BLOCKED|velani-ai\.vercel\.app\/v1\/chat|Failed to load resource|401|monorail|Refused to apply a stylesheet|api\/event\/collect|challenges\.cloudflare\.com|data:,|^%c/.test(e)).length === 0, `${tag}: no page errors (${errs.slice(0, 3).join(' | ')})`);
  console.log('   api:', api.join(' · '));
  await ctx.close();
 }
 await b.close();
}
