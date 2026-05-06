/**
 * @file Settings — Music screen.
 *
 * Background music selection for meditation sessions.
 * Built-in ambient track cards with play/pause preview,
 * custom music upload via document picker, and volume slider.
 * Wired to settingsStore.audio.musicVolume and settingsStore.audio.selectedMusicTrack.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import * as DocumentPicker from 'expo-document-picker';
import { useSettingsStore } from '@/store/settingsStore';
import { SettingsSlider } from '@/ui/components/SettingsSlider';
import { colors, typography, spacing, radii } from '@/ui/theme';

// ─── Built-in track definitions ──────────────────────────────────

interface MusicTrack {
  readonly id: string;
  readonly emoji: string;
  readonly name: string;
  readonly description: string;
}

const BUILTIN_TRACKS: readonly MusicTrack[] = [
  {
    id: 'space',
    emoji: '🫧',
    name: 'Пространство',
    description: 'Ambient, космическая атмосфера',
  },
  {
    id: 'ocean',
    emoji: '🌊',
    name: 'Океан',
    description: 'Звуки волн и воды',
  },
  {
    id: 'forest',
    emoji: '🌲',
    name: 'Лес',
    description: 'Природные звуки леса',
  },
  {
    id: 'meditation',
    emoji: '🎵',
    name: 'Медитация',
    description: 'Мягкие мелодии для медитации',
  },
  {
    id: 'fireplace',
    emoji: '🔥',
    name: 'Камин',
    description: 'Уютный звук камина',
  },
  {
    id: 'winter',
    emoji: '❄️',
    name: 'Зима',
    description: 'Зимняя атмосфера',
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
  trackCard: {
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
  trackCardActive: {
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
    borderColor: colors.accent.primary,
  },
  trackEmoji: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
  },
  trackInfo: {
    flex: 1,
    gap: 2,
  },
  trackNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  trackName: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
  },
  trackNameActive: {
    color: colors.accent.primary,
  },
  trackDescription: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.text.tertiary,
  },
  trackMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonActive: {
    backgroundColor: 'rgba(108, 92, 231, 0.3)',
  },
  customCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  customCardIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customCardInfo: {
    flex: 1,
    gap: 2,
  },
  customCardTitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
  },
  customCardDescription: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.text.tertiary,
  },
  customTrackItem: {
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
  customTrackItemActive: {
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
    borderColor: colors.accent.primary,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: 'rgba(225, 112, 85, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});

// ─── Component ───────────────────────────────────────────────────

export default function MusicSettingsScreen() {
  const audio = useSettingsStore((s) => s.audio);
  const updateAudio = useSettingsStore((s) => s.updateAudio);
  const previewPlayer = useAudioPlayer();
  const [previewTrackId, setPreviewTrackId] = useState<string | null>(null);

  // Stop preview on unmount
  useEffect(() => {
    return () => {
      try {
        previewPlayer.volume = 0;
        previewPlayer.pause();
      } catch { /* noop */ }
    };
  }, [previewPlayer]);

  const handleMusicVolume = useCallback(
    (v: number) => updateAudio({ musicVolume: v }),
    [updateAudio],
  );

  // Stop any current preview
  const stopPreview = useCallback(() => {
    try {
      previewPlayer.volume = 0;
      previewPlayer.pause();
    } catch { /* noop */ }
    setPreviewTrackId(null);
  }, [previewPlayer]);

  // Select a track (without preview)
  const handleTrackSelect = useCallback(
    (trackId: string) => {
      stopPreview();
      updateAudio({ selectedMusicTrack: trackId });
    },
    [stopPreview, updateAudio],
  );

  // Toggle preview of a specific track
  const handlePreviewToggle = useCallback(
    async (trackId: string) => {
      try {
        if (previewTrackId === trackId) {
          // Stop preview
          stopPreview();
          return;
        }

        // Stop previous
        stopPreview();

        // Resolve asset URI
        const { resolveMusicUri } = require('@/audio/assetResolver');
        const uri = resolveMusicUri(trackId);

        if (!uri) {
          return;
        }

        await new Promise<void>((r) => setTimeout(r, 50));

        previewPlayer.replace({ uri });
        previewPlayer.volume = Math.max(0.3, audio.musicVolume);
        previewPlayer.play();
        setPreviewTrackId(trackId);
      } catch {
        setPreviewTrackId(null);
      }
    },
    [previewTrackId, previewPlayer, audio.musicVolume, stopPreview],
  );

  // Preview a custom track by URI
  const handleCustomPreview = useCallback(
    async (trackId: string, uri: string) => {
      try {
        if (previewTrackId === trackId) {
          stopPreview();
          return;
        }

        stopPreview();
        await new Promise<void>((r) => setTimeout(r, 50));

        previewPlayer.replace({ uri });
        previewPlayer.volume = Math.max(0.3, audio.musicVolume);
        previewPlayer.play();
        setPreviewTrackId(trackId);
      } catch {
        setPreviewTrackId(null);
      }
    },
    [previewTrackId, previewPlayer, audio.musicVolume, stopPreview],
  );

  // Add custom music from file system
  const handleAddCustomMusic = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const asset = result.assets[0];
      const name = asset.name.replace(/\.[^.]+$/, '') || 'Моя музыка';
      const newTrack = {
        id: `custom_${Date.now()}`,
        name,
        uri: asset.uri,
      };

      const updatedTracks = [...(audio.customMusicTracks ?? []), newTrack];
      updateAudio({ customMusicTracks: updatedTracks });
    } catch (err) {
      Alert.alert(
        'Ошибка',
        err instanceof Error ? err.message : 'Не удалось добавить файл',
      );
    }
  }, [audio.customMusicTracks, updateAudio]);

  // Remove custom track
  const handleRemoveCustomTrack = useCallback(
    (trackId: string) => {
      if (audio.selectedMusicTrack === trackId) {
        updateAudio({ selectedMusicTrack: 'space' });
      }
      const updatedTracks = (audio.customMusicTracks ?? []).filter((t) => t.id !== trackId);
      updateAudio({ customMusicTracks: updatedTracks });
      if (previewTrackId === trackId) {
        stopPreview();
      }
    },
    [audio.selectedMusicTrack, audio.customMusicTracks, previewTrackId, updateAudio, stopPreview],
  );

  const customTracks = audio.customMusicTracks ?? [];

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.titleText}>Музыка</Text>
          <Text style={styles.descriptionText}>
            Выберите фоновую музыку для медитаций и практик. Нажмите на трек для выбора, на кнопку воспроизведения для прослушивания.
          </Text>

          {/* Built-in tracks */}
          <Text style={styles.sectionTitle}>Встроенные треки</Text>
          {BUILTIN_TRACKS.map((track) => {
            const isActive = audio.selectedMusicTrack === track.id;
            const isPreviewing = previewTrackId === track.id;

            return (
              <View key={track.id} style={[styles.trackCard, isActive && styles.trackCardActive]}>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing.md }}
                  onPress={() => handleTrackSelect(track.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.trackEmoji}>
                    <Text>{track.emoji}</Text>
                  </View>
                  <View style={styles.trackInfo}>
                    <View style={styles.trackNameRow}>
                      <Text style={[styles.trackName, isActive && styles.trackNameActive]}>
                        {track.name}
                      </Text>
                      {isActive && (
                        <Ionicons name="checkmark-circle" size={16} color={colors.accent.primary} />
                      )}
                    </View>
                    <Text style={styles.trackDescription} numberOfLines={1}>
                      {track.description}
                    </Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.trackMeta}>
                  <TouchableOpacity
                    style={[styles.playButton, isPreviewing && styles.playButtonActive]}
                    onPress={() => handlePreviewToggle(track.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isPreviewing ? 'pause' : 'play'}
                      size={16}
                      color={isPreviewing ? colors.accent.primary : colors.text.secondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {/* Custom music */}
          <Text style={styles.sectionTitle}>Своя музыка</Text>

          {/* Add button */}
          <TouchableOpacity
            style={styles.customCard}
            onPress={handleAddCustomMusic}
            activeOpacity={0.7}
          >
            <View style={styles.customCardIcon}>
              <Ionicons
                name="add-outline"
                size={20}
                color={colors.accent.primary}
              />
            </View>
            <View style={styles.customCardInfo}>
              <Text style={styles.customCardTitle}>Добавить свою музыку</Text>
              <Text style={styles.customCardDescription}>
                Выберите аудиофайл (MP3, WAV, OGG) из файловой системы
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          {/* Custom tracks list */}
          {customTracks.length === 0 ? (
            <Text style={styles.emptyText}>
              У вас пока нет добавленных треков
            </Text>
          ) : (
            customTracks.map((track) => {
              const isActive = audio.selectedMusicTrack === track.id;
              const isPreviewing = previewTrackId === track.id;

              return (
                <View
                  key={track.id}
                  style={[styles.customTrackItem, isActive && styles.customTrackItemActive]}
                >
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing.md }}
                    onPress={() => handleTrackSelect(track.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.trackEmoji}>
                      <Text>🎵</Text>
                    </View>
                    <View style={styles.trackInfo}>
                      <View style={styles.trackNameRow}>
                        <Text style={[styles.trackName, isActive && styles.trackNameActive]}>
                          {track.name}
                        </Text>
                        {isActive && (
                          <Ionicons name="checkmark-circle" size={16} color={colors.accent.primary} />
                        )}
                      </View>
                      <Text style={styles.trackDescription} numberOfLines={1}>
                        Пользовательский трек
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <View style={styles.trackMeta}>
                    <TouchableOpacity
                      style={[styles.playButton, isPreviewing && styles.playButtonActive]}
                      onPress={() => handleCustomPreview(track.id, track.uri)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={isPreviewing ? 'pause' : 'play'}
                        size={16}
                        color={isPreviewing ? colors.accent.primary : colors.text.secondary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleRemoveCustomTrack(track.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close" size={14} color={colors.accent.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}

          {/* Volume */}
          <Text style={styles.sectionTitle}>Громкость музыки</Text>
          <SettingsSlider
            label="Музыка"
            value={audio.musicVolume}
            onValueChange={handleMusicVolume}
          />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
