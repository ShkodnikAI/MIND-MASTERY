/**
 * @file SettingsToggle — Reusable toggle switch row for settings screens.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { colors, typography, spacing, radii } from '@/ui/theme';

// ─── Props ───────────────────────────────────────────────────────

interface SettingsToggleProps {
  readonly label: string;
  readonly description?: string;
  readonly value: boolean;
  readonly onValueChange: (value: boolean) => void;
}

// ─── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  textColumn: {
    flex: 1,
    marginRight: spacing.md,
    gap: spacing.xs,
  },
  labelText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.text.primary,
  },
  descriptionText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.secondary,
  },
});

// ─── Component ───────────────────────────────────────────────────

export function SettingsToggle({
  label,
  description,
  value,
  onValueChange,
}: SettingsToggleProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textColumn}>
        <Text style={styles.labelText}>{label}</Text>
        {description ? <Text style={styles.descriptionText}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.background.elevated, true: colors.accent.primary }}
        thumbColor={value ? colors.text.primary : colors.text.tertiary}
      />
    </View>
  );
}
