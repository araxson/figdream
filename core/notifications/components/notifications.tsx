import { Suspense } from "react";
import {
  getNotifications,
  getNotificationStats,
} from "../dal/notifications-queries";
import type { NotificationFilters } from "../dal/notifications-types";
import { NotificationsHeader } from "./header";
import { NotificationsList } from "./list";
import { NotificationsStats } from "./stats";
import { LoadingState } from "@/core/ui/components";

interface NotificationsManagementProps {
  role: "admin" | "owner" | "staff" | "customer";
  filters?: NotificationFilters;
}

export async function NotificationsManagement({
  role,
  filters = {},
}: NotificationsManagementProps) {
  const [notifications, stats] = await Promise.all([
    getNotifications(filters),
    getNotificationStats(filters.user_id || "placeholder-user"),
  ]);

  return (
    <div className="space-y-6">
      <NotificationsHeader role={role} stats={stats} />

      <Suspense fallback={<LoadingState />}>
        <NotificationsStats stats={stats} />
      </Suspense>

      <Suspense fallback={<LoadingState />}>
        <NotificationsList notifications={notifications} role={role} />
      </Suspense>
    </div>
  );
}
