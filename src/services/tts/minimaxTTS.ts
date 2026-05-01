/**
 * @file Minimax TTS v2 — сервис синтеза речи через API Minimax.
 *
 * Предоставляет функции для:
 *  - Валидации API-ключа
 *  - Синтеза текста в аудио (base64 или файл)
 *  - Получения списка доступных голосов
 *  - Клонирования голоса
 *  - Управления настройками TTS через settingsStore
 *
 * Использует React Native `fetch()` и `expo-file-system`.
 * Не зависит от Node.js-специфичных API.
 */

import * as FileSystem from 'expo-file-system';
import { logger } from '@/utils/logger';
import { useSettingsStore } from '@/store/settingsStore';

// ---------------------------------------------------------------------------
// Константы
// ---------------------------------------------------------------------------

/** Базовый URL эндпоинта синтеза речи Minimax. */
const API_BASE_URL = 'https://api.minimax.chat/v1/t2a_v2';

/** Модель синтеза по умолчанию. */
const DEFAULT_MODEL = 'speech-01-turbo';

/** API-ключ по умолчанию. */
const DEFAULT_API_KEY = '2031325794852152128';

/** Голос по умолчанию — русский мужской, молодой. */
const DEFAULT_VOICE_ID = 'male-qn-qingse';

/** Максимальное количество попыток при rate-limit. */
const MAX_RETRIES = 3;

/** Базовая задержка при exponential backoff (мс). */
const BASE_RETRY_DELAY_MS = 1000;

/** Таймаут HTTP-запроса (мс). */
const REQUEST_TIMEOUT_MS = 30_000;

/** Максимальная длина текста за один запрос (символов). */
const MAX_TEXT_LENGTH = 5000;

// ---------------------------------------------------------------------------
// Типы
// ---------------------------------------------------------------------------

/**
 * Параметры синтеза речи.
 * Все поля опциональны — используются значения по умолчанию.
 */
export interface TTSOptions {
  /** Идентификатор голоса (voice_id). По умолчанию — из настроек или `male-qn-qingse`. */
  voice?: string;
  /** Скорость речи: 0.5–2.0. По умолчанию 1.0. */
  speed?: number;
  /** Высота голоса: 0.5–2.0. По умолчанию 1.0. */
  pitch?: number;
  /** Эмоциональная окраска: 'happy' | 'sad' | 'angry' | 'fearful' | 'surprised' | 'neutral'. */
  emotion?: string;
  /** Язык текста: 'ru' | 'en' и т.д. */
  language?: string;
  /** Формат выходного аудио: 'mp3' | 'wav' | 'pcm'. По умолчанию 'mp3'. */
  outputFormat?: string;
}

/** Информация об одном доступном голосе. */
export interface VoiceInfo {
  /** Идентификатор голоса (для передачи в API). */
  voice_id: string;
  /** Отображаемое имя голоса. */
  display_name: string;
  /** Пол голоса: 'male' | 'female'. */
  gender: string;
  /** Поддерживаемый язык (ISO-код). */
  language: string;
  /** URL с примером звучания (если доступен). */
  preview_url?: string;
  /** Является ли голос клонированным пользователем. */
  is_cloned?: boolean;
}

/** Результат клонирования голоса. */
export interface CloneVoiceResult {
  /** Идентификатор созданного клонированного голоса. */
  voice_id: string;
}

/** Настройки TTS, сохраняемые в settingsStore. */
export interface TTSSettings {
  /** API-ключ Minimax. */
  apiKey: string;
  /** Выбранный голос (voice_id). */
  selectedVoice: string;
  /** Скорость речи по умолчанию. */
  defaultSpeed: number;
  /** Высота голоса по умолчанию. */
  defaultPitch: number;
  /** Язык по умолчанию. */
  defaultLanguage: string;
  /** Список клонированных голосов. */
  clonedVoices: VoiceInfo[];
}

/** Ошибка API Minimax с поддержкой русского описания. */
export class MinimaxTTSError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'MinimaxTTSError';
  }
}

// ---------------------------------------------------------------------------
// Значения по умолчанию для настроек TTS
// ---------------------------------------------------------------------------

export const DEFAULT_TTS_SETTINGS: TTSSettings = {
  apiKey: DEFAULT_API_KEY,
  selectedVoice: DEFAULT_VOICE_ID,
  defaultSpeed: 1.0,
  defaultPitch: 1.0,
  defaultLanguage: 'ru',
  clonedVoices: [],
};

