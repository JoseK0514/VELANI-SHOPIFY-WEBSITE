export type RondoEnvironment = 'development' | 'production';

const shared = { branch: 'br-snowy-brook-bcc6b3zm', host: 'ep-withered-pine-bcnflkeq.c-16.us-east-1.aws.neon.tech' } as const;
const targets = {
  development: { ...shared, scope: 'development', database: 'velani_rondo_development',
    monitorRole: 'velani_rondo_dev_monitor', appRole: 'velani_rondo_dev_app', watchdogRole: 'velani_rondo_dev_watchdog' },
  production: { ...shared, scope: 'production', database: 'velani_ai',
    monitorRole: 'velani_rondo_prod_monitor', appRole: 'velani_ai_app', watchdogRole: 'velani_rondo_prod_watchdog' },
} as const;

/** Missing selection preserves existing development deployments. Production is
 * explicit and pinned; arbitrary host/database/role overrides are not accepted. */
export function rondoTarget(value: string | undefined) {
  const scope = value ?? 'development';
  if (scope !== 'development' && scope !== 'production') throw Error('rondo_environment_invalid');
  return targets[scope];
}
