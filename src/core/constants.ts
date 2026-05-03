/**
 * App-wide constants.
 * Single source of truth for magic numbers and configuration values.
 */

/** Default Moment of Power notification window start (07:00 in minutes) */
export const DEFAULT_MOMENT_WINDOW_START = 420;

/** Default Moment of Power notification window end (22:00 in minutes) */
export const DEFAULT_MOMENT_WINDOW_END = 1320;

/** Maximum number of scheduled notifications (iOS limit) */
export const MAX_NOTIFICATIONS = 64;

/** Preset session lengths with minimum segment counts and Russian labels */
export const SESSION_LENGTHS = {
  short: { minSegments: 3, label: 'Короткая' },
  medium: { minSegments: 5, label: 'Средняя' },
  full: { minSegments: 8, label: 'Полная' },
} as const;

/** Valid binaural beat frequency range in Hz */
export const BINAURAL_RANGE = { min: 1, max: 40 } as const;

/** Light entrainment intensity range (0 = off, 1 = max) */
export const LIGHT_INTENSITY_RANGE = { min: 0, max: 1 } as const;
