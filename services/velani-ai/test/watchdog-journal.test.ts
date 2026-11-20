import { randomUUID } from 'node:crypto';
import { chmod, lstat, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createServer } from 'node:http';
import { Pool } from 'pg';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { initializeWatchdog, observeWatchdog, type WatchdogPolicy } from '../src/watchdog-journal.js';
import { sampleRondoWatchdog } from '../src/rondo-watchdog.js';
import { runWatchdog } from '../scripts/watchdog.js';

let root: string, directory: string, policy: WatchdogPolicy;
const source = 'a'.repeat(40), now = Date.parse('2026-11-14T12:00:00Z');
const unavailable = async () => ({ status: 'unavailable' as const, alerts: ['watchdog_probe_unavailable'] });
const healthy = async () => ({ status: 'ok' as const, alerts: [] });
beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'rondo-watchdog-'));
  directory = join(root, 'journal');
  policy = { id: randomUUID(), scope: 'development', target: 'velani_rondo_development', approvalReference: 'SYNTHETIC-TEST-ONLY',
    recipient: 'support@thevelani.com',
    validFrom: '2026-11-14T00:00:00Z', validUntil: '2026-11-15T00:00:00Z', mailEnabled: true, maxAttempts: 2 };
  await initializeWatchdog(directory, policy);
});
afterEach(async () => { await rm(root, { recursive: true, force: true }); });
const state = async () => JSON.parse(await readFile(join(directory, 'watchdog.json'), 'utf8'));

it('refuses a policy for the wrong deployment at the operator entry point before creating any journal', async () => {
  const file = join(root, 'operator-policy.json'), destination = join(root, 'operator-journal');
  await writeFile(file, JSON.stringify(policy), { mode: 0o600 });
  const environment = { RONDO_WATCHDOG_ENVIRONMENT: 'production', RONDO_WATCHDOG_POLICY_FILE: file, RONDO_WATCHDOG_STATE_DIR: destination };
  await expect(runWatchdog('initialize', environment)).rejects.toThrow('watchdog_configuration_invalid');
  await expect(lstat(destination)).rejects.toMatchObject({ code: 'ENOENT' });
  await writeFile(file, JSON.stringify({ ...policy, scope: 'production', target: 'velani_ai' }), { mode: 0o600 });
  expect(await runWatchdog('initialize', environment)).toMatchObject({ status: 'initialized', maxAttempts: 2 });
});

it('keeps production policy and finite attempts separate and refuses a crossed target or retargeting an existing journal', async () => {
  const production = { ...policy, scope: 'production' as const, target: 'velani_ai' as const };
  const destination = join(root, 'production-journal');
  await initializeWatchdog(destination, production);
  let calls = 0;
  const notify = async () => { calls++; return { id: randomUUID() }; };
  await observeWatchdog(destination, production, source, unavailable, notify, { now: () => now });
  await observeWatchdog(destination, production, source, unavailable, notify, { now: () => now });
  expect(calls).toBe(1);
  expect(JSON.parse(await readFile(join(destination, 'watchdog.json'), 'utf8')).used).toBe(1);
  await expect(observeWatchdog(directory, production, source, unavailable, notify, { now: () => now })).rejects.toThrow('watchdog_policy_changed');
  await expect(initializeWatchdog(join(root, 'crossed-policy'), { ...production, target: 'velani_rondo_development' })).rejects.toThrow();
  expect((await state()).used).toBe(0);
});

