// LOCAL FIXTURE ONLY. A fake NEVORA commerce API for testing the Velani signup and billing pages on this computer.
// It follows the documented contract (NEVORA docs/handoffs/2026-11-07-commerce-backend.md and 2026-11-09-claude-website-
// backend-contract.md: status.timeZone, {lang} on Checkout/Portal, legacy signup/verify/setup/login-link answer 409
// use_onboarding) with fictional businesses, sends
// no email, charges nothing and talks to no real service. It listens on 127.0.0.1 only.
//
//   node scripts/commerce-fixture.mjs            # API on http://127.0.0.1:4198
//   VELANI_COMMERCE_API=http://127.0.0.1:4198 npm run dev -- --port 4199 --host 127.0.0.1
//
// Scenarios come from the one-time token, e.g. /pages/plans#handoff=fixture-trial-000000000000:
//   trial, paid, canceled, grace, trial-ended, payment-failed, ended, payment-required, over-limit, over-30,
//   expired (link already used), down (billing unavailable), slow (3 s), lost (checkout response lost once),
//   no-zone (status.timeZone null: dates show in UTC).
import http from 'node:http';
import { randomUUID } from 'node:crypto';

const port = Number(process.env.FIXTURE_PORT || 4198);
const ui = (process.env.FIXTURE_UI_ORIGIN || 'http://127.0.0.1:4199').replace(/\/+$/, '');
const allowed = new Set([ui, ui.replace('127.0.0.1', 'localhost')]);
const day = n => new Date(Date.UTC(2026, 10, 8 + n, 16)).toISOString();
const base = { businessId: '22222222-2222-4222-8222-222222222222', businessName: 'Northside Coffee', setup: 'ready', applicationUrl: 'https://northside.example.test', ownerEmployeeId: 'OWNER',
  trialEndsAt: day(30), paidThrough: null, graceEndsAt: null, plan: null, state: 'trial', operational: true, billing: true, export: true, employeeLimit: 30, activeEmployees: 8, reason: null, timeZone: 'America/Puerto_Rico' };
const SCENARIOS = {
  trial: {},
  paid: { state: 'paid', plan: 'small', employeeLimit: 15, paidThrough: day(29) },
  canceled: { state: 'paid', plan: 'small', employeeLimit: 15, paidThrough: day(29), reason: 'subscription_canceled' },
  grace: { state: 'grace', plan: 'small', employeeLimit: 15, paidThrough: day(-1), graceEndsAt: day(6), reason: 'payment_failed' },
  'trial-ended': { state: 'restricted', operational: false, trialEndsAt: day(-2), reason: 'trial_ended' },
  'payment-failed': { state: 'restricted', operational: false, plan: 'small', employeeLimit: 15, paidThrough: day(-9), graceEndsAt: day(-2), reason: 'payment_failed' },
  ended: { state: 'restricted', operational: false, paidThrough: day(-3), reason: 'subscription_canceled' },
  'payment-required': { state: 'restricted', operational: false, plan: 'team', reason: 'payment_required' },
  'over-limit': { state: 'restricted', operational: false, plan: 'small', employeeLimit: 15, activeEmployees: 18, paidThrough: day(29), reason: 'employee_limit_exceeded' },
  'over-30': { state: 'restricted', operational: false, plan: 'team', activeEmployees: 34, paidThrough: day(29), reason: 'employee_limit_exceeded' },
  team: { activeEmployees: 22 },
  setup: { setup: 'required', applicationUrl: null, trialEndsAt: null, reason: 'setup_required' },
  waiting: { setup: 'pending', applicationUrl: null, trialEndsAt: null, reason: 'setup_pending' },
  slow: {}, lost: {}, 'no-zone': { timeZone: null },
};
const sessions = new Map(); // accessToken -> { scenario, seenKeys:Set }
const used = new Set();
const scenarioOf = token => (/^fixture-([a-z0-9-]+?)-[0-9]{12,}$/.exec(token) || [])[1];

