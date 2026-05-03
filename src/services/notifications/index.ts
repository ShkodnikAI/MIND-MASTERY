/**
 * @file Notifications service barrel export.
 *
 * Public API for the notification subsystem.
 * Import from `@/services/notifications` — never from individual files.
 */

// Permission & setup
export { requestNotificationPermission, setupNotificationChannels } from './scheduler';

// Scheduling — legacy daily reminders
export {
  scheduleDailyReminders,
  cancelAllDailyReminders,
  scheduleStreakWarning,
  cancelStreakWarnings,
  notifyAchievement,
  notifyStreakMilestone,
  rescheduleAllNotifications,
} from './scheduler';

// Scheduling — user-created reminders
export {
  scheduleUserReminder,
  cancelUserReminder,
  scheduleAllUserReminders,
  cancelAllUserReminders,
} from './scheduler';

// Handler registration
export { registerNotificationHandlers, clearBadge, getBadgeCount } from './handler';
export type { NotificationTapHandler } from './handler';

// Messages
export {
  getDailyReminderMessage,
  getStreakWarningMessage,
  getAchievementMessage,
  getStreakMilestoneMessage,
  getReminderMessage,
} from './messages';
export type { AchievementMessage } from './messages';
