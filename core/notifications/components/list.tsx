"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  Calendar,
  CreditCard,
  Star,
  AlertCircle,
  Info,
  Gift,
  MessageSquare,
  Check,
  Archive,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type {
  Notification,
  NotificationType,
} from "../dal/notifications-types";

interface NotificationsListProps {
  notifications: Notification[];
  role: "admin" | "owner" | "staff" | "customer";
}

export function NotificationsList({
  notifications,
  role,
}: NotificationsListProps) {
  const getNotificationIcon = (type: NotificationType) => {
    const icons: Record<NotificationType, any> = {
      appointment: Calendar,
      appointment_reminder: Calendar,
      appointment_confirmation: Calendar,
      appointment_cancellation: Calendar,
      appointment_rescheduled: Calendar,
      appointment_no_show: Calendar,
      promotion: Gift,
      system: AlertCircle,
      review_request: Star,
      staff_message: MessageSquare,
      general: Bell,
      payment_receipt: CreditCard,
      loyalty_update: Gift,
      birthday_greeting: Gift,
      reminder: Bell,
    };
    return icons[type] || Bell;
  };

  const getPriorityVariant = (
    priority: string,
  ): "destructive" | "default" | "secondary" | "outline" => {
    const variants = {
      urgent: "destructive" as const,
      high: "default" as const,
      normal: "secondary" as const,
      low: "outline" as const,
    };
    return variants[priority as keyof typeof variants] || "secondary";
  };

  const getTypeVariant = (
    type: NotificationType,
  ): "default" | "secondary" | "outline" | "destructive" => {
    if (type.includes("appointment")) return "default";
    if (type.includes("payment")) return "outline";
    if (type.includes("promotion") || type.includes("loyalty"))
      return "secondary";
    if (type === "system") return "outline";
    if (type === "review_request") return "default";
    return "secondary";
  };

  if (notifications.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-muted p-4">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">No notifications</h3>
            <p className="text-sm text-muted-foreground">
              You&apos;re all caught up! Check back later for updates.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-2">
        {notifications.map((notification) => {
          const Icon = getNotificationIcon(
            notification.type as NotificationType,
          );
          const priorityVariant = getPriorityVariant(
            notification.priority || "normal",
          );
          const typeVariant = getTypeVariant(
            notification.type as NotificationType,
          );

          return (
            <Card
              key={notification.id}
              className={
                !notification.is_read ? "border-l-4 border-l-primary" : ""
              }
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div
                      className={`rounded-full p-2 ${!notification.is_read ? "bg-primary/10" : "bg-muted"}`}
                    >
                      <Icon
                        className={`h-5 w-5 ${!notification.is_read ? "text-primary" : "text-muted-foreground"}`}
                      />
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`font-medium ${!notification.is_read ? "font-semibold" : ""}`}
                          >
                            {notification.title}
                          </h4>
                          {!notification.is_read && (
                            <Badge
                              variant="destructive"
                              className="h-2 w-2 rounded-full p-0"
                            />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={typeVariant}>
                          {notification.type?.replace(/_/g, " ")}
                        </Badge>
                        {notification.priority === "urgent" && (
                          <Badge variant="destructive">Urgent</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(
                          new Date(notification.created_at),
                          { addSuffix: true },
                        )}
                      </span>

                      <div className="flex gap-1">
                        {notification.action_url && (
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            {notification.action_label || "View"}
                          </Button>
                        )}
                        {!notification.is_read && (
                          <Button variant="ghost" size="sm">
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Archive className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}
