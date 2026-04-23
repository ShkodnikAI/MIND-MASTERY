/**
 * Core shared types used across the entire application.
 */

/** Telemetry marker events for session tracking */
export type MarkerEvent =
  | 'SESSION_START'
  | 'SESSION_END'
  | 'PRACTICE_HIT'
  | 'APP_ERROR';

/** A single marker segment recorded during a session */
export interface MarkerSegment {
  id: string;
  event: MarkerEvent;
  timestamp: number;
}
