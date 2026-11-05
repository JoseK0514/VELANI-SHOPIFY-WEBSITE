import Fastify, { type FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { registerFrontend } from './frontend.js';
import { createHash, createHmac, randomBytes } from 'node:crypto';
import { z, ZodError } from 'zod';
import type { Config } from './config.js';
import type { AnswerEngine, Repository, Session } from './types.js';
import { ModelError } from './engine.js';
import { SessionUnavailableError, StaleTurnError } from './repository.js';
import { ApiError } from './http-errors.js';
import { registerExperienceRoutes, type ExperienceServices } from './experience-routes.js';
import { ProfileChangedError } from './experience-repository.js';
import { PlanKnowledgeUnavailableError } from './plan-engine.js';
const sessionInput = z.object({ locale: z.enum(['en', 'es']).default('en'), captchaToken: z.string().min(1).max(2048).optional() }).strict();
const chatInput = z.object({ requestId: z.uuid(), message: z.string().trim().min(1).max(4000), planId: z.uuid().optional(), locale: z.enum(['en', 'es']).optional() }).strict();
const leadInput = z.object({
  requestId: z.uuid(), name: z.string().trim().min(1).max(120), email: z.email().max(254).transform(s => s.toLowerCase()),
  company: z.string().trim().max(200).optional(), teamSize: z.string().trim().max(60).optional(),
  locations: z.string().trim().max(100).optional(), message: z.string().trim().max(2000).optional(),
  consent: z.literal(true), consentVersion: z.literal('lead-v1'),
  planId: z.uuid().optional(), planRevision: z.number().int().positive().optional(),
}).strict().refine(input => Boolean(input.planId) === (input.planRevision !== undefined));
const hashPayload = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');

export async function verifyTurnstile(token: string, config: Config, origin: string): Promise<boolean> {
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', body: new URLSearchParams({ secret: config.turnstileSecret!, response: token }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return false;
    const result = await response.json() as { success?: boolean; hostname?: string; action?: string };
    return result.success === true && result.hostname === new URL(origin).hostname && result.action === 'velani-session';
  } catch { return false; }
}

