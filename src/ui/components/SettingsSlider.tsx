/**
 * @file SettingsSlider — Reusable slider row for settings screens.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, typography, spacing } from '@/ui/theme';

// ─── Props ───────────────────────────────────────────────────────

interface SettingsSliderProps {
  readonly label: string;
  readonly value: number;
  readonly minimumValue?: number;
  readonly maximumValue?: number;
  readonly step?: number;
  readonly displayValue?: string;
  readonly onValueChange: (value: number) => void;
}

// ─── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  labelText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
  },
  valueText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.accent.secondary,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

// ─── Component ───────────────────────────────────────────────────

export function SettingsSlider({
  label,
  value,
  minimumValue = 0,
  maximumValue = 1,
  step = 0.05,
  displayValue,
  onValueChange,
}: SettingsSliderProps) {
  const showValue = displayValue ?? Math.round(value * 100) + '%';

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.labelText}>{label}</Text>
        <Text style={styles.valueText}>{showValue}</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={colors.accent.primary}
        maximumTrackTintColor={colors.background.elevated}
        thumbTintColor={colors.text.primary}
      />
    </View>
  );
}
