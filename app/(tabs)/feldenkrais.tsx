/**
 * @file Осознание через движение — Фельденкрайз Tab screen (placeholder).
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
  { id: 'f1', title: 'Сканирование тела' },
  { id: 'f2', title: 'Катание на полу' },
  { id: 'f3', title: 'Вращение головы' },
  { id: 'f4', title: 'Мост через колени' },
  { id: 'f5', title: 'Осознанное сидение' },
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

export default function FeldenkraisScreen() {
  const renderItem = useCallback(
    ({ item }: { readonly item: (typeof PLACEHOLDER_PRACTICES)[number] }) => (
      <PlaceholderItem title={item.title} />
    ),
    [],
  );

  return (
    <SystemBackground systemId="feldenkrais">
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="body-outline" size={24} color={colors.text.primary} />
            </View>
            <Text style={styles.titleText}>Осознание через движение</Text>
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
