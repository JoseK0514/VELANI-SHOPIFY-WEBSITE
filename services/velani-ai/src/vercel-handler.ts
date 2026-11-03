import type { IncomingMessage, ServerResponse } from 'node:http';
import { isIP } from 'node:net';
import type { FastifyInstance, FastifyRequest } from 'fastify';

/** Use only inside Vercel: its ingress overwrites this header before invocation. */
export function vercelClientIp(request: FastifyRequest): string {
  const address = request.headers['x-vercel-forwarded-for'];
  return typeof address === 'string' && isIP(address) !== 0 ? address : request.ip;
}

/** Preserve Node request streams and keep the invocation alive through response completion. */
export function createVercelHandler(factory: () => FastifyInstance) {
  let ready: Promise<FastifyInstance> | undefined;
  const getApp = () => {
    if (!ready) ready = Promise.resolve().then(async () => {
      const app = factory();
      try { await app.ready(); return app; }
      catch (error) { await app.close(); throw error; }
    }).catch(error => { ready = undefined; throw error; });
    return ready;
  };
  return async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
    let app: FastifyInstance;
    try { app = await getApp(); }
    catch {
      response.statusCode = 503;
      response.setHeader('Content-Type', 'application/json; charset=utf-8');
      response.setHeader('Cache-Control', 'no-store');
      response.setHeader('Retry-After', '10');
      response.end(JSON.stringify({ error: { code: 'service_unavailable', message: 'The service is temporarily unavailable. Please try again.' } }));
      return;
    }
    await new Promise<void>(resolve => {
      const complete = () => {
        response.removeListener('finish', complete);
        response.removeListener('close', complete);
        resolve();
      };
      response.once('finish', complete);
      response.once('close', complete);
      app.server.emit('request', request, response);
    });
  };
}
