import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PracticeProgress, SystemProgress } from '@/types';

// ─── Internal helpers ───────────────────────────────────────────
//
// PracticeProgress uses `Date | null` for lastCompletedAt, but
// JSON persistence converts Date → ISO string on write and
// string → string on read. We store dates as ISO strings internally
// and convert to Date objects when returning typed values to consumers.

interface StoredPracticeProgress {
  practiceId: string;
  completedCount: number;
  totalDurationMin: number;
  lastCompletedAt: string | null;
  currentLevel: number;
  isUnlocked: boolean;
}

function toStored(p: PracticeProgress): StoredPracticeProgress {
  return {
    practiceId: p.practiceId,
    completedCount: p.completedCount,
    totalDurationMin: p.totalDurationMin,
    lastCompletedAt: p.lastCompletedAt
      ? p.lastCompletedAt.toISOString()
      : null,
    currentLevel: p.currentLevel,
    isUnlocked: p.isUnlocked,
  };
}

function fromStored(s: StoredPracticeProgress): PracticeProgress {
  return {
    practiceId: s.practiceId,
    completedCount: s.completedCount,
    totalDurationMin: s.totalDurationMin,
    lastCompletedAt: s.lastCompletedAt ? new Date(s.lastCompletedAt) : null,
    currentLevel: s.currentLevel,
    isUnlocked: s.isUnlocked,
  };
}

// ─── State Interface ────────────────────────────────────────────

interface ProgressState {
  /** Stored practice progress keyed by practiceId. Dates are ISO strings. */
  practices: Record<string, StoredPracticeProgress>;
  /** Reverse index: systemId → practiceId[]. Populated by setPracticeProgress. */
  systemIndex: Record<string, string[]>;

  // Actions
  getPracticeProgress: (practiceId: string) => PracticeProgress | null;
  setPracticeProgress: (progress: PracticeProgress, systemId: string) => void;
  incrementCompleted: (practiceId: string, durationMin: number) => void;
  unlockPractice: (practiceId: string, level?: number) => void;
  getSystemProgress: (systemId: string) => SystemProgress;
  getAllUnlocked: (systemId: string) => string[];
  reset: () => void;
}

// ─── Store ──────────────────────────────────────────────────────

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      practices: {},
      systemIndex: {},

      getPracticeProgress: (practiceId: string): PracticeProgress | null => {
        const stored = get().practices[practiceId];
        if (!stored) return null;
        return fromStored(stored);
      },

      setPracticeProgress: (progress: PracticeProgress, systemId: string) =>
        set((state) => {
          const stored = toStored(progress);
          const currentSystemIds = state.systemIndex[systemId] ?? [];

          const newSystemIds = currentSystemIds.includes(progress.practiceId)
            ? currentSystemIds
            : [...currentSystemIds, progress.practiceId];

          return {
            practices: {
              ...state.practices,
              [progress.practiceId]: stored,
            },
            systemIndex: {
              ...state.systemIndex,
              [systemId]: newSystemIds,
            },
          };
        }),

      incrementCompleted: (practiceId: string, durationMin: number) =>
        set((state) => {
          const existing = state.practices[practiceId];
          if (!existing) return state;

          const now = new Date().toISOString();

          return {
            practices: {
              ...state.practices,
              [practiceId]: {
                ...existing,
                completedCount: existing.completedCount + 1,
                totalDurationMin: existing.totalDurationMin + durationMin,
                lastCompletedAt: now,
              },
            },
          };
        }),

      unlockPractice: (practiceId: string, level?: number) =>
        set((state) => {
          const existing = state.practices[practiceId];
          if (!existing) return state;

          return {
            practices: {
              ...state.practices,
              [practiceId]: {
                ...existing,
                isUnlocked: true,
                currentLevel: level ?? Math.max(existing.currentLevel, 1),
              },
            },
          };
        }),

      getSystemProgress: (systemId: string): SystemProgress => {
        const state = get();
        const practiceIds = state.systemIndex[systemId] ?? [];
        const practices = practiceIds
          .map((id) => state.practices[id])
          .filter((p): p is StoredPracticeProgress => p !== undefined);

        const unlockedPractices = practices.filter((p) => p.isUnlocked).length;
        const currentMaxLevel = practices.reduce(
          (max, p) => Math.max(max, p.currentLevel),
          0,
        );
        const totalSessionMin = practices.reduce(
          (sum, p) => sum + p.totalDurationMin,
          0,
        );

        const dates = practices
          .map((p) => p.lastCompletedAt)
          .filter((d): d is string => d !== null)
          .sort()
          .reverse();

        const lastSessionDate: Date | null = dates.length > 0
          ? new Date(dates[0])
          : null;

        // Streak calculation
        let streakDays = 0;
        if (dates.length > 0) {
          streakDays = 1;
          for (let i = 1; i < dates.length; i++) {
            const prev = new Date(dates[i - 1]);
            const curr = new Date(dates[i]);
            const diffMs = prev.getTime() - curr.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
              streakDays += 1;
            } else {
              break;
            }
          }
        }

        return {
          systemId,
          totalPractices: practiceIds.length,
          unlockedPractices,
          currentMaxLevel,
          totalSessionMin,
          streakDays,
          lastSessionDate,
        };
      },

      getAllUnlocked: (systemId: string): string[] => {
        const state = get();
        const practiceIds = state.systemIndex[systemId] ?? [];
        return practiceIds.filter(
          (id) => state.practices[id]?.isUnlocked === true,
        );
      },

      reset: () =>
        set({
          practices: {},
          systemIndex: {},
        }),
    }),
    {
      name: 'mindmastery-progress',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
