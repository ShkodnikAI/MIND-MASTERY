import type { Practice, Segment, SessionLength } from '@/types';

const ALL_LENGTHS: SessionLength[] = ['short', 'medium', 'full'];

type DiffMap = {
  [level: number]: 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'master';
};

const DIFF_MAP: DiffMap = {
  1: 'beginner',
  2: 'elementary',
  3: 'intermediate',
  4: 'advanced',
  5: 'master',
};

function makePractice(
  id: string,
  title: string,
  description: string,
  level: number,
  estimatedMin: number,
  contraindications: string[],
  tags: string[],
  segments: Segment[],
): Practice {
  return {
    id,
    systemId: 'transurfing',
    title,
    description,
    difficulty: DIFF_MAP[level] ?? 'beginner',
    estimatedDurationMin: estimatedMin,
    segments,
    includeIn: ALL_LENGTHS,
    requiredLevel: level,
    contraindications,
    tags,
  };
}

/* =========================================================================
 * Practice 1 — Понижение важности  (Level 1, ~15 min)
 * ========================================================================= */
const trans_lower_importance = makePractice(
  'trans_lower_importance',
  'Понижение важности',
  'Базовая техника трансерфинга. Учит снижать уровень значимости событий и ситуаций для снижения избыточного потенциала.',
  1,
  15,
  [],
  ['основы', 'важность', 'потенциал'],
  [
    { kind: 'voice', textKey: 'trans_lower_importance.preparation', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'trans_lower_importance.induction', durationSec: 60, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'trans_lower_importance.deepening', durationSec: 30, phase: 'deepening', optionalTts: false },
    { kind: 'voice', textKey: 'trans_lower_importance.concept', durationSec: 90, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'trans_lower_importance.visualization', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'trans_lower_importance.integration', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'trans_lower_importance.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 2 — Волновая гашетка  (Level 1, ~15 min)
 * ========================================================================= */
const trans_wave_dampener = makePractice(
  'trans_wave_dampener',
  'Волновая гашетка',
  'Техника сглаживания энергетических волн. Помогает снизить уровень избыточных потенциалов и установить равновесие.',
  1,
  15,
  [],
  ['основы', 'волны', 'равновесие'],
  [
    { kind: 'voice', textKey: 'trans_wave_dampener.preparation', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'trans_wave_dampener.induction', durationSec: 60, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'trans_wave_dampener.deepening', durationSec: 30, phase: 'deepening', optionalTts: false },
    { kind: 'voice', textKey: 'trans_wave_dampener.wave_concept', durationSec: 80, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'trans_wave_dampener.scanning', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'trans_wave_dampener.smoothing', durationSec: 45, phase: 'work', optionalTts: false },
    { kind: 'voice', textKey: 'trans_wave_dampener.integration', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'trans_wave_dampener.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 3 — Пространство вариантов  (Level 1, ~20 min)
 * ========================================================================= */
const trans_variant_space = makePractice(
  'trans_variant_space',
  'Пространство вариантов',
  'Исследование многообразия жизненных путей. Учит воспринимать реальность как бесконечное поле возможностей.',
  1,
  20,
  [],
  ['основы', 'варианты', 'пространство'],
  [
    { kind: 'voice', textKey: 'trans_variant_space.preparation', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'trans_variant_space.induction', durationSec: 60, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'trans_variant_space.deepening', durationSec: 30, phase: 'deepening', optionalTts: false },
    { kind: 'voice', textKey: 'trans_variant_space.space_concept', durationSec: 90, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'trans_variant_space.exploration', durationSec: 75, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'trans_variant_space.choosing', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'trans_variant_space.integration', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'trans_variant_space.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 4 — Управление вниманием  (Level 1, ~15 min)
 * ========================================================================= */
const trans_attention_control = makePractice(
  'trans_attention_control',
  'Управление вниманием',
  'Навык направленного внимания — фундамент трансерфинга. Учит фокусироваться на целевых линиях жизни.',
  1,
  15,
  [],
  ['основы', 'внимание', 'фокус'],
  [
    { kind: 'voice', textKey: 'trans_attention_control.preparation', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'trans_attention_control.induction', durationSec: 60, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'trans_attention_control.deepening', durationSec: 30, phase: 'deepening', optionalTts: false },
    { kind: 'voice', textKey: 'trans_attention_control.focus_exercise', durationSec: 90, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'trans_attention_control.target_line', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'trans_attention_control.integration', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'trans_attention_control.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 5 — Зеркало реальности  (Level 2, ~20 min)
 * ========================================================================= */
const trans_reality_mirror = makePractice(
  'trans_reality_mirror',
  'Зеркало реальности',
  'Техника работы с отражениями — внешними ситуациями как зеркалами внутренних состояний.',
  2,
  20,
  ['Депрессивные эпизоды'],
  ['зеркало', 'внешний мир', 'самопознание'],
  [
    { kind: 'voice', textKey: 'trans_reality_mirror.preparation', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'trans_reality_mirror.induction', durationSec: 60, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'trans_reality_mirror.deepening', durationSec: 30, phase: 'deepening', optionalTts: false },
    { kind: 'voice', textKey: 'trans_reality_mirror.mirror_concept', durationSec: 90, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'trans_reality_mirror.observation', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'trans_reality_mirror.reflection', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'trans_reality_mirror.integration', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'trans_reality_mirror.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 6 — Слайд между мирами  (Level 2, ~20 min)
 * ========================================================================= */
const trans_world_slide = makePractice(
  'trans_world_slide',
  'Слайд между мирами',
  'Продвинутая визуализация перемещения между линиями жизни. Создаёт sensación свободы выбора.',
  2,
  20,
  ['Панические атаки'],
  ['слайд', 'переход', 'визуализация'],
  [
    { kind: 'voice', textKey: 'trans_world_slide.preparation', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'trans_world_slide.induction', durationSec: 60, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'trans_world_slide.deepening', durationSec: 30, phase: 'deepening', optionalTts: false },
    { kind: 'voice', textKey: 'trans_world_slide.slide_concept', durationSec: 80, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'trans_world_slide.entering_slide', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'trans_world_slide.living_slide', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'trans_world_slide.return', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'trans_world_slide.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 7 — Стрелец и бабочка  (Level 2, ~20 min)
 * ========================================================================= */
const trans_archer_butterfly = makePractice(
  'trans_archer_butterfly',
  'Стрелец и бабочка',
  'Баланс между целенаправленностью (стрелец) и лёгкостью отношения (бабочка). Ключевой принцип трансерфинга.',
  2,
  20,
  [],
  ['баланс', 'намерение', 'лёгкость'],
  [
    { kind: 'voice', textKey: 'trans_archer_butterfly.preparation', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'trans_archer_butterfly.induction', durationSec: 60, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'trans_archer_butterfly.deepening', durationSec: 30, phase: 'deepening', optionalTts: false },
    { kind: 'voice', textKey: 'trans_archer_butterfly.archer_principle', durationSec: 75, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'trans_archer_butterfly.butterfly_principle', durationSec: 75, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'trans_archer_butterfly.integration', durationSec: 45, phase: 'integration', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'trans_archer_butterfly.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 8 — Создание намерения  (Level 2, ~20 min)
 * ========================================================================= */
const trans_create_intention = makePractice(
  'trans_create_intention',
  'Создание намерения',
  'Формирование истинного намерения без избыточной значимости. Различие между желанием и намерением.',
  2,
  20,
  [],
  ['намерение', 'желание', 'создание'],
  [
    { kind: 'voice', textKey: 'trans_create_intention.preparation', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'trans_create_intention.induction', durationSec: 60, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'trans_create_intention.deepening', durationSec: 30, phase: 'deepening', optionalTts: false },
    { kind: 'voice', textKey: 'trans_create_intention.desire_vs_intention', durationSec: 80, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'trans_create_intention.forming_intention', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'trans_create_intention.anchoring', durationSec: 45, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'trans_create_intention.integration', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'trans_create_intention.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 9 — Работа с маятниками  (Level 3, ~25 min)
 * ========================================================================= */
const trans_pendulums = makePractice(
  'trans_pendulums',
  'Работа с маятниками',
  'Распознавание и освобождение от энергоинформационных структур — «маятников», управляющих поведением.',
  3,
  25,
  ['Тревожные расстройства'],
  ['маятники', 'освобождение', 'осознанность'],
  [
    { kind: 'voice', textKey: 'trans_pendulums.preparation', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'trans_pendulums.induction', durationSec: 60, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'trans_pendulums.deepening', durationSec: 30, phase: 'deepening', optionalTts: false },
    { kind: 'voice', textKey: 'trans_pendulums.pendulum_concept', durationSec: 90, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'trans_pendulums.identification', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'trans_pendulums.release', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'trans_pendulums.stepping_aside', durationSec: 45, phase: 'work', optionalTts: false },
    { kind: 'voice', textKey: 'trans_pendulums.integration', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'trans_pendulums.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 10 — Возврат на прошлые ветки  (Level 3, ~25 min)
 * ========================================================================= */
const trans_past_branches = makePractice(
  'trans_past_branches',
  'Возврат на прошлые ветки',
  'Техника ментального возврата к ключевым моментам прошлого для изменения отношения к ним.',
  3,
  25,
  ['ПТСР, травматические переживания'],
  ['прошлое', 'ветки', 'исцеление'],
  [
    { kind: 'voice', textKey: 'trans_past_branches.preparation', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'trans_past_branches.induction', durationSec: 60, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'trans_past_branches.deepening', durationSec: 30, phase: 'deepening', optionalTts: false },
    { kind: 'voice', textKey: 'trans_past_branches.branch_concept', durationSec: 80, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'trans_past_branches.selecting_moment', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'trans_past_branches.rewriting', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'trans_past_branches.return', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'trans_past_branches.integration', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'trans_past_branches.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 11 — Внешнее намерение  (Level 3, ~25 min)
 * ========================================================================= */
const trans_outer_intention = makePractice(
  'trans_outer_intention',
  'Внешнее намерение',
  'Переход от внутреннего к внешнему намерению — ключевой навык эффективного трансерфера.',
  3,
  25,
  [],
  ['внешнее намерение', 'продвинутый', 'трансерфинг'],
  [
    { kind: 'voice', textKey: 'trans_outer_intention.preparation', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'trans_outer_intention.induction', durationSec: 60, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'trans_outer_intention.deepening', durationSec: 30, phase: 'deepening', optionalTts: false },
    { kind: 'voice', textKey: 'trans_outer_intention.inner_vs_outer', durationSec: 90, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'trans_outer_intention.feeling_outer', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'trans_outer_intention.application', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'trans_outer_intention.integration', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'trans_outer_intention.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 12 — Созвездие целей  (Level 4, ~30 min)
 * ========================================================================= */
const trans_goal_constellation = makePractice(
  'trans_goal_constellation',
  'Созвездие целей',
  'Интегративная практика создания единой картины целей. Связывает отдельные намерения в согласованную систему.',
  4,
  30,
  ['Биполярное расстройство в фазе обострения'],
  ['цели', 'созвездие', 'интеграция'],
  [
    { kind: 'voice', textKey: 'trans_goal_constellation.preparation', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'trans_goal_constellation.induction', durationSec: 60, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'trans_goal_constellation.deepening', durationSec: 30, phase: 'deepening', optionalTts: false },
    { kind: 'voice', textKey: 'trans_goal_constellation.sky_concept', durationSec: 80, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'trans_goal_constellation.placing_stars', durationSec: 90, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'trans_goal_constellation.connecting_lines', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'trans_goal_constellation.harmonizing', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'trans_goal_constellation.integration', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'trans_goal_constellation.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 13 — Путь путника  (Level 4, ~30 min)
 * ========================================================================= */
const trans_wanderer_path = makePractice(
  'trans_wanderer_path',
  'Путь путника',
  'Философская практика принятия жизни как путешествия. Учит двигаться без привязанности к результату.',
  4,
  30,
  [],
  ['путь', 'принятие', 'философия'],
  [
    { kind: 'voice', textKey: 'trans_wanderer_path.preparation', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'trans_wanderer_path.induction', durationSec: 60, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'trans_wanderer_path.deepening', durationSec: 30, phase: 'deepening', optionalTts: false },
    { kind: 'voice', textKey: 'trans_wanderer_path.wanderer_concept', durationSec: 90, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'trans_wanderer_path.walking_meditation', durationSec: 90, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'trans_wanderer_path.encounters', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'trans_wanderer_path.integration', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'trans_wanderer_path.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 14 — Единство души и разума  (Level 5, ~35 min)
 * ========================================================================= */
const trans_soul_mind_unity = makePractice(
  'trans_soul_mind_unity',
  'Единство души и разума',
  'Финальная практика: синхронизация душевного и ментального планов. Создаёт целостное восприятие реальности.',
  5,
  35,
  ['Психотические расстройства, шизофрения'],
  ['единство', 'душа', 'разум', 'мастерство'],
  [
    { kind: 'voice', textKey: 'trans_soul_mind_unity.preparation', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'trans_soul_mind_unity.induction', durationSec: 60, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'trans_soul_mind_unity.deepening', durationSec: 45, phase: 'deepening', optionalTts: false },
    { kind: 'voice', textKey: 'trans_soul_mind_unity.unity_concept', durationSec: 90, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'trans_soul_mind_unity.mind_layer', durationSec: 75, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'trans_soul_mind_unity.soul_layer', durationSec: 75, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'trans_soul_mind_unity.merging', durationSec: 90, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 30 },
    { kind: 'voice', textKey: 'trans_soul_mind_unity.integration', durationSec: 45, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'trans_soul_mind_unity.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Export: all 14 Transurfing practices
 * ========================================================================= */
export const transurfingPractices: Practice[] = [
  trans_lower_importance,
  trans_wave_dampener,
  trans_variant_space,
  trans_attention_control,
  trans_reality_mirror,
  trans_world_slide,
  trans_archer_butterfly,
  trans_create_intention,
  trans_pendulums,
  trans_past_branches,
  trans_outer_intention,
  trans_goal_constellation,
  trans_wanderer_path,
  trans_soul_mind_unity,
];
