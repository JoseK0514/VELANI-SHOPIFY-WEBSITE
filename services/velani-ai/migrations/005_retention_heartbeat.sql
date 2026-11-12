-- Two bounded aggregate receipts; no conversation content, identity or credentials.
CREATE TABLE retention_heartbeats (
  trigger_source text PRIMARY KEY CHECK (trigger_source IN ('scheduler', 'operator')),
  completed_at timestamptz NOT NULL,
  sessions_deleted bigint NOT NULL CHECK (sessions_deleted >= 0)
);

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'velani_ai_app') THEN
    EXECUTE format('GRANT SELECT, INSERT, UPDATE ON %I.retention_heartbeats TO velani_ai_app', current_schema());
  END IF;
END $$;
