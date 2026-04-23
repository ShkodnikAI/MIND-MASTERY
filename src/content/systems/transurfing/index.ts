import type { System } from '@/types';
import { transurfingMeta } from './meta';
import { transurfingVisual } from './visual';
import { transurfingProgression } from './progression';
import { transurfingPractices } from './practices';

export const transurfingSystem: System = {
  id: transurfingMeta.id,
  name: transurfingMeta.name,
  tagline: transurfingMeta.tagline,
  icon: transurfingMeta.icon,
  color: transurfingMeta.color,
  accentColor: transurfingMeta.accentColor,
  maxLevel: transurfingMeta.maxLevel,
  practices: transurfingPractices,
  visual: transurfingVisual,
  progression: transurfingProgression,
};

export { transurfingMeta, transurfingVisual, transurfingProgression, transurfingPractices };
