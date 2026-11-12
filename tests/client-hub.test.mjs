// The client-hub transport against a local fake of its two endpoints. Nothing here reaches the real service.
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { validateHub, buildHubBody, createHubClient, retryAfterSeconds, isHubTopic, HUB_TOPICS, HUB_API } from '../src/client-hub.mjs';

let server, api, calls, plan, config;
const saved = (extra = {}) => ({ status: 201, body: { status: 'received', reference: 'VEL-2611-0007', confirmationEmail: 'submitted', ...extra } });
before(async () => {
  server = http.createServer((req, res) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      if (req.method === 'GET' && req.url === '/v1/client-hub/config') {
        calls.push({ method: 'GET', url: req.url });
        if (config === 'down') { res.writeHead(503); res.end(); return; }
        res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(config)); return;
      }
      if (req.method === 'POST' && req.url === '/v1/client-hub/requests') {
        calls.push({ method: 'POST', url: req.url, headers: req.headers, body: JSON.parse(raw) });
        const step = plan.shift() || saved();
        if (step.hang) return; // never answers: the client's deadline ends it
        res.writeHead(step.status, { 'Content-Type': 'application/json', ...(step.headers || {}) }); res.end(JSON.stringify(step.body ?? {})); return;
      }
      res.writeHead(404); res.end();
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  api = 'http://127.0.0.1:' + server.address().port;
});
after(() => { server.closeAllConnections(); server.close(); });
beforeEach(() => { calls = []; plan = []; config = { enabled: true, turnstileSiteKey: 'site-key-fixture', turnstileAction: 'velani-client-hub' }; });

const help = { interest: 'client-help', name: ' Ana Example ', email: 'ana@example.com', company: 'Example Co', project: 'Company website', message: 'The contact page stops responding after sending.', urgency: "We can't work", timing: 'This week' };
const work = { interest: 'client-work', name: 'Ana Example', email: 'ana@example.com', company: '', project: '', message: 'We need a new page for our spring menu.', timing: 'This month', urgency: '' };
const posts = () => calls.filter(c => c.method === 'POST');
const send = (client, fields, token = 'token-1', language = 'en') => client.submit(validateHub(fields).values, { language, turnstileToken: token });
let n = 0; const client = (extra = {}) => createHubClient({ api, uuid: () => 'key-' + (++n), timeoutMs: 400, ...extra });

test('only the two client topics map to the client hub, and the base address is the fixed one', () => {
  assert.deepEqual(HUB_TOPICS, { 'client-work': 'new_work', 'client-help': 'project_support' });
  assert.equal(HUB_API, 'https://velani-ai.vercel.app');
  for (const topic of ['', 'website', 'custom-software', 'nevora', 'nevora-demo', 'relay', 'other']) assert.equal(isHubTopic(topic), false, topic);
});

test('support body: exact contract fields, trimmed, urgency mapped, no contact[...] names or extras', () => {
  const { valid, values } = validateHub(help);
  assert.equal(valid, true);
  assert.deepEqual(buildHubBody(values, { language: 'es', turnstileToken: 't' }), { type: 'project_support', name: 'Ana Example', email: 'ana@example.com', company: 'Example Co', project: 'Company website',
    description: 'The contact page stops responding after sending.', urgency: 'urgent', language: 'es', turnstileToken: 't' });
});

test('new work body: no urgency, blank optional fields left out, timing carried in the description', () => {
  const body = buildHubBody(validateHub(work).values, { language: 'en', turnstileToken: 't' });
  assert.deepEqual(body, { type: 'new_work', name: 'Ana Example', email: 'ana@example.com', description: 'We need a new page for our spring menu.\n\nTiming: This month', language: 'en', turnstileToken: 't' });
  assert.equal(Object.keys(body).some(k => /contact|urgency|timing|interest/.test(k)), false);
});

test('client-side limits use the contract codes', () => {
  assert.deepEqual(validateHub({ interest: 'client-help' }).errors, { name: 'required', email: 'required', project: 'required', message: 'required' });
  assert.equal(validateHub({ ...work, project: '' }).valid, true, 'project is optional for new work');
  assert.equal(validateHub({ ...work, message: 'Too short.' }).errors.message, 'too_short');
  assert.equal(validateHub({ ...work, message: 'x'.repeat(5001) }).errors.message, 'too_long');
  assert.equal(validateHub({ ...work, name: 'x'.repeat(121) }).errors.name, 'too_long');
  assert.equal(validateHub({ ...work, email: 'not-an-email' }).errors.email, 'invalid');
  assert.equal(validateHub({ ...help, project: 'x'.repeat(201) }).errors.project, 'too_long');
  assert.equal(validateHub({ ...work, interest: 'nevora-demo' }).errors.interest, 'invalid');
});

