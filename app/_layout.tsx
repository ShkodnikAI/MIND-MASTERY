/**
 * @file Root Layout — MIND MASTERY
 *
 * Wraps the entire app in providers (gesture handler, safe area),
 * initializes i18n, hydrates the content store, opens the database,
 * loads fonts, sets up notifications, and applies the dark theme.
 */

import { useEffect } from 'react';
import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import { useContentStore } from '@/store/contentStore';
import { loadAllTexts } from '@/services/content/textLoader';
import { initializeDatabase, registerAppStateListener } from '@/db/lifecycle';
import { setupNotificationChannels, registerNotificationHandlers } from '@/services/notifications';
import { colors } from '@/ui/theme';
import { logger } from '@/utils/logger';

// Initialize i18n — side-effect import
import '@/i18n';

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
});

export default function RootLayout() {
  const loadPractices = useContentStore((s) => s.loadPractices);
  const loadTexts = useContentStore((s) => s.loadTexts);

  // ── Font loading ───────────────────────────────────────────────
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
  });

  // ── App initialization (runs once) ─────────────────────────────
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function init() {
      try {
        // 1. Initialize SQLite database and run migrations
        await initializeDatabase();
        logger.info('[root]', 'Database initialized');

        // 2. Register app-state listener for WAL checkpoint on background
        unsubscribe = registerAppStateListener();
        logger.info('[root]', 'App-state listener registered');

        // 3. Hydrate content store — registers systems + practices (INV-3)
        await loadPractices();
        logger.info('[root]', 'Practices loaded');

        // 4. Load text content from bundled JSON files (INV-3)
        const texts = loadAllTexts('ru');
        loadTexts(texts);
        logger.info('[root]', `Loaded ${texts.length} practice texts`);

        // 5. Set up notification channels (Android)
        await setupNotificationChannels();
        logger.info('[root]', 'Notification channels configured');
      } catch (error) {
        logger.error('[root]', 'Initialization failed', error);
      }
    }

    init();

    return () => {
      unsubscribe?.();
    };
  }, [loadPractices]);

  // ── Notification handler registration (runs once) ──────────────
  useEffect(() => {
    const cleanup = registerNotificationHandlers();
    return () => {
      cleanup();
    };
  }, []);

  // ── Render ─────────────────────────────────────────────────────

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider style={styles.root}>
        <LinearGradient
          colors={[colors.background.primary, colors.background.secondary]}
          style={styles.gradient}
        >
          <Slot />
        </LinearGradient>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
