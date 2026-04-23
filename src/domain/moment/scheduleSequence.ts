/**
 * @file 30-day foreground notification scheduling — pure functions.
 *
 * Generates a schedule of Moment of Power notification payloads,
 * respecting the iOS limit of 64 pending notifications and avoiding
 * duplicates with already-scheduled dates.
 */

import type { MomentSettings } from '@/types';
import { computeMomentTime } from './computeTime';
import { MAX_NOTIFICATIONS } from '@/core/constants';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single scheduled Moment of Power notification. */
export interface ScheduledMoment {
  /** Date string in ISO format (YYYY-MM-DD). */
  readonly date: string;
  /** Hour component of the trigger time (24h). */
  readonly hour: number;
  /** Minute component of the trigger time. */
  readonly minute: number;
  /** Unique identifier for the notification (used for cancellation). */
  readonly notificationId: string;
}

// ---------------------------------------------------------------------------
// Schedule generation
// ---------------------------------------------------------------------------

/**
 * Generates a schedule of Moment notifications, limited by
 * `MAX_NOTIFICATIONS` (64 on iOS) and the number of not-yet-scheduled
 * dates.
 *
 * @param settings - User's Moment of Power settings (window, seed).
 * @param startDate - First day to consider for scheduling.
 * @param existingScheduledDates - ISO date strings already scheduled
 *   (to avoid duplicates).
 * @param daysToSchedule - Maximum number of new days to schedule.
 * @returns Array of scheduled moments ready for notification registration.
 */
export function scheduleSequence(
  settings: MomentSettings,
  startDate: Date,
  existingScheduledDates: readonly string[] = [],
  daysToSchedule: number = 30,
): ScheduledMoment[] {
  const windowStart = settings.windowStartHour * 60;
  const windowEnd = settings.windowEndHour * 60;
  const existingSet = new Set(existingScheduledDates);
  const scheduled: ScheduledMoment[] = [];
  const maxNew = Math.min(
    daysToSchedule,
    MAX_NOTIFICATIONS - existingScheduledDates.length,
  );

  let dayOffset = 0;
  while (scheduled.length < maxNew) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + dayOffset);
    const dateStr = d.toISOString().split('T')[0];

    if (!existingSet.has(dateStr)) {
      const time = computeMomentTime(d, settings.userSeed, windowStart, windowEnd);

      scheduled.push({
        date: dateStr,
        hour: time.hour,
        minute: time.minute,
        notificationId: `moment_${dateStr}_${time.hour}_${time.minute}`,
      });
    }

    dayOffset++;

    // Safety: don't loop forever if all dates are already scheduled
    if (dayOffset > daysToSchedule + 60) break;
  }

  return scheduled;
}

// ---------------------------------------------------------------------------
// Limit validation
// ---------------------------------------------------------------------------

/** Result of a notification-scheduling limit check. */
export interface SchedulingLimitResult {
  /** Whether new notifications can be scheduled. */
  readonly canSchedule: boolean;
  /** How many notification slots remain available. */
  readonly remaining: number;
  /** Optional warning message for the user (Russian). */
  readonly warning: string | undefined;
}

/**
 * Validates whether there is room to schedule more notifications,
 * accounting for the platform limit.
 *
 * @param scheduledCount - Current number of pending notifications.
 */
export function validateSchedulingLimits(
  scheduledCount: number,
): SchedulingLimitResult {
  const remaining = MAX_NOTIFICATIONS - scheduledCount;

  if (remaining <= 0) {
    return {
      canSchedule: false,
      remaining: 0,
      warning: `Достигнут лимит уведомлений (${MAX_NOTIFICATIONS}). Старые уведомления будут перезаписаны.`,
    };
  }

  if (remaining < 10) {
    return {
      canSchedule: true,
      remaining,
      warning: `Осталось ${remaining} из ${MAX_NOTIFICATIONS} доступных уведомлений.`,
    };
  }

  return {
    canSchedule: true,
    remaining,
    warning: undefined,
  };
}
