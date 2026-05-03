/**
 * @file DFP Persistent Reminders — Auto-creates hourly reminders for DFP module.
 *
 * On first visit to the DFP tab, creates 7 reminders (every 2 hours from 08:00
 * to 20:00) linked to the domfreq system. Uses the existing reminderStore +
 * scheduler infrastructure.
 *
 * The user can manage these reminders like any other in the Reminders screen.
 */

import { useReminderStore } from '@/store/reminderStore';
import { scheduleUserReminder } from '@/services/notifications/scheduler';
import { requestNotificationPermission } from '@/services/notifications/scheduler';
import { logger } from '@/utils/logger';

// ─── Constants ──────────────────────────────────────────────────────

/** Label prefix used to identify auto-created DFP reminders. */
const DFP_LABEL_PREFIX = 'DFP ';

/** Reminder hours — every 2 hours from 08:00 to 20:00. */
const DFP_REMINDER_HOURS = [8, 10, 12, 14, 16, 18, 20] as const;

/** All 7 days of the week. */
const ALL_DAYS = [1, 2, 3, 4, 5, 6, 7] as const;

/** Custom messages for DFP reminders (more specific than generic). */
const DFP_REMINDER_LABELS: Record<number, string> = {
  8: 'DFP Утренняя настройка',
  10: 'DFP Проверка частоты',
  12: 'DFP Полуденная проекция',
  14: 'DFP После обеда',
  16: 'DFP Вторая половина дня',
  18: 'DFP Вечерняя практика',
  20: 'DFP Ночная интеграция',
};

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Check whether DFP auto-reminders have already been created.
 * Looks for reminders whose label starts with the DFP prefix.
 */
function hasDomfreqReminders(): boolean {
  const reminders = useReminderStore.getState().reminders;
  if (!reminders) return false;
  return reminders.some((r) => r.label.startsWith(DFP_LABEL_PREFIX));
}


/**
 * Ensure DFP persistent reminders exist.
 *
 * Call this when the user first visits the DFP tab.
 * - If DFP reminders already exist, does nothing.
 * - If not, requests notification permission and creates reminders
 *   for every 2 hours (08:00–20:00) on all days of the week.
 *
 * Returns the number of reminders created (0 if already set up).
 */
export async function ensureDomfreqReminders(): Promise<number> {
  try {
    // Already set up?
    if (hasDomfreqReminders()) {
      logger.info('[dfpReminders]', 'DFP reminders already exist — skipping');
      return 0;
    }

    // Check if we have room (limit is 10 total)
    const existingCount = useReminderStore.getState().reminders?.length ?? 0;
    const availableSlots = 10 - existingCount;
    if (availableSlots <= 0) {
      logger.info('[dfpReminders]', `No reminder slots available (${existingCount}/10 used)`);
      return 0;
    }

    // Request permission
    const granted = await requestNotificationPermission();
    if (!granted) {
      logger.info('[dfpReminders]', 'Notification permission denied — skipping');
      return 0;
    }

    let createdCount = 0;
    // Only create as many as we have slots for
    const hoursToCreate = DFP_REMINDER_HOURS.slice(0, availableSlots);

    for (const hour of hoursToCreate) {
      try {
        const label = DFP_REMINDER_LABELS[hour];

        const reminder = await useReminderStore.getState().addReminder({
          label,
          hour,
          minute: 0,
          days: ALL_DAYS,
          enabled: true,
          sound: true,
          linkedType: 'system',
          linkedId: 'domfreq',
        });

        // Schedule the notification
        await scheduleUserReminder(reminder);
        createdCount++;
      } catch (err) {
        logger.warn(
          '[dfpReminders]',
          `Failed to create reminder for ${hour}:00`,
          err,
        );
      }
    }

    if (createdCount > 0) {
      logger.info(
        '[dfpReminders]',
        `Created ${createdCount} DFP reminders (every 2h from 08:00–20:00)`,
      );
    }

    return createdCount;
  } catch (err) {
    logger.error('[dfpReminders]', 'Failed to ensure DFP reminders', err);
    return 0;
  }
}

/**
 * Remove all auto-created DFP reminders.
 * Useful for cleanup or if the user disables DFP reminders.
 */
export async function removeDomfreqReminders(): Promise<number> {
  const reminders = useReminderStore.getState().reminders;
  if (!reminders) return 0;

  const dfpReminders = reminders.filter((r) => r.label.startsWith(DFP_LABEL_PREFIX));
  let removedCount = 0;

  for (const reminder of dfpReminders) {
    try {
      // Cancel scheduled notifications first
      const { cancelUserReminder } = await import('@/services/notifications/scheduler');
      await cancelUserReminder(reminder.id);

      // Remove from store + SQLite
      await useReminderStore.getState().removeReminder(reminder.id);
      removedCount++;
    } catch (err) {
      logger.warn('[dfpReminders]', `Failed to remove reminder ${reminder.id}`, err);
    }
  }

  if (removedCount > 0) {
    logger.info('[dfpReminders]', `Removed ${removedCount} DFP reminders`);
  }

  return removedCount;
}
