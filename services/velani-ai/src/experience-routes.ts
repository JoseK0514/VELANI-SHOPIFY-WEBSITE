import { createHash } from 'node:crypto';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import type { ExperienceRepository, PlanEngine, PlanRecord } from './experience-types.js';
import type { Repository, Session } from './types.js';
import { businessProfileSchema, planActionsSchema, planNotesSchema } from './experience-validation.js';
import { ApiError } from './http-errors.js';

export interface ExperienceServices { repository: ExperienceRepository; engine: PlanEngine }
export interface RouteContext {
  session(request: FastifyRequest): Promise<Session>;
  limit(key: string, maximum: number, seconds: number): Promise<void>;
  repository: Repository;
  dailyLimit: number;
}
const profileInput = z.object({ expectedRevision: z.number().int().nonnegative(), profile: businessProfileSchema }).strict();
const planInput = z.object({ requestId: z.uuid(), brief: z.string().trim().min(3).max(4000), profileRevision: z.number().int().nonnegative(), locale: z.enum(['en', 'es']).optional() }).strict();
const planParams = z.object({ id: z.uuid() });
const editInput = z.object({ expectedRevision: z.number().int().positive(), actions: planActionsSchema, notes: planNotesSchema }).strict();

const escape = (text: string) => text.replace(/[\\`*_{}\[\]<>#]/g, '\\$&');
export function planMarkdown(record: PlanRecord): string {
  const p = record.plan;
  const lines = [`# ${escape(p.title)}`, '', escape(p.summary), '', '> Planning guidance based on reviewed product information. NEVORA is in development; availability and commercial terms need confirmation.', '', '## Business context'];
  for (const [key, value] of Object.entries(p.profile)) if (value) lines.push(`- ${key}: ${escape(value)}`);
  lines.push('', '## Workflow');
  for (const step of p.workflow) lines.push('', `### ${step.stage}`, `Documented capability: ${escape(step.productFact)}`, '', `Suggestion: ${escape(step.recommendation)}`);
  lines.push('', '## Action plan');
  for (const action of p.actions) lines.push('', `### ${escape(action.title)}`, `Owner: ${escape(action.owner)} | Timing: ${escape(action.timing)}`, '', escape(action.details));
  lines.push('', '## Assumptions', ...p.assumptions.map(item => `- ${escape(item)}`), '', '## Questions to confirm', ...p.questions.map(item => `- ${escape(item)}`));
  if (record.notes) lines.push('', '## Your notes', escape(record.notes));
  lines.push('', '## Sources', ...p.sources.map(source => `- [${escape(source.title)}](${source.url})`), '', `Plan revision ${record.revision}. ${record.edited ? 'Action plan edited by the visitor.' : 'AI-generated draft; review before use.'}`, '');
  return lines.join('\n');
}

export function registerExperienceRoutes(app: FastifyInstance, services: ExperienceServices, context: RouteContext): void {
  const repo = services.repository;
  app.get('/v1/profile', async request => repo.getProfile((await context.session(request)).id));
  app.put('/v1/profile', async request => {
    const input = profileInput.parse(request.body);
    const session = await context.session(request);
    await context.limit(`session:profile:${session.id}`, 30, 60);
    const result = await repo.saveProfile(session.id, input.expectedRevision, input.profile);
    if (result === 'conflict') throw new ApiError(409, 'profile_changed', 'Business details changed. Refresh and review them before saving.');
    return result;
  });
  app.post('/v1/plans', async (request, reply) => {
    const input = planInput.parse(request.body);
    const session = await context.session(request);
    const locale = input.locale ?? session.locale;
    const requestHash = createHash('sha256').update(JSON.stringify({ brief: input.brief, profileRevision: input.profileRevision, locale })).digest('hex');
    const claim = await repo.claimPlan(session.id, input.requestId, requestHash);
    if (claim.state === 'completed') return claim.record;
    if (claim.state === 'busy') throw new ApiError(409, 'plan_in_progress', 'Please wait for the current plan.', 3);
    if (claim.state === 'conflict') throw new ApiError(409, 'request_id_conflict', 'Use a new request ID for a different plan.');
    try {
      const profile = await repo.getProfile(session.id);
      if (profile.revision !== input.profileRevision) throw new ApiError(409, 'profile_changed', 'Business details changed. Review them before generating a new plan.');
      await context.limit(`session:plans:${session.id}`, 5, 3600);
      await context.limit(`session:daily:${session.id}`, 100, 86400);
      await context.limit('global:ai:daily', context.dailyLimit, 86400);
      const [history, knowledge] = await Promise.all([
        context.repository.history(session.id, 40),
        context.repository.knowledge(`${input.brief} ${profile.profile.challenge}`, locale),
      ]);
      const plan = await services.engine.generate({ brief: input.brief, locale, profile: profile.profile, history, knowledge });
      const result = await repo.completePlan(session.id, input.requestId, claim.leaseToken, plan, profile.revision, input.brief);
      return reply.code(201).send(result);
    } catch (error) {
      await repo.failPlan(session.id, input.requestId, claim.leaseToken).catch(() => undefined);
      throw error;
    }
  });
  app.get('/v1/plans/:id', async request => {
    const { id } = planParams.parse(request.params);
    const session = await context.session(request);
    const result = await repo.getPlan(session.id, id);
    if (!result) throw new ApiError(404, 'plan_not_found', 'This plan is not available in your session.');
    return result;
  });
  app.patch('/v1/plans/:id', async request => {
    const { id } = planParams.parse(request.params);
    const input = editInput.parse(request.body);
    const session = await context.session(request);
    await context.limit(`session:edits:${session.id}`, 30, 60);
    const result = await repo.editPlan(session.id, id, input.expectedRevision, input.actions, input.notes);
    if (result === 'conflict') throw new ApiError(409, 'plan_changed', 'This plan changed. Refresh and review it before saving.');
    if (!result) throw new ApiError(404, 'plan_not_found', 'This plan is not available in your session.');
    return result;
  });
  app.get('/v1/plans/:id/download', async (request, reply) => {
    const { id } = planParams.parse(request.params);
    const session = await context.session(request);
    const result = await repo.getPlan(session.id, id);
    if (!result) throw new ApiError(404, 'plan_not_found', 'This plan is not available in your session.');
    return reply.header('Content-Disposition', 'attachment; filename="nevora-workflow-plan.md"').type('text/markdown; charset=utf-8').send(planMarkdown(result));
  });
}
