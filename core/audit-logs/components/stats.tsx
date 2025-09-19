import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { AuditStats } from "../dal/audit-logs-types";
import { Activity, AlertTriangle, Users, Shield } from "lucide-react";

interface AuditLogsStatsProps {
  stats: AuditStats;
  incidents: number;
}

export function AuditLogsStats({ stats, incidents }: AuditLogsStatsProps) {
  const successRate = 100 - stats.failureRate;

  const getSeverityVariant = (
    severity: string,
  ): "destructive" | "outline" | "secondary" | "default" => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "error":
        return "destructive";
      case "warning":
        return "outline";
      case "info":
        return "secondary";
      case "debug":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalEvents.toLocaleString()}
          </div>
          <div className="mt-2">
            <Progress value={successRate} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {successRate.toFixed(1)}% success rate
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Security Incidents
          </CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{incidents}</div>
          {incidents > 0 ? (
            <p className="text-xs text-destructive mt-1">
              Unresolved incidents require attention
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">
              No active incidents
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Failure Rate</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.failureRate.toFixed(1)}%
          </div>
          <div className="flex items-center gap-2 mt-1">
            {stats.failureRate > 5 ? (
              <Badge variant="destructive" className="text-xs">
                High
              </Badge>
            ) : stats.failureRate > 2 ? (
              <Badge variant="outline" className="text-xs">
                Moderate
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                Low
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.topUsers.length}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Users with recent activity
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Events by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(stats.eventsByCategory)
              .slice(0, 5)
              .map(([category, count]) => (
                <div
                  key={category}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {category.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Events by Severity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(stats.eventsBySeverity).map(([severity, count]) => {
              return (
                <div
                  key={severity}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityVariant(severity)}>
                      {severity.toUpperCase()}
                    </Badge>
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
