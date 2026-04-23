/**
 * Text Loader — loads practice text JSON files from content/texts/.
 * FIX-2: filename-based parsing with runtime assertions.
 * INV-3: Only used by contentStore during hydration, never by UI directly.
 */

import type { PracticeTextSchema, ValidationResult } from '@content/schema';
import { validatePracticeText } from '@content/schema';

const PRACTICE_ID_REGEX = /^[a-z][a-z0-9_]*$/;

/**
 * Parses practiceId from a filesystem key or filename.
 *
 * Input:  "./transurfing/trans_lower_importance.ru.json"
 * Output: "trans_lower_importance"
 */
export function parsePracticeId(key: string): string {
  // Get filename from path
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
  // System folder is second-to-last part
  if (parts.length < 2) {
    throw new Error(`[textLoader] Cannot extract systemId from key: ${key}`);
  }
  return parts[parts.length - 2];
}

// Valid system IDs
const VALID_SYSTEMS = new Set(['transurfing', 'silva', 'dispenza', 'feldenkrais', 'breath']);

export interface LoadedText {
  practiceId: string;
  systemId: string;
  locale: string;
  data: PracticeTextSchema;
}

/**
 * Loads all practice texts for a given locale from the bundled content directory.
 * Uses require.context for Metro bundler.
 *
 * For MVP: returns empty array (texts will be loaded in Stage 2b/2c).
 * The actual loading will use require.context:
 *
 *   const ctx = require.context('@content-texts', true, /\.ru\.json$/);
 *   ctx.keys().forEach(key => {
 *     const data = ctx(key) as PracticeTextSchema;
 *     texts.push({
 *       practiceId: parsePracticeId(key),
 *       systemId: parseSystemId(key),
 *       locale: parseLocale(key),
 *       data,
 *     });
 *   });
 */
export function loadAllTexts(_locale: string = 'ru'): LoadedText[] {
  // Will be populated when JSON text files are created in Stage 2b/2c
  const texts: LoadedText[] = [];
  return texts;
}

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
