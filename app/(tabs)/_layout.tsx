/**
 * @file Tabs Layout — Bottom tab navigator for the 5 practice systems.
 *
 * Each tab has its own brand colour. The active tab indicator uses the
 * system's signature colour while inactive tabs are grey.
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
] as const;

// Find active tab color from config
function getTabColor(routeName: string | undefined): string {
  if (!routeName) return colors.accent.primary;
  const tab = TABS.find((t) => t.name === routeName);
  return tab?.color ?? colors.accent.primary;
}

// ─── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.tabBar,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: Platform.select({ ios: 88, android: 68, default: 68 }),
    paddingTop: spacing.sm,
    paddingBottom: Platform.select({ ios: 28, default: 8 }),
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

            return (
              <Ionicons
                name={iconName}
                size={focused ? size + 2 : size}
                color={color}
              />
            );
          },
          sceneStyle: {
            backgroundColor: colors.background.primary,
          },
        };
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{ title: tab.title }}
        />
      ))}
    </Tabs>
  );
}
