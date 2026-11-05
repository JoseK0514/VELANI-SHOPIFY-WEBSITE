import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, expect, it, vi } from 'vitest';
import { createRetentionHandler } from '../src/retention-handler.js';

const servers: Server[] = [];
afterEach(async () => { await Promise.all(servers.splice(0).map(server => new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())))); });
async function serve(environment: NodeJS.ProcessEnv, run = vi.fn(async () => ({ sessions: 2 }))) {
  const handler = createRetentionHandler(environment, run);
  const server = createServer((request: IncomingMessage, response: ServerResponse) => { void handler(request, response); });
  servers.push(server);
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  return { url: `http://127.0.0.1:${(server.address() as AddressInfo).port}`, run };
}
const secret = 'isolated-test-cron-secret-at-least-32-characters';
const environment = { VERCEL_ENV: 'production', CRON_SECRET: secret };
const headers = { Authorization: `Bearer ${secret}` };

it('fails closed without a production environment or a sufficiently long configured secret', async () => {
  for (const env of [{}, { ...environment, VERCEL_ENV: 'preview' }, { ...environment, CRON_SECRET: '' }, { ...environment, CRON_SECRET: 'short' }]) {
    const { url, run } = await serve(env);
    const response = await fetch(url, { headers });
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(run).not.toHaveBeenCalled();
  }
});
it('rejects missing, incorrect and malformed authorization without accessing data', async () => {
  const { url, run } = await serve(environment);
  for (const value of ['', 'Bearer wrong', `Basic ${secret}`, `Bearer ${secret}, Bearer ${secret}`]) {
    expect((await fetch(url, { headers: { Authorization: value } })).status).toBe(401);
  }
  expect(run).not.toHaveBeenCalled();
});
it('accepts only GET and returns aggregate counts for an authorized applied run', async () => {
  const { url, run } = await serve(environment);
  const denied = await fetch(url, { method: 'POST', headers });
  expect(denied.status).toBe(405); expect(denied.headers.get('allow')).toBe('GET');
  expect(run).not.toHaveBeenCalled();
  const response = await fetch(url, { headers });
  expect(response.status).toBe(200);
  expect(response.headers.get('cache-control')).toBe('no-store');
  expect(await response.json()).toEqual({ status: 'ok', sessions: 2 });
  expect(run).toHaveBeenCalledTimes(1);
});
it('reports a failed job without exposing database errors and allows a later retry', async () => {
  const run = vi.fn().mockRejectedValueOnce(new Error('postgresql://private:credential@host/db')).mockResolvedValueOnce({ sessions: 0 });
  const { url } = await serve(environment, run);
  const response = await fetch(url, { headers });
  expect(response.status).toBe(500);
  expect(await response.text()).toBe('{"status":"error","code":"retention_failed"}');
  expect((await fetch(url, { headers })).status).toBe(200);
});
