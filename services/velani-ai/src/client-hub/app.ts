import Fastify, { type FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { createHash, createHmac } from 'node:crypto';
import type { ClientHubConfig } from './config.js';
import type { HubRepository, Receipt } from './types.js';
import { ClientHubValidationError, parseClientHubRequest } from './validation.js';
import { ApiError } from '../http-errors.js';

export async function verifyHubTurnstile(token: string, config: ClientHubConfig, origin: string): Promise<boolean> {
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST',
      body: new URLSearchParams({ secret: config.turnstileSecret, response: token }), signal: AbortSignal.timeout(5000), redirect: 'error' });
    if (!response.ok) return false;
    const result = await response.json() as { success?: boolean; hostname?: string; action?: string };
    return result.success === true && result.hostname === new URL(origin).hostname && result.action === 'velani-client-hub';
  } catch { return false; }
}

export function buildClientHubApp(config: ClientHubConfig, repository: HubRepository | undefined, options: {
  verifyCaptcha?: typeof verifyHubTurnstile; dispatch: (requestId: string) => Promise<unknown>;
  ensureDelivery: (keyHash: string) => Promise<void>;
  requestIp?: (request: FastifyRequest) => string;
}) {
  const app = Fastify({ bodyLimit: 32_768, trustProxy: false, requestTimeout: 10_000, logger: false });
  const storage = () => { if (!repository) throw new ApiError(503,'service_unavailable','Requests are not configured.',60); return repository; };
  const privateHash = (purpose: string, value: string) => createHmac('sha256', config.hashSecret).update(`client-hub:${purpose}:${value}`).digest('hex');
  app.addHook('onRequest', async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    const origin = request.headers.origin;
    if ((origin && !config.allowedOrigins.includes(origin)) || (!origin && request.method === 'POST')) throw new ApiError(403, 'origin_not_allowed', 'This origin is not allowed.');
  });
  app.register(cors, { origin: config.allowedOrigins, methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Idempotency-Key'], exposedHeaders: ['Retry-After'], maxAge: 600 });
  app.register(helmet);
  app.addHook('preParsing', async (request, _reply, payload) => {
    if (request.method === 'POST') {
      if (!config.enabled) throw new ApiError(503, 'service_unavailable', 'Requests are not available yet.', 60);
      if (!await storage().consumeLimit(privateHash('ip', (options.requestIp ?? (value => value.ip))(request)), 30, 900)) throw new ApiError(429, 'rate_limited', 'Please wait before trying again.', 900);
      if (request.headers['content-type']?.split(';')[0]?.trim().toLowerCase() !== 'application/json') throw new ApiError(415,'content_type_required','Use application/json.');
    }
    return payload;
  });
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ClientHubValidationError) return reply.code(422).send({ error: { code: 'validation_failed', fields: error.fields } });
    const transport = error as { statusCode?: number; code?: string };
    const mapped = error instanceof ApiError ? error : transport.statusCode === 413 ? new ApiError(413, 'request_too_large', 'This request is too large.')
      : transport.statusCode === 415 ? new ApiError(415, 'content_type_required', 'Use application/json.')
      : transport.code?.startsWith('FST_ERR_CTP_') ? new ApiError(400, 'invalid_json', 'Use valid JSON.')
      : new ApiError(503, 'service_unavailable', 'Please try again with the same request key.', 10);
    if (mapped.retryAfter) reply.header('Retry-After', mapped.retryAfter);
    return reply.code(mapped.statusCode).send({ error: { code: mapped.code } });
  });
  app.get('/v1/client-hub/config', async () => ({ enabled: config.enabled, turnstileSiteKey: config.turnstileSiteKey || null, turnstileAction: 'velani-client-hub' }));
  app.post('/v1/client-hub/requests', async (request, reply) => {
    const { key, input, turnstileToken } = parseClientHubRequest(request.body, request.headers['idempotency-key']);
    const keyHash = privateHash('idempotency', key);
    const requestHash = createHash('sha256').update(JSON.stringify(input)).digest('hex');
    const respond = async (receipt: Receipt, created: boolean) => {
      // Delivery faults never turn a saved request into an apparent failed submission.
      await options.dispatch(receipt.id).catch(() => undefined);
      const confirmationEmail = await storage().confirmationState(receipt.id).catch(() => 'pending' as const);
      return reply.code(created ? 201 : 200).send({ status: 'received', reference: receipt.reference, confirmationEmail });
    };
    const prior = await storage().find(keyHash);
    if (prior) {
      if (prior.requestHash !== requestHash) throw new ApiError(409, 'idempotency_conflict', 'Use a new key after editing the request.');
      return respond(prior, false);
    }
    if (!await (options.verifyCaptcha ?? verifyHubTurnstile)(turnstileToken, config, request.headers.origin!)) throw new ApiError(403, 'verification_failed', 'Complete verification again.');
    // The opaque wake-up is durable BEFORE acceptance commits. Consumers wait
    // for the row; failed/rejected submissions produce harmless orphan wake-ups.
    await options.ensureDelivery(keyHash);
    const accepted = await storage().accept(input, keyHash, requestHash, privateHash('email', input.email));
    if (accepted.kind === 'conflict') throw new ApiError(409, 'idempotency_conflict', 'Use a new key after editing the request.');
    if (accepted.kind === 'limited') throw new ApiError(429, 'rate_limited', 'Please wait before trying again.', 86_400);
    return respond(accepted.receipt, accepted.kind === 'created');
  });
  return app;
}
