/**
 * @file Settings — Light effects screen.
 *
 * Controls for light themes, effects, intensity, night mode, entrainment,
 * and chakra flow. Wired to lightSettingsStore (config, entrainment, chakra).
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLightSettingsStore } from '@/store/lightSettingsStore';
import { SettingsSlider } from '@/ui/components/SettingsSlider';
import { SettingsToggle } from '@/ui/components/SettingsToggle';
import { colors, typography, spacing, radii } from '@/ui/theme';
import type { LightThemeId, LightEffect } from '@/types';

// ─── Options ─────────────────────────────────────────────────────

const THEME_OPTIONS: { readonly value: LightThemeId; readonly label: string }[] = [
  { value: 'cosmic', label: 'Космос' },
  { value: 'ocean', label: 'Океан' },
  { value: 'forest', label: 'Лес' },
  { value: 'sunset', label: 'Закат' },
  { value: 'golden', label: 'Золото' },
  { value: 'aurora', label: 'Аврора' },
  { value: 'crystal', label: 'Кристалл' },
];

const EFFECT_OPTIONS: { readonly value: LightEffect; readonly label: string }[] = [
  { value: 'glow', label: 'Свечение' },
  { value: 'pulse', label: 'Пульсация' },
  { value: 'breathe', label: 'Дыхание' },
  { value: 'entrainment', label: 'Энтейнмент' },
  { value: 'chakra-flow', label: 'Чакры' },
  { value: 'off', label: 'Выкл' },
];

// ─── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  gradient: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },

  // ── Header ────────────────────────────────────────────────────
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

  // ── Description ───────────────────────────────────────────────
  descriptionText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },

  // ── Sections ──────────────────────────────────────────────────
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

  // ── Chip selector ─────────────────────────────────────────────
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  optionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionChipActive: {
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    borderColor: colors.accent.primary,
  },
  optionText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.secondary,
  },
  optionTextActive: {
    color: colors.accent.primary,
  },

  // ── Disabled wrapper ──────────────────────────────────────────
  disabledWrapper: {
    opacity: 0.4,
  },

  // ── Night mode hour pickers ───────────────────────────────────
  hourPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  hourPickerGroup: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  hourPickerLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.text.tertiary,
  },
  hourPickerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hourArrowButton: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hourDisplay: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xl,
    lineHeight: typography.lineHeights.xl,
    color: colors.text.primary,
    minWidth: 44,
    textAlign: 'center',
  },
  hourSeparator: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xl,
    lineHeight: typography.lineHeights.xl,
    color: colors.text.tertiary,
    marginHorizontal: spacing.xs,
  },

  // ── Info cards ────────────────────────────────────────────────
  infoCard: {
    borderRadius: radii.md,
    borderLeftWidth: 3,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  warningCard: {
    backgroundColor: 'rgba(253, 203, 110, 0.15)',
    borderLeftColor: colors.accent.warning,
  },
  safetyCard: {
    backgroundColor: 'rgba(116, 185, 255, 0.1)',
    borderLeftColor: colors.accent.info,
  },
  infoText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.secondary,
  },
});

// ─── Helpers ─────────────────────────────────────────────────────

function padHour(h: number): string {
  return String(h).padStart(2, '0');
}

/** Clamp hour to 0–23 with wrap-around. */
function clampHour(h: number): number {
  return ((h % 24) + 24) % 24;
}

// ─── Component ───────────────────────────────────────────────────

