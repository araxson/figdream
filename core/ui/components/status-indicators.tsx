import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Circle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Wifi,
  WifiOff,
  type LucideIcon,
} from "lucide-react";

// Status dot indicator
interface StatusDotProps {
  status: "online" | "offline" | "busy" | "away" | "idle";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  pulse?: boolean;
}

export function StatusDot({
  status,
  size = "md",
  showLabel = false,
  pulse = false,
}: StatusDotProps) {
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  const statusConfig = {
    online: { color: "bg-primary", label: "Online" },
    offline: { color: "bg-muted", label: "Offline" },
    busy: { color: "bg-destructive", label: "Busy" },
    away: { color: "bg-muted-foreground", label: "Away" },
    idle: { color: "bg-muted-foreground", label: "Idle" },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Circle
          className={`${sizeClasses[size]} ${config.color} rounded-full fill-current`}
        />
        {pulse && status === "online" && (
          <Circle
            className={`${sizeClasses[size]} ${config.color} rounded-full fill-current absolute inset-0 animate-ping`}
          />
        )}
      </div>
      {showLabel && (
        <span className="text-sm text-muted-foreground">{config.label}</span>
      )}
    </div>
  );
}

// Connection status indicator
interface ConnectionStatusProps {
  isConnected: boolean;
  showLabel?: boolean;
  quality?: "excellent" | "good" | "fair" | "poor";
}

