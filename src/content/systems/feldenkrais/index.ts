import type { System } from '@/types';
import { feldenkraisMeta } from './meta';
import { feldenkraisVisual } from './visual';
import { feldenkraisProgression } from './progression';
import { feldenkraisPractices } from './practices';

export const feldenkraisSystem: System = {
  id: feldenkraisMeta.id,
  name: feldenkraisMeta.name,
  tagline: feldenkraisMeta.tagline,
  icon: feldenkraisMeta.icon,
  color: feldenkraisMeta.color,
  accentColor: feldenkraisMeta.accentColor,
  maxLevel: feldenkraisMeta.maxLevel,
  practices: feldenkraisPractices,
  visual: feldenkraisVisual,
  progression: feldenkraisProgression,
};

export { feldenkraisMeta, feldenkraisVisual, feldenkraisProgression, feldenkraisPractices };
