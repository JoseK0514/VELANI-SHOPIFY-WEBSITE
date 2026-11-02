import test from 'node:test';
import assert from 'node:assert/strict';
import { validateInquiry, createInquiryController } from '../src/inquiry.mjs';
import { createPrivacyAdapter } from '../src/privacy.mjs';
const valid = { name: '  José Natal  ', email: 'jose@example.com', company: 'Velani', interest: 'nevora', message: '  An application for our team.  ' };
test('inquiries require a name, reply email and meaningful message', () => {
  const result = validateInquiry({ name: ' ', email: 'not-an-email', message: '' });
  assert.equal(result.valid, false);
  assert.deepEqual(Object.keys(result.errors).sort(), ['email', 'message', 'name']);
});
test('unicode names and ordinary message characters survive normalization', () => {
  const result = validateInquiry({ ...valid, message: '  Equipo — mañana 👋  ' });
  assert.equal(result.valid, true);
  assert.equal(result.values.name, 'José Natal');
  assert.equal(result.values.message, 'Equipo — mañana 👋');
});
test('length boundaries prevent unbounded form values', () => {
  for (const [key, length] of [['name', 120], ['email', 254], ['company', 160], ['message', 4000]]) {
    const result = validateInquiry({ ...valid, [key]: 'x'.repeat(length + 1) });
    assert.ok(result.errors[key], key);
  }
  assert.equal(validateInquiry({ ...valid, name: 'N'.repeat(120), message: 'M'.repeat(4000) }).valid, true);
});
test('non-string fields do not get coerced into accepted personal information', () => {
  const result = validateInquiry({ ...valid, name: { toString: () => 'name' }, message: ['hello'] });
  assert.ok(result.errors.name);
  assert.ok(result.errors.message);
});
test('unexpected inquiry categories cannot become query-provided HTML', () => {
  const result = validateInquiry({ ...valid, interest: '<img src=x onerror=alert(1)>' });
  assert.equal(result.values.interest, '');
  assert.equal(result.valid, true);
});
test('preview submission never calls a supplied delivery transport', async () => {
  let calls = 0;
  const c = createInquiryController({ mode: 'preview', transport: () => { calls++; } });
  const result = await c.submit(valid);
  assert.equal(result.status, 'preview');
  assert.equal(calls, 0);
});
test('invalid inquiries stop before transport and retain no copy in controller state', async () => {
  let calls = 0;
  const c = createInquiryController({ mode: 'live', transport: () => { calls++; } });
  const result = await c.submit({ ...valid, email: '' });
  assert.equal(result.status, 'invalid');
  assert.equal(calls, 0);
  assert.equal(JSON.stringify(c.state).includes(valid.message.trim()), false);
});
test('repeat clicks while sending share the original attempt', async () => {
  let resolve, calls = 0;
  const c = createInquiryController({ mode: 'live', transport: () => { calls++; return new Promise(r => { resolve = r; }); } });
  const a = c.submit(valid);
  const b = c.submit(valid);
  assert.equal(calls, 1);
  resolve({ accepted: true });
  assert.equal((await a).status, 'accepted');
  assert.equal((await b).status, 'accepted');
});
test('rejected transport is not turned into acceptance', async () => {
  const c = createInquiryController({ mode: 'live', transport: async () => ({ accepted: false }) });
  assert.equal((await c.submit(valid)).status, 'failed');
});
test('lost response remains uncertain and does not automatically retry', async () => {
  let calls = 0;
  const c = createInquiryController({ mode: 'live', transport: async () => { calls++; throw new Error('connection lost'); } });
  assert.equal((await c.submit(valid)).status, 'uncertain');
  assert.equal((await c.submit(valid)).status, 'uncertain');
  assert.equal(calls, 1);
});
test('unsupported delivery mode fails closed', () => {
  assert.throws(() => createInquiryController({ mode: 'mystery' }), /mode/);
});
test('local privacy demonstration stays in memory and saves a real choice', async () => {
  const api = createPrivacyAdapter({}, { platform: 'local' });
  assert.equal((await api.read()).mode, 'local');
  const result = await api.save({ analytics: false, marketing: false, preferences: true });
  assert.equal(result.ok, true);
  assert.deepEqual((await api.read()).choices, { analytics: false, marketing: false, preferences: true });
});
test('missing Shopify privacy API cannot silently switch to demo consent', async () => {
  const api = createPrivacyAdapter({}, { platform: 'shopify' });
  assert.equal((await api.read()).available, false);
  assert.equal((await api.save({ analytics: true, marketing: true, preferences: true })).ok, false);
});
test('consent is saved only after an explicit supported API acknowledgement', async () => {
  let saves = 0, ack;
  const host = { Shopify: { customerPrivacy: { currentVisitorConsent: () => ({ analytics: 'no', marketing: 'no', preferences: 'yes' }), setTrackingConsent: (v, cb) => { saves++; ack = cb; } } } };
  const api = createPrivacyAdapter(host, { platform: 'shopify', timeoutMs: 100 });
  assert.equal((await api.read()).choices.preferences, true);
  assert.equal(saves, 0);
  const pending = api.save({ analytics: true, marketing: false, preferences: true });
  await new Promise(r => setImmediate(r));
  assert.equal(saves, 1);
  ack();
  assert.equal((await pending).ok, true);
});
test('failing or silent privacy provider cannot report saved consent', async () => {
  const silent = createPrivacyAdapter({ Shopify: { customerPrivacy: { currentVisitorConsent: () => ({}), setTrackingConsent: () => {} } } }, { platform: 'shopify', timeoutMs: 15 });
  assert.equal((await silent.save({ analytics: true, marketing: true, preferences: true })).ok, false);
  const throwing = createPrivacyAdapter({ Shopify: { customerPrivacy: { currentVisitorConsent: () => { throw new Error('broken'); }, setTrackingConsent: () => {} } } }, { platform: 'shopify' });
  assert.equal((await throwing.read()).available, false);
});
test('malformed consent values do not become truthy permission', async () => {
  let calls = 0;
  const api = createPrivacyAdapter({ Shopify: { customerPrivacy: { currentVisitorConsent: () => ({}), setTrackingConsent: () => { calls++; } } } }, { platform: 'shopify' });
  assert.equal((await api.save({ analytics: 'yes', marketing: true, preferences: true })).ok, false);
  assert.equal(calls, 0);
});

