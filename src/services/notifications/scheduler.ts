/**
 * @file Notification scheduler — schedules and cancels expo-notifications.
 *
 * Manages four categories of notifications:
 *  1. User-created practice reminders (multiple, with per-reminder config).
 *  2. Daily practice reminders (legacy single-reminder from settings).
 *  3. Streak-break warnings (evening check if no practice today).
 *  4. Achievement / level-up notifications (fired on demand).
 *
 * This module is the ONLY place that calls expo-notifications scheduling
 * APIs. All scheduling flows through here.
 *
 * INV-3: This module does NOT read from stores in the render path.
 * It is called imperatively from event handlers and effects.
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { logger } from '@/utils/logger';
import { useSettingsStore } from '@/store/settingsStore';
import { useProgressStore } from '@/store/progressStore';
import type { Reminder } from '@/types/reminder';
import {
  getDailyReminderMessage,
  getStreakWarningMessage,
  getAchievementMessage,
  getStreakMilestoneMessage,
  getReminderMessage,
} from './messages';

// ---------------------------------------------------------------------------
// Notification ID constants
// ---------------------------------------------------------------------------

/** Prefix for legacy daily-reminder notification IDs. Format: `remind_{dow}_{hour}_{min}` */
const LEGACY_REMIND_PREFIX = 'legacy_remind_';

/** Prefix for user-created reminder notification IDs. Format: `uremind_{reminderId}_{dow}` */
const USER_REMIND_PREFIX = 'uremind_';

/** Notification ID for the streak-warning check. */
const STREAK_WARN_ID = 'streak_warn';

/** Prefix for scheduled streak warnings. Format: `streak_{date}` */
const STREAK_PREFIX = 'streak_';

/** Prefix for achievement notification IDs. */
const ACHIEVE_PREFIX = 'achieve_';

// ---------------------------------------------------------------------------
// Permission management
// ---------------------------------------------------------------------------

/**
 * Request notification permissions from the OS.
 * Returns whether permission was granted.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    if (existingStatus === 'granted') {
      useSettingsStore.getState().setNotificationPermission(true);
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    const granted = status === 'granted';

    useSettingsStore.getState().setNotificationPermission(granted);

    if (!granted) {
      logger.warn('[notifications]', 'Permission denied by user');
    }

    return granted;
  } catch (err) {
    logger.error('[notifications]', 'Permission request failed', err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Android notification channel setup
// ---------------------------------------------------------------------------

/**
 * Set up Android notification channels (required on Android 8.0+).
 * Must be called at app startup (from _layout.tsx).
 *
 * Channels:
 *  - `default` — daily reminders (legacy)
 *  - `reminder` — user-created practice reminders
 *  - `streak` — streak warnings
 *  - `achievement` — level-up / milestones
 */
export async function setupNotificationChannels(): Promise<void> {
  try {
    if (Platform.OS !== 'android') {
      logger.debug('[notifications]', 'Notification channels skipped (not Android)');
      return;
    }

    await Notifications.setNotificationChannelAsync('default', {
      name: 'Напоминания о практике',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6C5CE7',
    });

    await Notifications.setNotificationChannelAsync('reminder', {
      name: 'Мои напоминания',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6C5CE7',
    });

    await Notifications.setNotificationChannelAsync('streak', {
      name: 'Предупреждения о серии',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 100, 200, 300],
      lightColor: '#FDCB6E',
    });

    await Notifications.setNotificationChannelAsync('achievement', {
      name: 'Достижения',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 100, 250, 100, 250],
      lightColor: '#00B894',
    });

    logger.info('[notifications]', 'Android channels created');
  } catch (err) {
    logger.warn('[notifications]', 'Notification channels not available on this platform');
  }
}

// ---------------------------------------------------------------------------
// User-created reminders (multiple)
// ---------------------------------------------------------------------------

/**
 * Schedule a single user-created reminder.
 * Creates one scheduled notification per selected day of the week.
 *
 * Each notification ID follows the format: `uremind_{reminderId}_{dow}`
 * so we can cancel all notifications for a specific reminder.
 */
