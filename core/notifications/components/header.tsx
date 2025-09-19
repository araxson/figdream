"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Settings, Archive, CheckCheck, Filter } from "lucide-react";
import type { NotificationStats } from "../dal/notifications-types";

interface NotificationsHeaderProps {
  role: "admin" | "owner" | "staff" | "customer";
  stats: NotificationStats;
}

export function NotificationsHeader({
  role,
  stats,
}: NotificationsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Bell className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            {stats.unread > 0 ? (
              <span>
                You have{" "}
                <Badge variant="destructive" className="ml-1 mr-1">
                  {stats.unread}
                </Badge>{" "}
                unread notifications
              </span>
            ) : (
              "All caught up!"
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>All Notifications</DropdownMenuItem>
            <DropdownMenuItem>Appointments</DropdownMenuItem>
            <DropdownMenuItem>Promotions</DropdownMenuItem>
            <DropdownMenuItem>System</DropdownMenuItem>
            <DropdownMenuItem>Reviews</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Unread Only</DropdownMenuItem>
            <DropdownMenuItem>Read Only</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm">
          <CheckCheck className="mr-2 h-4 w-4" />
          Mark All Read
        </Button>

        <Button variant="outline" size="sm">
          <Archive className="mr-2 h-4 w-4" />
          Archive All
        </Button>

        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>
    </div>
  );
}
