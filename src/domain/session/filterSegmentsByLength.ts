/**
 * @file Segment filtering by session length — pure functions.
 *
 * Determines which practices are available for a given session-length
 * preset and retrieves the appropriate segment array.
 *
 * Filtering is performed at the Practice level via the `includeIn`
 * field. If a practice is marked for a length, ALL its segments are
 * used — no individual segment trimming occurs in the MVP.
 */

import type { Practice, SessionLength, Segment } from '@/types';

/**
 * Checks whether a practice supports the given session-length preset.
 */
export function isLengthAvailable(practice: Practice, length: SessionLength): boolean {
  return practice.includeIn.includes(length);
}

/**
 * Returns the list of session-length presets that a practice supports.
 */
export function getAvailableLengths(practice: Practice): SessionLength[] {
  return [...practice.includeIn];
}

/**
 * Returns the segments for a practice at a given session-length preset.
 *
 * If the length is not available for this practice, returns an empty
 * array (the caller should check `isLengthAvailable` first or handle
 * the empty result).
 *
 * For MVP: when the length IS available, all segments are returned
 * without trimming. Future versions may remove optional deepening
 * or extension segments for shorter presets.
 */
export function getSegmentsForLength(practice: Practice, length: SessionLength): Segment[] {
  if (!isLengthAvailable(practice, length)) {
    return [];
  }
  return [...practice.segments];
}

/**
 * Returns the first available session-length preset for a practice.
 * Useful for auto-selecting a default when the user hasn't chosen.
 *
 * Preference order: short → medium → full.
 */
export function getDefaultLength(practice: Practice): SessionLength {
  const preference: SessionLength[] = ['short', 'medium', 'full'];
  const found = preference.find((l) => isLengthAvailable(practice, l));
  return found ?? practice.includeIn[0] ?? 'full';
}
