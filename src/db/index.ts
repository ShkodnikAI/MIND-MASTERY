/**
 * Singleton database instance with WAL mode.
 * Import `getDatabase()` everywhere; never create connections directly.
 */

import * as SQLite from 'expo-sqlite';
import { logger } from '@/utils/logger';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Open (or return existing) database connection.
 * Configures WAL mode, foreign keys, and autocheckpoint on first open.
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('mindmastery.db');

  // Configure SQLite (FIX-13: WAL autocheckpoint)
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA wal_autocheckpoint = 1000;
  `);

  logger.info('[db]', 'Database opened with WAL mode');
  return db;
}

/**
 * Close the database connection.
 * Call on app teardown to release the file handle.
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
    logger.info('[db]', 'Database closed');
  }
}

/**
 * Run a WAL checkpoint. Call when the app moves to background (FIX-13)
 * to prevent WAL file growth and ensure data durability.
 */
export async function checkpointWal(): Promise<void> {
  if (!db) return;
  try {
    await db.execAsync('PRAGMA wal_checkpoint(TRUNCATE)');
    logger.debug('[db]', 'WAL checkpoint completed');
  } catch (error) {
    logger.warn('[db]', 'WAL checkpoint failed', error);
  }
}