export function ConnectionStatus({
  isConnected,
  showLabel = true,
  quality,
}: ConnectionStatusProps) {
  const getQualityColor = () => {
    if (!isConnected) return "text-gray-400";
    switch (quality) {
      case "excellent":
        return "text-primary";
      case "good":
        return "text-primary";
      case "fair":
        return "text-muted-foreground";
      case "poor":
        return "text-destructive";
      default:
        return "text-gray-500";
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className={`h-4 w-4 ${getQualityColor()}`} />
            ) : (
              <WifiOff className="h-4 w-4 text-muted-foreground" />
            )}
            {showLabel && (
              <span className="text-sm text-muted-foreground">
                {isConnected
                  ? `Connected${quality ? ` (${quality})` : ""}`
                  : "Disconnected"}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isConnected ? "Connection active" : "No connection"}</p>
          {quality && <p className="text-xs">Quality: {quality}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Processing state indicator
interface ProcessingIndicatorProps {
  state: "idle" | "processing" | "success" | "error";
  message?: string;
  showIcon?: boolean;
}

export function ProcessingIndicator({
  state,
  message,
  showIcon = true,
}: ProcessingIndicatorProps) {
  const config = {
    idle: {
      icon: Clock,
      color: "text-muted-foreground",
      defaultMessage: "Ready",
    },
    processing: {
      icon: Clock,
      color: "text-primary",
      defaultMessage: "Processing...",
      animate: true,
    },
    success: {
      icon: CheckCircle,
      color: "text-primary",
      defaultMessage: "Completed",
    },
    error: {
      icon: XCircle,
      color: "text-destructive",
      defaultMessage: "Failed",
    },
  };

  const {
    icon: Icon,
    color,
    defaultMessage,
    animate = false,
  } = config[state] as {
    icon: LucideIcon;
    color: string;
    defaultMessage: string;
    animate?: boolean;
  };

  return (
    <div className={`flex items-center gap-2 ${color}`}>
      {showIcon && (
        <Icon className={`h-4 w-4 ${animate ? "animate-spin" : ""}`} />
      )}
      <span className="text-sm">{message || defaultMessage}</span>
    </div>
  );
}

// System status banner
interface SystemStatusProps {
  status: "operational" | "degraded" | "partial" | "major" | "maintenance";
  message?: string;
  showDetails?: boolean;
  onDetailsClick?: () => void;
}

export function SystemStatus({
  status,
  message,
  showDetails = false,
  onDetailsClick,
}: SystemStatusProps) {
  const statusConfig = {
    operational: {
      variant: "default" as const,
      icon: CheckCircle,
      title: "All Systems Operational",
      color: "border-primary/20 bg-primary/5",
    },
    degraded: {
      variant: "default" as const,
      icon: AlertCircle,
      title: "Degraded Performance",
      color: "border-muted-foreground/20 bg-muted",
    },
    partial: {
      variant: "default" as const,
      icon: AlertCircle,
      title: "Partial System Outage",
      color: "border-muted-foreground/20 bg-muted",
    },
    major: {
      variant: "destructive" as const,
      icon: XCircle,
      title: "Major System Outage",
      color: "border-destructive/20 bg-destructive/5",
    },
    maintenance: {
      variant: "default" as const,
      icon: Clock,
      title: "Scheduled Maintenance",
      color: "border-primary/20 bg-primary/5",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  if (status === "operational" && !message) {
    return null; // Don't show banner when everything is fine unless there's a message
  }

  return (
    <Alert className={`${config.color} border`}>
      <Icon className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{config.title}</p>
            {message && <p className="text-sm mt-1">{message}</p>}
          </div>
          {showDetails && (
            <button
              onClick={onDetailsClick}
              className="text-sm underline hover:no-underline"
            >
              View details
            </button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

// Priority indicator
interface PriorityIndicatorProps {
  priority: "urgent" | "high" | "medium" | "low";
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function PriorityIndicator({
  priority,
  showLabel = true,
  size = "md",
}: PriorityIndicatorProps) {
  const config = {
    urgent: {
      variant: "destructive" as const,
      label: "Urgent",
      icon: "!!!",
      color: "text-destructive",
    },
    high: {
      variant: "destructive" as const,
      label: "High",
      icon: "!!",
      color: "text-destructive",
    },
    medium: {
      variant: "secondary" as const,
      label: "Medium",
      icon: "!",
      color: "text-muted-foreground",
    },
    low: {
      variant: "outline" as const,
      label: "Low",
      icon: "",
      color: "text-muted-foreground",
    },
  };

  const { variant, label, icon, color } = config[priority];

  if (!showLabel) {
    return (
      <span className={`font-bold ${color}`} title={label}>
        {icon || "•"}
      </span>
    );
  }

  return (
    <Badge variant={variant} className={size === "sm" ? "text-xs" : ""}>
      {label}
    </Badge>
  );
}

// Availability indicator
interface AvailabilityIndicatorProps {
  available: boolean;
  capacity?: number;
  total?: number;
  showDetails?: boolean;
}

export function AvailabilityIndicator({
  available,
  capacity,
  total,
  showDetails = true,
}: AvailabilityIndicatorProps) {
  const hasCapacityInfo = capacity !== undefined && total !== undefined;
  const percentage = hasCapacityInfo ? (capacity / total) * 100 : 0;

  const getStatus = () => {
    if (!available)
      return { color: "text-muted-foreground", text: "Unavailable" };
    if (!hasCapacityInfo) return { color: "text-primary", text: "Available" };
    if (percentage > 75) return { color: "text-primary", text: "Available" };
    if (percentage > 25)
      return { color: "text-muted-foreground", text: "Limited" };
    return { color: "text-destructive", text: "Almost Full" };
  };

  const status = getStatus();

  return (
    <div className="flex items-center gap-2">
      <Circle className={`h-2 w-2 fill-current ${status.color}`} />
      <span className={`text-sm ${status.color}`}>{status.text}</span>
      {showDetails && hasCapacityInfo && (
        <span className="text-xs text-muted-foreground">
          ({capacity}/{total})
        </span>
      )}
    </div>
  );
}

// Sync status indicator
interface SyncStatusProps {
  status: "synced" | "syncing" | "error" | "offline";
  lastSync?: Date;
  showTimestamp?: boolean;
}

export function SyncStatus({
  status,
  lastSync,
  showTimestamp = true,
}: SyncStatusProps) {
  const config = {
    synced: {
      icon: CheckCircle,
      color: "text-primary",
      label: "Synced",
      animate: false,
    },
    syncing: {
      icon: Clock,
      color: "text-primary",
      label: "Syncing...",
      animate: true,
    },
    error: {
      icon: XCircle,
      color: "text-destructive",
      label: "Sync Error",
      animate: false,
    },
    offline: {
      icon: WifiOff,
      color: "text-gray-500",
      label: "Offline",
      animate: false,
    },
  };

  const { icon: Icon, color, label, animate } = config[status];

  return (
    <div className={`flex items-center gap-2 ${color}`}>
      <Icon className={`h-4 w-4 ${animate ? "animate-spin" : ""}`} />
      <span className="text-sm">{label}</span>
      {showTimestamp && lastSync && status === "synced" && (
        <span className="text-xs text-muted-foreground">
          (
          {new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
            Math.round((lastSync.getTime() - Date.now()) / 1000 / 60),
            "minute",
          )}
          )
        </span>
      )}
    </div>
  );
}
