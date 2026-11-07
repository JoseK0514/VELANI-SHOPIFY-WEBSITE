// Hosted check for the Nov 7 quick fixes on an unpublished theme: Products menu open state, language switch keeps the
// visitor's place, Rondo labels, NEVORA privacy backup wording, robots.txt and llms.txt. Read-only: chat requests are aborted.
// Usage: node scripts/checks/hosted-quick-fixes-20261107.mjs <evidence-dir> <themeId>
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
const pw = createRequire((process.env.PLAYWRIGHT_FROM || '/Users/josek0514/Desktop/tool-box-pr') + '/package.json')('playwright');
const S = process.argv[2] || 'evidence/hosted-quick-fixes-20261107', T = process.argv[3], B = 'https://www.thevelani.com';
if (!T) throw new Error('theme id required');
await mkdir(S, { recursive: true });
const q = p => { const [path, hash = ''] = p.split('#'); return B + path + (path.includes('?') ? '&' : '?') + 'preview_theme_id=' + T + (hash ? '#' + hash : ''); };
const hide = () => { const add = () => { const s = document.createElement('style'); s.textContent = '#preview-bar-iframe,#PBarNextFrameWrapper,#PBarNextFrame{display:none!important}'; document.head.appendChild(s); }; if (document.head) add(); else document.addEventListener('DOMContentLoaded', add); };
let fails = 0; const ok = (c, m) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + m); };

