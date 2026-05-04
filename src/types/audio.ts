/**
 * @file Audio engine type definitions.
 *
 * Models voice/TTS configuration, audio layering (music + binaural + voice),
 * playback policies, and runtime state for each audio layer.
 */

// ---------------------------------------------------------------------------
// Voice configuration
// ---------------------------------------------------------------------------

/**
 * Available voice delivery modes.
 * - `system` — use the device's built-in TTS engine.
 * - `minimax` — use the Minimax cloud TTS API for high-quality voice.
 * - `piper` — use the Piper local TTS engine for offline, high-quality voice.
 * - `prerecorded` — play bundled audio files recorded by a professional narrator.
 */
export type VoiceMode = 'system' | 'minimax' | 'piper' | 'prerecorded';

/**
 * Configures how narrated text is delivered during a session.
 * Speed and pitch are clamped to [0.5, 2.0] for safety and intelligibility.
 */
export interface VoiceSettings {
  /** Which voice engine to use. */
  readonly mode: VoiceMode;
  /** Primary language code (the app is Russian-first). */
  readonly language: 'ru';
  /** Speech rate multiplier. Range [0.5, 2.0], default 1.0. */
  readonly speed: number;
  /** Pitch multiplier. Range [0.5, 2.0], default 1.0. */
  readonly pitch: number;
}

// ---------------------------------------------------------------------------
// Audio settings & error handling
// ---------------------------------------------------------------------------

/**
 * Policy for handling audio-layer errors (e.g. file not found, decoder failure).
 */
export type AudioErrorPolicy = 'skip' | 'retry' | 'stop';

/**
 * Master audio configuration persisted in user settings.
 * Each volume is in the range [0, 1].
 */
export interface AudioSettings {
  /** Background-music volume. Range [0, 1]. */
  readonly musicVolume: number;
  /** Binaural-beat volume. Range [0, 1]. */
  readonly binauralVolume: number;
  /** Voice narration volume. Range [0, 1]. */
  readonly voiceVolume: number;
  /** Master volume applied on top of per-layer volumes. Range [0, 1]. */
  readonly masterVolume: number;
  /** How the engine responds when an audio asset fails to load/play. */
  readonly errorPolicy: AudioErrorPolicy;
  /** Whether audio continues playing when the app is backgrounded. */
  readonly backgroundPlayback: boolean;
  /** Identifier of the selected background music track (e.g. 'space', 'ocean'). */
  readonly selectedMusicTrack: string;
}

// ---------------------------------------------------------------------------
// Runtime audio state
// ---------------------------------------------------------------------------

/** Runtime state of the voice narration layer. */
export type VoiceState = 'idle' | 'speaking' | 'paused';

/**
 * Runtime state of a single audio layer (music, binaural, etc.).
 * The UI reads this to render play/pause buttons and volume sliders.
 */
export interface AudioLayerState {
  /** Current playback status of this layer. */
  readonly status: 'idle' | 'playing' | 'paused' | 'error';
  /** Effective volume for this layer (master × per-layer). Range [0, 1]. */
  readonly volume: number;
  /** Identifier of the currently loaded track, if any. */
  readonly currentTrackId?: string;
}
