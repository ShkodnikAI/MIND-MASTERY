/**
 * @file Notifications Settings Screen.
 *
 * Route: /settings/notifications
 *
 * Allows the user to configure:
 *  - Daily practice reminders (time, days of week).
 *  - Streak-break warnings.
 *  - Achievement notifications.
 *  - System notification permission status.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '@/store/settingsStore';
import { useReminderStore } from '@/store/reminderStore';
import { SettingsToggle } from '@/ui/components/SettingsToggle';
import {
  requestNotificationPermission,
  scheduleDailyReminders,
  cancelAllDailyReminders,
  cancelStreakWarnings,
  scheduleStreakWarning,
} from '@/services/notifications';
import { colors, typography, spacing, radii } from '@/ui/theme';
import { logger } from '@/utils/logger';
import type { DayOfWeek } from '@/types';
import { DAY_OF_WEEK_LABELS } from '@/types';

// ─── Constants ───────────────────────────────────────────────────

const ALL_DAYS: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 7];

/** Available hour options for the reminder time picker. */
const HOUR_OPTIONS = Array.from({ length: 16 }, (_, i) => i + 7); // 07:00 – 22:00

// ─── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
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
  sectionTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },

  // ── Permission banner ──────────────────────────────────────────
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(253, 203, 110, 0.15)',
    borderRadius: radii.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.warning,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  permissionText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.secondary,
    flex: 1,
  },
  permissionButtonText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.accent.warning,
  },

  // ── Time picker ───────────────────────────────────────────────
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  timeArrowButton: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeDisplay: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xxl,
    lineHeight: typography.lineHeights.xxl,
    color: colors.text.primary,
    minWidth: 80,
    textAlign: 'center',
  },
  timeSeparator: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xxl,
    lineHeight: typography.lineHeights.xxl,
    color: colors.text.tertiary,
  },

  // ── Day of week selector ───────────────────────────────────────
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  dayButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayButtonSelected: {
    backgroundColor: `${colors.accent.primary}33`,
    borderColor: colors.accent.primary,
  },
  dayButtonText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.tertiary,
  },
  dayButtonTextSelected: {
    color: colors.accent.primary,
  },

  // ── Streak time picker ─────────────────────────────────────────
  streakTimeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  streakTimeLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
  },
  streakTimeValue: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.accent.secondary,
  },

  // ── Info card ──────────────────────────────────────────────────
  infoCard: {
    backgroundColor: 'rgba(116, 185, 255, 0.1)',
    borderRadius: radii.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.info,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  infoText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.secondary,
  },

  // ── My Reminders card ──────────────────────────────────────
  myRemindersCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  myRemindersIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myRemindersLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
  },
  myRemindersDesc: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.text.tertiary,
  },
});

