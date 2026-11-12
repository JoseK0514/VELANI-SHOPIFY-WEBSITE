import { createRequire } from 'node:module';
const pw = createRequire('/Users/josek0514/Desktop/tool-box-pr/package.json')('playwright');
const S = process.argv[2], T = '193109852474'; let total = 0;
for (const engine of ['chromium', 'webkit']) { const b = await pw[engine].launch();
 for (const w of [834, 1024, 1180, 1440]) { const p = await b.newPage({ viewport: { width: w, height: w < 1000 ? 1112 : 800 } });
  await p.route('https://velani-ai.vercel.app/v1/**', r => r.abort());
  for (const path of ['/', '/pages/products', '/pages/custom-development', '/pages/nevora', '/pages/about', '/pages/plans']) {
   await p.goto('https://www.thevelani.com' + path + '?preview_theme_id=' + T, { waitUntil: 'load' }); await p.addStyleTag({ content: '#preview-bar-iframe,#PBarNextFrameWrapper{display:none!important}' }); await p.waitForTimeout(1000);
   const hits = await p.evaluate(async () => { const out = []; for (const panel of document.querySelectorAll('.hpanel')) { panel.scrollIntoView(); await new Promise(r => setTimeout(r, 600));
     const vis = [...panel.querySelectorAll('.hshot,.hwin,.hchat,.rcard,.hduo,.hweb')].filter(v => getComputedStyle(v).display !== 'none' && v.getBoundingClientRect().width);
     for (const t of panel.querySelectorAll('.hcopy h1,.hcopy h2,.hcopy p,.hcopy a')) for (const v of vis) { if (v.contains(t)) continue; const a = t.getBoundingClientRect(), c = v.getBoundingClientRect(); if (Math.min(a.right, c.right) - Math.max(a.left, c.left) > 4 && Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top) > 4) out.push(t.textContent.trim().slice(0, 25)); } } return out; });
   total += hits.length; if (hits.length) console.log('OVERLAP', engine, w, path, hits.join(' | '));
   if ((w === 834 || w === 1024) && engine === 'chromium' && ['/pages/products', '/pages/custom-development'].includes(path)) { const sec = path.includes('products') ? '#relay' : '#web-applications'; await p.locator(sec).scrollIntoViewIfNeeded().catch(() => {}); await p.waitForTimeout(900); await p.screenshot({ path: `${S}/${w}${path.replace(/\//g, '_')}.png` }); }
  } await p.close(); }
 await b.close(); }
console.log(total ? total + ' overlaps' : 'no overlaps on hosted preview');
