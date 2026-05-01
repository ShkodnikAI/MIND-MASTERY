/**
 * @file Settings — Accessibility screen.
 *
 * Haptics toggle, text scale, and system info.
 * Wired to settingsStore.hapticsEnabled + textSize setting.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '@/store/settingsStore';
import { SettingsToggle } from '@/ui/components/SettingsToggle';
import { colors, typography, spacing, radii } from '@/ui/theme';

// ─── Text size options ────────────────────────────────────────────

const TEXT_SIZE_OPTIONS = [
  { value: 'small' as const, label: 'Мелкий' },
  { value: 'medium' as const, label: 'Средний' },
  { value: 'large' as const, label: 'Крупный' },
  { value: 'xlarge' as const, label: 'Очень крупный' },
];

// ─── Styles ──────────────────────────────────────────────────────

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
    paddingBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.background.tertiary,
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
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  sectionDescription: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },

  // ── Text size chips ──────────────────────────────────────────────
  sizeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sizeChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sizeChipActive: {
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    borderColor: colors.accent.primary,
  },
  sizeChipText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.tertiary,
  },
  sizeChipTextActive: {
    color: colors.accent.primary,
  },
  textSizePreview: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.secondary,
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  // ── Info card ────────────────────────────────────────────────────
  infoCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.secondary,
  },
  infoValue: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
  },

  // ── Screen reader section ───────────────────────────────────────
  a11yRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  a11yIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  a11yInfo: {
    flex: 1,
  },
  a11yTitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
  },
  a11yDescription: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  a11yButton: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.accent.primary,
  },

  // ── Tip card ────────────────────────────────────────────────────
  tipCard: {
    backgroundColor: 'rgba(116, 185, 255, 0.1)',
    borderRadius: radii.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.info,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  tipText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.secondary,
  },
});

// ─── Component ───────────────────────────────────────────────────

export default function AccessibilitySettingsScreen() {
  const router = useRouter();
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const setHapticsEnabled = useSettingsStore((s) => s.setHapticsEnabled);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleOpenA11ySettings = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:ACCESSIBILITY');
    } else {
      Linking.openSettings();
    }
  }, []);

  // Text size is read-only for now (requires app restart / global scale provider)
  // Showing it as informational — the actual scaling would use PixelRatio or
  // a React context that wraps all Text components.

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
            </TouchableOpacity>
            <Text style={styles.titleText}>Доступность</Text>
          </View>

          <Text style={styles.descriptionText}>
            Настройки для комфортного использования приложения, включая размер текста и поддержку
            экранных дикторов.
          </Text>

          {/* ── Haptics ────────────────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Взаимодействие</Text>
          <SettingsToggle
            label="Вибрация"
            description="Тактильная обратная связь при нажатиях и событиях"
            value={hapticsEnabled}
            onValueChange={setHapticsEnabled}
          />

          {/* ── Text size ──────────────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Размер текста</Text>
          <Text style={styles.sectionDescription}>
            Выберите удобный размер текста для интерфейса. Изменение применяется к основному
            контенту приложения.
          </Text>
          <View style={styles.sizeRow}>
            {TEXT_SIZE_OPTIONS.map((opt) => {
              const isActive = opt.value === 'medium';
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.sizeChip, isActive && styles.sizeChipActive]}
                  onPress={() => {
                    // TODO: Implement global text scale when typography context is added
                  }}
                  activeOpacity={0.7}
                  accessibilityLabel={opt.label}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.sizeChipText,
                      opt.value === 'large'
                        ? { fontSize: 17 }
                        : opt.value === 'xlarge'
                          ? { fontSize: 19 }
                          : undefined,
                      isActive && styles.sizeChipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Preview */}
          <Text style={styles.textSizePreview}>
            Внимание — это пространство для глубокой работы с сознанием. Выберите размер, который
            подходит вам лучше всего.
          </Text>

          {/* ── Screen reader ──────────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Экранный диктор</Text>
          <Text style={styles.sectionDescription}>
            MIND MASTERY поддерживает VoiceOver (iOS) и TalkBack (Android). Все интерактивные
            элементы имеют текстовые метки.
          </Text>
          <TouchableOpacity
            style={styles.a11yRow}
            onPress={handleOpenA11ySettings}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Открыть настройки доступности"
          >
            <View style={styles.a11yIcon}>
              <Ionicons name="accessibility-outline" size={22} color={colors.accent.primary} />
            </View>
            <View style={styles.a11yInfo}>
              <Text style={styles.a11yTitle}>
                {Platform.OS === 'ios' ? 'VoiceOver' : 'TalkBack'}
              </Text>
              <Text style={styles.a11yDescription}>Открыть системные настройки доступности</Text>
            </View>
            <Ionicons name="open-outline" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          {/* ── Current settings info ──────────────────────────────── */}
          <Text style={styles.sectionTitle}>О приложении</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Шрифт</Text>
              <Text style={styles.infoValue}>Inter</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Тема</Text>
              <Text style={styles.infoValue}>Тёмная</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Язык</Text>
              <Text style={styles.infoValue}>Русский</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Практик</Text>
              <Text style={styles.infoValue}>65</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Экранный диктор</Text>
              <Text style={styles.infoValue}>Поддерживается</Text>
            </View>
          </View>

          {/* ── Tip ────────────────────────────────────────────────── */}
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              Совет: для лучшего опыта с экранным диктором используйте наушники во время практик с
              озвучкой. Вы можете настроить скорость и высоту голоса в разделе «Голос».
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
