"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { AnalyticsFilters } from "../dal/analytics-types";
import { useQuery } from "@tanstack/react-query";
import {
  getCustomerInsightsAction,
  getRevenueAnalyticsAction,
} from "../actions/analytics-actions";
import { TrendingUp, Users, DollarSign, Clock } from "lucide-react";

interface AnalyticsInsightsProps {
  filters: AnalyticsFilters;
}

export function AnalyticsInsights({ filters }: AnalyticsInsightsProps) {
  const { data: customerInsights } = useQuery({
    queryKey: ["customer-insights", filters],
    queryFn: () => getCustomerInsightsAction(filters),
  });

  const { data: revenueAnalytics } = useQuery({
    queryKey: ["revenue-analytics", filters],
    queryFn: () => getRevenueAnalyticsAction(filters),
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!customerInsights || !revenueAnalytics) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Segments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customerInsights.segments.map((segment) => (
                <div key={segment.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{segment.name}</span>
                      <Badge
                        variant={segment.growth > 0 ? "default" : "secondary"}
                      >
                        {segment.growth > 0 ? "+" : ""}
                        {segment.growth}%
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {segment.count} customers
                    </span>
                  </div>
                  <Progress
                    value={
                      (segment.value /
                        customerInsights.segments.reduce(
                          (sum, s) => sum + s.value,
                          0,
                        )) *
                      100
                    }
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Value: {formatCurrency(segment.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Gross Revenue</span>
                <span className="text-lg font-bold">
                  {formatCurrency(revenueAnalytics.gross)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Net Revenue</span>
                <span className="text-lg font-bold">
                  {formatCurrency(revenueAnalytics.net)}
                </span>
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="text-sm font-medium mb-2">
                  Top Revenue Sources
                </div>
                {revenueAnalytics.byService
                  .slice(0, 3)
                  .map((service, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {service.service}
                      </span>
                      <span>{formatCurrency(service.amount)}</span>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Booking Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h4 className="text-sm font-medium mb-2">Peak Days</h4>
              <div className="space-y-1">
                {Object.entries(customerInsights.behavior.bookingPatterns)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([day, count]) => (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="capitalize">{day}</span>
                      <Badge variant="secondary">{count}%</Badge>
                    </div>
                  ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Preferred Times</h4>
              <div className="space-y-1">
                {customerInsights.behavior.preferredTimes
                  .slice(0, 3)
                  .map((time) => (
                    <div key={time} className="text-sm">
                      <Badge variant="outline">{time}</Badge>
                    </div>
                  ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Customer Lifetime</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Avg Value</span>
                  <span className="font-medium">
                    {formatCurrency(customerInsights.lifetime.averageValue)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Avg Visits</span>
                  <span className="font-medium">
                    {customerInsights.lifetime.averageVisits}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Churn Rate</span>
                  <span className="font-medium">
                    {customerInsights.lifetime.churnRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Projections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatCurrency(revenueAnalytics.projections.daily)}
              </div>
              <div className="text-sm text-muted-foreground">Daily</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatCurrency(revenueAnalytics.projections.weekly)}
              </div>
              <div className="text-sm text-muted-foreground">Weekly</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatCurrency(revenueAnalytics.projections.monthly)}
              </div>
              <div className="text-sm text-muted-foreground">Monthly</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatCurrency(revenueAnalytics.projections.quarterly)}
              </div>
              <div className="text-sm text-muted-foreground">Quarterly</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
