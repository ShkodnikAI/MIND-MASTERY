/**
 * @file Settings — About screen.
 *
 * Shows app version, credits, and links.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii } from '@/ui/theme';

// ─── App info ────────────────────────────────────────────────────

const APP_VERSION = '0.1.0';
const BUILD_NUMBER = '3';

// ─── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  gradient: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  titleText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xl,
    lineHeight: typography.lineHeights.xl,
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: radii.xl,
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    alignSelf: 'center',
  },
  appName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.title,
    lineHeight: typography.lineHeights.title,
    color: colors.text.primary,
    textAlign: 'center',
  },
  appTagline: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  versionCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  versionLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.tertiary,
  },
  versionValue: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.primary,
  },
  creditsCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.xl,
  },
  creditsTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  creditsText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.secondary,
  },
});

// ─── Component ───────────────────────────────────────────────────

export default function AboutSettingsScreen() {
  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.titleText}>О приложении</Text>

          {/* Logo and name */}
          <View style={styles.logoContainer}>
            <Ionicons name="sparkles" size={36} color={colors.accent.primary} />
          </View>
          <Text style={styles.appName}>Mind Mastery</Text>
          <Text style={styles.appTagline}>Пространство для глубокой работы с сознанием</Text>

          {/* Version info */}
          <View style={styles.versionCard}>
            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>Версия</Text>
              <Text style={styles.versionValue}>{APP_VERSION}</Text>
            </View>
            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>Сборка</Text>
              <Text style={styles.versionValue}>{BUILD_NUMBER}</Text>
            </View>
            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>Платформа</Text>
              <Text style={styles.versionValue}>Expo SDK 53</Text>
            </View>
            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>Практик</Text>
              <Text style={styles.versionValue}>65</Text>
            </View>
          </View>

          {/* Credits */}
          <View style={styles.creditsCard}>
            <Text style={styles.creditsTitle}>Системы практик</Text>
            <Text style={styles.creditsText}>
              Трансерфинг Реальности — Вадим Зеланд{'\n'}
              Метод Сильвы — Хосе Сильва{'\n'}
              Медитации Диспензы — Джо Диспенза{'\n'}
              Метод Фельденкрайза — Моше Фельденкрайз{'\n'}
              Дыхательные практики — различные авторы
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
