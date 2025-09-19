"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  InfoIcon,
  XCircle,
  Users,
  Calendar,
  Package,
  ShoppingBag,
  FileText,
  Search,
  Plus,
  UserPlus,
  CalendarPlus,
  Inbox
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ============================================
// EMPTY STATE PATTERNS
// ============================================

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  variant?: "default" | "card" | "minimal";
  preset?: "customers" | "appointments" | "services" | "staff" | "search" | "notifications";
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const presetConfigs = {
  customers: {
    icon: Users,
    title: "No customers yet",
    description: "Start building your customer base by adding new customers.",
    actionLabel: "Add Customer",
  },
  appointments: {
    icon: Calendar,
    title: "No appointments scheduled",
    description: "Your calendar is clear. Book your first appointment to get started.",
    actionLabel: "Book Appointment",
  },
  services: {
    icon: ShoppingBag,
    title: "No services available",
    description: "Create services to offer to your customers.",
    actionLabel: "Add Service",
  },
  staff: {
    icon: Users,
    title: "No staff members",
    description: "Add staff members to manage appointments and services.",
    actionLabel: "Add Staff Member",
  },
  search: {
    icon: Search,
    title: "No results found",
    description: "Try adjusting your search or filter criteria.",
    actionLabel: "Clear Filters",
  },
  notifications: {
    icon: Inbox,
    title: "All caught up!",
    description: "You have no new notifications.",
    actionLabel: undefined,
  },
};

export function EmptyState({
  icon: iconProp,
  title: titleProp,
  description: descriptionProp,
  variant = "card",
  preset,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const presetConfig = preset ? presetConfigs[preset] : null;
  const Icon = iconProp || presetConfig?.icon || Inbox;
  const title = titleProp || presetConfig?.title || "No items found";
  const description = descriptionProp || presetConfig?.description || "There are no items to display at the moment.";

  const content = (
    <div className="flex flex-col items-center space-y-4 text-center">
      <div className="rounded-full bg-muted p-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
      </div>
      <div className="flex gap-2">
        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || "default"}
          >
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button
            onClick={secondaryAction.onClick}
            variant="outline"
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );

  if (variant === "minimal") {
    return (
      <div className={cn("py-12", className)}>
        {content}
      </div>
    );
  }

  return (
    <Card className={cn(
      "flex min-h-96 w-full items-center justify-center",
      className
    )}>
      <CardContent className="p-6">
        {content}
      </CardContent>
    </Card>
  );
}

// ============================================
// LOADING STATE PATTERNS
// ============================================

interface LoadingStateProps {
  variant?: "card" | "table" | "list" | "grid";
  rows?: number;
  columns?: number;
  className?: string;
}

export function LoadingState({
  variant = "card",
  rows = 3,
  columns = 4,
  className,
}: LoadingStateProps) {
  switch (variant) {
    case "table":
      return (
        <Card className={cn("w-full", className)}>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Table header */}
              <div className={cn(
                "grid gap-4",
                columns === 2 && "grid-cols-2",
                columns === 3 && "grid-cols-3",
                columns === 4 && "grid-cols-4",
                columns === 5 && "grid-cols-5",
                columns === 6 && "grid-cols-6"
              )}>
                {Array.from({ length: columns }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
              {/* Table rows */}
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <div
                  key={rowIndex}
                  className={cn(
                    "grid gap-4",
                    columns === 2 && "grid-cols-2",
                    columns === 3 && "grid-cols-3",
                    columns === 4 && "grid-cols-4",
                    columns === 5 && "grid-cols-5",
                    columns === 6 && "grid-cols-6"
                  )}
                >
                  {Array.from({ length: columns }).map((_, colIndex) => (
                    <Skeleton key={colIndex} className="h-8 w-full" />
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );

    case "list":
      return (
        <div className={cn("space-y-4", className)}>
          {Array.from({ length: rows }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );

    case "grid":
      return (
        <div className={cn(
          "grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          className
        )}>
          {Array.from({ length: rows * 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      );

    default:
      return (
        <Card className={cn("w-full", className)}>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>
      );
  }
}

// ============================================
// ERROR STATE PATTERNS
// ============================================

interface ErrorStateProps {
  title?: string;
  description: string;
  variant?: "default" | "destructive" | "warning";
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description,
  variant = "destructive",
  action,
  className,
}: ErrorStateProps) {
  const icons = {
    default: AlertCircle,
    destructive: XCircle,
    warning: AlertTriangle,
  };

  const Icon = icons[variant];

  return (
    <Alert variant={variant} className={cn("max-w-2xl", className)}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        {description}
        {action && (
          <Button
            onClick={action.onClick}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            {action.label}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

// ============================================
// SUCCESS STATE PATTERNS
// ============================================

interface SuccessStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function SuccessState({
  title,
  description,
  action,
  className,
}: SuccessStateProps) {
  return (
    <Alert className={cn("border-emerald-200 bg-emerald-50", className)}>
      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      <AlertTitle className="text-emerald-900">{title}</AlertTitle>
      {description && (
        <AlertDescription className="text-emerald-700">
          {description}
        </AlertDescription>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          variant="outline"
          size="sm"
          className="mt-4 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
        >
          {action.label}
        </Button>
      )}
    </Alert>
  );
}

// ============================================
// INFO STATE PATTERNS
// ============================================

interface InfoStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function InfoState({
  title,
  description,
  action,
  className,
}: InfoStateProps) {
  return (
    <Alert className={cn("border-blue-200 bg-blue-50", className)}>
      <InfoIcon className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-900">{title}</AlertTitle>
      <AlertDescription className="text-blue-700">
        {description}
        {action && (
          <Button
            onClick={action.onClick}
            variant="link"
            size="sm"
            className="p-0 h-auto font-medium text-blue-700"
          >
            {action.label}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
