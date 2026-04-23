/**
 * @file ProgressRing — SVG circular progress indicator.
 *
 * Renders a circular progress arc with optional center content.
 * Used by the Player screen to display session progress.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '@/ui/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProgressRingProps {
  /** Progress value from 0 to 1. Clamped automatically. */
  progress: number;
  /** Diameter of the ring in pixels. Default 220. */
  size?: number;
  /** Width of the ring stroke in pixels. Default 6. */
  strokeWidth?: number;
  /** Color of the progress arc. Default: accent primary. */
  color?: string;
  /** Background ring color. Default: background tertiary. */
  bgColor?: string;
  /** Content rendered inside the ring. */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * SVG-based circular progress indicator.
 *
 * The arc starts from the top (12 o'clock) and sweeps clockwise.
 * Progress is clamped to [0, 1]. Zero shows an empty ring, one shows a full ring.
 */
export function ProgressRing({
  progress,
  size = 220,
  strokeWidth = 6,
  color = colors.accent.primary,
  bgColor = colors.background.tertiary,
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const strokeDashoffset = circumference * (1 - clampedProgress);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* SVG ring layer */}
      <Svg width={size} height={size}>
        {/* Background track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Center content (absolute positioned over the SVG) */}
      <View style={[styles.center, { width: size, height: size }]}>
        {children}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