export function buildApp(config: Config, repository: Repository, engine: AnswerEngine, options: {
  logger?: boolean; verifyCaptcha?: typeof verifyTurnstile; experience?: ExperienceServices; serveWeb?: boolean;
  requestIp?: (request: FastifyRequest) => string;
} = {}) {
  const app = Fastify({
    bodyLimit: 16_384, trustProxy: config.trustProxy, requestTimeout: 10000,
    logger: options.logger ? { level: 'info', redact: ['req.headers.authorization', 'req.body', 'res.headers["set-cookie"]'] } : false,
    disableRequestLogging: true,
  });
  const requestIp = options.requestIp ?? ((request: FastifyRequest) => request.ip);
  const privateHash = (value: string) => createHmac('sha256', config.sessionHashSecret).update(value).digest('hex');
  const limit = async (key: string, maximum: number, seconds: number) => {
    if (!await repository.consumeRateLimit(key, maximum, seconds)) throw new ApiError(429, 'rate_limited', 'Please wait before trying again.', seconds);
  };
  const session = async (request: FastifyRequest): Promise<Session> => {
    const token = request.headers.authorization?.match(/^Bearer ([A-Za-z0-9_-]{43})$/)?.[1];
    if (!token) throw new ApiError(401, 'session_required', 'Please start a new chat session.');
    const found = await repository.findSession(privateHash(token));
    if (!found || found.expiresAt.getTime() <= Date.now()) throw new ApiError(401, 'session_expired', 'Please start a new chat session.');
    return found;
  };
  // Reject disallowed origins before handling state changes; CORS headers alone do not prevent writes.
  app.addHook('onRequest', async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    if (request.url.startsWith('/v1/')) {
      const origin = request.headers.origin;
      if ((origin && !config.allowedOrigins.includes(origin)) || (!origin && !['GET', 'HEAD'].includes(request.method))) throw new ApiError(403, 'origin_not_allowed', 'This origin is not allowed.');
    }
  });
  app.register(cors, { origin: config.allowedOrigins, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'], exposedHeaders: ['Retry-After'], maxAge: 600 });
  app.register(helmet, {
    frameguard: false,
    contentSecurityPolicy: { directives: {
      defaultSrc: ["'self'"], scriptSrc: ["'self'", 'https://challenges.cloudflare.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'], imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'https://challenges.cloudflare.com'], frameSrc: ['https://challenges.cloudflare.com'],
      frameAncestors: ["'self'", ...config.allowedOrigins], upgradeInsecureRequests: config.nodeEnv === 'production' ? [] : null,
    } },
  });
  // Run after the CORS onRequest hook so allowed browsers can read quota errors
  // and Retry-After. Preflight requests end in CORS without consuming a quota.
  app.addHook('preParsing', async (request, _reply, payload) => {
    if (request.url.startsWith('/v1/')) await limit(`ip:requests:${privateHash(requestIp(request))}`, 120, 60);
    return payload;
  });
  app.setErrorHandler((error, request, reply) => {
    const transport = error as { code?: string; statusCode?: number };
    let mapped: ApiError;
    if (error instanceof ApiError) mapped = error;
    else if (error instanceof ZodError || transport.code === 'FST_ERR_CTP_INVALID_JSON_BODY' || transport.code === 'FST_ERR_CTP_EMPTY_JSON_BODY') mapped = new ApiError(400, 'invalid_request', 'Check the request fields and try again.');
    else if (transport.statusCode === 413) mapped = new ApiError(413, 'request_too_large', 'This request is too large.');
    else if (transport.statusCode === 415) mapped = new ApiError(415, 'content_type_required', 'Use application/json.');
    else if (error instanceof SessionUnavailableError) mapped = new ApiError(401, 'session_expired', 'Please start a new chat session.');
    else if (error instanceof StaleTurnError) mapped = new ApiError(409, 'turn_expired', 'Please retry this message.');
    else if (error instanceof ProfileChangedError) mapped = new ApiError(409, 'profile_changed', 'Business details changed. Review them before generating a new plan.');
    else if (error instanceof PlanKnowledgeUnavailableError) mapped = new ApiError(503, 'knowledge_unavailable', 'Current product information is unavailable. Please contact Velani.');
    else if (error instanceof ModelError) mapped = new ApiError(503, error.code, 'The assistant could not answer right now. Please retry, or contact Velani.', 10);
    else mapped = new ApiError(503, 'service_unavailable', 'The service is temporarily unavailable. Please try again.', 10);
    request.log.warn({ code: mapped.code, requestId: request.id,
      providerStatus: error instanceof ModelError ? error.providerStatus : undefined,
      providerHint: error instanceof ModelError ? error.providerHint : undefined }, 'Request could not be completed');
    if (mapped.retryAfter) reply.header('Retry-After', mapped.retryAfter);
    return reply.code(mapped.statusCode).send({ error: { code: mapped.code, message: mapped.message }, requestId: request.id });
  });
  app.get('/health/live', async () => ({ status: 'ok' }));
  app.get('/v1/config', async () => ({ assistantName: 'Rondo', requireCaptcha: config.requireCaptcha, turnstileSiteKey: config.turnstileSiteKey ?? null }));
  app.get('/health/ready', async () => {
    await repository.ping();
    return { status: 'ready' };
  });
  app.post('/v1/sessions', async (request, reply) => {
    const input = sessionInput.parse(request.body);
    await limit(`ip:sessions:${privateHash(requestIp(request))}`, 10, 3600);
    if (config.requireCaptcha && (!input.captchaToken || !await (options.verifyCaptcha ?? verifyTurnstile)(input.captchaToken, config, request.headers.origin!))) {
      throw new ApiError(403, 'captcha_required', 'Please complete the verification and try again.');
    }
    const token = randomBytes(32).toString('base64url');
    const created = await repository.createSession(privateHash(token), input.locale, new Date(Date.now() + config.sessionTtlHours * 3600_000));
    return reply.code(201).send({ sessionToken: token, sessionId: created.id, expiresAt: created.expiresAt.toISOString() });
  });
  app.post('/v1/chat', async (request) => {
    const input = chatInput.parse(request.body);
    const current = await session(request);
    const locale = input.locale ?? current.locale;
    const claim = await repository.claimTurn(current.id, input.requestId, hashPayload({ message: input.message, ...(input.planId ? { planId: input.planId } : {}), ...(input.locale ? { locale: input.locale } : {}) }));
    if (claim.state === 'completed') return claim.answer;
    if (claim.state === 'busy') throw new ApiError(409, 'turn_in_progress', 'Please wait for the current answer.', 3);
    if (claim.state === 'conflict') throw new ApiError(409, 'request_id_conflict', 'Use a new request ID for a different message.');
    try {
      await limit(`session:chat:${current.id}`, 12, 60);
      await limit(`session:daily:${current.id}`, 100, 86400);
      await limit('global:ai:daily', config.dailyAiRequestLimit, 86400);
      const [history, knowledge, profile, plan] = await Promise.all([
        repository.history(current.id, 40), repository.knowledge(input.message, locale),
        options.experience?.repository.getProfile(current.id),
        input.planId ? options.experience?.repository.getPlan(current.id, input.planId) : undefined,
      ]);
      if (input.planId && !plan) throw new ApiError(404, 'plan_not_found', 'This plan is not available in your session.');
      const answer = await engine.answer({ message: input.message, locale, history, knowledge,
        ...(profile ? { profile: profile.profile } : {}), ...(plan ? { plan } : {}) });
      await repository.completeTurn(current.id, input.requestId, input.message, answer, claim.leaseToken);
      return answer;
    } catch (error) {
      await repository.failTurn(current.id, input.requestId, claim.leaseToken).catch(() => undefined);
      throw error;
    }
  });
  app.post('/v1/leads', async (request, reply) => {
    const { requestId, planId, planRevision, ...input } = leadInput.parse(request.body);
    const current = await session(request);
    const requestHash = hashPayload({ ...input, ...(planId ? { planId, planRevision } : {}) });
    const prior = await repository.findLeadRequest?.(current.id, requestId, requestHash);
    if (prior === 'conflict') throw new ApiError(409, 'request_id_conflict', 'Use a new request ID for a different enquiry.');
    if (prior) return { id: prior.id, saved: true };
    const plan = planId ? await options.experience?.repository.getPlan(current.id, planId) : undefined;
    if (planId && !plan) throw new ApiError(404, 'plan_not_found', 'This plan is not available in your session.');
    if (plan && plan.revision !== planRevision) throw new ApiError(409, 'plan_changed', 'Review the latest plan before sharing it.');
    await limit(`session:leads:${current.id}`, 10, 3600);
    const result = await repository.saveLead(current.id, requestId, requestHash, { ...input, ...(plan ? { planSnapshot: plan } : {}) });
    if (result === 'conflict') throw new ApiError(409, 'request_id_conflict', 'Use a new request ID for a different enquiry.');
    return reply.code(result.duplicate ? 200 : 201).send({ id: result.id, saved: true });
  });
  app.delete('/v1/session', async (request, reply) => {
    const current = await session(request);
    await repository.deleteSession(current.id);
    return reply.code(204).send();
  });
  if (options.experience) registerExperienceRoutes(app, options.experience, { session, limit, repository, dailyLimit: config.dailyAiRequestLimit });
  if (options.serveWeb) app.register(registerFrontend);
  return app;
}
