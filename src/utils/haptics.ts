/**
 * Haptic feedback wrappers around expo-haptics.
 * Provides a central place for all haptic calls in the app.
 */

import * as Haptics from 'expo-haptics';
import { logger } from '@/utils/logger';

/** Light haptic tap — suitable for simple selections */
export async function hapticLight(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    logger.warn('[haptics]', 'Light haptic failed', error);
  }
}

/** Medium haptic tap — suitable for button presses */
export async function hapticMedium(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    logger.warn('[haptics]', 'Medium haptic failed', error);
  }
}

/** Heavy haptic tap — suitable for important actions */
export async function hapticHeavy(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    logger.warn('[haptics]', 'Heavy haptic failed', error);
  }
}

/** Notification haptic — suitable for success/completion */
export async function hapticNotification(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    logger.warn('[haptics]', 'Notification haptic failed', error);
  }
}

/** Phase-change haptic — medium impact for practice phase transitions */
export async function hapticPhaseChange(phase: string): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    logger.debug('[haptics]', `Phase change: ${phase}`);
  } catch (error) {
    logger.warn('[haptics]', `Phase change haptic failed for "${phase}"`, error);
  }
}
