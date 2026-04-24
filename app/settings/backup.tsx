/**
 * @file Settings — Backup screen.
 *
 * Real export/import of user data (progress, journal, sessions, reminders, settings).
 * Export writes a JSON file to the device and shares it.
 * Import picks a JSON file, validates, and replaces all current data.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { colors, typography, spacing, radii } from '@/ui/theme';
import { getDatabase } from '@/db/index';
import { getAllProgress } from '@/db/queries/progress';
import { useSettingsStore } from '@/store/settingsStore';
import { useProgressStore } from '@/store/progressStore';
import { useReminderStore } from '@/store/reminderStore';
import { logger } from '@/utils/logger';

// ─── Backup format types ─────────────────────────────────────────

interface BackupData {
  version: number;
  exportedAt: string;
  appVersion: string;
  data: {
    progress: Record<string, unknown>[];
    journal: Record<string, unknown>[];
    sessions: Record<string, unknown>[];
    reminders: Record<string, unknown>[];
    settings: Record<string, unknown>;
    appSettings: {
      onboarded?: boolean;
      theme?: string;
      hapticsEnabled?: boolean;
      safety?: Record<string, unknown>;
      audio?: Record<string, unknown>;
      voice?: Record<string, unknown>;
      light?: Record<string, unknown>;
      notifications?: Record<string, unknown>;
    };
  };
}

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
  actionButtonDisabled: {
    opacity: 0.5,
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radii.md,
    zIndex: 1,
  },
  loadingText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
});

// ─── Helpers ─────────────────────────────────────────────────────

/** Format a Date to YYYY-MM-DD string. */
function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Format a Date to HH-MM string for filenames. */
function formatTime(d: Date): string {
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}-${minutes}`;
}

// ─── Component ───────────────────────────────────────────────────

export default function BackupSettingsScreen() {
  const router = useRouter();
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  // ── Export ─────────────────────────────────────────────────────

  const handleExport = useCallback(async () => {
    if (exporting) return;
    setExporting(true);

    try {
      const db = await getDatabase();

      // 1. Read all data from SQLite tables
      const progressRows = await db.getAllAsync<Record<string, unknown>>('SELECT * FROM progress');
      const journalRows = await db.getAllAsync<Record<string, unknown>>('SELECT * FROM journal');
      const sessionsRows = await db.getAllAsync<Record<string, unknown>>('SELECT * FROM sessions');
      const remindersRows =
        await db.getAllAsync<Record<string, unknown>>('SELECT * FROM reminders');
      const settingsRows = await db.getAllAsync<{ key: string; value_json: string }>(
        'SELECT key, value_json FROM settings',
      );

      // 2. Convert settings rows to key-value object
      const settingsObj: Record<string, unknown> = {};
      for (const row of settingsRows) {
        try {
          settingsObj[row.key] = JSON.parse(row.value_json);
        } catch {
          settingsObj[row.key] = row.value_json;
        }
      }

      // 3. Read current settingsStore state (audio, voice, light, notifications, safety)
      const settingsState = useSettingsStore.getState();
      const appSettings = {
        onboarded: settingsState.onboarded,
        theme: settingsState.theme,
        hapticsEnabled: settingsState.hapticsEnabled,
        safety: settingsState.safety as unknown as Record<string, unknown>,
        audio: settingsState.audio as unknown as Record<string, unknown>,
        voice: settingsState.voice as unknown as Record<string, unknown>,
        light: settingsState.light as unknown as Record<string, unknown>,
        notifications: settingsState.notifications as unknown as Record<string, unknown>,
      };

      // 4. Build backup object
      const now = new Date();
      const backup: BackupData = {
        version: 1,
        exportedAt: now.toISOString(),
        appVersion: '0.1.0',
        data: {
          progress: progressRows,
          journal: journalRows,
          sessions: sessionsRows,
          reminders: remindersRows,
          settings: settingsObj,
          appSettings,
        },
      };

      const jsonContent = JSON.stringify(backup, null, 2);

      // 5. Write to file
      const dateStr = formatDate(now);
      const timeStr = formatTime(now);
      const fileName = `mindmastery-backup-${dateStr}-${timeStr}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, jsonContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // 6. Share the file
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: 'Сохранить резервную копию',
        });
      } else {
        // Fallback: just show the path
        Alert.alert('Файл сохранён', `Резервная копия сохранена:\n${filePath}`, [{ text: 'OK' }]);
      }

      // 7. Update last backup date
      setLastBackupDate(now.toLocaleString('ru-RU'));

      logger.info(
        '[backup]',
        `Export completed: ${progressRows.length} progress, ${journalRows.length} journal, ${sessionsRows.length} sessions, ${remindersRows.length} reminders`,
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error('[backup]', 'Export failed', error);
      Alert.alert('Ошибка экспорта', `Не удалось создать резервную копию:\n${msg}`, [
        { text: 'OK' },
      ]);
    } finally {
      setExporting(false);
    }
  }, [exporting]);

  // ── Import ─────────────────────────────────────────────────────

  const handleImport = useCallback(async () => {
    if (importing) return;

    try {
      // 1. Pick a document
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      if (!asset.uri) {
        Alert.alert('Ошибка', 'Не удалось получить файл.');
        return;
      }

      setImporting(true);

      // 2. Read the file content
      const fileContent = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // 3. Parse and validate JSON
      let backup: BackupData;
      try {
        backup = JSON.parse(fileContent) as BackupData;
      } catch {
        Alert.alert('Ошибка файла', 'Выбранный файл не является корректным JSON.', [
          { text: 'OK' },
        ]);
        return;
      }

      // 4. Validate structure
      if (!backup.version || backup.version !== 1) {
        Alert.alert(
          'Несовместимый файл',
          `Версия файла: ${backup.version ?? 'неизвестна'}. Ожидается версия 1.`,
          [{ text: 'OK' }],
        );
        return;
      }

      if (!backup.data) {
        Alert.alert('Ошибка файла', 'Файл не содержит данных для восстановления.');
        return;
      }

      const { progress, journal, sessions, reminders } = backup.data;
      const pCount = Array.isArray(progress) ? progress.length : 0;
      const jCount = Array.isArray(journal) ? journal.length : 0;
      const sCount = Array.isArray(sessions) ? sessions.length : 0;
      const rCount = Array.isArray(reminders) ? reminders.length : 0;

      // 5. Show confirmation
      Alert.alert(
        'Подтвердите восстановление',
        `Найдено данных для восстановления:\n` +
          `• ${pCount} записей прогресса\n` +
          `• ${jCount} записей дневника\n` +
          `• ${sCount} сеансов\n` +
          `• ${rCount} напоминаний\n\n` +
          `Текущие данные будут заменены. Продолжить?`,
        [
          { text: 'Отмена', style: 'cancel', onPress: () => setImporting(false) },
          {
            text: 'Восстановить',
            style: 'destructive',
            onPress: () => performImport(backup),
          },
        ],
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error('[backup]', 'Import failed', error);
      Alert.alert('Ошибка импорта', `Не удалось восстановить данные:\n${msg}`, [{ text: 'OK' }]);
      setImporting(false);
    }
  }, [importing]);

  // ── Perform actual import ──────────────────────────────────────

  const performImport = useCallback(async (backup: BackupData) => {
    try {
      const db = await getDatabase();
      const { progress, journal, sessions, reminders, settings, appSettings } = backup.data;

      // Use a transaction for atomicity
      await db.withExclusiveTransactionAsync(async (txn) => {
        // 1. Clear existing data
        await txn.runAsync('DELETE FROM progress');
        await txn.runAsync('DELETE FROM journal');
        await txn.runAsync('DELETE FROM sessions');
        await txn.runAsync('DELETE FROM reminders');
        await txn.runAsync('DELETE FROM settings');

        // 2. Insert imported progress
        if (Array.isArray(progress)) {
          for (const row of progress) {
            const r = row as Record<string, string | number | null>;
            await txn.runAsync(
              `INSERT OR IGNORE INTO progress (practice_id, system_id, completed_count, total_duration_min, current_level, last_completed_at, is_unlocked)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              r.practice_id,
              r.system_id,
              r.completed_count,
              r.total_duration_min,
              r.current_level,
              r.last_completed_at,
              r.is_unlocked,
            );
          }
        }

        // 3. Insert imported journal entries
        if (Array.isArray(journal)) {
          for (const row of journal) {
            const r = row as Record<string, string | number | null>;
            await txn.runAsync(
              `INSERT OR IGNORE INTO journal (id, session_id, practice_title, system_name, date, duration_min, mood, notes, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              r.id,
              r.session_id,
              r.practice_title,
              r.system_name,
              r.date,
              r.duration_min,
              r.mood,
              r.notes,
              r.created_at,
              r.updated_at,
            );
          }
        }

        // 4. Insert imported sessions
        if (Array.isArray(sessions)) {
          for (const row of sessions) {
            const r = row as Record<string, string | number | null>;
            await txn.runAsync(
              `INSERT OR IGNORE INTO sessions (id, practice_id, system_id, started_at, ended_at, duration_ms, completed, rating, mood, notes, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              r.id,
              r.practice_id,
              r.system_id,
              r.started_at,
              r.ended_at,
              r.duration_ms,
              r.completed,
              r.rating,
              r.mood,
              r.notes,
              r.created_at,
            );
          }
        }

        // 5. Insert imported reminders
        if (Array.isArray(reminders)) {
          for (const row of reminders) {
            const r = row as Record<string, string | number | null>;
            await txn.runAsync(
              `INSERT OR IGNORE INTO reminders (id, label, hour, minute, days_json, enabled, sound, linked_type, linked_id, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              r.id,
              r.label,
              r.hour,
              r.minute,
              r.days_json,
              r.enabled,
              r.sound,
              r.linked_type,
              r.linked_id,
              r.created_at,
              r.updated_at,
            );
          }
        }

        // 6. Insert imported settings
        if (settings && typeof settings === 'object') {
          for (const [key, value] of Object.entries(settings)) {
            const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
            await txn.runAsync(
              `INSERT OR REPLACE INTO settings (key, value_json, updated_at) VALUES (?, ?, ?)`,
              key,
              jsonValue,
              Date.now(),
            );
          }
        }
      });

      // 7. Restore appSettings from the backup
      if (appSettings && typeof appSettings === 'object') {
        const store = useSettingsStore.getState();

        if (appSettings.onboarded !== undefined) store.setOnboarded(appSettings.onboarded);
        if (appSettings.theme && ['dark', 'light', 'system'].includes(appSettings.theme)) {
          store.setTheme(appSettings.theme as 'dark' | 'light' | 'system');
        }
        if (appSettings.hapticsEnabled !== undefined) {
          store.setHapticsEnabled(appSettings.hapticsEnabled);
        }
        if (appSettings.audio && typeof appSettings.audio === 'object') {
          store.updateAudio(appSettings.audio as Parameters<typeof store.updateAudio>[0]);
        }
        if (appSettings.voice && typeof appSettings.voice === 'object') {
          store.updateVoice(appSettings.voice as Parameters<typeof store.updateVoice>[0]);
        }
        if (appSettings.light && typeof appSettings.light === 'object') {
          store.updateLight(appSettings.light as Parameters<typeof store.updateLight>[0]);
        }
        if (appSettings.notifications && typeof appSettings.notifications === 'object') {
          store.updateNotifications(
            appSettings.notifications as Parameters<typeof store.updateNotifications>[0],
          );
        }
      }

      // 8. Reload stores
      await useReminderStore.getState().loadReminders();

      // Reload progress store from DB
      const progressRows = await getAllProgress();
      const progressStore = useProgressStore.getState();
      progressStore.reset();
      for (const row of progressRows) {
        progressStore.setPracticeProgress(
          {
            practiceId: row.practice_id,
            completedCount: row.completed_count,
            totalDurationMin: row.total_duration_min,
            lastCompletedAt: row.last_completed_at ? new Date(row.last_completed_at) : null,
            currentLevel: row.current_level,
            isUnlocked: row.is_unlocked === 1,
          },
          row.system_id,
        );
      }

      logger.info('[backup]', 'Import completed successfully');

      Alert.alert('Восстановление завершено', 'Данные успешно восстановлены из резервной копии.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error('[backup]', 'Import failed during restore', error);
      Alert.alert('Ошибка восстановления', `Не удалось восстановить данные:\n${msg}`, [
        { text: 'OK' },
      ]);
    } finally {
      setImporting(false);
    }
  }, []);

  // ── Render ─────────────────────────────────────────────────────

  const isBusy = exporting || importing;

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
            {exporting && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.accent.primary} />
                <Text style={styles.loadingText}>Создание копии...</Text>
              </View>
            )}
            <Text style={styles.backupTitle}>Экспортировать данные</Text>
            <Text style={styles.backupDescription}>
              Сохранить прогресс практик, записи дневника и настройки в файл.
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, isBusy && styles.actionButtonDisabled]}
              onPress={handleExport}
              activeOpacity={0.7}
              disabled={isBusy}
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
            {importing && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.accent.success} />
                <Text style={styles.loadingText}>Восстановление данных...</Text>
              </View>
            )}
            <Text style={styles.backupTitle}>Импортировать данные</Text>
            <Text style={styles.backupDescription}>
              Восстановить данные из ранее сохранённой резервной копии. Текущие данные будут
              заменены.
            </Text>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.actionButtonImport,
                isBusy && styles.actionButtonDisabled,
              ]}
              onPress={handleImport}
              activeOpacity={0.7}
              disabled={isBusy}
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
              Резервная копия включает: прогресс по всем практикам, записи дневника, сеансы,
              настройки аудио, голоса, освещения и уведомлений. Файл хранится локально на устройстве
              и может быть передан через систему «Поделиться».
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
