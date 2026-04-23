/**
 * @file Application settings and safety / consent type definitions.
 *
 * Models the global app preferences that persist across launches,
 * and the medical-safety consent tracking required for each practice.
 */

// ---------------------------------------------------------------------------
// App settings
// ---------------------------------------------------------------------------

/** Available UI colour themes. */
export type ThemeMode = 'dark' | 'light' | 'system';

/**
 * Global application settings persisted in AsyncStorage / secure storage.
 * These are independent of any specific system or practice.
 */
export interface AppSettings {
  /** Whether the onboarding flow has been completed. */
  readonly onboarded: boolean;
  /** Primary language code. The app is Russian-first. */
  readonly language: 'ru';
  /** UI colour theme preference. */
  readonly theme: ThemeMode;
  /** Whether haptic feedback is enabled for interactions. */
  readonly hapticsEnabled: boolean;
  /**
   * Whether anonymised usage analytics are collected.
   * Default false — privacy-first.
   */
  readonly analyticsEnabled: boolean;
  /**
   * Whether the emergency-stop shortcut (triple-tap to abort session)
   * is enabled. Default true.
   */
  readonly emergencyShortcut: boolean;
}

// ---------------------------------------------------------------------------
// Safety & consent
// ---------------------------------------------------------------------------

/**
 * Tracks medical-safety consent state.
 * Some practices have contraindications (e.g. epilepsy + binaural beats);
 * the user must explicitly accept the disclaimer before accessing them.
 */
export interface SafetyState {
  /** Whether the general disclaimer has been accepted. */
  readonly disclaimerAccepted: boolean;
  /** Version string of the last accepted disclaimer (for update detection). */
  readonly disclaimerVersion: string;
  /**
   * Per-practice consent map.
   * Key = practiceId, value = whether the user has accepted the
   * practice-specific contraindication warning.
   */
  readonly consentGivenFor: Readonly<Record<string, boolean>>;
}
