-- Finite, explicitly approved allowances. No policy, spending or automatic renewal
-- is created by this migration. Only the operator can install/pause a policy.
CREATE TABLE ai_budget_authorizations (
  id uuid PRIMARY KEY,
  provider_base_url text NOT NULL CHECK (length(provider_base_url) BETWEEN 1 AND 500),
  model_prices jsonb NOT NULL CHECK (jsonb_typeof(model_prices) = 'array' AND pg_column_size(model_prices) < 16384),
  limit_microusd bigint NOT NULL CHECK (limit_microusd BETWEEN 1 AND 1000000000000),
  reserved_microusd bigint NOT NULL DEFAULT 0 CHECK (reserved_microusd BETWEEN 0 AND limit_microusd),
  valid_from timestamptz NOT NULL,
  valid_until timestamptz NOT NULL CHECK (valid_until > valid_from AND valid_until <= valid_from + interval '31 days'),
  approved_reference text NOT NULL CHECK (length(approved_reference) BETWEEN 1 AND 120),
  enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  last_reserved_at timestamptz
);
REVOKE ALL ON ai_budget_authorizations FROM PUBLIC;

CREATE FUNCTION preserve_ai_budget_authorization() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
  IF ROW(NEW.id, NEW.provider_base_url, NEW.model_prices, NEW.limit_microusd,
         NEW.valid_from, NEW.valid_until, NEW.approved_reference, NEW.created_at)
     IS DISTINCT FROM
     ROW(OLD.id, OLD.provider_base_url, OLD.model_prices, OLD.limit_microusd,
         OLD.valid_from, OLD.valid_until, OLD.approved_reference, OLD.created_at)
     OR NEW.reserved_microusd < OLD.reserved_microusd THEN
    RAISE EXCEPTION 'ai_budget_authorization_immutable';
  END IF;
  IF NEW.reserved_microusd > OLD.reserved_microusd THEN
    NEW.last_reserved_at := clock_timestamp();
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION preserve_ai_budget_authorization() FROM PUBLIC;
CREATE TRIGGER preserve_ai_budget_authorization
BEFORE UPDATE ON ai_budget_authorizations
FOR EACH ROW EXECUTE FUNCTION preserve_ai_budget_authorization();

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'velani_ai_app') THEN
    EXECUTE format('GRANT SELECT, UPDATE (reserved_microusd) ON %I.ai_budget_authorizations TO velani_ai_app', current_schema());
  END IF;
END $$;
