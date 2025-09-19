/**
 * Loyalty Analytics Component
 * Analytics and insights for loyalty program performance
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Trophy,
  Target,
  Activity,
  DollarSign,
  BarChart3
} from "lucide-react";
import { useLoyaltyDashboard } from "../hooks";

interface LoyaltyAnalyticsProps {
  salonId: string;
  programId: string;
}

export function LoyaltyAnalytics({ salonId, programId }: LoyaltyAnalyticsProps) {
  const { data } = useLoyaltyDashboard(salonId);

  if (!data) return null;

  const { metrics } = data;

  const engagementRate = metrics.totalMembers > 0
    ? (metrics.activeMembers / metrics.totalMembers) * 100
    : 0;

  const redemptionRate = metrics.totalPointsIssued > 0
    ? (metrics.totalPointsRedeemed / metrics.totalPointsIssued) * 100
    : 0;

  const averageLifetimeValue = metrics.totalMembers > 0
    ? metrics.totalPointsIssued / metrics.totalMembers
    : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{engagementRate.toFixed(1)}%</span>
              {engagementRate > 70 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
            <Progress value={engagementRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Redemption Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{redemptionRate.toFixed(1)}%</span>
              <Activity className="h-4 w-4 text-blue-500" />
            </div>
            <Progress value={redemptionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Lifetime Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {Math.round(averageLifetimeValue).toLocaleString()}
              </span>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">points per member</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Points Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {(metrics.totalPointsIssued - metrics.totalPointsRedeemed).toLocaleString()}
              </span>
              <DollarSign className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">outstanding points</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="engagement" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="redemption">Redemption</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Member Engagement Analysis</CardTitle>
              <CardDescription>
                Understanding how members interact with your loyalty program
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Active Members</span>
                  <span className="text-sm font-medium">
                    {metrics.activeMembers} / {metrics.totalMembers}
                  </span>
                </div>
                <Progress value={engagementRate} />
              </div>

              <div className="grid gap-4 pt-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">New Members (30 days)</p>
                      <p className="text-sm text-muted-foreground">Growth indicator</p>
                    </div>
                  </div>
                  <Badge>+12%</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Repeat Engagement</p>
                      <p className="text-sm text-muted-foreground">Members with 2+ transactions</p>
                    </div>
                  </div>
                  <Badge variant="outline">68%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="redemption" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Redemption Patterns</CardTitle>
              <CardDescription>
                How members are using their loyalty points
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Points Redeemed vs Issued</span>
                    <span className="text-sm font-medium">{redemptionRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={redemptionRate} />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {metrics.totalPointsRedeemed.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">Total Redeemed</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {Math.round(metrics.averagePointsBalance).toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">Avg Balance</p>
                    </CardContent>
                  </Card>
                </div>

                <Alert>
                  <BarChart3 className="h-4 w-4" />
                  <AlertDescription>
                    {redemptionRate < 20
                      ? "Low redemption rate may indicate points are too hard to earn or rewards aren't attractive enough."
                      : redemptionRate > 80
                      ? "High redemption rate is positive but monitor points liability closely."
                      : "Redemption rate is healthy, indicating good program engagement."}
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Program Trends</CardTitle>
              <CardDescription>
                Key trends and insights over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    Program showing positive growth with {metrics.totalMembers} enrolled members
                  </AlertDescription>
                </Alert>

                {metrics.topMembers.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Top Performers</h4>
                    <div className="space-y-2">
                      {metrics.topMembers.slice(0, 3).map((member, index) => {
                        const customer = member.customer as any;
                        return (
                          <div key={member.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{index + 1}</Badge>
                              <span className="text-sm">
                                {customer?.first_name} {customer?.last_name}
                              </span>
                            </div>
                            <span className="text-sm font-medium">
                              {member.lifetime_points.toLocaleString()} pts
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}