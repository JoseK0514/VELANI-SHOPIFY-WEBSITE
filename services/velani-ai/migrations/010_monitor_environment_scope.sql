-- Preserve every existing incident/notice; allow an explicitly selected public
-- production monitor in a separate database. No role, policy or allowance is
-- installed, and no deployed schedule is changed by this migration.
ALTER TABLE rondo_monitor_state DROP CONSTRAINT rondo_monitor_state_scope_check;
ALTER TABLE rondo_monitor_state ADD CONSTRAINT rondo_monitor_state_scope_check
  CHECK (scope IN ('development','production'));

-- Existing columns keep their names/order. Scoped readers select their exact
-- environment, so a healthy heartbeat in another scope cannot hide a stopped job.
CREATE OR REPLACE VIEW rondo_monitor_status WITH (security_barrier=true) AS SELECT
  monitor.state, monitor.observed_at AS completed_at,
  COALESCE(monitor.observed_at BETWEEN clock_timestamp()-interval '90 minutes' AND clock_timestamp(),false) AS fresh,
  expected.scope
FROM (VALUES ('development'::text,0),('production'::text,1)) AS expected(scope,ordinal)
LEFT JOIN rondo_monitor_state AS monitor ON monitor.scope=expected.scope
ORDER BY expected.ordinal;
REVOKE ALL ON rondo_monitor_status FROM PUBLIC;
