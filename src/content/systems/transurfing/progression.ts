import type { ProgressionRule } from '@/types';

export const transurfingProgression: ProgressionRule[] = [
  {
    levelRequired: 2,
    minCompletedSessions: 3,
    minTotalMinutes: 30,
    description: 'Завершите 3 базовые практики',
  },
  {
    levelRequired: 3,
    minCompletedSessions: 10,
    minTotalMinutes: 120,
    description: '10 практик общей длительностью от 2 часов',
  },
  {
    levelRequired: 4,
    minCompletedSessions: 20,
    minTotalMinutes: 300,
    description: '20 практик, 5+ часов практики',
  },
  {
    levelRequired: 5,
    minCompletedSessions: 40,
    minTotalMinutes: 600,
    description: '40 практик, 10+ часов практики',
  },
];
