import { readConfig } from './config.js';
import { createRuntime } from './runtime.js';

const config = readConfig();
const app = createRuntime(config);
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { void app.close().then(() => process.exit(0)); });
try { await app.listen({ port: config.port, host: '0.0.0.0' }); }
catch { app.log.error('Server could not start. Check configuration and port availability.'); await app.close(); process.exitCode = 1; }
