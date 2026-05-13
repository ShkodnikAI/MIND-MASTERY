/**
 * @file About Screen — Detailed description of all practice systems.
 *
 * Shows 6 system cards with descriptions, accessible from the Hub screen.
 * Has a back button to return to the main page.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
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
    description:
      'Снижение важности, управление вниманием и намерение — ключевые инструменты для влияния на жизненные обстоятельства и принятия решений. Метод Вадима Зеланда позволяет осознанно формировать реальность через работу с мыслями и эмоциональным фоном.',
    color: colors.transurfing,
  },
  {
    icon: 'leaf-outline',
    name: 'Метод Сильва',
    description:
      'Вход в альфа-состояние мозга для активации интуиции, решения проблем и программирования сознания на уровне глубокой релаксации. Техники Хосе Сильвы позволяют использовать скрытые резервы мозга для целеполагания и исцеления.',
    color: colors.silva,
  },
  {
    icon: 'sunny-outline',
    name: 'Диспенза',
    description:
      'Медитации исцеления через изменение мозговых волн, работу с эмоциями и перестройку нейронных связей для трансформации тела и жизни. Метод доктора Джо Диспензы основан на нейронауке и квантовой физике.',
    color: colors.dispenza,
  },
  {
    icon: 'body-outline',
    name: 'Фельденкрайз',
    description:
      'Осознание через движение — мягкие упражнения для улучшения координации, снятия напряжения и расширения возможностей тела без усилий. Метод Моше Фельденкрайза реконструирует нейромышечные паттерны через внимание к движению.',
    color: colors.feldenkrais,
  },
  {
    icon: 'fitness-outline',
    name: 'Дыхание',
    description:
      'Управляемые дыхательные паттерны для регуляции нервной системы, снижения стресса, улучшения сна и повышения концентрации. Включает техники 4-7-8, квадратное дыхание, кохерентное дыхание, пранаяаму и другие проверенные методы.',
    color: colors.breath,
  },
  {
    icon: 'radio-outline',
    name: 'Доминантная частота',
    description:
      'Проекция собственной доминантной частоты — передовые техники управления состояниями сознания через резонанс и ритм. Позволяет осознанно входить в нужное состояние и проецировать его на жизненные ситуации.',
    color: colors.domfreq,
  },
];

// ─── Animated Item ────────────────────────────────────────────

const ITEM_DELAY = 80;

function HighlightCard({
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
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) }),
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) }),
    );
  }, [index, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      {/* Color accent bar */}
      <View style={[styles.accentBar, { backgroundColor: item.color }]} />

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBadge, { backgroundColor: `${item.color}20` }]}>
            <Ionicons name={item.icon as any} size={22} color={item.color} />
          </View>
          <Text style={[styles.cardName, { color: item.color }]}>{item.name}</Text>
        </View>
        <Text style={styles.cardDesc}>{item.description}</Text>
      </View>
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────

export default function AboutScreen() {
  const router = useRouter();

  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(16);

  useEffect(() => {
    headerOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.quad),
    });
    headerTranslateY.value = withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.quad),
    });
  }, [headerOpacity, headerTranslateY]);

  const headerAnimated = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header with back button */}
        <Animated.View style={[styles.headerRow, headerAnimated]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
            accessibilityLabel="Назад"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={28} color={colors.accent.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Что это такое?</Text>
            <Text style={styles.headerSubtitle}>
              Шесть проверенных систем работы с сознанием и телом, собранные в одно
              пространство для ежедневной трансформации.
            </Text>
          </View>
        </Animated.View>

        {/* Scrollable list */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardsList}>
            {HIGHLIGHTS.map((item, i) => (
              <HighlightCard key={item.name} item={item} index={i} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  headerTitleWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xxl,
    lineHeight: typography.lineHeights.xxl,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: 20,
    color: colors.text.secondary,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  cardsList: {
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  accentBar: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardName: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.lg,
    lineHeight: typography.lineHeights.lg,
  },
  cardDesc: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    lineHeight: 20,
    color: colors.text.secondary,
  },
});
