export interface ClientHubConfig {
  enabled: boolean; databaseUrl?: string; emailApiKey?: string; hashSecret: string;
  allowedOrigins: string[]; turnstileSecret: string; turnstileSiteKey: string;
}
export function readClientHubConfig(environment: NodeJS.ProcessEnv = process.env): ClientHubConfig {
  if (environment.CLIENT_HUB_ENABLED && !['true', 'false'].includes(environment.CLIENT_HUB_ENABLED)) throw new Error('Invalid client hub switch.');
  const enabled = environment.CLIENT_HUB_ENABLED === 'true';
  const allowedOrigins = (environment.CLIENT_HUB_ALLOWED_ORIGINS ?? environment.ALLOWED_ORIGINS ?? '').split(',').map(value => value.trim()).filter(Boolean);
  for (const origin of allowedOrigins) {
    const url = new URL(origin);
    if (url.origin !== origin || url.protocol !== 'https:' || url.username || url.password) throw new Error('Invalid client hub origin.');
  }
  const config = { enabled, allowedOrigins, databaseUrl: environment.CLIENT_HUB_DATABASE_URL, emailApiKey: environment.RESEND_API_KEY,
    hashSecret: environment.SESSION_HASH_SECRET ?? '', turnstileSecret: environment.TURNSTILE_SECRET_KEY ?? '', turnstileSiteKey: environment.TURNSTILE_SITE_KEY ?? '' };
  if (enabled && (!config.databaseUrl || !config.emailApiKey || config.hashSecret.length < 32 || !config.turnstileSecret || !config.turnstileSiteKey || !allowedOrigins.length)) throw new Error('Client hub is not fully configured.');
  return config;
}
