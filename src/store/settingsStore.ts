import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  SafetyState,
  AudioSettings,
  VoiceSettings,
  LightConfig,
  AudioErrorPolicy,
  VoiceMode,
  LightThemeId,
  LightEffect,
} from '@/types';

// ─── Defaults ───────────────────────────────────────────────────

const DEFAULT_SAFETY: SafetyState = {
  disclaimerAccepted: false,
  disclaimerVersion: '',
  consentGivenFor: {},
};

const DEFAULT_AUDIO: AudioSettings = {
  musicVolume: 0.3,
  binauralVolume: 0.2,
  voiceVolume: 1.0,
  masterVolume: 0.8,
  errorPolicy: 'skip' as AudioErrorPolicy,
  backgroundPlayback: true,
};

const DEFAULT_VOICE: VoiceSettings = {
  mode: 'system' as VoiceMode,
  language: 'ru',
  speed: 0.9,
  pitch: 1.0,
};

const DEFAULT_LIGHT: LightConfig = {
  enabled: true,
  theme: 'cosmic' as LightThemeId,
  effect: 'glow' as LightEffect,
  intensity: 0.5,
  autoNightMode: true,
  nightStartHour: 22,
  nightEndHour: 6,
};

// ─── State Interface ────────────────────────────────────────────

interface SettingsState {
  // App settings
  onboarded: boolean;
  theme: 'dark' | 'light' | 'system';
  hapticsEnabled: boolean;

  // Composite settings slices
  safety: SafetyState;
  audio: AudioSettings;
  voice: VoiceSettings;
  light: LightConfig;

  // Actions
  setOnboarded: (value: boolean) => void;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  setHapticsEnabled: (enabled: boolean) => void;
  acceptDisclaimer: (version: string) => void;
  giveConsent: (practiceId: string) => void;
  updateAudio: (partial: Partial<AudioSettings>) => void;
  updateVoice: (partial: Partial<VoiceSettings>) => void;
  updateLight: (partial: Partial<LightConfig>) => void;
  resetSettings: () => void;
}

// ─── Store ──────────────────────────────────────────────────────

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // App settings
      onboarded: false,
      theme: 'dark' as const,
      hapticsEnabled: true,

      // Composite settings
      safety: { ...DEFAULT_SAFETY },
      audio: { ...DEFAULT_AUDIO },
      voice: { ...DEFAULT_VOICE },
      light: { ...DEFAULT_LIGHT },

      // ── Actions ──────────────────────────────────────────────

      setOnboarded: (value: boolean) => set({ onboarded: value }),

      setTheme: (theme: 'dark' | 'light' | 'system') => set({ theme }),

      setHapticsEnabled: (enabled: boolean) =>
        set({ hapticsEnabled: enabled }),

      acceptDisclaimer: (version: string) =>
        set((state) => ({
          safety: {
            ...state.safety,
            disclaimerAccepted: true,
            disclaimerVersion: version,
          },
        })),

      giveConsent: (practiceId: string) =>
        set((state) => {
          const already = state.safety.consentGivenFor[practiceId];
          if (already) return state;
          return {
            safety: {
              ...state.safety,
              consentGivenFor: {
                ...state.safety.consentGivenFor,
                [practiceId]: true,
              },
            },
          };
        }),

      updateAudio: (partial: Partial<AudioSettings>) =>
        set((state) => ({
          audio: { ...state.audio, ...partial },
        })),

      updateVoice: (partial: Partial<VoiceSettings>) =>
        set((state) => ({
          voice: { ...state.voice, ...partial },
        })),

      updateLight: (partial: Partial<LightConfig>) =>
        set((state) => ({
          light: { ...state.light, ...partial },
        })),

      resetSettings: () =>
        set({
          onboarded: false,
          theme: 'dark' as const,
          hapticsEnabled: true,
          safety: { ...DEFAULT_SAFETY },
          audio: { ...DEFAULT_AUDIO },
          voice: { ...DEFAULT_VOICE },
          light: { ...DEFAULT_LIGHT },
        }),
    }),
    {
      name: 'mindmastery-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
