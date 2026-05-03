/**
 * @file MIND MASTERY — Spacing, corner radii, and animation durations.
 *
 * Use these tokens consistently across all UI components.
 * No magic numbers for padding, margin, borderRadius, or transition duration.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radii = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const durations = {
  fast: 150,
  normal: 300,
  slow: 500,
  phaseChange: 1000,
  breatheCycle: 4000,
} as const;
