import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Pool } from 'pg';
import { z } from 'zod';
import { administrationPool } from './migrate.js';

const knowledgeDate = z.union([z.iso.date(), z.iso.datetime({ offset: true })]);
function boundary(value: string, endOfDay: boolean): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}${endOfDay ? 'T23:59:59.999Z' : 'T00:00:00.000Z'}` : value;
}

const documentSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9_-]{0,99}$/),
  title: z.string().min(1).max(240),
  url: z.url().refine(value => {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port
      && ['thevelani.com', 'www.thevelani.com'].includes(url.hostname);
  }, 'Knowledge sources must be reviewed first-party HTTPS pages.'),
  content: z.string().trim().min(1).max(6_000),
  locale: z.enum(['en', 'es']),
  reviewedAt: knowledgeDate,
  validUntil: knowledgeDate,
  isCore: z.boolean().optional().default(false),
}).strict().refine(doc => Date.parse(boundary(doc.validUntil, true)) > Date.parse(boundary(doc.reviewedAt, false)), 'Expiry must follow review.');

export async function seedKnowledge(pool: Pool, input: unknown): Promise<number> {
  const documents = z.array(documentSchema).min(1).max(500).parse(input);
  if (new Set(documents.map(doc => doc.id)).size !== documents.length) throw new Error('Knowledge IDs must be unique.');
  if (documents.filter(doc => doc.isCore).length > 12) throw new Error('At most 12 core documents are supported; consolidate the core facts.');
  documents.sort((a, b) => a.id.localeCompare(b.id));
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT pg_advisory_xact_lock(hashtext(current_database()), hashtext(current_schema() || ':velani-seed'))");
    for (const doc of documents) {
      const contentHash = createHash('sha256').update(JSON.stringify([doc.title, doc.url, doc.content, doc.locale])).digest('hex');
      await client.query(`INSERT INTO knowledge_documents
        (id, title, url, content, locale, reviewed_at, valid_until, is_core, managed_by, content_hash, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'seed', $9, 'published')
        ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, url = EXCLUDED.url, content = EXCLUDED.content,
          locale = EXCLUDED.locale, reviewed_at = EXCLUDED.reviewed_at, valid_until = EXCLUDED.valid_until,
          is_core = EXCLUDED.is_core, managed_by = 'seed', content_hash = EXCLUDED.content_hash, status = 'published',
          embedding = CASE WHEN knowledge_documents.content_hash = EXCLUDED.content_hash THEN knowledge_documents.embedding ELSE NULL END,
          updated_at = clock_timestamp()`,
      [doc.id, doc.title, doc.url, doc.content, doc.locale, boundary(doc.reviewedAt, false), boundary(doc.validUntil, true), doc.isCore, contentHash]);
    }
    await client.query(`UPDATE knowledge_documents SET status = 'archived', updated_at = clock_timestamp()
      WHERE managed_by = 'seed' AND NOT (id = ANY($1::text[]))`, [documents.map(doc => doc.id)]);
    await client.query('COMMIT');
    return documents.length;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally { client.release(); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const pool = administrationPool();
  try {
    const input: unknown = JSON.parse(await readFile(resolve(process.cwd(), 'knowledge/nevora.json'), 'utf8'));
    const count = await seedKnowledge(pool, input);
    console.log(`Published ${count} reviewed knowledge documents. Removed seed entries were archived.`);
  } catch (error) {
    // Validation issues can include source content; never dump whole records or database parameters.
    console.error(error instanceof z.ZodError ? 'Knowledge validation failed. Check required fields, dates, and first-party URLs.'
      : error instanceof Error ? error.message : 'Knowledge seed failed.');
    process.exitCode = 1;
  } finally { await pool.end(); }
}
