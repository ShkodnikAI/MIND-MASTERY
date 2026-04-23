import { create } from 'zustand';
import type { Practice } from '@/types';

// ─── State Interface ────────────────────────────────────────────
// Two-level cache (INV-3): UI reads only from memory (this store).
// Full content loading happens in Stage 2a.

interface ContentState {
  practices: Record<string, Practice>;
  systems: Record<string, string[]>; // systemId → practiceId[]
  loaded: boolean;

  // Actions
  loadPractices: () => Promise<void>;
  getPractice: (practiceId: string) => Practice | null;
  getPracticesBySystem: (systemId: string) => Practice[];
  setLoaded: (loaded: boolean) => void;
}

// ─── Store ──────────────────────────────────────────────────────

export const useContentStore = create<ContentState>()((set, get) => ({
  practices: {},
  systems: {},
  loaded: false,

  loadPractices: async () => {
    // Stage 2a will implement full content loading from SQLite / content files.
    // Stub: marks loading as complete so the UI can proceed.
    set({ loaded: true });
  },

  getPractice: (practiceId: string): Practice | null => {
    return get().practices[practiceId] ?? null;
  },

  getPracticesBySystem: (systemId: string): Practice[] => {
    const state = get();
    const ids = state.systems[systemId] ?? [];
    return ids
      .map((id) => state.practices[id])
      .filter((p): p is Practice => p !== undefined)
      .sort((a, b) => a.requiredLevel - b.requiredLevel);
  },

  setLoaded: (loaded: boolean) => set({ loaded }),
}));
