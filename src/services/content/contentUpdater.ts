/**
 * Content Updater — checks for content version updates after OTA.
 * Stage 6 will implement actual update logic.
 * Stage 2a: placeholder with interface.
 */

import { logger } from '@/utils/logger';

export interface ContentVersion {
  version: number;
  hash: string;
  updatedAt: string;
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: number;
  newVersion: number;
}

/**
 * Checks if content updates are available.
 * For MVP (offline): always returns no update.
 * For OTA (Stage 6): will check bundled vs stored versions.
 */
export async function checkForContentUpdates(): Promise<UpdateCheckResult> {
  logger.info('[contentUpdater]', 'Checking for content updates (MVP: always no-op)');

  return {
    hasUpdate: false,
    currentVersion: 1,
    newVersion: 1,
  };
}

/**
 * Gets the current content version from the database.
 */
export function getCurrentContentVersion(): ContentVersion {
  return {
    version: 1,
    hash: 'initial',
    updatedAt: new Date().toISOString(),
  };
}
