/**
 * @file Content Registry — plugin architecture for practice systems.
 *
 * Provides a runtime map of `System` objects. Each system is registered
 * at app startup via `registerSystem()`, then looked up by consumers.
 *
 * Source of truth:
 *   - UI chrome strings → src/i18n/
 *   - Practice narration texts → content/texts/<system>/<practice>.json
 *   - Type definitions → src/types/content.ts
 *
 * @stage 2a — Full registry with auto-registration of all 5 systems.
 */

import type { System, Practice } from '@/types';
import { transurfingSystem } from './systems/transurfing';
import { silvaSystem } from './systems/silva';
import { dispenzaSystem } from './systems/dispenza';
import { feldenkraisSystem } from './systems/feldenkrais';
import { breathSystem } from './systems/breath';

// ---------------------------------------------------------------------------
// Internal store
// ---------------------------------------------------------------------------

/** Runtime registry of all registered systems, keyed by system ID. */
const systems = new Map<string, System>();

// ---------------------------------------------------------------------------
// Auto-registration (runs once at import time)
// ---------------------------------------------------------------------------

const ALL_SYSTEMS: readonly System[] = [
  transurfingSystem,
  silvaSystem,
  dispenzaSystem,
  feldenkraisSystem,
  breathSystem,
];

let isRegistered = false;

/**
 * Registers all built-in practice systems.
 * Call once during app startup. Safe to call multiple times (idempotent).
 */
export function registerAllSystems(): void {
  if (isRegistered) return;
  for (const system of ALL_SYSTEMS) {
    systems.set(system.id, system);
  }
  isRegistered = true;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Retrieve a system by its identifier.
 * Returns `undefined` if the system has not been registered.
 */
export function getSystem(systemId: string): System | undefined {
  return systems.get(systemId);
}

/**
 * Retrieve all registered systems.
 * Returns an empty array if no systems have been registered yet.
 */
export function getAllSystems(): System[] {
  return Array.from(systems.values());
}

/**
 * Retrieve a specific practice within a system.
 * Returns `undefined` if the system or practice is not found.
 */
export function getPractice(systemId: string, practiceId: string): Practice | undefined {
  return systems.get(systemId)?.practices.find((p) => p.id === practiceId);
}

/**
 * Find a practice by ID across ALL systems.
 * Returns the practice and its parent system, or null if not found.
 */
export function findPracticeGlobal(
  practiceId: string,
): { practice: Practice; system: System } | null {
  for (const system of systems.values()) {
    const practice = system.practices.find((p) => p.id === practiceId);
    if (practice) return { practice, system };
  }
  return null;
}

/**
 * Register a system into the content registry.
 * Overwrites any previously registered system with the same ID.
 */
export function registerSystem(system: System): void {
  systems.set(system.id, system);
}

/**
 * Get total practice count across all systems.
 */
export function getTotalPracticeCount(): number {
  let count = 0;
  for (const system of systems.values()) {
    count += system.practices.length;
  }
  return count;
}

/**
 * Get practice count for a specific system.
 */
export function getSystemPracticeCount(systemId: string): number {
  return systems.get(systemId)?.practices.length ?? 0;
}

/**
 * Clear all registered systems.
 * Primarily used in tests and development hot-reload scenarios.
 */
export function clearRegistry(): void {
  systems.clear();
  isRegistered = false;
}
