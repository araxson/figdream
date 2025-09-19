"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import type { AuditEvent } from "../dal/audit-logs-types";

interface AuditLogsListProps {
  events: AuditEvent[];
  onViewDetails?: (event: AuditEvent) => void;
  onExport?: () => void;
  isLoading?: boolean;
  role?: "admin" | "owner";
}

export function AuditLogsList({ events, role }: AuditLogsListProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return XCircle;
      case "error":
        return XCircle;
      case "warning":
        return AlertTriangle;
      case "info":
        return Info;
      case "debug":
        return Info;
      default:
        return Info;
    }
  };

  const getSeverityVariant = (
    severity: string,
  ): "destructive" | "default" | "secondary" | "outline" => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "error":
        return "destructive";
      case "warning":
        return "secondary";
      case "info":
        return "default";
      case "debug":
        return "outline";
      default:
        return "outline";
    }
  };

  const getCategoryVariant = (
    category: string,
  ): "destructive" | "default" | "secondary" | "outline" => {
    switch (category) {
      case "authentication":
        return "secondary";
      case "security":
        return "destructive";
      case "data_modification":
        return "default";
      case "compliance":
        return "outline";
      case "system":
        return "secondary";
      default:
        return "secondary";
    }
  };

  if (events.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-muted p-4">
            <Shield className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">No audit events</h3>
            <p className="text-sm text-muted-foreground">
              Audit events will appear here as system activity occurs.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => {
              const Icon = getSeverityIcon(event.severity);
              const severityVariant = getSeverityVariant(event.severity);
              const categoryVariant = getCategoryVariant(event.event_category);

              return (
                <TableRow key={event.id}>
                  <TableCell className="font-mono text-xs">
                    <div>
                      <div>
                        {format(new Date(event.event_timestamp), "yyyy-MM-dd")}
                      </div>
                      <div className="text-muted-foreground">
                        {format(new Date(event.event_timestamp), "HH:mm:ss")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{event.action}</div>
                      {event.event_type && (
                        <div className="text-xs text-muted-foreground">
                          {event.event_type.replace(/_/g, " ")}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {event.user_id ? (
                      <div className="text-xs font-mono">
                        {event.user_id.slice(0, 8)}...
                      </div>
                    ) : (
                      <span className="text-muted-foreground">System</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {event.entity_type && event.entity_id ? (
                      <div className="space-y-1">
                        <div className="text-xs font-medium capitalize">
                          {event.entity_type}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {event.entity_id.slice(0, 8)}...
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={categoryVariant}>
                      {event.event_category.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={severityVariant}>
                      <Icon className="mr-1 h-3 w-3" />
                      {event.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {event.success ? (
                      <Badge variant="outline">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Success
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Failed
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
}
