/**
 * Text Loader — loads practice text JSON files from content/texts/.
 * FIX-2: filename-based parsing with runtime assertions.
 * INV-3: Only used by contentStore during hydration, never by UI directly.
 *
 * Uses Metro's require.context to bundle all JSON text files at build time.
 * The loader scans content/texts/<system>/<practice>.ru.json for the
 * configured locale and returns typed LoadedText objects.
 */

import type { PracticeTextSchema, ValidationResult } from '@content/schema';
import { validatePracticeText } from '@content/schema';
import { logger } from '@/utils/logger';

const PRACTICE_ID_REGEX = /^[a-z][a-z0-9_]*$/;

// Valid system IDs
const VALID_SYSTEMS = new Set(['transurfing', 'silva', 'dispenza', 'feldenkrais', 'breath']);

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
// Parsing helpers
// ---------------------------------------------------------------------------

/**
 * Parses practiceId from a require.context key or filename.
 *
 * Input:  "./transurfing/trans_lower_importance.ru.json"
 * Output: "trans_lower_importance"
 */
export function parsePracticeId(key: string): string {
  const parts = key.replace(/\\/g, '/').split('/');
  const filename = parts[parts.length - 1];

  if (!filename) {
    throw new Error(`[textLoader] Invalid key (no filename): ${key}`);
  }

  // Remove .ru.json or .en.json suffix
  const practiceId = filename.replace(/\.[a-z]{2}\.json$/, '');

  if (!PRACTICE_ID_REGEX.test(practiceId)) {
    throw new Error(
      `[textLoader] Invalid practiceId "${practiceId}" from key "${key}". ` +
        `Expected: lowercase, alphanumeric + underscore, starting with letter.`,
    );
  }

  return practiceId;
}

/**
 * Extracts locale from filename.
 * Input: "trans_lower_importance.ru.json"
 * Output: "ru"
 */
export function parseLocale(key: string): string {
  const parts = key.replace(/\\/g, '/').split('/');
  const filename = parts[parts.length - 1];

  const match = filename?.match(/\.([a-z]{2})\.json$/);
  if (!match) {
    throw new Error(`[textLoader] Cannot extract locale from key: ${key}`);
  }

  return match[1];
}

/**
 * Extracts systemId from path.
 * Input: "./transurfing/trans_lower_importance.ru.json"
 * Output: "transurfing"
 */
export function parseSystemId(key: string): string {
  const parts = key.replace(/\\/g, '/').split('/');
  if (parts.length < 2) {
    throw new Error(`[textLoader] Cannot extract systemId from key: ${key}`);
  }
  return parts[parts.length - 2];
}

// ---------------------------------------------------------------------------
// Text loading (Metro require.context)
// ---------------------------------------------------------------------------

/**
 * Metro require.context for content/texts/.
 * Bundles all .ru.json files at build time.
 *
 * Note: require.context is a Metro/Webpack-specific API that creates a
 * bundler context for recursive directory scanning. The path is resolved
 * via the tsconfig alias @content-texts → ./content/texts.
 *
 * We use a type assertion because TypeScript doesn't know about this API.
 */
declare function requireContext(
  directory: string,
  useSubdirectories: boolean,
  regExp: RegExp,
): {
  keys(): string[];
  (id: string): unknown;
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const textContext = requireContext('@content-texts', true, /\.ru\.json$/);

/**
 * Loads all practice texts for a given locale from the bundled content directory.
 *
 * Scans all .ru.json files under content/texts/ using Metro's require.context,
 * parses each file's path to extract practiceId/systemId/locale, validates
 * the structure, and returns an array of LoadedText objects.
 *
 * @param locale - Target locale (default: 'ru'). Only files matching this
 *                 locale suffix will be loaded.
 * @returns Array of LoadedText objects ready for contentStore hydration.
 */
export function loadAllTexts(locale: string = 'ru'): LoadedText[] {
  const texts: LoadedText[] = [];
  const localeSuffix = `.${locale}.json`;
  let errorCount = 0;

  for (const key of textContext.keys()) {
    // Filter by locale
    if (!key.endsWith(localeSuffix)) {
      continue;
    }

    try {
      const data = textContext(key) as PracticeTextSchema;
      const practiceId = parsePracticeId(key);
      const systemId = parseSystemId(key);

      // Validate system
      if (!VALID_SYSTEMS.has(systemId)) {
        logger.warn(
          '[textLoader]',
          `Skipping unknown system "${systemId}" in ${key}`,
        );
        errorCount++;
        continue;
      }

      // Cross-validate practiceId matches JSON content
      if (data.practiceId && data.practiceId !== practiceId) {
        logger.warn(
          '[textLoader]',
          `practiceId mismatch: filename="${practiceId}" vs content="${data.practiceId}" in ${key}`,
        );
      }

      texts.push({
        practiceId,
        systemId,
        locale,
        data,
      });
    } catch (error) {
      logger.error('[textLoader]', `Failed to load ${key}`, error);
      errorCount++;
    }
  }

  if (errorCount > 0) {
    logger.warn(
      '[textLoader]',
      `Loaded ${texts.length} texts with ${errorCount} errors`,
    );
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

  if (!VALID_SYSTEMS.has(text.systemId)) {
    errors.push(`Unknown system: ${text.systemId}`);
  }
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
