// Hosted look at the client request form on an UNPUBLISHED theme. It never presses Send in "real" mode and it blocks and
// counts every request to the client hub, so nothing can reach the service from this script.
// Usage: node scripts/checks/client-hub-hosted.mjs <theme-id> <width> <en|es> <out-dir> <guard|real>
import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
const [theme, widthArg, lang, out, kind = 'guard'] = process.argv.slice(2);
const width = Number(widthArg), view = lang === 'es' ? 'velani-es-ayuda' : 'velani-help';
const url = hash => 'https://www.thevelani.com/?preview_theme_id=' + theme + '&view=' + view + '&interest=client-help' + hash;
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell' });
const hub = [], results = []; let hubConfig = null;
const ok = (name, pass, detail = '') => results.push((pass ? 'ok ' : 'FAIL ') + name + (pass ? '' : ' :: ' + detail));
async function open(hash) {
  const context = await browser.newContext({ viewport: { width, height: width > 600 ? 900 : 844 } });
  await context.addInitScript(() => { const s = document.createElement('style'); s.textContent = '#PBarNextFrameWrapper,#preview-bar-iframe{display:none!important}'; document.documentElement.append(s); });
  const page = await context.newPage();
  await page.route('**/*', r => { const u = new URL(r.request().url());
    if (u.hostname === 'velani-ai.vercel.app') { hub.push(r.request().method() + ' ' + u.pathname); if (kind === 'real' && r.request().method() === 'GET' && u.pathname === '/v1/client-hub/config') return r.continue(); return r.abort(); }
    return r.continue(); });
  page.on('response', async r => { if (r.url().endsWith('/v1/client-hub/config') && r.request().method() === 'GET') { try { hubConfig = { status: r.status(), ...(await r.json()) }; } catch { hubConfig = { status: r.status() }; } } });
  await page.goto(url(hash), { waitUntil: 'load' });
  await page.waitForFunction(() => { const f = document.querySelector('#project-inquiry > fieldset'); return f && (!f.disabled || !document.querySelector('[data-hub-off]').hidden); }, null, { timeout: 15000 });
  return { page, context };
}
const shot = async (page, name) => { await page.evaluate(() => { const el = document.querySelector('#inquiry-sent:not([hidden])') || document.querySelector('#project-inquiry'); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 140); });
  await page.waitForTimeout(700);
  // Shopify's draft bar sits over the page bottom: take it out of the picture (whatever element is fixed there outside <main>)
  await page.evaluate(() => { for (const el of document.elementsFromPoint(innerWidth / 2, innerHeight - 8)) { if (el.closest('main, header, footer, .gnav')) break; if (el !== document.body && el !== document.documentElement) el.style.setProperty('display', 'none', 'important'); } });
  await page.locator('#client').screenshot({ path: path.join(out, 'hub-' + name + '-' + width + '-' + lang + '.png') }); };
