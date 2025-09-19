"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, AlertCircle, Users } from "lucide-react";
import { useBillingStats } from "../hooks/use-billing";

interface BillingStatsProps {
  salonId: string;
}

export function BillingStats({ salonId }: BillingStatsProps) {
  const { data: stats, isLoading } = useBillingStats(salonId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.total_revenue),
      icon: DollarSign,
      description: "All time revenue",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(stats.monthly_revenue),
      icon: TrendingUp,
      description: "Current month",
    },
    {
      title: "Failed Payments",
      value: stats.failed_payments.toString(),
      icon: AlertCircle,
      description: "Requires attention",
    },
    {
      title: "Active Subscriptions",
      value: stats.active_subscriptions.toString(),
      icon: Users,
      description: `${formatPercentage(stats.churn_rate)} churn rate`,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
