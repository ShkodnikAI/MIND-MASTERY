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

export const dispenzaMeta: SystemMeta = {
  id: 'dispenza',
  name: 'Метод Диспензы',
  tagline: 'Перестройка тела и мозга через медитацию',
  description:
    'Метод доктора Джо Диспензы для трансформации сознания и тела. Основан на нейронауке, эпигенетике и квантовой физике.',
  icon: 'sunny-outline',
  color: '#FDCB6E',
  accentColor: '#F8B500',
  maxLevel: 5,
  totalPractices: 13,
  difficulty: 'intermediate',
  estimatedTotalMin: 260,
  contraindications: 'Эпилепсия, психотические расстройства, биполярное расстройство',
};
