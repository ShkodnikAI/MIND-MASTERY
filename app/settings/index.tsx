/**
 * @file Settings — Main settings screen.
 *
 * Lists all settings sections with navigation to sub-screens.
 * INV-A3: All styles via StyleSheet.create.
 */

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, radii } from '@/ui/theme';
import { logger } from '@/utils/logger';
import { useSettingsStore } from '@/store/settingsStore';

// ─── Settings sections ──────────────────────────────────────────

interface SettingsSection {
  readonly id: string;
  readonly title: string;
  readonly icon: React.ComponentProps<typeof Ionicons>['name'];
  readonly route: string;
}

const SECTIONS: readonly SettingsSection[] = [
  {
    id: 'notifications',
    title: 'Уведомления',
    icon: 'notifications-outline',
    route: '/settings/notifications',
  },
  {
    id: 'audio',
    title: 'Аудио',
    icon: 'volume-high-outline',
    route: '/settings/audio',
  },
  {
    id: 'music',
    title: 'Музыка',
    icon: 'musical-notes-outline',
    route: '/settings/music',
  },
  {
    id: 'voice',
    title: 'Голос',
    icon: 'mic-outline',
    route: '/settings/voice',
  },
  {
    id: 'light',
    title: 'Свет',
    icon: 'sunny-outline',
    route: '/settings/light',
  },
  {
    id: 'stats',
    title: 'Статистика',
    icon: 'stats-chart-outline',
    route: '/stats',
  },
  {
    id: 'backup',
    title: 'Резервное копирование',
    icon: 'cloud-upload-outline',
    route: '/settings/backup',
  },
  {
    id: 'accessibility',
    title: 'Доступность',
    icon: 'accessibility-outline',
    route: '/settings/accessibility',
  },
  {
    id: 'about',
    title: 'О приложении',
    icon: 'information-circle-outline',
    route: '/settings/about',
  },
] as const;

// ─── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  headerText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xxl,
    lineHeight: typography.lineHeights.xxl,
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },
  listContainer: {
    gap: spacing.sm,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
    flex: 1,
  },
  chevron: {
    color: colors.text.tertiary,
  },
});

// ─── Component ──────────────────────────────────────────────────

function SettingsItem({
  section,
  onPress,
  hasAlarm,
}: {
  readonly section: SettingsSection;
  readonly onPress: () => void;
  readonly hasAlarm: boolean;
}) {

  return (
    <TouchableOpacity
      style={styles.sectionCard}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={section.title}
      accessibilityRole="button"
    >
      <View style={styles.sectionIcon}>
        <Ionicons name={section.icon} size={20} color={colors.accent.primary} />
      </View>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {/* Alarm indicator for notifications */}
      {section.id === 'notifications' && hasAlarm ? (
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent.success, marginRight: 4 }} />
      ) : null}
      <Ionicons name="chevron-forward" size={20} style={styles.chevron} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const notifications = useSettingsStore((s) => s.notifications);
  const hasActiveAlarm = notifications.dailyReminderEnabled || notifications.streakReminderEnabled;

  const handlePress = useCallback(
    (section: SettingsSection) => {
      logger.info('[settings]', `Navigate to ${section.id}`);
      router.push(section.route as any);
    },
    [router],
  );

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.content}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.background.tertiary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md }}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Настройки</Text>

          <FlatList
            data={SECTIONS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SettingsItem
                section={item}
                onPress={() => handlePress(item)}
                hasAlarm={item.id === 'notifications' && hasActiveAlarm}
              />
            )}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
