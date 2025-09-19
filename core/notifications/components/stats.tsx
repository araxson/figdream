import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { NotificationStats } from "../dal/notifications-types";
import { Bell, AlertCircle, Info, CheckCircle } from "lucide-react";

interface NotificationsStatsProps {
  stats: NotificationStats;
}

export function NotificationsStats({ stats }: NotificationsStatsProps) {
  const priorityIcons = {
    urgent: AlertCircle,
    high: AlertCircle,
    normal: Bell,
    low: Info,
  };

  const priorityVariants = {
    urgent: "destructive",
    high: "secondary",
    normal: "default",
    low: "outline",
  } as const;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Notifications
          </CardTitle>
          <Bell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">{stats.unread} unread</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unread</CardTitle>
          <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-sm font-bold text-destructive">
              {stats.unread}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.total > 0
              ? Math.round((stats.unread / stats.total) * 100)
              : 0}
            %
          </div>
          <p className="text-xs text-muted-foreground">
            of total notifications
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">By Priority</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(stats.by_priority || {}).map(([priority, count]) => {
              const Icon =
                priorityIcons[priority as keyof typeof priorityIcons] || Bell;
              const variant =
                priorityVariants[priority as keyof typeof priorityVariants] ||
                "outline";

              return (
                <div
                  key={priority}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant={variant} className="p-1">
                      <Icon className="h-3 w-3" />
                    </Badge>
                    <span className="text-sm capitalize">{priority}</span>
                  </div>
                  <Badge variant="secondary">{count as number}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Today</span>
              <span className="font-medium">
                {Object.values(stats.by_type || {}).reduce(
                  (sum, count) => (sum as number) + (count as number),
                  0,
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">This Week</span>
              <span className="font-medium">{stats.total}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
