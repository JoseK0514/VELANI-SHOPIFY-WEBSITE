import type { FastifyRequest } from 'fastify';
import { readConfig, type Config } from './config.js';
import { buildApp } from './app.js';
import { PostgresRepository } from './repository.js';
import { ModelEngine } from './engine.js';
import { PostgresExperienceRepository } from './experience-repository.js';
import { PlanModelEngine } from './plan-engine.js';
import { AiBudgetError, PostgresAiBudget } from './ai-budget.js';
import { createDatabasePool } from './db-pool.js';
import type { ModelRequest } from './engine.js';

/** Shared dependency wiring for the local server and the Vercel function. */
export function createRuntime(config: Config = readConfig(), options: {
  serveWeb?: boolean;
  requestIp?: (request: FastifyRequest) => string;
} = {}) {
  if (config.requireCaptcha && !config.turnstileSiteKey) throw new Error('Public website requires TURNSTILE_SITE_KEY');
  const budgetPool = createDatabasePool({ connectionString: config.databaseUrl, max: 2,
    connectionTimeoutMillis: 5000, statement_timeout: 10000 });
  budgetPool.on('error', () => undefined);
  const budget = new PostgresAiBudget(budgetPool, config.aiBudgetAuthorizationId, config.aiBaseUrl);
  const authorize = async (request: ModelRequest) => {
    try { await budget.authorize(request); }
    catch (error) {
      console.warn(JSON.stringify({ event: 'rondo_cost_control', code: error instanceof AiBudgetError ? error.code : 'ai_budget_unavailable' }));
      throw error;
    }
  };
  const repository = new PostgresRepository(config.databaseUrl);
  const engine = new ModelEngine({ apiKey: config.aiApiKey, baseURL: config.aiBaseUrl, model: config.aiModel, timeoutMs: config.modelTimeoutMs, authorize });
  const experienceRepository = new PostgresExperienceRepository(config.databaseUrl);
  const planEngine = new PlanModelEngine({ apiKey: config.aiApiKey, baseURL: config.aiBaseUrl, model: config.planModel ?? config.aiModel, timeoutMs: 90000, authorize });
  const app = buildApp(config, repository, engine, {
    logger: true, serveWeb: options.serveWeb ?? true, requestIp: options.requestIp,
    experience: { repository: experienceRepository, engine: planEngine },
  });
  app.addHook('onClose', async () => { await Promise.all([repository.close(), experienceRepository.close(), budgetPool.end()]); });
  return app;
}
