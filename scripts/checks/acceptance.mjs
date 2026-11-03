// Acceptance checks for the home page, the NEVORA page, the time-clock demo and the NEVORA enquiry variant.
// Runs against the local preview (npm run dev) in Chromium with mouse, touch and keyboard, and writes evidence.
// Usage: VELANI_CHROMIUM_EXECUTABLE=/path/to/chromium node scripts/checks/acceptance.mjs
import { chromium, devices } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
const base = process.env.VELANI_PREVIEW_URL || 'http://127.0.0.1:4173';
const run = process.env.VELANI_BROWSER_RUN || 'acceptance-' + new Date().toISOString().replace(/[:.]/g, '-');
const out = 'evidence/' + run;
await mkdir(out, { recursive: true });
const results = [];
const ok = (condition, message) => { results.push({ status: condition ? 'passed' : 'failed', message }); console.log((condition ? 'PASS ' : 'FAIL ') + message); };
const executablePath = process.env.VELANI_CHROMIUM_EXECUTABLE || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const pageErrors = page => { const errors = []; page.on('pageerror', e => errors.push(e.message)); return errors; };
try {
  // ---- Home: hero actions clickable with motion on and off, at laptop sizes, at the top and after a small scroll
  for (const [w, h, rm] of [[1440, 960, 'no-preference'], [1280, 800, 'no-preference'], [1440, 960, 'reduce'], [1280, 800, 'reduce']]) {
    const p = await (await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: rm })).newPage();
    for (const y of [0, 120]) {
      await p.goto(base + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(500); await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(400);
      await p.locator('.h-hero .acts a', { hasText: 'Try the time clock' }).click({ timeout: 4000 }); await p.waitForTimeout(900);
      const t = await p.evaluate(() => ({ hash: location.hash, top: Math.round(document.getElementById('try-t').getBoundingClientRect().top), hdr: Math.round(document.getElementById('gnav').getBoundingClientRect().bottom) }));
      await p.goto(base + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(500); await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(400);
      await p.locator('.h-hero .acts a', { hasText: 'See how NEVORA works' }).click({ timeout: 4000 }); await p.waitForURL('**/pages/nevora', { timeout: 4000 });
      ok(t.hash === '#try' && t.top >= Math.max(0, t.hdr), `${w}x${h} ${rm} scroll ${y}: Try → #try (heading at ${t.top}px, header bottom ${t.hdr}px); See how NEVORA works → /pages/nevora`);
    }
    await p.context().close();
  }
  // ---- Home demo on a phone: states, announcements, Spanish, focus, no leaks
  {
    const ctx = await browser.newContext({ ...devices['iPhone 13'] }); const p = await ctx.newPage(); const errs = pageErrors(p);
    const reqs = []; p.on('request', r => reqs.push(r.url()));
    await p.goto(base + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(600);
    ok(await p.locator('.h-hero .acts a', { hasText: 'Try the time clock' }).isVisible() && (await p.locator('.h-media .h-phone').boundingBox()).y < 664, 'phone opening screen: NEVORA, the action and a product screen are visible');
    await p.locator('.h-hero .acts a', { hasText: 'Try the time clock' }).tap(); await p.waitForTimeout(1200);
    const note = await p.locator('#try .kio-note').boundingBox(), pad = await p.locator('.kio-pad').boundingBox(); ok(note.y < pad.y, 'demo context shown before the keypad');
    const h0 = (await p.locator('#kio').boundingBox()).height;
    const dots = () => p.locator('#kio-dots i.on').count();
    ok((await dots()) === 0 && await p.locator('#kio-go').isDisabled(), '0 digits: Continue disabled');
    await p.locator('.kio-pad [data-d="1"]').tap(); ok((await dots()) === 1 && await p.locator('#kio-go').isDisabled(), '1 digit: Continue disabled');
    for (const d of ['2', '3']) await p.locator(`.kio-pad [data-d="${d}"]`).tap(); ok((await dots()) === 3 && await p.locator('#kio-go').isDisabled(), '3 digits: Continue disabled');
    await p.locator('.kio-pad [data-d="4"]').tap(); ok((await dots()) === 4 && !(await p.locator('#kio-go').isDisabled()), '4 digits: Continue enabled');
    await p.locator('.kio-pad [data-d="5"]').tap(); ok((await dots()) === 4, 'extra digit refused');
    await p.locator('.kio-pad [data-act="back"]').tap(); ok((await dots()) === 3 && (await p.locator('#kio-live').innerText()) === '3 of 4 digits entered', 'Delete removes one digit and announces the count');
    await p.locator('.kio-pad [data-act="clear"]').tap(); ok((await dots()) === 0 && (await p.locator('#kio-live').innerText()) === 'Cleared', 'Clear resets and announces it');
    for (const d of ['9', '0', '1', '2']) await p.locator(`.kio-pad [data-d="${d}"]`).tap();
    await p.locator('#kio-go').tap(); await p.waitForTimeout(400);
    const okText = await p.locator('#kio-ok').innerText();
    ok(/Clock-in recorded/.test(okText) && /Demo only\. No hours were saved\./.test(okText) && !/9012/.test(okText), 'confirmation: heading, demo-only line, no digits shown');
    ok(await p.evaluate(() => document.activeElement.id) === 'kio-ok-h', 'focus moves to the result heading');
    ok(Math.abs((await p.locator('#kio').boundingBox()).height - h0) < 1, 'keypad and confirmation share one height');
    await p.screenshot({ path: out + '/home-demo-confirmation.png', clip: await p.locator('#kio').boundingBox() });
    await p.waitForTimeout(9500); ok(await p.locator('#kio-ok').isVisible(), 'confirmation stays after 9.5 s (no automatic reset)');
    await p.locator('#kio-done').tap(); await p.waitForTimeout(200); await p.locator('#kio-lang').tap();
    ok((await p.locator('#kio-lang-t').innerText()) === 'English' && (await p.locator('#kio-live').innerText()) === '', 'language button offers English while Spanish is on; stale announcement cleared');
    for (const d of ['9', '0', '1', '2']) await p.locator(`.kio-pad [data-d="${d}"]`).tap(); await p.locator('#kio-go').tap(); await p.waitForTimeout(300);
    ok((await p.locator('#kio-ok-h').innerText()) === 'Tiempo registrado' && (await p.locator('#kio-done').innerText()) === 'Registrar de nuevo' && (await p.locator('#kio').getAttribute('lang')) === 'es', 'Spanish on the confirmation');
    await p.screenshot({ path: out + '/home-demo-confirmation-es.png', clip: await p.locator('#kio').boundingBox() });
    await p.locator('#kio-done').tap(); await p.waitForTimeout(300);
    ok(await p.locator('#kio-pin').isVisible() && (await dots()) === 0 && (await p.locator('#kio-pin-h').innerText()) === 'Ingresa tu PIN' && await p.evaluate(() => document.activeElement.id) === 'kio-pin-h', 'Clock in again: cleared, language kept, focus at the start');
    ok(await p.locator('.h-follow a', { hasText: 'Ask for a quote' }).isVisible(), 'enquiry action outside the panel still there');
    await p.locator('#kio-lang').tap();
    for (const d of ['1', '1', '1', '1']) await p.locator(`.kio-pad [data-d="${d}"]`).tap(); await p.locator('#kio-go').tap();
    await p.locator('.h-follow a').focus(); await p.locator('#kio-done').evaluate(el => el.click()); await p.waitForTimeout(200);
    ok(await p.evaluate(() => document.activeElement.closest('.h-follow') !== null), 'Clock in again from elsewhere does not steal focus');
    ok(reqs.filter(u => /1111|9012|1234/.test(u)).length === 0, 'no request carries entered digits');
    ok(await p.evaluate(() => localStorage.length + sessionStorage.length) === 0, 'nothing in browser storage');
    await p.locator('.kio-pad [data-d="7"]').focus(); await p.keyboard.press('Enter'); ok((await dots()) === 1, 'Enter on a focused key types that key (native button)');
    await p.keyboard.type('234'); await p.keyboard.press('Backspace'); ok((await dots()) === 3 && (await p.locator('#kio-live').innerText()) === '3 of 4 digits entered', 'typed digits and Backspace announce the count');
    await p.keyboard.press('Escape'); ok((await dots()) === 0, 'Escape clears');
    await p.locator('.h-follow a').focus(); await p.keyboard.type('5678'); ok((await dots()) === 0, 'digits typed with focus outside the demo are ignored');
    const ax = await new AxeBuilder({ page: p }).analyze(); ok(ax.violations.length === 0, 'axe on the home page: ' + (ax.violations.map(v => v.id).join(',') || 'clean'));
    ok(errs.length === 0, 'home: no script errors ' + errs.join('|'));
    // NEVORA enquiry variant
    const c = await ctx.newPage(); await c.goto(base + '/pages/contact?interest=nevora', { waitUntil: 'networkidle' }); await c.waitForTimeout(500);
    ok((await c.locator('main h1').innerText()) === 'Tell us about your shift team.' && (await c.locator('.phero .kicker').innerText()) === 'NEVORA for your team', 'NEVORA enquiry heading');
    ok(await c.locator('#inquiry-team').isVisible() && await c.locator('#inquiry-locations').isVisible() && !(await c.locator('#inquiry-interest').isVisible()) && (await c.locator('#inquiry-interest').inputValue()) === 'nevora', 'team size and locations shown; NEVORA kept without reselecting');
    const form = await c.locator('#project-inquiry').boundingBox(), aside = await c.locator('.contact-aside').boundingBox(); ok(form.y < aside.y, 'phone: form directly after the introduction, address below');
    ok(/How many people work shifts\?/.test(await c.locator('.contact-aside').innerText()), 'aside prompts speak about the team');
    await c.locator('#inquiry-name').fill('Fictional Tester'); await c.locator('#inquiry-email').fill('tester@example.com'); await c.locator('#inquiry-team').selectOption('10–24'); await c.locator('#inquiry-locations').fill('2');
    await c.locator('[data-inquiry-submit]').tap(); await c.waitForTimeout(500);
    ok(/Draft checked\. Nothing was sent\./.test(await c.locator('.form-status').innerText()), 'preview draft check passes without a message and says nothing was sent');
    await c.screenshot({ path: out + '/contact-nevora-checked.png', fullPage: true });
    const g = await ctx.newPage(); await g.goto(base + '/pages/contact', { waitUntil: 'networkidle' }); await g.waitForTimeout(400);
    ok((await g.locator('main h1').innerText()) === 'Start with the problem.' && !(await g.locator('#inquiry-team').isVisible()) && await g.locator('#inquiry-interest').isVisible(), 'general enquiry unchanged for custom projects');
    await ctx.close();
  }
  // ---- NEVORA page on a phone: one header row, menu, demo route, confirmation, Spanish, no-JS, reduced motion
  {
    const ctx = await browser.newContext({ ...devices['iPhone 13'] }); const p = await ctx.newPage(); const errs = pageErrors(p);
    await p.goto(base + '/pages/nevora', { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
    const hdr = await p.locator('#lnav').boundingBox(); ok(hdr.height >= 56 && hdr.height <= 68, 'one header row, ' + Math.round(hdr.height) + 'px tall');
    ok(!(await p.locator('#gnav').isVisible()), 'global Velani bar hidden on phones (no second row)');
    const tog = p.locator('#lnav-tog'); const tb = await tog.boundingBox(); ok(tb.width >= 44 && tb.height >= 44, 'menu button ' + Math.round(tb.width) + 'x' + Math.round(tb.height));
    await tog.focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
    ok(await p.locator('#lnav-list').isVisible() && (await tog.getAttribute('aria-expanded')) === 'true', 'menu opens from the keyboard');
    const menu = await p.evaluate(() => { const l = document.getElementById('lnav-list'); return { fits: l.scrollHeight <= l.clientHeight + 1 && l.getBoundingClientRect().bottom <= innerHeight }; });
    ok(menu.fits, 'the whole menu fits the phone screen without an inner scroll');
    ok(await p.locator('#lnav-list').getByRole('link', { name: 'Velani home' }).isVisible() && await p.locator('#lnav-list').getByText('NEVORA is a product of Velani').isVisible(), 'Velani attribution and links inside the menu');
    await p.screenshot({ path: out + '/nevora-menu.png' });
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    ok(!(await p.locator('#lnav-list').isVisible()) && await tog.evaluate(e => e === document.activeElement), 'Escape closes the menu and focus returns to the button');
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300);
    const tryBtn = p.locator('.n-hero .acts a[href="#try"]'); const bb = await tryBtn.boundingBox();
    ok(bb.y + bb.height <= 664, 'Try the time clock visible in the opening screen');
    const ph = await p.locator('.line3 figure:nth-child(2)').boundingBox(); ok(ph.y < 664, 'product screen visible in the opening screen (top at ' + Math.round(ph.y) + 'px)');
    await tryBtn.tap(); await p.waitForTimeout(1500);
    const h = await p.locator('#try-t').boundingBox(); ok(h.y >= hdr.height, 'demo heading lands below the header (' + Math.round(h.y) + 'px)');
    const note = await p.locator('.kio-note').boundingBox(), pad = await p.locator('.kio-pad').boundingBox(); ok(note.y < pad.y, 'demo notice comes before the keypad');
    const before = await p.locator('#kio').boundingBox();
    for (const d of ['1', '2', '3']) await p.locator(`.kio-pad [data-d="${d}"]`).tap();
    ok(await p.locator('#kio-go').isDisabled(), 'Continue disabled at three digits');
    await p.locator('.kio-pad [data-d="4"]').tap(); ok(!(await p.locator('#kio-go').isDisabled()), 'Continue enabled at four digits');
    const key = await p.locator('.kio-pad [data-d="5"]').boundingBox(); ok(key.height >= 44 && key.width >= 44, 'keys are at least 44px on a phone (' + Math.round(key.width) + 'x' + Math.round(key.height) + ')');
    await p.locator('#kio-go').tap(); await p.waitForTimeout(600);
    const during = await p.locator('#kio').boundingBox(); ok(Math.abs(during.height - before.height) < 1, 'demo keeps the same height on the confirmation');
    await p.waitForTimeout(9000); ok(await p.locator('#kio-ok').isVisible(), 'confirmation stays until Clock in again');
    await p.locator('#kio-done').tap(); await p.waitForTimeout(300);
    ok(await p.locator('#kio-pin').isVisible() && await p.locator('.try-acts a', { hasText: 'Ask for a quote' }).isVisible(), 'after Clock in again the quote action is still there');
    await p.locator('#kio-lang').tap(); ok((await p.locator('#kio-lang-t').innerText()) === 'English' && (await p.locator('#kio-pin-h').innerText()) === 'Ingresa tu PIN', 'Spanish on; the button now offers English');
    await p.locator('#kio-lang').tap(); ok((await p.locator('#kio-lang-t').innerText()) === 'Español', 'back to English; the button offers Español');
    ok(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) === 0, 'no sideways scroll on a phone');
    ok(errs.length === 0, 'NEVORA: no script errors ' + errs.join('|'));
    const nj = await (await browser.newContext({ ...devices['iPhone 13'], javaScriptEnabled: false })).newPage();
    await nj.goto(base + '/pages/nevora');
    ok(!(await nj.locator('.n-hero a[href="#try"]').isVisible()) && await nj.locator('.n-hero .acts .pill.line').isVisible(), 'without JavaScript the hero offers Ask for a quote instead of the demo');
    ok(await nj.locator('#gnav').isVisible() && await nj.locator('#gnav').getByRole('link', { name: 'About' }).isVisible(), 'without JavaScript the Velani header links are shown on a phone');
    await nj.screenshot({ path: out + '/nevora-nojs-phone.png' });
    const rm = await (await browser.newContext({ ...devices['iPhone 13'], reducedMotion: 'reduce' })).newPage();
    await rm.goto(base + '/pages/nevora', { waitUntil: 'networkidle' }); await rm.waitForTimeout(600);
    ok(await rm.locator('#n-t').isVisible() && await rm.locator('#kio').isVisible() && await rm.locator('.line3 figure:nth-child(2) img').isVisible(), 'reduced motion: headline, demo and product image all visible');
    await ctx.close();
  }
  // ---- Demo on desktop: local time, keyboard, screen-reader text, Spanish date, axe, no external requests
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); const errs = pageErrors(p);
    const reqs = []; p.on('request', r => { if (!r.url().startsWith(base)) reqs.push(r.url()); });
    await p.goto(base + '/pages/nevora', { waitUntil: 'networkidle' });
    await p.evaluate(() => document.getElementById('try').scrollIntoView({ block: 'start' })); await p.waitForTimeout(1500);
    const now = await p.evaluate(() => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date()));
    ok((await p.locator('#kio-hm').innerText()) + ' ' + (await p.locator('#kio-ap').innerText()) === now, 'clock shows the visitor’s local time (' + now + ')');
    ok(await p.locator('#kio-go').isDisabled(), 'desktop: Continue disabled before 4 digits');
    for (const d of ['1', '9']) await p.locator(`.kio-pad [data-d="${d}"]`).click();
    ok((await p.locator('#kio-dots i.on').count()) === 2 && (await p.locator('#kio-live').innerText()) === '2 of 4 digits entered', 'two dots after two clicks; screen reader hears progress, not digits');
    await p.locator('.kio-pad [data-d="1"]').focus(); await p.keyboard.type('7'); await p.keyboard.press('Backspace'); await p.keyboard.type('05');
    ok((await p.locator('#kio-dots i.on').count()) === 4 && !(await p.locator('#kio-go').isDisabled()), 'keyboard digits and Backspace work; Continue enabled');
    await p.keyboard.type('3'); ok((await p.locator('#kio-dots i.on').count()) === 4, 'a fifth digit is refused');
    await p.locator('#kio-go').click(); await p.waitForTimeout(700);
    ok(await p.locator('#kio-ok').isVisible() && await p.evaluate(() => document.activeElement.id) === 'kio-ok-h', 'confirmation shows and focus moves to its heading');
    await p.locator('#kio-done').click(); await p.locator('#kio-lang').click();
    ok((await p.locator('#kio-pin-h').innerText()) === 'Ingresa tu PIN' && (await p.locator('#kio').getAttribute('lang')) === 'es', 'Español switches the screen to Spanish');
    ok(/[a-záéíóúñ]/i.test(await p.locator('#kio-date').innerText()), 'date in Spanish: ' + await p.locator('#kio-date').innerText());
    await p.screenshot({ path: out + '/nevora-demo-es.png', clip: await p.locator('#kio').boundingBox() });
    await p.locator('#kio-lang').click();
    const ax = await new AxeBuilder({ page: p }).analyze(); ok(ax.violations.length === 0, 'axe on the NEVORA page: ' + (ax.violations.map(v => v.id + ':' + v.nodes.length).join(',') || 'clean'));
    ok(errs.length === 0, 'desktop demo: no script errors ' + errs.join('|')); ok(reqs.length === 0, 'no requests leave the site ' + reqs.join(' '));
    const st = await p.evaluate(() => ({ ls: localStorage.length, ss: sessionStorage.length })); ok(st.ls === 0 && st.ss === 0, 'nothing written to browser storage');
    await ctx.close();
  }
} finally { await browser.close(); }
const summary = { status: results.some(r => r.status === 'failed') ? 'failed' : 'passed', passed: results.filter(r => r.status === 'passed').length, failed: results.filter(r => r.status === 'failed').length, base, results };
await writeFile(out + '/acceptance.json', JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify({ ...summary, results: undefined, evidence: out }));
process.exit(summary.failed ? 1 : 0);
