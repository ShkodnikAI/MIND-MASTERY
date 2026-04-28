import { create } from 'zustand';
import type { JournalEntry } from '@/types';
import type { JournalEntry as DbJournalEntry } from '@/db/types';
import { getRecentEntries } from '@/db/queries/journal';
import { logger } from '@/utils/logger';

// ─── State Interface ────────────────────────────────────────────

interface JournalState {
  entries: JournalEntry[];
  isLoading: boolean;

  // Actions
  loadEntries: () => Promise<void>;
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
  return [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());
}

// ─── Store ──────────────────────────────────────────────────────

export const useJournalStore = create<JournalState>()((set) => ({
  entries: [],
  isLoading: false,

  loadEntries: async () => {
    set({ isLoading: true });
    try {
      const rows: DbJournalEntry[] = await getRecentEntries(100);
      const entries: JournalEntry[] = rows.map((row) => ({
        id: row.id,
        sessionRecordId: row.session_id ?? '',
        practiceTitle: row.practice_title,
        systemName: row.system_name,
        date: new Date(row.date),
        durationMin: row.duration_min,
        mood: row.mood ?? '',
        notes: row.notes ?? '',
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }));
      set({ entries: sortByDateNewestFirst(entries), isLoading: false });
      logger.info('[journalStore]', `Loaded ${entries.length} journal entries`);
    } catch (error) {
      logger.error('[journalStore]', 'Failed to load entries from SQLite', error);
      set({ isLoading: false });
    }
  },

  setEntries: (entries: JournalEntry[]) => set({ entries: sortByDateNewestFirst(entries) }),

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
