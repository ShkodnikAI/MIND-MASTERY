/**
 * Content Store — two-level cache (INV-3).
 *
 * Level 1 (memory): Zustand store — all UI reads go here (no SQL in render path).
 * Level 2 (disk):   SQLite — hydrated at app startup via loadPractices + loadTexts.
 *
 * Practices are registered from the content registry (src/content/registry.ts).
 * Texts are loaded from JSON files in content/texts/ via textLoader.
 */

import { create } from 'zustand';
import type { Practice } from '@/types';
import type { PracticeTextSchema } from '@content/schema';
import type { LoadedText } from '@/services/content/textLoader';
import { registerAllSystems, getAllSystems, getTotalPracticeCount } from '@/content/registry';
import { logger } from '@/utils/logger';

// ─── State Interface ────────────────────────────────────────────

interface ContentState {
  // Practices registry (loaded from content registry at startup)
  practices: Record<string, Practice>;
  systems: Record<string, { id: string; name: string; icon: string; color: string }>;

  // Texts cache (loaded from JSON files, then stored in SQLite)
  texts: Record<string, PracticeTextSchema>;

  // Loading states
  practicesLoaded: boolean;
  textsLoaded: boolean;
  loaded: boolean; // true only when both practices and texts are loaded

  // Practice actions
  registerPractice: (practice: Practice) => void;
  registerSystem: (id: string, name: string, icon: string, color: string) => void;
  getPractice: (practiceId: string) => Practice | null;
  getPracticesBySystem: (systemId: string) => Practice[];
  getAllPractices: () => Practice[];

  // Text actions (INV-3: memory-only reads)
  loadTexts: (loadedTexts: LoadedText[]) => void;
  getText: (practiceId: string) => PracticeTextSchema | null;
  getAllTexts: () => Record<string, PracticeTextSchema>;

  // Bulk operations
  loadPractices: () => Promise<void>;

  // Reset
  reset: () => void;
}

// ─── Store ──────────────────────────────────────────────────────

export const useContentStore = create<ContentState>((set, get) => ({
  practices: {},
  systems: {},
  texts: {},
  practicesLoaded: false,
  textsLoaded: false,
  loaded: false,

  // ── Practice registration ─────────────────────────────────────

  registerPractice: (practice) => {
    set((state) => ({
      practices: { ...state.practices, [practice.id]: practice },
    }));
  },

  registerSystem: (id, name, icon, color) => {
    set((state) => ({
      systems: { ...state.systems, [id]: { id, name, icon, color } },
    }));
  },

  // ── Practice getters ──────────────────────────────────────────

  getPractice: (practiceId) => get().practices[practiceId] ?? null,

  getPracticesBySystem: (systemId) => {
    return Object.values(get().practices)
      .filter((p) => p.systemId === systemId)
      .sort((a, b) => a.requiredLevel - b.requiredLevel);
  },

  getAllPractices: () => Object.values(get().practices),

  // ── Text actions (INV-3: memory-only reads) ──────────────────

  loadTexts: (loadedTexts) => {
    const textMap: Record<string, PracticeTextSchema> = {};
    for (const lt of loadedTexts) {
      textMap[lt.practiceId] = lt.data;
    }
    const practicesLoaded = get().practicesLoaded;
    set({
      texts: textMap,
      textsLoaded: true,
      loaded: practicesLoaded, // loaded is true only when both are true
    });
    // Re-check if both are loaded
    if (practicesLoaded) {
      set({ loaded: true });
    }
  },

  getText: (practiceId) => get().texts[practiceId] ?? null,

  getAllTexts: () => get().texts,

  // ── Bulk operations ───────────────────────────────────────────

  loadPractices: async () => {
    // Ensure all 5 systems are registered in the content registry
    registerAllSystems();

    // Collect all practices and systems from the registry
    const allSystems = getAllSystems();
    const practicesMap: Record<string, Practice> = {};
    const systemsMap: Record<string, { id: string; name: string; icon: string; color: string }> =
      {};

    for (const system of allSystems) {
      // Register the system metadata
      systemsMap[system.id] = {
        id: system.id,
        name: system.name,
        icon: system.icon,
        color: system.color,
      };

      // Register all practices from this system
      for (const practice of system.practices) {
        practicesMap[practice.id] = practice;
      }
    }

    const totalPractices = getTotalPracticeCount();
    logger.info(
      '[contentStore]',
      `Loaded ${totalPractices} practices across ${allSystems.length} systems`,
    );

    const textsLoaded = get().textsLoaded;
    set({
      practices: practicesMap,
      systems: systemsMap,
      practicesLoaded: true,
      loaded: textsLoaded,
    });
    if (textsLoaded) {
      set({ loaded: true });
    }
  },

  // ── Reset ─────────────────────────────────────────────────────

  reset: () => {
    set({
      practices: {},
      systems: {},
      texts: {},
      practicesLoaded: false,
      textsLoaded: false,
      loaded: false,
    });
  },
}));
