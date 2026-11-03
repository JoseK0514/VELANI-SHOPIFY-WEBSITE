import { writeFile } from 'node:fs/promises';
import { administrationPool } from './migrate.js';

const limit = Number(process.argv.find(arg => arg.startsWith('--limit='))?.slice(8) ?? 100);
if (!Number.isInteger(limit) || limit < 1 || limit > 1000) throw new Error('--limit must be between 1 and 1000');
const output = process.argv.find(arg => arg.startsWith('--out='))?.slice(6);
if (!output) throw new Error('Pass --out=/private/path/leads.json. This file will contain personal contact details.');
const pool = administrationPool();
try {
  const result = await pool.query(`SELECT id, name, email, company, team_size AS "teamSize", locations,
    message, consent_version AS "consentVersion", plan_snapshot AS "planSnapshot", created_at AS "createdAt"
    FROM leads ORDER BY created_at DESC LIMIT $1`, [limit]);
  await writeFile(output, JSON.stringify(result.rows, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
  console.log(`Saved ${result.rows.length} enquiries to a private JSON file. Store it securely and follow the retention policy.`);
} catch { console.error('Enquiry export failed. Check database access and use a new output filename.'); process.exitCode = 1; }
finally { await pool.end(); }
