import type { Practice } from '@/types';
import { makePractice, DIFF_MAP_4 } from '@/content/utils';

/* =========================================================================
 * Practice 1 — Диагностика текущей частоты  (Level 1, ~10 min)
 * ========================================================================= */
const dfp_diagnosis = makePractice(
  'domfreq',
  DIFF_MAP_4,
  'dfp_diagnosis',
  'Диагностика текущей частоты',
  'Сканирование телесных ощущений, эмоций и мыслей для определения базовой частоты вашего сознания.',
  1,
  10,
  [],
  ['диагностика', 'частота', 'базовое состояние'],
  [
    {
      kind: 'voice',
      textKey: 'dfp_diagnosis.preparation',
      durationSec: 30,
      phase: 'preparation',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 5 },
    {
      kind: 'voice',
      textKey: 'dfp_diagnosis.exploring',
      durationSec: 30,
      phase: 'induction',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 10 },
    {
      kind: 'voice',
      textKey: 'dfp_diagnosis.scanning',
      durationSec: 45,
      phase: 'deepening',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 10 },
    {
      kind: 'voice',
      textKey: 'dfp_diagnosis.practice',
      durationSec: 20,
      phase: 'work',
      optionalTts: true,
    },
    { kind: 'silence', durationSec: 180 },
    {
      kind: 'voice',
      textKey: 'dfp_diagnosis.deepening',
      durationSec: 20,
      phase: 'work',
      optionalTts: true,
    },
    { kind: 'silence', durationSec: 120 },
    {
      kind: 'voice',
      textKey: 'dfp_diagnosis.integration',
      durationSec: 30,
      phase: 'integration',
      optionalTts: false,
    },
    {
      kind: 'voice',
      textKey: 'dfp_diagnosis.reorientation',
      durationSec: 30,
      phase: 'reorientation',
      optionalTts: false,
    },
  ],
);

/* =========================================================================
 * Practice 2 — Сканирование нейроритмов  (Level 1, ~10 min)
 * ========================================================================= */
const dfp_body_scan = makePractice(
  'domfreq',
  DIFF_MAP_4,
  'dfp_body_scan',
  'Сканирование нейроритмов',
  'Телесное сканирование в сочетании с осознанностью дыхания для картирования нейронных паттернов.',
  1,
  10,
  [],
  ['сканирование', 'тело', 'нейроритмы'],
  [
    {
      kind: 'voice',
      textKey: 'dfp_body_scan.preparation',
      durationSec: 30,
      phase: 'preparation',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 5 },
    {
      kind: 'voice',
      textKey: 'dfp_body_scan.awareness',
      durationSec: 30,
      phase: 'induction',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 10 },
    {
      kind: 'voice',
      textKey: 'dfp_body_scan.mapping',
      durationSec: 45,
      phase: 'deepening',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 10 },
    {
      kind: 'voice',
      textKey: 'dfp_body_scan.practice',
      durationSec: 20,
      phase: 'work',
      optionalTts: true,
    },
    { kind: 'silence', durationSec: 180 },
    {
      kind: 'voice',
      textKey: 'dfp_body_scan.deepening',
      durationSec: 20,
      phase: 'work',
      optionalTts: true,
    },
    { kind: 'silence', durationSec: 120 },
    {
      kind: 'voice',
      textKey: 'dfp_body_scan.integration',
      durationSec: 30,
      phase: 'integration',
      optionalTts: false,
    },
    {
      kind: 'voice',
      textKey: 'dfp_body_scan.reorientation',
      durationSec: 30,
      phase: 'reorientation',
      optionalTts: false,
    },
  ],
);

/* =========================================================================
 * Practice 3 — Калибровка альфа-состояния  (Level 1, ~10 min)
 * ========================================================================= */
const dfp_alpha_calibration = makePractice(
  'domfreq',
  DIFF_MAP_4,
  'dfp_alpha_calibration',
  'Калибровка альфа-состояния',
  'Индукция альфа-ритмов мозга через прогрессирующее расслабление и визуализацию.',
  1,
  10,
  [],
  ['альфа', 'расслабление', 'визуализация'],
  [
    {
      kind: 'voice',
      textKey: 'dfp_alpha_calibration.preparation',
      durationSec: 30,
      phase: 'preparation',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 5 },
    {
      kind: 'voice',
      textKey: 'dfp_alpha_calibration.induction',
      durationSec: 30,
      phase: 'induction',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 10 },
    {
      kind: 'voice',
      textKey: 'dfp_alpha_calibration.deepening',
      durationSec: 45,
      phase: 'deepening',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 10 },
    {
      kind: 'voice',
      textKey: 'dfp_alpha_calibration.practice',
      durationSec: 20,
      phase: 'work',
      optionalTts: true,
    },
    { kind: 'silence', durationSec: 180 },
    {
      kind: 'voice',
      textKey: 'dfp_alpha_calibration.deepening2',
      durationSec: 20,
      phase: 'work',
      optionalTts: true,
    },
    { kind: 'silence', durationSec: 120 },
    {
      kind: 'voice',
      textKey: 'dfp_alpha_calibration.integration',
      durationSec: 30,
      phase: 'integration',
      optionalTts: false,
    },
    {
      kind: 'voice',
      textKey: 'dfp_alpha_calibration.reorientation',
      durationSec: 30,
      phase: 'reorientation',
      optionalTts: false,
    },
  ],
);

