/**
 * @file Moment of Power — Settings screen (placeholder).
 *
 * Allows the user to configure quick mindfulness reminders
 * throughout the day. Full functionality in Stage 2.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
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
  descriptionText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  placeholderCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  cardText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.md,
    color: colors.text.secondary,
  },
});

export default function MomentScreen() {
  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="flash-outline" size={24} color={colors.accent.primary} />
            </View>
            <Text style={styles.titleText}>Момент силы</Text>
          </View>

          <Text style={styles.descriptionText}>
            Настройте момент силы — короткое напоминание для осознанности
            в течение дня. Уведомления помогут вам вернуться в настоящий момент.
          </Text>

          <View style={styles.placeholderCard}>
            <Text style={styles.cardTitle}>⏰ Расписание</Text>
            <Text style={styles.cardText}>
              Выберите время для напоминаний. Доступно на Stage 2.
            </Text>
          </View>

          <View style={styles.placeholderCard}>
            <Text style={styles.cardTitle}>🔔 Звук уведомления</Text>
            <Text style={styles.cardText}>
              Выберите мелодию для напоминаний. Доступно на Stage 2.
            </Text>
          </View>

          <View style={styles.placeholderCard}>
            <Text style={styles.cardTitle}>📝 Текст напоминания</Text>
            <Text style={styles.cardText}>
              Настройте текст, который будет отображаться в уведомлении.
              Доступно на Stage 2.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