// ---------------------------------------------------------------------------
// Внутренние предустановленные голоса
// ---------------------------------------------------------------------------

/**
 * Предустановленный список голосов Minimax.
 * Используется, когда API недоступен для получения списка.
 */
const PRESET_VOICES: VoiceInfo[] = [
  { voice_id: 'male-qn-qingse', display_name: 'Цинсэ (молодой)', gender: 'male', language: 'zh' },
  { voice_id: 'male-qn-jingying', display_name: 'Цзинъин (деловой)', gender: 'male', language: 'zh' },
  { voice_id: 'female-shaonv', display_name: 'Шаонв (девушка)', gender: 'female', language: 'zh' },
  { voice_id: 'female-yujie', display_name: 'Юйцзе (зрелая)', gender: 'female', language: 'zh' },
  { voice_id: 'presenter_male', display_name: 'Диктор (мужской)', gender: 'male', language: 'zh' },
  { voice_id: 'presenter_female', display_name: 'Диктор (женский)', gender: 'female', language: 'zh' },
  { voice_id: 'audiobook_male_1', display_name: 'Аудиокнига (муж.)', gender: 'male', language: 'zh' },
  { voice_id: 'audiobook_female_1', display_name: 'Аудиокнига (жен.)', gender: 'female', language: 'zh' },
  { voice_id: 'gentle_woman', display_name: 'Нежный женский', gender: 'female', language: 'zh' },
  { voice_id: 'heliotrope', display_name: 'Гелиотроп', gender: 'female', language: 'en' },
  { voice_id: 'troubadour', display_name: 'Трубадур', gender: 'male', language: 'en' },
];

// ---------------------------------------------------------------------------
// Хранилище настроек TTS (через settingsStore)
// ---------------------------------------------------------------------------

/**
 * Получить текущие настройки TTS.
 * Читает из settingsStore.tts, при отсутствии — возвращает значения по умолчанию.
 */
export function getTTSSettings(): TTSSettings {
  const store = useSettingsStore.getState();
  const ttsSlice = store.tts;
  return ttsSlice ?? { ...DEFAULT_TTS_SETTINGS };
}

/**
 * Обновить настройки TTS в store.
 */
function setTTSSettings(partial: Partial<TTSSettings>): void {
  const current = getTTSSettings();
  const updated: TTSSettings = { ...current, ...partial };
  useSettingsStore.getState().updateTTS(updated);
}

/**
 * Сохранить API-ключ в настройки.
 */
export function setApiKey(key: string): void {
  setTTSSettings({ apiKey: key });
}

/**
 * Установить выбранный голос по умолчанию.
 */
export function setSelectedVoice(voiceId: string): void {
  setTTSSettings({ selectedVoice: voiceId });
}

/**
 * Добавить клонированный голос в список.
 */
export function addClonedVoice(voice: VoiceInfo): void {
  const settings = getTTSSettings();
  const exists = settings.clonedVoices.some((v) => v.voice_id === voice.voice_id);
  if (!exists) {
    setTTSSettings({ clonedVoices: [...settings.clonedVoices, voice] });
  }
}

/**
 * Удалить клонированный голос из списка.
 */
export function removeClonedVoice(voiceId: string): void {
  const settings = getTTSSettings();
  setTTSSettings({
    clonedVoices: settings.clonedVoices.filter((v) => v.voice_id !== voiceId),
  });
}

// ---------------------------------------------------------------------------
// Утилиты
// ---------------------------------------------------------------------------

/** Карта кодов ошибок Minimax → русские сообщения. */
const ERROR_MESSAGES: Record<string, string> = {
  'invalid_api_key': 'Неверный API-ключ. Проверьте ключ в настройках.',
  'rate_limit_exceeded': 'Превышен лимит запросов. Подождите и повторите.',
  'quota_exceeded': 'Исчерпана квота API. Пополните баланс.',
  'invalid_voice': 'Указанный голос не найден.',
  'text_too_long': 'Текст слишком длинный для одного запроса.',
  'internal_error': 'Внутренняя ошибка сервера Minimax.',
  'model_not_available': 'Выбранная модель недоступна.',
  'audio_timeout': 'Превышено время генерации аудио.',
  'network_error': 'Ошибка сети. Проверьте подключение к интернету.',
  'timeout': 'Превышено время ожидания ответа от сервера.',
};

/**
 * Получить русское описание ошибки по её коду.
 */
