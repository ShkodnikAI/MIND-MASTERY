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
    systemId: 'dispenza',
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
 * Practice 1 — Становление сверхъестественным  (Level 1, ~20 min)
 * ========================================================================= */
const disp_becoming_supernatural = makePractice(
  'disp_becoming_supernatural',
  'Становление сверхъестественным',
  'Вводная медитация Джо Диспензы. Знакомит с концепцией квантового поля и потенциала трансформации.',
  1,
  20,
  [],
  ['основы', 'квантовое поле', 'трансформация'],
  [
    { kind: 'voice', textKey: 'disp_becoming_supernatural.preparation', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'disp_becoming_supernatural.induction', durationSec: 60, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'disp_becoming_supernatural.deepening', durationSec: 30, phase: 'deepening', optionalTts: false },
    { kind: 'voice', textKey: 'disp_becoming_supernatural.quantum_concept', durationSec: 90, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'disp_becoming_supernatural.potential_feeling', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'disp_becoming_supernatural.integration', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'disp_becoming_supernatural.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 2 — Благословённые клетки  (Level 1, ~20 min)
 * ========================================================================= */
const disp_blessed_cells = makePractice(
  'disp_blessed_cells',
  'Благословённые клетки',
  'Медитация исцеления на клеточном уровне. Направляет внимание внутрь тела для активации регенерации.',
  1,
  20,
  [],
  ['клетки', 'исцеление', 'тело'],
  [
    { kind: 'voice', textKey: 'disp_blessed_cells.preparation', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'disp_blessed_cells.induction', durationSec: 60, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'disp_blessed_cells.deepening', durationSec: 30, phase: 'deepening', optionalTts: false },
    { kind: 'voice', textKey: 'disp_blessed_cells.entering_body', durationSec: 75, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'disp_blessed_cells.cell_blessing', durationSec: 90, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'disp_blessed_cells.regeneration', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'disp_blessed_cells.integration', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'disp_blessed_cells.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 3 — Сердечная когерентность  (Level 1, ~15 min)
 * ========================================================================= */
const disp_heart_coherence = makePractice(
  'disp_heart_coherence',
  'Сердечная когерентность',
  'Медитация synchronisation сердца и мозга. Создаёт элетромагнитное поле сердечной когерентности.',
  1,
  15,
  ['Сердечно-сосудистые заболевания (консультация врача)'],
  ['сердце', 'когерентность', 'ритм'],
  [
    { kind: 'voice', textKey: 'disp_heart_coherence.preparation', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'disp_heart_coherence.induction', durationSec: 60, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'disp_heart_coherence.deepening', durationSec: 30, phase: 'deepening', optionalTts: false },
    { kind: 'voice', textKey: 'disp_heart_coherence.heart_focus', durationSec: 75, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'disp_heart_coherence.coherence_breathing', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'disp_heart_coherence.expansion', durationSec: 45, phase: 'work', optionalTts: false },
    { kind: 'voice', textKey: 'disp_heart_coherence.integration', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'disp_heart_coherence.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 4 — Индукция по частям тела  (Level 1, ~25 min)
 * ========================================================================= */
const disp_body_parts_induction = makePractice(
  'disp_body_parts_induction',
  'Индукция по частям тела',
  'Глубокая релаксация через последовательное осознание каждой части тела. Фундаментальная практика.',
  1,
  25,
  [],
  ['тело', 'расслабление', 'индукция'],
  [
    { kind: 'voice', textKey: 'disp_body_parts_induction.preparation', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'disp_body_parts_induction.induction', durationSec: 60, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'disp_body_parts_induction.head_face', durationSec: 60, phase: 'deepening', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'disp_body_parts_induction.neck_shoulders', durationSec: 60, phase: 'deepening', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'disp_body_parts_induction.torso', durationSec: 60, phase: 'deepening', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'disp_body_parts_induction.arms_hands', durationSec: 60, phase: 'deepening', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'disp_body_parts_induction.legs_feet', durationSec: 60, phase: 'deepening', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'disp_body_parts_induction.whole_body', durationSec: 30, phase: 'work', optionalTts: false },
    { kind: 'voice', textKey: 'disp_body_parts_induction.integration', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'disp_body_parts_induction.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 5 — Пространство-время  (Level 2, ~25 min)
 * ========================================================================= */
const disp_space_time = makePractice(
  'disp_space_time',
  'Пространство-время',
  'Медитация выхода за пределы линейного времени. Перемещение внимания в квантовое поле.',
  2,
  25,
  ['Диссоциативные расстройства'],
  ['пространство', 'время', 'квантовое поле'],
  [
    { kind: 'voice', textKey: 'disp_space_time.preparation', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'disp_space_time.induction', durationSec: 60, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'disp_space_time.deepening', durationSec: 45, phase: 'deepening', optionalTts: false },
    { kind: 'voice', textKey: 'disp_space_time.dissolving_matter', durationSec: 75, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'disp_space_time.entering_void', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 30 },
    { kind: 'voice', textKey: 'disp_space_time.quantum_field', durationSec: 75, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'disp_space_time.integration', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'disp_space_time.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 6 — Исцеляющая медитация  (Level 2, ~30 min)
 * ========================================================================= */
const disp_healing_meditation = makePractice(
  'disp_healing_meditation',
  'Исцеляющая медитация',
  'Глубокая медитация самовосстановления. Активация врождённой способности организма к исцелению.',
  2,
  30,
  ['Онкологические заболевания (с согласия лечащего врача)', 'Беременность'],
  ['исцеление', 'восстановление', 'энергия'],
  [
    { kind: 'voice', textKey: 'disp_healing_meditation.preparation', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'disp_healing_meditation.induction', durationSec: 60, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'disp_healing_meditation.deepening', durationSec: 45, phase: 'deepening', optionalTts: false },
    { kind: 'voice', textKey: 'disp_healing_meditation.becoming_no_body', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'disp_healing_meditation.energetic_centers', durationSec: 75, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'disp_healing_meditation.rebuilding', durationSec: 90, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'disp_healing_meditation.gratitude', durationSec: 45, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'disp_healing_meditation.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 7 — Изменение убеждений  (Level 2, ~25 min)
 * ========================================================================= */
const disp_changing_beliefs = makePractice(
  'disp_changing_beliefs',
  'Изменение убеждений',
  'Медитация для перепрограммирования подсознательных убеждений на нейронном уровне.',
  2,
  25,
  ['Психотические расстройства'],
  ['убеждения', 'перепрограммирование', 'нейроны'],
  [
    { kind: 'voice', textKey: 'disp_changing_beliefs.preparation', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'disp_changing_beliefs.induction', durationSec: 60, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'disp_changing_beliefs.deepening', durationSec: 30, phase: 'deepening', optionalTts: false },
    { kind: 'voice', textKey: 'disp_changing_beliefs.belief_concept', durationSec: 75, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'disp_changing_beliefs.identifying_limiting', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'disp_changing_beliefs.unwiring', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'disp_changing_beliefs.rewiring', durationSec: 75, phase: 'work', optionalTts: false },
    { kind: 'voice', textKey: 'disp_changing_beliefs.integration', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'disp_changing_beliefs.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 8 — Освобождение от эмоциональной зависимости  (Level 2, ~25 min)
 * ========================================================================= */
const disp_emotional_addiction = makePractice(
  'disp_emotional_addiction',
  'Освобождение от эмоциональной зависимости',
  'Медитация разрыва паттернов эмоциональной зависимости. Прерывает цикл автоматических эмоциональных реакций.',
  2,
  25,
  ['Клиническая депрессия (без сопровождения специалиста)'],
  ['эмоции', 'зависимость', 'свобода'],
  [
    { kind: 'voice', textKey: 'disp_emotional_addiction.preparation', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'disp_emotional_addiction.induction', durationSec: 60, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'disp_emotional_addiction.deepening', durationSec: 30, phase: 'deepening', optionalTts: false },
    { kind: 'voice', textKey: 'disp_emotional_addiction.addiction_concept', durationSec: 75, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'disp_emotional_addiction.observing_emotions', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'disp_emotional_addiction.body_sensations', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'disp_emotional_addiction.liberation', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'voice', textKey: 'disp_emotional_addiction.integration', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'disp_emotional_addiction.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 9 — Генеративная медитация  (Level 3, ~30 min)
 * ========================================================================= */
const disp_generative_meditation = makePractice(
  'disp_generative_meditation',
  'Генеративная медитация',
  'Медитация создания нового будущего. Синтезирует все базовые техники в единый процесс созидания.',
  3,
  30,
  [],
  ['генерация', 'будущее', 'созидание'],
  [
    { kind: 'voice', textKey: 'disp_generative_meditation.preparation', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'disp_generative_meditation.induction', durationSec: 60, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'disp_generative_meditation.deepening', durationSec: 45, phase: 'deepening', optionalTts: false },
    { kind: 'voice', textKey: 'disp_generative_meditation.becoming_nothing', durationSec: 75, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'disp_generative_meditation.entering_field', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'disp_generative_meditation.creating_future', durationSec: 90, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 30 },
    { kind: 'voice', textKey: 'disp_generative_meditation.embodying', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'voice', textKey: 'disp_generative_meditation.integration', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'disp_generative_meditation.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 10 — Доступ к квантовому полю  (Level 3, ~30 min)
 * ========================================================================= */
const disp_quantum_field = makePractice(
  'disp_quantum_field',
  'Доступ к квантовому полю',
  'Продвинутая медитация для выхода за пределы материального мира и доступа к бесконечным возможностям.',
  3,
  30,
  ['Шизоидные расстройства'],
  ['квантовое поле', 'бесконечность', 'потенциал'],
  [
    { kind: 'voice', textKey: 'disp_quantum_field.preparation', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'disp_quantum_field.induction', durationSec: 60, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'disp_quantum_field.deepening', durationSec: 45, phase: 'deepening', optionalTts: false },
    { kind: 'voice', textKey: 'disp_quantum_field.crossing_threshold', durationSec: 75, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 30 },
    { kind: 'voice', textKey: 'disp_quantum_field.in_the_field', durationSec: 90, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 30 },
    { kind: 'voice', textKey: 'disp_quantum_field.receiving_potentials', durationSec: 75, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'disp_quantum_field.returning', durationSec: 45, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'disp_quantum_field.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 11 — Настройка на новые возможности  (Level 3, ~25 min)
 * ========================================================================= */
const disp_new_potentials = makePractice(
  'disp_new_potentials',
  'Настройка на новые возможности',
  'Медитация настройки нервной системы на новые уровни реальности. Подготовка тела к будущим изменениям.',
  3,
  25,
  [],
  ['возможности', 'настройка', 'нервная система'],
  [
    { kind: 'voice', textKey: 'disp_new_potentials.preparation', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'disp_new_potentials.induction', durationSec: 60, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'disp_new_potentials.deepening', durationSec: 30, phase: 'deepening', optionalTts: false },
    { kind: 'voice', textKey: 'disp_new_potentials.exploring_potentials', durationSec: 75, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'disp_new_potentials.choosing_frequency', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'disp_new_potentials.tuning_nervous_system', durationSec: 75, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'disp_new_potentials.integration', durationSec: 30, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'disp_new_potentials.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 12 — Ходьба творения  (Level 4, ~35 min)
 * ========================================================================= */
const disp_walking_creation = makePractice(
  'disp_walking_creation',
  'Ходьба творения',
  'Медитация объединения состояния бытия с физическим действием. Приносит трансформацию в движение.',
  4,
  35,
  ['Травмы нижних конечностей, нарушения координации'],
  ['ходьба', 'творение', 'действие'],
  [
    { kind: 'voice', textKey: 'disp_walking_creation.preparation', durationSec: 45, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 5 },
    { kind: 'voice', textKey: 'disp_walking_creation.induction', durationSec: 60, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'disp_walking_creation.deepening', durationSec: 45, phase: 'deepening', optionalTts: false },
    { kind: 'voice', textKey: 'disp_walking_creation.entering_state', durationSec: 75, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'disp_walking_creation.preparing_movement', durationSec: 60, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 15 },
    { kind: 'voice', textKey: 'disp_walking_creation.conscious_walking', durationSec: 90, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 30 },
    { kind: 'voice', textKey: 'disp_walking_creation.integrating', durationSec: 60, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'disp_walking_creation.reorientation', durationSec: 30, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Practice 13 — Быть сверхъестественным  (Level 5, ~45 min)
 * ========================================================================= */
const disp_being_supernatural = makePractice(
  'disp_being_supernatural',
  'Быть сверхъестественным',
  'Финальная практика полного цикла: от организма к квантовому полю и обратно — как новый человек.',
  5,
  45,
  ['Все тяжёлые психические расстройства'],
  ['мастерство', 'трансформация', 'квантовое поле'],
  [
    { kind: 'voice', textKey: 'disp_being_supernatural.preparation', durationSec: 60, phase: 'preparation', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'disp_being_supernatural.induction', durationSec: 60, phase: 'induction', optionalTts: false },
    { kind: 'silence', durationSec: 10 },
    { kind: 'voice', textKey: 'disp_being_supernatural.deepening', durationSec: 45, phase: 'deepening', optionalTts: false },
    { kind: 'voice', textKey: 'disp_being_supernatural.leaving_body', durationSec: 75, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 30 },
    { kind: 'voice', textKey: 'disp_being_supernatural.quantum_entry', durationSec: 90, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 30 },
    { kind: 'voice', textKey: 'disp_being_supernatural.new_identity', durationSec: 90, phase: 'work', optionalTts: false },
    { kind: 'silence', durationSec: 30 },
    { kind: 'voice', textKey: 'disp_being_supernatural.returning_transformed', durationSec: 75, phase: 'integration', optionalTts: false },
    { kind: 'silence', durationSec: 20 },
    { kind: 'voice', textKey: 'disp_being_supernatural.anchoring', durationSec: 45, phase: 'integration', optionalTts: false },
    { kind: 'voice', textKey: 'disp_being_supernatural.reorientation', durationSec: 45, phase: 'reorientation', optionalTts: false },
  ],
);

/* =========================================================================
 * Export: all 13 Dispenza practices
 * ========================================================================= */
export const dispenzaPractices: Practice[] = [
  disp_becoming_supernatural,
  disp_blessed_cells,
  disp_heart_coherence,
  disp_body_parts_induction,
  disp_space_time,
  disp_healing_meditation,
  disp_changing_beliefs,
  disp_emotional_addiction,
  disp_generative_meditation,
  disp_quantum_field,
  disp_new_potentials,
  disp_walking_creation,
  disp_being_supernatural,
];
