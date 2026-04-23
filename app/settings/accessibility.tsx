/**
 * @file Settings — Accessibility (placeholder).
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '@/ui/theme';

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
    marginBottom: spacing.md,
  },
  placeholderText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.secondary,
  },
});

export default function AccessibilitySettingsScreen() {
  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.content}>
          <Text style={styles.titleText}>Доступность</Text>
          <Text style={styles.placeholderText}>
            Настройки доступности будут доступны на Stage 2. Здесь можно будет
            включить тактильную обратную связь, увеличить размер текста и настроить
            другие параметры для удобства использования.
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
