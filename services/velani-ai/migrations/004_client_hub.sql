-- Velani website requests only. No foreign keys or access to NEVORA workforce data.
CREATE TABLE client_hub_counters (
  period text PRIMARY KEY CHECK (period ~ '^[0-9]{4}$'),
  value integer NOT NULL CHECK (value > 0)
);
CREATE TABLE client_hub_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  key_hash text NOT NULL UNIQUE CHECK (key_hash ~ '^[a-f0-9]{64}$'),
  request_hash text NOT NULL CHECK (request_hash ~ '^[a-f0-9]{64}$'),
  email_quota_hash text NOT NULL CHECK (email_quota_hash ~ '^[a-f0-9]{64}$'),
  fields jsonb NOT NULL CHECK (jsonb_typeof(fields) = 'object'
    AND fields->>'type' IN ('new_work','project_support') AND fields->>'language' IN ('en','es')
    AND NOT (fields ? 'turnstileToken')),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '88 days'
);
CREATE INDEX client_hub_expiry_idx ON client_hub_requests(expires_at);
CREATE INDEX client_hub_rolling_idx ON client_hub_requests(created_at);
CREATE INDEX client_hub_email_rolling_idx ON client_hub_requests(email_quota_hash,created_at);
CREATE TABLE client_hub_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES client_hub_requests(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('support','confirmation')),
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload)='object'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','submitted','blocked','uncertain')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  first_attempt_at timestamptz,
  submission_uncertain boolean NOT NULL DEFAULT false,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  lease_token uuid,
  lease_expires_at timestamptz,
  provider_id text,
  failure_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(request_id,kind)
);
CREATE INDEX client_hub_outbox_due_idx ON client_hub_outbox(status,next_attempt_at);
CREATE TABLE client_hub_limits (
  key text PRIMARY KEY,
  hits integer NOT NULL CHECK(hits>0),
  expires_at timestamptz NOT NULL
);
CREATE INDEX client_hub_limits_expiry_idx ON client_hub_limits(expires_at);