/* =========================================================================
 * Practice 4 — Фокусировка намерения  (Level 1, ~10 min)
 * ========================================================================= */
const dfp_focus_lock = makePractice(
  'domfreq',
  DIFF_MAP_4,
  'dfp_focus_lock',
  'Фокусировка намерения',
  'Одноточечная концентрация для усиления чёткости сигнала вашего намерения (концепция DFP День 1).',
  1,
  10,
  [],
  ['фокус', 'намерение', 'концентрация'],
  [
    {
      kind: 'voice',
      textKey: 'dfp_focus_lock.preparation',
      durationSec: 30,
      phase: 'preparation',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 5 },
    {
      kind: 'voice',
      textKey: 'dfp_focus_lock.intention',
      durationSec: 30,
      phase: 'induction',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 10 },
    {
      kind: 'voice',
      textKey: 'dfp_focus_lock.sharpening',
      durationSec: 45,
      phase: 'deepening',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 10 },
    {
      kind: 'voice',
      textKey: 'dfp_focus_lock.practice',
      durationSec: 20,
      phase: 'work',
      optionalTts: true,
    },
    { kind: 'silence', durationSec: 180 },
    {
      kind: 'voice',
      textKey: 'dfp_focus_lock.deepening',
      durationSec: 20,
      phase: 'work',
      optionalTts: true,
    },
    { kind: 'silence', durationSec: 120 },
    {
      kind: 'voice',
      textKey: 'dfp_focus_lock.integration',
      durationSec: 30,
      phase: 'integration',
      optionalTts: false,
    },
    {
      kind: 'voice',
      textKey: 'dfp_focus_lock.reorientation',
      durationSec: 30,
      phase: 'reorientation',
      optionalTts: false,
    },
  ],
);

/* =========================================================================
 * Practice 5 — Эмоциональное насыщение  (Level 2, ~15 min)
 * ========================================================================= */
const dfp_emotional_saturation = makePractice(
  'domfreq',
  DIFF_MAP_4,
  'dfp_emotional_saturation',
  'Эмоциональное насыщение',
  'Генерация эмоциональной частоты желаемой реальности — соединение мысли с чувством (DFP День 2).',
  2,
  15,
  [],
  ['эмоции', 'насыщение', 'частота'],
  [
    {
      kind: 'voice',
      textKey: 'dfp_emotional_saturation.preparation',
      durationSec: 30,
      phase: 'preparation',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 5 },
    {
      kind: 'voice',
      textKey: 'dfp_emotional_saturation.exploring',
      durationSec: 45,
      phase: 'induction',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 10 },
    {
      kind: 'voice',
      textKey: 'dfp_emotional_saturation.building',
      durationSec: 30,
      phase: 'deepening',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 10 },
    {
      kind: 'voice',
      textKey: 'dfp_emotional_saturation.practice',
      durationSec: 20,
      phase: 'work',
      optionalTts: true,
    },
    { kind: 'silence', durationSec: 240 },
    {
      kind: 'voice',
      textKey: 'dfp_emotional_saturation.deepening',
      durationSec: 30,
      phase: 'work',
      optionalTts: true,
    },
    { kind: 'silence', durationSec: 180 },
    {
      kind: 'voice',
      textKey: 'dfp_emotional_saturation.integration',
      durationSec: 30,
      phase: 'integration',
      optionalTts: false,
    },
    {
      kind: 'voice',
      textKey: 'dfp_emotional_saturation.reorientation',
      durationSec: 30,
      phase: 'reorientation',
      optionalTts: false,
    },
  ],
);

/* =========================================================================
 * Practice 6 — Ноль противоречий  (Level 2, ~15 min)
 * ========================================================================= */
