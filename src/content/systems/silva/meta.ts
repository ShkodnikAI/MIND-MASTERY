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

export const silvaMeta: SystemMeta = {
  id: 'silva',
  name: 'Метод Сильва',
  tagline: 'Управление сознанием на альфа-уровне',
  description:
    'Метод Хосе Сильва для развития интуиции и управления сознанием. Основан на достижении альфа-уровня мозга и работе с ментальным экраном.',
  icon: 'leaf-outline',
  color: '#00B894',
  accentColor: '#55EFC4',
  maxLevel: 5,
  totalPractices: 18,
  difficulty: 'intermediate',
  estimatedTotalMin: 270,
  contraindications: 'Эпилепсия, шизоидные расстройства',
};
