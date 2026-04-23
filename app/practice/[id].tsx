/**
 * @file Practice Detail — Dynamic route for individual practices.
 *
 * Route: /practice/[id]
 * Placeholder screen — full functionality in Stage 2.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, radii } from '@/ui/theme';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  titleText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xxl,
    lineHeight: typography.lineHeights.xxl,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  idBadge: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.xl,
  },
  idBadgeText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.secondary,
  },
  placeholderCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  placeholderText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default function PracticeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.gradient}>
          <Text style={styles.titleText}>Практика</Text>

          <View style={styles.idBadge}>
            <Text style={styles.idBadgeText}>ID: {id ?? 'неизвестно'}</Text>
          </View>

          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderText}>
              Детали практики будут доступны на Stage 2.{'\n\n'}Здесь будет
              отображаться описание, теория, contraindications и кнопка запуска
              медитации.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
