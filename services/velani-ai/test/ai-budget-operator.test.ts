import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterAll, beforeAll, expect, it } from 'vitest';

let directory: string;
let file: string;
const id = 'c2ad7b78-967d-4d27-a334-67f7e8ede792';
beforeAll(async () => {
  directory = await mkdtemp(join(tmpdir(), 'rondo-budget-operator-'));
  file = join(directory, 'synthetic-approval.json');
  await writeFile(file, JSON.stringify({
    id, providerBaseUrl: 'https://ai.example.test/v1', limitMicrousd: 20000,
    validFrom: '2026-11-12T00:00:00Z', validUntil: '2026-11-13T00:00:00Z',
    approvedReference: 'SYNTHETIC-NO-SPENDING',
    models: [{ model: 'fixture', contextTokens: 1000, outputTokenLimit: 6000,
      inputMicrousdPerMillion: 1000000, outputMicrousdPerMillion: 2000000 }],
  }));
});
afterAll(async () => { await rm(directory, { recursive: true, force: true }); });
function run(args: string[], extra: NodeJS.ProcessEnv = {}) {
  return spawnSync(process.execPath, ['--import', 'tsx', resolve('scripts/ai-budget.ts'), ...args], {
    encoding: 'utf8', timeout: 5000,
    env: { PATH: process.env.PATH, TMPDIR: process.env.TMPDIR, ...extra },
  });
}
it('prints an offline proposal without a database connection or activation', () => {
  const result = run(['--file=' + file]);
  expect(result.status).toBe(0);
  expect(JSON.parse(result.stdout)).toMatchObject({ authorizationId: id, applied: false, targetVerified: false, limitMicrousd: 20000 });
});
it('prints an offline pause without resetting usage or requiring a secret', () => {
  const result = run(['--pause=' + id]);
  expect(result.status).toBe(0);
  expect(JSON.parse(result.stdout)).toEqual({ action: 'pause_allowance', authorizationId: id, applied: false, targetVerified: false });
});
it('refuses apply with no explicit owner target and never falls back to DATABASE_URL', () => {
  const result = run(['--file=' + file, '--apply'], { DATABASE_URL: 'postgresql://fixture@127.0.0.1:9/unused' });
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('ai_budget_operator_action_failed');
  expect(result.stderr).not.toContain('postgresql:');
});
it.each([
  ['--expected-host=127.0.0.2', '--expected-database=unused'],
  ['--expected-host=127.0.0.1', '--expected-database=other'],
  ['--expected-host=127.0.0.1', '--expected-database=unused', '--apply'],
])('rejects a mismatched target or duplicate mutation flag before connecting: %j', (...target) => {
  const result = run(['--file=' + file, '--apply', ...target], { DATABASE_URL_UNPOOLED: 'postgresql://fixture@127.0.0.1:9/unused' });
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('ai_budget_operator_action_failed');
});