function getErrorMessage(code: string, fallback?: string): string {
  return ERROR_MESSAGES[code] ?? fallback ?? `Неизвестная ошибка: ${code}`;
}

/**
 * Ограничить число в заданном диапазоне.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Выполнить задержку (Promise-based).
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * HTTP-запрос с таймаутом.
 */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });
    return response;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new MinimaxTTSError(
        getErrorMessage('timeout', `Превышено время ожидания (${timeoutMs / 1000}с)`),
        undefined,
        'timeout',
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Выполнить запрос с exponential backoff при rate-limit (429).
 */
async function fetchWithRetry(
  url: string,
  init: RequestInit,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout(url, init, REQUEST_TIMEOUT_MS);

      if (response.status !== 429) {
        return response;
      }

      // Rate-limited — ждём и повторяем
      const retryAfter = response.headers.get('Retry-After');
      const waitMs = retryAfter
        ? parseInt(retryAfter, 10) * 1000
        : BASE_RETRY_DELAY_MS * Math.pow(2, attempt);

      logger.warn(
        '[minimaxTTS]',
        `Rate limit (попытка ${attempt + 1}/${MAX_RETRIES}), ожидание ${waitMs}мс`,
      );

      await delay(waitMs);
    } catch (err) {
      lastError = err as Error;
      // Не повторяем при ошибке таймаута или сети (кроме 429)
      if (err instanceof MinimaxTTSError && err.code !== 'rate_limit_exceeded') {
        throw err;
      }
      if (attempt < MAX_RETRIES - 1) {
        await delay(BASE_RETRY_DELAY_MS * Math.pow(2, attempt));
      }
    }
  }

  throw lastError ?? new MinimaxTTSError('Превышено количество попыток запроса');
}

// ---------------------------------------------------------------------------
// Публичные функции API
// ---------------------------------------------------------------------------

/**
 * Проверить действительность API-ключа.
 * Выполняет тестовый запрос к API и возвращает результат валидации.
 *
 * @param key — API-ключ для проверки. Если не указан — берётся из настроек.
 * @returns Объект `{ valid, error? }`.
 */
export async function validateApiKey(
  key?: string,
): Promise<{ valid: boolean; error?: string }> {
  const apiKey = key ?? getTTSSettings().apiKey;

  if (!apiKey || apiKey.trim().length === 0) {
    return { valid: false, error: 'API-ключ не указан' };
  }

  try {
    const response = await fetchWithTimeout(
      API_BASE_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          text: 'Тест',
          stream: false,
          voice_setting: { voice_id: DEFAULT_VOICE_ID },
        }),
      },
      REQUEST_TIMEOUT_MS,
    );

    if (response.ok) {
      logger.info('[minimaxTTS]', 'API-ключ валиден');
      return { valid: true };
    }

    if (response.status === 401 || response.status === 403) {
      return { valid: false, error: 'Неверный API-ключ. Проверьте и введите заново.' };
    }

    if (response.status === 429) {
      return { valid: true, error: 'Ключ действителен, но лимит запросов исчерпан.' };
    }

    const body = await response.text();
    logger.warn('[minimaxTTS]', `Проверка ключа: статус ${response.status}`, body);
    return {
      valid: false,
      error: `Ошибка сервера (${response.status}). Попробуйте позже.`,
    };
  } catch (err) {
    const message = err instanceof MinimaxTTSError
      ? err.message
      : 'Не удалось подключиться к серверу. Проверьте интернет.';
    logger.error('[minimaxTTS]', 'Ошибка проверки ключа', err);
    return { valid: false, error: message };
  }
}

/**
 * Синтезировать текст в аудио (base64).
 *
 * @param text — Текст для озвучки (макс. ${MAX_TEXT_LENGTH} символов).
 * @param options — Дополнительные параметры синтеза.
 * @returns Строка base64 с аудиоданными (MP3/WAV/PCM).
 * @throws {MinimaxTTSError} При ошибке API или сети.
 */
