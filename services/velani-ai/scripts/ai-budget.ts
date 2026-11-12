import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import { budgetAuthorizationSchema, installBudgetAuthorization } from '../src/ai-budget.js';
import { createDatabasePool } from '../src/db-pool.js';

// Offline plan by default. --apply is an explicit operator action; this tool
// cannot approve a budget, select a target automatically or renew an allowance.
const args = process.argv.slice(2);
let pool: ReturnType<typeof createDatabasePool> | undefined;
try {
  if (args.some(arg => !/^--(?:file=.+|pause=.+|expected-host=.+|expected-database=.+|apply)$/.test(arg))
    || new Set(args.map(arg => arg.split('=')[0])).size !== args.length) throw new Error('invalid_arguments');
  const value = (key: string) => args.find(arg => arg.startsWith('--' + key + '='))?.slice(key.length + 3);
  const file = value('file'), pause = value('pause');
  if (Boolean(file) === Boolean(pause)) throw new Error('select_file_or_pause');
  let authorization: z.infer<typeof budgetAuthorizationSchema> | undefined;
  if (file) {
    const content = await readFile(file, 'utf8');
    if (Buffer.byteLength(content) > 65_536) throw new Error('approval_too_large');
    authorization = budgetAuthorizationSchema.parse(JSON.parse(content));
  }
  const id = authorization?.id ?? z.uuid().parse(pause);
  const proposal = { action: authorization ? 'install_finite_allowance' : 'pause_allowance', authorizationId: id,
    ...(authorization ? { limitMicrousd: authorization.limitMicrousd, validUntil: authorization.validUntil,
      models: authorization.models.map(model => model.model) } : {}) };
  if (!args.includes('--apply')) console.log(JSON.stringify({ ...proposal, applied: false, targetVerified: false }));
  else {
    // No fallback to the web application's credential. Reject URL option
    // overrides that could route a reviewed command to another host/database.
    const raw = process.env.DATABASE_URL_UNPOOLED;
    if (!raw || !value('expected-host') || !value('expected-database')) throw new Error('explicit_owner_target_required');
    const target = new URL(raw);
    if (!['postgres:', 'postgresql:'].includes(target.protocol) || target.hostname.includes('-pooler.')
      || target.hostname !== value('expected-host') || decodeURIComponent(target.pathname.slice(1)) !== value('expected-database')
      || [...target.searchParams.keys()].some(key => key !== 'sslmode')
      || target.searchParams.getAll('sslmode').length > 1
      || (!['127.0.0.1', '::1', '[::1]'].includes(target.hostname) && target.searchParams.get('sslmode') !== 'verify-full')) throw new Error('owner_target_mismatch');
    pool = createDatabasePool({ connectionString: raw, max: 1, connectionTimeoutMillis: 5000, statement_timeout: 10000 });
    pool.on('error', () => undefined);
    const identity = await pool.query<{ database: string }>('SELECT current_database() AS database');
    if (identity.rows[0]?.database !== value('expected-database')) throw new Error('database_identity_mismatch');
    if (authorization) await installBudgetAuthorization(pool, authorization);
    else {
      const result = await pool.query('UPDATE ai_budget_authorizations SET enabled=false WHERE id=$1', [id]);
      if (result.rowCount !== 1) throw new Error('approval_not_found');
    }
    console.log(JSON.stringify({ ...proposal, applied: true, targetVerified: true }));
  }
} catch {
  // Input, URL, pg and filesystem errors can contain credentials/private paths.
  console.error(JSON.stringify({ status: 'error', code: 'ai_budget_operator_action_failed', applied: 'unknown_if_apply_was_attempted' }));
  process.exitCode = 1;
} finally { await pool?.end(); }
