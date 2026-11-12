// Browser check for the client request form on Support. Everything is local: the site preview server, a fake of the two
// client-hub endpoints, and a stub in place of Cloudflare's Turnstile script. Any request to another host fails the run.
// Usage: node scripts/checks/client-hub-browser.mjs <live|preview> <width> <en|es> [screenshot-dir]
import http from 'node:http';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const [mode = 'live', widthArg = '1440', lang = 'en', shots = ''] = process.argv.slice(2);
const width = Number(widthArg), root = path.resolve(import.meta.dirname, '../..');
const route = lang === 'es' ? '/pages/es-ayuda/' : '/pages/help/';
const results = []; let failed = 0;
const ok = (name, pass, detail = '') => { results.push((pass ? 'ok   ' : 'FAIL ') + name + (pass || !detail ? '' : ' :: ' + detail)); if (!pass) failed++; };

// ---------- the fake client hub
const hub = { plan: [], posts: [], gets: 0, config: { enabled: true, turnstileSiteKey: 'fixture-site-key', turnstileAction: 'velani-client-hub' } };
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Idempotency-Key', 'Access-Control-Expose-Headers': 'Retry-After', 'Cache-Control': 'no-store' };
const fake = http.createServer((req, res) => {
  let raw = ''; req.on('data', c => { raw += c; }); req.on('end', () => {
    if (req.method === 'OPTIONS') { res.writeHead(204, cors); res.end(); return; }
    if (req.method === 'GET' && req.url === '/v1/client-hub/config') { hub.gets++; if (hub.config === 'down') { res.writeHead(503, cors); res.end(); return; } res.writeHead(200, { ...cors, 'Content-Type': 'application/json' }); res.end(JSON.stringify(hub.config)); return; }
    if (req.method === 'POST' && req.url === '/v1/client-hub/requests') {
      hub.posts.push({ key: req.headers['idempotency-key'], type: req.headers['content-type'], cookie: req.headers.cookie, referer: req.headers.referer, body: JSON.parse(raw) });
      const step = hub.plan.shift() || { status: 201, body: { status: 'received', reference: 'VEL-2611-0007', confirmationEmail: 'submitted' } };
      setTimeout(() => { res.writeHead(step.status, { ...cors, 'Content-Type': 'application/json', ...(step.headers || {}) }); res.end(JSON.stringify(step.body ?? {})); }, step.delay || 0); return;
    }
    res.writeHead(404, cors); res.end();
  });
});
await new Promise(r => fake.listen(0, '127.0.0.1', r));
const api = 'http://127.0.0.1:' + fake.address().port;

// ---------- the site preview: live against the fake, or the plain preview (which must send nothing)
const port = 4400 + Math.floor(Math.random() * 400);
const site = spawn(process.execPath, ['scripts/serve.mjs', '--port', String(port), '--host', '127.0.0.1'], { cwd: root, env: { ...process.env, VELANI_CLIENT_HUB_API: mode === 'live' ? api : '' }, stdio: 'ignore' });
const base = 'http://127.0.0.1:' + port;
for (let i = 0; i < 80; i++) { try { if ((await fetch(base + route)).ok) break; } catch {} await new Promise(r => setTimeout(r, 150)); }

