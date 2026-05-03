/**
 * Database record types.
 * These mirror the SQLite table schemas with proper TypeScript types.
 */

/** Row type for the `sessions` table */
export interface SessionRecord {
  id: string;
  practice_id: string;
  system_id: string;
  started_at: number;
  ended_at: number | null;
  duration_ms: number | null;
  completed: number; // 0 or 1
  rating: number | null;
  mood: string | null;
  notes: string | null;
  created_at: number;
}

/** Input for creating a new session (nullable fields omitted) */
export interface CreateSessionInput {
  id: string;
  practice_id: string;
  system_id: string;
  started_at: number;
  ended_at?: number | null;
  duration_ms?: number | null;
  completed?: number;
  rating?: number | null;
  mood?: string | null;
  notes?: string | null;
}

/** Fields that can be updated on an existing session */
export interface UpdateSessionInput {
  ended_at?: number | null;
  duration_ms?: number | null;
  completed?: number;
  rating?: number | null;
  mood?: string | null;
  notes?: string | null;
}

/** Row type for the `progress` table */
export interface PracticeProgress {
  practice_id: string;
  system_id: string;
  completed_count: number;
  total_duration_min: number;
  current_level: number;
  last_completed_at: number | null;
  is_unlocked: number; // 0 or 1
}

/** Fields that can be updated on progress */
export interface UpdateProgressInput {
  completed_count?: number;
  total_duration_min?: number;
  current_level?: number;
  last_completed_at?: number | null;
  is_unlocked?: number;
}

/** Row type for the `journal` table */
export interface JournalEntry {
  id: string;
  session_id: string | null;
  practice_title: string;
  system_name: string;
  date: string; // ISO date string YYYY-MM-DD
  duration_min: number;
  mood: string | null;
  notes: string | null;
  created_at: number;
  updated_at: number;
}

/** Input for creating a journal entry */
export interface CreateJournalInput {
  id: string;
  session_id?: string | null;
  practice_title: string;
  system_name: string;
  date: string;
  duration_min: number;
  mood?: string | null;
  notes?: string | null;
}

/** Fields that can be updated on a journal entry */
export interface UpdateJournalInput {
  session_id?: string | null;
  practice_title?: string;
  system_name?: string;
  date?: string;
  duration_min?: number;
  mood?: string | null;
  notes?: string | null;
}

/** Row type for the `user_practices` table */
export interface UserPractice {
  id: string;
  title: string;
  description: string | null;
  segments_json: string;
  created_at: number;
}

/** Input for creating a user practice */
export interface CreateUserPracticeInput {
  id: string;
  title: string;
  description?: string | null;
  segments_json: string;
}

/** Row type for the `practice_texts` table */
export interface PracticeText {
  practice_id: string;
  system_id: string;
  locale: string;
  data_json: string;
  version: number;
  updated_at: number;
}

/** Input for upserting practice texts */
export interface UpsertPracticeTextInput {
  practice_id: string;
  system_id: string;
  locale: string;
  data_json: string;
  version: number;
}

/** Row type for the `settings` table */
export interface SettingRecord {
  key: string;
  value_json: string;
  updated_at: number;
}

/** Row type for the `reminders` table */
export interface ReminderRecord {
  id: string;
  label: string;
  hour: number;
  minute: number;
  days_json: string;
  enabled: number; // 0 or 1
  sound: number; // 0 or 1
  linked_type: string;
  linked_id: string | null;
  created_at: string;
  updated_at: string;
}
