/**
 * @file Reminders Screen — manage user-created practice reminders.
 *
 * Route: /reminders
 *
 * Features:
 *  - List all reminders with toggle, edit, and delete actions.
 *  - Create a new reminder (label, time, days, sound, linked practice/system).
 *  - Edit an existing reminder via modal.
 *  - Max 10 reminders enforcement (MAX_REMINDERS).
 *  - Deep-link picker for linking to a specific practice or system.
 *
 * INV-A3: All styles via StyleSheet.create.
 * INV-1: All mutations go through reminderStore → SQLite.
 */

import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useReminderStore } from '@/store/reminderStore';
import { useContentStore } from '@/store/contentStore';
import { scheduleUserReminder, cancelUserReminder } from '@/services/notifications';
import { colors, typography, spacing, radii } from '@/ui/theme';
import { logger } from '@/utils/logger';
import type { DayOfWeek, CreateReminderInput, UpdateReminderInput } from '@/types';
import {
  DAY_OF_WEEK_LABELS,
  MAX_REMINDERS,
  DEFAULT_REMINDER,
  REMINDER_HOUR_OPTIONS,
  REMINDER_MINUTE_OPTIONS,
} from '@/types';

// ─── Constants ───────────────────────────────────────────────────

const ALL_DAYS: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 7];

const LINK_TYPES = [
  { value: 'none' as const, label: 'Без привязки' },
  { value: 'system' as const, label: 'К системе' },
  { value: 'practice' as const, label: 'К практике' },
];

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

  // ── Header ──────────────────────────────────────────────────────
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
  addBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: `${colors.accent.primary}22`,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  addBadgeText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.xs,
    color: colors.accent.primary,
  },
  addBadgeDisabled: {
    backgroundColor: `${colors.text.tertiary}15`,
  },
  addBadgeDisabledText: {
    color: colors.text.tertiary,
  },

  // ── Empty state ────────────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxxl * 2,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: radii.lg,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.lg,
    lineHeight: typography.lineHeights.lg,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    maxWidth: 260,
  },

  // ── Reminder card ──────────────────────────────────────────────
  reminderCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  reminderCardEnabled: {
    borderColor: `${colors.accent.primary}30`,
  },
  reminderCardDisabled: {
    opacity: 0.5,
  },
  reminderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reminderIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderInfo: {
    flex: 1,
  },
  reminderLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
  },
  reminderTime: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  reminderDays: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  reminderLinkedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  reminderLinkedText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.accent.secondary,
  },
  reminderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonEdit: {
    backgroundColor: `${colors.accent.primary}20`,
  },
  actionButtonDelete: {
    backgroundColor: `${colors.accent.error}15`,
  },

  // ── Modal ──────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    maxHeight: '90%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.text.tertiary,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xl,
    lineHeight: typography.lineHeights.xl,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },

  // ── Form fields ────────────────────────────────────────────────
  fieldLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  textInput: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textInputFocused: {
    borderColor: colors.accent.primary,
  },

  // ── Time picker (modal) ────────────────────────────────────────
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
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
    minWidth: 44,
    textAlign: 'center',
  },
  timeSeparator: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xxl,
    lineHeight: typography.lineHeights.xxl,
    color: colors.text.tertiary,
  },

  // ── Day selector (modal) ───────────────────────────────────────
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
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

  // ── Toggle rows (modal) ────────────────────────────────────────
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  toggleLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.text.tertiary,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleSwitchOn: {
    backgroundColor: colors.accent.primary,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  toggleKnobOn: {
    alignSelf: 'flex-end',
  },

  // ── Link type selector (modal) ─────────────────────────────────
  linkTypeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  linkTypeButton: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.sm,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  linkTypeButtonSelected: {
    backgroundColor: `${colors.accent.primary}20`,
    borderColor: colors.accent.primary,
  },
  linkTypeButtonText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.tertiary,
  },
  linkTypeButtonTextSelected: {
    color: colors.accent.primary,
  },

  // ── Linked item picker (modal) ─────────────────────────────────
  linkedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  linkedItemName: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.primary,
    flex: 1,
  },
  linkedItemBadge: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.accent.secondary,
    backgroundColor: `${colors.accent.secondary}15`,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },

  // ── Save button (modal) ────────────────────────────────────────
  saveButton: {
    backgroundColor: colors.accent.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  saveButtonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: '#fff',
  },
  saveButtonDisabled: {
    backgroundColor: colors.text.tertiary,
  },

  // ── Picker modal ───────────────────────────────────────────────
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  pickerContent: {
    backgroundColor: colors.background.secondary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    maxHeight: '60%',
  },
  pickerTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.lg,
    lineHeight: typography.lineHeights.lg,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  pickerList: {
    maxHeight: 360,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
  },
  pickerItemIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerItemText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
    flex: 1,
  },
  pickerItemSelected: {
    backgroundColor: `${colors.accent.primary}15`,
  },
  pickerCancel: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  pickerCancelText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
  },

  // ── Count bar ──────────────────────────────────────────────────
  countBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  countText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.tertiary,
  },
});

