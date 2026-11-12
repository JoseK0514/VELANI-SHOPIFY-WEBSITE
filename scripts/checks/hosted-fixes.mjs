import { createRequire } from 'node:module';
const pw = createRequire('/Users/josek0514/Desktop/tool-box-pr/package.json')('playwright');
const S = process.argv[2], T = '193106706746', B = 'https://www.thevelani.com', q = p => B + p + (p.includes('?') ? '&' : '?') + 'preview_theme_id=' + T;
const hide = '#preview-bar-iframe,#PBarNextFrameWrapper{display:none!important}';
let fails = 0; const ok = (c, m) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + m); };
for (const engine of ['chromium', 'webkit']) { const b = await pw[engine].launch();
 for (const vp of [{ w: 1440, h: 900 }, { w: 390, h: 844, m: true }]) { const tag = engine + ' ' + vp.w;
  const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: vp.m ? 2 : 1, isMobile: !!vp.m, hasTouch: !!vp.m }); const p = await ctx.newPage();
  await p.route('https://velani-ai.vercel.app/v1/chat', r => r.abort()); await p.route('https://velani-ai.vercel.app/v1/sessions', r => r.abort());
  const go = async path => { await p.goto(q(path), { waitUntil: 'load' }); await p.addStyleTag({ content: hide }); await p.waitForTimeout(1200); };
  await go('/pages/contact?interest=nevora-demo');
  const h1 = () => p.evaluate(() => [...document.querySelector('.cform-hero h1').children].filter(s => getComputedStyle(s).display !== 'none').map(s => s.textContent).join(''));
  ok(/Request your free NEVORA trial/.test(await h1()) && (await p.evaluate(() => Shopify.theme.id)) == T, `${tag}: hosted trial form on theme ${T}`);
  await p.fill('#inquiry-name', 'Ana Test'); await p.selectOption('#inquiry-team', { label: 'More than 30 (by quote)' }); await p.waitForTimeout(300);
  ok(/Ask for a NEVORA quote/.test(await h1()) && (await p.inputValue('#inquiry-interest')) === 'nevora' && (await p.inputValue('#inquiry-name')) === 'Ana Test', `${tag}: more than 30 switches to a quote, name kept`);
  await p.screenshot({ path: `${S}/${engine}-${vp.w}-over30.png` });
  await go('/pages/plans'); const pl = await p.evaluate(() => ({ h: [...document.querySelectorAll('h2')].some(h => h.textContent === 'Two ways the trial can end.'), n: document.querySelectorAll('.rail.r2 > *').length, ovx: document.documentElement.scrollWidth - innerWidth }));
  ok(pl.h && pl.n === 2 && pl.ovx <= 0, `${tag}: Plans shows two endings`);
  await go('/pages/products'); const pr = await p.evaluate(() => ({ links: [...document.querySelectorAll('main a')].map(a => a.textContent.trim()), desc: document.querySelector('meta[name=description]')?.content || '', title: document.title }));
  ok(pr.links.includes('Explore websites') && pr.links.includes('Explore custom apps') && pr.links.includes('Join the waitlist') && /NEVORA Relay for orders/.test(pr.desc) && /^Products/.test(pr.title), `${tag}: Products links, waitlist and description (${pr.title})`);
  await go('/pages/about');
  if (vp.m) { await p.click('#gmenu-btn'); } else { await p.hover('.gnav-ddlink'); } await p.waitForTimeout(500);
  const chip = await p.evaluate(m => [...document.querySelectorAll(m ? '#gmenu a' : '.gnav-ddmenu a')].find(x => /Rondo/.test(x.textContent))?.querySelector('.nav-soon')?.textContent, !!vp.m);
  ok(chip === 'In development', `${tag}: Rondo labelled In development in the menu`); await p.screenshot({ path: `${S}/${engine}-${vp.w}-menu.png` });
  await go('/pages/nevora'); await p.locator('[data-open-rondo]').scrollIntoViewIfNeeded(); await p.click('[data-open-rondo]'); await p.waitForTimeout(800);
  ok(await p.locator('#ast').isVisible() && /\/pages\/nevora/.test(p.url()) && /Don’t share passwords/.test(await p.locator('#ast-note').innerText()), `${tag}: Ask Rondo opens the chat; privacy line shown`);
  await ctx.close(); }
 await b.close(); }
console.log(fails ? fails + ' failed' : 'all passed'); process.exitCode = fails ? 1 : 0;
