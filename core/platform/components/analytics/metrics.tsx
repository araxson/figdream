import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardMetrics } from "../../dal/analytics-types";
import {
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";

interface AnalyticsMetricsProps {
  metrics: DashboardMetrics;
  role: "admin" | "owner" | "staff";
}

export function AnalyticsMetrics({ metrics, role }: AnalyticsMetricsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  const metricCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(metrics.revenue.total),
      change: metrics.revenue.growth,
      icon: DollarSign,
    },
    {
      title: "Total Appointments",
      value: metrics.appointments.total.toString(),
      subtitle: `${metrics.appointments.completed} completed`,
      icon: Calendar,
    },
    {
      title: "Total Customers",
      value: metrics.customers.total.toString(),
      subtitle: `${metrics.customers.new} new this period`,
      icon: Users,
    },
    {
      title: "Staff Utilization",
      value: `${metrics.staff.utilization.toFixed(1)}%`,
      subtitle: `${metrics.staff.total} staff members`,
      icon: Activity,
    },
  ];

  if (role === "staff") {
    metricCards.splice(2, 1);
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metricCards.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            {metric.change !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                {metric.change > 0 ? (
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm text-muted-foreground">
                  {formatPercent(metric.change)} from last period
                </span>
              </div>
            )}
            {metric.subtitle && (
              <p className="text-xs text-muted-foreground mt-1">
                {metric.subtitle}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}