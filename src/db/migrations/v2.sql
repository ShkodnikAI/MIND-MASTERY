-- ============================================================================
-- Mind Mastery — Schema v2 Migration
-- Adds `reminders` table for user-created practice notifications.
-- ============================================================================

-- User-created practice reminders
CREATE TABLE IF NOT EXISTS reminders (
  id           TEXT    PRIMARY KEY,
  label        TEXT    NOT NULL DEFAULT '',
  hour         INTEGER NOT NULL DEFAULT 9,
  minute       INTEGER NOT NULL DEFAULT 0,
  days_json    TEXT    NOT NULL DEFAULT '[]',    -- JSON array of DayOfWeek (1-7)
  enabled      INTEGER NOT NULL DEFAULT 1,        -- 0 or 1
  sound        INTEGER NOT NULL DEFAULT 1,        -- 0 or 1
  linked_type  TEXT    NOT NULL DEFAULT 'none',   -- 'none' | 'system' | 'practice'
  linked_id    TEXT    NULL,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reminders_enabled ON reminders (enabled);
CREATE INDEX IF NOT EXISTS idx_reminders_created_at ON reminders (created_at);

-- Update schema version
INSERT OR REPLACE INTO settings (key, value_json, updated_at)
VALUES ('db_version', '2', strftime('%s', 'now'));
