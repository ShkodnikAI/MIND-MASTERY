/**
 * @file Session, journal, and progress type definitions.
 *
 * Models the complete lifecycle of a meditation session from scheduling
 * through playback to archival (records, journal, and aggregated progress).
 */

// ---------------------------------------------------------------------------
// Session phase & status
// ---------------------------------------------------------------------------

/**
 * Canonical phases of a meditation session, derived from hypnotherapy
 * and guided-meditation literature. Each phase maps to a distinct UI state
 * and set of audio-visual behaviours.
 */
export type SessionPhase =
  | 'preparation'
  | 'induction'
  | 'deepening'
  | 'work'
  | 'integration'
  | 'reorientation';

/** Runtime status of an active or completed session. */
export type SessionStatus = 'idle' | 'playing' | 'paused' | 'finished' | 'error';

// ---------------------------------------------------------------------------
// Active session
// ---------------------------------------------------------------------------

/**
 * In-memory representation of a session that is currently in progress.
 * Consumed by the audio engine, UI overlay, and timer logic.
 */
export interface ActiveSession {
  /** Unique runtime session identifier. */
  readonly id: string;
  /** Which practice is being executed. */
  readonly practiceId: string;
  /** Which system the practice belongs to. */
  readonly systemId: string;
  /** Timestamp when the session was started. */
  readonly startedAt: Date;
  /** Index into the practice's segment array of the currently playing segment. */
  currentSegmentIndex: number;
  /** Current playback status. */
  status: SessionStatus;
  /** Which session phase we are currently in. */
  phase: SessionPhase;
  /** Elapsed time in milliseconds since session start. */
  elapsedMs: number;
  /** Total planned duration in milliseconds for the chosen length preset. */
  readonly totalDurationMs: number;
  /** Which session-length preset was selected by the user. */
  readonly length: 'short' | 'medium' | 'full';
}

// ---------------------------------------------------------------------------
// Persisted records
// ---------------------------------------------------------------------------

/**
 * Database record persisted after a session ends (completed or abandoned).
 * Used for analytics, streaks, and achievement tracking.
 */
export interface SessionRecord {
  /** Unique record identifier (UUID). */
  readonly id: string;
  /** Practice that was executed. */
  readonly practiceId: string;
  /** System the practice belongs to. */
  readonly systemId: string;
  /** When the session started. */
  readonly startedAt: Date;
  /** When the session ended. */
  readonly endedAt: Date;
  /** Actual duration in milliseconds. */
  readonly durationMs: number;
  /** Whether the user completed the full session (did not exit early). */
  readonly completed: boolean;
  /** User's self-reported rating after the session, range [1, 5]. */
  readonly rating: number;
  /** User's mood label after the session (e.g. 'calm', 'energised'). */
  readonly mood: string;
  /** Free-text notes the user entered post-session. */
  readonly notes: string;
  /** Row creation timestamp. */
  readonly createdAt: Date;
}

/**
 * A journal entry created by the user after a session, or independently.
 * Enriches SessionRecord with editable text content.
 */
export interface JournalEntry {
  /** Unique entry identifier (UUID). */
  readonly id: string;
  /** Foreign key to the originating SessionRecord, if any. */
  readonly sessionRecordId: string;
  /** Denormalised practice title for display without joins. */
  readonly practiceTitle: string;
  /** Denormalised system name for display without joins. */
  readonly systemName: string;
  /** Date the entry was written. */
  readonly date: Date;
  /** Session duration in minutes (0 for standalone entries). */
  readonly durationMin: number;
  /** Mood label associated with this entry. */
  readonly mood: string;
  /** Main body text of the journal entry. */
  notes: string;
  /** Row creation timestamp. */
  readonly createdAt: Date;
  /** Last modification timestamp. */
  readonly updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Progress aggregates
// ---------------------------------------------------------------------------

/**
 * Per-practice progress snapshot stored in the database.
 * Used to determine unlock status and display progress bars.
 */
export interface PracticeProgress {
  /** Practice identifier. */
  readonly practiceId: string;
  /** How many times this practice has been fully completed. */
  completedCount: number;
  /** Cumulative minutes spent in this practice. */
  totalDurationMin: number;
  /** Timestamp of the last completed session, or null if never completed. */
  lastCompletedAt: Date | null;
  /** Current numeric level for this practice (derived from progression rules). */
  currentLevel: number;
  /** Whether the user meets the requirements to start this practice. */
  isUnlocked: boolean;
}

/**
 * Per-system progress summary used by the home screen and stats views.
 * Computed (or cached) from individual PracticeProgress records.
 */
export interface SystemProgress {
  /** System identifier. */
  readonly systemId: string;
  /** Total number of practices in this system. */
  readonly totalPractices: number;
  /** Number of practices the user has unlocked. */
  unlockedPractices: number;
  /** Highest level achieved across all practices in this system. */
  currentMaxLevel: number;
  /** Cumulative session minutes in this system. */
  totalSessionMin: number;
  /** Consecutive-day streak for sessions in this system. */
  streakDays: number;
  /** Date of the last session in this system, or null if never practiced. */
  lastSessionDate: Date | null;
}
