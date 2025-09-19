/**
 * User Feedback Helpers
 * Consistent success, error, and info messaging
 */

import { toast } from 'sonner';

/**
 * Success feedback with consistent messaging
 */
export const successFeedback = {
  // Appointment actions
  appointmentConfirmed: () => toast.success('Appointment confirmed successfully'),
  appointmentCompleted: () => toast.success('Appointment marked as completed'),
  appointmentCancelled: () => toast.success('Appointment cancelled'),
  appointmentRescheduled: () => toast.success('Appointment rescheduled successfully'),
  appointmentCreated: () => toast.success('New appointment created'),
  appointmentCheckedIn: () => toast.success('Customer checked in'),

  // Customer actions
  customerCreated: () => toast.success('Customer profile created'),
  customerUpdated: () => toast.success('Customer information updated'),
  customerAddedToVIP: () => toast.success('Customer added to VIP'),
  customerDeleted: () => toast.success('Customer profile deleted'),
  customerNoteAdded: () => toast.success('Note added to customer'),

  // Service actions
  serviceCreated: () => toast.success('Service added successfully'),
  serviceUpdated: () => toast.success('Service details updated'),
  serviceDeleted: () => toast.success('Service removed'),
  serviceActivated: () => toast.success('Service activated'),
  serviceDeactivated: () => toast.success('Service deactivated'),

  // Staff actions
  staffAdded: () => toast.success('Staff member added'),
  staffUpdated: () => toast.success('Staff profile updated'),
  staffScheduleUpdated: () => toast.success('Schedule updated successfully'),
  staffRoleChanged: () => toast.success('Staff role changed'),
  staffDeactivated: () => toast.success('Staff member deactivated'),

  // Settings actions
  settingsSaved: () => toast.success('Settings saved successfully'),
  passwordChanged: () => toast.success('Password updated successfully'),
  profileUpdated: () => toast.success('Profile updated'),
  notificationsSaved: () => toast.success('Notification preferences saved'),

  // Generic actions
  saved: () => toast.success('Changes saved successfully'),
  deleted: () => toast.success('Item deleted'),
  updated: () => toast.success('Updated successfully'),
  created: () => toast.success('Created successfully'),
  sent: () => toast.success('Sent successfully'),
  copied: () => toast.success('Copied to clipboard'),
};

/**
 * Error feedback with consistent messaging
 */
export const errorFeedback = {
  // Generic errors
  generic: () => toast.error('Something went wrong. Please try again.'),
  networkError: () => toast.error('Network error. Please check your connection.'),
  unauthorized: () => toast.error('You are not authorized to perform this action'),
  notFound: () => toast.error('The requested item was not found'),
  validation: (field?: string) =>
    toast.error(field ? `Invalid ${field}` : 'Please check your input'),

  // Specific errors
  appointmentConflict: () => toast.error('This time slot is no longer available'),
  insufficientBalance: () => toast.error('Insufficient balance for this action'),
  duplicateEntry: () => toast.error('This item already exists'),
  quotaExceeded: () => toast.error('You have exceeded your quota'),
  sessionExpired: () => toast.error('Your session has expired. Please login again.'),
};

/**
 * Info feedback for neutral notifications
 */
export const infoFeedback = {
  loading: (action: string) => toast.info(`${action}...`),
  processing: () => toast.info('Processing your request...'),
  syncing: () => toast.info('Syncing data...'),
  redirecting: () => toast.info('Redirecting...'),
  newFeature: (feature: string) => toast.info(`New feature: ${feature} is now available!`),
  reminder: (message: string) => toast.info(`Reminder: ${message}`),
};

/**
 * Warning feedback for cautionary messages
 */
export const warningFeedback = {
  unsavedChanges: () => toast.warning('You have unsaved changes'),
  confirmDelete: () => toast.warning('This action cannot be undone'),
  limitReached: (limit: string) => toast.warning(`You have reached the ${limit} limit`),
  deprecation: (feature: string) =>
    toast.warning(`${feature} will be deprecated soon`),
  maintenanceMode: () => toast.warning('System is in maintenance mode'),
};