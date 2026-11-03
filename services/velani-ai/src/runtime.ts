import type { FastifyRequest } from 'fastify';
import { readConfig, type Config } from './config.js';
import { buildApp } from './app.js';
import { PostgresRepository } from './repository.js';
import { ModelEngine } from './engine.js';
import { PostgresExperienceRepository } from './experience-repository.js';
import { PlanModelEngine } from './plan-engine.js';

/** Shared dependency wiring for the local server and the Vercel function. */
export function createRuntime(config: Config = readConfig(), options: {
  serveWeb?: boolean;
  requestIp?: (request: FastifyRequest) => string;
} = {}) {
  if (config.requireCaptcha && !config.turnstileSiteKey) throw new Error('Public website requires TURNSTILE_SITE_KEY');
  const repository = new PostgresRepository(config.databaseUrl);
  const engine = new ModelEngine({ apiKey: config.aiApiKey, baseURL: config.aiBaseUrl, model: config.aiModel, timeoutMs: config.modelTimeoutMs });
  const experienceRepository = new PostgresExperienceRepository(config.databaseUrl);
  const planEngine = new PlanModelEngine({ apiKey: config.aiApiKey, baseURL: config.aiBaseUrl, model: config.planModel ?? config.aiModel, timeoutMs: 90000 });
  const app = buildApp(config, repository, engine, {
    logger: true, serveWeb: options.serveWeb ?? true, requestIp: options.requestIp,
    experience: { repository: experienceRepository, engine: planEngine },
  });
  app.addHook('onClose', async () => { await Promise.all([repository.close(), experienceRepository.close()]); });
  return app;
}
