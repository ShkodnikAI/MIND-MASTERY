/**
 * Journal repository — typed queries for the `journal` table.
 */

import { getDatabase } from '@/db/index';
import {
  JournalEntry,
  CreateJournalInput,
  UpdateJournalInput,
} from '@/db/types';
import { logger } from '@/utils/logger';

/** Insert a new journal entry and return its id. */
export async function createEntry(
  entry: CreateJournalInput,
): Promise<string> {
  const db = await getDatabase();
  const now = Date.now();

  await db.runAsync(
    `INSERT INTO journal
       (id, session_id, practice_title, system_name, date, duration_min, mood, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    entry.id,
    entry.session_id ?? null,
    entry.practice_title,
    entry.system_name,
    entry.date,
    entry.duration_min,
    entry.mood ?? null,
    entry.notes ?? null,
    now,
    now,
  );

  logger.debug('[db:journal]', `Created entry ${entry.id}`);
  return entry.id;
}

/** Update mutable fields on an existing journal entry. */
export async function updateEntry(
  id: string,
  updates: UpdateJournalInput,
): Promise<void> {
  const db = await getDatabase();

  const fields: string[] = ['updated_at = ?'];
  const values: (string | number | null)[] = [Date.now()];

  if (updates.session_id !== undefined) {
    fields.push('session_id = ?');
    values.push(updates.session_id);
  }
  if (updates.practice_title !== undefined) {
    fields.push('practice_title = ?');
    values.push(updates.practice_title);
  }
  if (updates.system_name !== undefined) {
    fields.push('system_name = ?');
    values.push(updates.system_name);
  }
  if (updates.date !== undefined) {
    fields.push('date = ?');
    values.push(updates.date);
  }
  if (updates.duration_min !== undefined) {
    fields.push('duration_min = ?');
    values.push(updates.duration_min);
  }
  if (updates.mood !== undefined) {
    fields.push('mood = ?');
    values.push(updates.mood);
  }
  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    values.push(updates.notes);
  }

  values.push(id);

  await db.runAsync(
    `UPDATE journal SET ${fields.join(', ')} WHERE id = ?`,
    ...values,
  );

  logger.debug('[db:journal]', `Updated entry ${id}`);
}

/** Fetch a single journal entry by id. */
export async function getEntry(
  id: string,
): Promise<JournalEntry | null> {
  const db = await getDatabase();
  return (
    db.getFirstAsync<JournalEntry>(
      'SELECT * FROM journal WHERE id = ?',
      id,
    ) ?? null
  );
}

/** Fetch the most recent journal entries, ordered by created_at descending. */
export async function getRecentEntries(
  limit: number,
): Promise<JournalEntry[]> {
  const db = await getDatabase();
  return db.getAllAsync<JournalEntry>(
    'SELECT * FROM journal ORDER BY created_at DESC LIMIT ?',
    limit,
  );
}

/** Fetch journal entries within a date range (inclusive). Dates are YYYY-MM-DD strings. */
export async function getEntriesByDateRange(
  start: string,
  end: string,
): Promise<JournalEntry[]> {
  const db = await getDatabase();
  return db.getAllAsync<JournalEntry>(
    `SELECT * FROM journal
     WHERE date >= ? AND date <= ?
     ORDER BY date DESC, created_at DESC`,
    start,
    end,
  );
}

/** Delete a journal entry by id. */
export async function deleteEntry(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM journal WHERE id = ?', id);
  logger.debug('[db:journal]', `Deleted entry ${id}`);
}
