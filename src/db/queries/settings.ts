/**
 * Settings repository — typed key-value store using the `settings` table.
 * Values are stored as JSON strings for flexibility.
 */

import { getDatabase } from '@/db/index';
import { logger } from '@/utils/logger';

/** Get a setting value, parsed from JSON. Returns defaultValue if not found. */
export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value_json: string }>(
    'SELECT value_json FROM settings WHERE key = ?',
    key,
  );

  if (!row) return defaultValue;

  try {
    return JSON.parse(row.value_json) as T;
  } catch (error) {
    logger.warn('[db:settings]', `Failed to parse JSON for key "${key}"`, error);
    return defaultValue;
  }
}

/** Set a setting value, serialised to JSON. */
export async function setSetting<T>(key: string, value: T): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  const json = JSON.stringify(value);

  await db.runAsync(
    `INSERT INTO settings (key, value_json, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET
       value_json = excluded.value_json,
       updated_at = excluded.updated_at`,
    key,
    json,
    now,
  );

  logger.debug('[db:settings]', `Set "${key}"`);
}

/** Delete a setting by key. */
export async function deleteSetting(key: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM settings WHERE key = ?', key);
  logger.debug('[db:settings]', `Deleted "${key}"`);
}

/** Get all settings as a plain object. */
export async function getAllSettings(): Promise<Record<string, unknown>> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ key: string; value_json: string }>(
    'SELECT key, value_json FROM settings',
  );

  const result: Record<string, unknown> = {};
  for (const row of rows) {
    try {
      result[row.key] = JSON.parse(row.value_json);
    } catch {
      result[row.key] = row.value_json;
    }
  }
  return result;
}