test('config: enabled with the expected action is available; disabled, wrong action or failure is not', async () => {
  assert.deepEqual(await client().loadConfig(), { available: true, turnstileSiteKey: 'site-key-fixture', turnstileAction: 'velani-client-hub' });
  config = { enabled: false, turnstileSiteKey: 'k', turnstileAction: 'velani-client-hub' };
  assert.deepEqual(await client().loadConfig(), { available: false, disabled: true });
  config = { enabled: true, turnstileSiteKey: 'k', turnstileAction: 'velani-session' };
  assert.equal((await client().loadConfig()).available, false);
  config = 'down';
  assert.equal((await client().loadConfig()).available, false);
  assert.equal((await createHubClient({ api: 'http://127.0.0.1:1', timeoutMs: 300 }).loadConfig()).available, false);
  assert.equal(posts().length, 0);
});

test('201: correct request, headers and reference; submitted and pending are both saved', async () => {
  const result = await send(client(), help);
  assert.deepEqual(result, { kind: 'saved', reference: 'VEL-2611-0007', confirmationEmail: 'submitted', replay: false });
  const [post] = posts();
  assert.equal(post.headers['content-type'], 'application/json');
  assert.match(post.headers['idempotency-key'], /^key-\d+$/);
  assert.equal(post.headers.cookie, undefined);
  assert.equal(post.headers.referer, undefined);
  assert.deepEqual(Object.keys(post.body).sort(), ['company', 'description', 'email', 'language', 'name', 'project', 'turnstileToken', 'type', 'urgency']);
  plan = [saved({ reference: 'VEL-2611-0008', confirmationEmail: 'pending' })];
  assert.deepEqual(await send(client(), work), { kind: 'saved', reference: 'VEL-2611-0008', confirmationEmail: 'pending', replay: false });
});

test('200 replay is the same saved success', async () => {
  plan = [{ status: 200, body: { status: 'received', reference: 'VEL-2611-0007', confirmationEmail: 'pending' } }];
  assert.deepEqual(await send(client(), help), { kind: 'saved', reference: 'VEL-2611-0007', confirmationEmail: 'pending', replay: true });
});

test('one key through timeout, 503, 429 and 403 while the values are unchanged; a fresh token each time', async () => {
  const c = client();
  plan = [{ hang: true }, { status: 503, headers: { 'Retry-After': '30' }, body: { error: { code: 'service_unavailable' } } }, { status: 429, headers: { 'Retry-After': '120' }, body: { error: { code: 'rate_limited' } } },
    { status: 403, body: { error: { code: 'verification_failed' } } }, saved()];
  assert.deepEqual(await send(c, help, 't1'), { kind: 'unknown', retryAfter: 0 });
  assert.deepEqual(await send(c, help, 't2'), { kind: 'unknown', retryAfter: 30 });
  assert.deepEqual(await send(c, help, 't3'), { kind: 'rate', retryAfter: 120 });
  assert.deepEqual(await send(c, help, 't4'), { kind: 'verify' });
  assert.equal((await send(c, help, 't5')).kind, 'saved');
  const keys = posts().map(p => p.headers['idempotency-key']);
  assert.equal(keys.length, 5);
  assert.equal(new Set(keys).size, 1, 'the same key on every unchanged retry');
  assert.deepEqual(posts().map(p => p.body.turnstileToken), ['t1', 't2', 't3', 't4', 't5']);
});

test('network failure is an unknown outcome and never a reference', async () => {
  const c = createHubClient({ api: 'http://127.0.0.1:1', uuid: () => 'k', timeoutMs: 300 });
  assert.deepEqual(await send(c, help), { kind: 'unknown', retryAfter: 0 });
  plan = [{ status: 201, body: { status: 'received', reference: 'made-up' } }, { status: 200, body: {} }];
  assert.equal((await send(client(), help)).kind, 'unknown');
  assert.equal((await send(client(), help)).kind, 'unknown');
});

test('a new key after any edit, and after a saved request', async () => {
  const c = client();
  plan = [{ status: 503, body: {} }, { status: 503, body: {} }, saved(), saved()];
  await send(c, help); await send(c, { ...help, message: help.message + ' It started today.' }); await send(c, { ...help, message: help.message + ' It started today.' }); await send(c, { ...help, message: help.message + ' It started today.' });
  const keys = posts().map(p => p.headers['idempotency-key']);
  assert.notEqual(keys[0], keys[1], 'edited values get a new key');
  assert.equal(keys[1], keys[2], 'unchanged retry keeps it');
  assert.notEqual(keys[2], keys[3], 'a saved request ends the logical submission');
});

test('409 conflict: reported, and the next send uses a new key', async () => {
  const c = client();
  plan = [{ status: 409, body: { error: { code: 'idempotency_conflict' } } }, saved()];
  assert.deepEqual(await send(c, help), { kind: 'conflict' });
  assert.equal((await send(c, help)).kind, 'saved');
  const keys = posts().map(p => p.headers['idempotency-key']);
  assert.notEqual(keys[0], keys[1]);
});

