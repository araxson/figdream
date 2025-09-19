import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import {
  getNotifications,
  getNotificationById,
  getUnreadNotificationCount,
  getNotificationStats,
  getNotificationTemplates,
  getNotificationTemplateByCode,
  getUserNotificationPreferences,
  getRecentNotifications,
  getNotificationsByEntity,
  getExpiredNotifications,
} from "../dal/notifications-queries";
import type { NotificationFilters } from "../dal/notifications-types";

export function useNotifications(filters: NotificationFilters = {}) {
  return useQuery({
    queryKey: ["notifications", filters],
    queryFn: () => getNotifications(filters),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useSuspenseNotifications(filters: NotificationFilters = {}) {
  return useSuspenseQuery({
    queryKey: ["notifications", filters],
    queryFn: () => getNotifications(filters),
  });
}

export function useNotification(id: string) {
  return useQuery({
    queryKey: ["notification", id],
    queryFn: () => getNotificationById(id),
    enabled: !!id,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadNotificationCount,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useNotificationStats(userId?: string) {
  return useQuery({
    queryKey: ["notifications", "stats", userId],
    queryFn: () => getNotificationStats(userId),
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useNotificationTemplates(type?: string) {
  return useQuery({
    queryKey: ["notification-templates", type],
    queryFn: () => getNotificationTemplates(type),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

export function useNotificationTemplate(code: string) {
  return useQuery({
    queryKey: ["notification-template", code],
    queryFn: () => getNotificationTemplateByCode(code),
    enabled: !!code,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ["notification-preferences"],
    queryFn: getUserNotificationPreferences,
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
  });
}

export function useRecentNotifications(limit = 5) {
  return useQuery({
    queryKey: ["notifications", "recent", limit],
    queryFn: () => getRecentNotifications(limit),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useNotificationsByEntity(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ["notifications", "entity", entityType, entityId],
    queryFn: () => getNotificationsByEntity(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
}

export function useExpiredNotifications() {
  return useQuery({
    queryKey: ["notifications", "expired"],
    queryFn: getExpiredNotifications,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
