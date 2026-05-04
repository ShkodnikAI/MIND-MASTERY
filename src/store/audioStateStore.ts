/**
 * @file Audio State Store -- runtime audio state for UI reads (INV-3).
 */
import { create } from 'zustand';
import type { AudioLayerState, SessionPhase } from '@/types';
import type { EngineState } from '@/audio/types';

export interface AudioEngineUIState {
  readonly engineState: EngineState;
  readonly phase: SessionPhase;
  readonly currentSegmentIndex: number;
  readonly elapsedMs: number;
  readonly totalDurationMs: number;
  readonly music: AudioLayerState;
  readonly binaural: AudioLayerState;
  readonly voice: AudioLayerState;
  readonly error: string | null;
  readonly currentNarrationText: string;
  readonly mutedLayers: {
    readonly music: boolean;
    readonly binaural: boolean;
    readonly voice: boolean;
  };
}

interface AudioStateActions {
  setEngineState: (state: EngineState) => void;
  setPhase: (phase: SessionPhase) => void;
  setProgress: (segmentIndex: number, elapsedMs: number) => void;
  setTotalDuration: (ms: number) => void;
  setLayerState: (layer: 'music' | 'binaural' | 'voice', update: Partial<AudioLayerState>) => void;
  setLayerVolume: (layer: 'music' | 'binaural' | 'voice', volume: number) => void;
  setError: (error: string | null) => void;
  setNarrationText: (text: string) => void;
  toggleMute: (layer: 'music' | 'binaural' | 'voice') => void;
  reset: () => void;
}

const DEFAULT_LAYER: AudioLayerState = { status: 'idle', volume: 0, currentTrackId: undefined };

const INITIAL_STATE: AudioEngineUIState = {
  engineState: 'idle' as EngineState,
  phase: 'preparation' as SessionPhase,
  currentSegmentIndex: 0, elapsedMs: 0, totalDurationMs: 0,
  music: { ...DEFAULT_LAYER }, binaural: { ...DEFAULT_LAYER }, voice: { ...DEFAULT_LAYER },
  error: null,
  currentNarrationText: '',
  mutedLayers: { music: false, binaural: false, voice: false },
};

export const useAudioStateStore = create<AudioEngineUIState & AudioStateActions>()((set) => ({
  ...INITIAL_STATE,
  setEngineState: (engineState) => set({ engineState }),
  setPhase: (phase) => set({ phase }),
  setProgress: (currentSegmentIndex, elapsedMs) => set({ currentSegmentIndex, elapsedMs }),
  setTotalDuration: (totalDurationMs) => set({ totalDurationMs }),
  setLayerState: (layer, update) => set((state) => ({ [layer]: { ...state[layer], ...update } })),
  setLayerVolume: (layer, volume) => set((state) => ({ [layer]: { ...state[layer], volume } })),
  setError: (error) => set({ error }),
  setNarrationText: (text) => set({ currentNarrationText: text }),
  toggleMute: (layer) => set((state) => ({
    mutedLayers: {
      ...state.mutedLayers,
      [layer]: !state.mutedLayers[layer],
    },
  })),
  reset: () => set(INITIAL_STATE),
}));
