/**
 * @file Tabs Layout — Top tab navigator for the 6 practice systems.
 *
 * Tab bar is positioned at the top. Each tab has its own brand colour.
 *
 * INV-A3: All styles via StyleSheet.create.
 */

import type { ComponentProps } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/ui/theme';

// ─── Tab configuration ──────────────────────────────────────────

interface TabConfig {
  readonly name: string;
  readonly title: string;
  readonly icon: ComponentProps<typeof Ionicons>['name'];
  readonly color: string;
}

const TABS: readonly TabConfig[] = [
  {
    name: 'transurfing',
    title: 'Трансерфинг',
    icon: 'sparkles-outline',
    color: colors.transurfing,
  },
  {
    name: 'silva',
    title: 'Сильва',
    icon: 'leaf-outline',
    color: colors.silva,
  },
  {
    name: 'dispenza',
    title: 'Диспенза',
    icon: 'sunny-outline',
    color: colors.dispenza,
  },
  {
    name: 'feldenkrais',
    title: 'Фельденкрайз',
    icon: 'body-outline',
    color: colors.feldenkrais,
  },
  {
    name: 'breath',
    title: 'Дыхание',
    icon: 'fitness-outline',
    color: colors.breath,
  },
  {
    name: 'domfreq',
    title: 'Частота',
    icon: 'radio-outline',
    color: colors.domfreq,
  },
] as const;

function getTabColor(routeName: string | undefined): string {
  if (!routeName) return colors.accent.primary;
  const tab = TABS.find((t) => t.name === routeName);
  return tab?.color ?? colors.accent.primary;
}

// ─── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.tabBar,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    height: Platform.select({ ios: 50, android: 48, default: 48 }),
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
  },
});

// ─── Component ──────────────────────────────────────────────────

export default function TabsLayout() {
  return (
    <Tabs
      tabBarPosition="top"
      screenOptions={({ route }) => {
        const activeColor = getTabColor(route.name);

        return {
          headerShown: false,
          tabBarActiveTintColor: activeColor,
          tabBarInactiveTintColor: '#4A5568',
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: true,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ color, size, focused }) => {
            const tab = TABS.find((t) => t.name === route.name);
            const iconName = tab?.icon ?? 'ellipse-outline';

            return <Ionicons name={iconName} size={focused ? size + 2 : size} color={color} />;
          },
          sceneStyle: {
            backgroundColor: colors.background.primary,
          },
        };
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.title }} />
      ))}
    </Tabs>
  );
}
