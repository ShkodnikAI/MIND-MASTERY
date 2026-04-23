/**
 * Time formatting and conversion utilities.
 */

/**
 * Format milliseconds as "MM:SS" timer display.
 * Example: 754000 → "12:34"
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Format minutes as Russian human-readable string.
 * Example: 83 → "1ч 23мин"
 */
export function formatMinutes(min: number): string {
  const hours = Math.floor(min / 60);
  const minutes = min % 60;
  if (hours === 0) {
    return `${minutes}мин`;
  }
  if (minutes === 0) {
    return `${hours}ч`;
  }
  return `${hours}ч ${minutes}мин`;
}

/** Convert minutes to milliseconds. */
export function minutesToMs(min: number): number {
  return min * 60 * 1000;
}

/** Convert milliseconds to minutes (rounded down). */
export function msToMinutes(ms: number): number {
  return Math.floor(ms / 60000);
}

/** Convert an hour (0–23) to minutes from midnight. */
export function hourToMinutes(hour: number): number {
  return hour * 60;
}

/**
 * Convert total minutes since midnight to { hour, minute }.
 * Example: 510 → { hour: 8, minute: 30 }
 */
export function minutesToHourMin(totalMin: number): { hour: number; minute: number } {
  const hour = Math.floor(totalMin / 60);
  const minute = totalMin % 60;
  return { hour, minute };
}
