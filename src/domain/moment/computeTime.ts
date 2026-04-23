/**
 * @file Moment of Power time calculation — pure functions.
 *
 * Uses the Knuth multiplicative hash (single source of truth in
 * src/core/hash/knuth.ts — see INV-1) to compute deterministic,
 * pseudo-random trigger times within a configurable daily window.
 */

import {
  computeKnuthHash,
  hashToMinuteOfDay,
} from '@/core/hash/knuth';
import {
  DEFAULT_MOMENT_WINDOW_START,
  DEFAULT_MOMENT_WINDOW_END,
} from '@/core/constants';

// ---------------------------------------------------------------------------
// Core computation
// ---------------------------------------------------------------------------

/**
 * Computes the Moment of Power trigger time for a given date.
 *
 * The result is deterministic for the same (date, seed) pair,
 * ensuring the trigger time does not change if the user checks
 * multiple times during the day.
 *
 * INV-1: hash computation is delegated to `computeKnuthHash` in
 * `src/core/hash/knuth.ts` — the single source of truth.
 *
 * @param date - The calendar date for which to compute the trigger time.
 * @param userSeed - User-specific seed for the PRNG.
 * @param windowStartMin - Earliest trigger time in minutes from midnight.
 * @param windowEndMin - Latest trigger time in minutes from midnight.
 * @returns Object with `hour` (0–23) and `minute` (0–59).
 */
export function computeMomentTime(
  date: Date,
  userSeed: number,
  windowStartMin: number = DEFAULT_MOMENT_WINDOW_START,
  windowEndMin: number = DEFAULT_MOMENT_WINDOW_END,
): { hour: number; minute: number } {
  const hash = computeKnuthHash(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    userSeed,
  );
  const totalMin = hashToMinuteOfDay(hash, windowStartMin, windowEndMin);
  return {
    hour: Math.floor(totalMin / 60),
    minute: totalMin % 60,
  };
}

/**
 * Checks whether a given time falls within the allowed notification window.
 *
 * @param hour - Hour component (0–23).
 * @param minute - Minute component (0–59).
 * @param windowStartMin - Window start in minutes from midnight.
 * @param windowEndMin - Window end in minutes from midnight.
 */
export function isWithinWindow(
  hour: number,
  minute: number,
  windowStartMin: number = DEFAULT_MOMENT_WINDOW_START,
  windowEndMin: number = DEFAULT_MOMENT_WINDOW_END,
): boolean {
  const totalMin = hour * 60 + minute;
  return totalMin >= windowStartMin && totalMin <= windowEndMin;
}

// ---------------------------------------------------------------------------
// Schedule generation
// ---------------------------------------------------------------------------

/** A single day in a Moment of Power schedule. */
export interface MomentScheduleEntry {
  /** Date string in ISO format (YYYY-MM-DD). */
  readonly date: string;
  /** Hour component of the trigger time (24h). */
  readonly hour: number;
  /** Minute component of the trigger time. */
  readonly minute: number;
}

/**
 * Generates a multi-day schedule of Moment of Power trigger times.
 *
 * Each day receives a deterministic trigger time based on the
 * (date, userSeed) pair. The schedule is suitable for pre-loading
 * into a calendar UI or for notification scheduling.
 *
 * @param startDate - First day of the schedule.
 * @param userSeed - User-specific seed for the PRNG.
 * @param days - Number of days to generate (default 30).
 * @param windowStartMin - Earliest trigger time in minutes from midnight.
 * @param windowEndMin - Latest trigger time in minutes from midnight.
 */
export function generateSchedule(
  startDate: Date,
  userSeed: number,
  days: number = 30,
  windowStartMin: number = DEFAULT_MOMENT_WINDOW_START,
  windowEndMin: number = DEFAULT_MOMENT_WINDOW_END,
): MomentScheduleEntry[] {
  const schedule: MomentScheduleEntry[] = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);

    const time = computeMomentTime(d, userSeed, windowStartMin, windowEndMin);

    schedule.push({
      date: d.toISOString().split('T')[0], // YYYY-MM-DD
      hour: time.hour,
      minute: time.minute,
    });
  }

  return schedule;
}

/**
 * Formats a MomentScheduleEntry as a human-readable time string
 * in HH:MM format. Useful for notification body text.
 */
export function formatMomentTime(entry: MomentScheduleEntry): string {
  const hourStr = String(entry.hour).padStart(2, '0');
  const minuteStr = String(entry.minute).padStart(2, '0');
  return `${hourStr}:${minuteStr}`;
}
