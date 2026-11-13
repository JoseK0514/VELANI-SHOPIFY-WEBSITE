-- The independent watchdog may read this aggregate view, never the incident
-- journal or private application tables. Keep native self-observation separate.
CREATE VIEW rondo_monitor_status WITH (security_barrier=true) AS SELECT
  (SELECT state FROM rondo_monitor_state WHERE scope='development') AS state,
  (SELECT observed_at FROM rondo_monitor_state WHERE scope='development') AS completed_at,
  COALESCE((SELECT observed_at BETWEEN clock_timestamp()-interval '90 minutes' AND clock_timestamp()
    FROM rondo_monitor_state WHERE scope='development'),false) AS fresh;
REVOKE ALL ON rondo_monitor_status FROM PUBLIC;
