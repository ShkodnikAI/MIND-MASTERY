/**
 * @file Трансерфинг Реальности — Tab screen (placeholder).
 *
 * Shows the system header and a placeholder list of practices.
 * Full functionality will be implemented in Stage 2.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SystemBackground } from '@/ui/components/SystemBackground';
import { colors, typography, spacing, radii } from '@/ui/theme';

// ─── Placeholder data ───────────────────────────────────────────

const PLACEHOLDER_PRACTICES = [
  { id: 't1', title: 'Поднятие якоря' },
  { id: 't2', title: 'Сканирование пространства' },
  { id: 't3', title: 'Пустая точка' },
  { id: 't4', title: 'Снижение важности' },
  { id: 't5', title: 'Стрелок и цель' },
];

// ─── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xxl,
    lineHeight: typography.lineHeights.xxl,
    color: colors.text.primary,
    flex: 1,
  },
  listContainer: {
    gap: spacing.md,
  },
  practiceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: radii.md,
    padding: spacing.md,
  },
  practiceTitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
  },
  practicePlaceholder: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxxl,
  },
  emptyText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});

// ─── Placeholder item ───────────────────────────────────────────

function PlaceholderItem({ title }: { readonly title: string }) {
  return (
    <TouchableOpacity style={styles.practiceCard} activeOpacity={0.7}>
      <Text style={styles.practiceTitle}>{title}</Text>
      <Text style={styles.practicePlaceholder}>
        Практика будет доступна на Stage 2
      </Text>
    </TouchableOpacity>
  );
}

// ─── Screen ─────────────────────────────────────────────────────

export default function TransurfingScreen() {
  const renderItem = useCallback(
    ({ item }: { readonly item: (typeof PLACEHOLDER_PRACTICES)[number] }) => (
      <PlaceholderItem title={item.title} />
    ),
    [],
  );

  return (
    <SystemBackground systemId="transurfing">
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="sparkles-outline" size={24} color={colors.text.primary} />
            </View>
            <Text style={styles.titleText}>Трансерфинг Реальности</Text>
          </View>

          <FlatList
            data={PLACEHOLDER_PRACTICES}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </SafeAreaView>
    </SystemBackground>
  );
}
