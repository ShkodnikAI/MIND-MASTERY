/**
 * @file Notifications service barrel export.
 *
 * Public API for the notification subsystem.
 * Import from `@/services/notifications` — never from individual files.
 */

// Permission & setup
export { requestNotificationPermission, setupNotificationChannels } from './scheduler';

// Scheduling
export {
  scheduleDailyReminders,
  cancelAllDailyReminders,
  scheduleStreakWarning,
  cancelStreakWarnings,
  notifyAchievement,
  notifyStreakMilestone,
  rescheduleAllNotifications,
} from './scheduler';

// Handler registration
export {
  registerNotificationHandlers,
  clearBadge,
  getBadgeCount,
} from './handler';
export type { NotificationTapHandler } from './handler';

// Messages
export {
  getDailyReminderMessage,
  getStreakWarningMessage,
  getAchievementMessage,
  getStreakMilestoneMessage,
} from './messages';
export type { AchievementMessage } from './messages';
