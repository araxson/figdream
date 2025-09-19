import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Star, TrendingUp, Users } from "lucide-react";
import type { SalonWithRelations } from "../types";

interface SalonsStatsProps {
  salons: SalonWithRelations[];
}

export function SalonsStats({ salons }: SalonsStatsProps) {
  // Calculate stats
  const activeSalons = salons.filter((s) => s.is_active);
  const verifiedSalons = salons.filter((s) => s.is_verified);
  const featuredSalons = salons.filter((s) => s.is_featured);
  const acceptingBookings = salons.filter((s) => s.is_accepting_bookings);

  const totalRevenue = salons.reduce(
    (sum, s) => sum + (Number(s.total_revenue) || 0),
    0,
  );
  const totalBookings = salons.reduce(
    (sum, s) => sum + (s.total_bookings || 0),
    0,
  );
  const averageRating =
    salons.length > 0
      ? salons.reduce((sum, s) => sum + (Number(s.rating_average) || 0), 0) /
        salons.length
      : 0;

  const stats = [
    {
      title: "Active Salons",
      value: activeSalons.length,
      icon: Building,
      description: `${verifiedSalons.length} verified`,
    },
    {
      title: "Featured",
      value: featuredSalons.length,
      icon: Star,
      description: `${acceptingBookings.length} accepting bookings`,
    },
    {
      title: "Total Bookings",
      value: totalBookings.toLocaleString(),
      icon: Users,
      description: "All time",
    },
    {
      title: "Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
      description: `${averageRating.toFixed(1)}★ avg rating`,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
