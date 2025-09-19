import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  changeLabel?: string;
  target?: number;
  current?: number;
  icon?: LucideIcon;
  format?: "number" | "currency" | "percentage";
  trend?: number[]; // Array of values for sparkline
}

export const MetricCard = memo(function MetricCard({
  title,
  value,
  previousValue,
  change,
  changeType,
  changeLabel = "vs last period",
  target,
  current,
  icon: Icon,
  format = "number",
  trend,
}: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === "string") return val;

    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      case "percentage":
        return `${val}%`;
      default:
        return val.toLocaleString();
    }
  };

  const getTrendIcon = () => {
    if (changeType === "increase" || (change && change > 0)) return TrendingUp;
    if (changeType === "decrease" || (change && change < 0))
      return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    const isPositive = changeType === "increase" || (change && change > 0);
    const isNegative = changeType === "decrease" || (change && change < 0);

    // For some metrics, decrease is good (like costs, churn rate)
    // This should be configurable based on metric type
    if (isPositive) return "text-primary";
    if (isNegative) return "text-destructive";
    return "text-muted-foreground";
  };

  const TrendIcon = getTrendIcon();
  const progressPercentage = target && current ? (current / target) * 100 : 0;

  // Mini sparkline component
  const Sparkline = ({ data }: { data: number[] }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 80;
    const height = 30;

    const points = data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <svg width={width} height={height} className="ml-auto">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary"
        />
      </svg>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {trend && trend.length > 1 && <Sparkline data={trend} />}
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold">{formatValue(value)}</div>
            {previousValue && (
              <div className="text-sm text-muted-foreground">
                from {formatValue(previousValue)}
              </div>
            )}
          </div>

          {change !== undefined && (
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 ${getTrendColor()}`}>
                <TrendIcon className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {change > 0 ? "+" : ""}
                  {change}%
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {changeLabel}
              </span>
            </div>
          )}

          {target && current !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Progress to target
                </span>
                <span className="font-medium">
                  {formatValue(current)} / {formatValue(target)}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex items-center justify-between">
                <Badge
                  variant={progressPercentage >= 100 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {progressPercentage.toFixed(0)}% achieved
                </Badge>
                {progressPercentage >= 75 && progressPercentage < 100 && (
                  <span className="text-xs text-muted-foreground">
                    Almost there!
                  </span>
                )}
                {progressPercentage >= 100 && (
                  <span className="text-xs text-primary">Target met!</span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
