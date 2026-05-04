/**
 * @file Settings -- Voice screen.
 *
 * System TTS (expo-speech) only — speed and pitch sliders, voice test.
 * Wired to settingsStore.voice.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useSettingsStore } from '@/store/settingsStore';
import { SettingsSlider } from '@/ui/components/SettingsSlider';
import { colors, typography, spacing, radii } from '@/ui/theme';

/** Sample Russian sentence for voice testing. */
const TEST_SENTENCE = 'Привет! Это тест голоса. Настройки работают корректно.';

// ─── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
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

  // ── Info card ──
  infoCard: {
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    borderRadius: radii.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.primary,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  infoCardText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm + 2,
    color: colors.text.secondary,
  },

  // ── Test button ──
  testSection: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  testButtonActive: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  testButtonText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
  },
  testButtonActiveText: {
    color: colors.text.inverse,
  },
});

// ─── Component ───────────────────────────────────────────────────

export default function VoiceSettingsScreen() {
  const voice = useSettingsStore((s) => s.voice);
  const updateVoice = useSettingsStore((s) => s.updateVoice);
  const [testingVoice, setTestingVoice] = useState(false);

  const handleSpeed = useCallback((v: number) => updateVoice({ speed: v }), [updateVoice]);
  const handlePitch = useCallback((v: number) => updateVoice({ pitch: v }), [updateVoice]);

  const handleTestVoice = useCallback(async () => {
    if (testingVoice) return;

    setTestingVoice(true);

    try {
      Speech.speak(TEST_SENTENCE, {
        language: 'ru-RU',
        rate: voice.speed,
        pitch: voice.pitch,
        onDone: () => setTestingVoice(false),
        onError: () => {
          setTestingVoice(false);
          Alert.alert('Ошибка', 'Не удалось воспроизвести тест голоса');
        },
      });
    } catch (err) {
      setTestingVoice(false);
      Alert.alert(
        'Ошибка теста',
        err instanceof Error ? err.message : 'Не удалось воспроизвести тест',
      );
    }
  }, [testingVoice, voice.speed, voice.pitch]);

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.titleText}>Голос</Text>
          <Text style={styles.descriptionText}>
            Настройка голосового сопровождения для медитаций. Используется встроенный синтезатор речи устройства.
          </Text>

          {/* ── Info ── */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardText}>
              Озвучка работает через системный TTS вашего устройства. Во время сессии вы можете включать и выключать голос кнопкой в плеере. Качество зависит от установленного голосового движка Android.
            </Text>
          </View>

          {/* ── Speech Parameters ── */}
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
          <SettingsSlider
            label="Высота"
            value={voice.pitch}
            minimumValue={0.5}
            maximumValue={2.0}
            step={0.1}
            displayValue={`${voice.pitch.toFixed(1)}x`}
            onValueChange={handlePitch}
          />

          {/* ── Test Voice ── */}
          <View style={styles.testSection}>
            <TouchableOpacity
              style={[styles.testButton, testingVoice && styles.testButtonActive]}
              onPress={handleTestVoice}
              activeOpacity={0.7}
              disabled={testingVoice}
            >
              {testingVoice ? (
                <ActivityIndicator size="small" color={colors.text.primary} />
              ) : (
                <Ionicons name="volume-medium-outline" size={20} color={colors.text.secondary} />
              )}
              <Text
                style={[
                  styles.testButtonText,
                  testingVoice && styles.testButtonActiveText,
                ]}
              >
                {testingVoice ? 'Воспроизведение...' : 'Тест голоса'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
