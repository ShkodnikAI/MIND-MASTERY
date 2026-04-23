/**
 * @file Journal — Journal entries list.
 *
 * Displays journal entries from journalStore.
 * Shows empty state when no entries exist.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useJournalStore } from '@/store/journalStore';
import { colors, typography, spacing, radii } from '@/ui/theme';
import type { JournalEntry } from '@/types';

// ─── Helpers ─────────────────────────────────────────────────────

function formatDate(date: Date): string {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}.${m}.${y}`;
}

function formatDuration(min: number): string {
  if (min === 0) return '';
  return `${min} мин`;
}

function getMoodEmoji(mood: string): string {
  switch (mood) {
    case 'great':
      return 'Отлично';
    case 'good':
      return 'Хорошо';
    case 'neutral':
      return 'Нормально';
    case 'bad':
      return 'Плохо';
    case 'awful':
      return 'Ужасно';
    default:
      return mood;
  }
}

function getMoodColor(mood: string): string {
  switch (mood) {
    case 'great':
      return colors.accent.success;
    case 'good':
      return '#74B9FF';
    case 'neutral':
      return colors.accent.warning;
    case 'bad':
      return colors.accent.primary;
    case 'awful':
      return colors.accent.error;
    default:
      return colors.text.tertiary;
  }
}

// ─── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  gradient: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  titleText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xxl,
    lineHeight: typography.lineHeights.xxl,
    color: colors.text.primary,
  },
  entriesCount: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.tertiary,
  },
  listContainer: {
    gap: spacing.sm,
  },
  entryCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  entryPractice: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
    flex: 1,
  },
  entryMood: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  entrySystem: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.text.tertiary,
  },
  entryDate: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.text.tertiary,
  },
  entryDuration: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.text.tertiary,
  },
  entryNotes: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: radii.full,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.lg,
    lineHeight: typography.lineHeights.lg,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

// ─── Entry component ─────────────────────────────────────────────

function JournalEntryCard({ entry }: { readonly entry: JournalEntry }) {
  const moodColor = getMoodColor(entry.mood);
  const moodLabel = getMoodEmoji(entry.mood);
  const duration = formatDuration(entry.durationMin);

  return (
    <TouchableOpacity style={styles.entryCard} activeOpacity={0.8}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryPractice} numberOfLines={1}>
          {entry.practiceTitle}
        </Text>
        <View style={[styles.entryMood, { backgroundColor: `${moodColor}20` }]}>
          <Text style={{ color: moodColor, fontSize: 11 }}>{moodLabel}</Text>
        </View>
      </View>
      <View style={styles.entryMeta}>
        <Text style={styles.entrySystem}>{entry.systemName}</Text>
        <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
        {duration !== '' && <Text style={styles.entryDuration}>{duration}</Text>}
      </View>
      {entry.notes ? (
        <Text style={styles.entryNotes} numberOfLines={3}>
          {entry.notes}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

// ─── Screen ──────────────────────────────────────────────────────

export default function JournalScreen() {
  const entries = useJournalStore((s) => s.entries);

  const renderItem = useCallback(
    ({ item }: { readonly item: JournalEntry }) => <JournalEntryCard entry={item} />,
    [],
  );

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.titleText}>Дневник</Text>
            {entries.length > 0 && (
              <Text style={styles.entriesCount}>
                {entries.length}{' '}
                {entries.length === 1 ? 'запись' : entries.length < 5 ? 'записи' : 'записей'}
              </Text>
            )}
          </View>

          {entries.length > 0 ? (
            <FlatList
              data={entries}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="book-outline" size={36} color={colors.text.tertiary} />
              </View>
              <Text style={styles.emptyTitle}>Записей пока нет</Text>
              <Text style={styles.emptyText}>
                Начните практику, чтобы сделать первую запись в дневнике. После каждой медитации вам
                будет предложено поделиться впечатлениями.
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
