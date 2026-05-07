/**
 * @file SystemTabContent — Shared content component for all system tab screens.
 *
 * Layout: back button row → icon + title + count row → practice list.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import React, { useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useContentStore } from '@/store/contentStore';
import { useProgressStore } from '@/store/progressStore';
import { PracticeCard } from '@/ui/components/PracticeCard';
import { colors, typography, spacing, radii } from '@/ui/theme';
import { getSystemTheme } from '@/ui/theme/systemThemes';
import type { SystemId, Practice, PracticeProgress, ProgressionRule } from '@/types';
import { getLockReason, isPracticeUnlocked } from '@/domain/progression/checkUnlock';
import { SystemProgressSnapshot } from '@/domain/progression/checkUnlock';

// ─── Props ───────────────────────────────────────────────────────

interface SystemTabContentProps {
  readonly systemId: SystemId;
  readonly title: string;
  readonly icon: string;
  readonly onPracticePress: (practiceId: string) => void;
}

// ─── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  // Back button — standalone row
  backButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  backButtonText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.secondary,
  },
  // Icon + title + count — second row
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xl,
    lineHeight: typography.lineHeights.xl,
    color: colors.text.primary,
    flex: 1,
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  countText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.text.secondary,
  },
  listContainer: {
    gap: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxxl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxxl,
  },
  emptyText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});

// ─── Component ───────────────────────────────────────────────────

export function SystemTabContent({ systemId, title, icon, onPracticePress }: SystemTabContentProps) {
  const router = useRouter();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const practicesCount = useContentStore((s) => Object.keys(s.practices).length);
  const practicesLoaded = useContentStore((s) => s.practicesLoaded);

  const practices = useMemo(() => {
    const raw = useContentStore.getState().practices;
    if (!raw || Object.keys(raw).length === 0) return [];
    return Object.values(raw)
      .filter((p) => p.systemId === systemId)
      .sort((a, b) => a.requiredLevel - b.requiredLevel);
  }, [practicesCount, systemId]);

  const getPracticeProgress = useProgressStore((s) => s.getPracticeProgress);
  const getSystemProgress = useProgressStore((s) => s.getSystemProgress);

  const systemTheme = getSystemTheme(systemId);

  const systemProgressSnapshot = useMemo((): SystemProgressSnapshot | null => {
    if (!practicesLoaded) return null;
    const sysProgress = getSystemProgress(systemId);
    const system = useContentStore.getState().systems[systemId];
    if (!system) return null;

    const allSystems = require('@/content/registry').getAllSystems();
    const fullSystem = allSystems.find((s: { id: string }) => s.id === systemId);
    const rules: ProgressionRule[] = fullSystem?.progression ?? [];

    return {
      totalSessionMin: sysProgress.totalSessionMin,
      completedCount:
        sysProgress.totalPractices > 0
          ? practices.reduce((sum: number, _p: Practice) => {
              const pp = getPracticeProgress(_p.id);
              return sum + (pp?.completedCount ?? 0);
            }, 0)
          : 0,
      progressionRules: rules,
    };
  }, [practicesLoaded, systemId, practices, getSystemProgress, getPracticeProgress]);

  const renderItem = useCallback(
    ({ item }: { readonly item: Practice }) => {
      const progress: PracticeProgress | null = getPracticeProgress(item.id);
      const unlocked = isPracticeUnlocked(item, progress, systemProgressSnapshot);
      const lockReason = getLockReason(item, systemProgressSnapshot);

      return (
        <PracticeCard
          practice={item}
          progress={progress}
          isUnlocked={unlocked}
          lockReason={lockReason}
          systemColor={systemTheme.gradientColors[0]}
          onPress={onPracticePress}
        />
      );
    },
    [getPracticeProgress, systemProgressSnapshot, systemTheme, onPracticePress],
  );

  // Loading state
  if (!practicesLoaded) {
    return (
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButtonRow}
          onPress={handleBack}
          accessibilityLabel="Назад"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={20} color={colors.text.secondary} />
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon as any} size={22} color={colors.text.primary} />
          </View>
          <Text style={styles.titleText}>{title}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={systemTheme.gradientColors[0]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.content}>
      {/* Row 1: Back button */}
      <TouchableOpacity
        style={styles.backButtonRow}
        onPress={handleBack}
        accessibilityLabel="Назад"
        accessibilityRole="button"
      >
        <Ionicons name="arrow-back" size={20} color={colors.text.secondary} />
        <Text style={styles.backButtonText}>Назад</Text>
      </TouchableOpacity>

      {/* Row 2: Icon + Title + Count */}
      <View style={styles.headerRow}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={22} color={colors.text.primary} />
        </View>
        <Text style={styles.titleText}>{title}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {practices.length}{' '}
            {practices.length === 1 ? 'практика' : practices.length < 5 ? 'практики' : 'практик'}
          </Text>
        </View>
      </View>

      <FlatList
        data={practices}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Практики не найдены</Text>
          </View>
        }
      />
    </View>
  );
}
