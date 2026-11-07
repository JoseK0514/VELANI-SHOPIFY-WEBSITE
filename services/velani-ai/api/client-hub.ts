import { createClientHubRuntime } from '../src/client-hub/runtime.js';
import { createVercelHandler, vercelClientIp } from '../src/vercel-handler.js';

// Independent of the AI engine and model credentials; no chat account is required.
export default createVercelHandler(()=>createClientHubRuntime({requestIp:process.env.VERCEL==='1' ? vercelClientIp : undefined}));
