/**
 * @file Content Registry — plugin architecture for practice systems.
 *
 * Provides a runtime map of `System` objects. Each system is registered
 * at app startup via `registerSystem()`, then looked up by consumers:
 *
 *   const system = getSystem('transurfing');
 *   const practice = getPractice('transurfing', 'transurfing-lift-anchor');
 *   const all = getAllSystems();
 *
 * Source of truth:
 *   - UI chrome strings → src/i18n/
 *   - Practice narration texts → content/texts/<system>/<practice>.json
 *   - Type definitions → src/types/content.ts
 *
 * @stage 2a — Implement full registry with system registration and validation.
 */

import type { System, Practice } from '@/types';

// ---------------------------------------------------------------------------
// Internal store
// ---------------------------------------------------------------------------

/** Runtime registry of all registered systems, keyed by system ID. */
const systems = new Map<string, System>();

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
export function getPractice(
  systemId: string,
  practiceId: string,
): Practice | undefined {
  return systems.get(systemId)?.practices.find((p) => p.id === practiceId);
}

/**
 * Register a system into the content registry.
 * Overwrites any previously registered system with the same ID.
 *
 * Call this during app startup (Stage 2b/2c) after importing system modules.
 */
export function registerSystem(system: System): void {
  systems.set(system.id, system);
}

/**
 * Clear all registered systems.
 * Primarily used in tests and development hot-reload scenarios.
 */
export function clearRegistry(): void {
  systems.clear();
}
