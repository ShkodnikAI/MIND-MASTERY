/**
 * @file Notification message templates — Russian-language strings.
 *
 * All user-facing notification content is centralised here.
 * Messages are selected pseudo-randomly from pools to add variety
 * so the user doesn't see the same reminder every day.
 */

// ---------------------------------------------------------------------------
// Daily reminder messages
// ---------------------------------------------------------------------------

const DAILY_REMINDER_TITLES: readonly string[] = [
  'Время для практики',
  'Ваша медитация ждёт',
  'Момент спокойствия',
  'Практика дня',
  'Сфокусируйтесь',
];

const DAILY_REMINDER_BODIES: readonly string[] = [
  'Уделите 10 минут внутреннему спокойствию.',
  'Начните практику прямо сейчас — даже 5 минут имеют значение.',
  'Регулярность важнее длительности. Зайдите на минутку.',
  'Дыхание, фокус или расслабление — выбирайте.',
  'Просто закройте глаза и вдохните.',
  'Ваш мозг заслуживает перезагрузки.',
  'Маленький шаг сегодня — большая трансформация завтра.',
  'Сегодня отличный день для практики.',
  'Вернитесь к себе — хотя бы на несколько минут.',
  'Сессия уже ждёт вас. Нажмите, чтобы начать.',
];

// ---------------------------------------------------------------------------
// Streak warning messages
// ---------------------------------------------------------------------------

const STREAK_WARNING_TITLES: readonly string[] = [
  'Серия под угрозой!',
  'Не теряйте прогресс',
  'Сегодня ещё можно практиковать',
];

const STREAK_WARNING_BODIES: readonly string[] = [
  'Ваша серия занятий может прерваться. Сделайте хотя бы короткую практику!',
  'Один день без практики — и счётчик обнулится. У вас ещё есть время!',
  'Серия из {streak} дней — не давайте ей прерваться!',
];

// ---------------------------------------------------------------------------
// Achievement messages
// ---------------------------------------------------------------------------

export interface AchievementMessage {
  readonly title: string;
  readonly body: string;
}

/**
 * Generate an achievement notification for a level-up event.
 */
export function getAchievementMessage(
  systemName: string,
  newLevel: number,
): AchievementMessage {
  return {
    title: 'Новый уровень!',
    body: `${systemName}: уровень ${newLevel} достигнут. Отличная работа!`,
  };
}

/**
 * Generate an achievement notification for a streak milestone.
 */
export function getStreakMilestoneMessage(streakDays: number): AchievementMessage {
  const milestoneLabels: Record<number, string> = {
    3: 'Три дня подряд!',
    7: 'Неделя практики!',
    14: 'Две недели!',
    21: 'Три недели!',
    30: 'Месяц практики!',
    60: 'Два месяца!',
    90: 'Три месяца — настоящий мастер!',
    100: '100 дней!',
    365: 'Год практики!',
  };

  const label = milestoneLabels[streakDays] ?? `${streakDays} дней подряд!`;

  return {
    title: label,
    body: `Вы великолепны! ${streakDays} дней без перерыва — это дисциплина и преданность.`,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Pick a random element from a readonly array.
 * Uses a simple modulo on Date.now() for daily variety.
 */
function pickRandom<T>(arr: readonly T[]): T {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
}

/**
 * Generate a daily reminder notification payload.
 * Returns randomised title and body for variety.
 */
export function getDailyReminderMessage(): { title: string; body: string } {
  return {
    title: pickRandom(DAILY_REMINDER_TITLES),
    body: pickRandom(DAILY_REMINDER_BODIES),
  };
}

/**
 * Generate a streak warning notification payload.
 */
export function getStreakWarningMessage(streakDays: number): {
  title: string;
  body: string;
} {
  const body =
    streakDays > 0
      ? STREAK_WARNING_BODIES[2].replace('{streak}', String(streakDays))
      : pickRandom(STREAK_WARNING_BODIES);

  return {
    title: pickRandom(STREAK_WARNING_TITLES),
    body,
  };
}
