/**
 * @file AboutSection — Compact card on Hub that navigates to /about.
 *
 * Shows "Что это такое?" teaser with an arrow. Tapping opens
 * the full descriptions screen.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, radii } from '@/ui/theme';

export function AboutSection() {
  const router = useRouter();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });
    translateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) });
  }, [opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[animatedStyle]}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => router.push('/about')}
        accessibilityLabel="Что это такое? — подробное описание"
        accessibilityRole="button"
      >
        <LinearGradient
          colors={[`${colors.accent.primary}18`, `${colors.accent.primary}08`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.left}>
            <View style={styles.iconBadge}>
              <Ionicons name="compass-outline" size={20} color={colors.accent.primary} />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.title}>Что это такое?</Text>
              <Text style={styles.subtitle}>
                Шесть систем работы с сознанием и телом
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.accent.primary} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${colors.accent.primary}30`,
    marginBottom: spacing.lg,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: `${colors.accent.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    gap: 2,
    flex: 1,
  },
  title: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    color: colors.accent.primary,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.text.secondary,
  },
});
