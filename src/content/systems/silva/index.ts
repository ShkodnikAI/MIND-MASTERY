import type { System } from '@/types';
import { silvaMeta } from './meta';
import { silvaVisual } from './visual';
import { silvaProgression } from './progression';
import { silvaPractices } from './practices';

export const silvaSystem: System = {
  id: silvaMeta.id,
  name: silvaMeta.name,
  tagline: silvaMeta.tagline,
  icon: silvaMeta.icon,
  color: silvaMeta.color,
  accentColor: silvaMeta.accentColor,
  maxLevel: silvaMeta.maxLevel,
  practices: silvaPractices,
  visual: silvaVisual,
  progression: silvaProgression,
};

export { silvaMeta, silvaVisual, silvaProgression, silvaPractices };
