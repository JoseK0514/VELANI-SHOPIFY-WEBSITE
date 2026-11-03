import { chromium, firefox, webkit } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
const run = process.env.VELANI_PRIVACY_RUN || 'privacy-regression-' + new Date().toISOString().replace(/[:.]/g, '-');
const out = 'evidence/' + run;
await mkdir('evidence', { recursive: true });
await mkdir(out);
let browser, engine;
const results = [];
const expect = (condition, message) => { if (!condition) throw new Error(message); };
async function check(name, fn) {
  try { results.push({ engine, name, status: 'passed', detail: await fn() }); }
  catch (error) { results.push({ engine, name, status: 'failed', error: error.message }); }
}
async function fixture({ delayedRead = false, javaScriptEnabled = true } = {}) {
  const context = await browser.newContext({ javaScriptEnabled, viewport: { width: 390, height: 844 } });
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.hostname !== '127.0.0.1' || request.method() !== 'GET') throw new Error('Unexpected fixture request');
    if (url.pathname === '/pages/cookies') {
      const response = await route.fetch();
      await route.fulfill({ response, body: (await response.text()).replace('data-platform="local"', 'data-platform="shopify"') });
    } else await route.continue();
  });
  await context.addInitScript(({ delayedRead }) => {
    window.__privacyFixture = { calls: [], acknowledgements: [] };
    let saved = { analytics: 'no', marketing: 'no', preferences: 'no' };
    const api = {
      currentVisitorConsent: () => saved,
      setTrackingConsent: (choices, callback) => {
        window.__privacyFixture.calls.push(choices);
        window.__privacyFixture.acknowledgements.push(error => {
          if (!error) saved = Object.fromEntries(Object.entries(choices).map(([key, value]) => [key, value ? 'yes' : 'no']));
          callback(error);
        });
      },
    };
    window.Shopify = delayedRead ? { loadFeatures(features, callback) { window.__privacyFixture.finishRead = () => { window.Shopify.customerPrivacy = api; callback(); }; } } : { customerPrivacy: api };
  }, { delayedRead });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/pages/cookies', { waitUntil: 'networkidle' });
  return { context, page };
}
for (engine of (process.env.VELANI_ENGINES || 'chromium').split(',')) {
  const type = { chromium, firefox, webkit }[engine];
  const executablePath = process.env.VELANI_CHROMIUM_EXECUTABLE || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  browser = await type.launch(engine === 'chromium' ? { executablePath, args: ['--no-sandbox', '--disable-dev-shm-usage'] } : { headless: true });
await check('loading consent cannot accept a selection that is later overwritten', async () => {
  const { context, page } = await fixture({ delayedRead: true });
  try {
    await page.getByRole('button', { name: 'Open cookie choices', exact: true }).click();
    await page.waitForFunction(() => typeof window.__privacyFixture.finishRead === 'function');
    const disabled = await page.locator('[data-consent]').evaluateAll(inputs => inputs.every(input => input.disabled));
    expect(disabled, 'Checkboxes were editable during unresolved platform read');
    await page.evaluate(() => window.__privacyFixture.finishRead());
    await page.waitForFunction(() => document.querySelector('#cookie-dialog').getAttribute('aria-busy') === 'false');
    await page.locator('[data-consent="preferences"]').check();
    expect(await page.locator('[data-consent="preferences"]').isChecked(), 'Ready choice did not persist');
  } finally { await context.close(); }
});
await check('delayed rejected consent retains keyboard focus and requires explicit retry', async () => {
  const { context, page } = await fixture();
  try {
    await page.getByRole('button', { name: 'Open cookie choices', exact: true }).click();
    const reject = page.getByRole('button', { name: 'Reject all optional', exact: true });
    await reject.focus(); await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.__privacyFixture.calls.length === 1);
    await page.evaluate(() => window.__privacyFixture.acknowledgements.shift()('fictional rejection'));
    await page.getByText('The platform did not accept the privacy change.', { exact: true }).waitFor();
    expect(await reject.evaluate(element => element === document.activeElement), 'Rejected action lost focus instead of retaining its retry target');
    expect(await page.evaluate(() => window.__privacyFixture.calls.length) === 1, 'Consent retried automatically');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.__privacyFixture.calls.length === 2);
    await page.evaluate(() => window.__privacyFixture.acknowledgements.shift()());
    await page.getByText('Cookie choices saved.', { exact: true }).waitFor();
  } finally { await context.close(); }
});
await check('closing and reopening cannot unlock a pending platform save', async () => {
  const { context, page } = await fixture();
  try {
    const open = page.getByRole('button', { name: 'Open cookie choices', exact: true });
    await open.click(); await page.getByRole('button', { name: 'Accept all optional', exact: true }).click();
    await page.waitForFunction(() => window.__privacyFixture.calls.length === 1);
    await page.getByRole('button', { name: 'Close cookie choices', exact: true }).click(); await open.click();
    await page.waitForTimeout(50);
    expect(await page.locator('#cookie-dialog').getAttribute('aria-busy') === 'true', 'Reopening cleared the outstanding save');
    expect(await page.getByRole('button', { name: 'Save choices', exact: true }).isDisabled(), 'Reopening allowed a second save');
    expect(await page.evaluate(() => window.__privacyFixture.calls.length) === 1, 'Duplicate platform call');
    await page.evaluate(() => window.__privacyFixture.acknowledgements.shift()());
    await page.getByText('Cookie choices saved.', { exact: true }).waitFor();
    expect(await page.locator('[data-consent="analytics"]').isChecked(), 'Acknowledged choice not shown');
  } finally { await context.close(); }
});
await check('no-JavaScript privacy controls identify unavailable interaction', async () => {
  const { context, page } = await fixture({ javaScriptEnabled: false });
  try {
    expect(await page.locator('[data-cookie-open]').evaluateAll(buttons => buttons.every(button => button.disabled)), 'No-JS cookie buttons falsely appear usable');
    expect((await page.locator('body').innerText()).includes('Cookie controls need JavaScript.'), 'No-JS cookie recovery explanation missing');
  } finally { await context.close(); }
});
await browser.close();
}
const report = { status: results.every(result => result.status === 'passed') ? 'passed' : 'failed', results, scope: 'Actual local browser with intercepted HTML and fictional platform API; no real Shopify consent, inquiry or production action' };
await writeFile(out + '/report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
if (report.status !== 'passed') process.exitCode = 1;
