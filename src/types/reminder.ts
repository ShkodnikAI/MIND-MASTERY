/**
 * @file Reminder type definitions for the notification/reminder system.
 *
 * A Reminder is a user-created scheduled notification that fires at a
 * chosen time on selected days of the week. Optionally linked to a
 * specific practice or system for deep-link navigation.
 *
 * INV-1: Reminders are persisted in SQLite (source of truth).
 * INV-6: Discriminated reminder type via `linkedType`.
 */

import type { DayOfWeek } from '@/types';

// ---------------------------------------------------------------------------
// Reminder types
// ---------------------------------------------------------------------------

/** What a reminder is linked to — determines deep-link target on tap. */
export type ReminderLinkedType = 'none' | 'system' | 'practice';

/**
 * A user-created reminder.
 *
 * Stored in the `reminders` SQLite table and surfaced via reminderStore.
 */
export interface Reminder {
  /** Unique identifier (UUID v4). */
  readonly id: string;
  /** User-visible label (e.g. "Утренняя медитация", "Дыхание перед сном"). */
  readonly label: string;
  /** Hour of the notification (0–23). */
  readonly hour: number;
  /** Minute of the notification (0–59). */
  readonly minute: number;
  /** Which days the reminder fires. Empty array = no days (inactive). */
  readonly days: readonly DayOfWeek[];
  /** Whether the reminder is currently active. */
  readonly enabled: boolean;
  /** Whether to play a sound with the notification. */
  readonly sound: boolean;
  /**
   * What the reminder is linked to.
   *  - `none` → opens home screen on tap.
   *  - `system` → opens the specific system tab.
   *  - `practice` → opens the practice detail screen.
   */
  readonly linkedType: ReminderLinkedType;
  /**
   * ID of the linked system or practice.
   * Must be set when `linkedType` is not `'none'`.
   */
  readonly linkedId: string | null;
  /** ISO 8601 creation timestamp. */
  readonly createdAt: string;
}

/**
 * Input for creating a new reminder (mutable version without readonly).
 */
export interface CreateReminderInput {
  readonly label: string;
  readonly hour: number;
  readonly minute: number;
  readonly days: readonly DayOfWeek[];
  readonly enabled: boolean;
  readonly sound: boolean;
  readonly linkedType: ReminderLinkedType;
  readonly linkedId: string | null;
}

/**
 * Fields that can be updated on an existing reminder.
 * `id` and `createdAt` are immutable.
 */
export interface UpdateReminderInput {
  readonly label?: string;
  readonly hour?: number;
  readonly minute?: number;
  readonly days?: readonly DayOfWeek[];
  readonly enabled?: boolean;
  readonly sound?: boolean;
  readonly linkedType?: ReminderLinkedType;
  readonly linkedId?: string | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum number of reminders a user can create. */
export const MAX_REMINDERS = 10;

/** Default values for a new reminder form. */
export const DEFAULT_REMINDER: CreateReminderInput = {
  label: '',
  hour: 9,
  minute: 0,
  days: [1, 2, 3, 4, 5] as DayOfWeek[],
  enabled: true,
  sound: true,
  linkedType: 'none',
  linkedId: null,
};

/** Hour options available in the reminder time picker (07:00 – 22:00). */
export const REMINDER_HOUR_OPTIONS = Array.from({ length: 16 }, (_, i) => i + 7);

/** Minute options available in the reminder time picker. */
export const REMINDER_MINUTE_OPTIONS = [0, 15, 30, 45] as const;
