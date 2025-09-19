import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Clock, Star, Package } from "lucide-react";
import { ServiceStats } from "../dal/services-types";
import { formatCurrency, formatDuration } from "@/lib/utils";

interface ServicesStatsProps {
  stats: ServiceStats;
}

export function ServicesStats({ stats }: ServicesStatsProps) {
  const statCards = [
    {
      title: "Total Services",
      value: stats.totalServices,
      subtitle: `${stats.activeServices} active`,
      icon: Package,
    },
    {
      title: "Average Price",
      value: formatCurrency(stats.averagePrice),
      subtitle: "Per service",
      icon: DollarSign,
    },
    {
      title: "Average Duration",
      value: formatDuration(stats.averageDuration),
      subtitle: "Per service",
      icon: Clock,
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue || 0),
      subtitle: `${stats.totalBookings || 0} bookings`,
      icon: Star,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
