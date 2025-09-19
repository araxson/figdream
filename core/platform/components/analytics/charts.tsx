"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import type {
  PerformanceMetrics,
  AnalyticsFilters,
} from "../dal/analytics-types";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

interface AnalyticsChartsProps {
  metrics: PerformanceMetrics;
  _filters: AnalyticsFilters;
  role: "admin" | "owner" | "staff";
}

export function AnalyticsCharts({
  metrics,
  _filters,
  role,
}: AnalyticsChartsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="revenue" className="space-y-4">
            <TabsList>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              {role !== "staff" && (
                <TabsTrigger value="customers">Customers</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="revenue" className="space-y-4">
              <ChartContainer
                config={{
                  value: {
                    label: "Revenue",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[350px]"
              >
                <AreaChart data={metrics.trends.revenue}>
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={formatCurrency} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) =>
                          typeof value === "number"
                            ? formatCurrency(value)
                            : value
                        }
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-value)"
                    fill="var(--color-value)"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ChartContainer>
            </TabsContent>

            <TabsContent value="appointments" className="space-y-4">
              <ChartContainer
                config={{
                  value: {
                    label: "Appointments",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[350px]"
              >
                <LineChart data={metrics.trends.appointments}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-value)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ChartContainer>
            </TabsContent>

            {role !== "staff" && (
              <TabsContent value="customers" className="space-y-4">
                <ChartContainer
                  config={{
                    value: {
                      label: "New Customers",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-[350px]"
                >
                  <BarChart data={metrics.trends.newCustomers}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="var(--color-value)" />
                  </BarChart>
                </ChartContainer>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Period Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Revenue</span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(metrics.comparisons.previousPeriod.revenue)}
                  </span>
                </div>
                <Progress
                  value={
                    (metrics.kpis.revenue /
                      (metrics.kpis.revenue +
                        metrics.comparisons.previousPeriod.revenue)) *
                    100
                  }
                  className="mt-2"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Appointments</span>
                  <span className="text-sm text-muted-foreground">
                    {metrics.comparisons.previousPeriod.appointments}
                  </span>
                </div>
                <Progress
                  value={
                    (metrics.kpis.appointments /
                      (metrics.kpis.appointments +
                        metrics.comparisons.previousPeriod.appointments)) *
                    100
                  }
                  className="mt-2"
                />
              </div>

              {role !== "staff" && (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Customers</span>
                    <span className="text-sm text-muted-foreground">
                      {metrics.comparisons.previousPeriod.customers}
                    </span>
                  </div>
                  <Progress
                    value={metrics.comparisons.previousPeriod.customers}
                    className="mt-2"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Revenue</span>
                <span className="text-2xl font-bold">
                  {formatCurrency(metrics.kpis.revenue)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Appointments</span>
                <span className="text-2xl font-bold">
                  {metrics.kpis.appointments}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Customer Satisfaction
                </span>
                <span className="text-2xl font-bold">
                  {metrics.kpis.customerSatisfaction}/5
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Efficiency Rate</span>
                <span className="text-2xl font-bold">
                  {metrics.kpis.efficiency.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