const dfp_zero_contradictions = makePractice(
  'domfreq',
  DIFF_MAP_4,
  'dfp_zero_contradictions',
  'Ноль противоречий',
  'Устранение внутреннего конфликта и смешанных сигналов — согласование слов, мыслей, эмоций и действий (DFP День 3).',
  2,
  15,
  [],
  ['противоречия', 'согласование', 'целостность'],
  [
    {
      kind: 'voice',
      textKey: 'dfp_zero_contradictions.preparation',
      durationSec: 30,
      phase: 'preparation',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 5 },
    {
      kind: 'voice',
      textKey: 'dfp_zero_contradictions.exploring',
      durationSec: 45,
      phase: 'induction',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 10 },
    {
      kind: 'voice',
      textKey: 'dfp_zero_contradictions.alignment',
      durationSec: 30,
      phase: 'deepening',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 10 },
    {
      kind: 'voice',
      textKey: 'dfp_zero_contradictions.practice',
      durationSec: 20,
      phase: 'work',
      optionalTts: true,
    },
    { kind: 'silence', durationSec: 240 },
    {
      kind: 'voice',
      textKey: 'dfp_zero_contradictions.deepening',
      durationSec: 30,
      phase: 'work',
      optionalTts: true,
    },
    { kind: 'silence', durationSec: 180 },
    {
      kind: 'voice',
      textKey: 'dfp_zero_contradictions.integration',
      durationSec: 30,
      phase: 'integration',
      optionalTts: false,
    },
    {
      kind: 'voice',
      textKey: 'dfp_zero_contradictions.reorientation',
      durationSec: 30,
      phase: 'reorientation',
      optionalTts: false,
    },
  ],
);

/* =========================================================================
 * Practice 7 — Три дня протокола  (Level 2, ~20 min)
 * ========================================================================= */
const dfp_three_day_protocol = makePractice(
  'domfreq',
  DIFF_MAP_4,
  'dfp_three_day_protocol',
  'Три дня протокола',
  'Полный трёхдневный протокол DFP в одной комбинированной сессии: фокус — насыщение — устранение противоречий.',
  2,
  20,
  [],
  ['протокол', 'интенсив', 'комплекс'],
  [
    {
      kind: 'voice',
      textKey: 'dfp_three_day_protocol.preparation',
      durationSec: 30,
      phase: 'preparation',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 5 },
    {
      kind: 'voice',
      textKey: 'dfp_three_day_protocol.day_one',
      durationSec: 45,
      phase: 'induction',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 10 },
    {
      kind: 'voice',
      textKey: 'dfp_three_day_protocol.day_two',
      durationSec: 45,
      phase: 'deepening',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 10 },
    {
      kind: 'voice',
      textKey: 'dfp_three_day_protocol.practice',
      durationSec: 20,
      phase: 'work',
      optionalTts: true,
    },
    { kind: 'silence', durationSec: 300 },
    {
      kind: 'voice',
      textKey: 'dfp_three_day_protocol.day_three',
      durationSec: 30,
      phase: 'work',
      optionalTts: true,
    },
    { kind: 'silence', durationSec: 240 },
    {
      kind: 'voice',
      textKey: 'dfp_three_day_protocol.integration',
      durationSec: 30,
      phase: 'integration',
      optionalTts: false,
    },
    {
      kind: 'voice',
      textKey: 'dfp_three_day_protocol.reorientation',
      durationSec: 30,
      phase: 'reorientation',
      optionalTts: false,
    },
  ],
);

/* =========================================================================
 * Practice 8 — Проактивная проекция  (Level 3, ~20 min)
 * ========================================================================= */
const dfp_proactive_projection = makePractice(
  'domfreq',
  DIFF_MAP_4,
  'dfp_proactive_projection',
  'Проактивная проекция',
  'Продвинутая техника трансляции новой частоты через микро-выражения, голос и язык тела.',
  3,
  20,
  [],
  ['проекция', 'микро-выражения', 'трансляция'],
  [
    {
      kind: 'voice',
      textKey: 'dfp_proactive_projection.preparation',
      durationSec: 30,
      phase: 'preparation',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 5 },
    {
      kind: 'voice',
      textKey: 'dfp_proactive_projection.exploring',
      durationSec: 45,
      phase: 'induction',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 10 },
    {
      kind: 'voice',
      textKey: 'dfp_proactive_projection.building',
      durationSec: 45,
      phase: 'deepening',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 10 },
    {
      kind: 'voice',
      textKey: 'dfp_proactive_projection.practice',
      durationSec: 20,
      phase: 'work',
      optionalTts: true,
    },
    { kind: 'silence', durationSec: 300 },
    {
      kind: 'voice',
      textKey: 'dfp_proactive_projection.broadcasting',
      durationSec: 30,
      phase: 'work',
      optionalTts: true,
    },
    { kind: 'silence', durationSec: 240 },
    {
      kind: 'voice',
      textKey: 'dfp_proactive_projection.integration',
      durationSec: 30,
      phase: 'integration',
      optionalTts: false,
    },
    {
      kind: 'voice',
      textKey: 'dfp_proactive_projection.reorientation',
      durationSec: 30,
      phase: 'reorientation',
      optionalTts: false,
    },
  ],
);

