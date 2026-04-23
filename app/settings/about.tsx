/**
 * @file Settings — About (placeholder).
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, radii } from '@/ui/theme';

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
  },
  titleText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xl,
    lineHeight: typography.lineHeights.xl,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  infoCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  infoLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
  },
  descriptionText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.md,
    color: colors.text.secondary,
    marginTop: spacing.lg,
  },
});

export default function AboutScreen() {
  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.content}>
          <Text style={styles.titleText}>О приложении</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Название</Text>
            <Text style={styles.infoValue}>MIND MASTERY</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Версия</Text>
            <Text style={styles.infoValue}>1.0.0 (Stage 1)</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Платформа</Text>
            <Text style={styles.infoValue}>Android / iOS</Text>
          </View>

          <Text style={styles.descriptionText}>
            MIND MASTERY — приложение для медитации и саморазвития,
            объединяющее пять проверенных систем: Трансерфинг Реальности,
            Метод Сильвы, Медитации Диспензы, Метод Фельденкрайза и
            Дыхательные практики.
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
