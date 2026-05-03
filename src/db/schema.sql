-- ============================================================================
-- Mind Mastery — SQLite Schema (v1)
-- 6 tables with indexes on frequently queried columns.
-- ============================================================================

-- Session tracking
CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY,
  practice_id TEXT    NOT NULL,
  system_id   TEXT    NOT NULL,
  started_at  INTEGER NOT NULL,
  ended_at    INTEGER,
  duration_ms INTEGER,
  completed   INTEGER NOT NULL DEFAULT 0,  -- 0 or 1
  rating      REAL,
  mood        TEXT,
  notes       TEXT,
  created_at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_system_id   ON sessions (system_id);
CREATE INDEX IF NOT EXISTS idx_sessions_practice_id ON sessions (practice_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at  ON sessions (created_at);

-- Practice progress per user
CREATE TABLE IF NOT EXISTS progress (
  practice_id       TEXT    PRIMARY KEY,
  system_id         TEXT    NOT NULL,
  completed_count   INTEGER NOT NULL DEFAULT 0,
  total_duration_min INTEGER NOT NULL DEFAULT 0,
  current_level     INTEGER NOT NULL DEFAULT 1,
  last_completed_at INTEGER,
  is_unlocked       INTEGER NOT NULL DEFAULT 0  -- 0 or 1
);

CREATE INDEX IF NOT EXISTS idx_progress_system_id ON progress (system_id);

-- Meditation journal entries
CREATE TABLE IF NOT EXISTS journal (
  id              TEXT PRIMARY KEY,
  session_id      TEXT,
  practice_title  TEXT    NOT NULL,
  system_name     TEXT    NOT NULL,
  date            TEXT    NOT NULL,  -- YYYY-MM-DD
  duration_min    INTEGER NOT NULL DEFAULT 0,
  mood            TEXT,
  notes           TEXT,
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_journal_date       ON journal (date);
CREATE INDEX IF NOT EXISTS idx_journal_created_at ON journal (created_at);

-- User-created custom practices
CREATE TABLE IF NOT EXISTS user_practices (
  id             TEXT PRIMARY KEY,
  title          TEXT    NOT NULL,
  description    TEXT,
  segments_json  TEXT    NOT NULL,
  created_at     INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_practices_created_at ON user_practices (created_at);

-- Localised practice texts (TTS scripts, instructions, etc.)
CREATE TABLE IF NOT EXISTS practice_texts (
  practice_id TEXT    PRIMARY KEY,
  system_id   TEXT    NOT NULL,
  locale      TEXT    NOT NULL,
  data_json   TEXT    NOT NULL,
  version     INTEGER NOT NULL DEFAULT 1,
  updated_at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_practice_texts_system_id ON practice_texts (system_id);

-- Key-value settings store
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value_json TEXT    NOT NULL,
  updated_at INTEGER NOT NULL
);