/* =========================================================================
 * Practice 9 — Ночная интеграция  (Level 3, ~15 min)
 * ========================================================================= */
const dfp_night_integration = makePractice(
  'domfreq',
  DIFF_MAP_4,
  'dfp_night_integration',
  'Ночная интеграция',
  'Вечерняя практика перепрограммирования подсознания в гипнагогическом состоянии при засыпании.',
  3,
  15,
  [],
  ['ночь', 'интеграция', 'подсознание'],
  [
    {
      kind: 'voice',
      textKey: 'dfp_night_integration.preparation',
      durationSec: 30,
      phase: 'preparation',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 5 },
    {
      kind: 'voice',
      textKey: 'dfp_night_integration.releasing',
      durationSec: 45,
      phase: 'induction',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 10 },
    {
      kind: 'voice',
      textKey: 'dfp_night_integration.deepening',
      durationSec: 30,
      phase: 'deepening',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 10 },
    {
      kind: 'voice',
      textKey: 'dfp_night_integration.practice',
      durationSec: 20,
      phase: 'work',
      optionalTts: true,
    },
    { kind: 'silence', durationSec: 240 },
    {
      kind: 'voice',
      textKey: 'dfp_night_integration.programming',
      durationSec: 30,
      phase: 'work',
      optionalTts: true,
    },
    { kind: 'silence', durationSec: 180 },
    {
      kind: 'voice',
      textKey: 'dfp_night_integration.integration',
      durationSec: 30,
      phase: 'integration',
      optionalTts: false,
    },
    {
      kind: 'voice',
      textKey: 'dfp_night_integration.reorientation',
      durationSec: 30,
      phase: 'reorientation',
      optionalTts: false,
    },
  ],
);

/* =========================================================================
 * Practice 10 — Утренняя настройка  (Level 1, ~10 min)
 * ========================================================================= */
const dfp_morning_tuning = makePractice(
  'domfreq',
  DIFF_MAP_4,
  'dfp_morning_tuning',
  'Утренняя настройка',
  'Утренняя практика для установки доминантной частоты на предстоящий день.',
  1,
  10,
  [],
  ['утро', 'настройка', 'установка'],
  [
    {
      kind: 'voice',
      textKey: 'dfp_morning_tuning.preparation',
      durationSec: 30,
      phase: 'preparation',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 5 },
    {
      kind: 'voice',
      textKey: 'dfp_morning_tuning.awakening',
      durationSec: 30,
      phase: 'induction',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 10 },
    {
      kind: 'voice',
      textKey: 'dfp_morning_tuning.frequency',
      durationSec: 45,
      phase: 'deepening',
      optionalTts: false,
    },
    { kind: 'silence', durationSec: 10 },
    {
      kind: 'voice',
      textKey: 'dfp_morning_tuning.practice',
      durationSec: 20,
      phase: 'work',
      optionalTts: true,
    },
    { kind: 'silence', durationSec: 180 },
    {
      kind: 'voice',
      textKey: 'dfp_morning_tuning.deepening',
      durationSec: 20,
      phase: 'work',
      optionalTts: true,
    },
    { kind: 'silence', durationSec: 120 },
    {
      kind: 'voice',
      textKey: 'dfp_morning_tuning.integration',
      durationSec: 30,
      phase: 'integration',
      optionalTts: false,
    },
    {
      kind: 'voice',
      textKey: 'dfp_morning_tuning.reorientation',
      durationSec: 30,
      phase: 'reorientation',
      optionalTts: false,
    },
  ],
);

/* =========================================================================
 * Export: all 10 DFP practices
 * ========================================================================= */
export const domfreqPractices: Practice[] = [
  dfp_diagnosis,
  dfp_body_scan,
  dfp_alpha_calibration,
  dfp_focus_lock,
  dfp_emotional_saturation,
  dfp_zero_contradictions,
  dfp_three_day_protocol,
  dfp_proactive_projection,
  dfp_night_integration,
  dfp_morning_tuning,
];
