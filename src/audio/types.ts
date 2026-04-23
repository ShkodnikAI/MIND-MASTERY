/**
 * @file Audio engine internal types.
 *
 * Defines the engine state machine, session configuration, segment queue
 * structures, and event types. The AudioEngine operates on these
 * abstractions — it does NOT import expo-audio or expo-speech.
 *
 * INV-2: The engine is the single audio-session owner. All playback
 * intents flow through engine events.
 */

import type {
  Segment,
  SessionPhase,
  AudioSettings,
  VoiceSettings,
  SessionLength,
} from '@/types';

// ---------------------------------------------------------------------------
// Engine state machine
// ---------------------------------------------------------------------------

/**
 * States of the audio engine state machine.
 *
 * Transitions:
 *   idle --startSession()--> preparing --> playing <=> paused --> finished
 *     ^                                                      |
 *     +------------------------------------------------------+
 */
export type EngineState =
  | 'idle'
  | 'preparing'
  | 'playing'
  | 'paused'
  | 'finished';

// ---------------------------------------------------------------------------
// Session configuration (input)
// ---------------------------------------------------------------------------

/**
 * Configuration passed to AudioEngine.startSession().
 * Contains everything the engine needs to plan and drive a session,
 * including audio/voice settings from settingsStore.
 */
export interface SessionConfig {
  readonly practiceId: string;
  readonly systemId: string;
  readonly sessionId: string;
  readonly segments: readonly Segment[];
  readonly audioSettings: AudioSettings;
  readonly voiceSettings: VoiceSettings;
  readonly length: SessionLength;
  /** Resolve a textKey to narration text. Returns null if not found. */
  readonly resolveText: (textKey: string) => string | null;
}

// ---------------------------------------------------------------------------
// Segment queue / timeline
// ---------------------------------------------------------------------------

/**
 * A single entry in the sequential playback timeline.
 * Only voice, silence, and theory segments appear here.
 * Music and binaural segments are extracted as background layers.
 */
export interface TimelineEntry {
  /** Index into the original segment array. */
  readonly segmentIndex: number;
  /** Duration of this entry in milliseconds. */
  readonly durationMs: number;
  /** Absolute start time from session start (ms). */
  readonly startMs: number;
  /** Absolute end time from session start (ms). */
  readonly endMs: number;
  /** Phase associated with this entry (from VoiceSegment.phase, if any). */
  readonly phase: SessionPhase | null;
}

/**
 * Background layer configuration extracted from practice segments.
 * Music and binaural segments play concurrently with the sequential timeline.
 */
export interface BackgroundLayer {
  readonly kind: 'music' | 'binaural';
  readonly trackId: string;
  /** Fade-in duration in milliseconds. */
  readonly fadeInMs: number;
  /** Fade-out duration in milliseconds. */
  readonly fadeOutMs: number;
  /** Relative volume for this layer [0, 1]. */
  readonly volume: number;
  /** Whether the layer should loop. */
  readonly loop: boolean;
}

/**
 * Complete session playback plan built from practice segments.
 */
export interface SessionPlan {
  /** Sequential timeline entries (voice, silence, theory). */
  readonly timeline: readonly TimelineEntry[];
  /** Background layers that play concurrently (music, binaural). */
  readonly layers: readonly BackgroundLayer[];
  /** Total sequential duration in milliseconds. */
  readonly totalDurationMs: number;
}

// ---------------------------------------------------------------------------
// Engine events (output)
// ---------------------------------------------------------------------------

/**
 * Events emitted by the AudioEngine.
 * Subscribers (typically the useAudioEngine hook) handle these events to
 * execute audio playback, update stores, and trigger haptics.
 *
 * Events are split into two categories:
 * - **State events**: informational updates for the UI / stores.
 * - **Command events**: instructions for the hook layer to execute I/O.
 */
export type EngineEvent =
  // -- State events (informational) --
  | { readonly type: 'stateChange'; readonly state: EngineState }
  | { readonly type: 'segmentStart'; readonly segmentIndex: number }
  | { readonly type: 'segmentEnd'; readonly segmentIndex: number }
  | { readonly type: 'progress'; readonly elapsedMs: number; readonly segmentIndex: number }
  | { readonly type: 'phaseChange'; readonly phase: SessionPhase }
  | { readonly type: 'sessionComplete' }

  // -- Command events (I/O instructions for hook layer) --
  | { readonly type: 'playVoice'; readonly textKey: string; readonly durationSec: number }
  | { readonly type: 'stopVoice' }
  | {
      readonly type: 'startMusic';
      readonly trackId: string;
      readonly fadeInMs: number;
      readonly volume: number;
      readonly loop: boolean;
    }
  | { readonly type: 'stopMusic'; readonly fadeOutMs: number }
  | {
      readonly type: 'startBinaural';
      readonly trackId: string;
      readonly fadeInMs: number;
      readonly volume: number;
    }
  | { readonly type: 'stopBinaural'; readonly fadeOutMs: number }
  | { readonly type: 'setLayerVolume'; readonly layer: 'music' | 'binaural'; readonly volume: number }
  | { readonly type: 'triggerHaptic'; readonly pattern: 'light' | 'medium' | 'heavy' }
  | { readonly type: 'showTheory' }

  // -- Error events --
  | { readonly type: 'error'; readonly message: string; readonly segmentIndex?: number; readonly fatal: boolean };