export async function scheduleUserReminder(reminder: Reminder): Promise<number> {
  if (!reminder.enabled || reminder.days.length === 0) {
    return 0;
  }

  // Check permission
  const hasPermission = useSettingsStore.getState().notifications.permissionGranted;
  if (!hasPermission) {
    return 0;
  }

  const { title, body } = getReminderMessage(reminder.label);
  let scheduledCount = 0;

  // Build notification data for deep linking
  const notificationData: Record<string, string> = {
    reminderId: reminder.id,
    linkedType: reminder.linkedType,
  };
  if (reminder.linkedId) {
    notificationData.linkedId = reminder.linkedId;
  }

  for (const day of reminder.days) {
    const notificationId = `${USER_REMIND_PREFIX}${reminder.id}_${day}`;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: reminder.sound,
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
          autoDismiss: true,
          data: notificationData,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: day,
          hour: reminder.hour,
          minute: reminder.minute,
          channelId: 'reminder',
        },
        identifier: notificationId,
      });

      scheduledCount++;
    } catch (err) {
      logger.warn(
        '[notifications]',
        `Failed to schedule reminder ${reminder.id} for day ${day}`,
        err,
      );
    }
  }

  if (scheduledCount > 0) {
    logger.info(
      '[notifications]',
      `Scheduled reminder ${reminder.id}: ${scheduledCount} weekly notifications`,
    );
  }

  return scheduledCount;
}

/**
 * Cancel all scheduled notifications for a specific user-created reminder.
 */
export async function cancelUserReminder(reminderId: string): Promise<void> {
  try {
    const prefix = `${USER_REMIND_PREFIX}${reminderId}_`;
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const ids = scheduled.map((n) => n.identifier).filter((id) => id.startsWith(prefix));

    for (const id of ids) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }

    if (ids.length > 0) {
      logger.info(
        '[notifications]',
        `Cancelled ${ids.length} notifications for reminder ${reminderId}`,
      );
    }
  } catch (err) {
    logger.warn('[notifications]', `Failed to cancel reminder ${reminderId}`, err);
  }
}

/**
 * Schedule all user-created reminders from the store.
 * Cancels all existing user-reminder notifications first.
 */
export async function scheduleAllUserReminders(): Promise<void> {
  try {
    // Import dynamically to avoid circular deps
    const { useReminderStore } = await import('@/store/reminderStore');
    const reminders = useReminderStore.getState().reminders;

    if (!reminders || reminders.length === 0) {
      return;
    }

    // Cancel all existing user reminders first
    await cancelAllUserReminders();

    let totalScheduled = 0;
    for (const reminder of reminders) {
      if (reminder.enabled) {
        totalScheduled += await scheduleUserReminder(reminder);
      }
    }

    logger.info('[notifications]', `Scheduled ${totalScheduled} total user-reminder notifications`);
  } catch (err) {
    logger.warn('[notifications]', 'Failed to schedule all user reminders', err);
  }
}

/**
 * Cancel ALL user-created reminder notifications.
 */
export async function cancelAllUserReminders(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const ids = scheduled
      .map((n) => n.identifier)
      .filter((id) => id.startsWith(USER_REMIND_PREFIX));

    for (const id of ids) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }

    if (ids.length > 0) {
      logger.info('[notifications]', `Cancelled ${ids.length} user-reminder notifications`);
    }
  } catch (err) {
    logger.warn('[notifications]', 'Failed to cancel all user reminders', err);
  }
}

// ---------------------------------------------------------------------------
// Legacy daily reminders (single reminder from settings)
// ---------------------------------------------------------------------------

/**
 * Schedule all daily reminders for the week based on current settings.
 * Cancels any previously scheduled daily reminders before creating new ones.
 *
 * Schedules one notification per selected day of week, recurring weekly.
 */
