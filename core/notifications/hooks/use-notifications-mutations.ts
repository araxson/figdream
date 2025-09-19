import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  archiveNotification,
  deleteNotification,
  updateNotificationPreferences,
  clearExpiredNotifications,
  sendBulkNotifications,
} from "../dal/notifications-mutations";
import type {
  SendNotificationParams,
  NotificationPreferencesUpdate,
} from "../dal/notifications-types";

export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: SendNotificationParams) => createNotification(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "stats"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
      toast.success("Notification sent");
    },
    onError: (error) => {
      toast.error("Failed to send notification");
      console.error(error);
    },
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification", id] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "stats"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
    onError: (error) => {
      toast.error("Failed to mark notification as read");
      console.error(error);
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "stats"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
      toast.success("All notifications marked as read");
    },
    onError: (error) => {
      toast.error("Failed to mark all notifications as read");
      console.error(error);
    },
  });
}

export function useArchiveNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveNotification(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification", id] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "stats"] });
      toast.success("Notification archived");
    },
    onError: (error) => {
      toast.error("Failed to archive notification");
      console.error(error);
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification", id] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "stats"] });
      toast.success("Notification deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete notification");
      console.error(error);
    },
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      preferences,
    }: {
      userId: string;
      preferences: NotificationPreferencesUpdate;
    }) => updateNotificationPreferences(userId, preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      toast.success("Notification preferences updated");
    },
    onError: (error) => {
      toast.error("Failed to update notification preferences");
      console.error(error);
    },
  });
}

export function useClearExpiredNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearExpiredNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "expired"] });
      toast.success("Expired notifications cleared");
    },
    onError: (error) => {
      toast.error("Failed to clear expired notifications");
      console.error(error);
    },
  });
}

export function useSendBulkNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userIds,
      params,
    }: {
      userIds: string[];
      params: Omit<SendNotificationParams, "userId">;
    }) => sendBulkNotifications(userIds, params),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(`Sent ${result.successful} notifications successfully`);
      if (result.failed > 0) {
        toast.error(`Failed to send ${result.failed} notifications`);
      }
    },
    onError: (error) => {
      toast.error("Failed to send bulk notifications");
      console.error(error);
    },
  });
}
