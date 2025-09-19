"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity } from "lucide-react";
import type { ActivitySectionProps } from "../profile-utils/profile-types";
import { formatDateTime } from "../profile-utils/profile-helpers";

export function ActivitySection({ userActivity }: ActivitySectionProps) {
  if (userActivity.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            User actions and access history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No recent activity
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          User actions and access history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {userActivity.map((activity, i) => (
            <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0">
              <div className="p-2 bg-muted rounded-full">
                <Activity className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{activity.action}</div>
                    {activity.resource && (
                      <div className="text-sm text-muted-foreground">
                        {activity.resource}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDateTime(activity.timestamp)}
                  </div>
                </div>
                {activity.ip_address && (
                  <div className="text-xs text-muted-foreground mt-1">
                    IP: {activity.ip_address}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}