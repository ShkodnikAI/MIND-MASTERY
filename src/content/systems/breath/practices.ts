import type { Practice, Segment, SessionLength } from '@/types';

const ALL_LENGTHS: SessionLength[] = ['short', 'medium', 'full'];

type DiffMap = {
  [level: number]: 'beginner' | 'elementary' | 'intermediate' | 'advanced';
};

const DIFF_MAP: DiffMap = {
  1: 'beginner',
  2: 'elementary',
  3: 'intermediate',
  4: 'advanced',
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
    systemId: 'breath',
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
 * Practice 1 — Диафрагмальное дыхание  (Level 1, ~10 min)
 * ========================================================================= */
const breath_diaphragmatic = makePractice(
  'breath_diaphragmatic',
  'Диафрагмальное дыхание',
  'Базовая техника полного дыхания животом. Активирует парасимпатическую нервную систему и снижает стресс.',
  1,
  10,
  [],
  ['основы', 'диафрагма', 'расслабление'],
  [
    { kind: 'voice', textKey: 'breath_diaphragmatic.preparation', durationSec: 30, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'breath_diaphragmatic.exploring_breath', durationSec: 30, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'breath_diaphragmatic.hand_placement', durationSec: 30, phase: 'deepening', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'breath_diaphragmatic.practice_start', durationSec: 30, phase: 'work', optionalTts: true },
    { kind: 'silence', durationSec: 180 },
    { kind: 'voice', textKey: 'breath_diaphragmatic.deepening', durationSec: 30, phase: 'work', optionalTts: true },
    { kind: 'silence', durationSec: 120 },
    { kind: 'voice', textKey: 'breath_diaphragmatic.integration', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'breath_diaphragmatic.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 2 — Квадратное дыхание  (Level 1, ~10 min)
 * ========================================================================= */
const breath_box = makePractice(
  'breath_box',
  'Квадратное дыхание',
  'Техника «4-4-4-4»: вдох — задержка — выдох — задержка. Уравновешивает нервную систему.',
  1,
  10,
  [],
  ['основы', 'квадратное', 'баланс'],
  [
    { kind: 'voice', textKey: 'breath_box.preparation', durationSec: 30, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'breath_box.rhythm_concept', durationSec: 30, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'breath_box.learning_pattern', durationSec: 45, phase: 'deepening', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'breath_box.practice_start', durationSec: 20, phase: 'work', optionalTts: true },
    { kind: 'silence', durationSec: 240 },
    { kind: 'voice', textKey: 'breath_box.extension', durationSec: 30, phase: 'work', optionalTts: true },
    { kind: 'silence', durationSec: 120 },
    { kind: 'voice', textKey: 'breath_box.integration', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'breath_box.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 3 — Дыхание 4-7-8  (Level 1, ~10 min)
 * ========================================================================= */
const breath_478 = makePractice(
  'breath_478',
  'Дыхание 4-7-8',
  'Техника доктора Вейла: вдох 4 секунды — задержка 7 секунд — выдох 8 секунд. Эффективно для сна.',
  1,
  10,
  [],
  ['основы', 'сон', 'расслабление'],
  [
    { kind: 'voice', textKey: 'breath_478.preparation', durationSec: 30, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'breath_478.method_intro', durationSec: 30, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'breath_478.learning_counts', durationSec: 45, phase: 'deepening', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'breath_478.practice_start', durationSec: 20, phase: 'work', optionalTts: true },
    { kind: 'silence', durationSec: 240 },
    { kind: 'voice', textKey: 'breath_478.deepening', durationSec: 20, phase: 'work', optionalTts: true },
    { kind: 'silence', durationSec: 120 },
    { kind: 'voice', textKey: 'breath_478.integration', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'breath_478.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 4 — Когерентное дыхание  (Level 2, ~15 min)
 * ========================================================================= */
const breath_coherent = makePractice(
  'breath_coherent',
  'Когерентное дыхание',
  'Дыхание с частотой 5-6 дыханий в минуту. Оптимизирует вариабельность сердечного ритма.',
  2,
  15,
  ['Тяжёлые аритмии'],
  ['когерентность', 'сердце', 'ритм'],
  [
    { kind: 'voice', textKey: 'breath_coherent.preparation', durationSec: 30, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'breath_coherent.hrv_concept', durationSec: 45, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'breath_coherent.finding_rhythm', durationSec: 30, phase: 'deepening', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'breath_coherent.practice_start', durationSec: 20, phase: 'work', optionalTts: true },
    { kind: 'silence', durationSec: 300 },
    { kind: 'voice', textKey: 'breath_coherent.heart_connection', durationSec: 30, phase: 'work', optionalTts: true },
    { kind: 'silence', durationSec: 180 },
    { kind: 'voice', textKey: 'breath_coherent.integration', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'breath_coherent.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 5 — Дыхание Вима Хофа (щадящее)  (Level 2, ~15 min)
 * ========================================================================= */
const breath_wim_hof = makePractice(
  'breath_wim_hof',
  'Дыхание Вима Хофа (щадящее)',
  'Консервативная версия дыхания Вима Хофа с мягкой гипервентиляцией. Укрепляет иммунную систему.',
  2,
  15,
  [
    'Эпилепсия',
    'Сердечно-сосудистые заболевания',
    'Беременность',
    'Панические расстройства',
    'Требуется согласие пользователя перед началом',
  ],
  ['вим хоф', 'гипервентиляция', 'иммунитет'],
  [
    { kind: 'voice', textKey: 'breath_wim_hof.consent', durationSec: 30, phase: 'preparation', optionalTts: false },
    { kind: 'voice', textKey: 'breath_wim_hof.preparation', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'breath_wim_hof.safety_rules', durationSec: 60, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'breath_wim_hof.learning_pattern', durationSec: 30, phase: 'deepening', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'breath_wim_hof.first_round', durationSec: 20, phase: 'work', optionalTts: true },
    { kind: 'silence', durationSec: 90 },
    { kind: 'voice', textKey: 'breath_wim_hof.retention', durationSec: 15, phase: 'work', optionalTts: true },
    { kind: 'silence', durationSec: 60 },
    { kind: 'voice', textKey: 'breath_wim_hof.recovery_breath', durationSec: 15, phase: 'work', optionalTts: true },
    { kind: 'silence', durationSec: 30 },
    { kind: 'voice', textKey: 'breath_wim_hof.second_round', durationSec: 15, phase: 'work', optionalTts: true },
    { kind: 'silence', durationSec: 90 },
    { kind: 'voice', textKey: 'breath_wim_hof.retention_2', durationSec: 15, phase: 'work', optionalTts: true },
    { kind: 'silence', durationSec: 60 },
    { kind: 'voice', textKey: 'breath_wim_hof.integration', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'breath_wim_hof.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 6 — Холотропное дыхание (мягкое)  (Level 3, ~20 min)
 * ========================================================================= */
const breath_holotropic = makePractice(
  'breath_holotropic',
  'Холотропное дыхание (мягкое)',
  'Адаптированная версия холотропного дыхания Станислава Грофа. Используется с согласия и без музыки.',
  3,
  20,
  [
    'Эпилепсия',
    'Шизофрения и психотические расстройства',
    'Сердечно-сосудистые заболевания',
    'Беременность',
    'ПТСР (без сопровождения терапевта)',
    'Обязательно требуется подтверждение согласия перед началом',
  ],
  ['холотропное', 'гроф', 'глубокое'],
  [
    { kind: 'voice', textKey: 'breath_holotropic.consent', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'voice', textKey: 'breath_holotropic.preparation', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'breath_holotropic.safety_guidelines', durationSec: 60, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'breath_holotropic.breathing_pattern', durationSec: 45, phase: 'deepening', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'breath_holotropic.entering_session', durationSec: 20, phase: 'work', optionalTts: true },
    { kind: 'silence', durationSec: 300 },
    { kind: 'voice', textKey: 'breath_holotropic.maintaining', durationSec: 15, phase: 'work', optionalTts: true },
    { kind: 'silence', durationSec: 300 },
    { kind: 'voice', textKey: 'breath_holotropic.gradual_return', durationSec: 45, phase: 'integration', optionalTts: false },
    { kind: 'silence', durationSec: 60 },
    { kind: 'voice', textKey: 'breath_holotropic.grounding', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'breath_holotropic.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 7 — Пранаяма  (Level 3, ~15 min)
 * ========================================================================= */
const breath_pranayama = makePractice(
  'breath_pranayama',
  'Пранаяма',
  'Йогические дыхательные техники: нади шодхана (очищение каналов) и капалабхати (сияющий череп).',
  3,
  15,
  ['Глаукома, внутричерепная гипертензия', 'Язва желудка в обострении'],
  ['пранаяма', 'йога', 'нади шодхана'],
  [
    { kind: 'voice', textKey: 'breath_pranayama.preparation', durationSec: 30, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'breath_pranayama.prana_concept', durationSec: 45, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'breath_pranayama.nadi_shodhana_intro', durationSec: 45, phase: 'deepening', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'breath_pranayama.nadi_shodhana_practice', durationSec: 20, phase: 'work', optionalTts: true },
    { kind: 'silence', durationSec: 240 },
    { kind: 'voice', textKey: 'breath_pranayama.kapalabhati_intro', durationSec: 30, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'breath_pranayama.kapalabhati_practice', durationSec: 15, phase: 'work', optionalTts: true },
    { kind: 'silence', durationSec: 120 },
    { kind: 'voice', textKey: 'breath_pranayama.integration', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'breath_pranayama.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 8 — Дыхание для сна  (Level 1, ~10 min)
 * ========================================================================= */
const breath_for_sleep = makePractice(
  'breath_for_sleep',
  'Дыхание для сна',
  'Комбинация мягких техник для подготовки ко сну. Продлевающийся выдох с подсчётом.',
  1,
  10,
  [],
  ['сон', 'вечер', 'расслабление'],
  [
    { kind: 'voice', textKey: 'breath_for_sleep.preparation', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'breath_for_sleep.settling', durationSec: 30, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'breath_for_sleep.extended_exhale', durationSec: 30, phase: 'deepening', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'breath_for_sleep.gentle_practice', durationSec: 20, phase: 'work', optionalTts: true },
    { kind: 'silence', durationSec: 180 },
    { kind: 'voice', textKey: 'breath_for_sleep.deepening', durationSec: 20, phase: 'work', optionalTts: true },
    { kind: 'silence', durationSec: 180 },
    { kind: 'voice', textKey: 'breath_for_sleep.letting_go', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'silence', durationSec: 60 },
    { kind: 'voice', textKey: 'breath_for_sleep.drifting', durationSec: 20, phase: 'reorientation', optionalTts: true },
  ],
);

/* =========================================================================
 * Export: all 8 Breath practices
 * ========================================================================= */
export const breathPractices: Practice[] = [
  breath_diaphragmatic,
  breath_box,
  breath_478,
  breath_coherent,
  breath_wim_hof,
  breath_holotropic,
  breath_pranayama,
  breath_for_sleep,
];