// ─── Component ───────────────────────────────────────────────────

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const notifications = useSettingsStore((s) => s.notifications);
  const updateNotifications = useSettingsStore((s) => s.updateNotifications);
  const reminders = useReminderStore((s) => s.reminders);

  // ── Derived state ──────────────────────────────────────────────
  const hasPermission = notifications.permissionGranted;
  const reminderTimeStr = formatTime(
    notifications.dailyReminderHour,
    notifications.dailyReminderMinute,
  );
  const streakTimeStr = formatTime(notifications.streakReminderHour, 0);
  const reminderCount = reminders?.filter((r) => r.enabled).length ?? 0;

  // ── Permission request ─────────────────────────────────────────

  const handleRequestPermission = useCallback(async () => {
    if (hasPermission) return;

    if (Platform.OS === 'ios') {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(
          'Уведомления отключены',
          'Вы можете включить уведомления в Настройках → Уведомления → MIND MASTERY',
          [
            { text: 'Отмена', style: 'cancel' },
            { text: 'Открыть настройки', onPress: () => Linking.openSettings() },
          ],
        );
      }
    } else {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(
          'Уведомления отключены',
          'Вы можете включить уведомления в Настройках приложения → Уведомления',
          [
            { text: 'Отмена', style: 'cancel' },
            { text: 'Открыть настройки', onPress: () => Linking.openSettings() },
          ],
        );
      }
    }
  }, [hasPermission]);

  // ── Daily reminder toggle ─────────────────────────────────────

  const handleDailyToggle = useCallback(
    async (enabled: boolean) => {
      if (enabled && !hasPermission) {
        const granted = await requestNotificationPermission();
        if (!granted) return;
      }

      updateNotifications({ dailyReminderEnabled: enabled });

      if (enabled) {
        scheduleDailyReminders().catch((err) => {
          logger.error('[notifications]', 'Failed to schedule reminders', err);
        });
      } else {
        cancelAllDailyReminders().catch(() => {});
      }
    },
    [hasPermission, updateNotifications],
  );

  // ── Hour picker (daily reminder) ───────────────────────────────

  const handleHourChange = useCallback(
    (direction: 'up' | 'down') => {
      const current = notifications.dailyReminderHour;
      const idx = HOUR_OPTIONS.indexOf(current);
      const next = direction === 'up' ? idx + 1 : idx - 1;
      const clamped = Math.max(0, Math.min(HOUR_OPTIONS.length - 1, next));
      const newHour = HOUR_OPTIONS[clamped];

      updateNotifications({ dailyReminderHour: newHour });
      scheduleDailyReminders().catch(() => {});
    },
    [notifications.dailyReminderHour, updateNotifications],
  );

  // ── Minute picker ──────────────────────────────────────────────

  const handleMinuteChange = useCallback(
    (direction: 'up' | 'down') => {
      const current = notifications.dailyReminderMinute;
      const next = direction === 'up' ? (current === 0 ? 1 : 0) : current === 30 ? 0 : 1;
      const newMin: 0 | 30 = next === 0 ? 0 : 30;

      updateNotifications({ dailyReminderMinute: newMin });
      scheduleDailyReminders().catch(() => {});
    },
    [notifications.dailyReminderMinute, updateNotifications],
  );

  // ── Day toggle ─────────────────────────────────────────────────

  const handleDayToggle = useCallback(
    (day: DayOfWeek) => {
      const current = notifications.dailyReminderDays;
      const isSelected = current.includes(day);
      const newDays = isSelected ? current.filter((d) => d !== day) : [...current, day].sort();

      if (newDays.length === 0) {
        Alert.alert('Нельзя отключить все дни', 'Выберите хотя бы один день для напоминания.');
        return;
      }

      updateNotifications({ dailyReminderDays: newDays as DayOfWeek[] });
      scheduleDailyReminders().catch(() => {});
    },
    [notifications.dailyReminderDays, updateNotifications],
  );

  // ── Streak toggle ──────────────────────────────────────────────

  const handleStreakToggle = useCallback(
    async (enabled: boolean) => {
      if (enabled && !hasPermission) {
        const granted = await requestNotificationPermission();
        if (!granted) return;
      }

      updateNotifications({ streakReminderEnabled: enabled });

      if (enabled) {
        scheduleStreakWarning().catch(() => {});
      } else {
        cancelStreakWarnings().catch(() => {});
      }
    },
    [hasPermission, updateNotifications],
  );

  // ── Streak hour ────────────────────────────────────────────────

  const handleStreakHourChange = useCallback(
    (direction: 'up' | 'down') => {
      const current = notifications.streakReminderHour;
      const newHour = direction === 'up' ? Math.min(22, current + 1) : Math.max(7, current - 1);

      updateNotifications({ streakReminderHour: newHour });
      scheduleStreakWarning().catch(() => {});
    },
    [notifications.streakReminderHour, updateNotifications],
  );

  // ── Achievement toggle ─────────────────────────────────────────

  const handleAchievementToggle = useCallback(
    (enabled: boolean) => {
      updateNotifications({ achievementEnabled: enabled });
    },
    [updateNotifications],
  );

  // ── Navigation ────────────────────────────────────────────────

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // ── Render ─────────────────────────────────────────────────────

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
            </TouchableOpacity>
            <Text style={styles.titleText}>Уведомления</Text>
            {/* Alarm indicator dot */}
            {notifications.dailyReminderEnabled || notifications.streakReminderEnabled ? (
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent.success }} />
            ) : null}
          </View>

          {/* Permission banner */}
          {!hasPermission ? (
            <View style={styles.permissionBanner}>
              <Ionicons name="notifications-off-outline" size={22} color={colors.accent.warning} />
              <Text style={styles.permissionText}>
                Уведомления отключены. Включите, чтобы получать напоминания о практике.
              </Text>
              <TouchableOpacity onPress={handleRequestPermission}>
                <Text style={styles.permissionButtonText}>Включить</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* ── My Reminders Link ────────────────────────────── */}
          <TouchableOpacity
            style={styles.myRemindersCard}
            onPress={() => router.push('/reminders')}
            activeOpacity={0.7}
          >
            <View style={styles.myRemindersIcon}>
              <Ionicons name="alarm-outline" size={22} color={colors.accent.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.myRemindersLabel}>Мои напоминания</Text>
              <Text style={styles.myRemindersDesc}>{reminderCount} активных</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          {/* ── Daily Reminder Section ────────────────────────── */}
          <Text style={styles.sectionTitle}>Ежедневное напоминание</Text>
          <Text style={styles.sectionDescription}>
            Получайте напоминание о практике в выбранное время. Выберите дни и время, которые вам
            подходят.
          </Text>

          <SettingsToggle
            label="Напоминание о практике"
            description={
              notifications.dailyReminderEnabled ? `Каждый день в ${reminderTimeStr}` : 'Отключено'
            }
            value={notifications.dailyReminderEnabled}
            onValueChange={handleDailyToggle}
          />

          {/* Time picker — only when enabled */}
          {notifications.dailyReminderEnabled ? (
            <>
              <View style={styles.timePickerRow}>
                {/* Hour — */}
                <TouchableOpacity
                  style={styles.timeArrowButton}
                  onPress={() => handleHourChange('down')}
                  accessibilityLabel="Уменьшить час"
                >
                  <Ionicons name="remove" size={18} color={colors.text.secondary} />
                </TouchableOpacity>

                {/* Hour display */}
                <Text style={styles.timeDisplay}>
                  {String(notifications.dailyReminderHour).padStart(2, '0')}
                </Text>

                <Text style={styles.timeSeparator}>:</Text>

                {/* Minute display */}
                <Text style={styles.timeDisplay}>
                  {String(notifications.dailyReminderMinute).padStart(2, '0')}
                </Text>

                {/* Minute + */}
                <TouchableOpacity
                  style={styles.timeArrowButton}
                  onPress={() => handleMinuteChange('up')}
                  accessibilityLabel="Увеличить минуты"
                >
                  <Ionicons name="add" size={18} color={colors.text.secondary} />
                </TouchableOpacity>

                {/* Hour + */}
                <TouchableOpacity
                  style={styles.timeArrowButton}
                  onPress={() => handleHourChange('up')}
                  accessibilityLabel="Увеличить час"
                >
                  <Ionicons name="add" size={18} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>

              {/* Day of week selector */}
              <Text style={styles.sectionTitle}>Дни недели</Text>
              <View style={styles.dayRow}>
                {ALL_DAYS.map((day) => {
                  const isSelected = notifications.dailyReminderDays.includes(day);
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
                      onPress={() => handleDayToggle(day)}
                      accessibilityLabel={DAY_OF_WEEK_LABELS[day]}
                      accessibilityRole="button"
                    >
                      <Text
                        style={[styles.dayButtonText, isSelected && styles.dayButtonTextSelected]}
                      >
                        {DAY_OF_WEEK_LABELS[day]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          ) : null}

          {/* ── Streak Warning Section ─────────────────────────── */}
          <Text style={styles.sectionTitle}>Предупреждение о серии</Text>
          <Text style={styles.sectionDescription}>
            Если вы practice каждый день, приложение напомнит вечером, если вы ещё не успели
            позаниматься.
          </Text>

          <SettingsToggle
            label="Защита серии"
            description={
              notifications.streakReminderEnabled ? `Проверка в ${streakTimeStr}` : 'Отключено'
            }
            value={notifications.streakReminderEnabled}
            onValueChange={handleStreakToggle}
          />

          {/* Streak time picker */}
          {notifications.streakReminderEnabled ? (
            <View style={styles.streakTimeCard}>
              <Text style={styles.streakTimeLabel}>Время проверки</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <TouchableOpacity
                  style={styles.timeArrowButton}
                  onPress={() => handleStreakHourChange('down')}
                >
                  <Ionicons name="remove" size={16} color={colors.text.secondary} />
                </TouchableOpacity>
                <Text style={styles.streakTimeValue}>{streakTimeStr}</Text>
                <TouchableOpacity
                  style={styles.timeArrowButton}
                  onPress={() => handleStreakHourChange('up')}
                >
                  <Ionicons name="add" size={16} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {/* ── Achievement Section ─────────────────────────────── */}
          <Text style={styles.sectionTitle}>Достижения</Text>
          <Text style={styles.sectionDescription}>
            Получайте уведомления при достижении новых уровней и важных рубежей.
          </Text>

          <SettingsToggle
            label="Уведомления о достижениях"
            description="Новые уровни и серии"
            value={notifications.achievementEnabled}
            onValueChange={handleAchievementToggle}
          />

          {/* ── Info card ───────────────────────────────────────── */}
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Уведомления обрабатываются локально и не требуют подключения к интернету. Вы можете в
              любой момент отключить их в системных настройках устройства.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────

function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
