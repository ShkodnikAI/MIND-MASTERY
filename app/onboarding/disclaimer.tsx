/**
 * @file Onboarding — Medical disclaimer screen.
 *
 * Shows medical and safety information that must be acknowledged
 * before proceeding. Content in Russian.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import { useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, radii } from '@/ui/theme';
import { useSettingsStore } from '@/store/settingsStore';

const DISCLAIMER_TEXT =
  'Пожалуйста, внимательно прочитайте следующую информацию перед использованием приложения.\n\n' +
  'МЕДИЦИНСКОЕ ПРЕДУПРЕЖДЕНИЕ\n\n' +
  'Это приложение не является медицинским средством и не предназначено для диагностики, ' +
  'лечения или предотвращения каких-либо заболеваний. Содержащиеся в нём медитации, ' +
  'дыхательные упражнения и техники визуализации являются инструментами саморазвития ' +
  'и релаксации.\n\n' +
  'ПРОТИВОПОКАЗАНИЯ\n\n' +
  'Не рекомендуется использовать бинауральные ритмы и пульсирующие визуальные эффекты ' +
  'при следующих состояниях:\n' +
  '• Эпилепсия или судорожные расстройства\n' +
  '• Сердечно-сосудистые заболевания\n' +
  '• Психические расстройства (в т.ч. шизофрения, биполярное расстройство)\n' +
  '• Беременность\n' +
  '• Приём лекарств, влияющих на нервную систему\n\n' +
  'Если вы сомневаетесь, проконсультируйтесь с лечащим врачом.\n\n' +
  'БЕЗОПАСНОСТЬ\n\n' +
  'Не используйте приложение во время вождения или выполнения действий, ' +
  'требующих повышенного внимания. Немедленно прекратите использование при ' +
  'головокружении, тошноте или дискомфорте.';

const CURRENT_VERSION = '1.0.0';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  warningBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(253, 203, 110, 0.15)',
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  warningBadgeText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.accent.warning,
  },
  titleText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xxl,
    lineHeight: typography.lineHeights.xxl,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  disclaimerText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.lg,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.accent.warning,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    width: '100%',
    marginTop: spacing.md,
  },
  buttonText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.lg,
    lineHeight: typography.lineHeights.lg,
    color: colors.text.inverse,
  },
});

export default function DisclaimerScreen() {
  const router = useRouter();
  const acceptDisclaimer = useSettingsStore((s) => s.acceptDisclaimer);

  const handleAccept = useCallback(() => {
    acceptDisclaimer(CURRENT_VERSION);
    router.push('/onboarding/finish');
  }, [acceptDisclaimer, router]);

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.warningBadge}>
            <Text style={styles.warningBadgeText}>⚠ Важно</Text>
          </View>

          <Text style={styles.titleText}>Медицинское предупреждение</Text>
          <Text style={styles.disclaimerText}>{DISCLAIMER_TEXT}</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={handleAccept}
            activeOpacity={0.8}
            accessibilityLabel="Я понимаю и принимаю"
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Я понимаю и принимаю</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
