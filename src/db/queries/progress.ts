/**
 * Progress repository — typed queries for the `progress` table.
 */

import { getDatabase } from '@/db/index';
import {
  PracticeProgress,
  UpdateProgressInput,
} from '@/db/types';
import { logger } from '@/utils/logger';

/** Fetch progress for a single practice. */
export async function getProgress(
  practiceId: string,
): Promise<PracticeProgress | null> {
  const db = await getDatabase();
  return (
    db.getFirstAsync<PracticeProgress>(
      'SELECT * FROM progress WHERE practice_id = ?',
      practiceId,
    ) ?? null
  );
}

/** Fetch all practice progress rows. */
export async function getAllProgress(): Promise<PracticeProgress[]> {
  const db = await getDatabase();
  return db.getAllAsync<PracticeProgress>('SELECT * FROM progress');
}

/** Update specific fields on a practice's progress record. */
export async function updateProgress(
  practiceId: string,
  updates: UpdateProgressInput,
): Promise<void> {
  const db = await getDatabase();

  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.completed_count !== undefined) {
    fields.push('completed_count = ?');
    values.push(updates.completed_count);
  }
  if (updates.total_duration_min !== undefined) {
    fields.push('total_duration_min = ?');
    values.push(updates.total_duration_min);
  }
  if (updates.current_level !== undefined) {
    fields.push('current_level = ?');
    values.push(updates.current_level);
  }
  if (updates.last_completed_at !== undefined) {
    fields.push('last_completed_at = ?');
    values.push(updates.last_completed_at);
  }
  if (updates.is_unlocked !== undefined) {
    fields.push('is_unlocked = ?');
    values.push(updates.is_unlocked);
  }

  if (fields.length === 0) {
    logger.warn(
      '[db:progress]',
      `updateProgress called with no fields for ${practiceId}`,
    );
    return;
  }

  values.push(practiceId);

  await db.runAsync(
    `UPDATE progress SET ${fields.join(', ')} WHERE practice_id = ?`,
    ...values,
  );

  logger.debug('[db:progress]', `Updated progress for ${practiceId}`);
}

/**
 * Atomically increment completed count and accumulate duration.
 * Uses UPSERT so a missing row is created with defaults.
 */
export async function incrementCompleted(
  practiceId: string,
  durationMin: number,
): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();

  await db.runAsync(
    `INSERT INTO progress (practice_id, system_id, completed_count, total_duration_min, current_level, last_completed_at, is_unlocked)
     VALUES (?, '', 1, ?, 1, ?, 1)
     ON CONFLICT(practice_id) DO UPDATE SET
       completed_count = completed_count + 1,
       total_duration_min = total_duration_min + ?,
       last_completed_at = ?,
       is_unlocked = 1`,
    practiceId,
    durationMin,
    now,
    durationMin,
    now,
  );

  logger.debug(
    '[db:progress]',
    `Incremented ${practiceId} by ${durationMin}min`,
  );
}

/** Fetch all progress rows for a given system_id. */
export async function getSystemProgress(
  systemId: string,
): Promise<PracticeProgress[]> {
  const db = await getDatabase();
  return db.getAllAsync<PracticeProgress>(
    'SELECT * FROM progress WHERE system_id = ?',
    systemId,
  );
}
