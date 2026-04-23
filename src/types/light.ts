/**
 * @file Light / hardware type definitions.
 *
 * Models the smart-light integration including themes, effects,
 * entrainment safety limits, and chakra-cycle configuration.
 */

// ---------------------------------------------------------------------------
// Light themes & effects
// ---------------------------------------------------------------------------

/**
 * Predefined light themes that map to colour palettes for smart bulbs.
 * Each theme is calibrated for a specific mood or system.
 */
export type LightThemeId =
  | 'cosmic'
  | 'ocean'
  | 'forest'
  | 'sunset'
  | 'golden'
  | 'aurora'
  | 'crystal';

/**
 * Available light effects driven by the session phase or user preference.
 * - `off` — lights remain uncontrolled.
 * - `glow` — steady ambient glow.
 * - `pulse` — slow rhythmic pulsing.
 * - `breathe` — inhale/exhale-synced brightness changes.
 * - `entrainment` — frequency-synced flicker for brainwave entrainment.
 * - `chakra-flow` — sequential colour cycling through chakra spectrum.
 */
export type LightEffect =
  | 'glow'
  | 'pulse'
  | 'breathe'
  | 'entrainment'
  | 'chakra-flow'
  | 'off';

// ---------------------------------------------------------------------------
// Light configuration
// ---------------------------------------------------------------------------

/**
 * Master light configuration persisted in user settings.
 * Controls whether smart-light integration is active and how it behaves.
 */
export interface LightConfig {
  /** Whether smart-light integration is enabled. */
  readonly enabled: boolean;
  /** Currently selected colour theme. */
  readonly theme: LightThemeId;
  /** Currently selected light effect. */
  readonly effect: LightEffect;
  /** Brightness / intensity of the light effect. Range [0, 1]. */
  readonly intensity: number;
  /**
   * Whether to automatically switch to a dim theme outside active hours.
   * When true, the light effect transitions to a low-intensity warm tone.
   */
  readonly autoNightMode: boolean;
  /** Hour of day (24h) when night mode begins. Default 22. */
  readonly nightStartHour: number;
  /** Hour of day (24h) when night mode ends. Default 7. */
  readonly nightEndHour: number;
}

// ---------------------------------------------------------------------------
// Entrainment safety
// ---------------------------------------------------------------------------

/**
 * Configuration for light-based brainwave entrainment.
 * Includes safety constraints to prevent harmful flicker frequencies.
 */
export interface EntrainmentConfig {
  /** Whether entrainment mode is available for use. */
  readonly enabled: boolean;
  /** Target frequency in Hz for the entrainment effect. */
  readonly targetHz: number;
  /**
   * Maximum supported frequency for the connected hardware.
   * Used to validate `targetHz` does not exceed safe limits.
   */
  readonly maxSupportedHz: number;
  /** Whether the safety-warning modal has been shown and acknowledged. */
  readonly safetyWarningShown: boolean;
}

// ---------------------------------------------------------------------------
// Chakra cycle
// ---------------------------------------------------------------------------

/**
 * Configuration for the chakra-flow light effect.
 * Cycles through seven chakra colours at a configurable pace.
 */
export interface ChakraConfig {
  /** Whether the chakra-flow effect is enabled. */
  readonly enabled: boolean;
  /** Seconds spent on each chakra before transitioning to the next. */
  readonly speedSecPerChakra: number;
  /** Index (0–6) of the currently highlighted chakra. */
  readonly currentChakraIndex: number;
}
