import type { ProgressionRule } from '@/types';

export const feldenkraisProgression: ProgressionRule[] = [
  {
    levelRequired: 2,
    minCompletedSessions: 4,
    minTotalMinutes: 60,
    description: 'Завершите 4 базовых урока',
  },
  {
    levelRequired: 3,
    minCompletedSessions: 10,
    minTotalMinutes: 150,
    description: '10 уроков общей длительностью от 2.5 часов',
  },
  {
    levelRequired: 4,
    minCompletedSessions: 20,
    minTotalMinutes: 300,
    description: '20 уроков, 5+ часов практики',
  },
];
