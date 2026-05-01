/**
 * @file Settings — Voice screen.
 *
 * Voice mode picker, speed and pitch sliders.
 * Wired to settingsStore.voice.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '@/store/settingsStore';
import { SettingsSlider } from '@/ui/components/SettingsSlider';
import { colors, typography, spacing, radii } from '@/ui/theme';
import type { VoiceMode } from '@/types';

// ─── Voice mode options ──────────────────────────────────────────

const VOICE_MODES: {
  readonly value: VoiceMode;
  readonly label: string;
  readonly icon: string;
  readonly description: string;
}[] = [
  {
    value: 'system',
    label: 'Системный',
    icon: 'phone-portrait-outline',
    description: 'Голос движка устройства',
  },
  {
    value: 'piper',
    label: 'Piper',
    icon: 'hardware-chip-outline',
    description: 'Офлайн TTS высокого качества',
  },
  {
    value: 'prerecorded',
    label: 'Записанный',
    icon: 'mic-outline',
    description: 'Профессиональный диктор',
  },
];

// ─── Styles ──────────────────────────────────────────────────────

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
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: spacing.md,
  },
  modeCardActive: {
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
    borderColor: colors.accent.primary,
  },
  modeIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeInfo: {
    flex: 1,
    gap: 2,
  },
  modeLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
  },
  modeDescription: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.text.tertiary,
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(253, 203, 110, 0.2)',
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  comingSoonText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.accent.warning,
  },
});

// ─── Component ───────────────────────────────────────────────────

export default function VoiceSettingsScreen() {
  const voice = useSettingsStore((s) => s.voice);
  const updateVoice = useSettingsStore((s) => s.updateVoice);

  const handleModeChange = useCallback((mode: VoiceMode) => updateVoice({ mode }), [updateVoice]);

  const handleSpeed = useCallback((v: number) => updateVoice({ speed: v }), [updateVoice]);

  const handlePitch = useCallback((v: number) => updateVoice({ pitch: v }), [updateVoice]);

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.titleText}>Голос</Text>
          <Text style={styles.descriptionText}>
            Выберите режим озвучки и настройте скорость и высоту речи.
          </Text>

          {/* Voice mode */}
          <Text style={styles.sectionTitle}>Режим озвучки</Text>
          {VOICE_MODES.map((m) => {
            const isActive = voice.mode === m.value;
            const isComingSoon = m.value === 'piper' || m.value === 'prerecorded';

            return (
              <TouchableOpacity
                key={m.value}
                style={[styles.modeCard, isActive && styles.modeCardActive]}
                onPress={() => handleModeChange(m.value)}
                activeOpacity={0.7}
                disabled={isComingSoon}
              >
                <View style={styles.modeIcon}>
                  <Ionicons
                    name={m.icon as any}
                    size={20}
                    color={isActive ? colors.accent.primary : colors.text.secondary}
                  />
                </View>
                <View style={styles.modeInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <Text style={[styles.modeLabel, isActive && { color: colors.accent.primary }]}>
                      {m.label}
                    </Text>
                    {isComingSoon && (
                      <View style={styles.comingSoonBadge}>
                        <Text style={styles.comingSoonText}>Скоро</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.modeDescription}>{m.description}</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Speed */}
          <Text style={styles.sectionTitle}>Параметры речи</Text>
          <SettingsSlider
            label="Скорость"
            value={voice.speed}
            minimumValue={0.5}
            maximumValue={2.0}
            step={0.1}
            displayValue={`${voice.speed.toFixed(1)}x`}
            onValueChange={handleSpeed}
          />

          {/* Pitch */}
          <SettingsSlider
            label="Высота"
            value={voice.pitch}
            minimumValue={0.5}
            maximumValue={2.0}
            step={0.1}
            displayValue={`${voice.pitch.toFixed(1)}x`}
            onValueChange={handlePitch}
          />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
