/**
 * @file Application settings and safety / consent type definitions.
 *
 * Models the global app preferences that persist across launches,
 * and the medical-safety consent tracking required for each practice.
 */

// ---------------------------------------------------------------------------
// App settings
// ---------------------------------------------------------------------------

/** Available UI colour themes. */
export type ThemeMode = 'dark' | 'light' | 'system';

/**
 * Global application settings persisted in AsyncStorage / secure storage.
 * These are independent of any specific system or practice.
 */
export interface AppSettings {
  /** Whether the onboarding flow has been completed. */
  readonly onboarded: boolean;
  /** Primary language code. The app is Russian-first. */
  readonly language: 'ru';
  /** UI colour theme preference. */
  readonly theme: ThemeMode;
  /** Whether haptic feedback is enabled for interactions. */
  readonly hapticsEnabled: boolean;
  /**
   * Whether anonymised usage analytics are collected.
   * Default false — privacy-first.
   */
  readonly analyticsEnabled: boolean;
  /**
   * Whether the emergency-stop shortcut (triple-tap to abort session)
   * is enabled. Default true.
   */
  readonly emergencyShortcut: boolean;
}

// ---------------------------------------------------------------------------
// Notification settings
// ---------------------------------------------------------------------------

/**
 * Days of the week for scheduling practice reminders.
 * Uses ISO numeric values (1 = Monday, 7 = Sunday).
 */
export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * Notification category identifiers used by expo-notifications.
 * Each category can have its own presentation options on iOS.
 */
export type NotificationCategoryId =
  | 'daily_reminder'
  | 'streak_warning'
  | 'achievement'
  | 'session_complete';

/**
 * User-facing notification preferences.
 * Persisted via settingsStore alongside other settings.
 *
 * Controls:
 *  - Daily practice reminders at a chosen time on selected days.
 *  - Streak-break warnings when the user hasn't practiced today.
 *  - Achievement / level-up notifications.
 */
export interface NotificationSettings {
  /** Whether the daily practice reminder is enabled. */
  readonly dailyReminderEnabled: boolean;
  /** Hour of the daily reminder (0–23). Default 9. */
  readonly dailyReminderHour: number;
  /** Minute of the daily reminder (0–59). Default 0. */
  readonly dailyReminderMinute: number;
  /**
   * Which days of the week the reminder should fire.
   * Default: all 7 days (Mon–Sun).
   */
  readonly dailyReminderDays: readonly DayOfWeek[];
  /** Whether streak-break warnings are enabled. */
  readonly streakReminderEnabled: boolean;
  /** Hour at which to check for streak-break and send a warning (0–23). Default 20. */
  readonly streakReminderHour: number;
  /** Whether achievement / level-up notifications are shown. */
  readonly achievementEnabled: boolean;
  /** Whether the OS notification permission has been granted. Runtime state. */
  readonly permissionGranted: boolean;
}

/** Russian labels for days of the week (short). */
export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  1: 'Пн',
  2: 'Вт',
  3: 'Ср',
  4: 'Чт',
  5: 'Пт',
  6: 'Сб',
  7: 'Вс',
};

/** Full Russian labels for days of the week. */
export const DAY_OF_WEEK_FULL_LABELS: Record<DayOfWeek, string> = {
  1: 'Понедельник',
  2: 'Вторник',
  3: 'Среда',
  4: 'Четверг',
  5: 'Пятница',
  6: 'Суббота',
  7: 'Воскресенье',
};

// ---------------------------------------------------------------------------
// Safety & consent
// ---------------------------------------------------------------------------

/**
 * Tracks medical-safety consent state.
 * Some practices have contraindications (e.g. epilepsy + binaural beats);
 * the user must explicitly accept the disclaimer before accessing them.
 */
export interface SafetyState {
  /** Whether the general disclaimer has been accepted. */
  readonly disclaimerAccepted: boolean;
  /** Version string of the last accepted disclaimer (for update detection). */
  readonly disclaimerVersion: string;
  /**
   * Per-practice consent map.
   * Key = practiceId, value = whether the user has accepted the
   * practice-specific contraindication warning.
   */
  readonly consentGivenFor: Readonly<Record<string, boolean>>;
}
