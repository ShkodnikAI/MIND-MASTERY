/**
 * @file PracticeCard — Practice item for system tab lists.
 *
 * Displays practice title, difficulty badge, estimated duration,
 * lock/unlock status, and completion count.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii } from '@/ui/theme';
import type { Practice, PracticeProgress } from '@/types';

// ─── Props ───────────────────────────────────────────────────────

interface PracticeCardProps {
  readonly practice: Practice;
  readonly progress: PracticeProgress | null;
  readonly isUnlocked: boolean;
  readonly lockReason: string;
  readonly systemColor: string;
  readonly onPress: (practiceId: string) => void;
}

// ─── Difficulty labels ───────────────────────────────────────────

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Начинающий',
  elementary: 'Элементарный',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
  master: 'Мастер',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: colors.accent.success,
  elementary: '#74B9FF',
  intermediate: colors.accent.warning,
  advanced: colors.accent.primary,
  master: '#E17055',
};

// ─── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: radii.md,
    padding: spacing.md,
  },
  lockedCard: {
    opacity: 0.55,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockedIcon: {
    backgroundColor: 'rgba(0, 184, 148, 0.2)',
  },
  lockedIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  completedIcon: {
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
  },
  infoColumn: {
    flex: 1,
    gap: spacing.xs,
  },
  titleText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
  },
  descriptionText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  difficultyText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
  },
  durationText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  completedCountText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.accent.secondary,
  },
  lockReasonText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.accent.warning,
    marginTop: spacing.xs,
  },
});

// ─── Component ───────────────────────────────────────────────────

export function PracticeCard({
  practice,
  progress,
  isUnlocked,
  lockReason,
  systemColor,
  onPress,
}: PracticeCardProps) {
  const completed = progress?.completedCount ?? 0;
  const isCompleted = completed > 0;

  const handlePress = () => {
    onPress(practice.id);
  };

  return (
    <TouchableOpacity
      style={[styles.card, !isUnlocked && styles.lockedCard]}
      onPress={handlePress}
      activeOpacity={isUnlocked ? 0.7 : 0.9}
      accessibilityLabel={practice.title}
      accessibilityRole="button"
      accessibilityState={{ disabled: !isUnlocked }}
    >
      <View style={styles.topRow}>
        {/* Status icon */}
        <View
          style={[
            styles.statusIcon,
            !isUnlocked
              ? styles.lockedIcon
              : isCompleted
                ? styles.completedIcon
                : styles.unlockedIcon,
          ]}
        >
          <Ionicons
            name={
              !isUnlocked
                ? 'lock-closed-outline'
                : isCompleted
                  ? 'checkmark-done'
                  : 'play-outline'
            }
            size={18}
            color={
              !isUnlocked
                ? colors.text.tertiary
                : isCompleted
                  ? systemColor
                  : colors.accent.success
            }
          />
        </View>

        {/* Info */}
        <View style={styles.infoColumn}>
          <Text style={styles.titleText}>{practice.title}</Text>
          <Text style={styles.descriptionText} numberOfLines={2}>
            {practice.description}
          </Text>
        </View>
      </View>

      {/* Meta row */}
      <View style={styles.metaRow}>
        <View style={styles.difficultyBadge}>
          <Text
            style={[
              styles.difficultyText,
              { color: DIFFICULTY_COLORS[practice.difficulty] ?? colors.text.secondary },
            ]}
          >
            {DIFFICULTY_LABELS[practice.difficulty] ?? practice.difficulty}
          </Text>
        </View>

        <Text style={styles.durationText}>~{practice.estimatedDurationMin} мин</Text>

        {completed > 0 && (
          <Text style={styles.completedCountText}>
            {completed}{' '}
            {completed === 1 ? 'раз' : completed < 5 ? 'раза' : 'раз'}
          </Text>
        )}
      </View>

      {/* Lock reason */}
      {!isUnlocked && lockReason !== '' ? (
        <Text style={styles.lockReasonText}>{lockReason}</Text>
      ) : null}
    </TouchableOpacity>
  );
}
