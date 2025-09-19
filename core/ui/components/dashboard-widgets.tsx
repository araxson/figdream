import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  type LucideIcon,
} from "lucide-react";

// Stat card widget
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
}

export function StatCard({
  title,
  value,
  change,
  changeLabel = "from last period",
  icon: Icon,
  trend,
}: StatCardProps) {
  const getTrendIcon = () => {
    if (trend === "up" || (change && change > 0)) return TrendingUp;
    if (trend === "down" || (change && change < 0)) return TrendingDown;
    return Minus;
  };

  const TrendIcon = getTrendIcon();
  const isPositiveTrend = trend === "up" || (change && change > 0);
  const isNegativeTrend = trend === "down" || (change && change < 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center pt-1">
            <TrendIcon
              className={`h-4 w-4 mr-1 ${
                isPositiveTrend
                  ? "text-primary"
                  : isNegativeTrend
                    ? "text-destructive"
                    : "text-muted-foreground"
              }`}
            />
            <span
              className={`text-xs ${
                isPositiveTrend
                  ? "text-primary"
                  : isNegativeTrend
                    ? "text-destructive"
                    : "text-muted-foreground"
              }`}
            >
              {change > 0 ? "+" : ""}
              {change}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              {changeLabel}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// KPI card with progress
interface KPICardProps {
  title: string;
  value: number;
  target: number;
  unit?: string;
  icon?: LucideIcon;
}

export function KPICard({
  title,
  value,
  target,
  unit = "",
  icon: Icon,
}: KPICardProps) {
  const percentage = Math.min((value / target) * 100, 100);
  const isOnTrack = percentage >= 80;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold">
              {value}
              {unit}
            </span>
            <span className="text-sm text-muted-foreground">
              / {target}
              {unit}
            </span>
          </div>
          <Progress value={percentage} className="h-2" />
          <div className="flex items-center justify-between">
            <Badge variant={isOnTrack ? "default" : "secondary"}>
              {percentage.toFixed(0)}% of target
            </Badge>
            {isOnTrack ? (
              <span className="text-xs text-primary">On track</span>
            ) : (
              <span className="text-xs text-muted-foreground">
                Needs attention
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Activity item for feed
interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target?: string;
  timestamp: Date;
  type?: "default" | "success" | "warning" | "error";
}

interface ActivityFeedProps {
  title?: string;
  activities: ActivityItem[];
  showViewAll?: boolean;
  onViewAll?: () => void;
}

export function ActivityFeed({
  title = "Recent Activity",
  activities,
  showViewAll = false,
  onViewAll,
}: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {showViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View all
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.user.avatar} />
                <AvatarFallback>
                  {activity.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.user.name}</span>{" "}
                  {activity.action}
                  {activity.target && (
                    <span className="font-medium"> {activity.target}</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Intl.RelativeTimeFormat("en", {
                    numeric: "auto",
                  }).format(
                    Math.round(
                      (activity.timestamp.getTime() - Date.now()) / 1000 / 60,
                    ),
                    "minute",
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Quick actions widget
interface QuickAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "default" | "secondary" | "outline";
}

interface QuickActionsProps {
  title?: string;
  actions: QuickAction[];
  columns?: 2 | 3 | 4;
}

export function QuickActions({
  title = "Quick Actions",
  actions,
  columns = 2,
}: QuickActionsProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid ${gridCols[columns]} gap-2`}>
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "outline"}
              className="flex flex-col items-center justify-center h-20 gap-2"
              onClick={action.onClick}
            >
              <action.icon className="h-5 w-5" />
              <span className="text-xs">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Chart placeholder widget
interface ChartWidgetProps {
  title: string;
  description?: string;
  height?: number;
  children?: React.ReactNode;
}

export function ChartWidget({
  title,
  description,
  height = 300,
  children,
}: ChartWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div
          className={`flex items-center justify-center ${height >= 400 ? "min-h-[400px]" : height >= 300 ? "min-h-[300px]" : height >= 200 ? "min-h-[200px]" : "min-h-[150px]"}`}
        >
          {children || (
            <div className="text-center text-muted-foreground">
              <p>Chart placeholder</p>
              <p className="text-xs mt-2">Add chart component here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Performance metric widget
interface PerformanceMetric {
  label: string;
  value: number;
  max: number;
  unit?: string;
  color?: string;
}

interface PerformanceMetricsProps {
  title?: string;
  metrics: PerformanceMetric[];
}

export function PerformanceMetrics({
  title = "Performance",
  metrics,
}: PerformanceMetricsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{metric.label}</span>
                <span className="font-medium">
                  {metric.value}
                  {metric.unit} / {metric.max}
                  {metric.unit}
                </span>
              </div>
              <Progress
                value={(metric.value / metric.max) * 100}
                className="h-2"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Revenue widget with comparison
interface RevenueComparisonProps {
  current: {
    label: string;
    value: number;
  };
  previous: {
    label: string;
    value: number;
  };
  currency?: string;
}

export function RevenueComparison({
  current,
  previous,
  currency = "$",
}: RevenueComparisonProps) {
  const change = ((current.value - previous.value) / previous.value) * 100;
  const isPositive = change >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{current.label}</p>
              <p className="text-2xl font-bold">
                {currency}
                {current.value.toLocaleString()}
              </p>
            </div>
            <div
              className={`flex items-center ${isPositive ? "text-primary" : "text-destructive"}`}
            >
              {isPositive ? <ArrowUpRight /> : <ArrowDownRight />}
              <span className="text-lg font-bold">
                {Math.abs(change).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{previous.label}</span>
              <span>
                {currency}
                {previous.value.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
