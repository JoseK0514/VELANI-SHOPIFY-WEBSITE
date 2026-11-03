import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import Fastify, { type FastifyInstance, type FastifyRequest } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import { createVercelHandler, vercelClientIp } from '../src/vercel-handler.js';

const servers: Server[] = [];
const apps: FastifyInstance[] = [];
afterEach(async () => {
  await Promise.all(servers.splice(0).map(server => new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))));
  await Promise.all(apps.splice(0).map(app => app.close()));
});
async function serve(factory: () => FastifyInstance) {
  const handler = createVercelHandler(factory);
  const server = createServer((request, response) => { void handler(request, response); });
  servers.push(server);
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}
it('preserves paths, JSON request streams and delayed responses while initializing once', async () => {
  const app = Fastify({ bodyLimit: 16_384 }); apps.push(app);
  app.post('/v1/echo', async request => {
    await new Promise(resolve => setTimeout(resolve, 20));
    return { body: request.body, path: request.url, authorization: request.headers.authorization };
  });
  const factory = vi.fn(() => app);
  const base = await serve(factory);
  const responses = await Promise.all([1, 2].map(async value => {
    const response = await fetch(`${base}/v1/echo?sample=${value}`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer fixture' }, body: JSON.stringify({ value }) });
    expect(response.status).toBe(200);
    return response.json();
  }));
  expect(responses).toEqual([1, 2].map(value => ({ body: { value }, path: `/v1/echo?sample=${value}`, authorization: 'Bearer fixture' })));
  expect(factory).toHaveBeenCalledTimes(1);
  expect((await fetch(`${base}/v1/echo`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{broken' })).status).toBe(400);
  expect((await fetch(`${base}/v1/echo`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ value: 'x'.repeat(17000) }) })).status).toBe(413);
});
it('returns a safe bootstrap failure and retries initialization on the next request', async () => {
  const app = Fastify(); apps.push(app); app.get('/health/live', () => ({ status: 'ok' }));
  let attempt = 0;
  const base = await serve(() => { if (++attempt === 1) throw new Error('private fixture secret'); return app; });
  const failed = await fetch(`${base}/health/live`);
  expect(failed.status).toBe(503); expect(failed.headers.get('cache-control')).toBe('no-store');
  expect(await failed.text()).not.toContain('private fixture secret');
  expect((await fetch(`${base}/health/live`)).status).toBe(200);
});
it('accepts only a single valid Vercel ingress IP and keeps a conservative fallback', () => {
  const request = (value: unknown) => ({ headers: { 'x-vercel-forwarded-for': value }, ip: '127.0.0.1' } as unknown as FastifyRequest);
  expect(vercelClientIp(request('203.0.113.1'))).toBe('203.0.113.1');
  expect(vercelClientIp(request('2001:db8::1'))).toBe('2001:db8::1');
  for (const value of [undefined, '', '203.0.113.1, 10.0.0.1', ['203.0.113.1'], 'invalid']) expect(vercelClientIp(request(value))).toBe('127.0.0.1');
});
