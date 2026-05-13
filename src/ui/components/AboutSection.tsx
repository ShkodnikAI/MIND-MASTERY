/**
 * @file AboutSection — Presentation block for the Hub screen.
 *
 * Shows a brief description of what MIND MASTERY is and why each
 * practice system matters. Animated entrance via react-native-reanimated.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, radii } from '@/ui/theme';

// ─── Types ────────────────────────────────────────────────────

interface SystemHighlight {
  readonly icon: string;
  readonly name: string;
  readonly description: string;
  readonly color: string;
}

// ─── Data ─────────────────────────────────────────────────────

const HIGHLIGHTS: readonly SystemHighlight[] = [
  {
    icon: 'sparkles-outline',
    name: 'Трансерфинг',
    description: 'Снижение важности, управление вниманием и намерение — ключевые инструменты для влияния на жизненные обстоятельства и принятия решений.',
    color: colors.transurfing,
  },
  {
    icon: 'leaf-outline',
    name: 'Метод Сильва',
    description: 'Вход в альфа-состояние мозга для активации интуиции, решения проблем и программирования сознания на уровне глубокой релаксации.',
    color: colors.silva,
  },
  {
    icon: 'sunny-outline',
    name: 'Диспенза',
    description: 'Медитации исцеления через изменение мозговых волн, работу с эмоциями и перестройку нейронных связей для трансформации тела и жизни.',
    color: colors.dispenza,
  },
  {
    icon: 'body-outline',
    name: 'Фельденкрайз',
    description: 'Осознание через движение — мягкие упражнения для улучшения координации, снятия напряжения и расширения возможностей тела без усилий.',
    color: colors.feldenkrais,
  },
  {
    icon: 'fitness-outline',
    name: 'Дыхание',
    description: 'Управляемые дыхательные паттерны для регуляции нервной системы, снижения стресса, улучшения сна и повышения концентрации.',
    color: colors.breath,
  },
  {
    icon: 'radio-outline',
    name: 'Доминантная частота',
    description: 'Проекция собственной доминантной частоты — передовые техники управления состояниями сознания через резонанс и ритм.',
    color: colors.domfreq,
  },
];

// ─── Animated Item ────────────────────────────────────────────

const ITEM_DELAY = 80; // ms between each item appearing

function HighlightItem({
  item,
  index,
}: {
  readonly item: SystemHighlight;
  readonly index: number;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    const delay = index * ITEM_DELAY;
    opacity.value = withDelay(delay, withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) }));
  }, [index, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.highlightCard, animatedStyle]}>
      <View style={[styles.iconBadge, { backgroundColor: `${item.color}25` }]}>
        <Ionicons name={item.icon as any} size={20} color={item.color} />
      </View>
      <View style={styles.highlightContent}>
        <Text style={[styles.highlightName, { color: item.color }]}>{item.name}</Text>
        <Text style={styles.highlightDesc}>{item.description}</Text>
      </View>
    </Animated.View>
  );
}

// ─── Main Section ─────────────────────────────────────────────

export function AboutSection() {
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(16);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) });
    headerTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) });
  }, [headerOpacity, headerTranslateY]);

  const headerAnimated = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Title block */}
      <Animated.View style={[styles.titleBlock, headerAnimated]}>
        <View style={styles.titleBadge}>
          <Ionicons name="compass-outline" size={18} color={colors.accent.primary} />
        </View>
        <View style={styles.titleTextWrap}>
          <Text style={styles.titleText}>Что это такое?</Text>
          <Text style={styles.subtitleText}>
            Шесть проверенных систем работы с сознанием и телом, собранные в одно пространство для ежедневной трансформации.
          </Text>
        </View>
      </Animated.View>

      {/* Highlights list */}
      <View style={styles.highlightsList}>
        {HIGHLIGHTS.map((item, i) => (
          <HighlightItem key={item.name} item={item} index={i} />
        ))}
      </View>

      {/* Bottom accent line */}
      <View style={styles.accentLine}>
        <LinearGradient
          colors={[colors.accent.primary + '00', colors.accent.primary, colors.accent.primary + '00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.accentGradient}
        />
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  titleBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  titleBadge: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: `${colors.accent.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  titleTextWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  titleText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xl,
    lineHeight: typography.lineHeights.xl,
    color: colors.text.primary,
  },
  subtitleText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: 20,
    color: colors.text.secondary,
  },
  highlightsList: {
    gap: spacing.sm,
  },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  highlightContent: {
    flex: 1,
    gap: 4,
  },
  highlightName: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
  },
  highlightDesc: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: 19,
    color: colors.text.secondary,
  },
  accentLine: {
    height: 2,
    marginTop: spacing.lg,
    borderRadius: 1,
    overflow: 'hidden',
  },
  accentGradient: {
    flex: 1,
    height: '100%',
  },
});
