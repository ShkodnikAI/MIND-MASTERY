/**
 * @file Player Screen — Full-screen meditation session player.
 *
 * Route: /player/[id]?length=medium
 *
 * This screen is the immersive playback experience for meditation sessions.
 * It connects to the AudioEngine via useAudioEngine hook and reads all
 * real-time state from audioStateStore (INV-3).
 *
 * Flow:
 *   1. Auto-starts session on mount (engine: idle → preparing → playing)
 *   2. Displays real-time progress, phase, layer indicators
 *   3. Handles play/pause/stop controls
 *   4. Shows completion overlay on engine finish
 *   5. Records progress and navigates back on save
 *
 * INV-2: All audio operations go through useAudioEngine.
 * INV-3: All UI reads go through audioStateStore.
 * INV-A3: All styles via StyleSheet.create.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';

import { useContentStore } from '@/store/contentStore';
import { useAudioStateStore } from '@/store/audioStateStore';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { useProgressStore } from '@/store/progressStore';
import { notifyAchievement } from '@/services/notifications';

import { colors, typography, spacing, radii } from '@/ui/theme';
import { getSystemTheme } from '@/ui/theme/systemThemes';
import { ProgressRing } from '@/ui/components/ProgressRing';
import { formatDuration, msToMinutes } from '@/utils/time';
import {
  getSegmentsForLength,
  getDefaultLength,
  isLengthAvailable,
} from '@/domain/session/filterSegmentsByLength';
import { computeTotalDurationMs } from '@/domain/session/computeDuration';

import type { SessionLength, SessionPhase } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PHASE_LABELS: Record<SessionPhase, string> = {
  preparation: 'Подготовка',
  induction: 'Погружение',
  deepening: 'Углубление',
  work: 'Основная практика',
  integration: 'Интеграция',
  reorientation: 'Возвращение',
};

const PHASE_ICONS: Record<SessionPhase, string> = {
  preparation: 'spa-outline',
  induction: 'water-outline',
  deepening: 'moon-outline',
  work: 'diamond-outline',
  integration: 'infinite-outline',
  reorientation: 'sunny-outline',
};

const LENGTH_LABELS: Record<SessionLength, string> = {
  short: 'Короткая',
  medium: 'Средняя',
  full: 'Полная',
};

const MOOD_OPTIONS = [
  { key: 'calm', label: 'Спокойствие', icon: 'leaf-outline' },
  { key: 'harmony', label: 'Гармония', icon: 'heart-outline' },
  { key: 'energy', label: 'Энергия', icon: 'flash-outline' },
  { key: 'focus', label: 'Фокус', icon: 'locate-outline' },
  { key: 'relax', label: 'Расслабление', icon: 'bed-outline' },
];

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },

  // ── Header ────────────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
    flex: 1,
  },
  headerSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },

  // ── Phase badge ───────────────────────────────────────────────
  phaseContainer: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  phaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  phaseText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
  },

  // ── Progress ring section ─────────────────────────────────────
  ringSection: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  timerText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xxxl,
    lineHeight: typography.lineHeights.xxxl,
    color: colors.text.primary,
    textAlign: 'center',
  },
  timerSubtext: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },

  // ── Layer indicators ──────────────────────────────────────────
  layerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginVertical: spacing.lg,
  },
  layerItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  layerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.tertiary,
  },
  layerLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.text.tertiary,
  },

  // ── Progress bar ──────────────────────────────────────────────
  progressTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.background.tertiary,
    overflow: 'hidden',
    marginVertical: spacing.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  // ── Controls ──────────────────────────────────────────────────
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    marginVertical: spacing.xl,
  },
  playPauseButton: {
    width: 72,
    height: 72,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButton: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Hint text ─────────────────────────────────────────────────
  hintText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
  },

  // ── Error ─────────────────────────────────────────────────────
  errorCard: {
    backgroundColor: 'rgba(225, 112, 85, 0.15)',
    borderRadius: radii.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.error,
    padding: spacing.md,
    marginVertical: spacing.md,
  },
  errorText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.accent.error,
  },

  // ── Loading / preparing ───────────────────────────────────────
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.lg,
    lineHeight: typography.lineHeights.lg,
    color: colors.text.secondary,
  },
  loadingSubtext: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.tertiary,
  },

  // ── Completion overlay ────────────────────────────────────────
  completionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 14, 26, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  completionCard: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  completionTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xxl,
    lineHeight: typography.lineHeights.xxl,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  completionDuration: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  ratingLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  starButton: {
    padding: spacing.xs,
  },
  moodLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  moodButton: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  moodButtonText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.secondary,
  },
  saveButton: {
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    marginTop: spacing.md,
  },
  saveButtonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
  },
  skipButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  skipButtonText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.tertiary,
  },
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PlayerScreen() {
  const params = useLocalSearchParams<{ id: string; length?: string }>();
  const router = useRouter();

  // Keep screen on during session
  useKeepAwake();

  // ── Practice data (from contentStore, INV-3) ─────────────────
  const practiceId = params.id ?? '';
  const practice = useContentStore((s) => s.getPractice(practiceId));
  const loaded = useContentStore((s) => s.loaded);

  // ── Audio engine controls (INV-2: single owner) ───────────────
  const { startSession, pause, resume, stop, isActive, isPlaying } = useAudioEngine();

  // ── Real-time audio state (INV-3: memory-only reads) ──────────
  const engineState = useAudioStateStore((s) => s.engineState);
  const phase = useAudioStateStore((s) => s.phase);
  const elapsedMs = useAudioStateStore((s) => s.elapsedMs);
  const totalDurationMs = useAudioStateStore((s) => s.totalDurationMs);
  const musicState = useAudioStateStore((s) => s.music);
  const binauralState = useAudioStateStore((s) => s.binaural);
  const voiceState = useAudioStateStore((s) => s.voice);
  const audioError = useAudioStateStore((s) => s.error);

  // ── System theme ──────────────────────────────────────────────
  const systemTheme = useMemo(() => {
    if (!practice) return getSystemTheme('transurfing');
    return getSystemTheme(practice.systemId);
  }, [practice]);
  const systemColor = systemTheme.primaryColor;

  // ── Session length ────────────────────────────────────────────
  const sessionLength: SessionLength = useMemo(() => {
    if (!practice) return 'full';
    const raw = Array.isArray(params.length) ? params.length[0] : params.length;
    const requested = raw as SessionLength | undefined;
    if (requested && isLengthAvailable(practice, requested)) return requested;
    return getDefaultLength(practice);
  }, [practice, params.length]);

  // ── Session ID (stable across renders) ────────────────────────
  const sessionId = useMemo(
    () => `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    [],
  );

  // ── Derived state ─────────────────────────────────────────────
  const progress = totalDurationMs > 0 ? elapsedMs / totalDurationMs : 0;
  const isPreparing = engineState === 'preparing' || engineState === 'idle';
  const isFinished = engineState === 'finished';
  const isActiveSession = isActive || isPreparing;

  // ── Completion state ──────────────────────────────────────────
  const [showCompletion, setShowCompletion] = useState(false);
  const [rating, setRating] = useState(0);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // ── Session start guard (prevent double-start) ────────────────
  const sessionStartedRef = useRef(false);

  // ── Auto-start session on mount ───────────────────────────────
  useEffect(() => {
    if (!practice || !loaded || sessionStartedRef.current) return;
    sessionStartedRef.current = true;

    const segments = getSegmentsForLength(practice, sessionLength);
    const totalMs = computeTotalDurationMs(segments);

    startSession(practice.id, practice.systemId, sessionId, segments, sessionLength, totalMs).catch(
      () => {
        Alert.alert('Ошибка', 'Не удалось запустить сессию.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practice, loaded]);

  // ── Show completion overlay when engine finishes ──────────────
  useEffect(() => {
    if (engineState === 'finished' && !showCompletion) {
      setShowCompletion(true);
    }
  }, [engineState, showCompletion]);

  // ── Hardware back button ──────────────────────────────────────
  useEffect(() => {
    const handleBack = () => {
      if (showCompletion) return true; // block back when showing completion
      if (isActiveSession) {
        showStopConfirm();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActiveSession, showCompletion]);

  // ── Callbacks ─────────────────────────────────────────────────

  const showStopConfirm = useCallback(() => {
    Alert.alert('Завершить сессию?', 'Ваш прогресс не будет сохранён.', [
      { text: 'Продолжить', style: 'cancel' },
      {
        text: 'Завершить',
        style: 'destructive',
        onPress: () => {
          stop();
          router.back();
        },
      },
    ]);
  }, [stop, router]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  }, [isPlaying, pause, resume]);

  const handleStop = useCallback(() => {
    if (elapsedMs > 10_000) {
      showStopConfirm();
    } else {
      stop();
      router.back();
    }
  }, [elapsedMs, stop, router, showStopConfirm]);

  const handleBack = useCallback(() => {
    if (isActiveSession) {
      showStopConfirm();
    }
  }, [isActiveSession, showStopConfirm]);

  const handleSaveCompletion = useCallback(() => {
    if (!practice) return;
    const durationMin = msToMinutes(elapsedMs);
    useProgressStore.getState().incrementCompleted(practice.id, durationMin);

    // Check if a level-up occurred and fire achievement notification
    const progress = useProgressStore.getState().getPracticeProgress(practice.id);
    if (progress) {
      const systemInfo = useContentStore.getState().systems[practice.systemId];
      if (systemInfo) {
        notifyAchievement(systemInfo.name, progress.currentLevel, practice.systemId).catch(() => {
          // Best-effort — don't block the save flow
        });
      }
    }

    useAudioStateStore.getState().reset();
    router.back();
  }, [practice, elapsedMs, router]);

  const handleCloseCompletion = useCallback(() => {
    useAudioStateStore.getState().reset();
    router.back();
  }, [router]);

  // ── Not-found / loading guard ─────────────────────────────────

  if (!loaded || !practice) {
    return (
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={styles.gradient}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.loadingContainer}>
            <Ionicons name="fitness" size={48} color={colors.text.tertiary} />
            <Text style={styles.loadingText}>{loaded ? 'Практика не найдена' : 'Загрузка...'}</Text>
            {loaded && (
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.loadingSubtext}>Вернуться назад</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ── Main render ───────────────────────────────────────────────

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.container}>
          {/* ── Header ───────────────────────────────────────── */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              accessibilityLabel="Назад"
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {practice.title}
              </Text>
              <Text style={styles.headerSubtitle}>
                {LENGTH_LABELS[sessionLength]} — {PHASE_LABELS[phase]}
              </Text>
            </View>
          </View>

          {/* ── Phase badge ──────────────────────────────────── */}
          <View style={styles.phaseContainer}>
            <View style={[styles.phaseBadge, { backgroundColor: `${systemColor}22` }]}>
              <Ionicons name={PHASE_ICONS[phase] as any} size={18} color={systemColor} />
              <Text style={[styles.phaseText, { color: systemColor }]}>{PHASE_LABELS[phase]}</Text>
            </View>
          </View>

          {/* ── Progress ring ────────────────────────────────── */}
          <View style={styles.ringSection}>
            <ProgressRing progress={progress} size={220} strokeWidth={6} color={systemColor}>
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.timerText}>{formatDuration(elapsedMs)}</Text>
                <Text style={styles.timerSubtext}>из {formatDuration(totalDurationMs)}</Text>
              </View>
            </ProgressRing>
          </View>

          {/* ── Layer indicators ─────────────────────────────── */}
          <View style={styles.layerRow}>
            {/* Music */}
            <View style={styles.layerItem}>
              <View
                style={[
                  styles.layerDot,
                  {
                    backgroundColor:
                      musicState.status === 'playing'
                        ? systemColor
                        : musicState.status === 'error'
                          ? colors.accent.error
                          : colors.text.tertiary,
                  },
                ]}
              />
              <Text style={styles.layerLabel}>Музыка</Text>
            </View>
            {/* Binaural */}
            <View style={styles.layerItem}>
              <View
                style={[
                  styles.layerDot,
                  {
                    backgroundColor:
                      binauralState.status === 'playing'
                        ? systemColor
                        : binauralState.status === 'error'
                          ? colors.accent.error
                          : colors.text.tertiary,
                  },
                ]}
              />
              <Text style={styles.layerLabel}>Бинаур.</Text>
            </View>
            {/* Voice */}
            <View style={styles.layerItem}>
              <View
                style={[
                  styles.layerDot,
                  {
                    backgroundColor:
                      voiceState.status === 'playing'
                        ? systemColor
                        : voiceState.status === 'error'
                          ? colors.accent.error
                          : colors.text.tertiary,
                  },
                ]}
              />
              <Text style={styles.layerLabel}>Голос</Text>
            </View>
          </View>

          {/* ── Progress bar ─────────────────────────────────── */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.round(Math.min(100, progress * 100))}%`,
                  backgroundColor: systemColor,
                },
              ]}
            />
          </View>

          {/* ── Player controls ──────────────────────────────── */}
          {isPreparing ? (
            <View style={styles.loadingContainer}>
              <Ionicons name="hourglass-outline" size={32} color={systemColor} />
              <Text style={styles.loadingText}>Подготовка сессии...</Text>
            </View>
          ) : (
            <View style={styles.controlsContainer}>
              {/* Play / Pause (centre) */}
              <TouchableOpacity
                style={[
                  styles.playPauseButton,
                  {
                    backgroundColor: isPlaying ? colors.background.tertiary : systemColor,
                  },
                ]}
                onPress={handlePlayPause}
                accessibilityLabel={isPlaying ? 'Пауза' : 'Продолжить'}
                accessibilityRole="button"
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={32}
                  color={colors.text.primary}
                />
              </TouchableOpacity>

              {/* Stop */}
              <TouchableOpacity
                style={styles.stopButton}
                onPress={handleStop}
                accessibilityLabel="Остановить"
                accessibilityRole="button"
              >
                <Ionicons name="stop" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
          )}

          {/* ── Error display ────────────────────────────────── */}
          {audioError ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{audioError}</Text>
            </View>
          ) : null}

          {/* ── Hint ─────────────────────────────────────────── */}
          {!isPreparing && !isFinished ? (
            <Text style={styles.hintText}>Нажмите для паузы</Text>
          ) : null}
        </View>

        {/* ── Completion overlay ─────────────────────────────── */}
        {showCompletion ? (
          <View style={styles.completionOverlay}>
            <View style={styles.completionCard}>
              <Text style={styles.completionTitle}>Сессия завершена</Text>
              <Text style={styles.completionDuration}>
                Длительность: {formatDuration(elapsedMs)}
              </Text>

              {/* Rating */}
              <Text style={styles.ratingLabel}>Оцените практику</Text>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    style={styles.starButton}
                    onPress={() => setRating(star)}
                    accessibilityLabel={`${star} из 5`}
                    accessibilityRole="button"
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={28}
                      color={star <= rating ? colors.accent.warning : colors.text.tertiary}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Mood */}
              <Text style={styles.moodLabel}>Как вы себя чувствуете?</Text>
              <View style={styles.moodGrid}>
                {MOOD_OPTIONS.map((mood) => {
                  const isSelected = selectedMood === mood.key;
                  return (
                    <TouchableOpacity
                      key={mood.key}
                      style={[
                        styles.moodButton,
                        isSelected && {
                          backgroundColor: `${systemColor}33`,
                          borderColor: systemColor,
                        },
                      ]}
                      onPress={() => setSelectedMood(isSelected ? null : mood.key)}
                      accessibilityLabel={mood.label}
                      accessibilityRole="button"
                    >
                      <Ionicons
                        name={mood.icon as any}
                        size={16}
                        color={isSelected ? systemColor : colors.text.tertiary}
                        style={{ marginRight: spacing.xs }}
                      />
                      <Text style={[styles.moodButtonText, isSelected && { color: systemColor }]}>
                        {mood.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Actions */}
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: systemColor }]}
                onPress={handleSaveCompletion}
                accessibilityLabel="Сохранить"
                accessibilityRole="button"
              >
                <Text style={styles.saveButtonText}>Сохранить</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleCloseCompletion}
                accessibilityLabel="Закрыть без сохранения"
                accessibilityRole="button"
              >
                <Text style={styles.skipButtonText}>Закрыть без сохранения</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </SafeAreaView>
    </LinearGradient>
  );
}
