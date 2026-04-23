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

export const feldenkraisMeta: SystemMeta = {
  id: 'feldenkrais',
  name: 'Метод Фельденкрайза',
  tagline: 'Осознанность через движение',
  description:
    'Метод Моше Фельденкрайза для улучшения координации, снятия боли и расширения телесной осознанности через мягкие движения.',
  icon: 'body-outline',
  color: '#E17055',
  accentColor: '#FAB1A0',
  maxLevel: 4,
  totalPractices: 12,
  difficulty: 'beginner',
  estimatedTotalMin: 240,
  contraindications: 'Острые воспалительные процессы, свежие травмы позвоночника',
};
