/**
 * @file Audio State Store -- runtime audio state for UI reads (INV-3).
 *
 * UI components MUST NOT access the AudioEngine directly.  Instead they
 * read reactive state from this Zustand store, which is kept in sync by
 * the `useAudioEngine` hook in response to engine events.
 *
 * INV-3: All UI render-path data lives in memory (Zustand).  No direct
 * engine access, no SQL reads, no event-emitter subscriptions in render.
 */

import { create } from 'zustand';
import type { AudioLayerState, SessionPhase } from '@/types';
import type { EngineState } from '@/audio/types';

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export interface AudioEngineUIState {
  // Engine lifecycle
  readonly engineState: EngineState;
  readonly phase: SessionPhase;

  // Progress
  readonly currentSegmentIndex: number;
  readonly elapsedMs: number;
  readonly totalDurationMs: number;

  // Per-layer runtime state (read by volume sliders, indicators, etc.)
  readonly music: AudioLayerState;
  readonly binaural: AudioLayerState;
  readonly voice: AudioLayerState;

  // Errors
  readonly error: string | null;
}

interface AudioStateActions {
  // -- Engine state --
  setEngineState: (state: EngineState) => void;
  setPhase: (phase: SessionPhase) => void;

  // -- Progress --
  setProgress: (segmentIndex: number, elapsedMs: number) => void;
  setTotalDuration: (ms: number) => void;

  // -- Layer state --
  setLayerState: (
    layer: 'music' | 'binaural' | 'voice',
    update: Partial<AudioLayerState>,
  ) => void;
  setLayerVolume: (
    layer: 'music' | 'binaural' | 'voice',
    volume: number,
  ) => void;

  // -- Errors --
  setError: (error: string | null) => void;

  // -- Reset --
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_LAYER: AudioLayerState = {
  status: 'idle',
  volume: 0,
  currentTrackId: undefined,
};

const INITIAL_STATE: AudioEngineUIState = {
  engineState: 'idle' as EngineState,
  phase: 'preparation' as SessionPhase,
  currentSegmentIndex: 0,
  elapsedMs: 0,
  totalDurationMs: 0,
  music: { ...DEFAULT_LAYER },
  binaural: { ...DEFAULT_LAYER },
  voice: { ...DEFAULT_LAYER },
  error: null,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAudioStateStore = create<
  AudioEngineUIState & AudioStateActions
>()((set) => ({
  ...INITIAL_STATE,

  // -- Engine state ------------------------------------------------------

  setEngineState: (engineState) => set({ engineState }),

  setPhase: (phase) => set({ phase }),

  // -- Progress ----------------------------------------------------------

  setProgress: (currentSegmentIndex, elapsedMs) =>
    set({ currentSegmentIndex, elapsedMs }),

  setTotalDuration: (totalDurationMs) => set({ totalDurationMs }),

  // -- Layer state -------------------------------------------------------

  setLayerState: (layer, update) =>
    set((state) => ({
      [layer]: { ...state[layer], ...update },
    })),

  setLayerVolume: (layer, volume) =>
    set((state) => ({
      [layer]: { ...state[layer], volume },
    })),

  // -- Errors ------------------------------------------------------------

  setError: (error) => set({ error }),

  // -- Reset -------------------------------------------------------------

  reset: () => set(INITIAL_STATE),
}));
