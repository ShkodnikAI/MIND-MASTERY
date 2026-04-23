/**
 * @file Notification scheduler — schedules and cancels expo-notifications.
 *
 * Manages three categories of notifications:
 *  1. Daily practice reminders (user-chosen time, selected days).
 *  2. Streak-break warnings (evening check if no practice today).
 *  3. Achievement / level-up notifications (fired on demand).
 *
 * This module is the ONLY place that calls expo-notifications scheduling
 * APIs. All scheduling flows through here.
 *
 * INV-3: This module does NOT read from stores in the render path.
 * It is called imperatively from event handlers and effects.
 */

import * as Notifications from 'expo-notifications';
import { logger } from '@/utils/logger';
import { useSettingsStore } from '@/store/settingsStore';
import { useProgressStore } from '@/store/progressStore';
import {
  getDailyReminderMessage,
  getStreakWarningMessage,
  getAchievementMessage,
  getStreakMilestoneMessage,
} from './messages';

// ---------------------------------------------------------------------------
// Notification ID constants
// ---------------------------------------------------------------------------

/** Prefix for daily-reminder notification IDs. Format: `remind_{dow}_{hour}_{min}` */
const REMIND_PREFIX = 'remind_';

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
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

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
 *  - `default` — daily reminders
 *  - `streak` — streak warnings
 *  - `achievement` — level-up / milestones
 */
export async function setupNotificationChannels(): Promise<void> {
  try {
    const { default: setChannel } = await import(
      'expo-notifications/build/setNotificationChannelAsync'
    );

    await setChannel('default', {
      name: 'Напоминания о практике',
      importance: 4, // IMPORTANCE_DEFAULT
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6C5CE7',
    });

    await setChannel('streak', {
      name: 'Предупреждения о серии',
      importance: 5, // IMPORTANCE_HIGH
      vibrationPattern: [0, 100, 200, 300],
      lightColor: '#FDCB6E',
    });

    await setChannel('achievement', {
      name: 'Достижения',
      importance: 5, // IMPORTANCE_HIGH
      vibrationPattern: [0, 250, 100, 250, 100, 250],
      lightColor: '#00B894',
    });

    logger.info('[notifications]', 'Android channels created');
  } catch (err) {
    logger.warn('[notifications]', 'Notification channels not available on this platform');
  }
}

// ---------------------------------------------------------------------------
// Daily reminders
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
    const notificationId = `${REMIND_PREFIX}${day}_${dailyReminderHour}_${dailyReminderMinute}`;

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

  logger.info('[notifications]', `Scheduled ${scheduledCount} daily reminders`);
}

/**
 * Cancel all previously scheduled daily reminders.
 */
export async function cancelAllDailyReminders(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const dailyIds = scheduled
      .map((n) => n.identifier)
      .filter((id) => id.startsWith(REMIND_PREFIX));

    for (const id of dailyIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }

    if (dailyIds.length > 0) {
      logger.info('[notifications]', `Cancelled ${dailyIds.length} daily reminders`);
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

    logger.info('[notifications]', `Streak warning scheduled for ${settings.streakReminderHour}:00`);
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
): Promise<void> {
  const settings = useSettingsStore.getState().notifications;

  if (!settings.achievementEnabled || !settings.permissionGranted) {
    return;
  }

  const { title, body } = getAchievementMessage(systemName, newLevel);
  const notificationId = `${ACHIEVE_PREFIX}${systemName}_level${newLevel}_${Date.now()}`;

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
 * Cancel all app notifications and reschedule based on current settings.
 * Call this when any notification setting changes.
 */
export async function rescheduleAllNotifications(): Promise<void> {
  await cancelAllDailyReminders();
  await cancelStreakWarnings();
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
  practices: Record<string, {
    lastCompletedAt: string | null;
  }>;
}): boolean {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  for (const stored of Object.values(progressState.practices)) {
    if (stored.lastCompletedAt && stored.lastCompletedAt.startsWith(today)) {
      return true;
    }
  }

  return false;
}

/**
 * Compute the longest active streak across all systems.
 */
function computeOverallStreak(progressState: {
  practices: Record<string, {
    lastCompletedAt: string | null;
    completedCount: number;
  }>;
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
        if (s.lastCompletedAt && s.lastCompletedAt.startsWith(dateStr)) {
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
