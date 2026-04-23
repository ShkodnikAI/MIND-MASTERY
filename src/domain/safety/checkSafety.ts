/**
 * @file Medical safety & consent checks — pure functions.
 *
 * Validates that the user has accepted the disclaimer, provided
 * practice-specific consent where contraindications exist, and
 * generates appropriate warnings.
 */

import type { SafetyState } from '@/types';

// ---------------------------------------------------------------------------
// Result type
// ---------------------------------------------------------------------------

/** Result of a pre-session safety check. */
export interface SafetyCheckResult {
  /** Whether the user may proceed to start the session. */
  readonly canProceed: boolean;
  /** Non-blocking informational warnings to display (empty when blocked). */
  readonly warnings: readonly string[];
  /** Whether the user needs to explicitly consent before proceeding. */
  readonly requiresConsent: boolean;
  /** Human-readable reason when `canProceed` is false. */
  readonly blockedReason: string | undefined;
}

// ---------------------------------------------------------------------------
// Current disclaimer version
// ---------------------------------------------------------------------------

const CURRENT_DISCLAIMER_VERSION = '1.0';

// ---------------------------------------------------------------------------
// Core check
// ---------------------------------------------------------------------------

/**
 * Performs a full safety check before starting a session.
 *
 * Checks:
 * 1. Has the general disclaimer been accepted?
 * 2. Is the disclaimer version current?
 * 3. If the practice has contraindications, has practice-specific
 *    consent been given?
 * 4. If consent was given despite contraindications, emit a warning.
 *
 * @param safetyState - Persisted consent / disclaimer state.
 * @param practiceId - The practice the user is about to start.
 * @param hasContraindications - Whether this practice has any
 *   medical contraindications.
 * @param contraindicationList - Human-readable list of specific
 *   contraindication labels for this practice.
 */
export function checkSafety(
  safetyState: SafetyState,
  practiceId: string,
  hasContraindications: boolean,
  contraindicationList: readonly string[],
): SafetyCheckResult {
  const emptyWarnings: string[] = [];

  // 1. Check disclaimer
  if (!safetyState.disclaimerAccepted) {
    return {
      canProceed: false,
      warnings: emptyWarnings,
      requiresConsent: false,
      blockedReason: 'Необходимо принять медицинский дисклеймер перед началом',
    };
  }

  // 2. Check disclaimer version
  const warnings: string[] = [];
  if (safetyState.disclaimerVersion !== CURRENT_DISCLAIMER_VERSION) {
    warnings.push(
      'Версия медицинского дисклеймера обновлена. Пожалуйста, ознакомьтесь.',
    );
  }

  // 3. Check practice-specific consent
  const consentGiven = safetyState.consentGivenFor[practiceId] ?? false;
  if (hasContraindications && !consentGiven) {
    return {
      canProceed: false,
      warnings: emptyWarnings,
      requiresConsent: true,
      blockedReason: undefined,
    };
  }

  // 4. Warn if contraindications exist but user has consented
  if (contraindicationList.length > 0 && consentGiven) {
    warnings.push(
      `У этой практики есть противопоказания: ${contraindicationList.join(', ')}. ` +
        'Вы подтвердили awareness. Будьте осторожны.',
    );
  }

  return {
    canProceed: true,
    warnings,
    requiresConsent: false,
    blockedReason: undefined,
  };
}

// ---------------------------------------------------------------------------
// Feature-level helpers
// ---------------------------------------------------------------------------

/**
 * Checks whether a practice involves advanced breathwork techniques
 * that may require additional warnings (e.g. holotropic, Wim Hof).
 */
export function hasAdvancedBreathwork(practiceId: string): boolean {
  const advancedBreathIds: ReadonlySet<string> = new Set([
    'breath_holotropic',
    'breath_wimhof',
    'breath_rebirthing',
    'breath_intensive',
  ]);
  return advancedBreathIds.has(practiceId);
}

/**
 * Checks whether a photosensitive-epilepsy warning should be shown
 * based on the enabled visual / light effects.
 *
 * Triggers for entrainment (flicker) and pulse effects.
 */
export function needsPhotosensitiveWarning(
  enabledEffects: readonly string[],
): boolean {
  const sensitiveEffects: ReadonlySet<string> = new Set([
    'entrainment',
    'pulse',
  ]);
  return enabledEffects.some((effect) => sensitiveEffects.has(effect));
}
