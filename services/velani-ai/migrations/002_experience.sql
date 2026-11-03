CREATE TABLE session_profiles (
  session_id uuid PRIMARY KEY REFERENCES sessions (id) ON DELETE CASCADE,
  profile jsonb NOT NULL CHECK (jsonb_typeof(profile) = 'object'),
  revision integer NOT NULL CHECK (revision > 0),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE workflow_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions (id) ON DELETE CASCADE,
  generated_plan jsonb NOT NULL CHECK (jsonb_typeof(generated_plan) = 'object'),
  actions jsonb NOT NULL CHECK (jsonb_typeof(actions) = 'array'),
  notes text NOT NULL DEFAULT '',
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  profile_revision integer NOT NULL CHECK (profile_revision >= 0),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (session_id, id)
);
CREATE INDEX workflow_plans_session_idx ON workflow_plans (session_id, created_at DESC);

CREATE TABLE plan_requests (
  session_id uuid NOT NULL REFERENCES sessions (id) ON DELETE CASCADE,
  request_id text NOT NULL CHECK (length(request_id) BETWEEN 1 AND 128),
  request_hash text NOT NULL CHECK (request_hash ~ '^[a-f0-9]{64}$'),
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  lease_token uuid NOT NULL,
  lease_expires_at timestamptz NOT NULL,
  plan_id uuid,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (session_id, request_id),
  FOREIGN KEY (session_id, plan_id) REFERENCES workflow_plans (session_id, id) ON DELETE CASCADE,
  CHECK ((status = 'completed') = (plan_id IS NOT NULL))
);
CREATE UNIQUE INDEX one_pending_plan_per_session ON plan_requests (session_id) WHERE status = 'pending';

-- A consented enquiry may retain the visitor-reviewed plan independently of
-- the short-lived chat. No foreign key points back to an expiring session.
ALTER TABLE leads ADD COLUMN plan_snapshot jsonb CHECK (plan_snapshot IS NULL OR jsonb_typeof(plan_snapshot) = 'object');

-- Existing installations already have this role. Fresh databases can provision
-- it later with the administrative role script; tests need not create roles.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'velani_ai_app') THEN
    GRANT SELECT, INSERT, UPDATE ON session_profiles, plan_requests TO velani_ai_app;
    GRANT SELECT, INSERT ON workflow_plans TO velani_ai_app;
    GRANT UPDATE (actions, notes, revision, updated_at) ON workflow_plans TO velani_ai_app;
  END IF;
END
$$;
