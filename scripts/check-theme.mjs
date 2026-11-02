import { check } from '@shopify/theme-check-node';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const offenses = await check(path.resolve('dist/theme'));
await mkdir('evidence', { recursive: true });
await writeFile('evidence/theme-check.json', JSON.stringify(offenses, null, 2));
console.log(JSON.stringify(offenses.map(x => ({ check: x.check, message: x.message, severity: x.severity, uri: x.uri, start: x.start })), null, 2));
if (offenses.some(x => x.severity === 0)) process.exitCode = 1;

