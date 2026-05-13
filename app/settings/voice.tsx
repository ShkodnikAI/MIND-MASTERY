/**
 * @file Settings -- Voice screen.
 *
 * Two voice modes:
 * 1. System TTS (expo-speech) — built-in device speech synthesis
 * 2. Edge TTS (prerecorded) — pre-recorded Russian MP3 files (591 segments, 75 practices)
 *
 * Wired to settingsStore.voice.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';
import { useSettingsStore } from '@/store/settingsStore';
import { SettingsSlider } from '@/ui/components/SettingsSlider';
import { colors, typography, spacing, radii } from '@/ui/theme';
import type { VoiceMode } from '@/types';

/** Sample Russian sentence for voice testing. */
const TEST_SENTENCE = 'Привет! Это тест голоса. Настройки работают корректно.';

// ─── Voice mode options ─────────────────────────────────────────

interface VoiceModeOption {
  readonly id: VoiceMode;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
}

const VOICE_MODES: readonly VoiceModeOption[] = [
  {
    id: 'system',
    title: 'Системный TTS',
    description: 'Встроенный синтезатор речи устройства. Работает без интернета.',
    icon: 'phone-portrait-outline',
  },
  {
    id: 'prerecorded',
    title: 'Записанный голос',
    description: 'Профессиональная озвучка на русском языке. 75 практик, 591 сегмент.',
    icon: 'mic-outline',
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

  // ── Mode selector ──
  modeGrid: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
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
  modeTitle: {
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

  // ── Stats card ──
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(108, 92, 231, 0.08)',
    borderRadius: radii.sm,
    padding: spacing.sm,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.lg,
    lineHeight: typography.lineHeights.lg,
    color: colors.accent.primary,
  },
  statLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.text.tertiary,
    marginTop: 2,
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
  const audio = useSettingsStore((s) => s.audio);
  const updateAudio = useSettingsStore((s) => s.updateAudio);
  const [testingVoice, setTestingVoice] = useState(false);
  const [testingEdge, setTestingEdge] = useState(false);

  // Edge TTS test player — plays a sample prerecorded MP3
  const edgePlayer = useAudioPlayer(
    require('../../assets/audio/voice/breath_478/breath_478_preparation.mp3'),
  );

  const handleSpeed = useCallback((v: number) => updateVoice({ speed: v }), [updateVoice]);
  const handlePitch = useCallback((v: number) => updateVoice({ pitch: v }), [updateVoice]);
  const handleVoiceVolume = useCallback(
    (v: number) => updateAudio({ voiceVolume: v }),
    [updateAudio],
  );

  const handleModeChange = useCallback(
    (mode: VoiceMode) => {
      // Stop any playing audio when switching modes
      Speech.stop();
      try { edgePlayer.pause(); } catch { /* noop */ }
      setTestingVoice(false);
      setTestingEdge(false);
      updateVoice({ mode });
    },
    [updateVoice, edgePlayer],
  );

  const handleTestVoice = useCallback(async () => {
    if (testingVoice) return;
    setTestingVoice(true);

    try {
      const speakOptions: Speech.SpeechOptions = {
        language: voice.language,
        rate: voice.speed,
        pitch: voice.pitch,
        onDone: () => setTestingVoice(false),
        onError: () => {
          setTestingVoice(false);
          Alert.alert('Ошибка', 'Не удалось воспроизвести тест голоса');
        },
      };

      if (voice.voiceId) {
        speakOptions.voiceId = voice.voiceId;
      }

      Speech.speak(TEST_SENTENCE, speakOptions);
    } catch (err) {
      setTestingVoice(false);
      Alert.alert(
        'Ошибка теста',
        err instanceof Error ? err.message : 'Не удалось воспроизвести тест',
      );
    }
  }, [testingVoice, voice.language, voice.speed, voice.pitch, voice.voiceId]);

  // Test Edge TTS: play/pause prerecorded sample
  const handleTestEdge = useCallback(() => {
    if (testingEdge) {
      try { edgePlayer.pause(); } catch { /* noop */ }
      setTestingEdge(false);
      return;
    }
    edgePlayer.volume = audio.voiceVolume;
    try { edgePlayer.seekTo(0); } catch { /* seekTo may not be available */ }
    edgePlayer.play();
    setTestingEdge(true);
    // Auto-reset when playback finishes
    const checkDone = setInterval(() => {
      if (!edgePlayer.playing) {
        clearInterval(checkDone);
        setTestingEdge(false);
      }
    }, 500);
  }, [testingEdge, edgePlayer, audio.voiceVolume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Speech.stop();
      try { edgePlayer.pause(); } catch { /* noop */ }
    };
  }, [edgePlayer]);

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
            Настройка голосового сопровождения для медитаций. Выберите режим озвучки и параметры речи.
          </Text>

          {/* ── Voice Mode Selector ── */}
          <Text style={styles.sectionTitle}>Режим озвучки</Text>
          <View style={styles.modeGrid}>
            {VOICE_MODES.map((mode) => {
              const isActive = voice.mode === mode.id;

              return (
                <TouchableOpacity
                  key={mode.id}
                  style={[
                    styles.modeCard,
                    isActive && styles.modeCardActive,
                  ]}
                  onPress={() => handleModeChange(mode.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.modeIcon}>
                    <Ionicons name={mode.icon as any} size={20} color={isActive ? colors.accent.primary : colors.text.secondary} />
                  </View>
                  <View style={styles.modeInfo}>
                    <Text style={[styles.modeTitle, isActive && { color: colors.accent.primary }]}>
                      {mode.title}
                    </Text>
                    <Text style={styles.modeDescription}>{mode.description}</Text>
                  </View>
                  {isActive && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.accent.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── System TTS Settings ── */}
          {voice.mode === 'system' && (
            <>
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
              <SettingsSlider
                label="Громкость голоса"
                value={audio.voiceVolume}
                minimumValue={0}
                maximumValue={1}
                step={0.05}
                displayValue={`${Math.round(audio.voiceVolume * 100)}%`}
                onValueChange={handleVoiceVolume}
              />

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

              <View style={styles.infoCard}>
                <Text style={styles.infoCardText}>
                  Озвучка работает через системный TTS вашего устройства. Во время сессии вы можете включать и выключать голос кнопкой в плеере. Качество зависит от установленного голосового движка Android. Для лучшего результата установите качественный русский голос в настройках устройства (Настройки — Язык и ввод — Текст в речь).
                </Text>
              </View>
            </>
          )}

          {/* ── Prerecorded Voice Mode ── */}
          {voice.mode === 'prerecorded' && (
            <>
              <Text style={styles.sectionTitle}>Записанный голос</Text>
              <View style={styles.infoCard}>
                <Text style={styles.infoCardText}>
                  Профессиональная озвучка всех практик нейросетевым голосом. Текст произносится непосредственно при запуске каждой сессии. Работает полностью офлайн — все аудиофайлы встроены в приложение.
                </Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>75</Text>
                  <Text style={styles.statLabel}>Практик</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>591</Text>
                  <Text style={styles.statLabel}>Сегментов</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>153</Text>
                  <Text style={styles.statLabel}>МБ</Text>
                </View>
              </View>

              <SettingsSlider
                label="Громкость голоса"
                value={audio.voiceVolume}
                minimumValue={0}
                maximumValue={1}
                step={0.05}
                displayValue={`${Math.round(audio.voiceVolume * 100)}%`}
                onValueChange={handleVoiceVolume}
              />

              <View style={styles.testSection}>
                <TouchableOpacity
                  style={[styles.testButton, testingEdge && styles.testButtonActive]}
                  onPress={handleTestEdge}
                  activeOpacity={0.7}
                >
                  {testingEdge ? (
                    <Ionicons name="pause-circle" size={20} color={colors.text.inverse} />
                  ) : (
                    <Ionicons name="play-circle" size={20} color={colors.text.secondary} />
                  )}
                  <Text
                    style={[
                      styles.testButtonText,
                      testingEdge && styles.testButtonActiveText,
                    ]}
                  >
                    {testingEdge ? 'Остановить' : 'Прослушать пример'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoCardText}>
                  Все тексты озвучены автоматически. Если вы заметили неправильные ударения или ошибки в произношении, вы можете переключиться на системный TTS.
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
