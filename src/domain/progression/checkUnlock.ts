/**
 * @file Practice unlock & progression checking — pure functions.
 *
 * Determines whether a practice can be started based on the user's
 * system-level progress, and provides human-readable lock reasons for
 * the UI.
 *
 * Architecture note:
 *   Progression rules live on the System level (not per-practice).
 *   A practice's `requiredLevel` maps to a `ProgressionRule.levelRequired`
 *   in its parent system's progression array.
 *   System-level stats (completed sessions, total minutes) are aggregated
 *   from all SessionRecords for that system.
 */

import type { Practice, PracticeProgress, ProgressionRule } from '@/types';

// ---------------------------------------------------------------------------
// System-level progress snapshot
// ---------------------------------------------------------------------------

/**
 * Immutable snapshot of a user's progress within a system.
 * Computed from SessionRecord history by the progress store / repository.
 * Passed to unlock-checking functions to evaluate gating conditions.
 */
export interface SystemProgressSnapshot {
  /** Total minutes spent across ALL practices in this system. */
  readonly totalSessionMin: number;
  /** Total completed sessions across ALL practices in this system. */
  readonly completedCount: number;
  /** Progression rules from the System definition (used to evaluate gates). */
  readonly progressionRules: readonly ProgressionRule[];
}

// ---------------------------------------------------------------------------
// Level computation
// ---------------------------------------------------------------------------

/**
 * Computes the user's current level within a system based on their stats.
 *
 * Iterates through progression rules from highest to lowest, finding the
 * first level whose conditions (sessions AND minutes) are fully met.
 * Falls back to level 1 (always unlocked baseline).
 *
 * @param completedSessions - Total completed sessions across the system
 * @param totalMinutes      - Total practice minutes across the system
 * @param rules             - Ordered ProgressionRule[] from the System definition
 * @returns The highest level the user has achieved (minimum 1)
 */
export function computeSystemLevel(
  completedSessions: number,
  totalMinutes: number,
  rules: readonly ProgressionRule[],
): number {
  let achievedLevel = 1;

  for (const rule of rules) {
    if (
      completedSessions >= rule.minCompletedSessions &&
      totalMinutes >= rule.minTotalMinutes
    ) {
      achievedLevel = rule.levelRequired;
    }
  }

  return achievedLevel;
}

// ---------------------------------------------------------------------------
// Unlock logic
// ---------------------------------------------------------------------------

/**
 * Checks whether a practice is unlocked for the current user.
 *
 * Level-1 practices are always unlocked. For higher levels, the
 * system-level stats must meet the corresponding ProgressionRule
 * (both minCompletedSessions AND minTotalMinutes).
 *
 * @param practice      - The practice to check
 * @param _practiceProgress - Per-practice progress (reserved for future per-practice gating)
 * @param systemProgress - System-level progress snapshot with rules
 */
export function isPracticeUnlocked(
  practice: Practice,
  _practiceProgress: PracticeProgress | null,
  systemProgress: SystemProgressSnapshot | null,
): boolean {
  // Level 1 practices are always unlocked
  if (practice.requiredLevel <= 1) {
    return true;
  }

  if (!systemProgress) {
    return false;
  }

  // Find the rule that gates this practice's level
  const rule = systemProgress.progressionRules.find(
    (r) => r.levelRequired === practice.requiredLevel,
  );

  // No rule for this level means it's unlocked (shouldn't happen in practice)
  if (!rule) {
    return true;
  }

  // Both conditions must be met (AND logic)
  return (
    systemProgress.completedCount >= rule.minCompletedSessions &&
    systemProgress.totalSessionMin >= rule.minTotalMinutes
  );
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
 * Checks whether the user should level up based on accumulated stats.
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
  systemProgress: SystemProgressSnapshot | null,
): string {
  if (practice.requiredLevel <= 1) return '';

  if (!systemProgress) {
    return `Пройдите практики уровня ${practice.requiredLevel - 1} для разблокировки`;
  }

  const rule = systemProgress.progressionRules.find(
    (r) => r.levelRequired === practice.requiredLevel,
  );

  if (!rule) return '';

  const missingSessions = Math.max(0, rule.minCompletedSessions - systemProgress.completedCount);
  const missingMinutes = Math.max(0, rule.minTotalMinutes - systemProgress.totalSessionMin);

  const parts: string[] = [];
  if (missingSessions > 0) {
    parts.push(`ещё ${missingSessions} ${pluralizeSessions(missingSessions)}`);
  }
  if (missingMinutes > 0) {
    parts.push(`${missingMinutes} мин. практики`);
  }

  return `Для уровня ${practice.requiredLevel} нужно: ${parts.join(' и ')}`;
}

/**
 * Computes the progress fraction (0–1) toward the next level for
 * display in a progress bar. Returns 1 if already at max level.
 *
 * Uses the minimum of session-fraction and minutes-fraction (both
 * conditions must be met).
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Simple Russian pluralization for session count.
 * Handles: 1 практику, 2-4 практики, 5-20 практик, 21 практику...
 */
function pluralizeSessions(count: number): string {
  if (count === 1) return 'практику';
  if (count >= 2 && count <= 4) return 'практики';
  if (count >= 5 && count <= 20) return 'практик';
  // For 21+, use modulo pattern
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'практику';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'практики';
  return 'практик';
}
