'use server'

/**
 * Notifications Server Actions - Public API
 *
 * All server actions for managing notifications in the application
 */

// Send notifications
export {
  sendNotification,
  sendBulkNotifications
} from './send-notification'

// Update notifications
export {
  markAsRead,
  markAllNotificationsAsRead,
  archiveNotification,
  archiveAllNotifications
} from './update-notification'

// Delete notifications
export {
  deleteNotificationAction,
  bulkDeleteNotificationsAction
} from './delete-notification'

// Query notifications
export {
  fetchNotifications,
  getUnreadNotificationCount,
  getNotificationStatistics
} from './notification-queries'

// Notification preferences
export {
  fetchNotificationPreferences,
  updatePreferences
} from './notification-preferences'

// Type exports
export type {
  ActionResponse
} from './notification-types'

export {
  SendNotificationSchema,
  NotificationFiltersSchema,
  NotificationPreferencesSchema
} from './notification-types'