/**
 * @file Settings — Audio screen.
 *
 * Controls for music, binaural, voice, and master volumes.
 * Error policy picker and background playback toggle.
 * Wired to settingsStore.audio.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettingsStore } from '@/store/settingsStore';
import { SettingsSlider } from '@/ui/components/SettingsSlider';
import { SettingsToggle } from '@/ui/components/SettingsToggle';
import { colors, typography, spacing, radii } from '@/ui/theme';
import type { AudioErrorPolicy } from '@/types';

// ─── Error policy options ────────────────────────────────────────

const ERROR_POLICIES: { readonly value: AudioErrorPolicy; readonly label: string }[] = [
  { value: 'skip', label: 'Пропустить' },
  { value: 'retry', label: 'Повторить' },
  { value: 'stop', label: 'Остановить' },
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
  pickerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  pickerOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pickerOptionActive: {
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    borderColor: colors.accent.primary,
  },
  pickerOptionText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.secondary,
  },
  pickerOptionTextActive: {
    color: colors.accent.primary,
  },
});

// ─── Component ───────────────────────────────────────────────────

export default function AudioSettingsScreen() {
  const audio = useSettingsStore((s) => s.audio);
  const updateAudio = useSettingsStore((s) => s.updateAudio);

  const handleMusicVolume = useCallback(
    (v: number) => updateAudio({ musicVolume: v }),
    [updateAudio],
  );

  const handleBinauralVolume = useCallback(
    (v: number) => updateAudio({ binauralVolume: v }),
    [updateAudio],
  );

  const handleVoiceVolume = useCallback(
    (v: number) => updateAudio({ voiceVolume: v }),
    [updateAudio],
  );

  const handleMasterVolume = useCallback(
    (v: number) => updateAudio({ masterVolume: v }),
    [updateAudio],
  );

  const handleBackground = useCallback(
    (v: boolean) => updateAudio({ backgroundPlayback: v }),
    [updateAudio],
  );

  const handleErrorPolicy = useCallback(
    (policy: AudioErrorPolicy) => updateAudio({ errorPolicy: policy }),
    [updateAudio],
  );

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.titleText}>Аудио</Text>
          <Text style={styles.descriptionText}>
            Настройте громкость для каждого слоя звука и политику обработки ошибок.
          </Text>

          {/* Master volume */}
          <Text style={styles.sectionTitle}>Общая громкость</Text>
          <SettingsSlider
            label="Мастер"
            value={audio.masterVolume}
            onValueChange={handleMasterVolume}
          />

          {/* Voice */}
          <Text style={styles.sectionTitle}>Голос</Text>
          <SettingsSlider
            label="Голосовой гид"
            value={audio.voiceVolume}
            onValueChange={handleVoiceVolume}
          />

          {/* Music */}
          <Text style={styles.sectionTitle}>Фоновая музыка</Text>
          <SettingsSlider
            label="Музыка"
            value={audio.musicVolume}
            onValueChange={handleMusicVolume}
          />

          {/* Binaural */}
          <Text style={styles.sectionTitle}>Бинауральные ритмы</Text>
          <SettingsSlider
            label="Бинауралы"
            value={audio.binauralVolume}
            onValueChange={handleBinauralVolume}
          />

          {/* Background playback */}
          <Text style={styles.sectionTitle}>Воспроизведение</Text>
          <SettingsToggle
            label="Фоновое воспроизведение"
            description="Аудио продолжает играть при сворачивании приложения"
            value={audio.backgroundPlayback}
            onValueChange={handleBackground}
          />

          {/* Error policy */}
          <Text style={styles.sectionTitle}>При ошибке воспроизведения</Text>
          <View style={styles.pickerRow}>
            {ERROR_POLICIES.map((p) => {
              const isActive = audio.errorPolicy === p.value;
              return (
                <TouchableOpacity
                  key={p.value}
                  style={[styles.pickerOption, isActive && styles.pickerOptionActive]}
                  onPress={() => handleErrorPolicy(p.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.pickerOptionText, isActive && styles.pickerOptionTextActive]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
