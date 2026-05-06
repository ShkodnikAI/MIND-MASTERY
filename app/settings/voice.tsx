/**
 * @file Settings -- Voice screen.
 *
 * System TTS (expo-speech) with advanced settings:
 * - Speed, pitch and volume sliders
 * - Voice test with selected voice
 * - Offline mode: browse and preview preloaded practice narration texts
 *
 * Wired to settingsStore.voice.
 *
 * INV-A3: All styles via StyleSheet.create.
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
import * as Speech from 'expo-speech';
import { useSettingsStore } from '@/store/settingsStore';
import { useContentStore } from '@/store/contentStore';
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
    title: 'Предзагруженные тексты',
    description: 'Просмотр и прослушивание текстов озвучки для каждой практики.',
    icon: 'download-outline',
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

  // ── Offline text browser ──
  systemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  systemName: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.accent.primary,
  },
  textItemCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.background.elevated,
  },
  textItemTitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  textItemPreview: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs + 2,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
  },
  textItemMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  textSegmentCount: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.text.tertiary,
  },
  listenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
  },
  listenButtonText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.accent.primary,
  },
  listenButtonActive: {
    backgroundColor: colors.accent.primary,
  },
  listenButtonActiveText: {
    color: colors.text.inverse,
  },
  segmentsScrollView: {
    paddingLeft: spacing.md,
    maxHeight: 400,
    flexGrow: 0,
    flexShrink: 0,
  },
  loadingText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});

// ─── Component ───────────────────────────────────────────────────

export default function VoiceSettingsScreen() {
  const voice = useSettingsStore((s) => s.voice);
  const updateVoice = useSettingsStore((s) => s.updateVoice);
  const audio = useSettingsStore((s) => s.audio);
  const updateAudio = useSettingsStore((s) => s.updateAudio);
  const [testingVoice, setTestingVoice] = useState(false);
  const [listeningTextKey, setListeningTextKey] = useState<string | null>(null);
  const [offlineExpanded, setOfflineExpanded] = useState<string | null>(null);

  const systems = useContentStore((s) => s.systems);
  const allTexts = useContentStore((s) => s.getAllTexts());
  const loaded = useContentStore((s) => s.loaded);

  const handleSpeed = useCallback((v: number) => updateVoice({ speed: v }), [updateVoice]);
  const handlePitch = useCallback((v: number) => updateVoice({ pitch: v }), [updateVoice]);
  const handleVoiceVolume = useCallback(
    (v: number) => updateAudio({ voiceVolume: v }),
    [updateAudio],
  );

  const handleModeChange = useCallback(
    (mode: VoiceMode) => {
      updateVoice({ mode });
    },
    [updateVoice],
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

  // Listen to a practice text segment
  const handleListenToText = useCallback(
    (text: string, textKey: string) => {
      if (listeningTextKey === textKey) {
        Speech.stop();
        setListeningTextKey(null);
        return;
      }

      Speech.stop();
      setListeningTextKey(textKey);
      Speech.speak(text, {
        language: voice.language,
        rate: voice.speed,
        pitch: voice.pitch,
        ...(voice.voiceId ? { voiceId: voice.voiceId } : {}),
        onDone: () => setListeningTextKey(null),
        onError: () => setListeningTextKey(null),
      });
    },
    [listeningTextKey, voice.language, voice.speed, voice.pitch, voice.voiceId],
  );

  // Stop all speech on unmount
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  // Build offline text browser data
  const offlineTexts = React.useMemo(() => {
    if (!loaded) return [];
    const entries: { practiceId: string; title: string; systemId: string; systemName: string; segmentCount: number; firstSegment: string; firstKey: string }[] = [];
    for (const [practiceId, textData] of Object.entries(allTexts)) {
      const segments = textData.segments;
      const keys = Object.keys(segments);
      if (keys.length === 0) continue;
      const firstKey = keys[0];
      const firstText = typeof segments[firstKey] === 'string' ? segments[firstKey] : '';
      const sysId = textData.systemId || practiceId.split('_')[0];
      const sysName = systems[sysId]?.name || sysId;
      entries.push({
        practiceId,
        title: textData.title || practiceId,
        systemId: sysId,
        systemName: sysName,
        segmentCount: keys.length,
        firstSegment: firstText.substring(0, 120) + (firstText.length > 120 ? '...' : ''),
        firstKey,
      });
    }
    return entries;
  }, [loaded, allTexts, systems]);

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

          {/* ── System TTS Settings (only in system mode) ── */}
          {voice.mode === 'system' && (
            <>
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
              <SettingsSlider
                label="Громкость голоса"
                value={audio.voiceVolume}
                minimumValue={0}
                maximumValue={1}
                step={0.05}
                displayValue={`${Math.round(audio.voiceVolume * 100)}%`}
                onValueChange={handleVoiceVolume}
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

              {/* ── Info ── */}
              <View style={styles.infoCard}>
                <Text style={styles.infoCardText}>
                  Озвучка работает через системный TTS вашего устройства. Во время сессии вы можете включать и выключать голос кнопкой в плеере. Качество зависит от установленного голосового движка Android. Для лучшего результата установите качественный русский голос в настройках устройства (Настройки → Язык и ввод → Текст в речь).
                </Text>
              </View>
            </>
          )}

          {/* ── Offline Mode: Preloaded Text Browser ── */}
          {voice.mode === 'prerecorded' && (
            <>
              <View style={styles.infoCard}>
                <Text style={styles.infoCardText}>
                  Здесь вы можете просмотреть и прослушать тексты озвучки для всех практик. Нажмите на практику, чтобы раскрыть список сегментов, затем на кнопку воспроизведения рядом с сегментом.
                </Text>
              </View>

              {!loaded ? (
                <Text style={styles.loadingText}>Загрузка текстов...</Text>
              ) : (
                offlineTexts.map((item) => {
                  const isExpanded = offlineExpanded === item.practiceId;

                  return (
                    <View key={item.practiceId}>
                      <TouchableOpacity
                        style={styles.textItemCard}
                        onPress={() => setOfflineExpanded(isExpanded ? null : item.practiceId)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.textItemTitle}>{item.title}</Text>
                        <Text style={styles.textItemMeta}>
                          <Text style={styles.textSegmentCount}>{item.systemName} — {item.segmentCount} сегментов</Text>
                        </Text>
                        <Ionicons
                          name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
                          size={16}
                          color={colors.text.tertiary}
                          style={{ alignSelf: 'flex-end', marginTop: spacing.xs }}
                        />
                      </TouchableOpacity>

                      {isExpanded && (
                        <ScrollView
                          style={styles.segmentsScrollView}
                          showsVerticalScrollIndicator={true}
                        >
                          {Object.entries(allTexts[item.practiceId]?.segments ?? {}).map(([key, val]) => {
                            const text = typeof val === 'string' ? val : '';
                            return (
                              <View key={key} style={[styles.textItemCard, key === item.firstKey && { borderLeftColor: colors.accent.primary }]}>
                                <Text style={styles.textItemPreview}>{text}</Text>
                                <View style={styles.textItemMeta}>
                                  <TouchableOpacity
                                    style={[
                                      styles.listenButton,
                                      listeningTextKey === key && styles.listenButtonActive,
                                    ]}
                                    onPress={() => handleListenToText(text, key)}
                                    activeOpacity={0.7}
                                  >
                                    <Ionicons
                                      name={listeningTextKey === key ? 'pause' : 'play'}
                                      size={12}
                                      color={listeningTextKey === key ? colors.text.inverse : colors.accent.primary}
                                    />
                                    <Text
                                      style={[
                                        styles.listenButtonText,
                                        listeningTextKey === key && styles.listenButtonActiveText,
                                      ]}
                                    >
                                      {listeningTextKey === key ? 'Стоп' : 'Слушать'}
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            );
                          })}
                        </ScrollView>
                      )}
                    </View>
                  );
                })
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
