-- =============================================================================
-- Studfy — 0001_init.sql
-- Initial schema migration (PostgreSQL 16+)
-- -----------------------------------------------------------------------------
-- This raw migration owns everything Prisma migrate cannot express:
--   * extensions (vector, ltree, pgcrypto, citext)
--   * HNSW vector indexes, GiST ltree indexes, GIN jsonb/array indexes
--   * Row-Level Security (RLS) enablement + policies
--   * time-range partitioning for analytics_events
-- Run this BEFORE / alongside `prisma migrate deploy` (extensions first).
-- Idempotent where practical (IF NOT EXISTS).
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- EXTENSIONS
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS vector;     -- pgvector: embeddings + HNSW
CREATE EXTENSION IF NOT EXISTS ltree;      -- folder materialized path tree
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS citext;     -- case-insensitive email

-- =============================================================================
-- IDENTITY & TENANCY
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         CITEXT UNIQUE NOT NULL,
  display_name  TEXT,
  auth_provider TEXT,                                   -- passkey|google|email
  kms_key_id    TEXT,                                   -- per-user envelope key
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workspaces (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL DEFAULT 'Çalışma Alanım',
  settings   JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_workspaces_user ON workspaces (user_id);

-- =============================================================================
-- FOLDER TREE
-- =============================================================================
CREATE TABLE IF NOT EXISTS folders (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  parent_id    UUID REFERENCES folders(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  path         LTREE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_folders_workspace ON folders (workspace_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent    ON folders (parent_id);
-- ltree subtree/ancestor queries (descendant @>, ancestor <@, lquery ~)
CREATE INDEX IF NOT EXISTS idx_folders_path_gist ON folders USING gist (path);

-- =============================================================================
-- FILES (multimodal)
-- =============================================================================
CREATE TABLE IF NOT EXISTS files (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  folder_id     UUID REFERENCES folders(id) ON DELETE SET NULL,
  original_name TEXT NOT NULL,
  mime_type     TEXT NOT NULL,
  modality      TEXT NOT NULL,                          -- document|image|handwriting|audio|video
  storage_key   TEXT NOT NULL,
  content_hash  TEXT,
  size_bytes    BIGINT,
  status        TEXT NOT NULL DEFAULT 'queued',         -- queued|extracting|embedding|ready|failed
  detected_course     TEXT,
  detected_topic      TEXT,
  detected_subtopic   TEXT,
  classify_confidence REAL,
  tags          TEXT[],
  language      TEXT,
  duration_sec  INT,
  page_count    INT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_files_workspace ON files (workspace_id);
CREATE INDEX IF NOT EXISTS idx_files_folder    ON files (folder_id);
CREATE INDEX IF NOT EXISTS idx_files_hash      ON files (content_hash);
CREATE INDEX IF NOT EXISTS idx_files_status    ON files (status);
-- array containment search on tags
CREATE INDEX IF NOT EXISTS idx_files_tags_gin  ON files USING gin (tags);

-- =============================================================================
-- FILE CHUNKS (RAG retrieval unit) — pgvector
-- =============================================================================
CREATE TABLE IF NOT EXISTS file_chunks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id      UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE, -- denormalized
  chunk_index  INT,
  content      TEXT NOT NULL,
  locator      JSONB,                                   -- {page,paragraph}|{start_sec}
  token_count  INT,
  embedding    VECTOR(1024),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_file_chunks_file      ON file_chunks (file_id);
CREATE INDEX IF NOT EXISTS idx_file_chunks_workspace ON file_chunks (workspace_id);
CREATE INDEX IF NOT EXISTS idx_file_chunks_locator   ON file_chunks USING gin (locator);
-- HNSW cosine ANN index. m = graph degree, ef_construction = build quality.
CREATE INDEX IF NOT EXISTS idx_file_chunks_embedding_hnsw
  ON file_chunks USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- =============================================================================
-- TRANSCRIPTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS transcripts (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id   UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  start_sec REAL,
  end_sec   REAL,
  speaker   TEXT,
  text      TEXT
);
CREATE INDEX IF NOT EXISTS idx_transcripts_file ON transcripts (file_id);

-- =============================================================================
-- DERIVED CONTENTS (3-layer)
-- =============================================================================
CREATE TABLE IF NOT EXISTS derived_contents (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id    UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  layer      TEXT NOT NULL,                             -- quick_glance|academic|analogy
  format     TEXT NOT NULL DEFAULT 'markdown',
  content    TEXT,
  audio_key  TEXT,
  model_used TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (file_id, layer)
);
CREATE INDEX IF NOT EXISTS idx_derived_file ON derived_contents (file_id);

-- =============================================================================
-- FILE LINKS (knowledge graph edges)
-- =============================================================================
CREATE TABLE IF NOT EXISTS file_links (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  src_file     UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  dst_file     UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  relation     TEXT,                                    -- supports|contradicts|extends|duplicate
  score        REAL,
  ai_suggested BOOLEAN NOT NULL DEFAULT true,
  accepted     BOOLEAN
);
CREATE INDEX IF NOT EXISTS idx_file_links_src ON file_links (src_file);
CREATE INDEX IF NOT EXISTS idx_file_links_dst ON file_links (dst_file);

-- =============================================================================
-- NOTES — pgvector
-- =============================================================================
CREATE TABLE IF NOT EXISTS notes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  folder_id    UUID REFERENCES folders(id) ON DELETE SET NULL,
  title        TEXT,
  doc          JSONB,
  embedding    VECTOR(1024),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notes_workspace ON notes (workspace_id);
CREATE INDEX IF NOT EXISTS idx_notes_folder    ON notes (folder_id);
CREATE INDEX IF NOT EXISTS idx_notes_embedding_hnsw
  ON notes USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- =============================================================================
-- QUIZ ENGINE
-- =============================================================================
CREATE TABLE IF NOT EXISTS quizzes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title           TEXT,
  source_file_ids UUID[],
  mode            TEXT,                                 -- practice|exam
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quizzes_workspace ON quizzes (workspace_id);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id         UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  type            TEXT,                                 -- mcq|true_false|fill_blank|match|open
  stem            TEXT,
  options         JSONB,
  answer          JSONB,
  explanation     TEXT,
  source_chunk_id UUID REFERENCES file_chunks(id) ON DELETE SET NULL, -- grounding
  source_locator  JSONB,
  difficulty      REAL,
  topic           TEXT,
  verified        BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz  ON quiz_questions (quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_chunk ON quiz_questions (source_chunk_id);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id   UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  given_answer  JSONB,
  is_correct    BOOLEAN,
  time_spent_ms INT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_question ON quiz_attempts (question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user     ON quiz_attempts (user_id);

-- =============================================================================
-- FLASHCARDS (FSRS) + REVIEW LOGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS flashcards (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  file_id      UUID REFERENCES files(id) ON DELETE SET NULL,
  front        TEXT,
  back         TEXT,
  cloze        TEXT,
  stability    REAL,
  difficulty   REAL,
  due_at       TIMESTAMPTZ,
  state        TEXT NOT NULL DEFAULT 'new',             -- new|learning|review|relearning
  reps         INT NOT NULL DEFAULT 0,
  lapses       INT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_flashcards_workspace ON flashcards (workspace_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_file      ON flashcards (file_id);
-- due-card queue scan (per workspace) is the hot path
CREATE INDEX IF NOT EXISTS idx_flashcards_due       ON flashcards (workspace_id, due_at);

CREATE TABLE IF NOT EXISTS review_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id     UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 4), -- 1 again..4 easy
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_review_logs_card ON review_logs (card_id);

-- =============================================================================
-- CHAT / ASSISTANT
-- =============================================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  scope        JSONB,                                   -- {file_ids|folder_id|all}
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_workspace ON chat_sessions (workspace_id);

CREATE TABLE IF NOT EXISTS chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role       TEXT,                                      -- user|assistant|system
  content    TEXT,
  citations  JSONB,                                     -- [{chunk_id, locator}]
  tokens     INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages (session_id);

-- =============================================================================
-- ANALYTICS EVENTS (time-partitioned, RANGE on created_at)
-- =============================================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id           BIGSERIAL,
  user_id      UUID,
  workspace_id UUID,
  event_type   TEXT,
  topic        TEXT,
  payload      JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- PK must include the partition key
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_user       ON analytics_events (user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_workspace  ON analytics_events (workspace_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events (event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created    ON analytics_events (created_at);

-- Example monthly partitions (rolled forward by a scheduled job / pg_partman).
CREATE TABLE IF NOT EXISTS analytics_events_2026_06 PARTITION OF analytics_events
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE IF NOT EXISTS analytics_events_2026_07 PARTITION OF analytics_events
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
-- Catch-all for out-of-range rows so inserts never fail.
CREATE TABLE IF NOT EXISTS analytics_events_default PARTITION OF analytics_events DEFAULT;

-- =============================================================================
-- GLOBAL LIBRARY (community-shared) — pgvector
-- =============================================================================
CREATE TABLE IF NOT EXISTS library_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  anonymous         BOOLEAN NOT NULL DEFAULT false,
  title             TEXT,
  description       TEXT,
  content           TEXT,
  course            TEXT,
  topic             TEXT,
  tags              TEXT[],
  embedding         VECTOR(1024),
  license           TEXT,
  upvotes           INT NOT NULL DEFAULT 0,
  import_count      INT NOT NULL DEFAULT 0,
  moderation_status TEXT NOT NULL DEFAULT 'pending',    -- pending|approved|rejected
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_library_author     ON library_items (author_user_id);
CREATE INDEX IF NOT EXISTS idx_library_course     ON library_items (course);
CREATE INDEX IF NOT EXISTS idx_library_moderation ON library_items (moderation_status);
CREATE INDEX IF NOT EXISTS idx_library_tags_gin   ON library_items USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_library_embedding_hnsw
  ON library_items USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- =============================================================================
-- ROW-LEVEL SECURITY (multi-tenant isolation)
-- -----------------------------------------------------------------------------
-- The application sets the current user per request/transaction:
--     SET LOCAL app.user_id = '<uuid>';
-- Policies derive the allowed set of workspaces from that user id.
-- The app role MUST NOT be a superuser and MUST NOT have BYPASSRLS.
-- =============================================================================

-- Enable + FORCE (FORCE also applies RLS to the table owner).
ALTER TABLE workspaces       ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces       FORCE  ROW LEVEL SECURITY;
ALTER TABLE folders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders          FORCE  ROW LEVEL SECURITY;
ALTER TABLE files            ENABLE ROW LEVEL SECURITY;
ALTER TABLE files            FORCE  ROW LEVEL SECURITY;
ALTER TABLE file_chunks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_chunks      FORCE  ROW LEVEL SECURITY;
ALTER TABLE notes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes            FORCE  ROW LEVEL SECURITY;
ALTER TABLE quizzes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes          FORCE  ROW LEVEL SECURITY;
ALTER TABLE flashcards       ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards       FORCE  ROW LEVEL SECURITY;
ALTER TABLE chat_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions    FORCE  ROW LEVEL SECURITY;

-- Helper expression reused below: current app user id as uuid.
--   current_setting('app.user_id', true) → NULL-safe (true = don't error if unset)

-- workspaces: a user sees only their own workspaces.
DROP POLICY IF EXISTS workspaces_tenant_isolation ON workspaces;
CREATE POLICY workspaces_tenant_isolation ON workspaces
  USING (user_id = current_setting('app.user_id', true)::uuid)
  WITH CHECK (user_id = current_setting('app.user_id', true)::uuid);

-- folders: restricted to workspaces the user owns.
DROP POLICY IF EXISTS folders_tenant_isolation ON folders;
CREATE POLICY folders_tenant_isolation ON folders
  USING (workspace_id IN (
    SELECT id FROM workspaces WHERE user_id = current_setting('app.user_id', true)::uuid))
  WITH CHECK (workspace_id IN (
    SELECT id FROM workspaces WHERE user_id = current_setting('app.user_id', true)::uuid));

-- files
DROP POLICY IF EXISTS files_tenant_isolation ON files;
CREATE POLICY files_tenant_isolation ON files
  USING (workspace_id IN (
    SELECT id FROM workspaces WHERE user_id = current_setting('app.user_id', true)::uuid))
  WITH CHECK (workspace_id IN (
    SELECT id FROM workspaces WHERE user_id = current_setting('app.user_id', true)::uuid));

-- file_chunks: uses the denormalized workspace_id directly (no join → fast,
-- and keeps RLS cheap on the highest-cardinality table / vector search path).
DROP POLICY IF EXISTS file_chunks_tenant_isolation ON file_chunks;
CREATE POLICY file_chunks_tenant_isolation ON file_chunks
  USING (workspace_id IN (
    SELECT id FROM workspaces WHERE user_id = current_setting('app.user_id', true)::uuid))
  WITH CHECK (workspace_id IN (
    SELECT id FROM workspaces WHERE user_id = current_setting('app.user_id', true)::uuid));

-- notes
DROP POLICY IF EXISTS notes_tenant_isolation ON notes;
CREATE POLICY notes_tenant_isolation ON notes
  USING (workspace_id IN (
    SELECT id FROM workspaces WHERE user_id = current_setting('app.user_id', true)::uuid))
  WITH CHECK (workspace_id IN (
    SELECT id FROM workspaces WHERE user_id = current_setting('app.user_id', true)::uuid));

-- quizzes
DROP POLICY IF EXISTS quizzes_tenant_isolation ON quizzes;
CREATE POLICY quizzes_tenant_isolation ON quizzes
  USING (workspace_id IN (
    SELECT id FROM workspaces WHERE user_id = current_setting('app.user_id', true)::uuid))
  WITH CHECK (workspace_id IN (
    SELECT id FROM workspaces WHERE user_id = current_setting('app.user_id', true)::uuid));

-- flashcards
DROP POLICY IF EXISTS flashcards_tenant_isolation ON flashcards;
CREATE POLICY flashcards_tenant_isolation ON flashcards
  USING (workspace_id IN (
    SELECT id FROM workspaces WHERE user_id = current_setting('app.user_id', true)::uuid))
  WITH CHECK (workspace_id IN (
    SELECT id FROM workspaces WHERE user_id = current_setting('app.user_id', true)::uuid));

-- chat_sessions
DROP POLICY IF EXISTS chat_sessions_tenant_isolation ON chat_sessions;
CREATE POLICY chat_sessions_tenant_isolation ON chat_sessions
  USING (workspace_id IN (
    SELECT id FROM workspaces WHERE user_id = current_setting('app.user_id', true)::uuid))
  WITH CHECK (workspace_id IN (
    SELECT id FROM workspaces WHERE user_id = current_setting('app.user_id', true)::uuid));

-- NOTE on library_items: globally readable (approved rows), so it is left
-- WITHOUT RLS by design; visibility is enforced in application queries
-- (moderation_status = 'approved'). Enable RLS here only if author-scoped
-- writes need DB-level enforcement.

COMMIT;
