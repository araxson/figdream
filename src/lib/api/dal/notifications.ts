import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';
import { verifySession } from './auth';

type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];


export type NotificationDTO = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  read_at: string | null;
};

/**
 * Get user notifications
 */
export const getUserNotifications = cache(async (): Promise<NotificationDTO[]> => {
  const session = await verifySession();
  if (!session) return [];
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error || !data) return [];
  
  return data.map(notification => ({
    id: notification.id,
    user_id: notification.user_id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    is_read: notification.is_read ?? false,
    data: notification.data as Record<string, unknown> | null,
    created_at: notification.created_at,
    updated_at: notification.updated_at,
    read_at: notification.read_at,
  }));
});

/**
 * Get unread notifications count
 */
export const getUnreadNotificationCount = cache(async (): Promise<number> => {
  const session = await verifySession();
  if (!session) return 0;
  
  const supabase = await createClient();
  
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.user.id)
    .eq('is_read', false);
  
  if (error || !count) return 0;
  
  return count;
});

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  const session = await verifySession();
  if (!session) return false;
  
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', notificationId)
    .eq('user_id', session.user.id);
  
  return !error;
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  const session = await verifySession();
  if (!session) return false;
  
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('user_id', session.user.id)
    .eq('is_read', false);
  
  return !error;
};

/**
 * Create notification (internal use only - should be triggered by backend)
 */
export const createNotification = async (notification: NotificationInsert): Promise<NotificationDTO | null> => {
  const session = await verifySession();
  if (!session || !['admin', 'system'].includes(session.user.role)) return null;
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    user_id: data.user_id,
    title: data.title,
    message: data.message,
    type: data.type,
    is_read: data.is_read ?? false,
    data: data.data as Record<string, unknown> | null,
    created_at: data.created_at,
    updated_at: data.updated_at || data.created_at,
    read_at: data.read_at,
  };
};

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  const session = await verifySession();
  if (!session) return false;
  
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', session.user.id);
  
  return !error;
};