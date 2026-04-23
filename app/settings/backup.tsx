/**
 * @file Settings — Backup screen.
 *
 * Export and import user data (progress, journal, settings).
 * UI-ready with placeholder logic for Stage 6 (OTA).
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii } from '@/ui/theme';

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
    marginBottom: spacing.sm,
  },
  descriptionText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  backupCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  backupTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  backupDescription: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  actionButtonImport: {
    backgroundColor: 'rgba(0, 184, 148, 0.2)',
  },
  actionButtonText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.accent.primary,
  },
  actionButtonTextImport: {
    color: colors.accent.success,
  },
  lastBackupText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
  },
  infoCard: {
    backgroundColor: 'rgba(116, 185, 255, 0.1)',
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.info,
  },
  infoText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.secondary,
  },
});

// ─── Component ───────────────────────────────────────────────────

export default function BackupSettingsScreen() {
  const [lastBackupDate] = useState<string | null>(null);

  const handleExport = useCallback(() => {
    // TODO: Stage 6 — implement actual export
    Alert.alert(
      'Экспорт данных',
      'Данные (прогресс, дневник, настройки) будут сохранены в файл. Функция будет доступна в следующем обновлении.',
      [{ text: 'Понятно' }],
    );
  }, []);

  const handleImport = useCallback(() => {
    // TODO: Stage 6 — implement actual import
    Alert.alert(
      'Импорт данных',
      'Выберите файл резервной копии для восстановления данных. Функция будет доступна в следующем обновлении.',
      [{ text: 'Понятно' }],
    );
  }, []);

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.content}>
          <Text style={styles.titleText}>Резервное копирование</Text>
          <Text style={styles.descriptionText}>
            Создавайте резервные копии ваших данных и восстанавливайте их при необходимости.
          </Text>

          {/* Export */}
          <View style={styles.backupCard}>
            <Text style={styles.backupTitle}>Экспортировать данные</Text>
            <Text style={styles.backupDescription}>
              Сохранить прогресс практик, записи дневника и настройки в файл.
            </Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleExport}
              activeOpacity={0.7}
            >
              <Ionicons name="cloud-upload-outline" size={20} color={colors.accent.primary} />
              <Text style={styles.actionButtonText}>Создать копию</Text>
            </TouchableOpacity>
            {lastBackupDate ? (
              <Text style={styles.lastBackupText}>Последняя копия: {lastBackupDate}</Text>
            ) : null}
          </View>

          {/* Import */}
          <View style={styles.backupCard}>
            <Text style={styles.backupTitle}>Импортировать данные</Text>
            <Text style={styles.backupDescription}>
              Восстановить данные из ранее сохранённой резервной копии. Текущие данные будут
              заменены.
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonImport]}
              onPress={handleImport}
              activeOpacity={0.7}
            >
              <Ionicons name="cloud-download-outline" size={20} color={colors.accent.success} />
              <Text style={[styles.actionButtonText, styles.actionButtonTextImport]}>
                Восстановить
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Резервная копия включает: прогресс по всем практикам, записи дневника, настройки аудио
              и голоса. Файл хранится локально на устройстве.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
