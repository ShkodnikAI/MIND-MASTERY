/**
 * @file Settings — Accessibility screen.
 *
 * Haptics toggle and text size info.
 * Wired to settingsStore.hapticsEnabled.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettingsStore } from '@/store/settingsStore';
import { SettingsToggle } from '@/ui/components/SettingsToggle';
import { colors, typography, spacing, radii } from '@/ui/theme';

// ─── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  gradient: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  titleText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xl,
    lineHeight: typography.lineHeights.xl,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  descriptionText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.secondary,
  },
  infoValue: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
  },
});

// ─── Component ───────────────────────────────────────────────────

export default function AccessibilitySettingsScreen() {
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const setHapticsEnabled = useSettingsStore((s) => s.setHapticsEnabled);

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.titleText}>Доступность</Text>
          <Text style={styles.descriptionText}>
            Настройки для комфортного использования приложения.
          </Text>

          <Text style={styles.sectionTitle}>Взаимодействие</Text>
          <SettingsToggle
            label="Вибрация"
            description="Тактильная обратная связь при нажатиях и событиях"
            value={hapticsEnabled}
            onValueChange={setHapticsEnabled}
          />

          <Text style={styles.sectionTitle}>Текущие настройки</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Шрифт</Text>
              <Text style={styles.infoValue}>Inter</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Тема</Text>
              <Text style={styles.infoValue}>Тёмная</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Язык</Text>
              <Text style={styles.infoValue}>Русский</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>VoiceOver / TalkBack</Text>
              <Text style={styles.infoValue}>Поддерживается</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
