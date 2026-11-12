import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';

let child, base;
before(async () => {
  const reservation = createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  const env = Object.fromEntries(['PATH', 'HOME', 'TMPDIR'].filter(k => process.env[k]).map(k => [k, process.env[k]]));
  child = spawn(process.execPath, ['scripts/serve.mjs', '--host', '127.0.0.1', '--port', String(port)], { cwd: new URL('..', import.meta.url), env, stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Preview did not start')), 10000);
    child.stdout.on('data', data => { if (data.toString().includes('Velani preview listening')) { clearTimeout(timer); resolve(); } });
    child.once('exit', code => { clearTimeout(timer); reject(new Error('Preview exited: ' + code)); });
  });
  base = 'http://127.0.0.1:' + port;
});
after(async () => {
  if (child && child.exitCode === null) { const exited = once(child, 'exit'); child.kill('SIGTERM'); await exited; }
});

for (const route of ['/', '/pages/nevora-start', '/pages/es-prueba', '/missing-page']) {
  test('preview CSP permits the compiled inline scripts at ' + route, async () => {
    const response = await fetch(base + route);
    assert.equal(response.status, route === '/missing-page' ? 404 : 200);
    const html = await response.text();
    const policy = response.headers.get('content-security-policy');
    const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
      .filter(([, attrs]) => !/\bsrc\s*=|application\/ld\+json/i.test(attrs));
    assert.ok(scripts.length > 0, 'The compiled page must exercise an inline script');
    for (const [, , code] of scripts) {
      const hash = createHash('sha256').update(code).digest('base64');
      assert.ok(policy.includes("'sha256-" + hash + "'"), 'The actual compiled script is blocked by CSP');
    }
    const scriptSources = policy.split(';').find(part => part.trim().startsWith('script-src '));
    assert.ok(!scriptSources.includes("'unsafe-inline'") && !scriptSources.includes("'unsafe-eval'"));
    const injectedHash = createHash('sha256').update('window.unapprovedInline = true').digest('base64');
    assert.ok(!scriptSources.includes(injectedHash), 'An unrelated inline script must remain blocked');
    assert.ok(policy.includes("connect-src 'self';"), 'Unconfigured external APIs must remain blocked');
  });
}
