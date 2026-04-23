import { create } from 'zustand';
import type { LightConfig, EntrainmentConfig, ChakraConfig } from '@/types';

// ─── Defaults ───────────────────────────────────────────────────

const DEFAULT_LIGHT: LightConfig = {
  enabled: true,
  theme: 'cosmic',
  effect: 'glow',
  intensity: 0.5,
  autoNightMode: true,
  nightStartHour: 22,
  nightEndHour: 6,
};

const DEFAULT_ENTRAINMENT: EntrainmentConfig = {
  enabled: false,
  targetHz: 10,
  maxSupportedHz: 30,
  safetyWarningShown: false,
};

const DEFAULT_CHAKRA: ChakraConfig = {
  enabled: false,
  speedSecPerChakra: 30,
  currentChakraIndex: 0,
};

// ─── State Interface ────────────────────────────────────────────

interface LightSettingsState {
  config: LightConfig;
  entrainment: EntrainmentConfig;
  chakra: ChakraConfig;

  // Actions
  updateConfig: (partial: Partial<LightConfig>) => void;
  updateEntrainment: (partial: Partial<EntrainmentConfig>) => void;
  updateChakra: (partial: Partial<ChakraConfig>) => void;
  reset: () => void;
}

// ─── Store ──────────────────────────────────────────────────────

export const useLightSettingsStore = create<LightSettingsState>()((set) => ({
  config: { ...DEFAULT_LIGHT },
  entrainment: { ...DEFAULT_ENTRAINMENT },
  chakra: { ...DEFAULT_CHAKRA },

  updateConfig: (partial: Partial<LightConfig>) =>
    set((state) => ({
      config: { ...state.config, ...partial },
    })),

  updateEntrainment: (partial: Partial<EntrainmentConfig>) =>
    set((state) => ({
      entrainment: { ...state.entrainment, ...partial },
    })),

  updateChakra: (partial: Partial<ChakraConfig>) =>
    set((state) => ({
      chakra: { ...state.chakra, ...partial },
    })),

  reset: () =>
    set({
      config: { ...DEFAULT_LIGHT },
      entrainment: { ...DEFAULT_ENTRAINMENT },
      chakra: { ...DEFAULT_CHAKRA },
    }),
}));