export async function scheduleDailyReminders(): Promise<void> {
  const settings = useSettingsStore.getState().notifications;

  if (!settings.dailyReminderEnabled || !settings.permissionGranted) {
    logger.info('[notifications]', 'Daily reminders disabled or no permission');
    return;
  }

  // Cancel existing daily reminders
  await cancelAllDailyReminders();

  const { dailyReminderHour, dailyReminderMinute, dailyReminderDays } = settings;
  const { title, body } = getDailyReminderMessage();

  let scheduledCount = 0;

  for (const day of dailyReminderDays) {
    const notificationId = `${LEGACY_REMIND_PREFIX}${day}_${dailyReminderHour}_${dailyReminderMinute}`;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
          autoDismiss: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: day,
          hour: dailyReminderHour,
          minute: dailyReminderMinute,
          channelId: 'default',
        },
        identifier: notificationId,
      });

      scheduledCount++;
    } catch (err) {
      logger.warn('[notifications]', `Failed to schedule reminder for day ${day}`, err);
    }
  }

  logger.info('[notifications]', `Scheduled ${scheduledCount} legacy daily reminders`);
}

/**
 * Cancel all previously scheduled legacy daily reminders.
 */
export async function cancelAllDailyReminders(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const dailyIds = scheduled
      .map((n) => n.identifier)
      .filter((id) => id.startsWith(LEGACY_REMIND_PREFIX));

    for (const id of dailyIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }

    if (dailyIds.length > 0) {
      logger.info('[notifications]', `Cancelled ${dailyIds.length} legacy daily reminders`);
    }
  } catch (err) {
    logger.warn('[notifications]', 'Failed to cancel daily reminders', err);
  }
}

// ---------------------------------------------------------------------------
// Streak warnings
// ---------------------------------------------------------------------------

/**
 * Schedule a one-time streak-break warning for this evening.
 * Called once per day if the user hasn't practiced yet.
 *
 * The warning fires at the configured streakReminderHour.
 */
export async function scheduleStreakWarning(): Promise<void> {
  const settings = useSettingsStore.getState().notifications;

  if (!settings.streakReminderEnabled || !settings.permissionGranted) {
    return;
  }

  // Check if user has practiced today
  const state = useProgressStore.getState();
  const hasPracticedToday = checkIfPracticedToday(state);

  if (hasPracticedToday) {
    return;
  }

  // Compute current streak across all systems
  const streak = computeOverallStreak(state);

  if (streak < 2) {
    // No streak to protect
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const notificationId = `${STREAK_PREFIX}${today}`;

  const { title, body } = getStreakWarningMessage(streak);

  try {
    // Cancel previous streak warning for today if any
    await Notifications.cancelScheduledNotificationAsync(notificationId);

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        autoDismiss: false,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        channelId: 'streak',
        date: computeTriggerDate(settings.streakReminderHour),
      },
      identifier: notificationId,
    });

    logger.info(
      '[notifications]',
      `Streak warning scheduled for ${settings.streakReminderHour}:00`,
    );
  } catch (err) {
    logger.warn('[notifications]', 'Failed to schedule streak warning', err);
  }
}

/**
 * Cancel any pending streak warnings.
 */
export async function cancelStreakWarnings(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const streakIds = scheduled
      .map((n) => n.identifier)
      .filter((id) => id.startsWith(STREAK_PREFIX) || id === STREAK_WARN_ID);

    for (const id of streakIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  } catch (err) {
    logger.warn('[notifications]', 'Failed to cancel streak warnings', err);
  }
}

// ---------------------------------------------------------------------------
// Achievement notifications (fired immediately)
// ---------------------------------------------------------------------------

/**
 * Fire an immediate achievement / level-up notification.
 */
