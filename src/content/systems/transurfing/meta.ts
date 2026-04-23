import type { SystemId, DifficultyLevel } from '@/types';

export interface SystemMeta {
  readonly id: SystemId;
  readonly name: string;
  readonly tagline: string;
  readonly description: string;
  readonly icon: string;
  readonly color: string;
  readonly accentColor: string;
  readonly maxLevel: number;
  readonly totalPractices: number;
  readonly difficulty: DifficultyLevel;
  readonly estimatedTotalMin: number;
  readonly contraindications: string;
}

export const transurfingMeta: SystemMeta = {
  id: 'transurfing',
  name: 'Трансерфинг Реальности',
  tagline: 'Управление реальностью через намерение',
  description:
    'Метод Вадима Зеланда для управления реальностью. Основан на концепции пространств вариантов, понижения важности и управлении вниманием.',
  icon: 'sparkles-outline',
  color: '#6C5CE7',
  accentColor: '#A29BFE',
  maxLevel: 5,
  totalPractices: 14,
  difficulty: 'intermediate',
  estimatedTotalMin: 210,
  contraindications: 'Эпилепсия, психотические расстройства в анамнезе',
};