export default function LightSettingsScreen() {
  const router = useRouter();

  const config = useLightSettingsStore((s) => s.config);
  const entrainment = useLightSettingsStore((s) => s.entrainment);
  const chakra = useLightSettingsStore((s) => s.chakra);

  const updateConfig = useLightSettingsStore((s) => s.updateConfig);
  const updateEntrainment = useLightSettingsStore((s) => s.updateEntrainment);
  const updateChakra = useLightSettingsStore((s) => s.updateChakra);

  const isMasterOn = config.enabled;
  const isNightOn = config.autoNightMode;

  // ── Navigation ────────────────────────────────────────────────

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // ── Night hour pickers ────────────────────────────────────────

  const handleNightStartChange = useCallback(
    (direction: 'up' | 'down') => {
      const next = direction === 'up' ? config.nightStartHour + 1 : config.nightStartHour - 1;
      updateConfig({ nightStartHour: clampHour(next) });
    },
    [config.nightStartHour, updateConfig],
  );

  const handleNightEndChange = useCallback(
    (direction: 'up' | 'down') => {
      const next = direction === 'up' ? config.nightEndHour + 1 : config.nightEndHour - 1;
      updateConfig({ nightEndHour: clampHour(next) });
    },
    [config.nightEndHour, updateConfig],
  );

  // ── Entrainment toggle (with safety warning) ─────────────────

  const handleEntrainmentToggle = useCallback(
    (value: boolean) => {
      if (value && !entrainment.safetyWarningShown) {
        Alert.alert(
          'Предупреждение о безопасности',
          'Световой энтейнмент использует мерцание света для воздействия на мозговые волны. Это может вызвать дискомфорт у людей с фоточувствительной эпилепсией, мигренью или другими неврологическими состояниями.\n\nИспользуйте на свой риск. При появлении дискомфорта немедленно отключите эффект.',
          [
            { text: 'Отмена', style: 'cancel', onPress: () => {} },
            {
              text: 'Понятно, включить',
              style: 'default',
              onPress: () => {
                updateEntrainment({ enabled: true, safetyWarningShown: true });
              },
            },
          ],
        );
      } else {
        updateEntrainment({ enabled: value });
      }
    },
    [entrainment.safetyWarningShown, updateEntrainment],
  );

  // ── Render ─────────────────────────────────────────────────────

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* ── Header ─────────────────────────────────────────── */}
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
            </TouchableOpacity>
            <Text style={styles.titleText}>Световые эффекты</Text>
          </View>

          <Text style={styles.descriptionText}>
            Настройте тему, эффект и интенсивность световых эффектов для медитаций.
          </Text>

          {/* ── Master toggle ──────────────────────────────────── */}
          <SettingsToggle
            label="Световые эффекты"
            description={isMasterOn ? 'Включены' : 'Отключены'}
            value={isMasterOn}
            onValueChange={(v) => updateConfig({ enabled: v })}
          />

          {/* ── Theme selector ─────────────────────────────────── */}
          <View
            style={isMasterOn ? undefined : styles.disabledWrapper}
            pointerEvents={isMasterOn ? 'auto' : 'none'}
          >
            <Text style={styles.sectionTitle}>Тема</Text>
            <View style={styles.optionsRow}>
              {THEME_OPTIONS.map((t) => {
                const isActive = config.theme === t.value;
                return (
                  <TouchableOpacity
                    key={t.value}
                    style={[styles.optionChip, isActive && styles.optionChipActive]}
                    onPress={() => updateConfig({ theme: t.value })}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Effect selector ─────────────────────────────── */}
            <Text style={styles.sectionTitle}>Эффект</Text>
            <View style={styles.optionsRow}>
              {EFFECT_OPTIONS.map((e) => {
                const isActive = config.effect === e.value;
                return (
                  <TouchableOpacity
                    key={e.value}
                    style={[styles.optionChip, isActive && styles.optionChipActive]}
                    onPress={() => updateConfig({ effect: e.value })}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                      {e.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Intensity slider ────────────────────────────── */}
            <SettingsSlider
              label="Интенсивность"
              value={config.intensity}
              minimumValue={0}
              maximumValue={1}
              step={0.05}
              onValueChange={(v) => updateConfig({ intensity: v })}
            />
          </View>

          {/* ── Night mode section ─────────────────────────────── */}
          <Text style={styles.sectionTitle}>Ночной режим</Text>
          <Text style={styles.sectionDescription}>
            Автоматически снижает интенсивность в указанные часы.
          </Text>

          <SettingsToggle
            label="Автоночной режим"
            description={
              isNightOn
                ? `С ${padHour(config.nightStartHour)}:00 до ${padHour(config.nightEndHour)}:00`
                : 'Отключён'
            }
            value={isNightOn}
            onValueChange={(v) => updateConfig({ autoNightMode: v })}
          />

          {isNightOn ? (
            <View style={styles.hourPickerRow}>
              {/* Start hour */}
              <View style={styles.hourPickerGroup}>
                <Text style={styles.hourPickerLabel}>Начало</Text>
                <View style={styles.hourPickerControls}>
                  <TouchableOpacity
                    style={styles.hourArrowButton}
                    onPress={() => handleNightStartChange('down')}
                    accessibilityLabel="Уменьшить час начала ночного режима"
                  >
                    <Ionicons name="remove" size={18} color={colors.text.secondary} />
                  </TouchableOpacity>
                  <Text style={styles.hourDisplay}>{padHour(config.nightStartHour)}</Text>
                  <TouchableOpacity
                    style={styles.hourArrowButton}
                    onPress={() => handleNightStartChange('up')}
                    accessibilityLabel="Увеличить час начала ночного режима"
                  >
                    <Ionicons name="add" size={18} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.hourSeparator}>—</Text>

              {/* End hour */}
              <View style={styles.hourPickerGroup}>
                <Text style={styles.hourPickerLabel}>Конец</Text>
                <View style={styles.hourPickerControls}>
                  <TouchableOpacity
                    style={styles.hourArrowButton}
                    onPress={() => handleNightEndChange('down')}
                    accessibilityLabel="Уменьшить час конца ночного режима"
                  >
                    <Ionicons name="remove" size={18} color={colors.text.secondary} />
                  </TouchableOpacity>
                  <Text style={styles.hourDisplay}>{padHour(config.nightEndHour)}</Text>
                  <TouchableOpacity
                    style={styles.hourArrowButton}
                    onPress={() => handleNightEndChange('up')}
                    accessibilityLabel="Увеличить час конца ночного режима"
                  >
                    <Ionicons name="add" size={18} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : null}

          {/* ── Entrainment section ────────────────────────────── */}
          <Text style={styles.sectionTitle}>Энтейнмент</Text>
          <Text style={styles.sectionDescription}>
            Световой энтейнмент синхронизирует мозговые волны с помощью ритмичного мерцания.
          </Text>

          <SettingsToggle
            label="Энтейнмент"
            description={entrainment.enabled ? `${entrainment.targetHz} Гц` : 'Отключён'}
            value={entrainment.enabled}
            onValueChange={handleEntrainmentToggle}
          />

          {entrainment.enabled ? (
            <>
              <SettingsSlider
                label="Целевая частота"
                value={entrainment.targetHz}
                minimumValue={1}
                maximumValue={entrainment.maxSupportedHz}
                step={0.5}
                displayValue={`${entrainment.targetHz} Гц`}
                onValueChange={(v) => updateEntrainment({ targetHz: v })}
              />

              {/* Entrainment safety warning card */}
              <View style={[styles.infoCard, styles.warningCard]}>
                <Text style={styles.infoText}>
                  ⚠ Не используйте энтейнмент при фоточувствительной эпилепсии, мигрени или других
                  неврологических состояниях. При дискомфорте немедленно отключите.
                </Text>
              </View>
            </>
          ) : null}

          {/* ── Chakra section ─────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Чакры</Text>
          <Text style={styles.sectionDescription}>
            Цветовой поток последовательно активирует 7 чакр для балансировки энергий.
          </Text>

          <SettingsToggle
            label="Поток чакр"
            description={chakra.enabled ? `${chakra.speedSecPerChakra} сек на чакру` : 'Отключён'}
            value={chakra.enabled}
            onValueChange={(v) => updateChakra({ enabled: v })}
          />

          {chakra.enabled ? (
            <SettingsSlider
              label="Скорость"
              value={chakra.speedSecPerChakra}
              minimumValue={10}
              maximumValue={120}
              step={5}
              displayValue={`${chakra.speedSecPerChakra} сек`}
              onValueChange={(v) => updateChakra({ speedSecPerChakra: v })}
            />
          ) : null}

          {/* ── Info card ──────────────────────────────────────── */}
          <View style={[styles.infoCard, styles.safetyCard]}>
            <Text style={styles.infoText}>
              Световые эффекты обрабатываются локально на устройстве. Для использования
              интеллектуального освещения убедитесь, что совместимая лампа подключена и настроена.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
