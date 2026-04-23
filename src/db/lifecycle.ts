/**
 * Database lifecycle management.
 * Call `initializeDatabase()` at app startup and
 * `registerAppStateListener()` to handle background transitions.
 */

import { AppState, type AppStateStatus } from 'react-native';
import { getDatabase, checkpointWal } from '@/db/index';
import { runMigrations } from '@/db/migrations/migrator';
import { logger } from '@/utils/logger';

/**
 * Open the database, configure PRAGMAs, and run any pending migrations.
 * Must be called before any repository operation.
 */
export async function initializeDatabase(): Promise<void> {
  try {
    await getDatabase();
    await runMigrations();
    logger.info('[db:lifecycle]', 'Database initialized successfully');
  } catch (error) {
    logger.error('[db:lifecycle]', 'Failed to initialize database', error);
    throw error;
  }
}

/**
 * Subscribe to app state changes.
 * When the app moves to background, triggers a WAL checkpoint (FIX-13)
 * to prevent excessive WAL file growth and ensure data durability.
 *
 * Returns an unsubscribe function.
 */
export function registerAppStateListener(): () => void {
  let currentStatus: AppStateStatus = AppState.currentState;

  const subscription = AppState.addEventListener('change', (nextStatus: AppStateStatus) => {
    if (currentStatus === 'active' && nextStatus !== 'active') {
      // App moving to background
      checkpointWal().catch((error: unknown) => {
        logger.warn('[db:lifecycle]', 'WAL checkpoint on background failed', error);
      });
    }
    currentStatus = nextStatus;
  });

  return subscription.remove;
}