export async function notifyAchievement(
  systemName: string,
  newLevel: number,
  systemId?: string,
): Promise<void> {
  const settings = useSettingsStore.getState().notifications;

  if (!settings.achievementEnabled || !settings.permissionGranted) {
    return;
  }

  const { title, body } = getAchievementMessage(systemName, newLevel);
  const notificationId = `${ACHIEVE_PREFIX}${systemName}_level${newLevel}_${Date.now()}`;

  const data: Record<string, string> = {};
  if (systemId) {
    data.systemId = systemId;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        autoDismiss: true,
        data,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        channelId: 'achievement',
        date: new Date(Date.now() + 500), // Small delay to ensure UI is ready
      },
      identifier: notificationId,
    });
  } catch (err) {
    logger.warn('[notifications]', 'Failed to send achievement notification', err);
  }
}

/**
 * Fire an immediate streak milestone notification.
 */
export async function notifyStreakMilestone(streakDays: number): Promise<void> {
  const settings = useSettingsStore.getState().notifications;

  if (!settings.achievementEnabled || !settings.permissionGranted) {
    return;
  }

  const { title, body } = getStreakMilestoneMessage(streakDays);
  const notificationId = `${ACHIEVE_PREFIX}streak_${streakDays}_${Date.now()}`;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        autoDismiss: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        channelId: 'achievement',
        date: new Date(Date.now() + 500),
      },
      identifier: notificationId,
    });
  } catch (err) {
    logger.warn('[notifications]', 'Failed to send streak milestone', err);
  }
}

// ---------------------------------------------------------------------------
// Full reschedule
// ---------------------------------------------------------------------------

/**
 * Cancel ALL app notifications and reschedule based on current state.
 * Call this when notification settings change or app starts after boot.
 */
export async function rescheduleAllNotifications(): Promise<void> {
  // Cancel everything
  await cancelAllUserReminders();
  await cancelAllDailyReminders();
  await cancelStreakWarnings();

  // Reschedule everything
  await scheduleAllUserReminders();
  await scheduleDailyReminders();
  await scheduleStreakWarning();

  logger.info('[notifications]', 'Full reschedule complete');
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Compute a Date for today at the given hour (and minute 0).
 * If the hour has already passed today, schedule for tomorrow.
 */
function computeTriggerDate(hour: number): Date {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, 0, 0, 0);

  if (target <= now) {
    // Already passed today — schedule for tomorrow
    target.setDate(target.getDate() + 1);
  }

  return target;
}

/**
 * Check if the user has completed any session today.
 */
function checkIfPracticedToday(progressState: {
  practices: Record<
    string,
    {
      lastCompletedAt: number | null | string | null;
    }
  >;
}): boolean {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  for (const stored of Object.values(progressState.practices)) {
    if (stored.lastCompletedAt) {
      const dateStr =
        typeof stored.lastCompletedAt === 'number'
          ? new Date(stored.lastCompletedAt).toISOString().split('T')[0]
          : stored.lastCompletedAt.startsWith(today);
      if (dateStr === today) return true;
    }
  }

  return false;
}

/**
 * Compute the longest active streak across all systems.
 */
function toDateStr(ts: number | null | string | null): string | null {
  if (!ts) return null;
  if (typeof ts === 'number') return new Date(ts).toISOString().split('T')[0];
  return ts.split('T')[0];
}

function computeOverallStreak(progressState: {
  practices: Record<
    string,
    {
      lastCompletedAt: number | null | string | null;
      completedCount: number;
    }
  >;
}): number {
  let maxStreak = 0;

  for (const stored of Object.values(progressState.practices)) {
    if (!stored.lastCompletedAt || stored.completedCount === 0) continue;

    let streak = 0;
    let currentDate = new Date();

    // Walk backwards from today
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];

      // Check if any practice was completed on this date
      let found = false;
      for (const s of Object.values(progressState.practices)) {
        const sDateStr = toDateStr(s.lastCompletedAt);
        if (sDateStr && sDateStr === dateStr) {
          found = true;
          break;
        }
      }

      if (found) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }

      // Safety: don't go back more than 365 days
      if (streak > 365) break;
    }

    maxStreak = Math.max(maxStreak, streak);
  }

  return maxStreak;
}
