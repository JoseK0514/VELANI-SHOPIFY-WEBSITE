-- Operational enums/opaque IDs only. No conversation or customer data.
CREATE TABLE rondo_monitor_state (
  scope text PRIMARY KEY CHECK (scope='development'),
  state text NOT NULL CHECK (state IN ('ok','attention')),
  incident_id uuid,
  observed_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE rondo_monitor_notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL REFERENCES rondo_monitor_state(scope),
  incident_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('outage','recovery')),
  source_sha text NOT NULL CHECK (source_sha ~ '^[a-f0-9]{40}$'),
  status text NOT NULL CHECK (status IN ('pending','disabled','sending','submitted','uncertain','capped')),
  attempts smallint NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 1),
  provider_id text,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  attempted_at timestamptz,
  UNIQUE(scope,incident_id,kind)
);
REVOKE ALL ON rondo_monitor_state,rondo_monitor_notices FROM PUBLIC;
CREATE FUNCTION preserve_rondo_notice() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
  IF ROW(NEW.id,NEW.scope,NEW.incident_id,NEW.kind,NEW.source_sha,NEW.created_at)
     IS DISTINCT FROM ROW(OLD.id,OLD.scope,OLD.incident_id,OLD.kind,OLD.source_sha,OLD.created_at)
     OR NEW.attempts<OLD.attempts
     OR (OLD.attempts=1 AND NEW.status IN ('pending','disabled','capped')) THEN
    RAISE EXCEPTION 'rondo_notice_immutable';
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION preserve_rondo_notice() FROM PUBLIC;
CREATE TRIGGER preserve_rondo_notice BEFORE UPDATE ON rondo_monitor_notices
FOR EACH ROW EXECUTE FUNCTION preserve_rondo_notice();
