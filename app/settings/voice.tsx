/**
 * @file Settings — Voice screen.
 *
 * Voice mode picker (system / minimax / piper / prerecorded),
 * speed and pitch sliders, Minimax API configuration, voice test.
 * Wired to settingsStore.voice.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '@/store/settingsStore';
import { SettingsSlider } from '@/ui/components/SettingsSlider';
import { colors, typography, spacing, radii } from '@/ui/theme';
import type { VoiceMode } from '@/types';
import {
  validateApiKey,
  getVoices,
  cloneVoice,
  deleteClonedVoice,
  getTTSSettings,
  setApiKey,
  setSelectedVoice,
  synthesize,
  type VoiceInfo,
} from '@/services/tts/minimaxTTS';

// ─── Voice mode options ──────────────────────────────────────────

const VOICE_MODES: {
  readonly value: VoiceMode;
  readonly label: string;
  readonly icon: string;
  readonly description: string;
}[] = [
  {
    value: 'system',
    label: 'Системный TTS',
    icon: 'phone-portrait-outline',
    description: 'Голос движка устройства (офлайн)',
  },
  {
    value: 'minimax',
    label: 'Minimax AI',
    icon: 'cloud-outline',
    description: 'Облачный TTS высокого качества',
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

/** Sample Russian sentence for voice testing. */
const TEST_SENTENCE = 'Привет! Это тест голоса. Настройки работают корректно.';

