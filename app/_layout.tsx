/**
 * @file Root Layout — MIND MASTERY
 *
 * Wraps the entire app in providers (gesture handler, safe area),
 * initializes i18n, hydrates the content store, opens the database,
 * loads fonts, and applies the dark theme.
 */

import { useEffect } from 'react';
import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { View, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { useContentStore } from '@/store/contentStore';
import { initializeDatabase, registerAppStateListener } from '@/db/lifecycle';
import { loadAllTexts } from '@/services/content/textLoader';
import { preloadAudioAssets } from '@/audio/assetResolver';
import { colors } from '@/ui/theme';
import { logger } from '@/utils/logger';

// Initialize i18n — side-effect import
import '@/i18n';

const SPLASH_BG = '#0A0E1A';

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  splashContainer: {
    flex: 1,
    backgroundColor: SPLASH_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  splashLoader: {
    marginTop: 32,
  },
});

export default function RootLayout() {
  const loadPractices = useContentStore((s) => s.loadPractices);

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

        // 3. Hydrate content store — practices (INV-3)
        await loadPractices();
        logger.info('[root]', 'Content store hydrated (practices)');

        // 4. Load practice texts from bundled JSON files
        const texts = loadAllTexts('ru');
        useContentStore.getState().loadTexts(texts);
        logger.info('[root]', `Content store hydrated (${texts.length} texts)`);

        // 5. Pre-load audio assets (music + binaural WAVs)
        await preloadAudioAssets();
        logger.info('[root]', 'Audio assets pre-loaded');
      } catch (error) {
        logger.error('[root]', 'Initialization failed', error);
      }
    }

    init();

    return () => {
      unsubscribe?.();
    };
  }, [loadPractices]);

  // ── Render ─────────────────────────────────────────────────────

  // Show splash screen while fonts load
  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require('../assets/images/splash.png')}
          style={styles.splashLogo}
        />
        <ActivityIndicator size="large" color="#D4A017" style={styles.splashLoader} />
      </View>
    );
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
