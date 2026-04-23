/**
 * @file Settings — Light (placeholder).
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

export default function LightSettingsScreen() {
  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.content}>
          <Text style={styles.titleText}>Свет</Text>
          <Text style={styles.placeholderText}>
            Настройки света будут доступны на Stage 2. Здесь можно будет выбрать
            тему освещения, эффект, интенсивность и настроить ночной режим.
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