test('422: server field errors map to the form fields with the contract codes', async () => {
  plan = [{ status: 422, body: { error: { code: 'validation_failed', fields: { email: ['invalid'], project: ['required'], description: ['too_short'], language: ['invalid'], name: ['brand-new-code'] } } } },
    { status: 422, body: { error: { code: 'validation_failed', fields: { turnstileToken: ['invalid'] } } } }];
  assert.deepEqual(await send(client(), help), { kind: 'invalid', fields: { email: 'invalid', project: 'required', message: 'too_short', _form: 'invalid', name: 'invalid' } });
  assert.deepEqual(await send(client(), help), { kind: 'verify' });
});

test('other refusals are rejected without a reference', async () => {
  plan = [{ status: 403, body: { error: { code: 'origin_not_allowed' } } }, { status: 413, body: { error: { code: 'request_too_large' } } }];
  assert.deepEqual(await send(client(), help), { kind: 'rejected', code: 'origin_not_allowed' });
  assert.deepEqual(await send(client(), help), { kind: 'rejected', code: 'request_too_large' });
});

test('Retry-After: seconds or a date', () => {
  assert.equal(retryAfterSeconds('90'), 90);
  assert.equal(retryAfterSeconds(new Date(1_000_000 + 61_000).toUTCString(), 1_000_000), 61);
  assert.equal(retryAfterSeconds(''), 0);
  assert.equal(retryAfterSeconds('soon'), 0);
});

// ---------- what the pages render
import { renderPage, renderBody } from '../src/render.mjs';
import { readFile } from 'node:fs/promises';
const formOf = html => html.slice(html.indexOf('<form id="project-inquiry"'), html.indexOf('</form>', html.indexOf('<form id="project-inquiry"')));

test('Support (EN and ES): the client form is a client-hub form with no Shopify transport or contact[...] names', () => {
  for (const route of ['/pages/help', '/pages/es-ayuda']) {
    const theme = renderBody(route, { target: 'shopify' }), form = formOf(theme);
    assert.match(form, /data-inquiry-mode="hub"/);
    assert.match(form, /data-hub="\{% if theme\.role == 'main' %\}live\{% else %\}preview\{% endif %\}"/, 'live only on the published theme');
    assert.match(form, /data-hub-api="https:\/\/velani-ai\.vercel\.app"/);
    assert.match(form, /\{% unless theme\.role == 'main' %\} data-hub-fixtures\{% endunless %\}/, 'review states never on the published theme');
    assert.doesNotMatch(theme, /\{% form 'contact'/, 'no Shopify contact form on Support');
    assert.doesNotMatch(form, /contact\[/);
    assert.doesNotMatch(form, / action=| method=/, 'nothing for the browser to post by itself');
    assert.match(form, /<fieldset disabled>/, 'off until the script takes over');
    for (const id of ['name', 'email', 'company', 'project', 'timing', 'urgency', 'message']) assert.match(form, new RegExp('id="inquiry-' + id + '"'));
    assert.match(form, /value="client-work" checked/); assert.match(form, /value="client-help"/);
    assert.match(theme, /data-sent-ref hidden/);
    const local = formOf(renderPage(route).html);
    assert.match(local, /data-hub="preview"/); assert.match(local, /data-hub-fixtures/);
  }
});

test('NEVORA trial, quote, Relay and general inquiries keep the Shopify contact transport', () => {
  for (const route of ['/pages/contact', '/pages/es-contacto']) {
    const theme = renderBody(route, { target: 'shopify' });
    assert.match(theme, /\{% if settings\.inquiries_enabled and theme\.role == 'main' %\}\{% form 'contact', id: 'project-inquiry'/);
    for (const name of ['name', 'email', 'company', 'interest', 'team_size', 'body']) assert.match(theme, new RegExp('name="contact\\[' + name + '\\]"'));
    assert.match(theme, /name="topic_choice" value="nevora"/);
    assert.doesNotMatch(theme, /data-hub|velani-ai\.vercel\.app|client-hub/);
  }
});

test('the page script hands only the hub form to the client hub, and the hub script keeps nothing', async () => {
  const main = await readFile(new URL('../public/assets/velani.js', import.meta.url), 'utf8');
  assert.match(main, /const hubForm = !!form && form\.dataset\.inquiryMode === 'hub';/);
  assert.match(main, /if \(form && !justSent && !hubForm\) \{/);
  const hub = await readFile(new URL('../public/assets/velani-hub.js', import.meta.url), 'utf8');
  assert.doesNotMatch(hub, /sessionStorage|localStorage|indexedDB|document\.cookie|console\.|sendBeacon|history\.(push|replace)State/);
  assert.match(hub, /form\.hasAttribute\('data-hub-fixtures'\)/);
  assert.match(hub, /const client = live && !fixture \?/, 'a preview never builds a client, so it cannot send');
  const lib = await readFile(new URL('../src/client-hub.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(lib, /sessionStorage|localStorage|console\.|sendBeacon/);
  assert.equal((lib.match(/fetchImpl\(/g) || []).length, 2, 'two endpoints only');
});
