import type { System } from '@/types';
import { dispenzaMeta } from './meta';
import { dispenzaVisual } from './visual';
import { dispenzaProgression } from './progression';
import { dispenzaPractices } from './practices';

export const dispenzaSystem: System = {
  id: dispenzaMeta.id,
  name: dispenzaMeta.name,
  tagline: dispenzaMeta.tagline,
  icon: dispenzaMeta.icon,
  color: dispenzaMeta.color,
  accentColor: dispenzaMeta.accentColor,
  maxLevel: dispenzaMeta.maxLevel,
  practices: dispenzaPractices,
  visual: dispenzaVisual,
  progression: dispenzaProgression,
};

export { dispenzaMeta, dispenzaVisual, dispenzaProgression, dispenzaPractices };
