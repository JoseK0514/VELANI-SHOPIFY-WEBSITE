import { Pool, type PoolConfig } from 'pg';
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { HttpsProxyAgent } from 'https-proxy-agent';
import WebSocket from 'ws';

/**
 * TCP is the default. Opt into Neon's transaction-capable WebSocket transport
 * only for Neon hosts in environments where PostgreSQL TCP is unavailable.
 * Configuration is process-wide, like the environment variables it reads.
 */
export function createDatabasePool(config: PoolConfig, environment: NodeJS.ProcessEnv = process.env): Pool {
  if (environment.NEON_WEBSOCKET !== 'true') return new Pool(config);
  if (!config.connectionString) throw new Error('Neon WebSocket transport requires a database connection string.');
  let databaseUrl: URL;
  try { databaseUrl = new URL(config.connectionString); }
  catch { throw new Error('Invalid database connection string.'); }
  // Local development and other PostgreSQL providers continue using node-postgres.
  if (!databaseUrl.hostname.endsWith('.neon.tech')) return new Pool(config);

  if (environment.NEON_USE_PROXY === 'true') {
    if (!environment.HTTPS_PROXY) throw new Error('NEON_USE_PROXY requires HTTPS_PROXY.');
    let proxyUrl: URL;
    try { proxyUrl = new URL(environment.HTTPS_PROXY); }
    catch { throw new Error('HTTPS_PROXY must be a valid HTTP or HTTPS URL.'); }
    if (!['http:', 'https:'].includes(proxyUrl.protocol)) throw new Error('HTTPS_PROXY must use HTTP or HTTPS.');
    const agent = new HttpsProxyAgent(proxyUrl, { rejectUnauthorized: true });
    neonConfig.webSocketConstructor = class ProxiedWebSocket extends WebSocket {
      constructor(address: string | URL, protocols?: string | string[]) {
        super(address, protocols, { agent, rejectUnauthorized: true });
      }
    };
  } else {
    neonConfig.webSocketConstructor = WebSocket;
  }
  neonConfig.useSecureWebSocket = true;
  // Keep every query on the configured transport, including standalone reads.
  neonConfig.poolQueryViaFetch = false;
  // Neon implements the pg Pool API. Its bundled pg type version differs in
  // overload details; contain that compatibility cast at this driver boundary.
  return new NeonPool(config) as unknown as Pool;
}
