/**
 * @file System definitions registry — the canonical list of all practice systems.
 *
 * System definitions will be populated in Stage 2b/2c when practice content is
 * authored. This module exports:
 * - `SYSTEM_IDS` — the readonly tuple of all valid system identifiers
 * - `SystemId` — the corresponding union type
 *
 * These are used throughout the app for type-safe system references:
 *   navigation, progress tracking, content registry, visual themes, etc.
 *
 * The actual `System` objects (with practices, visual signatures, progression
 * rules) live in their respective system directories and are registered at
 * runtime via `src/content/registry.ts`.
 */

// Stage 2b: import transurfing from './transurfing';
// Stage 2b: import silva from './silva';
// Stage 2c: import dispenza from './dispenza';
// Stage 2c: import feldenkrais from './feldenkrais';
// Stage 2b: import breath from './breath';

/** Ordered list of all practice system identifiers. */
export const SYSTEM_IDS = [
  'transurfing',
  'silva',
  'dispenza',
  'feldenkrais',
  'breath',
] as const;

/** Union type of all valid system identifiers. */
export type SystemId = (typeof SYSTEM_IDS)[number];
