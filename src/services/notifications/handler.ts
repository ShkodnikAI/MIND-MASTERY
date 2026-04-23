/**
 * @file Notification handler — processes notification taps and responses.
 *
 * Registers listeners for:
 *  - Notification received while app is foregrounded (show in-app alert).
 *  - Notification tapped (deep-link to specific screen).
 *  - Notification response (user interacted with the notification).
 *
 * Must be initialised once at app startup (from _layout.tsx).
 * Returns a cleanup function to remove listeners on unmount.
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { logger } from '@/utils/logger';

// ---------------------------------------------------------------------------
// Behaviour configuration
// ---------------------------------------------------------------------------

/**
 * Configure how notifications behave when the app is in the foreground.
 * Shows a subtle in-app notification banner.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ---------------------------------------------------------------------------
// Listener types
// ---------------------------------------------------------------------------

export type NotificationTapHandler = (data: Record<string, string>) => void;

// ---------------------------------------------------------------------------
// Handler registration
// ---------------------------------------------------------------------------

/**
 * Register notification listeners.
 * Call once at app startup and store the returned cleanup function.
 *
 * @param onTap - Optional callback for notification taps (e.g. deep linking).
 * @returns Cleanup function that removes all listeners.
 */
export function registerNotificationHandlers(
  onTap?: NotificationTapHandler,
): () => void {
  // Listener 1: Notification received while app is in foreground
  const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
    logger.info('[notifications]', 'Foreground notification received', {
      title: notification.request.content.title,
    });
  });

  // Listener 2: User taps on a notification
  const responseSub = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = (response.notification.request.content.data ?? {}) as Record<string, string>;
      const identifier = response.notification.request.identifier;
      const title = response.notification.request.content.title;

      logger.info('[notifications]', 'Notification tapped', {
        identifier,
        title,
        data,
      });

      // Execute custom tap handler if provided
      if (onTap) {
        onTap(data);
      }

      // Default deep-link behaviour based on notification ID prefix
      handleDeepLink(identifier, data);
    },
  );

  // Return cleanup function
  return () => {
    receivedSub.remove();
    responseSub.remove();
    logger.debug('[notifications]', 'Listeners removed');
  };
}

// ---------------------------------------------------------------------------
// Deep-link routing
// ---------------------------------------------------------------------------

/**
 * Route notification taps to the appropriate screen.
 *
 * Deep-link routes:
 *  - Daily reminder → navigate to home tab
 *  - Streak warning → navigate to home tab
 *  - Achievement → navigate to the relevant system tab
 */
function handleDeepLink(identifier: string, data: Record<string, string>): void {
  try {
    if (identifier.startsWith('remind_') || identifier.startsWith('streak_')) {
      // Navigate to home
      router.replace('/(tabs)');
    } else if (identifier.startsWith('achieve_')) {
      // Navigate to the specific system tab if systemId is in data
      const systemId = data.systemId;
      if (systemId && ['transurfing', 'silva', 'dispenza', 'feldenkrais', 'breath'].includes(systemId)) {
        router.replace(`/(tabs)/${systemId}`);
      } else {
        router.replace('/(tabs)');
      }
    } else {
      // Default: navigate to home
      router.replace('/(tabs)');
    }
  } catch (err) {
    logger.warn('[notifications]', 'Deep-link navigation failed', err);
  }
}

// ---------------------------------------------------------------------------
// Badge management (iOS)
// ---------------------------------------------------------------------------

/**
 * Clear the app badge count.
 * Call after the user reads all pending notifications.
 */
export async function clearBadge(): Promise<void> {
  if (Platform.OS === 'ios') {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (err) {
      logger.warn('[notifications]', 'Failed to clear badge', err);
    }
  }
}

/**
 * Get the current badge count.
 */
export async function getBadgeCount(): Promise<number> {
  if (Platform.OS === 'ios') {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch {
      return 0;
    }
  }
  return 0;
}
