import { createCronHandler, type CronTrigger } from './cron-handler.js';

export function createRetentionHandler(environment: NodeJS.ProcessEnv, run: (trigger: CronTrigger) => Promise<{ sessions: number }>) {
  return createCronHandler(environment, run, { notConfigured: 'retention_not_configured', failed: 'retention_failed' });
}
