import type { ProgressionRule } from '@/types';

export const dispenzaProgression: ProgressionRule[] = [
  {
    levelRequired: 2,
    minCompletedSessions: 4,
    minTotalMinutes: 50,
    description: 'Завершите 4 базовые практики',
  },
  {
    levelRequired: 3,
    minCompletedSessions: 12,
    minTotalMinutes: 180,
    description: '12 практик общей длительностью от 3 часов',
  },
  {
    levelRequired: 4,
    minCompletedSessions: 22,
    minTotalMinutes: 400,
    description: '22 практики, 7+ часов практики',
  },
  {
    levelRequired: 5,
    minCompletedSessions: 40,
    minTotalMinutes: 750,
    description: '40 практик, 12+ часов практики',
  },
];