// ─── Types ───────────────────────────────────────────────────────

interface FormState extends CreateReminderInput {
  linkedId: string | null;
}

const INITIAL_FORM: FormState = {
  ...DEFAULT_REMINDER,
  linkedId: null,
};

// ─── Component ───────────────────────────────────────────────────

export default function RemindersScreen() {
  const router = useRouter();
  const reminders = useReminderStore((s) => s.reminders);
  const loading = useReminderStore((s) => s.loading);
  const addReminder = useReminderStore((s) => s.addReminder);
  const editReminder = useReminderStore((s) => s.editReminder);
  const removeReminder = useReminderStore((s) => s.removeReminder);
  const toggleReminder = useReminderStore((s) => s.toggleReminder);
  const systems = useContentStore((s) => s.systems);
  const practices = useContentStore((s) => s.practices);

  // ── Modal state ────────────────────────────────────────────────
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [labelFocused, setLabelFocused] = useState(false);
  const [pickerVisible, setPickerVisible] = useState<false | 'system' | 'practice'>(false);

  // ── Derived ────────────────────────────────────────────────────
  const reminderCount = reminders?.length ?? 0;
  const isAtLimit = reminderCount >= MAX_REMINDERS;
  const isEditing = editingId !== null;
  const modalTitle = isEditing ? 'Редактировать напоминание' : 'Новое напоминание';

  // Systems and practices arrays for picker
  const systemsList = useMemo(() => Object.values(systems), [systems]);
  const practicesList = useMemo(() => Object.values(practices), [practices]);

  // ── Navigation ────────────────────────────────────────────────

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // ── Open create modal ──────────────────────────────────────────

  const handleCreate = useCallback(() => {
    if (isAtLimit) {
      Alert.alert(
        'Лимит напоминаний',
        `Максимум ${MAX_REMINDERS} напоминаний. Удалите существующее, чтобы создать новое.`,
      );
      return;
    }

    setEditingId(null);
    setForm({ ...INITIAL_FORM });
    setModalVisible(true);
  }, [isAtLimit]);

  // ── Open edit modal ────────────────────────────────────────────

  const handleEdit = useCallback(
    (id: string) => {
      const reminder = reminders?.find((r) => r.id === id);
      if (!reminder) return;

      setEditingId(id);
      setForm({
        label: reminder.label,
        hour: reminder.hour,
        minute: reminder.minute,
        days: [...reminder.days] as DayOfWeek[],
        enabled: reminder.enabled,
        sound: reminder.sound,
        linkedType: reminder.linkedType,
        linkedId: reminder.linkedId,
      });
      setModalVisible(true);
    },
    [reminders],
  );

  // ── Toggle reminder ────────────────────────────────────────────

  const handleToggle = useCallback(
    async (id: string, currentEnabled: boolean) => {
      const newEnabled = !currentEnabled;

      try {
        const updated = await toggleReminder(id, newEnabled);
        if (!updated) return;

        // Schedule or cancel the OS notification
        if (newEnabled) {
          await scheduleUserReminder(updated);
        } else {
          await cancelUserReminder(id);
        }
      } catch (err) {
        logger.error('[reminders]', 'Toggle failed', err);
      }
    },
    [toggleReminder],
  );

  // ── Delete reminder ────────────────────────────────────────────

  const handleDelete = useCallback(
    (id: string, label: string) => {
      Alert.alert(
        'Удалить напоминание?',
        `Напоминание "${label || 'Без названия'}" будет удалено.`,
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Удалить',
            style: 'destructive',
            onPress: async () => {
              try {
                await cancelUserReminder(id);
                await removeReminder(id);
              } catch (err) {
                logger.error('[reminders]', 'Delete failed', err);
              }
            },
          },
        ],
      );
    },
    [removeReminder],
  );

  // ── Save (create or update) ────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!form.label.trim()) {
      Alert.alert('Введите название', 'Дайте название этому напоминанию.');
      return;
    }
    if (form.days.length === 0) {
      Alert.alert('Выберите дни', 'Выберите хотя бы один день недели.');
      return;
    }
    if (form.linkedType !== 'none' && !form.linkedId) {
      Alert.alert('Выберите привязку', 'Выберите систему или практику для привязки.');
      return;
    }

    try {
      if (isEditing && editingId) {
        // Update existing
        const updates: UpdateReminderInput = {
          label: form.label.trim(),
          hour: form.hour,
          minute: form.minute,
          days: form.days,
          enabled: form.enabled,
          sound: form.sound,
          linkedType: form.linkedType,
          linkedId: form.linkedType === 'none' ? null : form.linkedId,
        };

        // Cancel old OS notifications before updating
        await cancelUserReminder(editingId);
        const updated = await editReminder(editingId, updates);

        // Reschedule if enabled
        if (updated && updated.enabled) {
          await scheduleUserReminder(updated);
        }
      } else {
        // Create new
        const input: CreateReminderInput = {
          label: form.label.trim(),
          hour: form.hour,
          minute: form.minute,
          days: form.days,
          enabled: form.enabled,
          sound: form.sound,
          linkedType: form.linkedType,
          linkedId: form.linkedType === 'none' ? null : form.linkedId,
        };

        const created = await addReminder(input);

        // Schedule OS notification if enabled
        if (created.enabled) {
          await scheduleUserReminder(created);
        }
      }

      setModalVisible(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка сохранения';
      Alert.alert('Ошибка', msg);
      logger.error('[reminders]', 'Save failed', err);
    }
  }, [form, isEditing, editingId, addReminder, editReminder]);

  // ── Form helpers ───────────────────────────────────────────────

  const handleHourChange = useCallback(
    (direction: 'up' | 'down') => {
      const idx = REMINDER_HOUR_OPTIONS.indexOf(form.hour);
      const next = direction === 'up' ? idx + 1 : idx - 1;
      const clamped = Math.max(0, Math.min(REMINDER_HOUR_OPTIONS.length - 1, next));
      setForm((f) => ({ ...f, hour: REMINDER_HOUR_OPTIONS[clamped] }));
    },
    [form.hour],
  );

  const handleMinuteChange = useCallback(
    (direction: 'up' | 'down') => {
      const idx = REMINDER_MINUTE_OPTIONS.indexOf(form.minute as 0 | 15 | 30 | 45);
      const next = direction === 'up' ? idx + 1 : idx - 1;
      const clamped = Math.max(0, Math.min(REMINDER_MINUTE_OPTIONS.length - 1, next));
      setForm((f) => ({ ...f, minute: REMINDER_MINUTE_OPTIONS[clamped] }));
    },
    [form.minute],
  );

  const handleDayToggle = useCallback((day: DayOfWeek) => {
    setForm((f) => {
      const isSelected = f.days.includes(day);
      const newDays = isSelected ? f.days.filter((d) => d !== day) : [...f.days, day].sort();
      return { ...f, days: newDays };
    });
  }, []);

  const handleLinkTypeChange = useCallback((type: FormState['linkedType']) => {
    setForm((f) => ({
      ...f,
      linkedType: type,
      linkedId: type === 'none' ? null : f.linkedId,
    }));
  }, []);

  // ── Render reminder card ───────────────────────────────────────

  const renderReminderCard = useCallback(
    (reminder: typeof reminders extends (infer T)[] | null ? T : never) => {
      const timeStr = `${String(reminder.hour).padStart(2, '0')}:${String(reminder.minute).padStart(2, '0')}`;
      const daysStr = reminder.days.map((d) => DAY_OF_WEEK_LABELS[d as DayOfWeek]).join(', ');

      const linkedName = (() => {
        if (reminder.linkedType === 'system' && reminder.linkedId) {
          return systems[reminder.linkedId]?.name;
        }
        if (reminder.linkedType === 'practice' && reminder.linkedId) {
          return practices[reminder.linkedId]?.title;
        }
        return null;
      })();

      return (
        <View
          key={reminder.id}
          style={[
            styles.reminderCard,
            reminder.enabled ? styles.reminderCardEnabled : styles.reminderCardDisabled,
          ]}
        >
          <View style={styles.reminderTopRow}>
            {/* Icon */}
            <View style={styles.reminderIcon}>
              <Ionicons
                name={reminder.enabled ? 'alarm' : 'alarm-outline'}
                size={20}
                color={reminder.enabled ? colors.accent.primary : colors.text.tertiary}
              />
            </View>

            {/* Info */}
            <View style={styles.reminderInfo}>
              <Text style={styles.reminderLabel} numberOfLines={1}>
                {reminder.label || 'Напоминание'}
              </Text>
              <Text style={styles.reminderTime}>
                {timeStr} {reminder.sound ? '' : '(без звука)'}
              </Text>
              <Text style={styles.reminderDays} numberOfLines={1}>
                {daysStr}
              </Text>
              {linkedName ? (
                <View style={styles.reminderLinkedBadge}>
                  <Ionicons name="link" size={12} color={colors.accent.secondary} />
                  <Text style={styles.reminderLinkedText} numberOfLines={1}>
                    {linkedName}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Actions */}
            <View style={styles.reminderActions}>
              {/* Toggle */}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  reminder.enabled
                    ? { backgroundColor: `${colors.accent.primary}20` }
                    : { backgroundColor: colors.background.elevated },
                ]}
                onPress={() => handleToggle(reminder.id, reminder.enabled)}
                accessibilityLabel={reminder.enabled ? 'Отключить' : 'Включить'}
                accessibilityRole="switch"
              >
                <Ionicons
                  name={reminder.enabled ? 'notifications' : 'notifications-off-outline'}
                  size={16}
                  color={reminder.enabled ? colors.accent.primary : colors.text.tertiary}
                />
              </TouchableOpacity>

              {/* Edit */}
              <TouchableOpacity
                style={styles.actionButtonEdit}
                onPress={() => handleEdit(reminder.id)}
                accessibilityLabel="Редактировать"
              >
                <View style={styles.actionButton}>
                  <Ionicons name="create-outline" size={16} color={colors.accent.primary} />
                </View>
              </TouchableOpacity>

              {/* Delete */}
              <TouchableOpacity
                style={styles.actionButtonDelete}
                onPress={() => handleDelete(reminder.id, reminder.label)}
                accessibilityLabel="Удалить"
              >
                <View style={styles.actionButton}>
                  <Ionicons name="trash-outline" size={16} color={colors.accent.error} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    },
    [handleToggle, handleEdit, handleDelete, systems, practices],
  );

  // ── Render ─────────────────────────────────────────────────────

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.headerRow}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
              </TouchableOpacity>
              <Text style={styles.titleText}>Мои напоминания</Text>
              <TouchableOpacity
                style={[styles.addBadge, isAtLimit && styles.addBadgeDisabled]}
                onPress={handleCreate}
                disabled={isAtLimit}
                accessibilityLabel="Добавить напоминание"
              >
                <Ionicons
                  name="add"
                  size={18}
                  color={isAtLimit ? colors.text.tertiary : colors.accent.primary}
                />
                <Text style={[styles.addBadgeText, isAtLimit && styles.addBadgeDisabledText]}>
                  {reminderCount}/{MAX_REMINDERS}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Count bar */}
            <View style={styles.countBar}>
              <Text style={styles.countText}>
                {reminderCount === 0
                  ? 'Нет напоминаний'
                  : `${reminderCount} из ${MAX_REMINDERS} напоминаний`}
              </Text>
            </View>

            {/* Empty state */}
            {(!reminders || reminders.length === 0) && (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="alarm-outline" size={36} color={colors.text.tertiary} />
                </View>
                <Text style={styles.emptyTitle}>Нет напоминаний</Text>
                <Text style={styles.emptyDescription}>
                  Создайте персональные напоминания для ежедневной практики. Нажмите кнопку +, чтобы
                  добавить первое.
                </Text>
              </View>
            )}

            {/* Reminder list */}
            {reminders && reminders.length > 0 && reminders.map(renderReminderCard)}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* ── Create / Edit Modal ──────────────────────────────── */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              style={styles.modalContent}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>{modalTitle}</Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Label */}
                <Text style={styles.fieldLabel}>Название</Text>
                <TextInput
                  style={[styles.textInput, labelFocused && styles.textInputFocused]}
                  value={form.label}
                  onChangeText={(text) => setForm((f) => ({ ...f, label: text }))}
                  onFocus={() => setLabelFocused(true)}
                  onBlur={() => setLabelFocused(false)}
                  placeholder="Утренняя медитация"
                  placeholderTextColor={colors.text.tertiary}
                  maxLength={50}
                  returnKeyType="done"
                />

                {/* Time picker */}
                <Text style={styles.fieldLabel}>Время</Text>
                <View style={styles.timePickerRow}>
                  <TouchableOpacity
                    style={styles.timeArrowButton}
                    onPress={() => handleHourChange('down')}
                  >
                    <Ionicons name="remove" size={18} color={colors.text.secondary} />
                  </TouchableOpacity>
                  <Text style={styles.timeDisplay}>{String(form.hour).padStart(2, '0')}</Text>
                  <Text style={styles.timeSeparator}>:</Text>
                  <Text style={styles.timeDisplay}>{String(form.minute).padStart(2, '0')}</Text>
                  <TouchableOpacity
                    style={styles.timeArrowButton}
                    onPress={() => handleMinuteChange('up')}
                  >
                    <Ionicons name="add" size={18} color={colors.text.secondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.timeArrowButton}
                    onPress={() => handleHourChange('up')}
                  >
                    <Ionicons name="add" size={18} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>

                {/* Day selector */}
                <Text style={styles.fieldLabel}>Дни недели</Text>
                <View style={styles.dayRow}>
                  {ALL_DAYS.map((day) => {
                    const isSelected = form.days.includes(day);
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

                {/* Sound toggle */}
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Звук</Text>
                  <TouchableOpacity
                    style={[styles.toggleSwitch, form.sound && styles.toggleSwitchOn]}
                    onPress={() => setForm((f) => ({ ...f, sound: !f.sound }))}
                    accessibilityRole="switch"
                    accessibilityValue={{ text: form.sound ? 'вкл' : 'выкл' }}
                  >
                    <View style={[styles.toggleKnob, form.sound && styles.toggleKnobOn]} />
                  </TouchableOpacity>
                </View>

                {/* Enabled toggle */}
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Включено</Text>
                  <TouchableOpacity
                    style={[styles.toggleSwitch, form.enabled && styles.toggleSwitchOn]}
                    onPress={() => setForm((f) => ({ ...f, enabled: !f.enabled }))}
                    accessibilityRole="switch"
                    accessibilityValue={{ text: form.enabled ? 'вкл' : 'выкл' }}
                  >
                    <View style={[styles.toggleKnob, form.enabled && styles.toggleKnobOn]} />
                  </TouchableOpacity>
                </View>

                {/* Link type */}
                <Text style={styles.fieldLabel}>Привязка</Text>
                <View style={styles.linkTypeRow}>
                  {LINK_TYPES.map((lt) => (
                    <TouchableOpacity
                      key={lt.value}
                      style={[
                        styles.linkTypeButton,
                        form.linkedType === lt.value && styles.linkTypeButtonSelected,
                      ]}
                      onPress={() => handleLinkTypeChange(lt.value)}
                    >
                      <Text
                        style={[
                          styles.linkTypeButtonText,
                          form.linkedType === lt.value && styles.linkTypeButtonTextSelected,
                        ]}
                      >
                        {lt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Linked item selector */}
                {form.linkedType === 'system' && (
                  <TouchableOpacity
                    style={styles.linkedItemRow}
                    onPress={() => setPickerVisible('system')}
                  >
                    <Ionicons name="apps-outline" size={18} color={colors.accent.secondary} />
                    <Text style={styles.linkedItemName} numberOfLines={1}>
                      {form.linkedId
                        ? (systems[form.linkedId]?.name ?? 'Выберите систему')
                        : 'Выберите систему'}
                    </Text>
                    {form.linkedId && (
                      <Ionicons name="close-circle" size={18} color={colors.text.tertiary} />
                    )}
                  </TouchableOpacity>
                )}

                {form.linkedType === 'practice' && (
                  <TouchableOpacity
                    style={styles.linkedItemRow}
                    onPress={() => setPickerVisible('practice')}
                  >
                    <Ionicons name="fitness-outline" size={18} color={colors.accent.secondary} />
                    <Text style={styles.linkedItemName} numberOfLines={1}>
                      {form.linkedId
                        ? (practices[form.linkedId]?.title ?? 'Выберите практику')
                        : 'Выберите практику'}
                    </Text>
                    {form.linkedId && (
                      <Ionicons name="close-circle" size={18} color={colors.text.tertiary} />
                    )}
                  </TouchableOpacity>
                )}
              </ScrollView>

              {/* Save button */}
              <TouchableOpacity
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Сохранение...' : isEditing ? 'Сохранить' : 'Создать'}
                </Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </View>
        </Modal>

        {/* ── Picker Modal (System / Practice) ──────────────── */}
        <Modal
          visible={pickerVisible !== false}
          animationType="fade"
          transparent
          onRequestClose={() => setPickerVisible(false)}
        >
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerContent}>
              <Text style={styles.pickerTitle}>
                {pickerVisible === 'system' ? 'Выберите систему' : 'Выберите практику'}
              </Text>
              <ScrollView style={styles.pickerList}>
                {pickerVisible === 'system' &&
                  systemsList.map((sys) => (
                    <TouchableOpacity
                      key={sys.id}
                      style={[
                        styles.pickerItem,
                        form.linkedId === sys.id && styles.pickerItemSelected,
                      ]}
                      onPress={() => {
                        setForm((f) => ({ ...f, linkedId: sys.id }));
                        setPickerVisible(false);
                      }}
                    >
                      <View style={[styles.pickerItemIcon, { backgroundColor: sys.color + '22' }]}>
                        <Ionicons name={sys.icon as any} size={16} color={sys.color} />
                      </View>
                      <Text style={styles.pickerItemText}>{sys.name}</Text>
                    </TouchableOpacity>
                  ))}

                {pickerVisible === 'practice' &&
                  practicesList.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.pickerItem,
                        form.linkedId === p.id && styles.pickerItemSelected,
                      ]}
                      onPress={() => {
                        setForm((f) => ({ ...f, linkedId: p.id }));
                        setPickerVisible(false);
                      }}
                    >
                      <Ionicons
                        name="fitness-outline"
                        size={16}
                        color={systems[p.systemId]?.color ?? colors.text.tertiary}
                      />
                      <Text style={styles.pickerItemText}>{p.title}</Text>
                      <Text style={styles.linkedItemBadge}>
                        {systems[p.systemId]?.name ?? p.systemId}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
              <TouchableOpacity style={styles.pickerCancel} onPress={() => setPickerVisible(false)}>
                <Text style={styles.pickerCancelText}>Отмена</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}
