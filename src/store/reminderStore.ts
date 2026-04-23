/**
 * @file Reminder store — Zustand state management for user-created reminders.
 *
 * Hydrates from SQLite on first access (INV-1: SQLite is source of truth).
 * Provides in-memory cache for the UI layer (INV-3: UI reads memory only).
 * All mutations write-through to SQLite via the reminders repository.
 *
 * Does NOT use `persist` middleware — data lives in SQLite, not AsyncStorage.
 */

import { create } from 'zustand';
import type { Reminder, CreateReminderInput, UpdateReminderInput } from '@/types';
import {
  getAllReminders,
  createReminder as repoCreate,
  updateReminder as repoUpdate,
  deleteReminder as repoDelete,
  countReminders,
} from '@/db/queries/reminders';
import { MAX_REMINDERS } from '@/types/reminder';
import { logger } from '@/utils/logger';

// ─── State Interface ────────────────────────────────────────────

interface ReminderState {
  /** In-memory cache of all reminders. null = not yet hydrated. */
  reminders: Reminder[] | null;
  /** Whether an async operation is in progress. */
  loading: boolean;
  /** Last error message, null if no error. */
  error: string | null;

  // ── Actions ─────────────────────────────────────────────────

  /**
   * Load all reminders from SQLite into memory.
   * Must be called once at app startup before rendering any reminder UI.
   */
  loadReminders: () => Promise<void>;

  /**
   * Create a new reminder.
   * Writes to SQLite and updates the in-memory cache.
   * Throws if MAX_REMINDERS limit is reached.
   */
  addReminder: (input: CreateReminderInput) => Promise<Reminder>;

  /**
   * Update an existing reminder.
   * Writes to SQLite and updates the in-memory cache.
   */
  editReminder: (id: string, input: UpdateReminderInput) => Promise<Reminder | null>;

  /**
   * Delete a reminder by ID.
   * Removes from SQLite and the in-memory cache.
   */
  removeReminder: (id: string) => Promise<boolean>;

  /**
   * Toggle a reminder's enabled state.
   * Convenience method that calls editReminder internally.
   */
  toggleReminder: (id: string, enabled: boolean) => Promise<Reminder | null>;

  /**
   * Get a single reminder from the cache by ID.
   * Returns null if not found or store not hydrated.
   */
  getReminder: (id: string) => Reminder | null;

  /** Clear any error state. */
  clearError: () => void;
}

// ─── Store ──────────────────────────────────────────────────────

export const useReminderStore = create<ReminderState>()((set, get) => ({
  reminders: null,
  loading: false,
  error: null,

  loadReminders: async () => {
    set({ loading: true, error: null });
    try {
      const reminders = await getAllReminders();
      set({ reminders, loading: false });
      logger.info('[reminderStore]', `Loaded ${reminders.length} reminders`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to load reminders';
      set({ error: msg, loading: false });
      logger.error('[reminderStore]', msg, error);
    }
  },

  addReminder: async (input: CreateReminderInput) => {
    set({ loading: true, error: null });
    try {
      // Check limit
      const count = await countReminders();
      if (count >= MAX_REMINDERS) {
        const msg = `Maximum ${MAX_REMINDERS} reminders allowed`;
        set({ error: msg, loading: false });
        throw new Error(msg);
      }

      const reminder = await repoCreate(input);
      const current = get().reminders ?? [];
      set({
        reminders: [reminder, ...current],
        loading: false,
      });
      return reminder;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to create reminder';
      set({ error: msg, loading: false });
      logger.error('[reminderStore]', msg, error);
      throw error;
    }
  },

  editReminder: async (id: string, input: UpdateReminderInput) => {
    set({ loading: true, error: null });
    try {
      const updated = await repoUpdate(id, input);
      if (!updated) {
        set({ loading: false });
        return null;
      }

      const current = get().reminders ?? [];
      set({
        reminders: current.map((r) => (r.id === id ? updated : r)),
        loading: false,
      });
      return updated;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to update reminder';
      set({ error: msg, loading: false });
      logger.error('[reminderStore]', msg, error);
      throw error;
    }
  },

  removeReminder: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const deleted = await repoDelete(id);
      if (deleted) {
        const current = get().reminders ?? [];
        set({
          reminders: current.filter((r) => r.id !== id),
          loading: false,
        });
      } else {
        set({ loading: false });
      }
      return deleted;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to delete reminder';
      set({ error: msg, loading: false });
      logger.error('[reminderStore]', msg, error);
      throw error;
    }
  },

  toggleReminder: async (id: string, enabled: boolean) => {
    return get().editReminder(id, { enabled });
  },

  getReminder: (id: string) => {
    const reminders = get().reminders;
    if (!reminders) return null;
    return reminders.find((r) => r.id === id) ?? null;
  },

  clearError: () => set({ error: null }),
}));
