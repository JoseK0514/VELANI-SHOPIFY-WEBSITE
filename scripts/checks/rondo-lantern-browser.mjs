// Approved vector, real browser rendering and pending-answer states; owned API fixture only.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';

const base = process.env.VELANI_PREVIEW_URL || 'http://127.0.0.1:4280';
assert.equal(new URL(base).hostname, '127.0.0.1');
const out = process.argv[2] || 'evidence/rondo-lantern';
await mkdir(out, { recursive: true });
const results = [], external = [];
for (const [engine, type] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await type.launch(engine === 'chromium' ? { executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] } : { headless: true });
  try {
    for (const lang of ['en', 'es']) for (const width of [390, 1440]) for (const reducedMotion of ['no-preference', 'reduce']) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion });
      const page = await context.newPage(), errors = [];
      page.on('pageerror', error => errors.push(error.message));
      let answer, posts = 0;
      await context.route('**/*', async route => {
        const request = route.request(), url = new URL(request.url());
        if (url.origin !== base) { external.push(url.hostname); return route.abort(); }
        if (url.pathname === '/__lantern_fixture__/v1/config') return route.fulfill({ json: { assistantName: 'Rondo', requireCaptcha: false } });
        if (url.pathname === '/__lantern_fixture__/v1/sessions') return route.fulfill({ json: { sessionToken: 'fictional-session', sessionId: 'fictional', expiresAt: '2099-01-01T00:00:00Z' } });
        if (url.pathname === '/__lantern_fixture__/v1/chat') { posts++; await new Promise(resolve => { answer = async () => { await route.fulfill({ json: { message: 'Fictional Lantern answer', sources: [] } }); resolve(); }; }); return; }
        assert.ok(['GET', 'HEAD'].includes(request.method()), 'No real delivery');
        return route.continue();
      });
      try {
        await page.goto(base + (lang === 'es' ? '/pages/es-nevora' : '/pages/nevora'));
        const examples = page.locator('#rondo .rmark');
        assert.equal(await examples.count(), 2);
        for (const mark of await examples.all()) {
          assert.equal(await mark.getAttribute('aria-hidden'), 'true');
          assert.equal(await mark.innerText(), '');
          assert.equal(await mark.locator('svg').getAttribute('focusable'), 'false');
        }
        await examples.first().scrollIntoViewIfNeeded();
        await page.screenshot({ path: `${out}/${engine}-${lang}-${width}-${reducedMotion}-example.png` });
        // On phones the launcher intentionally steps aside over forms and interactive demos.
        // Use the About reading area to exercise its visible state without overriding that behavior.
        const chatPath = width < 600 ? (lang === 'es' ? '/pages/es-nosotros' : '/pages/about') : (lang === 'es' ? '/pages/es-contacto' : '/pages/contact');
        await page.goto(base + chatPath);
        if (width < 600) await page.evaluate(() => scrollTo(0, innerHeight * .7));
        await page.locator('#ast-launch').click({ timeout: 15000 });
        await page.locator('#ast-in:not([disabled])').waitFor();
        const header = page.locator('.ast-head .rmark');
        assert.equal(await header.locator('svg').getAttribute('viewBox'), '0 0 48 48');
        assert.equal(await header.innerText(), '');
        await page.locator('#ast-in').fill('Fictional Lantern question');
        await page.locator('#ast-send').click();
        await page.locator('.ast-wait .is-thinking').waitFor();
        await page.waitForFunction(() => document.querySelector('.ast-wait')?.textContent.includes(document.documentElement.lang === 'es' ? 'pensando' : 'thinking'));
        const animation = await page.locator('.ast-wait .rmark-orbit').evaluate(el => getComputedStyle(el).animationName);
        assert.equal(animation, reducedMotion === 'reduce' ? 'none' : 'rondo-lantern-orbit');
        assert.equal(await page.locator('.ast-wait').getAttribute('role'), 'status');
        await page.screenshot({ path: `${out}/${engine}-${lang}-${width}-${reducedMotion}-pending.png` });
        assert.equal(typeof answer, 'function'); await answer(); answer = null;
        await page.getByText('Fictional Lantern answer', { exact: true }).waitFor();
        assert.equal(await page.locator('.ast-wait').count(), 0);
        assert.equal(await page.locator('.ast-who .rmark').getAttribute('aria-hidden'), 'true');
        assert.equal(posts, 1);
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#ast-launch').evaluate(el => el === document.activeElement), true);
        assert.deepEqual(errors, []);
        results.push({ engine, lang, width, reducedMotion, result: 'PASS', animation, posts });
      } catch (error) { results.push({ engine, lang, width, reducedMotion, result: 'FAIL', error: error.message }); }
      finally { console.log(JSON.stringify(results.at(-1))); if (answer) await answer().catch(() => {}); await context.close(); }
    }
  } finally { await browser.close(); }
}
const report = { passed: results.filter(r => r.result === 'PASS').length, failed: results.filter(r => r.result === 'FAIL').length, externalRequests: external, results };
await writeFile(out + '/report.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
if (report.failed || external.length) process.exitCode = 1;
