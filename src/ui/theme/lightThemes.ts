/**
 * @file MIND MASTERY — Light effect themes.
 *
 * Seven predefined colour palettes used by the smart-light integration
 * to control ambient room lighting during meditation sessions.
 *
 * LightThemeId type is defined in @/types/light.
 */

import type { LightThemeId } from '@/types';

interface LightTheme {
  readonly name: string;
  readonly colors: readonly [string, string, string];
}

export const lightThemes: Record<LightThemeId, LightTheme> = {
  cosmic: {
    name: 'Космос',
    colors: ['#6C5CE7', '#A29BFE', '#0984E3'],
  },
  ocean: {
    name: 'Океан',
    colors: ['#00B894', '#00CEC9', '#0984E3'],
  },
  forest: {
    name: 'Лес',
    colors: ['#00B894', '#55EFC4', '#FDCB6E'],
  },
  sunset: {
    name: 'Закат',
    colors: ['#E17055', '#FDCB6E', '#6C5CE7'],
  },
  golden: {
    name: 'Золото',
    colors: ['#FDCB6E', '#F8B500', '#E17055'],
  },
  aurora: {
    name: 'Аврора',
    colors: ['#6C5CE7', '#00B894', '#74B9FF'],
  },
  crystal: {
    name: 'Кристалл',
    colors: ['#DFE6E9', '#74B9FF', '#A29BFE'],
  },
} as const;
