/**
 * Migration runner — reads current version from settings, applies
 * pending migrations in order. Idempotent: safe to call multiple times.
 */

import { getDatabase } from '@/db/index';
import { logger } from '@/utils/logger';

/** Ordered list of migration SQL strings, keyed by version number. */
const MIGRATIONS: Record<number, string> = {
  1: require('./v1.sql'),
};

/** Latest schema version known to this build of the app. */
export const LATEST_VERSION = Math.max(...Object.keys(MIGRATIONS).map(Number));

/**
 * Run all pending migrations.
 * Must be called after `getDatabase()` has been invoked at least once.
 */
export async function runMigrations(): Promise<void> {
  const db = await getDatabase();
  const currentVersion = await getSchemaVersion(db);

  if (currentVersion >= LATEST_VERSION) {
    logger.info('[db:migrate]', `Schema is up-to-date (v${currentVersion})`);
    return;
  }

  logger.info('[db:migrate]', `Migrating from v${currentVersion} → v${LATEST_VERSION}`);

  for (let version = currentVersion + 1; version <= LATEST_VERSION; version++) {
    const sql = MIGRATIONS[version];
    if (!sql) {
      logger.error('[db:migrate]', `Missing migration SQL for v${version}`);
      throw new Error(`Missing migration SQL for version ${version}`);
    }

    try {
      await db.execAsync(sql);
      logger.info('[db:migrate]', `Applied migration v${version}`);
    } catch (error) {
      logger.error('[db:migrate]', `Failed to apply v${version}`, error);
      throw error;
    }
  }

  logger.info('[db:migrate]', 'All migrations applied successfully');
}

/**
 * Read the current schema version from the settings table.
 * Returns 0 if no version is recorded (fresh database).
 */
async function getSchemaVersion(db: import('expo-sqlite').SQLiteDatabase): Promise<number> {
  try {
    // Ensure settings table exists before reading
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        key        TEXT PRIMARY KEY,
        value_json TEXT    NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);

    const result = await db.getFirstAsync<{ value_json: string }>(
      "SELECT value_json FROM settings WHERE key = 'db_version'",
    );

    if (!result) return 0;
    return Number(result.value_json) || 0;
  } catch (error) {
    logger.warn('[db:migrate]', 'Could not read schema version', error);
    return 0;
  }
}
