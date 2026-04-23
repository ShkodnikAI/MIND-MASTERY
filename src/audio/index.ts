/**
 * @file Audio module barrel exports.
 *
 * Public API for the audio engine subsystem.
 * Components import from `@/audio` -- never from individual files.
 */

// Types
export type {
  EngineState,
  SessionConfig,
  SessionPlan,
  TimelineEntry,
  BackgroundLayer,
  EngineEvent,
} from './types';

// Core
export { AudioEngine } from './AudioEngine';

// Utilities
export { startFade, interpolate, effectiveVolume } from './FadeController';
export type { FadeCurve, FadeOptions, FadeHandle } from './FadeController';

export { buildSessionPlan } from './SegmentQueue';
