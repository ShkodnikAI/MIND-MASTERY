/**
 * @file Progression and achievement type definitions.
 *
 * Models the rules that govern practice unlocking, level advancement,
 * and achievement tracking across the app.
 */

// ---------------------------------------------------------------------------
// Progression rules
// ---------------------------------------------------------------------------

/**
 * A single rule that must be satisfied for a practice level to unlock.
 * All rules for a given level are AND-combined: the user must meet
 * every condition to advance.
 */
export interface ProgressionRule {
  /** The level this rule gates. Level 1 is always unlocked. */
  readonly levelRequired: number;
  /** Minimum number of completed sessions (any practice in the system). */
  readonly minCompletedSessions: number;
  /** Minimum cumulative practice time in minutes. */
  readonly minTotalMinutes: number;
  /** Human-readable description shown in the progress UI. */
  readonly description: string;
}

/**
 * Snapshot of a user's progression state for a single practice.
 * Computed from SessionRecord history and compared against ProgressionRule.
 */
export interface ProgressionState {
  /** Practice identifier. */
  readonly practiceId: string;
  /** Current level achieved for this practice. */
  readonly level: number;
  /** Total number of completed sessions for this practice. */
  readonly completedSessions: number;
  /** Total minutes spent in this practice across all sessions. */
  readonly totalMinutes: number;
  /** When this practice was unlocked, or null if still locked. */
  readonly unlockedAt: Date | null;
}

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------

/**
 * All possible achievement types.
 * Each maps to a specific milestone in the user's meditation journey.
 */
export type AchievementType =
  | 'first_session'
  | 'streak_7'
  | 'streak_30'
  | 'all_beginner'
  | 'level_5'
  | 'total_100_min'
  | 'all_systems';

/**
 * Represents a single achievement and the user's progress toward unlocking it.
 */
export interface Achievement {
  /** Which achievement this represents. */
  readonly type: AchievementType;
  /** When the achievement was unlocked, or null if still in progress. */
  readonly unlockedAt: Date | null;
  /** Progress toward unlocking, normalised to [0, 1]. 1.0 = complete. */
  readonly progress: number;
}
