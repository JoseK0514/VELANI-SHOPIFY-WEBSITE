import { z } from 'zod';

export interface Config {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  aiApiKey: string;
  aiBaseUrl?: string;
  aiModel: string;
  sessionHashSecret: string;
  allowedOrigins: string[];
  trustProxy: false | string[];
  requireCaptcha: boolean;
  turnstileSecret?: string;
  turnstileSiteKey?: string;
  planModel?: string;
  sessionTtlHours: number;
  dailyAiRequestLimit: number;
  modelTimeoutMs: number;
  aiBudgetAuthorizationId?: string;
}

export function readConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const required = (key: string) => {
    const value = env[key]?.trim();
    if (!value) throw new Error(`Missing configuration: ${key}`);
    return value;
  };
  const integer = (key: string, fallback: number, min: number, max: number) => {
    const value = Number(env[key] ?? fallback);
    if (!Number.isInteger(value) || value < min || value > max) throw new Error(`Invalid configuration: ${key}`);
    return value;
  };
  const flag = (key: string, fallback: boolean) => {
    if (!env[key]) return fallback;
    if (!['true', 'false'].includes(env[key]!)) throw new Error(`Invalid configuration: ${key}`);
    return env[key] === 'true';
  };
  const nodeEnv = env.NODE_ENV ?? 'development';
  const sessionHashSecret = required('SESSION_HASH_SECRET');
  if (sessionHashSecret.length < 32) throw new Error('SESSION_HASH_SECRET must have at least 32 characters');
  const allowedOrigins = required('ALLOWED_ORIGINS').split(',').map(value => value.trim());
  for (const origin of allowedOrigins) {
    const url = new URL(origin);
    if (url.origin !== origin || !['http:', 'https:'].includes(url.protocol) ||
        (nodeEnv === 'production' && url.protocol !== 'https:')) throw new Error('Invalid ALLOWED_ORIGINS');
  }
  const requireCaptcha = flag('REQUIRE_CAPTCHA', nodeEnv === 'production');
  const proxyInput = env.TRUST_PROXY?.trim() ?? 'false';
  if (proxyInput === 'true') throw new Error('TRUST_PROXY requires explicit trusted proxy IPs/CIDRs, or false');
  const trustProxy = proxyInput === 'false' ? false : proxyInput.split(',').map(value => value.trim());
  if (Array.isArray(trustProxy) && trustProxy.some(value => !value || value === '0.0.0.0/0' || value === '::/0')) throw new Error('TRUST_PROXY must not trust every address');
  const turnstileSecret = env.TURNSTILE_SECRET_KEY?.trim();
  const turnstileSiteKey = env.TURNSTILE_SITE_KEY?.trim();
  if (nodeEnv === 'production' && !requireCaptcha) throw new Error('Production requires CAPTCHA');
  if (requireCaptcha && !turnstileSecret) throw new Error('Missing configuration: TURNSTILE_SECRET_KEY');
  const aiBaseUrl = env.AI_BASE_URL?.trim();
  if (aiBaseUrl) {
    const url = new URL(aiBaseUrl);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error('AI_BASE_URL must be a credential-free HTTPS URL');
  }
  const aiBudgetAuthorizationId = env.AI_BUDGET_AUTHORIZATION_ID?.trim() || undefined;
  if (aiBudgetAuthorizationId && !z.uuid().safeParse(aiBudgetAuthorizationId).success) throw new Error('Invalid configuration: AI_BUDGET_AUTHORIZATION_ID');
  return {
    nodeEnv, port: integer('PORT', 3001, 1, 65535), databaseUrl: required('DATABASE_URL'),
    aiApiKey: required('AI_API_KEY'), aiBaseUrl, aiModel: required('AI_MODEL'), sessionHashSecret, aiBudgetAuthorizationId,
    allowedOrigins, trustProxy, requireCaptcha, turnstileSecret, turnstileSiteKey,
    planModel: env.AI_PLAN_MODEL?.trim() || undefined,
    sessionTtlHours: integer('SESSION_TTL_HOURS', 24, 1, 168),
    dailyAiRequestLimit: integer('DAILY_AI_REQUEST_LIMIT', 500, 1, 100000),
    modelTimeoutMs: integer('MODEL_TIMEOUT_MS', 45000, 1000, 90000),
  };
}