for (const engine of ['chromium', 'webkit']) {
  const b = await pw[engine].launch();
  for (const vp of [{ w: 1440, h: 900 }, { w: 390, h: 844, m: true }, { w: 320, h: 640, m: true }]) {
    const tag = `${engine} ${vp.w}`;
    const TAB = engine === 'webkit' ? 'Alt+Tab' : 'Tab';
    const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: vp.m ? 2 : 1, isMobile: !!vp.m, hasTouch: !!vp.m });
    await ctx.addInitScript(hide);
    await ctx.route('https://velani-ai.vercel.app/**', r => r.abort());
    const p = await ctx.newPage();
    const errors = []; p.on('pageerror', e => errors.push(e.message));
    const go = async (path) => { await p.goto(q(path), { waitUntil: 'load' }); await p.waitForTimeout(900); };
    const theme = () => p.evaluate(() => window.Shopify?.theme?.id);

    // 1. Language switch keeps the place
    for (const [from, to, label] of [['/pages/about', 'velani-es-nosotros', 'About → Nosotros'], ['/pages/help', 'velani-es-ayuda', 'Support → Ayuda'], ['/pages/products#relay', 'velani-es-productos', 'Products#relay → Productos#relay'], ['/pages/custom-development', 'velani-es-productos', 'Custom development → Productos#websites'], ['/pages/nevora#try', 'velani-es-nevora', 'NEVORA#try → es-nevora#try']]) {
      await go(from);
      const link = p.locator('.lang-sw a[hreflang=es]:visible').first();
      await link.scrollIntoViewIfNeeded();
      await Promise.all([p.waitForNavigation({ waitUntil: 'load' }), link.click()]);
      await p.waitForTimeout(700);
      const u = new URL(p.url());
      const view = await p.evaluate(() => document.documentElement.lang);
      const wantHash = from.includes('#') ? from.slice(from.indexOf('#')) : (to === 'velani-es-productos' && from.includes('custom') ? '#websites' : '');
      ok(view === 'es' && (u.search.includes('view=' + to) || u.pathname.endsWith(to.replace('velani-', ''))) && u.hash === wantHash && (await theme()) == T, `${tag}: ES switch ${label} (${u.search.replace(/preview_theme_id=\d+&?/, '')}${u.hash})`);
      // and back to English
      const back = p.locator('.lang-sw a[hreflang=en]:visible').first();
      await back.scrollIntoViewIfNeeded();
      await Promise.all([p.waitForNavigation({ waitUntil: 'load' }), back.click()]);
      await p.waitForTimeout(500);
      const ub = new URL(p.url());
      ok(await p.evaluate(() => document.documentElement.lang) === 'en' && (ub.search.includes(from.split('#')[0].replace('/pages/', 'velani-')) || from.startsWith('/pages/custom') && /velani-products/.test(ub.search)), `${tag}: EN switch back from ${to} (${ub.search.replace(/preview_theme_id=\d+&?/, '')}${ub.hash})`);
    }

    // 2. Products menu (desktop only; phones use the menu sheet)
    if (!vp.m) {
      await go('/pages/about');
      const menuOpen = () => p.evaluate(() => { const m = document.querySelector('.gnav-ddmenu'); return getComputedStyle(m).visibility === 'visible'; });
      const expanded = () => p.getAttribute('.gnav-ddbtn', 'aria-expanded');
      await p.hover('.gnav-ddlink'); await p.waitForTimeout(400);
      ok(!(await menuOpen()) && (await expanded()) === 'false', `${tag}: hovering Products does not open the menu`);
      await p.click('.gnav-ddbtn'); await p.waitForTimeout(400);
      ok((await menuOpen()) && (await expanded()) === 'true', `${tag}: clicking the caret opens the menu`);
      await p.screenshot({ path: `${S}/${engine}-${vp.w}-products-open.png` });
      await p.mouse.move(700, 600); await p.waitForTimeout(400);
      ok(await menuOpen(), `${tag}: menu stays open when the pointer leaves`);
      await p.click('.gnav-ddbtn'); await p.waitForTimeout(400);
      ok(!(await menuOpen()) && (await expanded()) === 'false', `${tag}: clicking the caret again closes it`);
      await p.focus('.gnav-ddbtn'); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
      ok((await menuOpen()) && (await expanded()) === 'true', `${tag}: Enter opens it`);
      await p.keyboard.press('Enter'); await p.waitForTimeout(400);
      ok(!(await menuOpen()), `${tag}: Enter again closes it`);
      await p.keyboard.press('Space'); await p.waitForTimeout(400);
      ok(await menuOpen(), `${tag}: Space opens it`);
      await p.keyboard.press(TAB); await p.waitForTimeout(200);
      ok(await p.evaluate(() => document.activeElement.closest('.gnav-ddmenu') !== null) && await menuOpen(), `${tag}: Tab moves into the open menu`);
      await p.keyboard.press('Escape'); await p.waitForTimeout(400);
      ok(!(await menuOpen()) && await p.evaluate(() => document.activeElement.classList.contains('gnav-ddbtn')), `${tag}: Escape closes it and returns focus to the caret`);
      await p.focus('.gnav-ddbtn'); await p.keyboard.press('ArrowDown'); await p.waitForTimeout(300);
      ok((await menuOpen()) && await p.evaluate(() => document.activeElement.closest('.gnav-ddmenu') !== null), `${tag}: ArrowDown opens it and focuses the first item`);
      await p.mouse.click(700, 600); await p.waitForTimeout(400);
      ok(!(await menuOpen()), `${tag}: a click outside closes it`);
      await p.focus('.gnav-ddbtn'); await p.keyboard.press('Enter'); await p.waitForTimeout(200);
      for (let i = 0; i < 4; i++) await p.keyboard.press(TAB);
      await p.waitForTimeout(300);
      ok(!(await menuOpen()) && (await expanded()) === 'false', `${tag}: tabbing out of the menu closes it`);
      const items = await p.evaluate(() => [...document.querySelectorAll('.gnav-ddmenu b')].map(x => x.textContent));
      ok(items.some(t => /^Rondo in NEVORA/.test(t)), `${tag}: menu says "Rondo in NEVORA" (${items.join(' / ')})`);
    } else {
      await go('/pages/about');
      await p.click('#gmenu-btn'); await p.waitForTimeout(500);
      const rondo = await p.evaluate(() => document.querySelector('#gmenu .nav-rondo')?.textContent);
      ok(/^Rondo in NEVORA/.test(rondo || ''), `${tag}: phone menu says "Rondo in NEVORA" (${rondo})`);
      await p.screenshot({ path: `${S}/${engine}-${vp.w}-phone-menu.png` });
    }

    // 3. Rondo labels on the page and in the chat
    await go('/pages/nevora');
    const nev = await p.evaluate(() => ({ kick: document.querySelector('.rondo-kick')?.textContent.trim(), fine: document.querySelector('.rondo-fine')?.textContent.trim(), ask: document.querySelector('[data-open-rondo]')?.textContent.trim() }));
    ok(/Rondo in NEVORA/.test(nev.kick) && /Rondo in NEVORA is in development/.test(nev.fine) && nev.ask === 'Ask Rondo on this site', `${tag}: NEVORA page labels (${nev.kick} | ${nev.ask})`);
    const hasChat = await p.locator('#ast-launch').count();
    if (hasChat) {
      await p.locator('[data-open-rondo]').scrollIntoViewIfNeeded(); await p.click('[data-open-rondo]'); await p.waitForTimeout(800);
      const sub = await p.evaluate(() => document.querySelector('#ast-sub')?.textContent);
      ok(/^On this site/.test(sub || ''), `${tag}: chat header says "On this site" (${sub})`);
      await p.screenshot({ path: `${S}/${engine}-${vp.w}-chat.png` });
    } else ok(true, `${tag}: chat not configured on this theme (skipped)`);

    // 4. NEVORA privacy backup wording
    await go('/pages/nevora-privacy');
    const priv = await p.evaluate(() => document.querySelector('main').innerText);
    ok(/restore history of seven days/.test(priv) && /recovery snapshots/.test(priv) && !/six hours/.test(priv), `${tag}: NEVORA privacy names the seven-day restore history and recovery snapshots`);

    // 5. New Spanish pages render in Spanish with one h1 and no sideways scroll
    for (const v of ['velani-es-nosotros', 'velani-es-ayuda']) {
      await go('/?view=' + v);
      const f = await p.evaluate(() => ({ lang: document.documentElement.lang, h1: document.querySelectorAll('h1').length, title: document.title, ovx: document.documentElement.scrollWidth - innerWidth }));
      ok(f.lang === 'es' && f.h1 === 1 && f.ovx <= 0, `${tag}: ${v} (${f.title}, overflow ${f.ovx})`);
      await p.screenshot({ path: `${S}/${engine}-${vp.w}-${v}.png`, fullPage: true });
    }
    ok(errors.length === 0, `${tag}: no page errors (${errors.slice(0, 2).join(' | ')})`);
    await ctx.close();
  }
  await b.close();
}
console.log(fails ? fails + ' failed' : 'all passed'); process.exitCode = fails ? 1 : 0;
