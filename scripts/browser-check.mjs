import { chromium, firefox, webkit } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { routes } from '../src/content.mjs';
const base = process.env.VELANI_PREVIEW_URL || 'http://127.0.0.1:4173';
const run = process.env.VELANI_BROWSER_RUN || 'browser-' + new Date().toISOString().replace(/[:.]/g, '-');
const engines = (process.env.VELANI_ENGINES || 'chromium').split(',');
const out = 'evidence/' + run;
await mkdir('evidence', { recursive: true });
await mkdir(out);
const results = [], screenshots = [], runtimeErrors = [], captureDiagnostics = [], externalRequests = [], posts = [];
let activeCapture = null;
async function capture(page, options) {
  activeCapture = options.path;
  try { await page.screenshot({ ...options, caret: 'initial' }); }
  finally { activeCapture = null; }
}
function expect(value, message) { if (!value) throw new Error(message); }
async function check(name, fn) {
  try { const detail = await fn(); results.push({ name, status: 'passed', detail }); }
  catch (error) { results.push({ name, status: 'failed', error: error.message }); }
}
for (const engine of engines) {
  const type = { chromium, firefox, webkit }[engine];
  let browser;
  try {
    const executablePath = process.env.VELANI_CHROMIUM_EXECUTABLE || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
    browser = await type.launch(engine === 'chromium' ? { executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] } : { headless: true });
  }
  catch (error) { results.push({ name: engine + ' launch', status: 'blocked', error: error.message }); continue; }
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    if (request.method() !== 'GET' && request.method() !== 'HEAD') { posts.push({ engine, method: request.method(), path: url.pathname }); await route.abort(); return; }
    if (!['127.0.0.1', 'localhost'].includes(url.hostname)) { externalRequests.push({ engine, host: url.hostname }); await route.abort(); return; }
    await route.continue();
  });
  const page = await context.newPage();
  page.on('pageerror', error => runtimeErrors.push({ engine, message: error.message }));
  page.on('console', message => {
    if (message.type() !== 'error') return;
    // WebKit's Playwright screenshotter injects `body {}` to sync animations.
    // The site's CSP correctly rejects this driver-created inline stylesheet.
    // Keep the diagnostic and its exact capture; do not weaken the site's CSP.
    if (engine === 'webkit' && activeCapture && message.text() === "Refused to apply a stylesheet because its hash, its nonce, or 'unsafe-inline' does not appear in the style-src directive of the Content Security Policy.") {
      captureDiagnostics.push({ engine, capture: activeCapture, message: message.text(), source: 'Playwright screenshotter inPagePrepareForScreenshots syncAnimations; see webkit-screenshot-csp-attribution.json' });
    } else runtimeErrors.push({ engine, message: message.text() });
  });
  for (const width of [320, 390, 768, 969, 1440, 1920]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await check(engine + ' home geometry ' + width, async () => {
      const response = await page.goto(base, { waitUntil: 'networkidle' }); await page.evaluate(() => document.fonts.ready);
      expect(response.status() === 200, 'Home did not return 200');
      const geometry = await page.evaluate(() => { const h = document.querySelector('h1'), style = getComputedStyle(h); return { width: innerWidth, client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth, lines: h.getBoundingClientRect().height / parseFloat(style.lineHeight) }; });
      expect(geometry.scroll <= geometry.client + 1, 'Horizontal overflow');
      if (width === 969) expect(geometry.lines < 2.2, 'Approved desktop headline must keep its two lines');
      if (width >= 969) expect(!await page.locator('#gmenu-btn').isVisible(), 'Mobile menu appears on desktop');
      expect(await page.locator('.status, .hkick').filter({ hasText: 'In development' }).first().isVisible(), 'Product development status missing');
      const covered = await page.evaluate(() => [...document.querySelectorAll('main a, main button')].filter(el => { const b = el.getBoundingClientRect(); return b.width && b.top >= 0 && b.bottom <= innerHeight }).filter(el => { const b = el.getBoundingClientRect(); return !el.contains(document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)) }).map(el => el.textContent.trim()));
      expect(covered.length === 0, 'Visible links covered by another layer: ' + covered.join(', '));
      return geometry;
    });
    const shot = out + '/' + engine + '-home-' + width + '.png';
    await capture(page, { path: shot, fullPage: true }); screenshots.push(shot);
  }
  for (const width of engine === 'chromium' ? [390, 1440] : [390]) {
    await page.setViewportSize({ width, height: 980 });
    for (const route of Object.keys(routes)) await check(engine + ' route/a11y ' + width + ' ' + route, async () => {
      const response = await page.goto(base + route, { waitUntil: 'networkidle' });
      expect(response.status() === 200, 'Route did not return 200');
      expect(await page.locator('h1').count() === 1, 'Heading count is not one');
      expect(await page.locator('main').count() === 1, 'Main landmark count is not one');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), 'Horizontal overflow');
      const violations = (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations;
      expect(violations.length === 0, JSON.stringify(violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }))));
      return { axeViolations: violations.length };
    });
  }
  // With motion on (most visitors): nothing may cover the hero's links at common laptop sizes
  const motion = await browser.newContext(); const motionPage = await motion.newPage();
  for (const [w, h] of [[1440, 900], [1366, 768], [1280, 720]]) {
    await motionPage.setViewportSize({ width: w, height: h });
    await check(engine + ' home links clickable with motion ' + w + 'x' + h, async () => {
      await motionPage.goto(base, { waitUntil: 'networkidle' }); await motionPage.waitForTimeout(600);
      const covered = await motionPage.evaluate(() => [...document.querySelectorAll('main a, main button')].filter(el => { const b = el.getBoundingClientRect(); return b.width && b.top >= 0 && b.bottom <= innerHeight }).filter(el => { const b = el.getBoundingClientRect(); return !el.contains(document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)) }).map(el => el.textContent.trim()));
      expect(covered.length === 0, 'Visible links covered by another layer: ' + covered.join(', '));
    });
  }
  await motion.close();
  await page.setViewportSize({ width: 390, height: 844 });
  await check(engine + ' mobile menu and keyboard return', async () => {
    await page.goto(base);
    const button = page.locator('#gmenu-btn');
    await button.click(); expect(await button.getAttribute('aria-expanded') === 'true', 'Menu did not open');
    await page.keyboard.press('Escape'); expect(await button.getAttribute('aria-expanded') === 'false', 'Escape did not close menu');
    expect(await button.evaluate(el => el === document.activeElement), 'Menu focus not restored');
    await button.click(); await page.locator('#gmenu').getByRole('link', { name: 'Custom apps', exact: true }).first().click();
    await page.waitForURL('**/pages/custom-development');
    expect((await page.locator('h1').innerText()).includes('Software for the work'), 'Wrong service destination');
  });
  await check(engine + ' inquiry validation and no delivery', async () => {
    await page.goto(base + '/pages/contact?interest=nevora');
    expect(await page.locator('#inquiry-interest').inputValue() === 'nevora', 'Known topic not selected');
    await page.getByRole('button', { name: 'Check draft inquiry' }).click();
    expect(await page.locator('#inquiry-name').getAttribute('aria-invalid') === 'true', 'Missing name accepted');
    expect(await page.locator('#inquiry-name').evaluate(el => el === document.activeElement), 'Invalid-field focus missing');
    await page.locator('#inquiry-name').fill('José Example');
    await page.locator('#inquiry-email').fill('example@example.com');
    await page.locator('#inquiry-message').fill('<img src=x onerror=alert(1)> A fictional project inquiry.');
    await page.getByRole('button', { name: 'Check draft inquiry' }).click();
    await page.locator('.form-status').filter({ hasText: 'Nothing was sent' }).waitFor();
    expect(await page.locator('[onerror]').count() === 0, 'User input became HTML');
    expect(await page.evaluate(() => [localStorage, sessionStorage].every(storage => !Object.values(storage).some(value => value.includes('José Example') || value.includes('fictional project inquiry')))), 'Personal form data persisted');
    const shot = out + '/' + engine + '-contact-390.png'; await capture(page, { path: shot, fullPage: true }); screenshots.push(shot);
  });
  await check(engine + ' cookie choices, rejection, saved state and focus', async () => {
    await page.goto(base + '/pages/cookies');
    const opener = page.getByRole('button', { name: 'Open cookie choices' });
    await opener.click();
    await page.getByText('Local website preview:', { exact: false }).waitFor();
    await page.getByRole('button', { name: 'Accept all optional', exact: true }).click();
    await page.getByText('Preview choices updated for this page.', { exact: true }).waitFor();
    expect(await page.locator('[data-consent="analytics"]').isChecked(), 'Explicit accept not reflected');
    await page.getByRole('button', { name: 'Reject all optional', exact: true }).click();
    expect(!await page.locator('[data-consent="analytics"]').isChecked(), 'Reject did not clear analytics');
    const violations = (await new AxeBuilder({ page }).analyze()).violations;
    expect(violations.length === 0, 'Dialog accessibility: ' + JSON.stringify(violations.map(v => v.id)));
    const shot = out + '/' + engine + '-cookie-390.png'; await capture(page, { path: shot, fullPage: true }); screenshots.push(shot);
    await page.keyboard.press('Escape');
    expect(await opener.evaluate(el => el === document.activeElement), 'Dialog focus not restored');
  });
  await check(engine + ' unknown interest cannot become markup', async () => {
    await page.goto(base + '/pages/contact?interest=%3Cimg%20src=x%20onerror=alert(1)%3E');
    expect(await page.locator('#inquiry-interest').inputValue() === '', 'Unexpected query accepted');
    expect(await page.locator('[onerror]').count() === 0, 'Query became HTML');
  });
  await check(engine + ' all internal links and fragments', async () => {
    const checked = new Set();
    for (const route of Object.keys(routes)) {
      await page.goto(base + route);
      const links = await page.locator('a[href]').evaluateAll(items => items.map(a => a.getAttribute('href')));
      for (const href of links) {
        if (!href.startsWith('/') && !href.startsWith('#')) continue;
        const url = new URL(href, base + route), key = url.pathname + url.hash;
        if (checked.has(key)) continue; checked.add(key);
        const response = await context.request.get(url.href);
        expect(response.status() === 200, 'Broken link ' + key);
        if (url.hash) {
          const html = await response.text();
          expect(html.includes('id="' + decodeURIComponent(url.hash.slice(1)) + '"'), 'Missing fragment ' + key);
        }
      }
    }
    const missing = await context.request.get(base + '/a-page-that-does-not-exist');
    expect(missing.status() === 404, 'Soft 404');
    const rejectedPost = await context.request.post(base + '/?velani_preview_inquiry=1', { data: 'fictional' });
    expect(rejectedPost.status() === 405, 'Preview server accepted a form POST');
    return { links: checked.size };
  });
  await context.close();
  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const noJsPage = await noJs.newPage();
  await check(engine + ' no-JavaScript navigation and no unsafe inquiry', async () => {
    await noJsPage.goto(base + '/pages/contact');
    expect(await noJsPage.locator('header').getByRole('link', { name: 'NEVORA', exact: true }).isVisible(), 'No-JS navigation hidden');
    expect(await noJsPage.locator('[data-inquiry-submit]').isDisabled(), 'No-JS preview could submit personal information');
  });
  await noJs.close(); await browser.close();
}
if (runtimeErrors.length) results.push({ name: 'unexpected browser runtime errors', status: 'failed', errors: runtimeErrors });
if (posts.length) results.push({ name: 'unexpected browser POSTs', status: 'failed', posts });
if (externalRequests.length) results.push({ name: 'unexpected external requests', status: 'failed', requests: externalRequests });
const summary = { status: results.every(r => r.status === 'passed') ? 'passed' : 'failed', passed: results.filter(r => r.status === 'passed').length, failed: results.filter(r => r.status === 'failed').length, blocked: results.filter(r => r.status === 'blocked').length, results, screenshots, runtimeErrors, captureDiagnostics, posts, externalRequests, scope: 'Actual local browser and compiled site; no hosted Shopify, live email or publication acceptance' };
await writeFile(out + '/report.json', JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ ...summary, results: summary.results.filter(r => r.status !== 'passed'), screenshots: summary.screenshots.length }, null, 2));
if (summary.status !== 'passed') process.exitCode = 1;

