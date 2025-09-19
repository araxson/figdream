"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Download,
} from "lucide-react";

interface RevenueData {
  date: string;
  revenue: number;
  subscription_revenue: number;
  one_time_revenue: number;
  refunded_amount: number;
  transaction_count: number;
}

interface RevenueAnalyticsProps {
  data: RevenueData[];
  period: "7d" | "30d" | "90d" | "1y";
  onPeriodChange: (period: "7d" | "30d" | "90d" | "1y") => void;
  onExport: () => void;
  isLoading?: boolean;
}

export function RevenueAnalytics({
  data,
  period,
  onPeriodChange,
  onExport,
  isLoading = false,
}: RevenueAnalyticsProps) {
  const [chartType, setChartType] = useState<"line" | "bar" | "area">("area");

  // Calculate summary metrics
  const metrics = useMemo(() => {
    if (!data.length) return null;

    const currentPeriodRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
    const subscriptionRevenue = data.reduce((sum, d) => sum + d.subscription_revenue, 0);
    const oneTimeRevenue = data.reduce((sum, d) => sum + d.one_time_revenue, 0);
    const totalRefunds = data.reduce((sum, d) => sum + d.refunded_amount, 0);
    const totalTransactions = data.reduce((sum, d) => sum + d.transaction_count, 0);

    // Calculate previous period for comparison (assuming equal period length)
    const periodLength = data.length;
    const previousPeriodStart = Math.max(0, data.length - periodLength * 2);
    const previousPeriodData = data.slice(previousPeriodStart, data.length - periodLength);
    const previousPeriodRevenue = previousPeriodData.reduce((sum, d) => sum + d.revenue, 0);

    const revenueGrowth = previousPeriodRevenue > 0
      ? ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100
      : 0;

    const averageTransactionValue = totalTransactions > 0 ? currentPeriodRevenue / totalTransactions : 0;

    return {
      totalRevenue: currentPeriodRevenue,
      subscriptionRevenue,
      oneTimeRevenue,
      totalRefunds,
      totalTransactions,
      revenueGrowth,
      averageTransactionValue,
      netRevenue: currentPeriodRevenue - totalRefunds,
    };
  }, [data]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  const chartData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  // Revenue breakdown for pie chart
  const revenueBreakdown = metrics ? [
    { name: "Subscriptions", value: metrics.subscriptionRevenue, color: "#8884d8" },
    { name: "One-time", value: metrics.oneTimeRevenue, color: "#82ca9d" },
  ].filter(item => item.value > 0) : [];

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value: number) => [formatCurrency(value), "Revenue"]} />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        );
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value: number) => [formatCurrency(value), "Revenue"]} />
            <Bar dataKey="revenue" fill="#8884d8" />
          </BarChart>
        );
      case "area":
      default:
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value: number) => [formatCurrency(value)]} />
            <Area
              type="monotone"
              dataKey="subscription_revenue"
              stackId="1"
              stroke="#8884d8"
              fill="#8884d8"
              name="Subscriptions"
            />
            <Area
              type="monotone"
              dataKey="one_time_revenue"
              stackId="1"
              stroke="#82ca9d"
              fill="#82ca9d"
              name="One-time"
            />
          </AreaChart>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-20 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-muted-foreground">
            No revenue data available for the selected period.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={chartType} onValueChange={(value: "line" | "bar" | "area") => setChartType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="area">Area Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {metrics.revenueGrowth > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={metrics.revenueGrowth > 0 ? "text-green-600" : "text-red-600"}>
                {formatPercentage(metrics.revenueGrowth)}
              </span>
              <span>from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.netRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              After {formatCurrency(metrics.totalRefunds)} refunds
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.averageTransactionValue)}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalTransactions} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recurring Revenue</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.subscriptionRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {((metrics.subscriptionRevenue / metrics.totalRevenue) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {renderChart()}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueBreakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={revenueBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {revenueBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {revenueBreakdown.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            item.name === "Subscriptions" ? "bg-violet-500" : "bg-emerald-500"
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No revenue data to display
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {metrics.totalRefunds > metrics.totalRevenue * 0.1 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>High Refund Rate:</strong> Refunds account for{' '}
            {((metrics.totalRefunds / metrics.totalRevenue) * 100).toFixed(1)}% of revenue.
            Consider reviewing customer satisfaction.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}