/**
 * Sessions repository — typed queries for the `sessions` table.
 * All queries use parameterized bindings (no string interpolation).
 */

import { getDatabase } from '@/db/index';
import { SessionRecord, CreateSessionInput, UpdateSessionInput } from '@/db/types';
import { logger } from '@/utils/logger';

/** Insert a new session and return its id. */
export async function createSession(record: CreateSessionInput): Promise<string> {
  const db = await getDatabase();

  await db.runAsync(
    `INSERT INTO sessions
       (id, practice_id, system_id, started_at, ended_at, duration_ms, completed, rating, mood, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    record.id,
    record.practice_id,
    record.system_id,
    record.started_at,
    record.ended_at ?? null,
    record.duration_ms ?? null,
    record.completed ?? 0,
    record.rating ?? null,
    record.mood ?? null,
    record.notes ?? null,
    record.started_at, // created_at defaults to started_at
  );

  logger.debug('[db:sessions]', `Created session ${record.id}`);
  return record.id;
}

/** Update mutable fields on an existing session. */
export async function updateSession(id: string, updates: UpdateSessionInput): Promise<void> {
  const db = await getDatabase();

  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.ended_at !== undefined) {
    fields.push('ended_at = ?');
    values.push(updates.ended_at);
  }
  if (updates.duration_ms !== undefined) {
    fields.push('duration_ms = ?');
    values.push(updates.duration_ms);
  }
  if (updates.completed !== undefined) {
    fields.push('completed = ?');
    values.push(updates.completed);
  }
  if (updates.rating !== undefined) {
    fields.push('rating = ?');
    values.push(updates.rating);
  }
  if (updates.mood !== undefined) {
    fields.push('mood = ?');
    values.push(updates.mood);
  }
  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    values.push(updates.notes);
  }

  if (fields.length === 0) {
    logger.warn('[db:sessions]', `updateSession called with no fields for ${id}`);
    return;
  }

  values.push(id);

  await db.runAsync(`UPDATE sessions SET ${fields.join(', ')} WHERE id = ?`, ...values);

  logger.debug('[db:sessions]', `Updated session ${id}`);
}

/** Fetch a single session by id. Returns null if not found. */
export async function getSession(id: string): Promise<SessionRecord | null> {
  const db = await getDatabase();
  return db.getFirstAsync<SessionRecord>('SELECT * FROM sessions WHERE id = ?', id) ?? null;
}

/** Fetch the most recent sessions, ordered by created_at descending. */
export async function getRecentSessions(limit: number): Promise<SessionRecord[]> {
  const db = await getDatabase();
  return db.getAllAsync<SessionRecord>(
    'SELECT * FROM sessions ORDER BY created_at DESC LIMIT ?',
    limit,
  );
}

/** Compute total meditation time across all completed sessions, in minutes. */
export async function getTotalSessionMinutes(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(duration_ms), 0) / 60000 AS total
     FROM sessions
     WHERE completed = 1 AND duration_ms IS NOT NULL`,
  );
  return result?.total ?? 0;
}
