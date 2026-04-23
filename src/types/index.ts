/**
 * @file Barrel re-export — single entry point for all type definitions.
 *
 * Import types via `import type { SessionPhase, Practice } from '@/types';`
 * rather than reaching into individual modules.
 */

// Content system types
export type {
  SystemId,
  DifficultyLevel,
  SessionLength,
  ParticleStyle,
  VisualSignature,
  TheorySection,
  TheoryShape,
  VoiceSegment,
  MusicSegment,
  BinauralSegment,
  SilenceSegment,
  TheorySegment,
  Segment,
  Practice,
  System,
} from './content';

// Session & progress types
export type {
  SessionPhase,
  SessionStatus,
  ActiveSession,
  SessionRecord,
  JournalEntry,
  PracticeProgress,
  SystemProgress,
} from './session';

// Audio engine types
export type {
  VoiceMode,
  VoiceSettings,
  AudioErrorPolicy,
  AudioSettings,
  VoiceState,
  AudioLayerState,
} from './audio';

// Audio engine state-machine types (re-exported from src/audio for convenience)
export type {
  EngineState,
  SessionConfig as EngineSessionConfig,
  SessionPlan,
  TimelineEntry,
  BackgroundLayer,
  EngineEvent,
} from '@/audio/types';

// Light / hardware types
export type {
  LightThemeId,
  LightEffect,
  LightConfig,
  EntrainmentConfig,
  ChakraConfig,
} from './light';

// Progression & achievements
export type {
  ProgressionRule,
  ProgressionState,
  AchievementType,
  Achievement,
} from './progression';

// Moment of Stillness
export type { MomentSettings, MomentRecord, MomentDay } from './moment';

// Settings, safety & notifications
export type {
  ThemeMode,
  AppSettings,
  SafetyState,
  DayOfWeek,
  NotificationCategoryId,
  NotificationSettings,
} from './settings';
export { DAY_OF_WEEK_LABELS, DAY_OF_WEEK_FULL_LABELS } from './settings';
