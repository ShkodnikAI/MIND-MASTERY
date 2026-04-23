/**
 * Practice texts repository — typed queries for the `practice_texts` table.
 * Stores localised practice content (TTS scripts, instructions, etc.).
 */

import { getDatabase } from '@/db/index';
import {
  PracticeText,
  UpsertPracticeTextInput,
} from '@/db/types';
import { logger } from '@/utils/logger';

/** Upsert a practice text (insert or replace). */
export async function upsertPracticeText(
  input: UpsertPracticeTextInput,
): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();

  await db.runAsync(
    `INSERT INTO practice_texts (practice_id, system_id, locale, data_json, version, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(practice_id) DO UPDATE SET
       system_id = excluded.system_id,
       locale = excluded.locale,
       data_json = excluded.data_json,
       version = excluded.version,
       updated_at = excluded.updated_at`,
    input.practice_id,
    input.system_id,
    input.locale,
    input.data_json,
    input.version,
    now,
  );

  logger.debug(
    '[db:practice-texts]',
    `Upserted text for ${input.practice_id}`,
  );
}

/** Fetch a practice text by practice_id. */
export async function getPracticeText(
  practiceId: string,
): Promise<PracticeText | null> {
  const db = await getDatabase();
  return (
    db.getFirstAsync<PracticeText>(
      'SELECT * FROM practice_texts WHERE practice_id = ?',
      practiceId,
    ) ?? null
  );
}

/** Fetch all practice texts for a given system and locale. */
export async function getPracticeTextsBySystem(
  systemId: string,
  locale: string,
): Promise<PracticeText[]> {
  const db = await getDatabase();
  return db.getAllAsync<PracticeText>(
    'SELECT * FROM practice_texts WHERE system_id = ? AND locale = ?',
    systemId,
    locale,
  );
}

/** Fetch all practice texts for a given locale. */
export async function getPracticeTextsByLocale(
  locale: string,
): Promise<PracticeText[]> {
  const db = await getDatabase();
  return db.getAllAsync<PracticeText>(
    'SELECT * FROM practice_texts WHERE locale = ?',
    locale,
  );
}

/** Delete a practice text by practice_id. */
export async function deletePracticeText(
  practiceId: string,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'DELETE FROM practice_texts WHERE practice_id = ?',
    practiceId,
  );
  logger.debug('[db:practice-texts]', `Deleted text for ${practiceId}`);
}
