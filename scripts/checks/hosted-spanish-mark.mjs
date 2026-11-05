// Hosted pass for the Spanish pages and the round Rondo mark on an unpublished theme (2026-11-05).
// Read-only against the store preview: no chat is sent (sessions and chat requests are aborted), the contact form is in preview mode.
// Usage: node scripts/checks/hosted-spanish-mark.mjs <evidence-dir> [themeId]
// LIVE=1 checks the published site instead: real /pages/es… addresses, links must NOT carry preview_theme_id, the live form is read but never submitted.
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
const pw = createRequire((process.env.PLAYWRIGHT_FROM || '/Users/josek0514/Desktop/tool-box-pr') + '/package.json')('playwright');
const S = process.argv[2] || 'evidence/hosted-spanish-mark', T = process.argv[3] || '193112473914', B = 'https://www.thevelani.com';
await mkdir(S, { recursive: true });
const LIVE = !!process.env.LIVE;
const q = p => LIVE ? B + p : B + p + (p.includes('?') ? '&' : '?') + 'preview_theme_id=' + T;
const ESP = { 'velani-es': '/pages/es', 'velani-es-nevora': '/pages/es-nevora', 'velani-es-productos': '/pages/es-productos', 'velani-es-planes': '/pages/es-planes', 'velani-es-contacto': '/pages/es-contacto' };
const esUrl = v => LIVE ? ESP[v] : '/?view=' + v;
const hide = '#preview-bar-iframe,#PBarNextFrameWrapper{display:none!important}';
let fails = 0; const ok = (c, m) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + m); };
const EN = ['/', '/pages/products', '/pages/custom-development', '/pages/nevora', '/pages/about', '/pages/plans', '/pages/contact', '/pages/help'];
const ES = ['velani-es', 'velani-es-nevora', 'velani-es-productos', 'velani-es-planes', 'velani-es-contacto'].map(esUrl);
const pageFacts = LIVE => {
 const vw = innerWidth, bad = [];
 for (const el of document.querySelectorAll('main *, header *, footer *')) {
  const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') continue;
  if (el.closest('[hidden],.gmenu:not(.open),#gmenu:not(.open),[inert],.ast-root,.hscroll,.rail,.marquee,[data-scroll-x]')) continue;
  const r = el.getBoundingClientRect(); if (r.width && (r.right > vw + 1 || r.left < -1)) { let p = el.parentElement, clipped = false; while (p && p !== document.body) { const s = getComputedStyle(p); if (/hidden|clip|auto|scroll/.test(s.overflowX)) { clipped = true; break; } p = p.parentElement; } if (!clipped) bad.push((el.className && String(el.className).split(' ')[0]) || el.tagName); }
 }
 const links = [...document.querySelectorAll('header a[href], footer a[href], main a[href]')].map(a => a.getAttribute('href'));
 const internal = links.filter(h => h && !h.startsWith('#') && !/^(mailto|tel):/.test(h) && (h.startsWith('/') || h.includes('thevelani.com')) && !/\/cdn\/|\/policies\//.test(h));
 const leaks = internal.filter(h => LIVE ? /preview_theme_id=|[?&]view=/.test(h) : !/preview_theme_id=/.test(h));
 const marks = [...document.querySelectorAll('b.rmark')].map(m => { const r = m.getBoundingClientRect(), cs = getComputedStyle(m); return { w: Math.round(r.width), h: Math.round(r.height), round: cs.borderRadius, svg: !!m.querySelector('svg'), shown: r.width > 0 }; });
 const panels = []; for (const panel of document.querySelectorAll('.hpanel')) { const vis = [...panel.querySelectorAll('.hshot,.hwin,.hchat,.rcard,.hduo,.hweb')].filter(v => { const s = getComputedStyle(v), r = v.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0; }); const txt = [...panel.querySelectorAll('.hcopy h1,.hcopy h2,.hcopy p,.hcopy a')].filter(t => t.getBoundingClientRect().width > 0); for (const v of vis) { const a = v.getBoundingClientRect(); for (const t of txt) { const r = t.getBoundingClientRect(); if (Math.min(a.right, r.right) - Math.max(a.left, r.left) > 4 && Math.min(a.bottom, r.bottom) - Math.max(a.top, r.top) > 4) panels.push(panel.id + ':' + v.className.split(' ')[0]); } } }
 // Text that pokes out of the card or pill it sits in (caught the Spanish chat header at 1024)
 const isCard = e => { const s = getComputedStyle(e); return parseFloat(s.borderTopLeftRadius) > 0 && (s.backgroundColor !== 'rgba(0, 0, 0, 0)' || s.backgroundImage !== 'none' || parseFloat(s.borderTopWidth) > 0 || s.boxShadow !== 'none') && !/^(B|I|SVG)$/i.test(e.tagName) && !e.classList.contains('rmark'); };
 const spill = [];
 for (const t of document.querySelectorAll('main *, header *, footer *')) {
  if (![...t.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
  const cs = getComputedStyle(t); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < .05 || t.closest('[hidden],[inert]')) continue;
  let c = t.parentElement; while (c && c !== document.body && !isCard(c)) c = c.parentElement; if (!c || c === document.body) continue;
  const a = t.getBoundingClientRect(), r = c.getBoundingClientRect(); if (!a.width) continue;
  if (a.right > r.right + 1 || a.left < r.left - 1 || (a.bottom > r.bottom + 1 && getComputedStyle(c).overflowY === 'visible')) spill.push((c.className && String(c.className).split(' ')[0]) + '>' + t.textContent.trim().slice(0, 18));
 }
 const alt = Object.fromEntries([...document.querySelectorAll('link[rel=alternate][hreflang]')].map(l => [l.hreflang, l.href]));
 return { lang: document.documentElement.lang, theme: String(Shopify.theme.id), role: Shopify.theme.role, ovx: document.documentElement.scrollWidth - vw, bad: [...new Set(bad)].slice(0, 6), spill: [...new Set(spill)].slice(0, 6), leaks: [...new Set(leaks)].slice(0, 6), marks, panels, alt, h1: document.querySelector('h1')?.innerText.trim(), es: document.querySelector('header a[hreflang=es]')?.getAttribute('href'), en: document.querySelector('header a[hreflang=en]')?.getAttribute('href'), launch: !!document.querySelector('.ast-launch .rmark') };
};
for (const engine of ['chromium', 'webkit']) { const b = await pw[engine].launch();
 for (const vp of (process.env.VPS ? JSON.parse(process.env.VPS) : [{ w: 1440, h: 900 }, { w: 1180, h: 820 }, { w: 1024, h: 768 }, { w: 834, h: 1112 }, { w: 390, h: 844, m: true }, { w: 320, h: 640, m: true }])) { const tag = engine + ' ' + vp.w;
  const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: vp.m ? 2 : 1, isMobile: !!vp.m, hasTouch: !!vp.m, reducedMotion: 'reduce' });
  await ctx.route('https://velani-ai.vercel.app/v1/chat', r => r.abort()); await ctx.route('https://velani-ai.vercel.app/v1/sessions', r => r.abort());
  await ctx.addInitScript(css => { const add = () => { const st = document.createElement('style'); st.textContent = css; document.documentElement.appendChild(st); }; if (document.documentElement) add(); else document.addEventListener('DOMContentLoaded', add); }, hide);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => { if (!/\/api\/event\/collect/.test(e.message)) errs.push(e.message); }); // Shopify's own analytics beacon: WebKit reports it as an access-control error when a navigation cancels it (not theme code)
  const go = async path => { const r = await p.goto(q(path), { waitUntil: 'load' }); await p.addStyleTag({ content: hide }); await p.waitForTimeout(900); return r.status(); };
  for (const path of (process.env.ONLY_FLOWS ? [] : [...EN, ...ES])) { const isEs = /velani-es|\/pages\/es/.test(path); errs.length = 0;
   const st = await go(path); const f = await p.evaluate(pageFacts, LIVE);
   const label = `${tag} ${path}`;
   ok(st === 200 && f.theme === T && (LIVE ? f.role === 'main' : f.role !== 'main'), `${label}: 200 on theme ${T} (${f.role})`);
   ok(f.lang === (isEs ? 'es' : 'en'), `${label}: lang=${f.lang}`);
   ok(f.ovx <= 0 && f.bad.length === 0, `${label}: no sideways overflow (${f.ovx}px; ${f.bad.join(', ') || 'none'})`);
   ok(f.spill.length === 0, `${label}: text stays inside its card (${f.spill.join(', ') || 'none'})`);
   ok(f.panels.length === 0, `${label}: no text over visuals (${f.panels.join(', ') || 'none'})`);
   ok(f.leaks.length === 0, `${label}: every internal link ${LIVE ? 'is a clean live address' : 'stays on the preview'} (${f.leaks.join(' ') || 'none'})`);
   ok(f.marks.length > 0 && f.marks.every(m => !m.shown || (m.w === m.h && m.round === '50%' && m.svg)), `${label}: Rondo marks round with ring (${f.marks.filter(m => m.shown).map(m => m.w).join('/')})`);
   ok(f.launch, `${label}: chat launcher carries the mark`);
   ok(errs.length === 0, `${label}: no script errors (${errs.slice(0, 2).join(' | ') || 'none'})`);
   if (isEs || ['/', '/pages/nevora', '/pages/plans', '/pages/products', '/pages/contact'].includes(path)) ok(/thevelani\.com/.test(f.alt.en || '') && /thevelani\.com\/pages\/es/.test(f.alt.es || '') && !!f.alt['x-default'], `${label}: hreflang en/es/x-default`);
   if (engine === 'chromium' && [1440, 1024, 390].includes(vp.w)) await p.screenshot({ path: `${S}/${engine}-${vp.w}${path.replace(/[/?=]/g, '_')}.png`, fullPage: true });
  }
  // Language switch round trip from the header (desktop) or the menu (phone)
  const sw = async lang => { const pick = () => p.locator(`header a[hreflang=${lang}], .lnav a[hreflang=${lang}], #gmenu a[hreflang=${lang}]`).filter({ visible: true, hasText: new RegExp('^' + lang.toUpperCase() + '$') }).first();
   if (!(await pick().count())) { const t = p.locator('#gmenu-btn, #lnav-tog').filter({ visible: true }).first(); await t.click(); await p.waitForTimeout(500); }
   await pick().click(); await p.waitForLoadState('load'); await p.addStyleTag({ content: hide }); await p.waitForTimeout(700); return p.evaluate(() => ({ lang: document.documentElement.lang, theme: String(Shopify.theme.id), view: new URL(location.href).searchParams.get('view') || location.pathname })); };
  for (const [en, es] of [['/pages/nevora', 'velani-es-nevora'], ['/pages/plans', 'velani-es-planes'], ['/', 'velani-es']]) {
   await go(en); const a = await sw('es'); const back = await sw('en');
   ok(a.lang === 'es' && a.view === (LIVE ? ESP[es] : es) && a.theme === T && back.lang === 'en' && back.theme === T, `${tag}: ${en} → ES (${a.view}) → EN (${back.view || 'home'})`);
  }
  // Spanish NEVORA local menu and logo (the bug Jose found in English)
  await go(esUrl('velani-es-nevora'));
  const tog = p.locator('#lnav-tog');
  if (await tog.isVisible().catch(() => false)) { await tog.click(); await p.waitForTimeout(400); const link = p.locator('#lnav-list a[href^="#"]').filter({ visible: true }).first(); await link.click(); await p.waitForTimeout(1600);
   const st = await p.evaluate(() => ({ inert: [...document.querySelectorAll('[inert]')].map(e => e.id || e.className).slice(0, 3), open: document.querySelector('.lnav')?.classList.contains('open') }));
   ok(st.inert.length === 0 && !st.open, `${tag}: Spanish NEVORA menu closes and frees the page (${st.inert.join(',') || 'nothing inert'})`); }
  else ok(true, `${tag}: Spanish NEVORA menu is inline at this width`);
  { const home = () => p.locator('a').filter({ visible: true, hasText: /^Inicio de Velani$/ }).first();
    if (!(await home().count()) && await p.locator('#lnav-vbtn').isVisible()) { await p.click('#lnav-vbtn'); await p.waitForTimeout(400); }
    if (!(await home().count())) { await p.click('#lnav-tog'); await p.waitForTimeout(500); }
    await home().click(); await p.waitForLoadState('load'); await p.waitForTimeout(600); }
  ok(await p.evaluate(() => document.documentElement.lang === 'es' && (new URL(location.href).searchParams.get('view') === 'velani-es' || location.pathname === '/pages/es')), `${tag}: Spanish NEVORA “Inicio de Velani” goes to the Spanish home`);
  // Phone menu opens and closes with Escape
  if (vp.m) { await p.addStyleTag({ content: hide }); await p.click('#gmenu-btn'); await p.waitForTimeout(400); const o = await p.locator('#gmenu').isVisible(); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
   ok(o && (await p.getAttribute('#gmenu-btn', 'aria-expanded')) === 'false', `${tag}: Spanish menu opens and Escape closes it`); await p.screenshot({ path: `${S}/${engine}-${vp.w}-es-home-top.png` }); }
  // Chat panel: mark sizes, Spanish labels on the Spanish home
  if (vp.m) { await p.evaluate(() => scrollTo(0, innerHeight * 1.3)); await p.waitForTimeout(900); } // the phone launcher stays off the first screen by design
  await p.locator('.ast-launch').click(); await p.waitForTimeout(900);
  const ch = await p.evaluate(() => { const m = s => { const e = document.querySelector(s); if (!e) return 0; const r = e.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height); }; return { open: !!document.querySelector('#ast:not([hidden])'), head: m('.ast-head .rmark'), lang: document.querySelector('#ast')?.closest('[lang]')?.lang, note: document.querySelector('#ast-note')?.innerText || '' }; });
  ok(ch.open && ch.head === '32x32', `${tag}: chat opens on the Spanish home; header mark ${ch.head}`);
  await p.screenshot({ path: `${S}/${engine}-${vp.w}-chat-open.png` }); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  // Spanish contact form, preview mode: sends nothing, shows the sent panel in Spanish
  await go(esUrl('velani-es-contacto'));
  const form = await p.evaluate(() => ({ prev: /no env[ií]a nada|vista previa/i.test(document.querySelector('main').innerText), labels: [...document.querySelectorAll('main label')].map(l => l.innerText.trim()).filter(Boolean).slice(0, 6) }));
  ok((LIVE ? !form.prev : form.prev) && form.labels.length >= 3 && !form.labels.some(l => /^(Name|Email|Message)$/.test(l)), `${tag}: Spanish form labels, ${LIVE ? 'live form (not submitted)' : 'preview notice'} (${form.labels.join(' · ')})`);
  await ctx.close(); }
 await b.close(); }
console.log(fails ? fails + ' failed' : 'all passed'); process.exitCode = fails ? 1 : 0;
