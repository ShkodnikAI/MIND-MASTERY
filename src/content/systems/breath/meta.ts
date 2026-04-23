import type { SystemMeta } from '@/content/types';

export type { SystemMeta } from '@/content/types';

export const breathMeta: SystemMeta = {
  id: 'breath',
  name: 'Дыхательные практики',
  tagline: 'Основа жизни — осознанное дыхание',
  description:
    'Система дыхательных техник от базовых до продвинутых. Включает диафрагмальное дыхание, квадратное дыхание, пранаяму и специализированные методы.',
  icon: 'fitness-outline',
  color: '#74B9FF',
  accentColor: '#0984E3',
  maxLevel: 4,
  totalPractices: 8,
  difficulty: 'beginner',
  estimatedTotalMin: 100,
  contraindications: 'Сердечно-сосудистые заболевания, эпилепсия, беременность',
};
