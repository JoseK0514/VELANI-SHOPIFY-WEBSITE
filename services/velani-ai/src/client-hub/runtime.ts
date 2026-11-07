import type { FastifyRequest } from 'fastify';
import { createDatabasePool } from '../db-pool.js';
import { PostgresHubRepository } from './repository.js';
import { readClientHubConfig, type ClientHubConfig } from './config.js';
import { ResendSender } from './email.js';
import { dispatchClientHubEmails } from './delivery.js';
import { buildClientHubApp } from './app.js';
import {publishHubWakeup} from './queue.js';

export function clientHubRepository(config: ClientHubConfig): PostgresHubRepository | undefined {
  if (!config.databaseUrl) return undefined;
  return new PostgresHubRepository(createDatabasePool({connectionString:config.databaseUrl,max:5,connectionTimeoutMillis:5000,idleTimeoutMillis:10000,statement_timeout:15000}));
}
export function createClientHubRuntime(options: { requestIp?: (request: FastifyRequest) => string } = {}) {
  const config=readClientHubConfig(); const repository=clientHubRepository(config);
  const sender=config.emailApiKey ? new ResendSender(config.emailApiKey) : undefined;
  const app=buildClientHubApp(config,repository,{requestIp:options.requestIp,ensureDelivery:publishHubWakeup,dispatch:async requestId => {
    if (!repository || !sender || !config.enabled) return;
    await dispatchClientHubEmails(repository,sender,{requestId,maximum:2});
  }});
  app.addHook('onClose',async()=> { await repository?.close(); });
  return app;
}