const browser = await chromium.launch({ executablePath: process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell' });
const outside = [], consoleErrors = [], net = { drop: false };
const TURNSTILE = `window.__ts={n:0,fail:false,opts:null,delay:30};window.turnstile={render(sel,o){window.__ts.opts=o;window.__ts.sel=sel;this.run();return 'w1'},reset(){this.run()},run(){const s=window.__ts;setTimeout(()=>{if(s.fail){s.opts['error-callback']('x')}else{s.opts.callback('token-'+(++s.n))}},s.delay)}};`;
async function open(hash = '', { reduced = false, strip = false, turnstileFail = false, turnstileDelay = 0 } = {}) {
  const context = await browser.newContext({ viewport: { width, height: width > 600 ? 900 : 844 }, reducedMotion: reduced ? 'reduce' : 'no-preference', permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) consoleErrors.push(m.text().slice(0, 160)); });
  page.on('pageerror', e => consoleErrors.push('pageerror ' + e.message.slice(0, 160)));
  await page.route('**/*', async r => {
    const url = new URL(r.request().url());
    if (url.hostname === 'challenges.cloudflare.com') return r.fulfill({ contentType: 'text/javascript', body: TURNSTILE + (turnstileFail ? 'window.__ts.fail=true;' : '') + (turnstileDelay ? 'window.__ts.delay=' + turnstileDelay + ';' : '') });
    if (url.hostname !== '127.0.0.1') { outside.push(r.request().method() + ' ' + url.origin + url.pathname); return r.abort(); }
    // A lost connection: the request is cut in the browser (a real reset on a reused socket makes Chromium resend by itself)
    if (net.drop && r.request().method() === 'POST' && url.pathname === '/v1/client-hub/requests') { net.drop = false; const h = r.request().headers(); hub.posts.push({ key: h['idempotency-key'], type: h['content-type'], body: r.request().postDataJSON() }); return r.abort('connectionreset'); }
    if (strip && url.pathname === route) { const res = await r.fetch(); return r.fulfill({ response: res, body: (await res.text()).replace(' data-hub-fixtures', '') }); }
    return r.continue();
  });
  await page.goto(base + route + '?interest=client-help' + hash, { waitUntil: 'load' });
  await page.waitForFunction(() => { const f = document.querySelector('#project-inquiry fieldset'); return f && (!f.disabled || !document.querySelector('[data-hub-off]').hidden); });
  return { page, context };
}
const fill = async (page, extra = {}) => { for (const [id, value] of Object.entries({ name: 'Ana Example', email: 'ana@example.com', company: 'Example Co', project: 'Company website', message: 'The contact page stops responding after sending.', ...extra })) await page.fill('#inquiry-' + id, value); };
const send = page => page.click('[data-inquiry-submit]');
const status = page => page.locator('#project-inquiry .form-status');
const state = (page, name) => page.waitForFunction(n => document.querySelector('#project-inquiry .form-status').dataset.state === n, name, { timeout: 5000 }).then(() => true, () => false);
const savedShown = page => page.waitForFunction(() => !document.querySelector('#inquiry-sent').hidden, null, { timeout: 5000 }).then(() => true, () => false);
let axeRuns = 0, axeViolations = 0, shotCount = 0;
async function audit(page, name) {
  // Clear of the fixed header, so a field under it is not measured as a covered target
  await page.evaluate(() => { const el = document.querySelector('#inquiry-sent:not([hidden])') || document.querySelector('#project-inquiry'); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 160, behavior: 'instant' }); return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); });
  // Measure the settled page, not a frame of the panel fading in or a label moving
  await page.evaluate(() => Promise.race([Promise.all(document.getAnimations().filter(a => a.effect?.getComputedTiming().iterations !== Infinity).map(a => a.finished.catch(() => {}))), new Promise(r => setTimeout(r, 1500))]));
  const { violations } = await new AxeBuilder({ page }).include('#client').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  axeRuns++; axeViolations += violations.length;
  ok(name + ': axe WCAG 2.2 AA', violations.length === 0, violations.map(v => v.id + ' ' + v.nodes[0]?.target).join('; '));
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(name + ': no sideways scroll', over <= 0, 'overflow ' + over);
  if (shots) { await mkdir(shots, { recursive: true }); await page.locator('#client').screenshot({ path: path.join(shots, 'local-' + mode + '-' + name.replace(/[^a-z0-9]+/gi, '-') + '-' + width + '-' + lang + '.png') }); shotCount++; }
}
const reset = () => { hub.plan = []; hub.posts = []; hub.gets = 0; hub.config = { enabled: true, turnstileSiteKey: 'fixture-site-key', turnstileAction: 'velani-client-hub' }; };
const focusId = page => page.evaluate(() => document.activeElement?.id || document.activeElement?.className || '');

