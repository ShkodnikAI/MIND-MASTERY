import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MomentSettings } from '@/types';

// ─── Defaults (v2.3: window 07:00–22:00) ───────────────────────

const DEFAULT_MOMENT: MomentSettings = {
  enabled: false,
  windowStartHour: 7,
  windowEndHour: 22,
  soundEnabled: true,
  soundTrackId: 'moment_chime',
  userSeed: 42,
  isActiveToday: false,
};

// ─── State Interface ────────────────────────────────────────────

interface MomentState {
  settings: MomentSettings;

  // Actions
  updateSettings: (partial: Partial<MomentSettings>) => void;
  setEnabled: (enabled: boolean) => void;
  setWindow: (startHour: number, endHour: number) => void;
  setSeed: (seed: number) => void;
  setSoundEnabled: (enabled: boolean) => void;
  markPlayedToday: () => void;
  resetTodayFlag: () => void;
}

// ─── Store ──────────────────────────────────────────────────────

export const useMomentStore = create<MomentState>()(
  persist(
    (set) => ({
      settings: { ...DEFAULT_MOMENT },

      updateSettings: (partial: Partial<MomentSettings>) =>
        set((state) => ({
          settings: { ...state.settings, ...partial },
        })),

      setEnabled: (enabled: boolean) =>
        set((state) => ({
          settings: { ...state.settings, enabled },
        })),

      setWindow: (startHour: number, endHour: number) =>
        set((state) => ({
          settings: {
            ...state.settings,
            windowStartHour: startHour,
            windowEndHour: endHour,
          },
        })),

      setSeed: (seed: number) =>
        set((state) => ({
          settings: { ...state.settings, userSeed: seed },
        })),

      setSoundEnabled: (enabled: boolean) =>
        set((state) => ({
          settings: { ...state.settings, soundEnabled: enabled },
        })),

      markPlayedToday: () =>
        set((state) => ({
          settings: { ...state.settings, isActiveToday: true },
        })),

      resetTodayFlag: () =>
        set((state) => ({
          settings: { ...state.settings, isActiveToday: false },
        })),
    }),
    {
      name: 'mindmastery-moment',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