try {
  if (kind === 'guard') {
    for (const state of ['default', 'sent', 'pending', 'conflict', 'rate', 'verify', 'unknown', 'invalid', 'unavailable']) {
      const { page, context } = await open(['default', 'sent'].includes(state) ? '' : '#hub-state=' + state);
      if (state === 'default') { const info = await page.evaluate(() => ({ id: window.Shopify?.theme?.id, role: window.Shopify?.theme?.role, hub: document.querySelector('#project-inquiry').dataset.hub, fx: document.querySelector('#project-inquiry').hasAttribute('data-hub-fixtures') })); ok('theme ' + JSON.stringify(info), String(info.id) === theme && info.role !== 'main' && info.hub === 'preview' && info.fx, ''); }
      if (!['default', 'unavailable'].includes(state)) {
        for (const [id, v] of Object.entries({ name: 'Preview Example', email: 'preview@example.com', project: 'Company website', message: 'Preview draft only. The contact page stops responding.' })) await page.fill('#inquiry-' + id, v);
        await page.click('[data-inquiry-submit]'); await page.waitForTimeout(900);
      }
      const seen = state === 'default' ? true : state === 'unavailable' ? await page.locator('[data-hub-off]').isVisible() : ['sent', 'pending'].includes(state) ? await page.locator('[data-ref]').textContent() === 'VEL-0000-0000' && await page.locator('[data-sent-preview]').isVisible()
        : state === 'invalid' ? (await page.locator('#error-email').textContent()) !== '' : await page.locator('#project-inquiry .form-status').getAttribute('data-state') === state;
      ok('state ' + state, seen);
      ok('state ' + state + ' no sideways scroll', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
      await shot(page, state); await context.close();
    }
    ok('preview guard: no request to the client hub', hub.length === 0, hub.join(', '));
  } else {
    // Real-sending acceptance copy: look only. GET config is allowed through; any POST is blocked here and Send is never pressed with valid data.
    const { page, context } = await open('#hub-state=unavailable');
    const info = await page.evaluate(() => ({ id: window.Shopify?.theme?.id, role: window.Shopify?.theme?.role, hub: document.querySelector('#project-inquiry').dataset.hub, fx: document.querySelector('#project-inquiry').hasAttribute('data-hub-fixtures'), notice: document.querySelector('[data-hub-test]')?.textContent || '' }));
    ok('theme ' + JSON.stringify(info), String(info.id) === theme && info.role !== 'main' && info.hub === 'live' && !info.fx && info.notice.length > 0);
    ok('#hub-state does nothing: form is on', await page.locator('#project-inquiry > fieldset').isEnabled() && await page.locator('[data-hub-off]').isHidden());
    ok('test notice visible', await page.locator('[data-hub-test]').isVisible());
    await page.waitForTimeout(1500);
    ok('config GET asked once, no POST', hub.join() === 'GET /v1/client-hub/config', hub.join(', '));
    ok('config GET succeeded: enabled, action velani-client-hub, site key present', hubConfig?.status === 200 && hubConfig.enabled === true && hubConfig.turnstileAction === 'velani-client-hub' && !!hubConfig.turnstileSiteKey, JSON.stringify({ ...hubConfig, turnstileSiteKey: hubConfig?.turnstileSiteKey ? 'present' : 'missing' }));
    // Entering the form loads Cloudflare's script (the form's own warm-up). The widget is then rendered here in a scratch slot with the
    // served site key and action, only to see that it renders on this host. Its token goes nowhere.
    await page.focus('#inquiry-name');
    const loaded = await page.waitForFunction(() => !!window.turnstile, null, { timeout: 20000 }).then(() => true, () => false);
    ok('Turnstile script loads when the form is entered', loaded);
    const turnstile = loaded && await page.evaluate(key => new Promise(resolve => { const slot = document.querySelector('#hub-turnstile'); try { window.turnstile.render(slot, { sitekey: key, action: 'velani-client-hub', appearance: 'always' }); } catch (e) { return resolve('throw ' + e.message); } let n = 0; const t = setInterval(() => { if (slot.querySelector('iframe') || slot.querySelector('input[name="cf-turnstile-response"]')) { clearInterval(t); resolve(true); } else if (++n > 50) { clearInterval(t); resolve('no widget'); } }, 200); }), hubConfig?.turnstileSiteKey);
    ok('Turnstile widget renders', turnstile === true, String(turnstile));
    await page.click('[data-inquiry-submit]'); await page.waitForTimeout(400);
    ok('empty Send only shows field errors, still no POST', (await page.locator('#error-name').textContent()) !== '' && !hub.some(h => h.startsWith('POST')));
    await shot(page, 'acceptance'); await context.close();
  }
} catch (error) { ok('run completed', false, String(error.message).slice(0, 240)); }
await browser.close();
const fails = results.filter(r => r.startsWith('FAIL'));
console.log(JSON.stringify({ theme, width, lang, kind, checks: results.length, failed: fails.length, hubRequests: hub }));
for (const f of fails) console.log(f);
if (process.env.VERBOSE) console.log(results.filter(r => r.startsWith('ok theme')).join('\n'));