it('alerts when the observed database is unavailable and commits its intent outside that database before dispatch', async () => {
  const sent: string[] = [];
  const notify = async (kind: string) => {
    const saved = await state();
    expect(saved.used).toBe(sent.length + 1);
    expect(saved.notices.find((n: { kind: string }) => n.kind === kind).status).toBe('sending');
    sent.push(kind); return { id: randomUUID() };
  };
  await observeWatchdog(directory, policy, source, healthy, notify, { now: () => now });
  const outage = await observeWatchdog(directory, policy, source, async () => { throw Error('private password postgres://not-logged'); }, notify, { now: () => now });
  expect(outage).toMatchObject({ status: 'unavailable', notice: 'submitted', attemptsUsed: 1 });
  await observeWatchdog(directory, policy, source, unavailable, notify, { now: () => now });
  await observeWatchdog(directory, policy, 'b'.repeat(40), healthy, notify, { now: () => now });
  expect(sent).toEqual(['outage', 'recovery']);
  expect(JSON.stringify(await state())).not.toMatch(/private password|postgres:/);
});
it('keeps ambiguous delivery consumed across restarts, source changes and incidents', async () => {
  let sent = 0;
  const notify = async () => { sent++; throw Error('acknowledgement lost after provider acceptance'); };
  expect((await observeWatchdog(directory, policy, source, unavailable, notify, { now: () => now })).notice).toBe('uncertain');
  await observeWatchdog(directory, policy, 'b'.repeat(40), unavailable, notify, { now: () => now });
  expect(sent).toBe(1);
  await observeWatchdog(directory, policy, source, healthy, notify, { now: () => now });
  expect(sent).toBe(2);
  expect((await observeWatchdog(directory, policy, source, unavailable, notify, { now: () => now })).notice).toBe('capped');
  expect(sent).toBe(2);
});
it('never resends an intent left sending after a crash', async () => {
  await observeWatchdog(directory, policy, source, unavailable, async () => { throw Error('lost'); }, { now: () => now });
  const saved = await state(); saved.notices[0].status = 'sending';
  await writeFile(join(directory, 'watchdog.json'), JSON.stringify(saved), { mode: 0o600 });
  let sent = 0;
  expect((await observeWatchdog(directory, policy, source, unavailable, async () => { sent++; return { id: randomUUID() }; }, { now: () => now })).notice).toBe('uncertain');
  expect(sent).toBe(0);
});
it('bounds hung acknowledgements and does not retry them', async () => {
  let sent = 0;
  const notify = async () => { sent++; return new Promise<{ id: string }>(() => {}); };
  const result = await observeWatchdog(directory, policy, source, unavailable, notify, { now: () => now, deliveryTimeoutMs: 20 });
  expect(result.notice).toBe('uncertain');
  await observeWatchdog(directory, policy, source, unavailable, notify, { now: () => now });
  expect(sent).toBe(1);
});
it('keeps disabled and expired approvals inert, including expiry after the durable claim', async () => {
  let sent = 0;
  const notify = async () => { sent++; return { id: randomUUID() }; };
  await rm(directory, { recursive: true }); policy = { ...policy, mailEnabled: false, maxAttempts: 0 };
  await initializeWatchdog(directory, policy);
  expect((await observeWatchdog(directory, policy, source, unavailable, notify, { now: () => now })).notice).toBe('disabled');
  await rm(directory, { recursive: true }); policy = { ...policy, mailEnabled: true, maxAttempts: 2 };
  await initializeWatchdog(directory, policy);
  await observeWatchdog(directory, policy, source, unavailable, notify, { now: () => Date.parse(policy.validUntil) });
  expect(sent).toBe(0);
  await rm(directory, { recursive: true }); await initializeWatchdog(directory, policy);
  let reads = 0;
  const result = await observeWatchdog(directory, policy, source, unavailable, notify, {
    now: () => ++reads === 1 ? now : Date.parse(policy.validUntil),
  });
  expect(result.notice).toBe('uncertain'); expect(result.attemptsUsed).toBe(1); expect(sent).toBe(0);
});
it('serializes separate observers and never steals an unexplained lock', async () => {
  let entered!: () => void, release!: () => void;
  const ready = new Promise<void>(resolve => { entered = resolve; });
  const waiting = new Promise<void>(resolve => { release = resolve; });
  const first = observeWatchdog(directory, policy, source, async () => { entered(); await waiting; return unavailable(); }, async () => ({ id: randomUUID() }), { now: () => now });
  await ready;
  await expect(observeWatchdog(directory, policy, source, healthy, async () => ({ id: randomUUID() }), { now: () => now })).rejects.toThrow();
  release(); await first;
  await writeFile(join(directory, 'watchdog.lock'), 'retained unknown custody', { mode: 0o600 });
  await expect(observeWatchdog(directory, policy, source, healthy, async () => ({ id: randomUUID() }), { now: () => now })).rejects.toThrow();
  expect(await readFile(join(directory, 'watchdog.lock'), 'utf8')).toBe('retained unknown custody');
});
it('refuses missing, altered, public or linked state instead of recreating an allowance', async () => {
  const notify = async () => ({ id: randomUUID() });
  await expect(initializeWatchdog(directory, policy)).rejects.toThrow();
  await expect(observeWatchdog(directory, { ...policy, maxAttempts: 3 }, source, healthy, notify, { now: () => now })).rejects.toThrow();
  await expect(observeWatchdog(directory, { ...policy, recipient: 'josekarlo-@hotmail.com' }, source, healthy, notify, { now: () => now })).rejects.toThrow();
  await chmod(join(directory, 'watchdog.json'), 0o644);
  await expect(observeWatchdog(directory, policy, source, healthy, notify, { now: () => now })).rejects.toThrow();
  await rm(join(directory, 'watchdog.json'));
  await expect(observeWatchdog(directory, policy, source, healthy, notify, { now: () => now })).rejects.toThrow();
  await writeFile(join(root, 'outside'), '{}', { mode: 0o600 });
  await symlink(join(root, 'outside'), join(directory, 'watchdog.json'));
  await expect(observeWatchdog(directory, policy, source, healthy, notify, { now: () => now })).rejects.toThrow();
  expect((await lstat(join(directory, 'watchdog.json'))).isSymbolicLink()).toBe(true);
});
it('rejects reversed observation time without rolling back the retained counter', async () => {
  await observeWatchdog(directory, policy, source, unavailable, async () => ({ id: randomUUID() }), { now: () => now });
  await expect(observeWatchdog(directory, policy, source, healthy, async () => ({ id: randomUUID() }), { now: () => now - 1 })).rejects.toThrow();
  expect((await state()).used).toBe(1);
});

