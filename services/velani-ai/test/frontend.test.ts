import Fastify from 'fastify';
import { afterEach, expect, it } from 'vitest';
import { registerFrontend } from '../src/frontend.js';

const apps: ReturnType<typeof Fastify>[] = [];
function app() { const server = Fastify(); server.register(registerFrontend); apps.push(server); return server; }
afterEach(async () => { await Promise.all(apps.splice(0).map(server => server.close())); });

it('serves the guide and executable module with correct content types', async () => {
  const server = app();
  const home = await server.inject('/');
  expect(home.statusCode).toBe(200); expect(home.headers['content-type']).toContain('text/html');
  expect(home.body).toContain('Create my workflow plan');
  const script = await server.inject('/app.js');
  expect(script.statusCode).toBe(200); expect(script.headers['content-type']).toContain('text/javascript');
  expect(script.headers['cache-control']).toBe('no-cache');
});
it('does not serve environment files, source, dependencies or traversal paths', async () => {
  const server = app();
  for (const path of ['/.env', '/.env.runtime', '/src/server.ts', '/node_modules/pg/package.json', '/assets/../../.env', '/%2e%2e/.env', '/docs/CLAUDE-HANDOFF.md']) {
    expect((await server.inject(path)).statusCode).toBe(404);
  }
});
it('serves local font assets with font MIME types', async () => {
  const response = await app().inject('/assets/manrope.woff2');
  expect(response.statusCode).toBe(200); expect(response.headers['content-type']).toContain('font/woff2');
  expect(response.rawPayload.length).toBeGreaterThan(1000);
});
