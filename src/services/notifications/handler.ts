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
export function registerNotificationHandlers(onTap?: NotificationTapHandler): () => void {
  // Listener 1: Notification received while app is in foreground
  const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
    logger.info('[notifications]', 'Foreground notification received', {
      title: notification.request.content.title,
    });
  });

  // Listener 2: User taps on a notification
  const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
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

    // Default deep-link behaviour based on notification ID prefix and data
    handleDeepLink(identifier, data);
  });

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

/** Valid system IDs for deep linking. */
const VALID_SYSTEM_IDS = ['transurfing', 'silva', 'dispenza', 'feldenkrais', 'breath'] as const;

/**
 * Route notification taps to the appropriate screen.
 *
 * Deep-link routes:
 *  - User reminder (uremind_) → navigate to linked practice/system/home
 *  - Legacy daily reminder (legacy_remind_) → navigate to home tab
 *  - Streak warning (streak_) → navigate to home tab
 *  - Achievement (achieve_) → navigate to the relevant system tab
 *  - Default → navigate to home
 */
function handleDeepLink(identifier: string, data: Record<string, string>): void {
  try {
    // ── User-created reminder ──────────────────────────────────
    if (identifier.startsWith('uremind_')) {
      const linkedType = data.linkedType; // 'none' | 'system' | 'practice'
      const linkedId = data.linkedId;

      if (linkedType === 'practice' && linkedId) {
        // Navigate to the practice detail screen
        router.replace(`/practice/${linkedId}`);
      } else if (
        linkedType === 'system' &&
        linkedId &&
        VALID_SYSTEM_IDS.includes(linkedId as (typeof VALID_SYSTEM_IDS)[number])
      ) {
        // Navigate to the system tab
        router.replace(`/(tabs)/${linkedId}`);
      } else {
        // No link or generic → navigate to home
        router.replace('/(tabs)');
      }
      return;
    }

    // ── Legacy daily reminder ──────────────────────────────────
    if (identifier.startsWith('legacy_remind_')) {
      router.replace('/(tabs)');
      return;
    }

    // ── Streak warning ─────────────────────────────────────────
    if (identifier.startsWith('streak_')) {
      router.replace('/(tabs)');
      return;
    }

    // ── Achievement ────────────────────────────────────────────
    if (identifier.startsWith('achieve_')) {
      const systemId = data.systemId;
      if (systemId && VALID_SYSTEM_IDS.includes(systemId as (typeof VALID_SYSTEM_IDS)[number])) {
        router.replace(`/(tabs)/${systemId}`);
      } else {
        router.replace('/(tabs)');
      }
      return;
    }

    // ── Default ────────────────────────────────────────────────
    router.replace('/(tabs)');
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
