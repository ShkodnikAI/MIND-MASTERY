/**
 * @file "Moment of Stillness" feature type definitions.
 *
 * Models the daily micro-meditation reminder that triggers at a
 * pseudo-random time within a configured window, using a user-seeded
 * PRNG so the time is deterministic per day but unpredictable.
 */

// ---------------------------------------------------------------------------
// Moment configuration
// ---------------------------------------------------------------------------

/**
 * User-facing settings for the Moment of Stillness feature.
 * Controls the daily notification window, sound, and activation state.
 */
export interface MomentSettings {
  /** Whether the Moment of Stillness feature is active. */
  readonly enabled: boolean;
  /**
   * Earliest hour (24h) at which the moment may trigger.
   * Default 7 (07:00).
   */
  readonly windowStartHour: number;
  /**
   * Latest hour (24h) at which the moment may trigger.
   * Default 22 (22:00).
   */
  readonly windowEndHour: number;
  /** Whether an audio cue plays when the moment triggers. */
  readonly soundEnabled: boolean;
  /** Asset identifier for the notification sound. */
  readonly soundTrackId: string;
  /**
   * User-specific seed for the deterministic PRNG.
   * Ensures the random trigger time is stable per day but not guessable.
   */
  readonly userSeed: number;
  /** Whether the moment has already been triggered today. */
  readonly isActiveToday: boolean;
}

// ---------------------------------------------------------------------------
// Moment records
// ---------------------------------------------------------------------------

/**
 * Database record for a single scheduled Moment of Stillness.
 * One row is created per day when the feature is enabled.
 */
export interface MomentRecord {
  /** Unique record identifier (UUID). */
  readonly id: string;
  /** The date this moment was scheduled for (local calendar date). */
  readonly scheduledDate: Date;
  /** When the notification actually fired, or null if not yet triggered. */
  readonly triggeredAt: Date | null;
  /** Actual hour the moment triggered (null if not yet triggered). */
  readonly actualHour: number | null;
  /** Actual minute the moment triggered (null if not yet triggered). */
  readonly actualMinute: number | null;
  /** Whether the user opened / interacted with the moment notification. */
  readonly wasPlayed: boolean;
}

/**
 * A lightweight calendar-day representation used for computing
 * deterministic trigger times with the user-seeded PRNG.
 */
export interface MomentDay {
  /** Date string in ISO format (YYYY-MM-DD). */
  readonly date: string;
  /** Hour component of the scheduled trigger time (24h). */
  readonly hour: number;
  /** Minute component of the scheduled trigger time. */
  readonly minute: number;
  /** Whether the moment has been triggered on this day. */
  readonly triggered: boolean;
}
