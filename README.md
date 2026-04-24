# MIND MASTERY

**Автономное приложение для осознанной медитации и саморазвития**

<p align="center">
  <img src="assets/images/icon.png" alt="Mind Mastery" width="120" height="120">
</p>

<p align="center">
  <strong>5 систем</strong> &middot; <strong>65 практик</strong> &middot; <strong>100% оффлайн</strong> &middot; <strong>0 внешних API</strong>
</p>

---

## О проекте

MIND MASTERY — это мобильное приложение для ежедневной медитации и осознанной практики, объединяющее пять проверенных методик саморазвития в единый инструмент. Приложение работает полностью офлайн, не требует интернета, регистрации или подписки. Все данные хранятся локально на устройстве.

### Системы практик

| Система | Описание | Практик |
|---------|----------|---------|
| **Трансерфинг реальности** | Управление вниманием и намерением по Вадиму Зеланду | 14 |
| **Метод Сильва** | Альфа-визуализация, целеполагание, работа с подсознанием | 18 |
| **Джо Диспенза** | Нейромедитация, реконфигурация мозга, квантовое поле | 13 |
| **Фельденкрайз** | Осознанное движение, телесный интеллект, ATm-уроки | 12 |
| **Дыхание** | Дыхательные техники для расслабления, фокуса и энергии | 8 |

### Ключевые возможности

- **Аудиодвижок** — кастомный state machine на базе `expo-audio`: бинауральные ритмы, фоновая музыка, TTS-озвучка, fade-переходы, haptic-отклик
- **Сессионный плеер** — иммерсивный экран практики с прогресс-баром, управлением слоями звука, экстренной остановкой
- **Прогрессия и разблокировка** — 3 уровня сложности, системная прогрессия, автоматическая разблокировка новых практик
- **Дневник медитаций** — запись настроения, заметок, длительности после каждой сессии
- **Момент силы** — случайные мотивационные уведомления в течение дня
- **Напоминания** — до 10 расписанных напоминаний с выбором дней недели, времени и звука
- **Световые эффекты** — 7 цветовых тем, 6 эффектов (glow, pulse, breathe, entrainment, chakra-flow), настройка интенсивности
- **Статистика** — детальный дашборд: общий прогресс по каждой системе, тренды, уровни, достижения
- **Резервное копирование** — экспорт/импорт всех данных в JSON
- **Доступность** — haptic-отклик, адаптивный интерфейс, поддержка системной темы
- **i18n-ready** — русскоязычный интерфейс, готов к локализации на другие языки

---

## Архитектура

### Стек технологий

| Категория | Технология |
|-----------|-----------|
| Фреймворк | React Native 0.79 + Expo SDK 53 |
| Роутинг | expo-router v4 (file-based) |
| Состояние | Zustand v5 с persist middleware |
| БД | expo-sqlite v15 (WAL mode) |
| Аудио | expo-audio v0.3, expo-speech |
| Уведомления | expo-notifications |
| Анимации | react-native-reanimated, Lottie |
| Графика | @shopify/react-native-skia, react-native-svg |
| Язык | TypeScript (strict mode, 0 errors) |
| Линтинг | ESLint + Prettier |
| Git hooks | Lefthook |
| Сборка | EAS Build (Android APK/AAB, iOS) |

### Архитектурные инварианты

1. **INV-1 (SQLite Truth)** — база данных — единый источник истины; Zustand-стор при запуске загружает данные из SQLite
2. **INV-2 (Единый аудиодвижок)** — весь звук проходит через `useAudioEngine` hook; прямой вызов аудио-API запрещён
3. **INV-3 (UI Cache Only)** — экраны читают данные только из Zustand-сторов; SQL-запросы в render запрещены
4. **INV-4 (Domain Layer)** — бизнес-логика в `src/domain/`, чистые функции без React-зависимостей
5. **INV-5 (Content as Data)** — практики — JSON-файлы в `content/texts/`, загрузка через Metro `require.context`
6. **INV-6 (Discriminated Unions)** — все типы с вариантами используют discriminated union + `assertNever()` для exhaustive check
7. **INV-A1 (File-Based Routing)** — роутинг через файловую структуру `app/` в expo-router
8. **INV-A3 (StyleSheet.create)** — все стили через `StyleSheet.create`, inline-стили запрещены

### Структура проекта

