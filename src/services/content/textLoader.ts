/**
 * @file Text Loader — loads practice text JSON files from bundled manifest.
 *
 * Uses the auto-generated _manifest.ts which contains explicit require() calls
 * for all content/texts/*.ru.json files. This is Metro-compatible (unlike
 * require.context which is webpack-only).
 *
 * INV-3: Only used by contentStore during hydration, never by UI directly.
 */

import type { PracticeTextSchema, ValidationResult } from '@content/schema';
import { validatePracticeText } from '@content/schema';
import { logger } from '@/utils/logger';
import textManifest from '@content-texts/_manifest';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface LoadedText {
  practiceId: string;
  systemId: string;
  locale: string;
  data: PracticeTextSchema;
}

// ---------------------------------------------------------------------------
// Text loading from manifest
// ---------------------------------------------------------------------------

/**
 * Loads all practice texts for a given locale from the bundled manifest.
 *
 * The manifest is generated at build time and contains explicit require() calls
 * for every .ru.json file under content/texts/. This avoids the need for
 * require.context (webpack-only API) and works correctly with Metro bundler.
 *
 * @param locale - Target locale (default: 'ru'). Filters manifest entries.
 * @returns Array of LoadedText objects ready for contentStore hydration.
 */
export function loadAllTexts(locale: string = 'ru'): LoadedText[] {
  const texts: LoadedText[] = [];
  let errorCount = 0;

  for (const entry of textManifest) {
    // Filter by locale
    if (entry.locale !== locale) {
      continue;
    }

    try {
      // Cross-validate practiceId matches JSON content
      if (entry.data.practiceId && entry.data.practiceId !== entry.practiceId) {
        logger.warn(
          '[textLoader]',
          `practiceId mismatch: filename="${entry.practiceId}" vs content="${entry.data.practiceId}"`,
        );
      }

      texts.push({
        practiceId: entry.practiceId,
        systemId: entry.systemId,
        locale: entry.locale,
        data: entry.data,
      });
    } catch (error) {
      logger.error('[textLoader]', `Failed to load ${entry.systemId}/${entry.practiceId}`, error);
      errorCount++;
    }
  }

  if (errorCount > 0) {
    logger.warn('[textLoader]', `Loaded ${texts.length} texts with ${errorCount} errors`);
  } else {
    logger.info('[textLoader]', `Loaded ${texts.length} texts for locale "${locale}"`);
  }

  return texts;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validates a loaded text against the schema.
 */
export function validateLoadedText(text: LoadedText): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (text.locale !== 'ru') {
    warnings.push(`Locale '${text.locale}' is not the primary locale (ru)`);
  }
  if (!text.data.title) {
    errors.push(`Missing title for practice ${text.practiceId}`);
  }

  // Run full schema validation
  const schemaResult = validatePracticeText(text.data, text.practiceId);
  errors.push(...schemaResult.errors);
  warnings.push(...schemaResult.warnings);

  return { valid: errors.length === 0, errors, warnings };
}
