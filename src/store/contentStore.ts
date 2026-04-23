/**
 * Content Store — two-level cache (INV-3).
 *
 * Level 1 (memory): Zustand store — all UI reads go here (no SQL in render path).
 * Level 2 (disk):   SQLite — hydrated at app startup via loadPractices + loadTexts.
 *
 * Practices are registered from TypeScript definitions (Stage 2b/2c).
 * Texts are loaded from JSON files in content/texts/ (Stage 2b/2c).
 */

import { create } from 'zustand';
import type { Practice } from '@/types';
import type { PracticeTextSchema } from '@content/schema';
import type { LoadedText } from '@/services/content/textLoader';

// ─── State Interface ────────────────────────────────────────────

interface ContentState {
  // Practices registry (loaded from TypeScript definitions in Stage 2b/2c)
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
  loadPractices: () => Promise<void>; // Will be implemented in Stage 2b/2c

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
    // Will be populated in Stage 2b/2c when practice definitions are created
    // For now, mark as loaded
    const textsLoaded = get().textsLoaded;
    set({ practicesLoaded: true });
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
