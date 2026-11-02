import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const root = path.resolve('dist/theme');
const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.isFile()) {
      const filename = path.relative(root, full).split(path.sep).join('/');
      if (!/^(assets|config|layout|locales|sections|templates)\//.test(filename)) throw new Error('Unexpected theme path: ' + filename);
      const raw = await readFile(full);
      files.push({ filename, bytes: raw.length, md5: createHash('md5').update(raw).digest('hex'), sha256: createHash('sha256').update(raw).digest('hex') });
    } else throw new Error('Unsupported file type: ' + full);
  }
}
await walk(root);
files.sort((a, b) => a.filename.localeCompare(b.filename));
for (const required of ['layout/theme.liquid', 'templates/index.json', 'templates/404.json', 'config/settings_schema.json']) {
  if (!files.some(file => file.filename === required)) throw new Error('Required theme file missing: ' + required);
}
const jsonFiles = files.filter(file => file.filename.endsWith('.json'));
for (const file of jsonFiles) {
  const data = JSON.parse(await readFile(path.join(root, file.filename), 'utf8'));
  if (file.filename.startsWith('templates/')) {
    const liquid = file.filename.replace(/\.json$/, '.liquid');
    if (files.some(file => file.filename === liquid)) throw new Error('Conflicting template extensions: ' + liquid);
    for (const section of Object.values(data.sections || {})) if (!files.some(file => file.filename === 'sections/' + section.type + '.liquid')) throw new Error('Missing section: ' + section.type);
  }
}
const settings = JSON.parse(await readFile(path.join(root, 'config/settings_data.json'), 'utf8'));
if (settings.current.inquiries_enabled !== false) throw new Error('Draft inquiry gate must remain disabled');
const zip = path.resolve('dist/velani-midnight-unpublished.zip');
execFileSync('python3', ['-c', `import pathlib,sys,zipfile
root=pathlib.Path(sys.argv[1]); out=pathlib.Path(sys.argv[2])
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
 for p in sorted(root.rglob('*')):
  if p.is_file():
   info=zipfile.ZipInfo(p.relative_to(root).as_posix(),(2026,11,2,0,0,0)); info.compress_type=zipfile.ZIP_DEFLATED; info.external_attr=0o100644 << 16; z.writestr(info,p.read_bytes())
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 assert len(set(z.namelist()))==len(z.namelist())
`, root, zip]);
const raw = await readFile(zip);
const manifest = { format: 1, theme: 'Velani Midnight', state: 'Night redesign; inquiry delivery off until enabled in theme settings', files: files.length, jsonFiles: jsonFiles.length, zip: path.basename(zip), bytes: raw.length, sha256: createHash('sha256').update(raw).digest('hex'), entries: files };
await writeFile('dist/theme-manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ ...manifest, entries: undefined }));
