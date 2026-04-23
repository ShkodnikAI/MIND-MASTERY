/**
 * @file Core content type definitions for the MIND MASTERY practice system.
 *
 * Defines the foundational content model including systems, practices,
 * segments (discriminated union), visual signatures, and theory structures.
 * These types are referenced by nearly every other module in the app.
 */

import type { SessionPhase } from './session';
import type { ProgressionRule } from './progression';

// ---------------------------------------------------------------------------
// Primitive unions
// ---------------------------------------------------------------------------

/** Identifies one of the five consciousness / meditation systems in the app. */
export type SystemId =
  | 'transurfing'
  | 'silva'
  | 'dispenza'
  | 'feldenkrais'
  | 'breath';

/** Ordered difficulty levels that gate practice availability. */
export type DifficultyLevel =
  | 'beginner'
  | 'elementary'
  | 'intermediate'
  | 'advanced'
  | 'master';

/** Session length presets offered to the user before starting a practice. */
export type SessionLength = 'short' | 'medium' | 'full';

// ---------------------------------------------------------------------------
// Visual signature
// ---------------------------------------------------------------------------

/** Describes the particle rendering style used in visualisations. */
export type ParticleStyle =
  | 'dots'
  | 'waves'
  | 'spiral'
  | 'fractal'
  | 'orbital'
  | 'flow';

/**
 * Visual theme configuration unique to each SystemId.
 * Consumed by the visualisation engine to render system-specific backgrounds,
 * particle effects, and ambient glows during a session.
 */
export interface VisualSignature {
  /** Primary hex colour for the system (e.g. '#1a237e'). */
  readonly primaryColor: string;
  /** Secondary / accent hex colour. */
  readonly secondaryColor: string;
  /** Gradient background colours rendered top → bottom. */
  readonly gradientColors: readonly [string, string, string];
  /** Particle style used during this system's sessions. */
  readonly particleStyle: ParticleStyle;
  /** Glow intensity in the range [0, 1]. Controls bloom / blur pass strength. */
  readonly glowIntensity: number;
  /** Optional SVG pattern identifier for tiled backgrounds. */
  readonly patternId?: string;
  /** Animation speed multiplier in the range [0.1, 3.0]. */
  readonly animationSpeed: number;
}

// ---------------------------------------------------------------------------
// Theory content
// ---------------------------------------------------------------------------

/** A single titled section inside a TheoryShape (e.g. neuroscience, mechanism). */
export interface TheorySection {
  /** Section heading displayed to the user. */
  readonly title: string;
  /** Body text – supports basic markdown for rich rendering. */
  readonly content: string;
}

/**
 * Structured theory / educational content attached to a practice or system.
 * Sections are keyed by topic so the UI can conditionally render them.
 */
export interface TheoryShape {
  readonly neuroscience: TheorySection;
  readonly mechanism: TheorySection;
  readonly effects: TheorySection;
  readonly contraindications: TheorySection;
}

// ---------------------------------------------------------------------------
// Segment — discriminated union
// ---------------------------------------------------------------------------

/** A spoken-voice segment delivered via TTS or pre-recorded audio. */
export interface VoiceSegment {
  readonly kind: 'voice';
  /** i18n key used to look up the localized narration text. */
  readonly textKey: string;
  /** Expected duration in seconds (used for timeline rendering). */
  readonly durationSec: number;
  /** Which session phase this segment belongs to. */
  readonly phase: SessionPhase;
  /** When true, text is spoken aloud via TTS. When false, shown visually only. */
  readonly optionalTts: boolean;
}

/** A background-music segment layered underneath voice/binaural. */
export interface MusicSegment {
  readonly kind: 'music';
  /** Asset identifier for the music track. */
  readonly trackId: string;
  /** Fade-in duration in seconds. */
  readonly fadeInSec: number;
  /** Fade-out duration in seconds. */
  readonly fadeOutSec: number;
  /** Relative volume in the range [0, 1]. */
  readonly volume: number;
  /** Whether the track loops until explicitly stopped. */
  readonly loop: boolean;
}

/** A binaural-beat segment used for brainwave entrainment. */
export interface BinauralSegment {
  readonly kind: 'binaural';
  /** Base carrier frequency in Hz. */
  readonly baseHz: number;
  /** Beat frequency (difference between left/right channels) in Hz. */
  readonly beatHz: number;
  /** Fade-in duration in seconds. */
  readonly fadeInSec: number;
  /** Fade-out duration in seconds. */
  readonly fadeOutSec: number;
  /** Relative volume in the range [0, 1]. */
  readonly volume: number;
}

/** A silent pause segment used for breathing or transition spacing. */
export interface SilenceSegment {
  readonly kind: 'silence';
  /** Duration of silence in seconds. */
  readonly durationSec: number;
}

/** A theory / educational segment shown to the user (no audio). */
export interface TheorySegment {
  readonly kind: 'theory';
}

/**
 * Discriminated union of all possible segments in a practice timeline.
 * Use `segment.kind` in exhaustive switch statements to narrow the type.
 */
export type Segment =
  | VoiceSegment
  | MusicSegment
  | BinauralSegment
  | SilenceSegment
  | TheorySegment;

// ---------------------------------------------------------------------------
// Practice & System
// ---------------------------------------------------------------------------

/**
 * A single practice (meditation / exercise) within a system.
 * Contains metadata, an ordered list of segments, and gating information.
 */
export interface Practice {
  /** Unique practice identifier (e.g. 'transurfing-lift-anchor'). */
  readonly id: string;
  /** Which system this practice belongs to. */
  readonly systemId: SystemId;
  /** Human-readable title. */
  readonly title: string;
  /** Short description shown in practice cards. */
  readonly description: string;
  /** Difficulty gate for this practice. */
  readonly difficulty: DifficultyLevel;
  /** Estimated session duration in minutes (for the 'medium' length preset). */
  readonly estimatedDurationMin: number;
  /** Ordered timeline of segments played during this practice. */
  readonly segments: readonly Segment[];
  /** Which session-length presets this practice supports. */
  readonly includeIn: readonly SessionLength[];
  /**
   * Numeric level the user must have reached to unlock this practice.
   * Derived from the system's ProgressionRule array.
   */
  readonly requiredLevel: number;
  /** Medical / psychological contraindications shown as a warning. */
  readonly contraindications: readonly string[];
  /** Searchable tags for filtering and discovery. */
  readonly tags: readonly string[];
}

/**
 * A complete meditation system (e.g. Transurfing, Silva Method).
 * Groups related practices and carries visual / progression metadata.
 */
export interface System {
  readonly id: SystemId;
  /** Display name. */
  readonly name: string;
  /** Short motivational tagline. */
  readonly tagline: string;
  /** Icon identifier from the app's icon set. */
  readonly icon: string;
  /** Primary brand colour (hex). */
  readonly color: string;
  /** Accent / highlight colour (hex). */
  readonly accentColor: string;
  /** Maximum numeric level achievable in this system. */
  readonly maxLevel: number;
  /** All practices that belong to this system, ordered by level. */
  readonly practices: readonly Practice[];
  /** Visual theme used for backgrounds, particles, and ambient effects. */
  readonly visual: VisualSignature;
  /** Ordered rules defining how the user progresses through levels. */
  readonly progression: readonly ProgressionRule[];
}
