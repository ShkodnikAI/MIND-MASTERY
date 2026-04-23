/**
 * @file Settings — Light effects screen.
 *
 * Controls for light themes, effects, intensity, and night mode.
 * Wired to settingsStore.light and lightSettingsStore.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettingsStore } from '@/store/settingsStore';
import { SettingsSlider } from '@/ui/components/SettingsSlider';
import { SettingsToggle } from '@/ui/components/SettingsToggle';
import { colors, typography, spacing, radii } from '@/ui/theme';
import type { LightThemeId, LightEffect } from '@/types';

// ─── Options ─────────────────────────────────────────────────────

const THEME_OPTIONS: { readonly value: LightThemeId; readonly label: string }[] = [
  { value: 'cosmic', label: 'Космос' },
  { value: 'ocean', label: 'Океан' },
  { value: 'forest', label: 'Лес' },
  { value: 'sunset', label: 'Закат' },
  { value: 'golden', label: 'Золото' },
  { value: 'aurora', label: 'Аврора' },
  { value: 'crystal', label: 'Кристалл' },
];

const EFFECT_OPTIONS: { readonly value: LightEffect; readonly label: string }[] = [
  { value: 'glow', label: 'Свечение' },
  { value: 'pulse', label: 'Пульсация' },
  { value: 'breathe', label: 'Дыхание' },
  { value: 'entrainment', label: 'Энтейнмент' },
  { value: 'chakra-flow', label: 'Чакры' },
  { value: 'off', label: 'Выкл' },
];

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
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  optionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionChipActive: {
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    borderColor: colors.accent.primary,
  },
  optionText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.secondary,
  },
  optionTextActive: {
    color: colors.accent.primary,
  },
  nightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  nightInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  nightLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
  },
  nightHours: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
});

// ─── Component ───────────────────────────────────────────────────

export default function LightSettingsScreen() {
  const light = useSettingsStore((s) => s.light);
  const updateLight = useSettingsStore((s) => s.updateLight);

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.titleText}>Световые эффекты</Text>
          <Text style={styles.descriptionText}>
            Настройте тему, эффект и интенсивность световых эффектов для медитаций.
          </Text>

          <Text style={styles.sectionTitle}>Тема</Text>
          <View style={styles.optionsRow}>
            {THEME_OPTIONS.map((t) => {
              const isActive = light.theme === t.value;
              return (
                <TouchableOpacity
                  key={t.value}
                  style={[styles.optionChip, isActive && styles.optionChipActive]}
                  onPress={() => updateLight({ theme: t.value })}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Эффект</Text>
          <View style={styles.optionsRow}>
            {EFFECT_OPTIONS.map((e) => {
              const isActive = light.effect === e.value;
              return (
                <TouchableOpacity
                  key={e.value}
                  style={[styles.optionChip, isActive && styles.optionChipActive]}
                  onPress={() => updateLight({ effect: e.value })}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                    {e.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <SettingsSlider
            label="Интенсивность"
            value={light.intensity}
            onValueChange={(v) => updateLight({ intensity: v })}
          />

          <SettingsToggle
            label="Ночной режим"
            description={`Автоматически снижает интенсивность с ${light.nightStartHour}:00 до ${light.nightEndHour}:00`}
            value={light.autoNightMode}
            onValueChange={(v) => updateLight({ autoNightMode: v })}
          />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
