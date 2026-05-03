/**
 * @file Shared types for the content plugin system.
 *
 * SystemMeta is the internal metadata shape used by each system's meta.ts.
 * Unlike the public System interface (src/types/content.ts), this includes
 * fields needed for content management (description, practice counts, etc.)
 * that are NOT rendered by the UI runtime.
 */

import type { SystemId, DifficultyLevel } from '@/types';

/**
 * Internal metadata descriptor for a practice system.
 * Used during content authoring and validation — not exposed to the UI layer.
 */
export interface SystemMeta {
  readonly id: SystemId;
  readonly name: string;
  readonly tagline: string;
  readonly description: string;
  readonly icon: string;
  readonly color: string;
  readonly accentColor: string;
  readonly maxLevel: number;
  readonly totalPractices: number;
  readonly difficulty: DifficultyLevel;
  readonly estimatedTotalMin: number;
  readonly contraindications: string;
}
