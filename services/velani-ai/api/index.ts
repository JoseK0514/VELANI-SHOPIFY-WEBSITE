import { readConfig } from '../src/config.js';
import { createRuntime } from '../src/runtime.js';
import { createVercelHandler, vercelClientIp } from '../src/vercel-handler.js';

// No listening socket or shutdown signal handlers in a Vercel invocation.
// Vercel serves public/ directly; this function serves only the API and health routes.
export default createVercelHandler(() => createRuntime(readConfig(), {
  serveWeb: false,
  requestIp: process.env.VERCEL === '1' ? vercelClientIp : undefined,
}));
