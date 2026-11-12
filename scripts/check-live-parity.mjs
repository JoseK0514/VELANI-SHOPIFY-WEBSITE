// Live parity: build the theme and compare dist/theme with a snapshot of the live Shopify theme files.
// Usage: node scripts/check-live-parity.mjs <snapshot-dir> [--no-build]
// Exits non-zero on any difference other than these accepted ones:
//  - the fingerprint query on module imports between assets ('./inquiry.js?v=…'), as long as the imported file is the same;
//  - JSON templates and locales: Shopify's comment header and empty "settings": {} (compared semantically);
//  - config/settings_data.json (the repo keeps assistant_api_url empty by default);
//  - legacy files that exist only on Shopify (old theme CSS/JS, product-card snippet, non-Velani sections, pet-store PNGs, share PNGs, extra SVGs).
// Files the build writes that the snapshot does not hold (binary images, fonts, extra templates) are listed, not failed:
// the snapshot is a download of the theme's text files.
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';

const args = process.argv.slice(2);
const snapArg = args.find(a => !a.startsWith('--'));
if (!snapArg) { console.error('Usage: node scripts/check-live-parity.mjs <snapshot-dir> [--no-build]'); process.exit(2); }
const snap = path.resolve(snapArg);
const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist/theme');
if (!args.includes('--no-build')) { const { build } = await import('./build.mjs'); await build(); }

async function walk(dir, base = dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full, base));
    else out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out.sort();
}
const exists = async p => { try { await stat(p); return true; } catch { return false; } };

const LEGACY = [
  /^assets\/base\.css$/, /^assets\/global\.js$/, /^assets\/zz-velani-bundle\d*\.css$/,
  /^snippets\/product-card\.liquid$/,
  /^sections\/(?!velani-)[^/]+\.liquid$/,
  /^assets\/velani-[^/]+\.png$/, /^assets\/[^/]+\.svg$/,
  // Unreferenced leftovers on the live theme (checked 2026-11-07): the old time-clock script and the pet theme's section groups.
  /^assets\/velani-home\.js$/, /^sections\/(header|footer)-group\.json$/,
];
const IGNORED = new Set(['config/settings_data.json']);
const isLegacy = file => LEGACY.some(re => re.test(file));

const stripImportFingerprint = text => text.replace(/(['"]\.\/[\w.-]+\.(?:m?js))\?v=[\w.-]+(['"])/g, '$1$2');
const parseShopifyJson = text => JSON.parse(text.replace(/^\s*\/\*[\s\S]*?\*\/\s*/, ''));
const dropEmptySettings = value => {
  if (Array.isArray(value)) return value.map(dropEmptySettings);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (k === 'settings' && v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) continue;
      out[k] = dropEmptySettings(v);
    }
    return out;
  }
  return value;
};
function firstDifference(a, b) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  const line = a.slice(0, i).split('\n').length;
  const show = s => JSON.stringify(s.slice(Math.max(0, i - 60), i + 100));
  return `line ${line}, offset ${i}\n      build:    ${show(a)}\n      snapshot: ${show(b)}`;
}

const snapFiles = await walk(snap);
const distFiles = new Set(await walk(dist));
const failures = [];
const accepted = [];
let identical = 0;

for (const file of snapFiles) {
  if (IGNORED.has(file)) { accepted.push(file + ' (settings data: repo default kept)'); continue; }
  if (!distFiles.has(file)) {
    if (isLegacy(file)) { accepted.push(file + ' (legacy, live only)'); continue; }
    failures.push(`MISSING  ${file} is on the live theme but the build does not produce it`);
    continue;
  }
  const [built, live] = await Promise.all([readFile(path.join(dist, file), 'utf8'), readFile(path.join(snap, file), 'utf8')]);
  if (built === live) { identical++; continue; }
  if (file.endsWith('.json')) {
    let a, b;
    try { a = dropEmptySettings(parseShopifyJson(built)); b = dropEmptySettings(parseShopifyJson(live)); }
    catch (error) { failures.push(`JSON     ${file}: ${error.message}`); continue; }
    if (isDeepStrictEqual(a, b)) { accepted.push(file + ' (JSON formatting only)'); continue; }
    failures.push(`DIFFER   ${file} (JSON content)\n      build:    ${JSON.stringify(a)}\n      snapshot: ${JSON.stringify(b)}`);
    continue;
  }
  if (file.startsWith('assets/') && /\.m?js$/.test(file)) {
    const a = stripImportFingerprint(built), b = stripImportFingerprint(live);
    if (a === b) { accepted.push(file + ' (import fingerprint only)'); continue; }
    failures.push(`DIFFER   ${file}: ${firstDifference(a, b)}`);
    continue;
  }
  failures.push(`DIFFER   ${file}: ${firstDifference(built, live)}`);
}

// Assets the layout and sections ask for that the build does not ship (e.g. share images that exist only on the theme)
const referenced = new Set();
for (const file of [...distFiles].filter(f => /^(layout|sections|snippets)\//.test(f))) {
  const text = await readFile(path.join(dist, file), 'utf8');
  for (const m of text.matchAll(/'([\w.-]+\.(?:png|webp|jpe?g|svg|css|js|woff2))'\s*\|\s*asset_url/g)) referenced.add(m[1]);
  for (const m of text.matchAll(/assign\s+velani_og\s*=\s*'([\w.-]+)'/g)) referenced.add(m[1]);
}
const missingAssets = [...referenced].filter(name => !distFiles.has('assets/' + name)).sort();
const onlyBuild = [...distFiles].filter(f => !snapFiles.includes(f));

console.log(`Snapshot: ${snap}`);
console.log(`Compared ${snapFiles.length} snapshot files: ${identical} identical, ${accepted.length} accepted, ${failures.length} failing.`);
if (accepted.length) console.log('Accepted differences:\n  ' + accepted.join('\n  '));
if (onlyBuild.length) console.log(`Built but not in the snapshot (not compared, ${onlyBuild.length}): ` + onlyBuild.join(', '));
if (missingAssets.length) console.log('Referenced assets with no repo source (exist only on the live theme): ' + missingAssets.join(', '));
if (failures.length) { console.log('FAIL\n  ' + failures.join('\n  ')); process.exit(1); }
console.log('PASS: dist/theme reproduces the snapshot.');
