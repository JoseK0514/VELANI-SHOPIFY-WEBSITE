import { createReadStream } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import type { FastifyInstance } from 'fastify';

const contentTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
};

/** Register only real public files at startup. Request paths never become filesystem paths. */
export async function registerFrontend(app: FastifyInstance): Promise<void> {
  const root = resolve(process.cwd(), 'public');
  async function registerDirectory(directory: string, prefix: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      const path = resolve(directory, entry.name);
      const url = `${prefix}/${encodeURIComponent(entry.name)}`;
      if (entry.isDirectory()) { await registerDirectory(path, url); continue; }
      if (!entry.isFile()) continue; // Never follow symlinks out of the public root.
      const type = contentTypes[extname(entry.name)];
      if (!type) continue;
      const handler = async (_request: unknown, reply: import('fastify').FastifyReply) => {
        reply.header('Cache-Control', /\.(html|js|css)$/.test(entry.name) ? 'no-cache' : 'public, max-age=3600');
        return reply.type(type).send(createReadStream(path));
      };
      app.get(url, handler);
      if (url === '/index.html') app.get('/', handler);
    }
  }
  await registerDirectory(root, '');
}
