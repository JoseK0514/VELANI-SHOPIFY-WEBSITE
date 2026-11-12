// Runs the real Velani AI Fastify app (its built dist) with an in-memory store and a scripted model, for widget tests only.
// Usage: node scripts/ai-harness/dev-server.mjs <velani-ai dir> [port=3001] [allowed origins=http://127.0.0.1:4173] [captcha=0|1]
//   captcha=1 switches on the CAPTCHA requirement with a fake verifier that accepts "harness-token",
//   so the widget's Turnstile path can be tested with a fake window.turnstile. Nothing here is a deployment.
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { memoryRepository } from './memory-repository.mjs';
import { stubEngine } from './stub-engine.mjs';

const [, , root, port = '3001', origins = 'http://127.0.0.1:4173', captcha = '0'] = process.argv;
if (!root) { console.error('Pass the velani-ai directory.'); process.exit(1); }
const mod = path => import(pathToFileURL(join(root, 'dist', 'src', path)).href);
const { buildApp } = await mod('app.js');
const { readConfig } = await mod('config.js');
const { ModelError } = await mod('engine.js');

const config = readConfig({
  NODE_ENV: 'development', PORT: port, DATABASE_URL: 'postgresql://unused', AI_API_KEY: 'harness', AI_MODEL: 'stub-model',
  SESSION_HASH_SECRET: 'local-harness-secret-not-for-production-use-0000', ALLOWED_ORIGINS: origins,
  REQUIRE_CAPTCHA: captcha === '1' ? 'true' : 'false', ...(captcha === '1' ? { TURNSTILE_SECRET_KEY: 'harness-secret', TURNSTILE_SITE_KEY: 'harness-site-key' } : {}),
});
const repository = memoryRepository(join(root, 'knowledge', 'nevora.json'));
const app = buildApp(config, repository, stubEngine({ ModelError }), {
  logger: false, serveWeb: false, verifyCaptcha: async token => token === 'harness-token',
});
await app.listen({ port: Number(port), host: '127.0.0.1' });
console.log(`harness API on http://127.0.0.1:${port} (origins: ${origins}; captcha: ${captcha === '1' ? 'required, fake verifier' : 'off'})`);
