/**
 * @file Progress store — Zustand state management for practice progress.
 *
 * Hydrates from SQLite on startup (INV-1: SQLite is source of truth).
 * Provides in-memory cache for the UI layer (INV-3: UI reads memory only).
 * All mutations write-through to SQLite via the progress repository.
 *
 * Does NOT use `persist` middleware — data lives in SQLite, not AsyncStorage.
 */

import { create } from 'zustand';
import type { PracticeProgress, SystemProgress } from '@/types';
import type { PracticeProgress as DbPracticeProgress } from '@/db/types';
import {
  getAllProgress,
  updateProgress,
  incrementCompleted as dbIncrementCompleted,
  getSystemProgress as dbGetSystemProgress,
} from '@/db/queries/progress';
import { logger } from '@/utils/logger';

// ─── DB ↔ Domain conversion helpers ──────────────────────────────

/** Convert a DB row (snake_case, 0|1 ints, epoch ms) → domain model. */
function fromDb(row: DbPracticeProgress): PracticeProgress {
  return {
    practiceId: row.practice_id,
    completedCount: row.completed_count,
    totalDurationMin: row.total_duration_min,
    lastCompletedAt: row.last_completed_at !== null ? new Date(row.last_completed_at) : null,
    currentLevel: row.current_level,
    isUnlocked: row.is_unlocked === 1,
  };
}

// ─── Internal helpers ────────────────────────────────────────────

interface StoredPracticeProgress {
  practiceId: string;
  completedCount: number;
  totalDurationMin: number;
  lastCompletedAt: number | null; // epoch ms for internal consistency
  currentLevel: number;
  isUnlocked: boolean;
}

function toStored(p: PracticeProgress): StoredPracticeProgress {
  return {
    practiceId: p.practiceId,
    completedCount: p.completedCount,
    totalDurationMin: p.totalDurationMin,
    lastCompletedAt: p.lastCompletedAt ? p.lastCompletedAt.getTime() : null,
    currentLevel: p.currentLevel,
    isUnlocked: p.isUnlocked,
  };
}

function fromStored(s: StoredPracticeProgress): PracticeProgress {
  return {
    practiceId: s.practiceId,
    completedCount: s.completedCount,
    totalDurationMin: s.totalDurationMin,
    lastCompletedAt: s.lastCompletedAt !== null ? new Date(s.lastCompletedAt) : null,
    currentLevel: s.currentLevel,
    isUnlocked: s.isUnlocked,
  };
}

// ─── State Interface ────────────────────────────────────────────

interface ProgressState {
  /** Stored practice progress keyed by practiceId. */
  practices: Record<string, StoredPracticeProgress>;
  /** Reverse index: systemId → practiceId[]. Populated by setPracticeProgress. */
  systemIndex: Record<string, string[]>;

  // ── Actions ─────────────────────────────────────────────────

  /**
   * Load all progress rows from SQLite into memory.
   * Must be called once at app startup before rendering any progress UI.
   */
  loadProgress: () => Promise<void>;

  getPracticeProgress: (practiceId: string) => PracticeProgress | null;
  setPracticeProgress: (progress: PracticeProgress, systemId: string) => void;
  incrementCompleted: (practiceId: string, durationMin: number) => void;
  unlockPractice: (practiceId: string, level?: number) => void;
  getSystemProgress: (systemId: string) => SystemProgress;
  getAllUnlocked: (systemId: string) => string[];
  reset: () => void;
}

// ─── Store ──────────────────────────────────────────────────────

export const useProgressStore = create<ProgressState>()((set, get) => ({
  practices: {},
  systemIndex: {},

  loadProgress: async () => {
    try {
      const rows = await getAllProgress();
      const practices: Record<string, StoredPracticeProgress> = {};
      const systemIndex: Record<string, string[]> = {};

      for (const row of rows) {
        const domain = fromDb(row);
        const stored = toStored(domain);
        practices[domain.practiceId] = stored;

        if (row.system_id) {
          const ids = systemIndex[row.system_id] ?? [];
          if (!ids.includes(domain.practiceId)) {
            ids.push(domain.practiceId);
          }
          systemIndex[row.system_id] = ids;
        }
      }

      set({ practices, systemIndex });
      logger.info('[progressStore]', `Loaded ${Object.keys(practices).length} progress rows`);
    } catch (error) {
      logger.error('[progressStore]', 'Failed to load progress from SQLite', error);
    }
  },

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

      // Write-through to SQLite
      updateProgress(progress.practiceId, {
        completed_count: progress.completedCount,
        total_duration_min: progress.totalDurationMin,
        current_level: progress.currentLevel,
        last_completed_at: progress.lastCompletedAt ? progress.lastCompletedAt.getTime() : null,
        is_unlocked: progress.isUnlocked ? 1 : 0,
      }).catch((err) => {
        logger.error('[progressStore]', 'Write-through failed for setPracticeProgress', err);
      });

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

      const now = Date.now();

      // Write-through to SQLite
      dbIncrementCompleted(practiceId, durationMin).catch((err) => {
        logger.error('[progressStore]', 'Write-through failed for incrementCompleted', err);
      });

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

      const newLevel = level ?? Math.max(existing.currentLevel, 1);

      // Write-through to SQLite
      updateProgress(practiceId, {
        is_unlocked: 1,
        current_level: newLevel,
      }).catch((err) => {
        logger.error('[progressStore]', 'Write-through failed for unlockPractice', err);
      });

      return {
        practices: {
          ...state.practices,
          [practiceId]: {
            ...existing,
            isUnlocked: true,
            currentLevel: newLevel,
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
    const currentMaxLevel = practices.reduce((max, p) => Math.max(max, p.currentLevel), 0);
    const totalSessionMin = practices.reduce((sum, p) => sum + p.totalDurationMin, 0);

    const dates = practices
      .map((p) => p.lastCompletedAt)
      .filter((d): d is number => d !== null)
      .sort()
      .reverse();

    const lastSessionDate: Date | null = dates.length > 0 ? new Date(dates[0]) : null;

    // Streak calculation
    let streakDays = 0;
    if (dates.length > 0) {
      streakDays = 1;
      for (let i = 1; i < dates.length; i++) {
        const prev = dates[i - 1];
        const curr = dates[i];
        const diffMs = prev - curr;
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
    return practiceIds.filter((id) => state.practices[id]?.isUnlocked === true);
  },

  reset: () =>
    set({
      practices: {},
      systemIndex: {},
    }),
}));
