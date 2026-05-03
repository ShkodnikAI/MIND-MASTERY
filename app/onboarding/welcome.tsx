/**
 * @file Onboarding — Welcome screen.
 *
 * First screen of the onboarding flow.
 * INV-A3: All styles via StyleSheet.create.
 */

import { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii } from '@/ui/theme';

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
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: radii.xl,
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
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
    backgroundColor: colors.accent.primary,
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
  illustrationPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: radii.xl,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  illustrationText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.tertiary,
  },
});

export default function WelcomeScreen() {
  const router = useRouter();

  const handleContinue = useCallback(() => {
    router.push('/onboarding/disclaimer');
  }, [router]);

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.gradient}>
          {/* Illustration placeholder */}
          <View style={styles.illustrationPlaceholder}>
            <Ionicons name="sparkles" size={48} color={colors.accent.primary} />
            <Text style={styles.illustrationText}>Иллюстрация</Text>
          </View>

          <View style={styles.iconContainer}>
            <Ionicons name="bulb-outline" size={48} color={colors.accent.primary} />
          </View>

          <Text style={styles.titleText}>Добро пожаловать</Text>

          <Text style={styles.subtitleText}>
            MIND MASTERY — ваш путеводитель в мир медитации и осознанности. Пять проверенных систем
            для трансформации сознания.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={handleContinue}
            activeOpacity={0.8}
            accessibilityLabel="Продолжить"
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Продолжить</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
