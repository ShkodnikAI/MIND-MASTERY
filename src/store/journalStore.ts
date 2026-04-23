import { create } from 'zustand';
import type { JournalEntry } from '@/types';

// ─── State Interface ────────────────────────────────────────────

interface JournalState {
  entries: JournalEntry[];
  isLoading: boolean;

  // Actions
  setEntries: (entries: JournalEntry[]) => void;
  addEntry: (entry: JournalEntry) => void;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => void;
  removeEntry: (id: string) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
}

// ─── Helpers ────────────────────────────────────────────────────

/** Sort entries newest-first by date (SessionRecord). */
function sortByDateNewestFirst(entries: JournalEntry[]): JournalEntry[] {
  return [...entries].sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );
}

// ─── Store ──────────────────────────────────────────────────────

export const useJournalStore = create<JournalState>()((set) => ({
  entries: [],
  isLoading: false,

  setEntries: (entries: JournalEntry[]) =>
    set({ entries: sortByDateNewestFirst(entries) }),

  addEntry: (entry: JournalEntry) =>
    set((state) => ({
      entries: sortByDateNewestFirst([entry, ...state.entries]),
    })),

  updateEntry: (id: string, updates: Partial<JournalEntry>) =>
    set((state) => ({
      entries: state.entries.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              ...updates,
              updatedAt: new Date(),
            }
          : entry,
      ),
    })),

  removeEntry: (id: string) =>
    set((state) => ({
      entries: state.entries.filter((entry) => entry.id !== id),
    })),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  clear: () => set({ entries: [], isLoading: false }),
}));