try {
  if (mode === 'live') {
    // idle + empty submit: per-field errors, summary above the button, focus on the first field; errors clear as fixed
    reset(); let { page, context } = await open();
    ok('config asked once on load', hub.gets === 1, String(hub.gets));
    await audit(page, 'idle');
    await send(page);
    ok('empty: summary names four fields', /^(4 fields need attention|4 campos necesitan atención): /.test(await status(page).textContent()), await status(page).textContent());
    ok('empty: summary is directly above the button', await page.evaluate(() => document.querySelector('.client-send').previousElementSibling.classList.contains('form-status')));
    ok('empty: focus on the first field', await focusId(page) === 'inquiry-name', await focusId(page));
    ok('empty: nothing posted', hub.posts.length === 0);
    await audit(page, 'errors');
    await page.fill('#inquiry-name', 'Ana Example');
    ok('error clears as the field is fixed', await page.locator('#error-name').textContent() === '' && /^(3 fields|3 campos)/.test(await status(page).textContent()));
    await page.fill('#inquiry-message', 'Too short');
    await page.locator('#inquiry-message').blur();
    ok('description under 20 characters is caught', (await page.locator('#error-message').textContent()).length > 0);
    await context.close();

    // keyboard path to a saved request (201, confirmation submitted)
    reset(); ({ page, context } = await open());
    await page.focus('input[name="client_kind"]:checked');
    for (const text of ['Ana Example', 'ana@example.com', 'Example Co', 'Company website']) { await page.keyboard.press('Tab'); await page.keyboard.type(text); }
    await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await page.keyboard.type('The contact page stops responding after sending.');
    await page.keyboard.press('Tab');
    ok('keyboard: Tab order ends on the Send button', await page.evaluate(() => document.activeElement.matches('[data-inquiry-submit]')));
    await page.keyboard.press('Enter');
    ok('201: saved panel shown', await savedShown(page));
    ok('201: reference shown', await page.locator('[data-ref]').textContent() === 'VEL-2611-0007');
    ok('201: confirmation line (submitted)', /confirmation email is on its way|correo de confirmación/.test(await page.locator('[data-sent-p]').textContent()));
    ok('201: focus on the saved panel', await focusId(page) === 'inquiry-sent', await focusId(page));
    ok('201: not labelled a preview', await page.locator('[data-sent-preview]').isHidden());
    const post = hub.posts[0];
    ok('POST: exact body', JSON.stringify(post.body) === JSON.stringify({ type: 'project_support', name: 'Ana Example', email: 'ana@example.com', company: 'Example Co', project: 'Company website', description: 'The contact page stops responding after sending.', urgency: 'normal', language: lang, turnstileToken: 'token-1' }), JSON.stringify(post.body));
    ok('POST: JSON, Idempotency-Key is a UUID, no cookie, no referrer', post.type === 'application/json' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(post.key) && !post.cookie && !post.referer, JSON.stringify([post.type, post.key, post.cookie, post.referer]));
    await page.click('[data-ref-copy]');
    ok('copy: reference on the clipboard and announced', await page.evaluate(() => navigator.clipboard.readText()) === 'VEL-2611-0007' && (await page.locator('[data-ref-live]').textContent()).length > 0);
    ok('nothing personal in the address or storage', await page.evaluate(() => !/Ana|example\.com/.test(location.href) && sessionStorage.length === 0 && !/Ana|ana@/.test(JSON.stringify(localStorage))));
    await audit(page, 'saved-submitted');
    await context.close();

    // pending confirmation (new work, 201) and replay (200) are the same success
    reset(); hub.plan = [{ status: 201, body: { status: 'received', reference: 'VEL-2611-0008', confirmationEmail: 'pending' } }];
    ({ page, context } = await open('', { reduced: true }));
    await page.check('input[value="client-work"]', { force: true }); await fill(page, { project: '' }); await page.selectOption('#inquiry-timing', 'This week'); await send(page);
    ok('pending: saved panel with the reference', await savedShown(page) && await page.locator('[data-ref]').textContent() === 'VEL-2611-0008');
    ok('pending: says saved, email may take longer, never asks to resend', /We saved your request\. The confirmation email may take a little longer\.|Guardamos tu solicitud\. El correo de confirmación puede tardar un poco más\./.test(await page.locator('[data-sent-p]').textContent()));
    ok('new work: no urgency, no project, timing in the description', hub.posts[0].body.type === 'new_work' && !('urgency' in hub.posts[0].body) && !('project' in hub.posts[0].body) && hub.posts[0].body.description.endsWith('\n\nTiming: This week'), JSON.stringify(hub.posts[0].body));
    await audit(page, 'saved-pending-reduced-motion');
    await context.close();
    reset(); hub.plan = [{ status: 200, body: { status: 'received', reference: 'VEL-2611-0007', confirmationEmail: 'submitted' } }];
    ({ page, context } = await open()); await fill(page); await send(page);
    ok('200 replay: saved panel with the reference', await savedShown(page) && await page.locator('[data-ref]').textContent() === 'VEL-2611-0007');
    await context.close();

    // 503, then a dropped connection, then saved: "Try again" keeps one key and the input
    reset(); hub.plan = [{ status: 503, headers: { 'Retry-After': '1' }, body: { error: { code: 'service_unavailable' } } }];
    ({ page, context } = await open()); await fill(page); await send(page);
    ok('503: unknown outcome, no reference', await state(page, 'unknown') && await page.locator('#inquiry-sent').isHidden());
    ok('503: focus on the message, input kept', /form-status/.test(await focusId(page)) && await page.inputValue('#inquiry-name') === 'Ana Example');
    ok('503: button reads Try again', /^(Try again|Intentar de nuevo)$/.test((await page.locator('[data-inquiry-submit]').innerText()).trim()), await page.locator('[data-inquiry-submit]').innerText());
    await audit(page, 'unknown');
    await page.waitForFunction(() => !document.querySelector('[data-inquiry-submit]').disabled, null, { timeout: 4000 });
    net.drop = true; await send(page); await page.waitForFunction(() => document.querySelector('#project-inquiry').getAttribute('aria-busy') === 'false'); ok('network drop: still unknown', await state(page, 'unknown') && hub.posts.length === 2);
    await send(page);
    ok('retry: saved on the third try', await savedShown(page));
    ok('retry: one key across all three, a fresh token each time', new Set(hub.posts.map(p => p.key)).size === 1 && hub.posts.map(p => p.body.turnstileToken).join() === 'token-1,token-2,token-3', hub.posts.map(p => p.key + '/' + p.body.turnstileToken).join(' '));
    await context.close();

    // 429 with Retry-After: says when, keeps input and key, button waits
    reset(); hub.plan = [{ status: 429, headers: { 'Retry-After': '2' }, body: { error: { code: 'rate_limited' } } }];
    ({ page, context } = await open()); await fill(page); await send(page);
    ok('429: says when to try again', await state(page, 'rate') && /minute|minuto/.test(await status(page).textContent()), await status(page).textContent());
    ok('429: button waits, input kept', await page.locator('[data-inquiry-submit]').isDisabled() && await page.inputValue('#inquiry-email') === 'ana@example.com');
    await audit(page, 'rate');
    await page.waitForFunction(() => !document.querySelector('[data-inquiry-submit]').disabled, null, { timeout: 5000 });
    await send(page); ok('429: same key after the wait', await savedShown(page) && hub.posts[0].key === hub.posts[1].key);
    await context.close();

    // 403 verification failed: Turnstile runs again, input and key kept
    reset(); hub.plan = [{ status: 403, body: { error: { code: 'verification_failed' } } }];
    ({ page, context } = await open()); await fill(page); await send(page);
    ok('403: verification message, input kept', await state(page, 'verify') && await page.inputValue('#inquiry-project') === 'Company website');
    await audit(page, 'verify');
    await send(page); ok('403: same key, new token', await savedShown(page) && hub.posts[0].key === hub.posts[1].key && hub.posts[1].body.turnstileToken === 'token-2');
    await context.close();
    reset(); ({ page, context } = await open('', { turnstileFail: true })); await fill(page); await send(page);
    ok('Turnstile cannot finish: verification message and nothing posted', await state(page, 'verify') && hub.posts.length === 0);
    await context.close();

    // 409: explained, new key, can send again; then an edit also takes a new key
    reset(); hub.plan = [{ status: 409, body: { error: { code: 'idempotency_conflict' } } }, { status: 503, body: {} }];
    ({ page, context } = await open()); await fill(page); await send(page);
    ok('409: conflict explained, input kept', await state(page, 'conflict') && await page.inputValue('#inquiry-name') === 'Ana Example');
    await audit(page, 'conflict');
    await send(page); await state(page, 'unknown');
    ok('409: the next send uses a new key', hub.posts.length === 2 && hub.posts[0].key !== hub.posts[1].key);
    await page.fill('#inquiry-message', 'The contact page stops responding after sending. It started today.');
    ok('edit: retry wording and message cleared', (await status(page).textContent()) === '' && !/Try again|Intentar/.test(await page.locator('[data-inquiry-submit]').innerText()));
    await send(page); ok('edit: a new key after changing a field', await savedShown(page) && hub.posts[2].key !== hub.posts[1].key);
    await context.close();

    // 422 from the server: mapped to the fields, focus on the first, clears on edit
    reset(); hub.plan = [{ status: 422, body: { error: { code: 'validation_failed', fields: { email: ['invalid'], description: ['not_allowed'] } } } }];
    ({ page, context } = await open()); await fill(page); await send(page);
    await page.waitForFunction(() => document.querySelector('#error-email').textContent !== '');
    ok('422: errors beside email and message, summary, focus on email', (await page.locator('#error-message').textContent()) !== '' && /^(2 fields|2 campos)/.test(await status(page).textContent()) && await focusId(page) === 'inquiry-email');
    await audit(page, 'server-validation');
    await page.fill('#inquiry-email', 'ana2@example.com');
    ok('422: the email error clears when edited', (await page.locator('#error-email').textContent()) === '');
    await context.close();


    // ---------- Codex review: nothing stale can be sent. Fields and request kinds are locked while the security check runs
    // and while the request is on its way; a change forced past the lock cancels the send.
    const lockedNow = page => page.evaluate(() => { const f = document.querySelector('#project-inquiry'); const els = [...f.querySelectorAll('input:not([type="hidden"]), textarea, select')];
      return els.every(el => el.matches('textarea, input:not([type="radio"])') ? el.readOnly : el.disabled) && f.getAttribute('aria-busy') === 'true' && f.querySelector('fieldset').getAttribute('aria-busy') === 'true' && f.querySelector('[data-inquiry-submit]').disabled; });
    const typeInto = async (page, id, text) => { await page.locator('#inquiry-' + id).click({ force: true }).catch(() => {}); await page.keyboard.type(text); };
    const force = (page, id, value) => page.evaluate(([id, value]) => { const el = document.querySelector('#inquiry-' + id); el.value = value; el.dispatchEvent(new Event('input', { bubbles: true })); }, [id, value]);
    const unlocked = page => page.waitForFunction(() => document.querySelector('#project-inquiry').getAttribute('aria-busy') === 'false' && !document.querySelector('#inquiry-email').readOnly, null, { timeout: 6000 }).then(() => true, () => false);
    reset(); ({ page, context } = await open('', { turnstileDelay: 1500 })); await fill(page); await send(page);
    ok('lock: verifying state', await state(page, 'verifying'));
    ok('lock: every field and both kinds locked during the security check', await lockedNow(page));
    await audit(page, 'locked-verifying');
    await typeInto(page, 'email', 'x'); await typeInto(page, 'message', ' more'); await page.locator('label.kind >> nth=0').click({ force: true }).catch(() => {});
    ok('lock: typing and switching kind change nothing while pending', await page.inputValue('#inquiry-email') === 'ana@example.com' && await page.inputValue('#inquiry-message') === 'The contact page stops responding after sending.' && await page.inputValue('#inquiry-interest') === 'client-help');
    ok('lock: saved with the checked values only', await savedShown(page) && hub.posts.length === 1 && hub.posts[0].body.email === 'ana@example.com' && hub.posts[0].body.description === 'The contact page stops responding after sending.', JSON.stringify(hub.posts.map(p => p.body.email)));
    await context.close();
    reset(); ({ page, context } = await open('', { turnstileDelay: 1200 })); await fill(page); await send(page); await state(page, 'verifying');
    await force(page, 'email', 'corrected@example.com'); await force(page, 'message', 'The checkout page shows an error after paying.');
    ok('stale guard: a change forced during the check cancels the send, nothing with old values goes out', await unlocked(page) && hub.posts.length === 0 && await page.locator('#inquiry-sent').isHidden(), String(hub.posts.length));
    await page.evaluate(() => { window.__ts.delay = 30; }); await send(page);
    ok('stale guard: the next Send carries the corrected values', await savedShown(page) && hub.posts.length === 1 && hub.posts[0].body.email === 'corrected@example.com' && hub.posts[0].body.description === 'The checkout page shows an error after paying.');
    await context.close();
    reset(); hub.plan = [{ status: 503, delay: 1200, body: { error: { code: 'service_unavailable' } } }];
    ({ page, context } = await open()); await fill(page); await send(page);
    ok('lock: sending state', await state(page, 'sending'));
    ok('lock: every field and both kinds locked while the request is on its way', await lockedNow(page));
    await typeInto(page, 'email', 'x');
    ok('lock: typing changes nothing during the POST', await page.inputValue('#inquiry-email') === 'ana@example.com');
    await force(page, 'message', 'The checkout page shows an error after paying.');
    ok('edit during POST: outcome arrives, fields open again with the values kept', await state(page, 'unknown') && await unlocked(page) && await page.inputValue('#inquiry-name') === 'Ana Example');
    await send(page);
    ok('edit during POST: what was sent was what was checked; the changed request goes out under a new key', await savedShown(page) && hub.posts.length === 2 && hub.posts[0].body.description === 'The contact page stops responding after sending.' && hub.posts[1].body.description === 'The checkout page shows an error after paying.' && hub.posts[0].key !== hub.posts[1].key, hub.posts.map(p => p.key.slice(0, 8) + ':' + p.body.description.slice(4, 14)).join(' | '));
    await context.close();

    // ---------- acceptance-copy analog (real sending on a non-main page): test notice shown, review states off
    reset(); ({ page, context } = await open('#hub-state=unavailable'));
    ok('real sending: test notice visible', await page.locator('[data-hub-test]').isVisible() && /Acceptance test copy|Copia de prueba de aceptación/.test(await page.locator('[data-hub-test]').textContent()));
    ok('real sending: #hub-state does nothing', await page.locator('[data-hub-off]').isHidden() && await page.locator('#project-inquiry > fieldset').isEnabled() && hub.gets === 1);
    await fill(page); await send(page);
    ok('real sending: #hub-state does not fake an outcome, the request really goes out', await savedShown(page) && hub.posts.length === 1 && await page.locator('[data-ref]').textContent() === 'VEL-2611-0007' && await page.locator('[data-sent-preview]').isHidden());
    await context.close();

    // disabled, and config unavailable: no sending, calm notice, address as selectable text
    for (const [name, config] of [['disabled', { enabled: false, turnstileSiteKey: 'k', turnstileAction: 'velani-client-hub' }], ['config-down', 'down']]) {
      reset(); hub.config = config; ({ page, context } = await open());
      ok(name + ': form off, notice shown', await page.locator('#project-inquiry > fieldset').isHidden() && await page.locator('[data-hub-off]').isVisible());
      ok(name + ': address is selectable text', await page.evaluate(() => { const m = document.querySelector('.hub-mail'); return m.textContent === 'support@thevelani.com' && getComputedStyle(m).userSelect !== 'none' && !m.closest('a'); }));
      ok(name + ': nothing posted', hub.posts.length === 0);
      await audit(page, name);
      await context.close();
    }
  } else {
    // ---------- preview guard: checks the draft, sends nothing, asks the client hub nothing
    reset(); let { page, context } = await open();
    await audit(page, 'preview-idle');
    ok('preview: no test notice', (await page.locator('[data-hub-test]').count()) === 0);
    await fill(page); await send(page);
    ok('preview: saved panel labelled as a preview with a sample reference', await savedShown(page) && await page.locator('[data-sent-preview]').isVisible() && await page.locator('[data-ref]').textContent() === 'VEL-0000-0000' && /Sample reference|Referencia de ejemplo/.test(await page.locator('.sent-ref-k').textContent()));
    await audit(page, 'preview-saved');
    await context.close();
    for (const name of ['pending', 'conflict', 'rate', 'verify', 'unknown', 'invalid', 'sending', 'verifying']) {
      ({ page, context } = await open('#hub-state=' + name)); await fill(page); await send(page);
      const shown = name === 'pending' ? await savedShown(page) && /may take a little longer|puede tardar un poco más/.test(await page.locator('[data-sent-p]').textContent())
        : name === 'invalid' ? await page.waitForFunction(() => document.querySelector('#error-email').textContent !== '', null, { timeout: 4000 }).then(() => true, () => false) : await state(page, name);
      ok('review state ' + name, shown);
      await audit(page, 'state-' + name);
      await context.close();
    }
    ({ page, context } = await open('#hub-state=unavailable'));
    ok('review state unavailable', await page.locator('[data-hub-off]').isVisible() && await page.locator('#project-inquiry > fieldset').isHidden());
    await audit(page, 'state-unavailable'); await context.close();
    ({ page, context } = await open('#hub-state=unavailable', { strip: true }));
    ok('review states are ignored without the non-main marker', await page.locator('[data-hub-off]').isHidden() && await page.locator('#project-inquiry > fieldset').isEnabled());
    await context.close();
    ok('preview: no GET and no POST reached the client hub', hub.gets === 0 && hub.posts.length === 0, hub.gets + '/' + hub.posts.length);
  }
  ok('no request left this machine', outside.length === 0, outside.slice(0, 3).join(', '));
  ok('no console errors', consoleErrors.length === 0, consoleErrors.slice(0, 2).join(' | '));
} catch (error) { ok('run completed', false, String(error.message).slice(0, 300)); }
finally { await browser.close(); site.kill(); fake.close(); fake.closeAllConnections(); }
const fails = results.filter(r => r.startsWith('FAIL'));
console.log(JSON.stringify({ mode, width, lang, checks: results.length, failed, axeRuns, axeViolations, screenshots: shotCount }));
for (const line of fails) console.log(line);
process.exit(failed ? 1 : 0);
