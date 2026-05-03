import type { ProgressionRule } from '@/types';

export const domfreqProgression: ProgressionRule[] = [
  {
    levelRequired: 2,
    minCompletedSessions: 3,
    minTotalMinutes: 45,
    description: 'Завершите 3 базовые практики DFP',
  },
  {
    levelRequired: 3,
    minCompletedSessions: 10,
    minTotalMinutes: 150,
    description: '10 практик общей длительностью от 2.5 часов',
  },
  {
    levelRequired: 4,
    minCompletedSessions: 20,
    minTotalMinutes: 300,
    description: '20 практик, 5+ часов практики',
  },
];
