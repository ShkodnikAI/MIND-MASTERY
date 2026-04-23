/**
 * @file Shared utilities for content plugin system.
 *
 * Provides the makePractice factory used by all 5 system definitions,
 * eliminating the duplication that existed when each system defined
 * its own identical copy.
 */

import type { Practice, Segment, SessionLength, SystemId, DifficultyLevel } from '@/types';

/** All session length presets — most practices support all three. */
export const ALL_LENGTHS: readonly SessionLength[] = ['short', 'medium', 'full'];

/**
 * Maps numeric level → DifficultyLevel.
 *
 * Systems with 5 levels use the full range (beginner→master).
 * Systems with 4 levels stop at 'advanced'.
 *
 * Level 0 is never used in practice definitions (Level 1 = beginner always).
 */
type DiffMap = {
  [level: number]: DifficultyLevel;
};

/** Default 5-level difficulty mapping. */
export const DIFF_MAP_5: DiffMap = {
  1: 'beginner',
  2: 'elementary',
  3: 'intermediate',
  4: 'advanced',
  5: 'master',
};

/** 4-level difficulty mapping (Feldenkrais, Breath). */
export const DIFF_MAP_4: DiffMap = {
  1: 'beginner',
  2: 'elementary',
  3: 'intermediate',
  4: 'advanced',
};

/**
 * Factory function for creating Practice objects.
 *
 * Centralizes the boilerplate that was duplicated across all 5 systems.
 * Each system only needs to call this with its specific data.
 *
 * @param systemId  - Which system this practice belongs to
 * @param diffMap   - Level→difficulty mapping (DIFF_MAP_5 or DIFF_MAP_4)
 * @param id        - Unique practice identifier (e.g. 'trans_lower_importance')
 * @param title     - Human-readable Russian title
 * @param description - Short description for practice cards
 * @param level     - Required level (gates availability via progression)
 * @param estimatedMin - Estimated duration in minutes (medium preset)
 * @param contraindications - Medical/psychological warnings
 * @param tags      - Searchable tags for discovery
 * @param segments  - Ordered timeline of Segment objects
 */
export function makePractice(
  systemId: SystemId,
  diffMap: DiffMap,
  id: string,
  title: string,
  description: string,
  level: number,
  estimatedMin: number,
  contraindications: string[],
  tags: string[],
  segments: Segment[],
): Practice {
  return {
    id,
    systemId,
    title,
    description,
    difficulty: diffMap[level] ?? 'beginner',
    estimatedDurationMin: estimatedMin,
    segments,
    includeIn: [...ALL_LENGTHS],
    requiredLevel: level,
    contraindications,
    tags,
  };
}
