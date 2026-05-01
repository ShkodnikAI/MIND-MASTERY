/**
 * @file Settings — Music screen.
 *
 * Background music selection for meditation sessions.
 * Built-in ambient track cards with play/pause placeholder,
 * custom music section (coming soon), and volume slider.
 * Wired to settingsStore.audio.musicVolume.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '@/store/settingsStore';
import { SettingsSlider } from '@/ui/components/SettingsSlider';
import { colors, typography, spacing, radii } from '@/ui/theme';

// ─── Built-in track definitions ──────────────────────────────────

interface MusicTrack {
  readonly id: string;
  readonly emoji: string;
  readonly name: string;
  readonly description: string;
  readonly duration: string;
}

const BUILTIN_TRACKS: readonly MusicTrack[] = [
  {
    id: 'space',
    emoji: '🫧',
    name: 'Пространство',
    description: 'Ambient, космическая атмосфера',
    duration: '—',
  },
  {
    id: 'ocean',
    emoji: '🌊',
    name: 'Океан',
    description: 'Звуки волн и воды',
    duration: '—',
  },
  {
    id: 'forest',
    emoji: '🌲',
    name: 'Лес',
    description: 'Природные звуки леса',
    duration: '—',
  },
  {
    id: 'meditation',
    emoji: '🎵',
    name: 'Медитация',
    description: 'Мягкие мелодии для медитации',
    duration: '—',
  },
  {
    id: 'fireplace',
    emoji: '🔥',
    name: 'Камин',
    description: 'Уютный звук камина',
    duration: '—',
  },
  {
    id: 'winter',
    emoji: '❄️',
    name: 'Зима',
    description: 'Зимняя атмосфера',
    duration: '—',
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
  trackDuration: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.text.tertiary,
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
    opacity: 0.5,
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
    marginLeft: spacing.md,
    gap: 2,
  },
  customCardTitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.secondary,
  },
  customCardDescription: {
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
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyStateText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

// ─── Track Card Component ────────────────────────────────────────

function TrackCard({ track, isActive, onToggle }: {
  readonly track: MusicTrack;
  readonly isActive: boolean;
  readonly onToggle: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.trackCard, isActive && styles.trackCardActive]}
      onPress={onToggle}
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
        </View>
        <Text style={styles.trackDescription} numberOfLines={1}>
          {track.description}
        </Text>
      </View>
      <View style={styles.trackMeta}>
        <Text style={styles.trackDuration}>{track.duration}</Text>
        <TouchableOpacity
          style={[styles.playButton, isActive && styles.playButtonActive]}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isActive ? 'pause' : 'play'}
            size={16}
            color={isActive ? colors.accent.primary : colors.text.secondary}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ─── Component ───────────────────────────────────────────────────

export default function MusicSettingsScreen() {
  const audio = useSettingsStore((s) => s.audio);
  const updateAudio = useSettingsStore((s) => s.updateAudio);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);

  const handleMusicVolume = useCallback(
    (v: number) => updateAudio({ musicVolume: v }),
    [updateAudio],
  );

  const handleTrackToggle = useCallback((trackId: string) => {
    setActiveTrackId((prev) => (prev === trackId ? null : trackId));
  }, []);

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.titleText}>Музыка</Text>
          <Text style={styles.descriptionText}>
            Выберите фоновую музыку для медитаций и практик.
          </Text>

          {/* Built-in tracks */}
          <Text style={styles.sectionTitle}>Встроенные треки</Text>
          {BUILTIN_TRACKS.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              isActive={activeTrackId === track.id}
              onToggle={() => handleTrackToggle(track.id)}
            />
          ))}

          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>
              Аудиофайлы пока не загружены.{'\n'}Запустите генерацию TTS, чтобы добавить треки.
            </Text>
          </View>

          {/* Custom music */}
          <Text style={styles.sectionTitle}>Своя музыка</Text>
          <View style={styles.customCard}>
            <View style={styles.customCardIcon}>
              <Ionicons
                name="add-outline"
                size={20}
                color={colors.text.tertiary}
              />
            </View>
            <View style={styles.customCardInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Text style={styles.customCardTitle}>Добавить свою музыку</Text>
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Скоро</Text>
                </View>
              </View>
              <Text style={styles.customCardDescription}>
                Загрузите MP3 из файловой системы устройства
              </Text>
            </View>
          </View>

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
