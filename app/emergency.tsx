/**
 * @file Emergency — "Calm in 60 seconds" screen.
 *
 * Quick-access calming screen with a simple breathing guide.
 * Accessible from any context via the emergency shortcut.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  emergencyIcon: {
    width: 120,
    height: 120,
    borderRadius: radii.full,
    backgroundColor: 'rgba(0, 184, 148, 0.15)',
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
    maxWidth: 300,
  },
  stepCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    width: '100%',
    marginBottom: spacing.md,
  },
  stepNumber: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xl,
    lineHeight: typography.lineHeights.xl,
    color: colors.accent.success,
    marginBottom: spacing.sm,
  },
  stepText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
  },
});

const CALMING_STEPS = [
  { number: '1', text: 'Сделайте глубокий вдох через нос на 4 счёта.' },
  { number: '2', text: 'Задержите дыхание на 4 счёта.' },
  { number: '3', text: 'Медленно выдыхайте через рот на 6 счётов.' },
  { number: '4', text: 'Повторите 10 раз. Сосредоточьтесь на ощущениях тела.' },
];

export default function EmergencyScreen() {
  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.gradient}>
          <View style={styles.emergencyIcon}>
            <Ionicons name="fitness" size={48} color={colors.accent.success} />
          </View>

          <Text style={styles.titleText}>Спокойствие за 60 секунд</Text>
          <Text style={styles.subtitleText}>
            Быстрая практика для восстановления спокойствия. Найдите удобное положение и следуйте
            инструкциям.
          </Text>

          {CALMING_STEPS.map((step) => (
            <View key={step.number} style={styles.stepCard}>
              <Text style={styles.stepNumber}>{step.number}</Text>
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          ))}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
