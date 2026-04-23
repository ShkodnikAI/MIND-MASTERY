/**
 * @file SegmentQueue -- builds the playback timeline from practice segments.
 *
 * Splits the practice's segment array into two categories:
 *
 * 1. **Sequential timeline** -- voice, silence, theory segments that play
 *    one after another. Each entry has an absolute start/end time.
 *
 * 2. **Background layers** -- music and binaural segments that play
 *    concurrently with the timeline. These are started once at session
 *    begin and stopped at session end.
 *
 * Duration math:
 * - voice: `segment.durationSec * 1000`
 * - silence: `segment.durationSec * 1000`
 * - music / binaural: `0` (they layer independently)
 * - theory: `0` (user-controlled, no fixed duration)
 *
 * This module is pure -- no side effects, no I/O.
 */

import type { Segment, SessionPhase } from '@/types';
import { computeSegmentDurationMs } from '@/domain/session/computeDuration';
import type { TimelineEntry, BackgroundLayer, SessionPlan } from './types';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build a complete `SessionPlan` from a practice's segment array.
 *
 * Sequential segments (voice, silence, theory) are placed on a timeline
 * with absolute timestamps. Music and binaural segments are extracted
 * into a separate `layers` array.
 *
 * @param segments - Ordered array of practice segments.
 * @returns A `SessionPlan` ready for the AudioEngine to consume.
 */
export function buildSessionPlan(
  segments: readonly Segment[],
): SessionPlan {
  const timeline: TimelineEntry[] = [];
  const layers: BackgroundLayer[] = [];
  let runningTimeMs = 0;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const durationMs = computeSegmentDurationMs(segment);

    // Extract phase from VoiceSegment (only voice segments carry a phase)
    const phase = extractPhase(segment);

    // Background layers: music and binaural (don't add to timeline)
    if (segment.kind === 'music') {
      layers.push({
        kind: 'music',
        trackId: segment.trackId,
        fadeInMs: segment.fadeInSec * 1000,
        fadeOutMs: segment.fadeOutSec * 1000,
        volume: segment.volume,
        loop: segment.loop,
      });
      continue;
    }

    if (segment.kind === 'binaural') {
      layers.push({
        kind: 'binaural',
        trackId: binauralTrackId(segment.baseHz, segment.beatHz),
        fadeInMs: segment.fadeInSec * 1000,
        fadeOutMs: segment.fadeOutSec * 1000,
        volume: segment.volume,
        loop: true, // binaural always loops
      });
      continue;
    }

    // Sequential timeline entries: voice, silence, theory
    if (durationMs > 0 || segment.kind === 'theory') {
      const entry: TimelineEntry = {
        segmentIndex: i,
        durationMs,
        startMs: runningTimeMs,
        endMs: runningTimeMs + durationMs,
        phase,
      };
      timeline.push(entry);
      runningTimeMs += durationMs;
    }
  }

  return {
    timeline,
    layers,
    totalDurationMs: runningTimeMs,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract the `SessionPhase` from a segment, if present.
 * Only `VoiceSegment` carries a `phase` field.
 */
function extractPhase(segment: Segment): SessionPhase | null {
  if (segment.kind === 'voice') {
    return segment.phase ?? null;
  }
  return null;
}

/**
 * Build a conventional track identifier for a binaural beat.
 *
 * Convention: `{baseHz}hz-{beatHz}hz.wav`
 *
 * Pre-rendered binaural WAV files should follow this naming pattern
 * in the `assets/audio/binaural/` directory.
 */
function binauralTrackId(baseHz: number, beatHz: number): string {
  return `${baseHz}hz-${beatHz}hz.wav`;
}
