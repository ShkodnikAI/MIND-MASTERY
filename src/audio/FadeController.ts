/**
 * @file FadeController -- smooth volume ramp utility.
 *
 * Provides linear and exponential fade in/out for audio layers.
 * Uses `setInterval` with 50 ms steps for smooth, perceptible transitions.
 * Returns a `FadeHandle` whose `cancel()` method aborts the fade mid-way,
 * leaving the volume at whatever level it had reached.
 *
 * Used by `useAudioEngine` (hook layer) to execute fade commands emitted
 * by the AudioEngine.  The engine itself does not import this module.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Curve shape for volume interpolation. */
export type FadeCurve = 'linear' | 'exponential';

/** Configuration for a single fade operation. */
export interface FadeOptions {
  /** Starting volume [0, 1]. */
  readonly fromVolume: number;
  /** Target volume [0, 1]. */
  readonly toVolume: number;
  /** Duration of the fade in milliseconds. */
  readonly durationMs: number;
  /** Interpolation curve. */
  readonly curve: FadeCurve;
  /** Called on every volume step (~50 ms intervals). */
  readonly onVolumeChange: (volume: number) => void;
  /** Called once when the fade reaches the target volume. */
  readonly onComplete?: () => void;
}

/** Handle returned by `startFade()`. Call `cancel()` to abort. */
export interface FadeHandle {
  /** Cancel the fade and leave volume at the current level. */
  cancel: () => void;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Number of interpolation steps.  Each step runs every `durationMs / STEPS` ms. */
const STEPS = 20;

/**
 * Start a volume fade from `fromVolume` to `toVolume` over `durationMs`.
 *
 * If `durationMs <= 0` the target volume is applied immediately and
 * `onComplete` fires synchronously.
 *
 * @returns A `FadeHandle` whose `cancel()` aborts the fade.
 */
export function startFade(options: FadeOptions): FadeHandle {
  const { fromVolume, toVolume, durationMs, curve, onVolumeChange, onComplete } = options;

  // Instant apply for zero/negative duration
  if (durationMs <= 0) {
    onVolumeChange(toVolume);
    onComplete?.();
    return { cancel: () => {} };
  }

  let cancelled = false;
  const startTime = Date.now();
  const intervalMs = Math.max(durationMs / STEPS, 16); // clamp to ~60 fps

  const interval = setInterval(() => {
    if (cancelled) {
      clearInterval(interval);
      return;
    }

    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / durationMs, 1);
    const volume = interpolate(fromVolume, toVolume, progress, curve);

    onVolumeChange(volume);

    if (progress >= 1) {
      clearInterval(interval);
      onComplete?.();
    }
  }, intervalMs);

  return {
    cancel: () => {
      if (!cancelled) {
        cancelled = true;
        clearInterval(interval);
      }
    },
  };
}

// ---------------------------------------------------------------------------
// Interpolation
// ---------------------------------------------------------------------------

/**
 * Interpolate between `from` and `to` at progress `t` in [0, 1].
 *
 * - **linear**: `from + (to - from) * t` -- even, predictable.
 * - **exponential**: `from * (to / from) ^ t` -- mimics human loudness
 *   perception; smoother to the ear.
 */
export function interpolate(from: number, to: number, t: number, curve: FadeCurve): number {
  switch (curve) {
    case 'linear':
      return from + (to - from) * t;
    case 'exponential': {
      // Guard against division by zero or negative bases
      if (from === 0) return to * t; // from silence: linear ramp up
      return from * Math.pow(to / from, t);
    }
  }
}

/**
 * Compute the effective per-layer volume: `master * perLayer`.
 * Result is clamped to [0, 1].
 */
export function effectiveVolume(master: number, perLayer: number): number {
  return Math.max(0, Math.min(1, master * perLayer));
}
