import { z } from 'zod';

const FORBIDDEN_CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/;
const ACTIVE_OR_LINKED_TEXT = /https?:\/\/|ftp:\/\/|javascript\s*:|data:[^\s,;]+(?:;base64)?,|www\.|\[[^\]]*\]\s*\(|<\s*\/?\s*[a-z!][^>]*>|```/i;

/** Visitor text stays plain text, including in exported plans. This is not HTML sanitization. */
export function plainTextSchema(maximum: number, minimum = 0) {
  return z.string().trim().min(minimum).max(maximum)
    .refine(value => !FORBIDDEN_CONTROL.test(value), 'Use visible plain text.')
    .refine(value => !ACTIVE_OR_LINKED_TEXT.test(value), 'Use plain text without links, markup or code.');
}

export const businessProfileSchema = z.object({
  businessType: plainTextSchema(120),
  teamSize: plainTextSchema(60),
  locations: plainTextSchema(120),
  currentTools: plainTextSchema(300),
  challenge: plainTextSchema(1200),
  constraints: plainTextSchema(1200),
  approvalCadence: plainTextSchema(160),
}).strict();

export const planActionSchema = z.object({
  title: plainTextSchema(120, 1),
  owner: plainTextSchema(120, 1),
  timing: plainTextSchema(120, 1),
  details: plainTextSchema(900, 1),
}).strict();
export const planActionsSchema = z.array(planActionSchema).min(3).max(5);
export const planNotesSchema = plainTextSchema(3000);

const sourceIdsSchema = z.array(z.string().regex(/^[a-zA-Z0-9_-]{1,120}$/)).min(1).max(4)
  .refine(ids => new Set(ids).size === ids.length, 'Source IDs must be unique.');
const stages = ['schedule', 'clock', 'approve', 'payroll'] as const;
export const generatedPlanSchema = z.object({
  title: plainTextSchema(120, 1),
  summary: plainTextSchema(900, 1),
  profile: businessProfileSchema,
  workflow: z.array(z.object({
    stage: z.enum(stages),
    productFact: plainTextSchema(700, 1),
    recommendation: plainTextSchema(900, 1),
    sourceIds: sourceIdsSchema,
  }).strict()).length(4).refine(steps => steps.every((step, index) => step.stage === stages[index]), 'Include the four workflow stages in order.'),
  actions: planActionsSchema,
  assumptions: z.array(plainTextSchema(500, 1)).max(5),
  questions: z.array(plainTextSchema(500, 1)).max(5),
}).strict();
