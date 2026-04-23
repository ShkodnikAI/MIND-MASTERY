/**
 * @file Moment of Power — Configuration screen.
 *
 * Allows the user to enable/disable Moment of Power, configure
 * the notification window, and sound settings.
 * Wired to momentStore.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import React, { useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useMomentStore } from '@/store/momentStore';
import { SettingsToggle } from '@/ui/components/SettingsToggle';
import { SettingsSlider } from '@/ui/components/SettingsSlider';
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
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
    marginBottom: spacing.xl,
  },
  statusCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.secondary,
    flex: 1,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  windowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  windowTime: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.lg,
    lineHeight: typography.lineHeights.lg,
    color: colors.accent.primary,
  },
  windowLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.tertiary,
  },
});

// ─── Component ───────────────────────────────────────────────────

export default function MomentScreen() {
  const settings = useMomentStore((s) => s.settings);
  const updateSettings = useMomentStore((s) => s.updateSettings);
  const setEnabled = useMomentStore((s) => s.setEnabled);

  const handleEnabled = useCallback((v: boolean) => setEnabled(v), [setEnabled]);

  const handleSound = useCallback(
    (v: boolean) => updateSettings({ soundEnabled: v }),
    [updateSettings],
  );

  const handleWindowStart = useCallback(
    (v: number) => {
      const startH = Math.round(v);
      updateSettings({ windowStartHour: startH });
    },
    [updateSettings],
  );

  const handleWindowEnd = useCallback(
    (v: number) => {
      const endH = Math.round(v);
      updateSettings({ windowEndHour: endH });
    },
    [updateSettings],
  );

  const formatHour = (h: number) => `${h.toString().padStart(2, '0')}:00`;

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="flash-outline" size={24} color={colors.accent.primary} />
            </View>
            <Text style={styles.titleText}>Момент Силы</Text>
          </View>

          <Text style={styles.descriptionText}>
            Ежедневный мотивационный будильник. Уведомление загорается в случайный момент в течение
            дня, возвращая вас в состояние осознанности.
          </Text>

          {/* Status */}
          <View style={styles.statusCard}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: settings.enabled ? colors.accent.success : colors.text.tertiary,
                },
              ]}
            />
            <Text style={styles.statusText}>
              {settings.enabled
                ? settings.isActiveToday
                  ? 'Сегодня уже сработал'
                  : 'Активен — ждём момент'
                : 'Отключён'}
            </Text>
          </View>

          {/* Enable toggle */}
          <SettingsToggle
            label="Момент Силы"
            description="Включить ежедневные осознанные напоминания"
            value={settings.enabled}
            onValueChange={handleEnabled}
          />

          {/* Window */}
          <Text style={styles.sectionTitle}>Время уведомлений</Text>
          <View style={styles.windowInfo}>
            <Ionicons name="sunny-outline" size={18} color={colors.accent.warning} />
            <Text style={styles.windowTime}>{formatHour(settings.windowStartHour)}</Text>
            <Text style={styles.windowLabel}>—</Text>
            <Ionicons name="moon-outline" size={18} color={colors.accent.info} />
            <Text style={styles.windowTime}>{formatHour(settings.windowEndHour)}</Text>
          </View>

          <SettingsSlider
            label="Начало окна"
            value={settings.windowStartHour}
            minimumValue={5}
            maximumValue={settings.windowEndHour - 1}
            step={1}
            displayValue={formatHour(settings.windowStartHour)}
            onValueChange={handleWindowStart}
          />

          <SettingsSlider
            label="Конец окна"
            value={settings.windowEndHour}
            minimumValue={settings.windowStartHour + 1}
            maximumValue={23}
            step={1}
            displayValue={formatHour(settings.windowEndHour)}
            onValueChange={handleWindowEnd}
          />

          {/* Sound */}
          <Text style={styles.sectionTitle}>Звук</Text>
          <SettingsToggle
            label="Звуковое уведомление"
            description="Проигрывать мелодию при срабатывании момента"
            value={settings.soundEnabled}
            onValueChange={handleSound}
          />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
