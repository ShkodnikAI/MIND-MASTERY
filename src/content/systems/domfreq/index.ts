import type { System } from '@/types';
import { domfreqMeta } from './meta';
import { domfreqVisual } from './visual';
import { domfreqProgression } from './progression';
import { domfreqPractices } from './practices';

export const domfreqSystem: System = {
  id: domfreqMeta.id,
  name: domfreqMeta.name,
  tagline: domfreqMeta.tagline,
  icon: domfreqMeta.icon,
  color: domfreqMeta.color,
  accentColor: domfreqMeta.accentColor,
  maxLevel: domfreqMeta.maxLevel,
  practices: domfreqPractices,
  visual: domfreqVisual,
  progression: domfreqProgression,
};

export { domfreqMeta, domfreqVisual, domfreqProgression, domfreqPractices };
