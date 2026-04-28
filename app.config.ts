import type { ExpoConfig } from 'expo/config';

/**
 * MIND MASTERY — Expo Configuration
 * Canonical v2.3 Final
 *
 * Platform: Android (API 26+), iOS (15+)
 * Distribution: Family use (sideload / TestFlight)
 * Offline: 100%
 */
export default (): ExpoConfig => ({
  name: 'Mind Mastery',
  slug: 'mindmastery',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0A0E1A',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.mindmastery.app',
    buildNumber: '1',
    infoPlist: {
      UIBackgroundModes: ['audio', 'fetch'],
      NSMicrophoneUsageDescription: null,
      minimumOSVersion: '15.0',
    },
    privacyManifests: {
      NSPrivacyAccessedAPITypes: [],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#0A0E1A',
    },
    package: 'com.mindmastery.app',
    versionCode: 1,
    permissions: [
      'FOREGROUND_SERVICE',
      'FOREGROUND_SERVICE_MEDIA_PLAYBACK',
      'POST_NOTIFICATIONS',
      'SCHEDULE_EXACT_ALARM',
      'USE_EXACT_ALARM',
      'WAKE_LOCK',
      'RECEIVE_BOOT_COMPLETED',
      'ACCESS_NOTIFICATION_POLICY',
    ],
    // minSdkVersion: 26, // Set in eas.json instead
  },
  web: {},
  scheme: 'mindmastery',
  plugins: [
    'expo-router',
    [
      'expo-audio',
      {
        backgroundPlaybackEnabled: true,
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/images/notification-icon.png',
        color: '#6C5CE7',
      },
    ],
    [
      'expo-sqlite',
      {
        enableFTS: true,
      },
    ],
    'expo-keep-awake',
    'expo-brightness',
    'expo-haptics',
    'expo-localization',
  ],
  updates: {
    url: 'https://u.expo.dev/mindmastery',
    enabled: false, // MVP: offline-only, enable later via OTA
  },
  extra: {
    eas: {
      projectId: '3ec24a8a-9f3c-4a37-89a7-f767ba425df6',
    },
  },
});
