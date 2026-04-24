/**
 * @file SystemTabContent — Shared content component for all 5 system tab screens.
 *
 * Replaces duplicated placeholder code in each tab screen.
 * Reads real practices from contentStore and progress from progressStore.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import React, { useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
}

// ─── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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

export function SystemTabContent({ systemId, title, icon }: SystemTabContentProps) {
  const router = useRouter();

  const practices = useContentStore((s) => s.getPracticesBySystem(systemId));
  const loaded = useContentStore((s) => s.loaded);
  const getPracticeProgress = useProgressStore((s) => s.getPracticeProgress);
  const getSystemProgress = useProgressStore((s) => s.getSystemProgress);

  const systemTheme = getSystemTheme(systemId);

  // Build system progress snapshot for unlock checking
  const systemProgressSnapshot = useMemo((): SystemProgressSnapshot | null => {
    if (!loaded) return null;
    const sysProgress = getSystemProgress(systemId);
    // Get progression rules from content registry
    const system = useContentStore.getState().systems[systemId];
    if (!system) return null;

    // We need the actual ProgressionRule[] from the System definition
    // The contentStore only stores a subset; get rules from registry
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
  }, [loaded, systemId, practices, getSystemProgress, getPracticeProgress]);

  const handlePracticePress = useCallback(
    (practiceId: string) => {
      router.push(`/practice/${practiceId}` as any);
    },
    [router],
  );

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
          onPress={handlePracticePress}
        />
      );
    },
    [getPracticeProgress, systemProgressSnapshot, systemTheme, handlePracticePress],
  );

  // Loading state
  if (!loaded) {
    return (
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon as any} size={24} color={colors.text.primary} />
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
      <View style={styles.headerContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={24} color={colors.text.primary} />
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
