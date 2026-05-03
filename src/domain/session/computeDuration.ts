/**
 * @file Session duration computation — pure functions.
 *
 * Converts segment arrays into total duration values (ms / minutes).
 * Music and binaural segments are layered independently and do not
 * contribute to the sequential timeline duration.
 */

import type { Segment, SessionLength, VoiceSegment } from '@/types';

/**
 * Computes the duration of a single segment in milliseconds.
 *
 * Only voice and silence segments contribute to the sequential timeline:
 * - voice: uses the segment's declared `durationSec`.
 * - silence: uses the segment's declared `durationSec`.
 * - music / binaural: 0 — these layers play concurrently and are not
 *   part of the sequential segment timeline.
 * - theory: 0 — user-controlled reading with no fixed duration.
 */
export function computeSegmentDurationMs(segment: Segment): number {
  switch (segment.kind) {
    case 'voice':
      return segment.durationSec * 1000;
    case 'silence':
      return segment.durationSec * 1000;
    case 'music':
      return 0; // Music layers independently, not counted in segment timeline
    case 'binaural':
      return 0; // Binaural layers independently
    case 'theory':
      return 0; // User-controlled
  }
}

/**
 * Sums the durations of all segments in a practice, returning total
 * milliseconds of sequential (voice + silence) content.
 */
export function computeTotalDurationMs(segments: readonly Segment[]): number {
  return segments.reduce((total, seg) => total + computeSegmentDurationMs(seg), 0);
}

/**
 * Returns the total session duration rounded up to whole minutes,
 * suitable for display in the UI.
 */
export function computeSessionDurationMin(segments: readonly Segment[]): number {
  return Math.ceil(computeTotalDurationMs(segments) / 60000);
}

/**
 * Determines whether a voice segment should be included for a given
 * session-length preset.
 *
 * For MVP, all segments are included in every supported length.
 * Future versions may gate optional deepening or extended segments
 * behind specific length presets.
 */
export function shouldIncludeInSession(_segment: Segment, length: SessionLength): boolean {
  // All segments are included in 'full' sessions
  if (length === 'full') return true;
  // For short/medium, filtering is handled at the Practice level,
  // not the individual segment level — all segments are kept.
  return true;
}

/**
 * Utility: extracts the effective duration in seconds for a voice segment.
 * Returns the declared `durationSec` (always present on VoiceSegment).
 */
export function getVoiceDurationSec(segment: VoiceSegment): number {
  return segment.durationSec;
}