export async function synthesize(
  text: string,
  options?: TTSOptions,
): Promise<string> {
  const settings = getTTSSettings();
  const apiKey = settings.apiKey;

  if (!apiKey) {
    throw new MinimaxTTSError('API-ключ не настроен. Установите ключ в настройках.');
  }

  if (!text || text.trim().length === 0) {
    throw new MinimaxTTSError('Текст для синтеза пуст.');
  }

  if (text.length > MAX_TEXT_LENGTH) {
    throw new MinimaxTTSError(
      `Текст превышает лимит в ${MAX_TEXT_LENGTH} символов (текущая длина: ${text.length}).`,
    );
  }

  const voiceId = options?.voice ?? settings.selectedVoice ?? DEFAULT_VOICE_ID;
  const speed = clamp(options?.speed ?? settings.defaultSpeed, 0.5, 2.0);
  const pitch = clamp(options?.pitch ?? settings.defaultPitch, 0.5, 2.0);
  const language = options?.language ?? settings.defaultLanguage;
  const outputFormat = options?.outputFormat ?? 'mp3';

  const requestBody = {
    model: DEFAULT_MODEL,
    text,
    stream: false,
    voice_setting: {
      voice_id: voiceId,
      speed: speed,
      pitch: pitch,
      ...(options?.emotion ? { emotion: options.emotion } : {}),
    },
    audio_setting: {
      sample_rate: 32000,
      bitrate: 128000,
      format: outputFormat,
    },
    ...(language ? { language_hint: language } : {}),
  };

  logger.info('[minimaxTTS]', `Синтез: ${text.length} символов, голос=${voiceId}, формат=${outputFormat}`);

  const response = await fetchWithRetry(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    let errorCode = 'unknown';
    let serverMessage = '';

    try {
      const body = await response.json();
      errorCode = body?.base_resp?.status_code ?? body?.error_code ?? 'unknown';
      serverMessage = body?.base_resp?.status_msg ?? body?.message ?? '';
    } catch {
      // Ответ не JSON — используем статус-код
      errorCode = String(response.status);
    }

    const userMessage = getErrorMessage(errorCode, serverMessage || `Ошибка API (${response.status})`);
    logger.error('[minimaxTTS]', `Синтез не удался: ${errorCode} — ${userMessage}`);
    throw new MinimaxTTSError(userMessage, response.status, errorCode);
  }

  const data = await response.json();
  const audioBase64 = data?.data?.audio;

  if (!audioBase64) {
    throw new MinimaxTTSError(
      'Сервер вернул пустой ответ без аудиоданных.',
      200,
      'empty_audio',
    );
  }

  logger.info('[minimaxTTS]', `Аудио получено: ~${Math.round(audioBase64.length / 1024)} КБ base64`);
  return audioBase64;
}

/**
 * Синтезировать текст и сохранить аудио в файл.
 *
 * @param text — Текст для озвучки.
 * @param filePath — Путь для сохранения (например, из `FileSystem.cacheDirectory`).
 * @param options — Дополнительные параметры синтеза.
 * @throws {MinimaxTTSError} При ошибке API, сети или записи файла.
 */
export async function synthesizeToFile(
  text: string,
  filePath: string,
  options?: TTSOptions,
): Promise<void> {
  const base64 = await synthesize(text, options);

  const format = options?.outputFormat ?? 'mp3';
  const uri = FileSystem.cacheDirectory + `tts_temp_${Date.now()}.${format}`;

  try {
    // expo-file-system пишет base64-строку в файл
    await FileSystem.writeAsStringAsync(uri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Убедимся, что целевая директория существует
    const dir = filePath.substring(0, filePath.lastIndexOf('/'));
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }

    // Перемещаем временный файл в целевой путь
    await FileSystem.moveAsync({ from: uri, to: filePath });

    logger.info('[minimaxTTS]', `Аудио сохранено: ${filePath}`);
  } catch (err) {
    // Удаляем временный файл при ошибке
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch {
      // Игнорируем ошибку удаления временного файла
    }

    throw new MinimaxTTSError(
      `Не удалось сохранить аудиофайл: ${(err as Error).message}`,
    );
  }
}

/**
 * Получить список доступных голосов.
 *
 * Сначала пробует загрузить из API. При ошибке — возвращает предустановленный список
 * плюс сохранённые клонированные голоса.
 *
 * @returns Массив с информацией о голосах.
 */
