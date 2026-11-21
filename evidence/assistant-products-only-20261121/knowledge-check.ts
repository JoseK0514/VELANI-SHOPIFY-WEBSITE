import { z } from 'zod';
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
import { readFileSync } from 'node:fs';
const docs = z.array(documentSchema).min(1).max(500).parse(JSON.parse(readFileSync('knowledge/nevora.json', 'utf8')));
if (new Set(docs.map(d => d.id)).size !== docs.length) throw new Error('ids'); if (docs.filter(d => d.isCore).length > 12) throw new Error('core');
console.log('valid', docs.length, 'documents,', docs.filter(d => d.isCore).length, 'core');
