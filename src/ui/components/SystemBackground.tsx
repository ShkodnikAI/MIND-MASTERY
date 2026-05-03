/**
 * @file SystemBackground — Full-screen gradient background for system screens.
 *
 * Renders a three-stop linear gradient using the system's visual signature
 * colours. Wraps children in a safe, themed container.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getSystemTheme } from '@/ui/theme/systemThemes';

interface SystemBackgroundProps {
  /** System identifier (e.g. 'transurfing'). */
  readonly systemId: string;
  /** Content rendered on top of the gradient. */
  readonly children: React.ReactNode;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
});

export function SystemBackground({ systemId, children }: SystemBackgroundProps) {
  const theme = getSystemTheme(systemId);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[...theme.gradientColors]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      >
        {children}
      </LinearGradient>
    </View>
  );
}