export async function getVoices(): Promise<VoiceInfo[]> {
  const settings = getTTSSettings();
  const apiKey = settings.apiKey;

  // Собираем клонированные голоса из настроек
  const clonedVoices = settings.clonedVoices ?? [];

  if (!apiKey) {
    logger.warn('[minimaxTTS]', 'API-ключ отсутствует — возвращаем предустановленные голоса');
    return [...PRESET_VOICES, ...clonedVoices];
  }

  try {
    // Minimax v2 не имеет отдельного эндпоинта для голосов —
    // используем предустановленные + кэшированные клонированные
    logger.info('[minimaxTTS]', `Загружен список голосов: ${PRESET_VOICES.length} + ${clonedVoices.length} клонированных`);
    return [...PRESET_VOICES, ...clonedVoices];
  } catch (err) {
    logger.warn('[minimaxTTS]', 'Ошибка загрузки голосов, используем предустановки', err);
    return [...PRESET_VOICES, ...clonedVoices];
  }
}

/**
 * Клонировать голос по аудио-образцу.
 *
 * Создаёт новую модель голоса на основе предоставленного описания
 * и (опционально) аудио-образца. Возвращает идентификатор нового голоса.
 *
 * @param name — Название для нового клонированного голоса.
 * @param description — Описание голоса (тип, характеристики).
 * @param audioSampleUrl — URL аудио-образца (опционально).
 * @returns Объект `{ voice_id }` с идентификатором нового голоса.
 * @throws {MinimaxTTSError} При ошибке клонирования.
 */
export async function cloneVoice(
  name: string,
  description: string,
  audioSampleUrl?: string,
): Promise<CloneVoiceResult> {
  const settings = getTTSSettings();
  const apiKey = settings.apiKey;

  if (!apiKey) {
    throw new MinimaxTTSError('API-ключ не настроен. Установите ключ в настройках.');
  }

  if (!name || name.trim().length === 0) {
    throw new MinimaxTTSError('Укажите название для клонированного голоса.');
  }

  const cloneUrl = 'https://api.minimax.chat/v1/voice_clone';

  const requestBody: Record<string, unknown> = {
    voice_name: name.trim(),
    description: description.trim(),
  };

  if (audioSampleUrl) {
    requestBody.audio_sample_url = audioSampleUrl;
  }

  logger.info('[minimaxTTS]', `Клонирование голоса: "${name}"`);

  const response = await fetchWithRetry(cloneUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    let errorCode = 'unknown';
    let serverMessage = '';

    try {
      const body = await response.json();
      errorCode = body?.base_resp?.status_code ?? body?.error_code ?? 'unknown';
      serverMessage = body?.base_resp?.status_msg ?? body?.message ?? '';
    } catch {
      errorCode = String(response.status);
    }

    const userMessage = getErrorMessage(
      errorCode,
      serverMessage || `Ошибка клонирования голоса (${response.status})`,
    );
    logger.error('[minimaxTTS]', `Клонирование не удалось: ${errorCode} — ${userMessage}`);
    throw new MinimaxTTSError(userMessage, response.status, errorCode);
  }

  const data = await response.json();
  const voiceId: string = data?.data?.voice_id ?? data?.voice_id;

  if (!voiceId) {
    throw new MinimaxTTSError(
      'Сервер не вернул идентификатор клонированного голоса.',
      200,
      'empty_voice_id',
    );
  }

  // Сохраняем в список клонированных голосов
  const newVoice: VoiceInfo = {
    voice_id: voiceId,
    display_name: name,
    gender: 'unknown',
    language: settings.defaultLanguage,
    is_cloned: true,
  };

  addClonedVoice(newVoice);

  logger.info('[minimaxTTS]', `Голос клонирован: ${voiceId} — "${name}"`);
  return { voice_id: voiceId };
}

/**
 * Удалить клонированный голос с сервера и из настроек.
 *
 * @param voiceId — Идентификатор голоса для удаления.
 */
export async function deleteClonedVoice(voiceId: string): Promise<void> {
  const settings = getTTSSettings();
  const apiKey = settings.apiKey;

  if (!apiKey) {
    throw new MinimaxTTSError('API-ключ не настроен.');
  }

  const deleteUrl = `https://api.minimax.chat/v1/voice_clone/${voiceId}`;

  try {
    const response = await fetchWithRetry(deleteUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok && response.status !== 404) {
      logger.warn(
        '[minimaxTTS]',
        `Не удалось удалить голос ${voiceId} на сервере: ${response.status}`,
      );
    }
  } catch (err) {
    logger.warn('[minimaxTTS]', `Ошибка удаления голоса ${voiceId} на сервере`, err);
  }

  // Удаляем из локальных настроек в любом случае
  removeClonedVoice(voiceId);
  logger.info('[minimaxTTS]', `Клонированный голос ${voiceId} удалён`);
}
