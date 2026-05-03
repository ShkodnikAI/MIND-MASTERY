/**
 * @file Onboarding — Finish screen.
 *
 * Final screen of the onboarding flow.
 * Marks onboarding as complete and navigates to the Hub.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii } from '@/ui/theme';
import { useSettingsStore } from '@/store/settingsStore';
import { logger } from '@/utils/logger';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  checkmarkContainer: {
    width: 100,
    height: 100,
    borderRadius: radii.full,
    backgroundColor: 'rgba(0, 184, 148, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  titleText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.title,
    lineHeight: typography.lineHeights.title,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitleText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
  },
  button: {
    backgroundColor: colors.accent.success,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.lg,
    lineHeight: typography.lineHeights.lg,
    color: colors.text.primary,
  },
});

export default function FinishScreen() {
  const router = useRouter();
  const setOnboarded = useSettingsStore((s) => s.setOnboarded);

  const handleFinish = useCallback(() => {
    setOnboarded(true);
    logger.info('[onboarding]', 'Onboarding completed');
    // Navigate to Hub and reset the onboarding stack
    router.replace('/');
  }, [setOnboarded, router]);

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.gradient}>
          <View style={styles.checkmarkContainer}>
            <Ionicons name="checkmark" size={48} color={colors.accent.success} />
          </View>

          <Text style={styles.titleText}>Готово!</Text>

          <Text style={styles.subtitleText}>
            Вы готовы начать свой путь к осознанности. Выберите систему и начните первую практику.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={handleFinish}
            activeOpacity={0.8}
            accessibilityLabel="Начать"
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Начать</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
