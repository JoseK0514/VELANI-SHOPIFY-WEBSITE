import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { build, root } from './build.mjs';
import { renderPage, BOOT_JS } from '../src/render.mjs';
import { createHash } from 'node:crypto';
const bootHash = "'sha256-" + createHash('sha256').update(BOOT_JS).digest('base64') + "'";
const args = process.argv.slice(2);
const flag = (name, fallback) => { const i = args.indexOf(name); return i < 0 ? fallback : args[i + 1]; };
const port = Number(flag('--port', '4173'));
// VELANI_ASSISTANT_API (an origin such as http://127.0.0.1:3001) shows the assistant in the preview and opens the policy for it and for Cloudflare Turnstile.
const assistantApi = (process.env.VELANI_ASSISTANT_API || '').trim();
const assistantConnect = assistantApi ? ' ' + new URL(assistantApi).origin + ' https://challenges.cloudflare.com' : '';
const assistantScript = assistantApi ? ' https://challenges.cloudflare.com' : '';
const host = flag('--host', '0.0.0.0');
await build();
const dir = path.join(root, 'dist/preview');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png' };
const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' " + bootHash + assistantScript + "; style-src 'self'; style-src-attr 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'" + assistantConnect + "; frame-src" + (assistantApi ? " https://challenges.cloudflare.com" : " 'none'") + "; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET' && req.method !== 'HEAD') { req.resume(); res.writeHead(405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain' }); res.end('Preview only. No inquiry was sent.'); return; }
  let url;
  try { url = new URL(req.url, 'http://preview.invalid'); } catch { res.writeHead(400); res.end(); return; }
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); } catch { res.writeHead(400); res.end(); return; }
  const relative = pathname === '/' ? 'index.html' : pathname.startsWith('/assets/') ? pathname.slice(1) : pathname.replace(/^\/+|\/+$/g, '') + '/index.html';
  const dest = path.resolve(dir, relative);
  if (!dest.startsWith(dir + path.sep)) { res.writeHead(404); res.end(); return; }
  try {
    const file = await stat(dest);
    if (!file.isFile()) throw Object.assign(new Error('not a file'), { code: 'ENOENT' });
    const data = await readFile(dest);
    res.writeHead(200, { 'Content-Type': types[path.extname(dest)] || 'application/octet-stream' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch (error) {
    if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') { res.writeHead(500); res.end('Preview unavailable'); return; }
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(req.method === 'HEAD' ? undefined : renderPage('/not-found').html);
  }
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, host, () => console.log('Velani preview listening on ' + host + ':' + port));

