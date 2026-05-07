import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  SafetyState,
  AudioSettings,
  VoiceSettings,
  LightConfig,
  NotificationSettings,
  DayOfWeek,
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
  selectedMusicTrack: 'space',
  customMusicTracks: [],
};

const DEFAULT_VOICE: VoiceSettings = {
  mode: 'prerecorded' as VoiceMode,
  language: 'ru',
  speed: 0.9,
  pitch: 1.0,
  voiceId: '',
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  dailyReminderEnabled: false,
  dailyReminderHour: 9,
  dailyReminderMinute: 0,
  dailyReminderDays: [1, 2, 3, 4, 5, 6, 7] as DayOfWeek[],
  streakReminderEnabled: true,
  streakReminderHour: 20,
  achievementEnabled: true,
  permissionGranted: false,
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

// ─── TTS Settings ───────────────────────────────────────────

export interface TTSSettings {
  readonly apiKey: string;
  readonly selectedVoice: string;
  readonly defaultSpeed: number;
  readonly defaultPitch: number;
  readonly defaultLanguage: string;
  readonly clonedVoices: readonly { voice_id: string; name: string; gender?: string; language?: string; display_name?: string; preview_url?: string; is_cloned?: boolean }[];
}

const DEFAULT_TTS: TTSSettings = {
  apiKey: '2031325794852152128',
  selectedVoice: 'male-qn-qingse',
  defaultSpeed: 1.0,
  defaultPitch: 1.0,
  defaultLanguage: 'ru',
  clonedVoices: [],
};

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
  notifications: NotificationSettings;
  tts: TTSSettings;

  // Actions
  setOnboarded: (value: boolean) => void;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  setHapticsEnabled: (enabled: boolean) => void;
  acceptDisclaimer: (version: string) => void;
  giveConsent: (practiceId: string) => void;
  updateAudio: (partial: Partial<AudioSettings>) => void;
  updateVoice: (partial: Partial<VoiceSettings>) => void;
  updateLight: (partial: Partial<LightConfig>) => void;
  updateNotifications: (partial: Partial<NotificationSettings>) => void;
  setNotificationPermission: (granted: boolean) => void;
  updateTTS: (partial: Partial<TTSSettings>) => void;
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
      notifications: { ...DEFAULT_NOTIFICATIONS },
      tts: { ...DEFAULT_TTS },

      // ── Actions ──────────────────────────────────────────────

      setOnboarded: (value: boolean) => set({ onboarded: value }),

      setTheme: (theme: 'dark' | 'light' | 'system') => set({ theme }),

      setHapticsEnabled: (enabled: boolean) => set({ hapticsEnabled: enabled }),

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

      updateNotifications: (partial: Partial<NotificationSettings>) =>
        set((state) => ({
          notifications: { ...state.notifications, ...partial },
        })),

      setNotificationPermission: (granted: boolean) =>
        set((state) => ({
          notifications: { ...state.notifications, permissionGranted: granted },
        })),

      updateTTS: (partial: Partial<TTSSettings>) =>
        set((state) => ({
          tts: { ...state.tts, ...partial },
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
          notifications: { ...DEFAULT_NOTIFICATIONS },
          tts: { ...DEFAULT_TTS },
        }),
    }),
    {
      name: 'mindmastery-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