/** API key validation status. */
type ApiStatus = 'idle' | 'testing' | 'valid' | 'invalid';

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

  // ── Mode cards ──
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
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: radii.xs,
  },
  statusDotIdle: {
    backgroundColor: colors.text.tertiary,
  },
  statusDotValid: {
    backgroundColor: colors.accent.success,
  },
  statusDotInvalid: {
    backgroundColor: colors.accent.error,
  },

  // ── Minimax API section ──
  apiSection: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  apiKeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  apiKeyInput: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.primary,
    backgroundColor: colors.background.elevated,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.select({ ios: 10, android: 8 }),
    borderWidth: 1,
    borderColor: colors.border,
  },
  eyeToggle: {
    padding: spacing.sm,
  },
  validateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.elevated,
    borderRadius: radii.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  validateButtonText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.primary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  statusText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
  },

  // ── Voice selector ──
  voiceList: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  voiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: radii.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: spacing.sm,
  },
  voiceItemActive: {
    borderColor: colors.accent.primary,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
  },
  voiceItemInfo: {
    flex: 1,
  },
  voiceItemName: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.primary,
  },
  voiceItemMeta: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.text.tertiary,
  },
  voiceItemDelete: {
    padding: spacing.xs,
  },

  // ── Clone section ──
  cloneSection: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  cloneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
    borderRadius: radii.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.accent.primary,
  },
  cloneButtonText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.accent.primary,
  },

  // ── Test section ──
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

  // ── Minimax state ──
  const [apiKey, setApiKeyState] = useState(() => getTTSSettings().apiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [voices, setVoices] = useState<VoiceInfo[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [testingVoice, setTestingVoice] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [deletingVoiceId, setDeletingVoiceId] = useState<string | null>(null);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneName, setCloneName] = useState('');
  const [cloneDesc, setCloneDesc] = useState('');

  const isMinimax = voice.mode === 'minimax';

  // ── Load voices when minimax mode is selected ──
  useEffect(() => {
    if (!isMinimax) return;

    let cancelled = false;

    async function fetchVoices() {
      setLoadingVoices(true);
      try {
        const list = await getVoices();
        if (!cancelled) setVoices(list);
      } catch {
        // silent — keep whatever was loaded before
      } finally {
        if (!cancelled) setLoadingVoices(false);
      }
    }

    fetchVoices();
    return () => { cancelled = true; };
  }, [isMinimax]);

  // ── Handlers ──
  const handleModeChange = useCallback(
    (mode: VoiceMode) => {
      updateVoice({ mode });
    },
    [updateVoice],
  );

  const handleSpeed = useCallback((v: number) => updateVoice({ speed: v }), [updateVoice]);
  const handlePitch = useCallback((v: number) => updateVoice({ pitch: v }), [updateVoice]);

  const handleValidateKey = useCallback(async () => {
    if (!apiKey.trim()) {
      setApiStatus('invalid');
      setStatusMessage('Введите API-ключ');
      return;
    }

    setApiStatus('testing');
    setStatusMessage('Проверка...');

    const result = await validateApiKey(apiKey);

    if (result.valid) {
      setApiStatus('valid');
      setApiKey(apiKey);
      setStatusMessage(result.error ?? 'Ключ действителен');
    } else {
      setApiStatus('invalid');
      setStatusMessage(result.error ?? 'Ключ недействителен');
    }
  }, [apiKey]);

  const handleSelectVoice = useCallback(
    (voiceId: string) => {
      setSelectedVoice(voiceId);
      // Trigger re-render for the selected state
      setVoices((prev) =>
        prev.map((v) =>
          v.voice_id === voiceId
            ? { ...v, _selected: true } as VoiceInfo & { _selected: boolean }
            : v,
        ),
      );
    },
    [],
  );

  const handleCloneVoice = useCallback(() => {
    setCloneName('');
    setCloneDesc('');
    setShowCloneModal(true);
  }, []);

  const handleConfirmClone = useCallback(async () => {
    if (!cloneName.trim()) return;
    setShowCloneModal(false);

    setCloning(true);
    try {
      await cloneVoice(cloneName, cloneDesc || `Клон голоса ${cloneName}`);
      // Refresh voice list
      const list = await getVoices();
      setVoices(list);
      Alert.alert('Готово', `Голос "${cloneName}" успешно клонирован.`);
    } catch (err) {
      Alert.alert(
        'Ошибка',
        err instanceof Error ? err.message : 'Не удалось клонировать голос',
      );
    } finally {
      setCloning(false);
    }
  }, [cloneName, cloneDesc]);

  const handleDeleteClonedVoice = useCallback(
    (voiceId: string, displayName: string) => {
      Alert.alert(
        'Удалить голос',
        `Удалить клонированный голос "${displayName}"?`,
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Удалить',
            style: 'destructive',
            onPress: async () => {
              setDeletingVoiceId(voiceId);
              try {
                await deleteClonedVoice(voiceId);
                setVoices((prev) => prev.filter((v) => v.voice_id !== voiceId));
              } catch (err) {
                Alert.alert(
                  'Ошибка',
                  err instanceof Error ? err.message : 'Не удалось удалить голос',
                );
              } finally {
                setDeletingVoiceId(null);
              }
            },
          },
        ],
      );
    },
    [],
  );

  const handleTestVoice = useCallback(async () => {
    if (testingVoice) return;

    setTestingVoice(true);

    try {
      if (isMinimax) {
        // Minimax: synthesize and play via expo-audio
        const base64Audio = await synthesize(TEST_SENTENCE, {
          speed: voice.speed,
          pitch: voice.pitch,
        });

        // Write to temp file and play
        const FS = await import('expo-file-system');
        const tempUri = FS.cacheDirectory + `voice_test_${Date.now()}.mp3`;

        await FS.writeAsStringAsync(tempUri, base64Audio, {
          encoding: FS.EncodingType.Base64,
        });

        try {
          const AudioModule = await import('expo-audio');
          const { sound } = await (AudioModule as any).Audio.Sound.createAsync({ uri: tempUri });
          await sound.playAsync();

          sound.setOnPlaybackStatusUpdate((status: any) => {
            if (status.isLoaded && status.didJustFinish) {
              sound.unloadAsync();
              FS.deleteAsync(tempUri, { idempotent: true });
            }
          });
        } catch {
          Alert.alert('Ошибка', 'Не удалось воспроизвести аудио');
        }
      } else {
        // System TTS fallback
        const SpeechModule = await import('expo-speech');
        SpeechModule.speak(TEST_SENTENCE, {
          language: 'ru-RU',
          rate: voice.speed,
          pitch: voice.pitch,
        });
      }
    } catch (err) {
      Alert.alert(
        'Ошибка теста',
        err instanceof Error ? err.message : 'Не удалось воспроизвести тест',
      );
    } finally {
      setTestingVoice(false);
    }
  }, [testingVoice, isMinimax, voice.speed, voice.pitch]);

  // ── Render ──
  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.titleText}>Голос</Text>
          <Text style={styles.descriptionText}>
            Выберите режим озвучки и настройте скорость и высоту речи.
          </Text>

          {/* ── Voice mode ── */}
          <Text style={styles.sectionTitle}>Режим озвучки</Text>

          {VOICE_MODES.map((m) => {
            const isActive = voice.mode === m.value;
            const isComingSoon = m.value === 'piper' || m.value === 'prerecorded';
            const isMinimaxMode = m.value === 'minimax';

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
                {/* Minimax API status dot */}
                {isMinimaxMode && (
                  <View
                    style={[
                      styles.statusDot,
                      apiStatus === 'valid' && styles.statusDotValid,
                      apiStatus === 'invalid' && styles.statusDotInvalid,
                      (apiStatus === 'idle' || apiStatus === 'testing') && styles.statusDotIdle,
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}

          {/* ── Minimax API Section ── */}
          {isMinimax && (
            <View style={styles.apiSection}>
              <Text style={styles.sectionTitle}>Настройка API Minimax</Text>

              {/* API Key input */}
              <View style={styles.apiKeyRow}>
                <TextInput
                  style={styles.apiKeyInput}
                  value={apiKey}
                  onChangeText={setApiKeyState}
                  placeholder="Введите API-ключ"
                  placeholderTextColor={colors.text.tertiary}
                  secureTextEntry={!showApiKey}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType={Platform.OS === 'ios' ? 'default' : 'visible-password'}
                />
                <TouchableOpacity
                  style={styles.eyeToggle}
                  onPress={() => setShowApiKey((prev) => !prev)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showApiKey ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Validate button */}
              <TouchableOpacity
                style={styles.validateButton}
                onPress={handleValidateKey}
                activeOpacity={0.7}
                disabled={apiStatus === 'testing'}
              >
                {apiStatus === 'testing' ? (
                  <ActivityIndicator size="small" color={colors.accent.primary} />
                ) : (
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={16}
                    color={colors.text.secondary}
                  />
                )}
                <Text style={styles.validateButtonText}>Проверить</Text>
              </TouchableOpacity>

              {/* Status indicator */}
              {apiStatus !== 'idle' && (
                <View style={styles.statusRow}>
                  <Ionicons
                    name={
                      apiStatus === 'valid'
                        ? 'checkmark-circle'
                        : apiStatus === 'invalid'
                          ? 'close-circle'
                          : 'sync-circle'
                    }
                    size={16}
                    color={
                      apiStatus === 'valid'
                        ? colors.accent.success
                        : apiStatus === 'invalid'
                          ? colors.accent.error
                          : colors.text.tertiary
                    }
                  />
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          apiStatus === 'valid'
                            ? colors.accent.success
                            : apiStatus === 'invalid'
                              ? colors.accent.error
                              : colors.text.tertiary,
                      },
                    ]}
                  >
                    {statusMessage}
                  </Text>
                </View>
              )}

              {/* Voice selector */}
              <Text style={styles.sectionTitle}>Выбор голоса</Text>
              {loadingVoices ? (
                <View style={{ alignItems: 'center', padding: spacing.md }}>
                  <ActivityIndicator size="small" color={colors.accent.primary} />
                  <Text
                    style={[
                      styles.statusText,
                      { color: colors.text.tertiary, marginTop: spacing.sm },
                    ]}
                  >
                    Загрузка голосов...
                  </Text>
                </View>
              ) : (
                <View style={styles.voiceList}>
                  {voices.map((v) => {
                    const ttsSettings = getTTSSettings();
                    const isSelected = v.voice_id === ttsSettings.selectedVoice;

                    return (
                      <TouchableOpacity
                        key={v.voice_id}
                        style={[styles.voiceItem, isSelected && styles.voiceItemActive]}
                        onPress={() => handleSelectVoice(v.voice_id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.voiceItemInfo}>
                          <Text style={styles.voiceItemName}>{v.name}</Text>
                          <Text style={styles.voiceItemMeta}>
                            {v.gender === 'male' ? '♂' : v.gender === 'female' ? '♀' : '◆'}{' '}
                            {v.voice_id}
                            {v.is_cloned ? ' (клон)' : ''}
                          </Text>
                        </View>
                        {isSelected && (
                          <Ionicons name="checkmark" size={18} color={colors.accent.primary} />
                        )}
                        {v.is_cloned && (
                          <TouchableOpacity
                            style={styles.voiceItemDelete}
                            onPress={() => handleDeleteClonedVoice(v.voice_id, v.name)}
                            activeOpacity={0.7}
                            disabled={deletingVoiceId === v.voice_id}
                          >
                            {deletingVoiceId === v.voice_id ? (
                              <ActivityIndicator size="small" color={colors.accent.error} />
                            ) : (
                              <Ionicons
                                name="trash-outline"
                                size={16}
                                color={colors.accent.error}
                              />
                            )}
                          </TouchableOpacity>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Clone voice section */}
              <View style={styles.cloneSection}>
                <TouchableOpacity
                  style={styles.cloneButton}
                  onPress={handleCloneVoice}
                  activeOpacity={0.7}
                  disabled={cloning}
                >
                  {cloning ? (
                    <ActivityIndicator size="small" color={colors.accent.primary} />
                  ) : (
                    <Ionicons name="add-circle-outline" size={18} color={colors.accent.primary} />
                  )}
                  <Text style={styles.cloneButtonText}>Клонировать голос</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

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

        {/* ── Clone Voice Modal ── */}
        {showCloneModal ? (
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: spacing.xl,
            }}
          >
            <View
              style={{
                width: '100%',
                maxWidth: 340,
                backgroundColor: colors.background.secondary,
                borderRadius: radii.lg,
                padding: spacing.lg,
                gap: spacing.md,
              }}
            >
              <Text
                style={{
                  fontFamily: typography.fontFamily.semibold,
                  fontSize: typography.sizes.lg,
                  color: colors.text.primary,
                }}
              >
                Клонировать голос
              </Text>
              <Text
                style={{
                  fontFamily: typography.fontFamily.regular,
                  fontSize: typography.sizes.sm,
                  color: colors.text.secondary,
                }}
              >
                Введите название и описание для нового голоса.
              </Text>
              <TextInput
                style={styles.apiKeyInput}
                value={cloneName}
                onChangeText={setCloneName}
                placeholder="Название голоса"
                placeholderTextColor={colors.text.tertiary}
                autoCapitalize="words"
              />
              <TextInput
                style={[styles.apiKeyInput, { minHeight: 60, textAlignVertical: 'top' }]}
                value={cloneDesc}
                onChangeText={setCloneDesc}
                placeholder="Описание (необязательно)"
                placeholderTextColor={colors.text.tertiary}
                multiline
              />
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
                <TouchableOpacity
                  style={[
                    styles.validateButton,
                    { flex: 1, paddingVertical: spacing.md },
                  ]}
                  onPress={() => setShowCloneModal(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.validateButtonText}>Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.cloneButton,
                    { flex: 1, paddingVertical: spacing.md },
                  ]}
                  onPress={handleConfirmClone}
                  activeOpacity={0.7}
                  disabled={!cloneName.trim()}
                >
                  <Text style={styles.cloneButtonText}>Создать</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}
      </SafeAreaView>
    </LinearGradient>
  );
}
