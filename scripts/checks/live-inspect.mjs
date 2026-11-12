// Read-only inspection of the published site: every route, every link, desktop and iPhone captures, axe,
// console errors, hero motion, menus, the time clock and the contact form's live mode. Nothing is submitted or sent.
// Usage: VELANI_CHROMIUM_EXECUTABLE=/path/to/chromium node scripts/checks/live-inspect.mjs [https://www.thevelani.com]
import { chromium, devices } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { routes } from '../../src/content.mjs';
const base = (process.argv[2] || process.env.VELANI_LIVE_URL || 'https://www.thevelani.com').replace(/\/$/, '');
const out = 'evidence/' + (process.env.VELANI_BROWSER_RUN || 'live-' + new Date().toISOString().replace(/[:.]/g, '-'));
await mkdir(out, { recursive: true });
const executablePath = process.env.VELANI_CHROMIUM_EXECUTABLE || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
const results = [];
const ok = (condition, message) => { results.push({ status: condition ? 'passed' : 'failed', message }); console.log((condition ? 'PASS ' : 'FAIL ') + message); };
const name = r => r === '/' ? 'home' : r.split('/').pop();
const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const paths = Object.keys(routes);
try {
  // ---- Every route on desktop: status, one h1, axe, console errors, external hosts, captures
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const hosts = new Set(); const seen = new Map();
  for (const r of paths) {
    const p = await ctx.newPage(); const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    p.on('request', q => hosts.add(new URL(q.url()).host));
    const res = await p.goto(base + r, { waitUntil: 'networkidle', timeout: 60000 }); await p.waitForTimeout(500);
    ok(res.status() === 200 && (await p.locator('h1').count()) === 1 && (await p.locator('main').count()) === 1, `desktop ${r}: ${res.status()}, one h1, one main`);
    ok(!(await p.locator('input[name="password"]').count()), `desktop ${r}: no password page`);
    const vio = (await new AxeBuilder({ page: p }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations;
    ok(vio.length === 0, `desktop ${r}: axe ${vio.length ? vio.map(v => v.id + ':' + v.nodes.length).join(',') : 'clean'}`);
    ok(errors.length === 0, `desktop ${r}: console ${errors.length ? errors.slice(0, 3).join(' | ') : 'clean'}`);
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), `desktop ${r}: no sideways scroll`);
    for (const h of await p.$$eval('a[href]', as => as.map(a => a.getAttribute('href')))) { if (!seen.has(h)) seen.set(h, r); }
    await p.screenshot({ path: `${out}/desktop-${name(r)}.png`, fullPage: true }); await p.close();
  }
  // ---- Every link once: status and fragment
  const p0 = await ctx.newPage(); let bad = 0, checked = 0;
  for (const [h, from] of seen) {
    if (/^(mailto:|tel:|javascript:)/.test(h)) continue;
    const u = new URL(h, base + from); if (u.host !== new URL(base).host) { ok(/(^|\.)hcaptcha\.com$/.test(u.host), `external link ${h} on ${from}` + (/hcaptcha\.com$/.test(u.host) ? ' (Shopify spam-protection notice, expected)' : '')); continue; }
    const res = await p0.goto(u.href, { waitUntil: 'domcontentloaded', timeout: 60000 }); checked++; // page navigation: the request context does not use the session's proxy
    const status = res ? res.status() : 200; // a hash-only move within the open page returns no response
    const frag = !u.hash || await p0.evaluate(id => !!document.getElementById(id), decodeURIComponent(u.hash.slice(1)));
    if (status === 503 || status === 429) { await p0.waitForTimeout(1500); const again = await p0.goto(u.href, { waitUntil: 'domcontentloaded', timeout: 60000 }); if (again && again.status() === 200) { continue; } } // Shopify throttles a fast crawl; one retry
    if (status !== 200 || !frag) { bad++; ok(false, `link ${h} (from ${from}): ${status}${frag ? '' : ', fragment missing'}`); }
  }
  ok(bad === 0, `${checked} internal links checked, ${bad} broken`);
  ok([...hosts].every(h => /thevelani\.com$|shopify|shopifycdn\.com$|cloudflare/.test(h)), 'requests stay on the site, Shopify and its CDN: ' + [...hosts].join(' '));
  await ctx.close();
  // ---- Home with motion: hero drift and cue, header hides and returns, panels in order
  {
    const p = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
    await p.goto(base + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
    const anim = await p.evaluate(() => getComputedStyle(document.querySelector('#top .hph')).animationName);
    ok(anim === 'hdrift', 'home: hero image drifts (animation ' + anim + ')');
    const cue = await p.locator('.hcue').boundingBox(); ok(cue && cue.y + cue.height <= 900, 'home: scroll cue inside the first screen');
    await p.locator('.hcue').click({ force: true }); await p.waitForTimeout(1200); // the chevron bobs, so Playwright never sees it 'stable'
    const top = await p.evaluate(() => Math.round(document.getElementById('nevora').getBoundingClientRect().top)); ok(top >= 0 && top <= 120, 'home: cue scrolls to the NEVORA panel (top at ' + top + 'px; 56 once the panel scroll padding ships)');
    await p.evaluate(() => scrollTo(0, 1400)); await p.waitForTimeout(600);
    ok(await p.evaluate(() => document.getElementById('gnav').classList.contains('tuck')), 'home: header tucks away on the way down');
    await p.evaluate(() => scrollTo(0, 1300)); await p.waitForTimeout(600);
    ok(await p.evaluate(() => !document.getElementById('gnav').classList.contains('tuck')), 'home: header returns on the way up');
    await p.screenshot({ path: out + '/desktop-home-nevora-panel.png' });
    await p.context().close();
  }
  // ---- iPhone: every route captured; menus; time clock; demo request page; contact form is Shopify's live form
  {
    const ctx = await browser.newContext({ ...devices['iPhone 13'] });
    for (const r of paths) { const p = await ctx.newPage(); const res = await p.goto(base + r, { waitUntil: 'networkidle', timeout: 60000 }); await p.waitForTimeout(400);
      ok(res.status() === 200 && await p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), `phone ${r}: 200, no sideways scroll`);
      await p.screenshot({ path: `${out}/phone-${name(r)}.png`, fullPage: true }); await p.close(); }
    const p = await ctx.newPage(); const errors = []; p.on('pageerror', e => errors.push(e.message));
    await p.goto(base + '/pages/about', { waitUntil: 'networkidle' }); await p.locator('#gmenu-btn').click(); await p.waitForTimeout(400);
    ok(await p.locator('#gmenu').isVisible() && await p.locator('#gmenu').getByRole('link', { name: /Start free NEVORA demo/i }).isVisible(), 'phone: menu opens with the demo action');
    await p.screenshot({ path: out + '/phone-menu.png' }); await p.keyboard.press('Escape');
    await p.locator('#gmenu-btn').click(); await p.locator('#gmenu').getByRole('link', { name: /^Support$/i }).click(); await p.waitForURL('**/pages/help');
    ok(/8 am to 9 pm ET/.test(await p.locator('.spec.big').innerText()), 'phone: Support page shows the hours');
    await p.goto(base + '/pages/nevora', { waitUntil: 'networkidle' }); await p.waitForTimeout(600);
    await p.locator('.n-hero .hacts a[href="#try"]').tap(); await p.waitForTimeout(1200);
    for (const d of ['1', '2', '3', '4']) await p.locator(`.kio-pad [data-d="${d}"]`).tap();
    await p.locator('#kio-go').tap(); await p.waitForTimeout(500);
    ok(await p.locator('#kio-ok').isVisible() && /Demo only/.test(await p.locator('#kio-ok').innerText()), 'phone: time clock demo records a demo clock-in');
    await p.screenshot({ path: out + '/phone-nevora-timeclock.png' });
    await p.locator('#lnav-tog').tap(); await p.waitForTimeout(300); await p.screenshot({ path: out + '/phone-nevora-menu.png' }); await p.keyboard.press('Escape');
    await p.goto(base + '/pages/contact?interest=nevora-demo', { waitUntil: 'networkidle' }); await p.waitForTimeout(500);
    ok(/free NEVORA demo/i.test(await p.locator('main h1').innerText()) && (await p.locator('#inquiry-interest').inputValue()) === 'nevora-demo', 'phone: demo request page shows the demo wording with the topic preselected');
    const live = await p.locator('[data-inquiry-mode="live"]').count(); const submit = await p.locator('[data-inquiry-submit]').innerText();
    ok(live === 1 && /send inquiry/i.test(submit), 'phone: contact form is the live Shopify form (' + submit.trim() + '); not submitted');
    ok(!(await p.locator('#ast-root').count()), 'assistant stays hidden until its API address is set');
    ok(errors.length === 0, 'phone: no script errors ' + errors.join(' | '));
    await p.screenshot({ path: out + '/phone-contact-demo.png', fullPage: true });
    await ctx.close();
  }
  // ---- Scroll smoothness on an iPhone: long frames while scrolling home and NEVORA
  {
    const ctx = await browser.newContext({ ...devices['iPhone 13'] });
    for (const r of ['/', '/pages/nevora', '/pages/custom-development']) {
      const p = await ctx.newPage(); await p.goto(base + r, { waitUntil: 'networkidle' }); await p.waitForTimeout(500);
      const long = await p.evaluate(async () => { let long = 0, last = performance.now(); const tick = t => { if (t - last > 50) long++; last = t; if (!done) requestAnimationFrame(tick); }; let done = false; requestAnimationFrame(tick);
        const h = document.documentElement.scrollHeight - innerHeight; for (let y = 0; y <= h; y += 24) { scrollTo(0, y); await new Promise(r => requestAnimationFrame(r)); } done = true; return long; });
      ok(long < 15, `phone scroll ${r}: ${long} long frames (threshold 15)`);
      await p.close();
    }
    await ctx.close();
  }
} finally { await browser.close(); }
const summary = { status: results.some(r => r.status === 'failed') ? 'failed' : 'passed', passed: results.filter(r => r.status === 'passed').length, failed: results.filter(r => r.status === 'failed').length, base, results };
await writeFile(out + '/live-inspect.json', JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify({ ...summary, results: undefined, evidence: out }));
process.exit(summary.failed ? 1 : 0);
