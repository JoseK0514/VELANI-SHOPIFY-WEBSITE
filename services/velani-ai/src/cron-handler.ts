import { createHash, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

export type CronTrigger = 'scheduler' | 'operator';

export function createCronHandler<T extends object>(environment: NodeJS.ProcessEnv, run: (trigger: CronTrigger) => Promise<T>, codes: { notConfigured: string; failed: string }) {
  return async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
    response.setHeader('Cache-Control', 'no-store'); response.setHeader('Content-Type', 'application/json; charset=utf-8');
    const send = (status: number, body: object) => { response.statusCode = status; response.end(JSON.stringify(body)); };
    const secret = environment.CRON_SECRET;
    if (environment.VERCEL_ENV !== 'production' || !secret || secret.length < 32) { send(503,{status:'error',code:codes.notConfigured}); return; }
    const digest = (value: string) => createHash('sha256').update(value).digest();
    if (!timingSafeEqual(digest(request.headers.authorization ?? ''),digest(`Bearer ${secret}`))) { send(401,{status:'error',code:'unauthorized'}); return; }
    if (request.method !== 'GET') { response.setHeader('Allow','GET'); send(405,{status:'error',code:'method_not_allowed'}); return; }
    // A diagnostic provenance label after authentication, not an authentication factor.
    const trigger = request.headers['user-agent'] === 'vercel-cron/1.0' ? 'scheduler' : 'operator';
    try { send(200,{status:'ok',...await run(trigger)}); }
    catch { send(500,{status:'error',code:codes.failed}); }
  };
}
