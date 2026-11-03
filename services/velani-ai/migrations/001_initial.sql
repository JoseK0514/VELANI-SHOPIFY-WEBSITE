CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE CHECK (token_hash ~ '^[a-f0-9]{64}$'),
  locale text NOT NULL CHECK (locale IN ('en', 'es')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX sessions_expiry_idx ON sessions (expires_at);

CREATE TABLE chat_turns (
  session_id uuid NOT NULL REFERENCES sessions (id) ON DELETE CASCADE,
  request_id text NOT NULL CHECK (length(request_id) BETWEEN 1 AND 128),
  request_hash text NOT NULL CHECK (request_hash ~ '^[a-f0-9]{64}$'),
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  lease_token uuid NOT NULL,
  lease_expires_at timestamptz NOT NULL,
  answer jsonb,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (session_id, request_id),
  CHECK ((status = 'completed') = (answer IS NOT NULL))
);
CREATE UNIQUE INDEX one_pending_turn_per_session ON chat_turns (session_id) WHERE status = 'pending';

CREATE TABLE messages (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id uuid NOT NULL,
  request_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  FOREIGN KEY (session_id, request_id) REFERENCES chat_turns (session_id, request_id) ON DELETE CASCADE,
  UNIQUE (session_id, request_id, role)
);
CREATE INDEX messages_session_idx ON messages (session_id, id DESC);

CREATE TABLE knowledge_documents (
  id text PRIMARY KEY,
  title text NOT NULL,
  url text NOT NULL,
  content text NOT NULL,
  locale text NOT NULL CHECK (locale IN ('en', 'es')),
  reviewed_at timestamptz NOT NULL,
  valid_until timestamptz NOT NULL CHECK (valid_until > reviewed_at),
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'archived')),
  is_core boolean NOT NULL DEFAULT false,
  managed_by text NOT NULL DEFAULT 'manual',
  content_hash text NOT NULL,
  embedding vector(1536),
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', title), 'A') || setweight(to_tsvector('simple', content), 'B')
  ) STORED,
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX knowledge_search_idx ON knowledge_documents USING gin (search_vector);
CREATE INDEX knowledge_embedding_idx ON knowledge_documents USING hnsw (embedding vector_cosine_ops) WHERE embedding IS NOT NULL;
CREATE INDEX knowledge_publication_idx ON knowledge_documents (status, locale, valid_until);

CREATE TABLE rate_limits (
  key text PRIMARY KEY,
  hits integer NOT NULL CHECK (hits > 0),
  window_started_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  expires_at timestamptz NOT NULL
);
CREATE INDEX rate_limits_expiry_idx ON rate_limits (expires_at);

CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions (id) ON DELETE SET NULL,
  origin_session_id uuid NOT NULL,
  request_id text NOT NULL CHECK (length(request_id) BETWEEN 1 AND 128),
  request_hash text NOT NULL CHECK (request_hash ~ '^[a-f0-9]{64}$'),
  name text NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  email text NOT NULL CHECK (length(email) BETWEEN 3 AND 254),
  company text,
  team_size text,
  locations text,
  message text,
  consent boolean NOT NULL CHECK (consent = true),
  consent_version text NOT NULL CHECK (consent_version = 'lead-v1'),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (origin_session_id, request_id)
);
CREATE INDEX leads_retention_idx ON leads (created_at);
