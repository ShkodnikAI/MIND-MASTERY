/**
 * @file Settings — Main settings screen.
 *
 * Lists all settings sections with navigation to sub-screens.
 * INV-A3: All styles via StyleSheet.create.
 */

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, radii } from '@/ui/theme';
import { logger } from '@/utils/logger';

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

function SettingsItem({ section }: { readonly section: SettingsSection }) {
  const router = useRouter();

  const handlePress = useCallback(() => {
    logger.info('[settings]', `Navigate to ${section.id}`);
    router.push(section.route as any);
  }, [router, section.id, section.route]);

  return (
    <TouchableOpacity
      style={styles.sectionCard}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityLabel={section.title}
      accessibilityRole="button"
    >
      <View style={styles.sectionIcon}>
        <Ionicons name={section.icon} size={20} color={colors.accent.primary} />
      </View>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Ionicons name="chevron-forward" size={20} style={styles.chevron} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.content}>
          <Text style={styles.headerText}>Настройки</Text>

          <FlatList
            data={SECTIONS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <SettingsItem section={item} />}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
