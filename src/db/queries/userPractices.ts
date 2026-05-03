/**
 * User practices repository — typed queries for the `user_practices` table.
 */

import { getDatabase } from '@/db/index';
import { UserPractice, CreateUserPracticeInput } from '@/db/types';
import { logger } from '@/utils/logger';

/** Insert a new user-created practice and return its id. */
export async function createUserPractice(input: CreateUserPracticeInput): Promise<string> {
  const db = await getDatabase();
  const now = Date.now();

  await db.runAsync(
    `INSERT INTO user_practices (id, title, description, segments_json, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    input.id,
    input.title,
    input.description ?? null,
    input.segments_json,
    now,
  );

  logger.debug('[db:user-practices]', `Created practice ${input.id}`);
  return input.id;
}

/** Fetch all user-created practices, ordered by creation date descending. */
export async function getAllUserPractices(): Promise<UserPractice[]> {
  const db = await getDatabase();
  return db.getAllAsync<UserPractice>('SELECT * FROM user_practices ORDER BY created_at DESC');
}

/** Fetch a single user practice by id. */
export async function getUserPractice(id: string): Promise<UserPractice | null> {
  const db = await getDatabase();
  return db.getFirstAsync<UserPractice>('SELECT * FROM user_practices WHERE id = ?', id) ?? null;
}

/** Update a user practice's mutable fields. */
export async function updateUserPractice(
  id: string,
  updates: { title?: string; description?: string | null; segments_json?: string },
): Promise<void> {
  const db = await getDatabase();

  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.segments_json !== undefined) {
    fields.push('segments_json = ?');
    values.push(updates.segments_json);
  }

  if (fields.length === 0) {
    logger.warn('[db:user-practices]', `updateUserPractice called with no fields for ${id}`);
    return;
  }

  values.push(id);

  await db.runAsync(`UPDATE user_practices SET ${fields.join(', ')} WHERE id = ?`, ...values);

  logger.debug('[db:user-practices]', `Updated practice ${id}`);
}

/** Delete a user practice by id. */
export async function deleteUserPractice(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM user_practices WHERE id = ?', id);
  logger.debug('[db:user-practices]', `Deleted practice ${id}`);
}
