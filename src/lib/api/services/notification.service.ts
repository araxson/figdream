import { BaseService, ServiceResponse } from '@/lib/api/services/base.service'
import { Database } from '@/types/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

type Tables = Database['public']['Tables']
type Notification = Tables['notifications']['Row']
type NotificationInsert = Tables['notifications']['Insert']
type NotificationSettings = Tables['notification_settings']['Row']

export interface NotificationWithSettings extends Notification {
  notification_settings?: NotificationSettings
}

export interface NotificationFilters {
  user_id?: string
  is_read?: boolean
  type?: Database['public']['Enums']['notification_type']
  priority?: 'low' | 'medium' | 'high'
  created_from?: string
  created_to?: string
}

export class NotificationService extends BaseService<'notifications'> {
  constructor(supabase: SupabaseClient<Database>) {
    super('notifications', supabase)
  }

  async getUserNotifications(
    user_id: string,
    filters: NotificationFilters = {}
  ): Promise<ServiceResponse<Notification[]>> {
    try {
      let query = this.supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })

      if (filters.is_read !== undefined) {
        query = query.eq('is_read', filters.is_read)
      }

      if (filters.type) {
        query = query.eq('type', filters.type)
      }

      if (filters.priority) {
        query = query.eq('priority', filters.priority)
      }

      if (filters.created_from) {
        query = query.gte('created_at', filters.created_from)
      }

      if (filters.created_to) {
        query = query.lte('created_at', filters.created_to)
      }

      const { data, error } = await query

      if (error) throw error

      return {
        data: data as Notification[],
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async getUnreadCount(user_id: string): Promise<ServiceResponse<number>> {
    return this.count({ user_id, is_read: false })
  }

  async markAsRead(
    notification_id: string
  ): Promise<ServiceResponse<Notification>> {
    return this.update(notification_id, {
      is_read: true,
      read_at: new Date().toISOString()
    })
  }

  async markAllAsRead(user_id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', user_id)
        .eq('is_read', false)

      if (error) throw error

      return {
        data: true,
        error: null
      }
    } catch (error) {
      return {
        data: false,
        error: error as Error
      }
    }
  }

  async sendNotification(
    notification: NotificationInsert
  ): Promise<ServiceResponse<Notification>> {
    try {
      const { data: settings } = await this.supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', notification.user_id)
        .single()

      if (settings) {
        const typeKey = `${notification.type}_enabled` as keyof NotificationSettings
        if (settings[typeKey] === false) {
          return {
            data: null,
            error: new Error('User has disabled this notification type')
          }
        }
      }

      return this.create(notification)
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async bulkSendNotifications(
    notifications: NotificationInsert[]
  ): Promise<ServiceResponse<Notification[]>> {
    try {
      const validNotifications: NotificationInsert[] = []

      for (const notification of notifications) {
        const { data: settings } = await this.supabase
          .from('notification_settings')
          .select('*')
          .eq('user_id', notification.user_id)
          .single()

        if (settings) {
          const typeKey = `${notification.type}_enabled` as keyof NotificationSettings
          
          if (settings[typeKey] !== false) {
            validNotifications.push(notification)
          }
        } else {
          validNotifications.push(notification)
        }
      }

      if (validNotifications.length === 0) {
        return {
          data: [],
          error: null
        }
      }

      return this.bulkCreate(validNotifications)
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async getNotificationSettings(
    user_id: string
  ): Promise<ServiceResponse<NotificationSettings>> {
    try {
      const { data, error } = await this.supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user_id)
        .single()

      if (error && error.code === 'PGRST116') {
        const defaultSettings = {
          user_id,
          is_email_appointments_enabled: true,
          is_email_reminders_enabled: true,
          is_email_marketing_enabled: false,
          is_sms_appointments_enabled: true,
          is_sms_reminders_enabled: true,
          is_sms_marketing_enabled: false,
          is_push_appointments_enabled: true,
          is_push_reminders_enabled: true,
          is_push_marketing_enabled: false,
          reminder_hours_before: 24
        }

        const { data: created, error: createError } = await this.supabase
          .from('notification_settings')
          .insert(defaultSettings)
          .select()
          .single()

        if (createError) throw createError

        return {
          data: created,
          error: null
        }
      }

      if (error) throw error

      return {
        data,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async updateNotificationSettings(
    user_id: string,
    settings: Partial<NotificationSettings>
  ): Promise<ServiceResponse<NotificationSettings>> {
    try {
      const { data, error } = await this.supabase
        .from('notification_settings')
        .update(settings)
        .eq('user_id', user_id)
        .select()
        .single()

      if (error) throw error

      return {
        data,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async deleteOldNotifications(
    daysToKeep: number = 30
  ): Promise<ServiceResponse<boolean>> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const { error } = await this.supabase
        .from('notifications')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .eq('is_read', true)

      if (error) throw error

      return {
        data: true,
        error: null
      }
    } catch (error) {
      return {
        data: false,
        error: error as Error
      }
    }
  }

  subscribeToUserNotifications(
    user_id: string,
    callback: (notification: Notification) => void
  ) {
    return this.subscribeToChanges(
      (payload) => {
        if ((payload.new as Record<string, unknown>)?.user_id === user_id) {
          callback(payload.new as Notification)
        }
      },
      ['INSERT']
    )
  }
}