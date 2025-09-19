"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, AlertCircle, CheckCircle } from "lucide-react";

interface UsersDashboardStatsProps {
  stats: {
    total_users: number;
    active_users: number;
    new_users_week: number;
    pending_verifications: number;
  } | null;
}

export function UsersDashboardStats({ stats }: UsersDashboardStatsProps) {
  if (!stats) return null;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_users}</div>
          <p className="text-xs text-muted-foreground">
            +{stats.new_users_week} this week
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.active_users}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((stats.active_users / stats.total_users) * 100)}% of total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New This Week</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.new_users_week}</div>
          <p className="text-xs text-muted-foreground">
            Weekly growth
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pending_verifications}</div>
          <p className="text-xs text-muted-foreground">
            Require attention
          </p>
        </CardContent>
      </Card>
    </div>
  );
}