/**
 * Loyalty Dashboard Component
 * Overview and metrics for loyalty program
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, TrendingUp, Users, Trophy, Gift } from "lucide-react";
import { useLoyaltyDashboard } from "../hooks";

interface LoyaltyDashboardProps {
  salonId: string;
}

export function LoyaltyDashboard({ salonId }: LoyaltyDashboardProps) {
  const { data, isLoading, error } = useLoyaltyDashboard(salonId);

  if (isLoading) return <DashboardSkeleton />;
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load dashboard: {error.message}
        </AlertDescription>
      </Alert>
    );
  }
  if (!data) return null;

  const { program, metrics } = data;

  if (!program) {
    return (
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          No loyalty program configured yet.
        </AlertDescription>
      </Alert>
    );
  }

  const redemptionRate = metrics.totalPointsIssued > 0
    ? (metrics.totalPointsRedeemed / metrics.totalPointsIssued) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Program Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{program.name}</CardTitle>
              {program.description && (
                <CardDescription>{program.description}</CardDescription>
              )}
            </div>
            <Badge variant={program.is_active ? "default" : "secondary"}>
              {program.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Points per dollar</p>
              <p className="text-2xl font-bold">{program.points_per_dollar || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Redemption rate</p>
              <p className="text-2xl font-bold">{program.redemption_rate || 0}¢</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activeMembers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Issued</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalPointsIssued.toLocaleString()}
            </div>
            <Progress value={redemptionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Redeemed</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalPointsRedeemed.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {redemptionRate.toFixed(1)}% redemption rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Balance</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(metrics.averagePointsBalance)}
            </div>
            <p className="text-xs text-muted-foreground">points per member</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Members */}
      {metrics.topMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Members</CardTitle>
            <CardDescription>
              Members with the highest lifetime points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.topMembers.map((member, index) => {
                const customer = member.customer as any;
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">
                          {customer?.first_name} {customer?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {customer?.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {member.lifetime_points.toLocaleString()} pts
                      </p>
                      {member.tier_level && (
                        <Badge variant="outline">{member.tier_level}</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}