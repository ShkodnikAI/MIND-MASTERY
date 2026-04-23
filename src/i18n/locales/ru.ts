/**
 * @file Russian locale strings for the MIND MASTERY UI.
 *
 * IMPORTANT: This file contains ONLY UI chrome strings (buttons, labels, headings).
 * Practice narration texts live in content/texts/ and are loaded at runtime
 * via the content registry — NOT bundled here.
 *
 * Keys use dot-separated namespaces for discoverability.
 */
export default {
  // ── Common ──────────────────────────────────────────────────────────
  'common.loading': 'Загрузка...',
  'common.error': 'Ошибка',
  'common.retry': 'Повторить',
  'common.cancel': 'Отмена',
  'common.confirm': 'Подтвердить',
  'common.save': 'Сохранить',
  'common.delete': 'Удалить',
  'common.back': 'Назад',
  'common.next': 'Далее',
  'common.skip': 'Пропустить',
  'common.close': 'Закрыть',
  'common.done': 'Готово',
  'common.settings': 'Настройки',

  // ── Navigation / Tab bar ────────────────────────────────────────────
  'tabs.transurfing': 'Трансерфинг',
  'tabs.silva': 'Сильва',
  'tabs.dispenza': 'Диспенза',
  'tabs.feldenkrais': 'Фельденкрайз',
  'tabs.breath': 'Дыхание',

  // ── Hub screen ──────────────────────────────────────────────────────
  'hub.greeting.morning': 'Доброе утро',
  'hub.greeting.afternoon': 'Добрый день',
  'hub.greeting.evening': 'Добрый вечер',
  'hub.greeting.night': 'Доброй ночи',
  'hub.subtitle': 'Выберите систему практик',
  'hub.practices': 'практик',
  'hub.minutes': 'минут практики',

  // ── System names ────────────────────────────────────────────────────
  'system.transurfing': 'Трансерфинг Реальности',
  'system.transurfing.tagline': 'Управление реальностью через намерение',
  'system.silva': 'Метод Сильвы',
  'system.silva.tagline': 'Альфа-состояние и самоисцеление',
  'system.dispenza': 'Медитации Диспензы',
  'system.dispenza.tagline': 'Нейропластичность и квантовое поле',
  'system.feldenkrais': 'Осознание через движение',
  'system.feldenkrais.tagline': 'Телесное развитие и нейромоторное обучение',
  'system.breath': 'Дыхательные практики',
  'system.breath.tagline': 'Регуляция нервной системы через дыхание',

  // ── Practice screen ─────────────────────────────────────────────────
  'practice.theory': 'Теория',
  'practice.prepare': 'Подготовка',
  'practice.start': 'Начать',
  'practice.duration': 'Длительность',
  'practice.difficulty': 'Сложность',
  'practice.level': 'Уровень',
  'practice.locked': 'Заблокировано',
  'practice.locked.description': 'Пройдите предыдущие практики, чтобы разблокировать',
  'practice.contraindications': 'Противопоказания',
  'practice.tags': 'Теги',

  // ── Session player ──────────────────────────────────────────────────
  'player.playing': 'Воспроизведение',
  'player.paused': 'Пауза',
  'player.finished': 'Завершено',
  'player.stop': 'Остановить',
  'player.skip': 'Пропустить',
  'player.exit.confirm': 'Прервать сессию?',
  'player.exit.message': 'Прогресс текущей сессии будет потерян.',
  'player.exit.yes': 'Прервать',
  'player.exit.no': 'Продолжить',

  // ── Session phases ──────────────────────────────────────────────────
  'phase.preparation': 'Подготовка',
  'phase.induction': 'Погружение',
  'phase.deepening': 'Углубление',
  'phase.work': 'Основная практика',
  'phase.integration': 'Интеграция',
  'phase.reorientation': 'Возвращение',

  // ── Settings ────────────────────────────────────────────────────────
  'settings.title': 'Настройки',
  'settings.audio': 'Аудио',
  'settings.audio.description': 'Громкость музыки, бинауралов и голоса',
  'settings.voice': 'Голос',
  'settings.voice.description': 'Настройки озвучки практик',
  'settings.light': 'Световые эффекты',
  'settings.light.description': 'Темы, интенсивность и entrainment',
  'settings.backup': 'Резервное копирование',
  'settings.backup.description': 'Импорт и экспорт данных',
  'settings.accessibility': 'Доступность',
  'settings.accessibility.description': 'VoiceOver, TalkBack, размер текста',
  'settings.about': 'О приложении',
  'settings.about.description': 'Версия, лицензии, информация',
  'settings.theme': 'Тема оформления',
  'settings.theme.dark': 'Тёмная',
  'settings.theme.light': 'Светлая',
  'settings.theme.system': 'Системная',
  'settings.haptics': 'Вибрация',

  // ── Moment of Power ────────────────────────────────────────────────
  'moment.title': 'Момент Силы',
  'moment.description': 'Ежедневный мотивационный будильник',
  'moment.enabled': 'Включён',
  'moment.window': 'Время уведомлений',
  'moment.sound': 'Звук',
  'moment.seed': 'Персональный код',
  'moment.preview': 'Прослушать',

  // ── Journal ─────────────────────────────────────────────────────────
  'journal.title': 'Журнал',
  'journal.empty': 'Записей пока нет',
  'journal.new': 'Новая запись',
  'journal.mood': 'Настроение',
  'journal.notes': 'Заметки',
  'journal.session.date': 'Дата',
  'journal.session.duration': 'Длительность',
  'journal.session.practice': 'Практика',

  // ── Mood options ────────────────────────────────────────────────────
  'mood.great': 'Отлично',
  'mood.good': 'Хорошо',
  'mood.neutral': 'Нормально',
  'mood.bad': 'Плохо',
  'mood.awful': 'Ужасно',

  // ── Difficulty levels ───────────────────────────────────────────────
  'difficulty.beginner': 'Начинающий',
  'difficulty.elementary': 'Элементарный',
  'difficulty.intermediate': 'Средний',
  'difficulty.advanced': 'Продвинутый',
  'difficulty.master': 'Мастер',

  // ── Session lengths ─────────────────────────────────────────────────
  'length.short': 'Короткая',
  'length.medium': 'Средняя',
  'length.full': 'Полная',

  // ── Onboarding ──────────────────────────────────────────────────────
  'onboarding.welcome': 'Добро пожаловать',
  'onboarding.welcome.subtitle': 'Mind Mastery — пространство для глубокой работы с сознанием',
  'onboarding.disclaimer': 'Медицинский дисклеймер',
  'onboarding.disclaimer.text':
    'Это приложение не является медицинской заменой. Практики направлены на саморазвитие и осознанность. Если у вас есть неврологические или психические заболевания, проконсультируйтесь с врачом перед использованием.',
  'onboarding.howItWorks': 'Как это работает',
  'onboarding.binaurals': 'Бинауральные ритмы',
  'onboarding.binaurals.text':
    'Бинауральные ритмы создают звуковую иллюзию, которая может влиять на ритмы мозга. Используйте наушники для лучшего эффекта.',
  'onboarding.finish': 'Готово!',
  'onboarding.finish.subtitle':
    'Начните с простых практик. Ваша осознанность — это путешествие, а не гонка.',
  'onboarding.accept': 'Принимаю',
  'onboarding.continue': 'Продолжить',

  // ── Safety ──────────────────────────────────────────────────────────
  'safety.photosensitive': 'Предупреждение о фоточувствительности',
  'safety.photosensitive.text':
    'Световые эффекты содержат мерцание. Не используйте при эпилепсии или фоточувствительных судорогах.',
  'safety.photosensitive.acknowledge': 'Я понимаю и принимаю',
  'safety.consent.advanced': 'Продвинутая практика',
  'safety.consent.advanced.text':
    'Эта практика включает интенсивные дыхательные техники. Убедитесь, что вы находитесь в безопасном месте и не за рулём.',

  // ── Emergency ───────────────────────────────────────────────────────
  'emergency.title': 'Быстрое спокойствие',
  'emergency.subtitle': '60 секунд для восстановления',
  'emergency.start': 'Начать',

  // ── Backup ──────────────────────────────────────────────────────────
  'backup.export': 'Экспортировать данные',
  'backup.import': 'Импортировать данные',
  'backup.export.success': 'Данные экспортированы',
  'backup.import.success': 'Данные импортированы',
  'backup.import.error': 'Ошибка импорта',

  // ── Errors ──────────────────────────────────────────────────────────
  'error.audio.playback': 'Ошибка воспроизведения аудио',
  'error.audio.tts': 'Ошибка озвучки',
  'error.db': 'Ошибка базы данных',
  'error.backup': 'Ошибка резервного копирования',
} as const;
