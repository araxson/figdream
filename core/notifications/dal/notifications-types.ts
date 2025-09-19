/**
 * Notifications Types - Based on actual database schema
 *
 * Using actual communication.notifications table structure
 */

// Base type from actual database schema (communication.notifications)
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  action_url?: string;
  action_label?: string;
  entity_type?: string;
  entity_id?: string;
  priority?: string;
  category?: string;
  is_read: boolean;
  read_at?: string;
  is_archived: boolean;
  archived_at?: string;
  channels?: string[];
  data: Record<string, any>; // jsonb
  metadata: Record<string, any>; // jsonb
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export type NotificationInsert = Omit<Notification, "id" | "created_at" | "updated_at">;

export interface SendNotificationParams {
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  entityType?: string;
  entityId?: string;
  priority?: string;
  category?: string;
  channels?: string[];
  data?: Record<string, any>;
  metadata?: Record<string, any>;
  expiresAt?: string;
}
export type NotificationUpdate = Partial<Omit<NotificationInsert, "user_id">>;

export interface NotificationFilters {
  user_id?: string;
  type?: string;
  category?: string;
  priority?: string;
  is_read?: boolean;
  is_archived?: boolean;
  entity_type?: string;
  entity_id?: string;
  limit?: number;
  offset?: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
}

// Legacy aliases for backward compatibility
export type NotificationType = string;
export type NotificationPriority = string;
export type NotificationChannel = string;

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  categories?: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferencesUpdate {
  email_enabled?: boolean;
  sms_enabled?: boolean;
  push_enabled?: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  categories?: Record<string, boolean>;
}