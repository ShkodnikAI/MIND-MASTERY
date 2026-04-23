/**
 * @file Practice unlock & progression checking — pure functions.
 *
 * Determines whether a practice can be started based on the user's
 * current progress, and provides human-readable lock reasons for
 * the UI.
 */

import type { Practice, PracticeProgress, ProgressionRule } from '@/types';

// ---------------------------------------------------------------------------
// Unlock logic
// ---------------------------------------------------------------------------

/**
 * System-level progress snapshot used to evaluate cross-practice conditions.
 */
export interface SystemProgressSnapshot {
  /** Total minutes spent across all practices in the system. */
  readonly totalSessionMin: number;
  /** Total completed sessions across all practices in the system. */
  readonly completedCount: number;
}

/**
 * Checks whether a practice is unlocked for the current user.
 *
 * Level-1 practices are always unlocked. For higher levels, the
 * per-practice `currentLevel` must meet or exceed the practice's
 * `requiredLevel`.
 */
export function isPracticeUnlocked(
  practice: Practice,
  progress: PracticeProgress | null,
  _systemProgress: SystemProgressSnapshot | null,
): boolean {
  // Level 1 practices are always unlocked
  if (practice.requiredLevel <= 1) {
    return true;
  }

  if (!progress) {
    return false;
  }

  // Check level requirement
  if (progress.currentLevel < practice.requiredLevel) {
    return false;
  }

  return true;
}

/**
 * Returns the progression rule that gates the next level, or null if
 * the user has already reached the maximum level.
 */
export function getNextLevelRequirements(
  currentLevel: number,
  rules: readonly ProgressionRule[],
): ProgressionRule | null {
  const nextRule = rules.find((r) => r.levelRequired === currentLevel + 1);
  return nextRule ?? null;
}

/**
 * Checks whether a practice should level up based on the user's
 * accumulated sessions and minutes against the next level's rules.
 *
 * Both conditions must be met (AND logic):
 * - completedSessions >= rule.minCompletedSessions
 * - totalMinutes >= rule.minTotalMinutes
 */
export function shouldLevelUp(
  currentLevel: number,
  completedSessions: number,
  totalMinutes: number,
  rules: readonly ProgressionRule[],
): boolean {
  const nextRule = getNextLevelRequirements(currentLevel, rules);
  if (!nextRule) return false;

  return (
    completedSessions >= nextRule.minCompletedSessions &&
    totalMinutes >= nextRule.minTotalMinutes
  );
}

/**
 * Returns a human-readable Russian-language explanation of why a
 * practice is locked. Returns an empty string if the practice is
 * unlocked or requires level 1.
 */
export function getLockReason(
  practice: Practice,
  progress: PracticeProgress | null,
): string {
  if (practice.requiredLevel <= 1) return '';

  if (!progress) {
    return `Пройдите практики уровня ${practice.requiredLevel - 1} для разблокировки`;
  }

  if (progress.currentLevel < practice.requiredLevel) {
    return `Требуется уровень ${practice.requiredLevel}. Текущий: ${progress.currentLevel}`;
  }

  return '';
}

/**
 * Computes the progress fraction (0–1) toward the next level for
 * display in a progress bar. Returns 1 if already at max level.
 */
export function getNextLevelProgress(
  currentLevel: number,
  completedSessions: number,
  totalMinutes: number,
  rules: readonly ProgressionRule[],
): number {
  const nextRule = getNextLevelRequirements(currentLevel, rules);
  if (!nextRule) return 1;

  const sessionFraction =
    nextRule.minCompletedSessions > 0
      ? Math.min(completedSessions / nextRule.minCompletedSessions, 1)
      : 1;

  const minutesFraction =
    nextRule.minTotalMinutes > 0
      ? Math.min(totalMinutes / nextRule.minTotalMinutes, 1)
      : 1;

  // Both conditions must be met — use the minimum of the two fractions
  return Math.min(sessionFraction, minutesFraction);
}
