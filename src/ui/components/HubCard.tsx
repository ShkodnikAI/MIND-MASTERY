/**
 * @file HubCard — System card for the main Hub screen.
 *
 * Displays a practice system with its icon, name, practice count,
 * and progress bar. Uses the system's brand colour for the gradient.
 *
 * INV-A3: All styles via StyleSheet.create — no inline styles.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, type GestureResponderEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii } from '@/ui/theme';

interface HubCardProps {
  /** System identifier (e.g. 'transurfing'). */
  readonly systemId: string;
  /** Display name of the system. */
  readonly name: string;
  /** Short motivational tagline. */
  readonly tagline: string;
  /** Ionicons icon name (without prefix). */
  readonly icon: string;
  /** Brand colour for the gradient (hex). */
  readonly color: string;
  /** Total number of practices in the system. */
  readonly practiceCount: number;
  /** Progress value 0–1. */
  readonly progress: number;
  /** Navigation callback on press. */
  readonly onPress: (event: GestureResponderEvent) => void;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    height: 160,
  },
  gradient: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomRow: {
    gap: spacing.xs,
  },
  nameText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.lg,
    lineHeight: typography.lineHeights.lg,
    color: colors.text.primary,
  },
  taglineText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  practiceCountText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  progressBarBackground: {
    width: 80,
    height: 4,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: radii.sm,
    backgroundColor: colors.text.primary,
  },
});

export function HubCard({
  name,
  tagline,
  icon,
  color,
  practiceCount,
  progress,
  onPress,
}: HubCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityLabel={name}
      accessibilityRole="button"
    >
      <LinearGradient
        colors={[color, `${color}CC`, `${color}99`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.topRow}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={icon as React.ComponentProps<typeof Ionicons>['name']}
              size={22}
              color={colors.text.primary}
            />
          </View>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.nameText}>{name}</Text>
          <Text style={styles.taglineText}>{tagline}</Text>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.practiceCountText}>
            {practiceCount}{' '}
            {practiceCount === 1 ? 'практика' : practiceCount < 5 ? 'практики' : 'практик'}
          </Text>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
