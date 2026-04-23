import type { ProgressionRule } from '@/types';

export const silvaProgression: ProgressionRule[] = [
  {
    levelRequired: 2,
    minCompletedSessions: 4,
    minTotalMinutes: 40,
    description: 'Завершите 4 базовые практики',
  },
  {
    levelRequired: 3,
    minCompletedSessions: 12,
    minTotalMinutes: 150,
    description: '12 практик общей длительностью от 2.5 часов',
  },
  {
    levelRequired: 4,
    minCompletedSessions: 25,
    minTotalMinutes: 350,
    description: '25 практик, 6+ часов практики',
  },
  {
    levelRequired: 5,
    minCompletedSessions: 45,
    minTotalMinutes: 700,
    description: '45 практик, 12+ часов практики',
  },
];
