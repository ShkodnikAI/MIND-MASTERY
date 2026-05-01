/**
 * @file Practice Detail — Full practice information screen.
 *
 * Route: /practice/[id]
 * Shows practice title, description, difficulty, duration, tags,
 * contraindications, segment breakdown, and a Start button.
 * Reads from contentStore and progressStore.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useContentStore } from '@/store/contentStore';
import { getSystemPhysics } from '@/content/systemPhysics';
import type { SystemPhysics } from '@/content/systemPhysics';
import { useProgressStore } from '@/store/progressStore';
import { useSettingsStore } from '@/store/settingsStore';
import { colors, typography, spacing, radii } from '@/ui/theme';
import { getDefaultLength, isLengthAvailable } from '@/domain/session/filterSegmentsByLength';
import { getSystemTheme } from '@/ui/theme/systemThemes';
import {
  isPracticeUnlocked,
  getLockReason,
  type SystemProgressSnapshot,
} from '@/domain/progression/checkUnlock';
import type { DifficultyLevel, SessionLength } from '@/types';

// ─── Difficulty labels ───────────────────────────────────────────

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  beginner: 'Начинающий',
  elementary: 'Элементарный',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
  master: 'Мастер',
};

const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  beginner: colors.accent.success,
  elementary: '#74B9FF',
  intermediate: colors.accent.warning,
  advanced: colors.accent.primary,
  master: '#E17055',
};

// ─── Phase labels ────────────────────────────────────────────────

const PHASE_LABELS: Record<string, string> = {
  preparation: 'Подготовка',
  induction: 'Погружение',
  deepening: 'Углубление',
  work: 'Основная практика',
  integration: 'Интеграция',
  reorientation: 'Возвращение',
};

// ─── Segment kind labels ─────────────────────────────────────────

const SEGMENT_KIND_LABELS: Record<string, string> = {
  voice: 'Голос',
  music: 'Музыка',
  binaural: 'Бинауральный ритм',
  silence: 'Пауза',
  theory: 'Теория',
};

const SEGMENT_KIND_ICONS: Record<string, string> = {
  voice: 'mic-outline',
  music: 'musical-notes-outline',
  binaural: 'headphones-outline',
  silence: 'pause-circle-outline',
  theory: 'book-outline',
};

// ─── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xxl,
    lineHeight: typography.lineHeights.xxl,
    color: colors.text.primary,
    flex: 1,
  },
  descriptionText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.secondary,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.lg,
    lineHeight: typography.lineHeights.lg,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tagBadge: {
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  tagText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.accent.secondary,
  },
  warningCard: {
    backgroundColor: 'rgba(253, 203, 110, 0.15)',
    borderRadius: radii.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.warning,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  warningTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.accent.warning,
    marginBottom: spacing.xs,
  },
  warningText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.secondary,
  },
  segmentCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  segmentIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentInfo: {
    flex: 1,
    gap: 2,
  },
  segmentLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.primary,
  },
  segmentDuration: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.text.tertiary,
  },
  startButton: {
    backgroundColor: colors.accent.primary,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  startButtonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.lg,
    lineHeight: typography.lineHeights.lg,
    color: colors.text.primary,
  },
  lockedButton: {
    backgroundColor: colors.background.elevated,
  },
  lockReasonText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.accent.warning,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  physicsSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  physicsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
  },
  physicsHeaderText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
  },
  physicsCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  physicsSubtitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.accent.primary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  physicsText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm + 4,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  physicsResultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  physicsResultBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent.success,
    marginTop: 6,
  },
  physicsResultText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm + 2,
    color: colors.text.secondary,
    flex: 1,
  },
  notFoundText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xxxl,
  },
});

// ─── Component ───────────────────────────────────────────────────

export default function PracticeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [selectedLength, setSelectedLength] = useState<SessionLength | null>(null);
  const [physicsExpanded, setPhysicsExpanded] = useState(false);

  const practice = useContentStore((s) => s.getPractice(id ?? ''));
  const loaded = useContentStore((s) => s.loaded);
  const getPracticeProgress = useProgressStore((s) => s.getPracticeProgress);
  const getSystemProgress = useProgressStore((s) => s.getSystemProgress);
  const giveConsent = useSettingsStore((s) => s.giveConsent);

  const systemColor = useMemo(() => {
    if (!practice) return colors.accent.primary;
    const theme = getSystemTheme(practice.systemId);
    return theme.gradientColors[0];
  }, [practice]);

  const physics = useMemo((): SystemPhysics | null => {
    if (!practice) return null;
    return getSystemPhysics(practice.systemId);
  }, [practice]);

  // Effective session length (user selection or default)
  const effectiveLength = useMemo((): SessionLength => {
    if (!practice) return 'medium';
    if (selectedLength && isLengthAvailable(practice, selectedLength)) return selectedLength;
    return getDefaultLength(practice);
  }, [practice, selectedLength]);

  // Build unlock state
  const { isUnlocked, lockReason, hasContraindications, consentGiven } = useMemo(() => {
    if (!practice)
      return {
        isUnlocked: false,
        lockReason: '',
        hasContraindications: false,
        consentGiven: false,
      };

    const progress = getPracticeProgress(practice.id);
    const allSystems = require('@/content/registry').getAllSystems();
    const fullSystem = allSystems.find((s: { id: string }) => s.id === practice.systemId);
    const rules = fullSystem?.progression ?? [];

    const sysProgressSnap: SystemProgressSnapshot | null = {
      totalSessionMin: getSystemProgress(practice.systemId).totalSessionMin,
      completedCount: getSystemProgress(practice.systemId).unlockedPractices,
      progressionRules: rules,
    };

    const unlocked = isPracticeUnlocked(practice, progress, sysProgressSnap);
    const reason = getLockReason(practice, sysProgressSnap);
    const hasC = practice.contraindications.length > 0;

    // Check consent
    const consent = useSettingsStore.getState().safety.consentGivenFor[practice.id] === true;

    return {
      isUnlocked: unlocked,
      lockReason: reason,
      hasContraindications: hasC,
      consentGiven: consent,
    };
  }, [practice, getPracticeProgress, getSystemProgress]);

  const handleStart = useCallback(() => {
    if (!practice) return;
    // Give consent for contraindications if not already given
    if (hasContraindications && !consentGiven) {
      giveConsent(practice.id);
    }
    router.push(`/player/${practice.id}?length=${effectiveLength}`);
  }, [practice, hasContraindications, consentGiven, giveConsent, router, effectiveLength]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Not found state
  if (!loaded) {
    return (
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.scrollContent}>
            <Text style={styles.notFoundText}>Загрузка...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!practice) {
    return (
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.scrollContent}>
            <View style={styles.headerRow}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.notFoundText}>Практика не найдена</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const progress = getPracticeProgress(practice.id);
  const completed = progress?.completedCount ?? 0;

  // Separate voice segments for timeline display
  const timelineSegments = practice.segments.filter(
    (s) => s.kind === 'voice' || s.kind === 'silence',
  );

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
            </TouchableOpacity>
            <Text style={styles.titleText} numberOfLines={2}>
              {practice.title}
            </Text>
          </View>

          {/* Description */}
          <Text style={styles.descriptionText}>{practice.description}</Text>

          {/* Meta badges */}
          <View style={styles.metaRow}>
            {/* Difficulty */}
            <View style={styles.badge}>
              <Ionicons
                name="trophy-outline"
                size={14}
                color={DIFFICULTY_COLORS[practice.difficulty]}
              />
              <Text style={[styles.badgeText, { color: DIFFICULTY_COLORS[practice.difficulty] }]}>
                {DIFFICULTY_LABELS[practice.difficulty]}
              </Text>
            </View>

            {/* Duration */}
            <View style={styles.badge}>
              <Ionicons name="time-outline" size={14} color={colors.text.tertiary} />
              <Text style={styles.badgeText}>~{practice.estimatedDurationMin} мин</Text>
            </View>

            {/* Level */}
            <View style={styles.badge}>
              <Ionicons name="layers-outline" size={14} color={colors.text.tertiary} />
              <Text style={styles.badgeText}>Уровень {practice.requiredLevel}</Text>
            </View>

            {/* Completed count */}
            {completed > 0 && (
              <View style={styles.badge}>
                <Ionicons name="checkmark-done-outline" size={14} color={colors.accent.success} />
                <Text style={[styles.badgeText, { color: colors.accent.success }]}>
                  {completed} раз
                </Text>
              </View>
            )}
          </View>

          {/* Contraindications warning */}
          {hasContraindications ? (
            <View style={styles.warningCard}>
              <Text style={styles.warningTitle}>Противопоказания</Text>
              {practice.contraindications.map((c, i) => (
                <Text key={i} style={styles.warningText}>
                  {c}
                </Text>
              ))}
            </View>
          ) : null}

          {/* Tags */}
          {practice.tags.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Теги</Text>
              <View style={styles.tagsContainer}>
                {practice.tags.map((tag) => (
                  <View key={tag} style={styles.tagBadge}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {/* Physics panel */}
          {physics ? (
            <View style={styles.physicsSection}>
              <TouchableOpacity
                style={styles.physicsHeader}
                onPress={() => setPhysicsExpanded(!physicsExpanded)}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Ionicons name="scan-outline" size={18} color={systemColor} />
                  <Text style={styles.physicsHeaderText}>Физика процесса</Text>
                </View>
                <Ionicons
                  name="chevron-down-outline"
                  size={20}
                  color={colors.text.tertiary}
                  style={{ transform: [{ rotate: physicsExpanded ? '180deg' : '0deg' }] }}
                />
              </TouchableOpacity>

              {physicsExpanded ? (
                <View style={styles.physicsCard}>
                  <Text style={styles.physicsSubtitle}>Суть метода</Text>
                  <Text style={styles.physicsText}>{physics.essence}</Text>

                  <Text style={styles.physicsSubtitle}>Как это работает</Text>
                  <Text style={styles.physicsText}>{physics.physics}</Text>

                  <Text style={styles.physicsSubtitle}>Нейробиологическое обоснование</Text>
                  <Text style={styles.physicsText}>{physics.neuroscience}</Text>

                  <Text style={styles.physicsSubtitle}>Механика практики</Text>
                  <Text style={styles.physicsText}>{physics.practiceMechanics}</Text>

                  <Text style={styles.physicsSubtitle}>Ожидаемые результаты</Text>
                  {physics.expectedResults.map((result, i) => (
                    <View key={i} style={styles.physicsResultItem}>
                      <View style={styles.physicsResultBullet} />
                      <Text style={styles.physicsResultText}>{result}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Session timeline */}
          {timelineSegments.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Структура сессии</Text>
              {timelineSegments.map((segment, i) => {
                const phaseLabel =
                  segment.kind === 'voice' ? (PHASE_LABELS[(segment as any).phase] ?? '') : '';

                return (
                  <View key={i} style={styles.segmentCard}>
                    <View style={styles.segmentIcon}>
                      <Ionicons
                        name={(SEGMENT_KIND_ICONS[segment.kind] ?? 'ellipse-outline') as any}
                        size={16}
                        color={systemColor}
                      />
                    </View>
                    <View style={styles.segmentInfo}>
                      <Text style={styles.segmentLabel}>
                        {SEGMENT_KIND_LABELS[segment.kind] ?? segment.kind}
                        {phaseLabel ? ` — ${phaseLabel}` : ''}
                      </Text>
                      <Text style={styles.segmentDuration}>
                        {segment.kind === 'silence'
                          ? `${segment.durationSec} сек`
                          : segment.kind === 'voice'
                            ? `~${segment.durationSec} сек`
                            : ''}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </>
          ) : null}

          {/* Length presets */}
          <Text style={styles.sectionTitle}>Длительность</Text>
          <View style={styles.metaRow}>
            {practice.includeIn.map((length) => {
              const isSelected = length === effectiveLength;
              return (
                <TouchableOpacity
                  key={length}
                  style={[
                    styles.badge,
                    isSelected && {
                      backgroundColor: `${systemColor}33`,
                      borderWidth: 1,
                      borderColor: systemColor,
                    },
                  ]}
                  onPress={() => setSelectedLength(length)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.badgeText, isSelected && { color: systemColor }]}>
                    {length === 'short' ? 'Короткая' : length === 'medium' ? 'Средняя' : 'Полная'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Start button */}
          <TouchableOpacity
            style={[styles.startButton, !isUnlocked && styles.lockedButton]}
            onPress={isUnlocked ? handleStart : undefined}
            activeOpacity={isUnlocked ? 0.8 : 1}
            accessibilityLabel={isUnlocked ? 'Начать практику' : 'Практика заблокирована'}
            accessibilityRole="button"
          >
            <Text style={styles.startButtonText}>{isUnlocked ? 'Начать' : 'Заблокировано'}</Text>
          </TouchableOpacity>

          {!isUnlocked && lockReason ? (
            <Text style={styles.lockReasonText}>{lockReason}</Text>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
