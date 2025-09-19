import { Users, UserPlus, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomerMetrics } from "../dal/customers-types";

interface CustomersStatsProps {
  metrics: CustomerMetrics;
}

export function CustomersStats({ metrics }: CustomersStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.total_customers}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.returning_customers} returning
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New This Month</CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.new_customers_this_month}
          </div>
          <p className="text-xs text-muted-foreground">
            +
            {Math.round(
              (metrics.new_customers_this_month /
                Math.max(metrics.total_customers, 1)) *
                100,
            )}
            % of total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Avg Lifetime Value
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${metrics.average_lifetime_value.toFixed(0)}
          </div>
          <p className="text-xs text-muted-foreground">Per customer average</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(
              (metrics.returning_customers /
                Math.max(metrics.total_customers, 1)) *
                100,
            )}
            %
          </div>
          <p className="text-xs text-muted-foreground">Customers returning</p>
        </CardContent>
      </Card>
    </div>
  );
}
