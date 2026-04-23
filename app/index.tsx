/**
 * @file Hub Screen — Main entry point of MIND MASTERY.
 *
 * Shows a time-of-day greeting, 5 system cards with real practice counts
 * and progress from contentStore/progressStore, a FAB for Moment of Power,
 * and a settings gear icon.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { HubCard } from '@/ui/components/HubCard';
import { useContentStore } from '@/store/contentStore';
import { useProgressStore } from '@/store/progressStore';
import { colors, typography, spacing, radii } from '@/ui/theme';
import { logger } from '@/utils/logger';
import type { SystemId } from '@/types';

// ─── System definitions ─────────────────────────────────────────

interface SystemDef {
  readonly id: SystemId;
  readonly name: string;
  readonly tagline: string;
  readonly icon: string;
  readonly color: string;
  readonly tabRoute: string;
}

const SYSTEMS: readonly SystemDef[] = [
  {
    id: 'transurfing',
    name: 'Трансерфинг',
    tagline: 'Управление реальностью через намерение',
    icon: 'sparkles-outline',
    color: colors.transurfing,
    tabRoute: '/(tabs)/transurfing',
  },
  {
    id: 'silva',
    name: 'Сильва',
    tagline: 'Альфа-состояние и интуиция',
    icon: 'leaf-outline',
    color: colors.silva,
    tabRoute: '/(tabs)/silva',
  },
  {
    id: 'dispenza',
    name: 'Диспенза',
    tagline: 'Исцеление через медитацию',
    icon: 'sunny-outline',
    color: colors.dispenza,
    tabRoute: '/(tabs)/dispenza',
  },
  {
    id: 'feldenkrais',
    name: 'Фельденкрайз',
    tagline: 'Осознание через движение',
    icon: 'body-outline',
    color: colors.feldenkrais,
    tabRoute: '/(tabs)/feldenkrais',
  },
  {
    id: 'breath',
    name: 'Дыхание',
    tagline: 'Дыхательные практики',
    icon: 'fitness-outline',
    color: colors.breath,
    tabRoute: '/(tabs)/breath',
  },
] as const;

// ─── Helpers ────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Доброе утро';
  if (hour < 18) return 'Добрый день';
  return 'Добрый вечер';
}

// ─── Styles ─────────────────────────────────────────────────────

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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greetingText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.title,
    lineHeight: typography.lineHeights.title,
    color: colors.text.primary,
    flex: 1,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitleText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xl,
    lineHeight: typography.lineHeights.xl,
    color: colors.accent.primary,
  },
  statLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  cardsContainer: {
    gap: spacing.md,
  },
  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
});

// ─── Component ──────────────────────────────────────────────────

export default function HubScreen() {
  const router = useRouter();

  // Real data from stores
  const loaded = useContentStore((s) => s.loaded);
  const getPracticesBySystem = useContentStore((s) => s.getPracticesBySystem);
  const getSystemProgress = useProgressStore((s) => s.getSystemProgress);

  const greeting = useMemo(() => getGreeting(), []);

  // Compute total stats
  const stats = useMemo(() => {
    if (!loaded) return { totalPractices: 0, totalUnlocked: 0, totalMin: 0 };

    let totalPractices = 0;
    let totalUnlocked = 0;
    let totalMin = 0;

    for (const sys of SYSTEMS) {
      const practices = getPracticesBySystem(sys.id);
      totalPractices += practices.length;

      const sysProgress = getSystemProgress(sys.id);
      totalUnlocked += sysProgress.unlockedPractices;
      totalMin += sysProgress.totalSessionMin;
    }

    return { totalPractices, totalUnlocked, totalMin };
  }, [loaded, getPracticesBySystem, getSystemProgress]);

  const handleCardPress = useCallback(
    (system: SystemDef) => {
      logger.info('[hub]', `Navigate to ${system.id}`);
      router.push(system.tabRoute as any);
    },
    [router],
  );

  const handleSettingsPress = useCallback(() => {
    router.push('/settings');
  }, [router]);

  const handleMomentPress = useCallback(() => {
    router.push('/moment');
  }, [router]);

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
            <Text style={styles.greetingText} numberOfLines={1}>
              {greeting}
            </Text>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={handleSettingsPress}
              accessibilityLabel="Настройки"
              accessibilityRole="button"
            >
              <Ionicons name="settings-outline" size={22} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitleText}>Выберите систему для практики</Text>

          {/* Global stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalPractices}</Text>
              <Text style={styles.statLabel}>практик</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalUnlocked}</Text>
              <Text style={styles.statLabel}>открыто</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalMin}</Text>
              <Text style={styles.statLabel}>мин. практики</Text>
            </View>
          </View>

          {/* System Cards */}
          <View style={styles.cardsContainer}>
            {SYSTEMS.map((system) => {
              const practices = loaded ? getPracticesBySystem(system.id) : [];
              const sysProgress = loaded
                ? getSystemProgress(system.id)
                : {
                    totalPractices: 0,
                    unlockedPractices: 0,
                    currentMaxLevel: 0,
                    totalSessionMin: 0,
                    streakDays: 0,
                    lastSessionDate: null,
                  };

              const practiceCount = practices.length;
              const progress =
                sysProgress.totalPractices > 0
                  ? sysProgress.unlockedPractices / sysProgress.totalPractices
                  : 0;

              return (
                <HubCard
                  key={system.id}
                  systemId={system.id}
                  name={system.name}
                  tagline={system.tagline}
                  icon={system.icon}
                  color={system.color}
                  practiceCount={practiceCount}
                  progress={progress}
                  onPress={() => handleCardPress(system)}
                />
              );
            })}
          </View>
        </ScrollView>

        {/* Floating Action Button — Moment of Power */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.accent.primary }]}
          onPress={handleMomentPress}
          accessibilityLabel="Момент силы"
          accessibilityRole="button"
        >
          <Ionicons name="flash-outline" size={26} color={colors.text.primary} />
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}
