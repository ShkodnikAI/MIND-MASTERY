import type { System } from '@/types';
import { breathMeta } from './meta';
import { breathVisual } from './visual';
import { breathProgression } from './progression';
import { breathPractices } from './practices';

export const breathSystem: System = {
  id: breathMeta.id,
  name: breathMeta.name,
  tagline: breathMeta.tagline,
  icon: breathMeta.icon,
  color: breathMeta.color,
  accentColor: breathMeta.accentColor,
  maxLevel: breathMeta.maxLevel,
  practices: breathPractices,
  visual: breathVisual,
  progression: breathProgression,
};

export { breathMeta, breathVisual, breathProgression, breathPractices };
