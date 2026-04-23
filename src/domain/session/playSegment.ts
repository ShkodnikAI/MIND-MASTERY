/**
 * @file Playback instruction generation — pure functions.
 *
 * Converts segment definitions into typed playback actions that the
 * audio engine and UI layer can consume. Every action is a plain object
 * with no side effects.
 */

import type { Segment, SessionPhase, VoiceSegment } from '@/types';
import { assertNever } from '@/utils/assertNever';

// ---------------------------------------------------------------------------
// Playback action types
// ---------------------------------------------------------------------------

/** A TTS or pre-recorded narration instruction. */
export interface SpeakAction {
  readonly type: 'speak';
  readonly textKey: string;
  readonly durationSec: number;
}

/** A background-music playback instruction. */
export interface PlayMusicAction {
  readonly type: 'playMusic';
  readonly trackId: string;
  readonly fadeIn: number;
  readonly fadeOut: number;
  readonly volume: number;
}

/** A binaural-beat playback instruction. */
export interface PlayBinauralAction {
  readonly type: 'playBinaural';
  readonly baseHz: number;
  readonly beatHz: number;
  readonly fadeIn: number;
  readonly fadeOut: number;
  readonly volume: number;
}

/** A timed silence (pause) instruction. */
export interface SilenceAction {
  readonly type: 'silence';
  readonly durationSec: number;
}

/** Display a theory / educational card. */
export interface ShowTheoryAction {
  readonly type: 'showTheory';
}

/** Trigger a haptic feedback pattern. */
export interface HapticAction {
  readonly type: 'haptic';
  readonly pattern: 'light' | 'medium' | 'heavy';
}

/** Signal a session-phase transition to the UI. */
export interface PhaseChangeAction {
  readonly type: 'phaseChange';
  readonly phase: SessionPhase;
}

/**
 * Discriminated union of all possible playback actions.
 */
export type PlaybackAction =
  | SpeakAction
  | PlayMusicAction
  | PlayBinauralAction
  | SilenceAction
  | ShowTheoryAction
  | HapticAction
  | PhaseChangeAction;

/**
 * A playback instruction pairs a segment with the actions it produces.
 */
export interface PlaybackInstruction {
  readonly segment: Segment;
  readonly actions: readonly PlaybackAction[];
}

// ---------------------------------------------------------------------------
// Action generation
// ---------------------------------------------------------------------------

/**
 * Determines what playback actions are needed for a given segment.
 *
 * Every segment produces at least one action based on its `kind`.
 * Voice segments that declare a `phase` additionally produce a
 * `phaseChange` action, and phase transitions to `work` or
 * `reorientation` emit a medium haptic.
 */
export function getPlaybackActions(segment: Segment): PlaybackAction[] {
  const actions: PlaybackAction[] = [];

  switch (segment.kind) {
    case 'voice': {
      actions.push({
        type: 'speak',
        textKey: segment.textKey,
        durationSec: segment.durationSec,
      });
      break;
    }

    case 'silence': {
      actions.push({
        type: 'silence',
        durationSec: segment.durationSec,
      });
      break;
    }

    case 'music': {
      actions.push({
        type: 'playMusic',
        trackId: segment.trackId,
        fadeIn: segment.fadeInSec,
        fadeOut: segment.fadeOutSec,
        volume: segment.volume,
      });
      break;
    }

    case 'binaural': {
      actions.push({
        type: 'playBinaural',
        baseHz: segment.baseHz,
        beatHz: segment.beatHz,
        fadeIn: segment.fadeInSec,
        fadeOut: segment.fadeOutSec,
        volume: segment.volume,
      });
      break;
    }

    case 'theory': {
      actions.push({ type: 'showTheory' });
      break;
    }

    default: {
      assertNever(segment);
    }
  }

  // Phase change notification — only VoiceSegment carries a `phase`.
  if ('phase' in segment) {
    const voiceSegment = segment as VoiceSegment;
    if (voiceSegment.phase) {
      actions.push({ type: 'phaseChange', phase: voiceSegment.phase });

      // Haptic feedback on key transitions
      if (voiceSegment.phase === 'work' || voiceSegment.phase === 'reorientation') {
        actions.push({ type: 'haptic', pattern: 'medium' });
      }
    }
  }

  return actions;
}

/**
 * Wraps a segment into a full playback instruction.
 */
export function buildPlaybackInstruction(segment: Segment): PlaybackInstruction {
  return {
    segment,
    actions: getPlaybackActions(segment),
  };
}

/**
 * Maps a session phase to visual-behavior parameters consumed by
 * the UI overlay (brightness, glow, animation style).
 */
export function getVisualBehaviorForPhase(phase: SessionPhase): {
  screenBrightness: number;
  glowIntensity: number;
  animation: string;
} {
  switch (phase) {
    case 'preparation':
      return { screenBrightness: 1.0, glowIntensity: 0.2, animation: 'none' };
    case 'induction':
      return { screenBrightness: 0.7, glowIntensity: 0.4, animation: 'fade' };
    case 'deepening':
      return { screenBrightness: 0.4, glowIntensity: 0.6, animation: 'pulse' };
    case 'work':
      return { screenBrightness: 0.2, glowIntensity: 0.8, animation: 'breathe' };
    case 'integration':
      return { screenBrightness: 0.4, glowIntensity: 0.5, animation: 'glow' };
    case 'reorientation':
      return { screenBrightness: 0.8, glowIntensity: 0.3, animation: 'fade' };
  }
}