```
MIND-MASTERY/
├── app/                          # expo-router экраны
│   ├── (tabs)/                   # Таб-навигация
│   │   ├── transurfing.tsx       #   Система «Трансерфинг»
│   │   ├── silva.tsx             #   Система «Сильва»
│   │   ├── dispenza.tsx          #   Система «Диспенза»
│   │   ├── feldenkrais.tsx       #   Система «Фельденкрайз»
│   │   └── breath.tsx            #   Система «Дыхание»
│   ├── player/                   # Сессионный плеер
│   ├── practice/[id].tsx         # Детали практики
│   ├── journal/                  # Дневник медитаций
│   ├── reminders/                # Управление напоминаниями
│   ├── stats/                    # Статистика и аналитика
│   ├── moment/                   # Момент силы
│   ├── onboarding/               # Приветственный онбординг
│   ├── settings/                 # Настройки (аудио, голос, свет, бэкап, доступность)
│   └── emergency.tsx             # Экстренная остановка сессии
├── content/texts/                # 65 JSON-файлов с текстами практик (ru)
│   ├── transurfing/              #   14 практик
│   ├── silva/                    #   18 практик
│   ├── dispenza/                 #   13 практик
│   ├── feldenkrais/              #   12 практик
│   └── breath/                   #   8 практик
├── src/
│   ├── audio/                    # Аудиодвижок (state machine, fade, queue)
│   ├── core/                     # Константы, флаги, системные типы
│   ├── db/                       # SQLite: схема, миграции, запросы
│   │   ├── queries/              #   CRUD для каждой сущности
│   │   └── migrations/           #   v1 (schema), v2 (reminders)
│   ├── domain/                   # Бизнес-логика (чистые функции)
│   │   ├── moment/               #   Расчёт расписания «Момент силы»
│   │   ├── progression/          #   Разблокировка и уровни
│   │   ├── safety/               #   Проверка безопасности
│   │   └── session/              #   Длительность, сегменты, play
│   ├── hooks/                    # React hooks (useAudioEngine)
│   ├── i18n/                     # Локализация (ru.ts — 570+ ключей)
│   ├── services/                 # Сервисы: уведомления, контент
│   ├── store/                    # Zustand stores (write-through в SQLite)
│   ├── types/                    # TypeScript типы
│   ├── ui/                       # UI-компоненты и тема
│   │   ├── components/           #   Карточки, слайдеры, прогресс-кольца
│   │   └── theme/                #   Цвета, типографика, системные темы
│   └── utils/                    # Утилиты: haptics, logger, time
├── assets/                       # Иконки, шрифты, сплэш, аудио
├── scripts/                      # Валидация контента и схемы
└── docs/adr/                     # Architecture Decision Records (ADR)
```

### Схема базы данных (SQLite)

| Таблица | Назначение |
|---------|-----------|
| `sessions` | История завершённых сессий |
| `progress` | Прогресс по каждой практике (уровни, счётчики) |
| `journal` | Записи дневника медитаций |
| `user_practices` | Пользовательские практики |
| `practice_texts` | Локализованные тексты практик |
| `settings` | Key-value хранилище настроек |
| `reminders` | Запланированные напоминания (v2) |

---

## Установка и запуск

### Требования

- Node.js >= 20
- Expo CLI (`npx expo`)
- Android Studio / Xcode (для нативной сборки)
- Устройство или эмулятор

### Быстрый старт

```bash
# Клонировать репозиторий
git clone https://github.com/ShkodnikAI/MIND-MASTERY.git
cd MIND-MASTERY

# Установить зависимости
npm install

# Запустить в режиме разработки
npx expo start --clear
```

### Нативная сборка

```bash
# Android (dev APK)
npm run build:dev

# Android (preview APK)
npm run build:preview

# Android (production AAB)
npm run build:prod

# iOS
npx expo run:ios
```

### Скрипты

```bash
npm run typecheck        # Проверка типов TypeScript
npm run lint             # ESLint (max-warnings: 0)
npm run format           # Проверка Prettier
npm run format:fix       # Автоформатирование Prettier
npm run validate-content # Валидация JSON-контента (65 файлов, 521 textKey)
npm run validate-schema  # Валидация TypeScript-схемы контента
```

---

## Целевые платформы

| Платформа | Мин. версия | Сборка |
|-----------|-------------|--------|
| Android | API 26 (8.0) | APK / AAB (EAS Build) |
| iOS | 15.0 | IPA (EAS Build / TestFlight) |

> Дистрибуция: семейное использование (sideload / TestFlight), без публичного размещения в сторе.

---

## Ход разработки

| Стадия | Содержание | Статус |
|--------|-----------|--------|
| **Stage 1** | Проектный каркас — Expo, роутинг, типы, тема | Done |
| **Stage 2a** | Контентная система — 65 практик, JSON-тексты, реестр | Done |
| **Stage 2b** | Аудиодвижок — expo-audio, сегменты, fade, haptics | Done |
| **Stage 3** | UI-связывание — все экраны подключены к Zustand-сторам | Done |
| **Stage 4** | Сессионный плеер — AudioEngine, иммерсивный интерфейс | Done |
| **Stage 5** | Уведомления — напоминания, безопасность, Memento, журнал | Done |
| **Stage 6-9** | Свет, статистика, бэкап, доступность | Done |

---

## Решения по архитектуре (ADR)

- [ADR-001](docs/adr/ADR-001-expo-sdk-53.md) — Expo SDK 53 как целевая платформа
- [ADR-002](docs/adr/ADR-002-zustand-state.md) — Zustand для управления состоянием
- [ADR-003](docs/adr/ADR-003-expo-audio.md) — expo-audio для аудиосистемы
- [ADR-004](docs/adr/ADR-004-sqlite-no-orm.md) — SQLite без ORM, typed queries
- [ADR-005](docs/adr/ADR-005-piper-tts.md) — TTS стратегия (системный / Piper)

---

## Метрики проекта

- **131 файл** TypeScript/TSX
- **~22 700 строк** кода
- **0 TypeScript ошибок** (strict mode)
- **65 JSON** практик с ~5 200 словами оригинальных текстов
- **521+ ключей** локализации
- **7 таблиц** SQLite с индексами

---

## Лицензия

Проект разработан для личного и семейного использования. Все права защищены.
