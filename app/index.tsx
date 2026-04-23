/**
 * @file Hub Screen — Main entry point of MIND MASTERY.
 *
 * Shows a time-of-day greeting, 5 system cards, a floating action button
 * for Moment of Power, and a settings gear icon.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { HubCard } from '@/ui/components/HubCard';
import { colors, typography, spacing, radii } from '@/ui/theme';
import { logger } from '@/utils/logger';

// ─── System definitions ─────────────────────────────────────────

interface SystemDef {
  readonly id: string;
  readonly name: string;
  readonly tagline: string;
  readonly icon: string;
  readonly color: string;
  readonly practiceCount: number;
  readonly tabRoute: string;
}

const SYSTEMS: readonly SystemDef[] = [
  {
    id: 'transurfing',
    name: 'Трансерфинг',
    tagline: 'Управление реальностью через намерение',
    icon: 'sparkles-outline',
    color: colors.transurfing,
    practiceCount: 0,
    tabRoute: '/(tabs)/transurfing',
  },
  {
    id: 'silva',
    name: 'Сильва',
    tagline: 'Альфа-состояние и интуиция',
    icon: 'leaf-outline',
    color: colors.silva,
    practiceCount: 0,
    tabRoute: '/(tabs)/silva',
  },
  {
    id: 'dispenza',
    name: 'Диспенза',
    tagline: 'Исцеление через медитацию',
    icon: 'sunny-outline',
    color: colors.dispenza,
    practiceCount: 0,
    tabRoute: '/(tabs)/dispenza',
  },
  {
    id: 'feldenkrais',
    name: 'Фельденкрайз',
    tagline: 'Осознание через движение',
    icon: 'body-outline',
    color: colors.feldenkrais,
    practiceCount: 0,
    tabRoute: '/(tabs)/feldenkrais',
  },
  {
    id: 'breath',
    name: 'Дыхание',
    tagline: 'Дыхательные практики',
    icon: 'fitness-outline',
    color: colors.breath,
    practiceCount: 0,
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
  fabLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

// ─── Component ──────────────────────────────────────────────────

export default function HubScreen() {
  const router = useRouter();

  const greeting = useMemo(() => getGreeting(), []);

  // Navigate to system tab
  const handleCardPress = useCallback(
    (system: SystemDef) => {
      logger.info('[hub]', `Navigate to ${system.id}`);
      router.push(system.tabRoute as any);
    },
    [router],
  );

  // Navigate to settings
  const handleSettingsPress = useCallback(() => {
    router.push('/settings');
  }, [router]);

  // Navigate to Moment of Power
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

          <Text style={styles.subtitleText}>
            Выберите систему для практики
          </Text>

          {/* System Cards */}
          <View style={styles.cardsContainer}>
            {SYSTEMS.map((system) => (
              <HubCard
                key={system.id}
                systemId={system.id}
                name={system.name}
                tagline={system.tagline}
                icon={system.icon}
                color={system.color}
                practiceCount={system.practiceCount}
                progress={0}
                onPress={() => handleCardPress(system)}
              />
            ))}
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
