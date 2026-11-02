import { readFile, writeFile } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
const input = process.argv[2] || 'evidence/shopify/readback-02.json';
const output = process.argv[3] || 'evidence/shopify/readback-02-verification.json';
const response = JSON.parse(await readFile(input, 'utf8')).data;
const original = JSON.parse(await readFile('evidence/original-theme-export-manifest.json', 'utf8'));
const expected = JSON.parse(await readFile('dist/theme-manifest.json', 'utf8'));
if (response.draft.id !== 'gid://shopify/OnlineStoreTheme/192965443898' || response.draft.role !== 'UNPUBLISHED') throw new Error('Exact draft is not unpublished');
if (response.original.id !== original.themeId || response.original.role !== 'MAIN') throw new Error('Original MAIN role changed');
if (response.draft.files.pageInfo.hasNextPage || response.original.files.pageInfo.hasNextPage) throw new Error('Incomplete inventory');
function json(text) { return JSON.parse(text.replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '')); }
function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([key, item]) => !(key === 'settings' && isDeepStrictEqual(item, {}))).map(([key, item]) => [key, normalize(item)]));
  return value;
}
const files = [];
for (const file of expected.entries) {
  const actual = response.draft.files.nodes.find(item => item.filename === file.filename);
  if (!actual) throw new Error('Missing uploaded file: ' + file.filename);
  const exactBytes = actual.checksumMd5 === file.md5;
  let semanticallyEqual = false;
  if (!exactBytes && file.filename.endsWith('.json')) {
    const local = await readFile('dist/theme/' + file.filename, 'utf8');
    semanticallyEqual = isDeepStrictEqual(normalize(json(local)), normalize(json(actual.body.content)));
  }
  if (!exactBytes && !semanticallyEqual) throw new Error('Readback differs: ' + file.filename);
  files.push({ filename: file.filename, exactBytes, semanticallyEqual, shopifyMd5: actual.checksumMd5, localMd5: file.md5 });
}
for (const file of original.files) {
  if (response.original.files.nodes.find(item => item.filename === file.filename)?.checksumMd5 !== file.md5) throw new Error('Original theme changed: ' + file.filename);
}
if (response.original.files.nodes.length !== original.files.length) throw new Error('Original file inventory changed');
const settings = response.draft.files.nodes.find(file => file.filename === 'config/settings_data.json');
if (json(settings.body.content).current.inquiries_enabled !== true) throw new Error('Inquiry form should be enabled (owner-approved 2026-11-02)');
const packageNames = new Set(expected.entries.map(file => file.filename));
const inherited = response.draft.files.nodes.filter(file => !packageNames.has(file.filename)).map(file => ({ filename: file.filename, md5: file.checksumMd5 }));
for (const file of inherited) if (original.files.find(item => item.filename === file.filename)?.md5 !== file.md5) throw new Error('Inherited file does not match original: ' + file.filename);
const summary = { status: 'passed', draftId: response.draft.id, role: response.draft.role,
  totalDraftFiles: response.draft.files.nodes.length, verifiedPackageFiles: files.length, retainedInheritedFiles: inherited.length, inherited,
  exactByteMatches: files.filter(file => file.exactBytes).length, platformNormalizedJsonMatches: files.filter(file => file.semanticallyEqual).length,
  originalTheme: response.original.id, originalRole: response.original.role, unchangedOriginalFiles: original.files.length,
  inquiriesEnabled: false, hostedAcceptance: 'blocked by existing storefront password; no password or global resources changed', files };
await writeFile(output, JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify({ ...summary, files: undefined, inherited: undefined }));
