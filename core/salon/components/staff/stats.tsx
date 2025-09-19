import { Users, UserCheck, Star, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StaffProfileWithRelations } from "../../dal/staff-types";

interface StaffStatsProps {
  stats: {
    total: number;
    active: number;
    bookable: number;
    featured: number;
    topPerformer: StaffProfileWithRelations | null;
  };
}

export function StaffStats({ stats }: StaffStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            {stats.active} active members
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bookable</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.bookable}</div>
          <p className="text-xs text-muted-foreground">
            Available for appointments
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Featured</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.featured}</div>
          <p className="text-xs text-muted-foreground">
            Highlighted staff members
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.topPerformer?.user?.display_name || "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.topPerformer
              ? `${stats.topPerformer.rating_average?.toFixed(1) || 0}★ • ${stats.topPerformer.total_appointments || 0} appointments`
              : "No data available"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
