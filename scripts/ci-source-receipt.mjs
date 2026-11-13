import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { join, isAbsolute, relative } from 'node:path';

const git = args => execFileSync('git', args, { encoding: 'utf8' }).trim();
const expected = process.env.GITHUB_SHA;
const sha = git(['rev-parse', 'HEAD']), tree = git(['rev-parse', 'HEAD^{tree}']);
assert.match(expected ?? '', /^[a-f0-9]{40}$/);
assert.equal(sha, expected, 'Checkout must match the triggering source');
assert.equal(git(['status', '--porcelain']), '', 'Tracked/generated source must remain clean');
const paths = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const hashes = {};
for (const path of paths) hashes[path] = createHash('sha256').update(await readFile(path)).digest('hex');
const context = { sha, tree, runId: process.env.GITHUB_RUN_ID, attempt: process.env.GITHUB_RUN_ATTEMPT,
  ref: process.env.GITHUB_REF, event: process.env.GITHUB_EVENT_NAME };
async function testSummary(path) {
  const bytes = await readFile(path), report = JSON.parse(bytes);
  assert.equal(report.success, true); assert.equal(report.numFailedTests, 0);
  assert.equal(report.numPendingTests, 0); assert.equal(report.numTodoTests, 0);
  assert.equal(report.numPassedTests, report.numTotalTests);
  assert(report.numTotalTests >= 261, 'Execute the complete PostgreSQL service suite');
  const expectedPaths = paths.filter(path => /^services\/velani-ai\/test\/.*\.test\.(ts|mjs)$/.test(path)).sort();
  const executedPaths = report.testResults.map(file => relative(process.cwd(), file.name).replaceAll('\\', '/')).sort();
  assert.deepEqual(executedPaths, expectedPaths, 'Every service test file must execute exactly once');
  const assertions = report.testResults.flatMap(file => {
    assert.equal(file.status, 'passed'); assert(file.assertionResults.length > 0); return file.assertionResults;
  });
  assert.equal(assertions.length, report.numTotalTests); assert(assertions.every(test => test.status === 'passed'));
  return { tests: { passed: report.numPassedTests, failed: report.numFailedTests, skipped: report.numPendingTests },
    testReportSha256: createHash('sha256').update(bytes).digest('hex') };
}
if (process.argv[2] === '--verify') {
  const directory = process.argv[3]; assert(isAbsolute(directory ?? ''));
  for (const name of ['website', 'backend']) {
    const receipt = JSON.parse(await readFile(join(directory, 'velani-qualification-' + name + '-' + sha, name + '-source.json'), 'utf8'));
    for (const [key, value] of Object.entries(context)) assert.equal(receipt[key], value, key);
    assert.deepEqual(receipt.hashes, hashes, name + ' complete source hashes');
    assert.equal(receipt.sourceClean, true);
    if (name === 'backend') {
      const report = await testSummary(join(directory, 'velani-qualification-backend-' + sha, 'backend-tests.json'));
      assert.deepEqual(receipt.tests, report.tests); assert.equal(receipt.testReportSha256, report.testReportSha256);
      const nativeDirectory = join(directory, 'velani-qualification-backend-' + sha, 'rondo-native-operations');
      const native = JSON.parse(await readFile(join(nativeDirectory, 'manifest.json'), 'utf8'));
      assert.equal(native.sourceSha, sha); assert.equal(native.functions.length, 2);
      assert.deepEqual(native.functions.map(item => item.role).sort(), ['monitor', 'retention']);
      for (const entry of native.functions) {
        assert.equal(entry.sourceSha, sha); assert.equal(entry.runtime, 'nodejs24');
        assert.equal(createHash('sha256').update(await readFile(join(nativeDirectory, entry.role + '.zip'))).digest('hex'), entry.archiveSha256);
        assert.equal(createHash('sha256').update(await readFile(join(nativeDirectory, entry.role + '.mjs'))).digest('hex'), entry.bundleSha256);
        for (const input of entry.inputs) assert.equal(hashes['services/velani-ai/' + input.path], input.sha256, input.path);
      }
    }
  }
  console.log(JSON.stringify({ ...context, sourceFiles: paths.length, verified: ['website', 'backend'] }));
} else {
  const output = process.argv[2]; assert(isAbsolute(output ?? ''));
  const report = process.argv[3] ? await testSummary(process.argv[3]) : {};
  await writeFile(output, JSON.stringify({ ...context, sourceClean: true, node: process.version, hashes, ...report }, null, 2) + '\n');
  console.log(JSON.stringify({ ...context, sourceFiles: paths.length, ...report }));
}
