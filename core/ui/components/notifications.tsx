"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Check,
  X,
  Info,
  AlertTriangle,
  CheckCircle,
  Calendar,
  User,
  DollarSign,
  MessageSquare,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Notification types
export type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "appointment"
  | "payment"
  | "message";
export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

// Notification item component
interface NotificationItemProps {
  notification: Notification;
  onRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onAction?: (notification: Notification) => void;
}

export function NotificationItem({
  notification,
  onRead,
  onDismiss,
  onAction,
}: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case "info":
        return Info;
      case "success":
        return CheckCircle;
      case "warning":
        return AlertTriangle;
      case "error":
        return X;
      case "appointment":
        return Calendar;
      case "payment":
        return DollarSign;
      case "message":
        return MessageSquare;
      default:
        return Bell;
    }
  };

  const getIconColor = () => {
    switch (notification.type) {
      case "success":
        return "text-primary";
      case "warning":
        return "text-muted-foreground";
      case "error":
        return "text-destructive";
      case "appointment":
        return "text-primary";
      case "payment":
        return "text-primary";
      default:
        return "text-muted-foreground";
    }
  };

  const Icon = getIcon();

  return (
    <div
      className={`flex gap-3 p-3 border-b last:border-0 ${
        !notification.read ? "bg-accent/50" : ""
      }`}
    >
      <div className={`mt-1 ${getIconColor()}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium">{notification.title}</p>
            <p className="text-sm text-muted-foreground">
              {notification.message}
            </p>
          </div>
          {notification.priority === "urgent" && (
            <Badge variant="destructive" className="ml-2">
              Urgent
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
          </span>
          {notification.actionUrl && (
            <Button
              size="sm"
              variant="link"
              className="h-auto p-0 text-xs"
              onClick={() => onAction?.(notification)}
            >
              {notification.actionLabel || "View"}
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {!notification.read && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => onRead?.(notification.id)}
          >
            <Check className="h-3 w-3" />
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={() => onDismiss?.(notification.id)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

// Notifications panel component
interface NotificationsPanelProps {
  notifications: Notification[];
  onRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onAction?: (notification: Notification) => void;
  onMarkAllRead?: () => void;
  onClearAll?: () => void;
}

export function NotificationsPanel({
  notifications,
  onRead,
  onDismiss,
  onAction,
  onMarkAllRead,
  onClearAll,
}: NotificationsPanelProps) {
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount}</Badge>
            )}
          </CardTitle>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button size="sm" variant="ghost" onClick={onMarkAllRead}>
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button size="sm" variant="ghost" onClick={onClearAll}>
                Clear all
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as "all" | "unread")}
        >
          <TabsList className="w-full rounded-none">
            <TabsTrigger value="all" className="flex-1">
              All
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex-1">
              Unread ({unreadCount})
            </TabsTrigger>
          </TabsList>
          <TabsContent value={filter} className="m-0">
            <ScrollArea className="h-[400px]">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    {filter === "unread"
                      ? "No unread notifications"
                      : "No notifications yet"}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={onRead}
                    onDismiss={onDismiss}
                    onAction={onAction}
                  />
                ))
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Notification bell with badge
interface NotificationBellProps {
  count: number;
  onClick?: () => void;
}

export function NotificationBell({ count, onClick }: NotificationBellProps) {
  return (
    <Button variant="ghost" size="icon" className="relative" onClick={onClick}>
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <Badge
          variant="destructive"
          className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
        >
          <span className="text-xs">{count > 99 ? "99+" : count}</span>
        </Badge>
      )}
    </Button>
  );
}

// Inline notification banner
interface NotificationBannerProps {
  type: "info" | "success" | "warning" | "error";
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  className?: string;
}

export function NotificationBanner({
  type,
  title,
  message,
  action,
  onDismiss,
  className,
}: NotificationBannerProps) {
  const config = {
    info: {
      icon: Info,
      className: "bg-primary/5 border-primary/20 text-foreground",
    },
    success: {
      icon: CheckCircle,
      className: "bg-primary/5 border-primary/20 text-foreground",
    },
    warning: {
      icon: AlertTriangle,
      className: "bg-muted border-border text-foreground",
    },
    error: {
      icon: X,
      className: "bg-destructive/5 border-destructive/20 text-foreground",
    },
  };

  const { icon: Icon, className: typeClassName } = config[type];

  return (
    <div className={`border rounded-lg p-4 ${typeClassName} ${className}`}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium">{title}</p>
          {message && <p className="text-sm mt-1 opacity-90">{message}</p>}
          {action && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 mt-2 font-medium"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
