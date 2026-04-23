import type { ProgressionRule } from '@/types';

export const breathProgression: ProgressionRule[] = [
  {
    levelRequired: 2,
    minCompletedSessions: 3,
    minTotalMinutes: 30,
    description: 'Завершите 3 базовые дыхательные практики',
  },
  {
    levelRequired: 3,
    minCompletedSessions: 8,
    minTotalMinutes: 90,
    description: '8 практик общей длительностью от 1.5 часов',
  },
  {
    levelRequired: 4,
    minCompletedSessions: 15,
    minTotalMinutes: 180,
    description: '15 практик, 3+ часа практики',
  },
];