const send = (res, status, body, origin) => {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...(origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}) });
  res.end(body === undefined ? '' : JSON.stringify(body));
};
const err = (res, status, code, origin) => send(res, status, { error: { code } }, origin);

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://fixture.invalid');
  // A pretend Stripe page so the return flow can be exercised; it only links back to the Velani return page.
  if (req.method === 'GET' && url.pathname === '/fake-stripe') {
    // The contract's fixed return pages for the requested language (success: billing return; cancel: billing).
    const es = url.searchParams.get('lang') === 'es';
    const back = ui + (es ? '/pages/es-pago' : '/pages/nevora-billing-return') + '#handoff=fixture-' + (url.searchParams.get('next') || 'paid') + '-' + Date.now();
    const cancel = ui + (es ? '/pages/es-facturacion' : '/pages/nevora-billing') + '#handoff=fixture-trial-' + Date.now();
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end('<!doctype html><meta charset="utf-8"><title>Fixture payment page</title><body style="font:16px system-ui;max-width:560px;margin:60px auto;padding:0 20px"><h1>Fixture payment page</h1><p>Local test only. This is not Stripe and nothing is charged.</p><p><a href="' + back + '">Finish (fixture)</a></p><p><a href="' + cancel + '">Cancel (fixture)</a></p>');
    return;
  }
  const origin = req.headers.origin;
  const ok = origin && allowed.has(origin) ? origin : null;
  if (req.method === 'OPTIONS') {
    if (!ok) { res.writeHead(403); res.end(); return; }
    res.writeHead(204, { 'Access-Control-Allow-Origin': ok, 'Access-Control-Allow-Methods': 'GET, POST', 'Access-Control-Allow-Headers': 'Authorization, Content-Type, Idempotency-Key', 'Access-Control-Max-Age': '600', Vary: 'Origin' });
    res.end(); return;
  }
  if (req.method === 'POST' && !ok) return err(res, 403, 'origin_denied', null);
  let body = {};
  if (req.method === 'POST') {
    if (!/^application\/json/.test(req.headers['content-type'] || '')) return err(res, 415, 'json_required', ok);
    let raw = ''; for await (const chunk of req) { raw += chunk; if (raw.length > 4096) return err(res, 413, 'body_too_large', ok); }
    try { body = JSON.parse(raw || '{}'); } catch { return err(res, 400, 'invalid_json', ok); }
  }
  const auth = /^Bearer (.+)$/.exec(req.headers.authorization || '');
  const session = auth && sessions.get(auth[1]);
  const p = url.pathname;
  if (p === '/v1/plans') return send(res, 200, { currency: 'usd', trialDays: 30, plans: [{ key: 'small', employees: 15, amount: 1900 }, { key: 'team', employees: 30, amount: 2900 }] }, ok);
  if (['/v1/signup', '/v1/login-link', '/v1/verify', '/v1/setup'].includes(p)) return err(res, 409, 'use_onboarding', ok);
  if (p === '/v1/handoff/exchange') {
    const scenario = scenarioOf(body.token || '');
    if (!scenario || used.has(body.token) || scenario === 'expired') return err(res, 400, 'invalid_or_expired_link', ok);
    if (scenario === 'down') return err(res, 503, 'billing_unavailable', ok);
    if (scenario === 'slow') await new Promise(r => setTimeout(r, 3000));
    used.add(body.token);
    const accessToken = randomUUID().replace(/-/g, '') + randomUUID().replace(/-/g, '');
    sessions.set(accessToken, { scenario, lostLeft: scenario === 'lost' ? 2 : 0, keys: new Map() }); // two, because Chrome itself retries once on a dropped connection
    return send(res, 200, { accessToken, expiresIn: 28800 }, ok);
  }
  if (!session) return err(res, 401, 'unauthorized', ok);
  if (p === '/v1/status') {
    // A setup scenario moves from required to pending, provisioning and ready on a short clock after /v1/setup.
    if (session.setupAt) {
      const s = (Date.now() - session.setupAt) / 1000;
      const setup = s < 4 ? 'pending' : s < 9 ? 'provisioning' : 'ready';
      return send(res, 200, { ...base, setup, applicationUrl: setup === 'ready' ? base.applicationUrl : null, trialEndsAt: setup === 'ready' ? base.trialEndsAt : null, reason: setup === 'ready' ? null : 'setup_pending', businessName: session.business || base.businessName, activeEmployees: 0 }, ok);
    }
    return send(res, 200, { ...base, ...SCENARIOS[session.scenario] }, ok);
  }
  if (p === '/v1/logout') { sessions.delete(auth[1]); return send(res, 200, { state: 'signed_out' }, ok); }
  if (p === '/v1/checkout' || p === '/v1/portal') {
    const key = req.headers['idempotency-key'];
    if (!/^[0-9a-f-]{36}$/i.test(key || '')) return err(res, 400, 'idempotency_key_required', ok);
    if (!session) return err(res, 401, 'unauthorized', ok);
    if (!Object.prototype.hasOwnProperty.call(body, 'lang') ? false : !['en', 'es'].includes(body.lang)) return err(res, 400, 'invalid_language', ok);
    const s = { ...base, ...SCENARIOS[session.scenario] };
    if (p === '/v1/checkout' && s.activeEmployees > 30) return err(res, 400, 'assisted_quote_required', ok);
    if (p === '/v1/checkout' && s.plan && s.state !== 'restricted') return err(res, 409, 'use_billing_portal', ok);
    if (p === '/v1/portal' && !s.plan) return err(res, 409, 'subscription_required', ok);
    const prior = session.keys.get(key);
    if (prior && prior.body !== JSON.stringify(body)) return err(res, 409, 'idempotency_conflict', ok); // a retry must repeat the same body
    const result = prior ? prior.result : { url: 'http://127.0.0.1:' + port + '/fake-stripe?next=' + (p === '/v1/checkout' ? 'paid' : session.scenario) + '&lang=' + (body.lang || 'en') };
    session.keys.set(key, { body: JSON.stringify(body), result });
    if (session.lostLeft > 0) { session.lostLeft -= 1; req.socket.destroy(); return; } // the response is lost; the same key must get the same answer
    return send(res, 200, result, ok);
  }
  return err(res, 404, 'not_found', ok);
}).listen(port, '127.0.0.1', () => console.log('Commerce FIXTURE (local test only) on http://127.0.0.1:' + port + ' for ' + ui));