it('records an actual PostgreSQL connection failure and delivers to an owned independent HTTP fixture', async () => {
  const server = createServer((request, response) => {
    expect(request.method).toBe('POST'); response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ id: 'synthetic-local-provider' }));
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address(); if (!address || typeof address === 'string') throw Error('fixture');
  const failedPool = new Pool({ connectionString: 'postgresql://synthetic@127.0.0.1:1/missing', connectionTimeoutMillis: 100 });
  failedPool.on('error', () => undefined);
  try {
    const result = await observeWatchdog(directory, policy, source,
      () => sampleRondoWatchdog(failedPool, { database: 'missing', role: 'synthetic', authorizationId: randomUUID() }, 200),
      async () => { const response = await fetch('http://127.0.0.1:' + address.port, { method: 'POST' }); return await response.json() as { id: string }; },
      { now: () => now });
    expect(result).toMatchObject({ status: 'unavailable', notice: 'submitted', attemptsUsed: 1 });
    expect((await state()).notices[0].providerId).toBe('synthetic-local-provider');
  } finally { await failedPool.end(); await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
});

it('preserves incident and lifetime allowance across four actual process executions', async () => {
  const sent: string[] = [];
  const server = createServer((request, response) => {
    const chunks: Buffer[] = [];
    request.on('data', data => chunks.push(data));
    request.on('end', () => {
      sent.push(JSON.parse(Buffer.concat(chunks).toString()).kind);
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ id: 'synthetic-process-provider-' + sent.length }));
    });
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address(); if (!address || typeof address === 'string') throw Error('fixture');
  const run = async (status: string, sha: string) => {
    const result = await promisify(execFile)(process.execPath, ['--import', 'tsx', join(import.meta.dirname, 'watchdog-process-fixture.mjs'),
      directory, JSON.stringify(policy), String(now), status, 'http://127.0.0.1:' + address.port, sha], { timeout: 5000 });
    return JSON.parse(result.stdout);
  };
  try {
    expect((await run('unavailable', source)).notice).toBe('submitted');
    await run('unavailable', 'b'.repeat(40));
    expect((await run('ok', 'c'.repeat(40))).notice).toBe('submitted');
    expect((await run('attention', 'd'.repeat(40))).notice).toBe('capped');
    expect(sent).toEqual(['outage', 'recovery']); expect((await state()).used).toBe(2);
  } finally { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
}, 20_000);
