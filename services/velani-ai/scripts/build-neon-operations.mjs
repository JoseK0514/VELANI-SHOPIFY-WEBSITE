import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const repo = git(['rev-parse', '--show-toplevel']);
const service = relative(repo,root).replaceAll('\\','/');
const runGit = args => execFileSync('git',args,{cwd:repo,encoding:'utf8'}).trim();
if (runGit(['diff','--name-only','HEAD','--',service])) throw Error('Commit tracked backend changes before building.');
if (runGit(['ls-files','--others','--exclude-standard','--',service+'/src',service+'/functions',service+'/scripts',service+'/migrations'])) throw Error('Commit new backend source before building.');
const source = git(['rev-parse','HEAD']);
const output = process.argv[2];
if (!output || !isAbsolute(output)) throw Error('Pass a new absolute output directory.');
await mkdir(output,{mode:0o700});
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const manifests = [];
for (const role of ['monitor','retention']) {
  const compiled = await build({
    absWorkingDir:root, entryPoints:['functions/rondo-'+role+'.ts'], bundle:true,
    platform:'node',target:'node24',format:'esm',minify:true,metafile:true,write:false,
    external:['pg-native'],define:{__RONDO_SOURCE_SHA__:JSON.stringify(source)},
    banner:{js:"import {createRequire as __createRequire} from 'node:module';const require=__createRequire(import.meta.url);"},
  });
  const code = compiled.outputFiles[0].contents;
  await writeFile(resolve(output,role+'.mjs'),code);
  const inputs=[];
  for(const path of Object.keys(compiled.metafile.inputs).filter(path=>!path.includes('node_modules/')).sort()){
    inputs.push({path,sha256:sha(await readFile(resolve(root,path)))});
  }
  const archive=resolve(output,role+'.zip');
  const py="import sys,zipfile\nfrom pathlib import Path\nroot=Path(sys.argv[1]);role=sys.argv[2]\nwith zipfile.ZipFile(root/(role+'.zip'),'x',compression=zipfile.ZIP_DEFLATED) as z:\n z.write(root/(role+'.mjs'),'index.mjs')\n z.writestr('package.json','{\"type\":\"module\"}')\n";
  execFileSync('python3',['-c',py,output,role]);
  manifests.push({role,sourceSha:source,runtime:'nodejs24',archive,archiveSha256:sha(await readFile(archive)),bundleSha256:sha(code),inputs});
}
const manifest={sourceSha:source,packageSha256:sha(await readFile(resolve(root,'package.json'))),
  lockSha256:sha(await readFile(resolve(root,'package-lock.json'))),functions:manifests};
await writeFile(resolve(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify(manifest));
