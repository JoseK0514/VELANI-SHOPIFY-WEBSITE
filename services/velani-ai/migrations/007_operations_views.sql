-- Monitor credentials need only these views, not private base-table access.
CREATE VIEW rondo_retention_status WITH (security_barrier=true) AS SELECT
  (SELECT completed_at FROM retention_heartbeats WHERE trigger_source='scheduler') AS scheduled_completed_at,
  COALESCE((SELECT completed_at BETWEEN clock_timestamp()-interval '26 hours' AND clock_timestamp()
    FROM retention_heartbeats WHERE trigger_source='scheduler'),false) AS scheduled_fresh,
  (SELECT count(*) FROM sessions WHERE expires_at<clock_timestamp()-interval '26 hours'
    OR created_at<clock_timestamp()-interval '30 days') AS overdue_sessions,
  (SELECT count(*) FROM leads WHERE created_at<clock_timestamp()-interval '90 days') AS overdue_leads,
  (SELECT count(*) FROM knowledge_documents WHERE status='published') AS published_documents,
  (SELECT count(*) FROM knowledge_documents WHERE status='published' AND valid_until<=clock_timestamp()) AS expired_documents,
  (SELECT count(*) FROM knowledge_documents WHERE status='published' AND valid_until>clock_timestamp()
    AND valid_until<=clock_timestamp()+interval '7 days') AS expiring_documents,
  (SELECT min(valid_until) FROM knowledge_documents WHERE status='published') AS earliest_knowledge_expiry;

CREATE VIEW rondo_budget_status WITH (security_barrier=true) AS SELECT
  id,provider_base_url,model_prices,limit_microusd,reserved_microusd,valid_from,valid_until,enabled,
  CASE WHEN length(btrim(approved_reference))>0 THEN 'private-reference-present' ELSE '' END AS approved_reference
  FROM ai_budget_authorizations;

REVOKE ALL ON rondo_retention_status,rondo_budget_status FROM PUBLIC;
DO $$ BEGIN
  IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='velani_ai_app') THEN
    GRANT SELECT ON rondo_retention_status,rondo_budget_status TO velani_ai_app;
  END IF;
END $$;
