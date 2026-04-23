/**
 * @file Reminder repository — typed queries for the `reminders` table.
 *
 * INV-1: SQLite is the source of truth for all reminder data.
 * This module is the ONLY way to read/write reminder records.
 *
 * Conversion between ReminderRecord (DB row) and Reminder (app type) happens here.
 */

import { getDatabase } from '@/db/index';
import type { ReminderRecord } from '@/db/types';
import type { Reminder, CreateReminderInput, UpdateReminderInput, DayOfWeek } from '@/types';
import { logger } from '@/utils/logger';

// ─── Record ↔ Domain conversion ─────────────────────────────────

/** Convert a DB row to the app-level Reminder type. */
function recordToReminder(row: ReminderRecord): Reminder {
  let days: DayOfWeek[] = [];
  try {
    const parsed = JSON.parse(row.days_json);
    if (Array.isArray(parsed)) {
      days = parsed.filter((d): d is DayOfWeek => typeof d === 'number' && d >= 1 && d <= 7);
    }
  } catch {
    logger.warn('[db:reminders]', `Failed to parse days_json for reminder ${row.id}`);
  }

  return {
    id: row.id,
    label: row.label,
    hour: row.hour,
    minute: row.minute,
    days,
    enabled: row.enabled === 1,
    sound: row.sound === 1,
    linkedType: row.linked_type as Reminder['linkedType'],
    linkedId: row.linked_id,
    createdAt: row.created_at,
  };
}

// ─── Queries ─────────────────────────────────────────────────────

/** Fetch all reminders from the database, sorted by creation date (newest first). */
export async function getAllReminders(): Promise<Reminder[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ReminderRecord>(
    'SELECT * FROM reminders ORDER BY created_at DESC',
  );
  return rows.map(recordToReminder);
}

/** Fetch a single reminder by ID. */
export async function getReminderById(id: string): Promise<Reminder | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<ReminderRecord>('SELECT * FROM reminders WHERE id = ?', id);
  return row ? recordToReminder(row) : null;
}

/** Count total number of reminders (including disabled). */
export async function countReminders(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM reminders');
  return row?.count ?? 0;
}

/**
 * Create a new reminder and return it.
 * Generates a UUID v4 for the ID and uses current timestamp for creation.
 */
export async function createReminder(input: CreateReminderInput): Promise<Reminder> {
  const db = await getDatabase();
  const id = generateUUID();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO reminders (id, label, hour, minute, days_json, enabled, sound, linked_type, linked_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    input.label,
    input.hour,
    input.minute,
    JSON.stringify(input.days),
    input.enabled ? 1 : 0,
    input.sound ? 1 : 0,
    input.linkedType,
    input.linkedId,
    now,
    now,
  );

  logger.debug('[db:reminders]', `Created reminder ${id}: "${input.label}"`);

  // Read back to confirm and return domain object
  const created = await getReminderById(id);
  if (!created) {
    throw new Error(`Failed to read back created reminder ${id}`);
  }
  return created;
}

/**
 * Update an existing reminder by ID.
 * Only the fields present in `updates` are modified.
 * Returns the updated Reminder, or null if not found.
 */
export async function updateReminder(
  id: string,
  updates: UpdateReminderInput,
): Promise<Reminder | null> {
  const db = await getDatabase();

  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.label !== undefined) {
    fields.push('label = ?');
    values.push(updates.label);
  }
  if (updates.hour !== undefined) {
    fields.push('hour = ?');
    values.push(updates.hour);
  }
  if (updates.minute !== undefined) {
    fields.push('minute = ?');
    values.push(updates.minute);
  }
  if (updates.days !== undefined) {
    fields.push('days_json = ?');
    values.push(JSON.stringify(updates.days));
  }
  if (updates.enabled !== undefined) {
    fields.push('enabled = ?');
    values.push(updates.enabled ? 1 : 0);
  }
  if (updates.sound !== undefined) {
    fields.push('sound = ?');
    values.push(updates.sound ? 1 : 0);
  }
  if (updates.linkedType !== undefined) {
    fields.push('linked_type = ?');
    values.push(updates.linkedType);
  }
  if (updates.linkedId !== undefined) {
    fields.push('linked_id = ?');
    values.push(updates.linkedId);
  }

  if (fields.length === 0) {
    logger.warn('[db:reminders]', `updateReminder called with no fields for ${id}`);
    return getReminderById(id);
  }

  // Always update the updated_at timestamp
  fields.push('updated_at = ?');
  values.push(new Date().toISOString());

  values.push(id);

  await db.runAsync(`UPDATE reminders SET ${fields.join(', ')} WHERE id = ?`, ...values);

  logger.debug('[db:reminders]', `Updated reminder ${id}`);

  return getReminderById(id);
}

/**
 * Delete a reminder by ID.
 * Returns true if the reminder was deleted, false if not found.
 */
export async function deleteReminder(id: string): Promise<boolean> {
  const db = await getDatabase();

  const result = await db.runAsync('DELETE FROM reminders WHERE id = ?', id);
  const deleted = result.changes > 0;

  if (deleted) {
    logger.debug('[db:reminders]', `Deleted reminder ${id}`);
  } else {
    logger.warn('[db:reminders]', `Reminder ${id} not found for deletion`);
  }

  return deleted;
}

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Generate a UUID v4 string.
 * Uses crypto.randomUUID() when available, otherwise falls back to Math.random.
 */
function generateUUID(): string {
  try {
    // React Native / modern browsers support crypto.randomUUID()
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { randomUUID } = require('expo-crypto');
    return randomUUID();
  } catch {
    // Fallback for environments without crypto.randomUUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
