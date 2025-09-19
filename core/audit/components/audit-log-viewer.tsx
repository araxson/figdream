"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import { fetchAuditEvents, exportAuditData } from "../actions/audit-actions";
import type { AuditEventWithUser, AuditEventFilters } from "../dal/audit-types";

interface AuditLogViewerProps {
  filters?: AuditEventFilters;
  refreshInterval?: number;
}

export function AuditLogViewer({
  filters = {},
  refreshInterval
}: AuditLogViewerProps) {
  const [events, setEvents] = useState<AuditEventWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<AuditEventWithUser | null>(
    null
  );
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [exporting, setExporting] = useState(false);

  const pageSize = 50;

  useEffect(() => {
    loadEvents();

    if (refreshInterval) {
      const interval = setInterval(loadEvents, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [filters, page]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchAuditEvents({
        ...filters,
        limit: pageSize,
        offset: page * pageSize,
      });

      if (result.success && result.data) {
        setEvents(result.data);
        setHasMore(result.data.length === pageSize);
      } else {
        setError(result.error || "Failed to load audit events");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await exportAuditData(filters);
      if (result.success && result.data) {
        // Create and download JSON file
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit-logs-${format(new Date(), "yyyy-MM-dd-HHmmss")}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        setError(result.error || "Failed to export audit data");
      }
    } catch (err) {
      setError("Failed to export audit data");
    } finally {
      setExporting(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
      case "error":
        return <XCircle className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "info":
        return <Info className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "error":
        return "destructive";
      case "warning":
        return "yellow";
      case "info":
        return "default";
      default:
        return "secondary";
    }
  };

  const getSuccessIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  if (loading && events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>Loading audit events...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>Error loading audit events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p>{error}</p>
          </div>
          <Button onClick={loadEvents} className="mt-4" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Audit Logs</CardTitle>
            <CardDescription>
              System-wide audit trail of all activities
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={loadEvents}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              disabled={exporting}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Event Type</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(event.event_timestamp), "MMM dd, HH:mm:ss")}
                </TableCell>
                <TableCell>
                  <div className="max-w-[150px] truncate">
                    {event.user?.email || "System"}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{event.event_type}</Badge>
                </TableCell>
                <TableCell>
                  {event.resource_type && (
                    <div className="text-sm">
                      <div className="font-medium">{event.resource_type}</div>
                      {event.resource_name && (
                        <div className="text-muted-foreground truncate max-w-[150px]">
                          {event.resource_name}
                        </div>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{event.action}</Badge>
                </TableCell>
                <TableCell>{getSuccessIcon(event.success)}</TableCell>
                <TableCell>
                  <Badge variant={getSeverityColor(event.severity) as any}>
                    <span className="flex items-center gap-1">
                      {getSeverityIcon(event.severity)}
                      {event.severity}
                    </span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>Audit Event Details</DialogTitle>
                        <DialogDescription>
                          Full details of the audit event
                        </DialogDescription>
                      </DialogHeader>
                      {selectedEvent && (
                        <ScrollArea className="h-[60vh]">
                          <div className="space-y-4 pr-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium">Event ID</p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedEvent.id}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Timestamp</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(
                                    new Date(selectedEvent.event_timestamp),
                                    "PPpp"
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">User</p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedEvent.user?.email || "System"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">IP Address</p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedEvent.ip_address || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Event Type</p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedEvent.event_type}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Category</p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedEvent.event_category}
                                </p>
                              </div>
                            </div>

                            {selectedEvent.error_message && (
                              <div>
                                <p className="text-sm font-medium">Error Message</p>
                                <p className="text-sm text-red-500">
                                  {selectedEvent.error_message}
                                </p>
                              </div>
                            )}

                            {selectedEvent.old_values && (
                              <div>
                                <p className="text-sm font-medium mb-2">
                                  Previous Values
                                </p>
                                <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                                  {JSON.stringify(selectedEvent.old_values, null, 2)}
                                </pre>
                              </div>
                            )}

                            {selectedEvent.new_values && (
                              <div>
                                <p className="text-sm font-medium mb-2">New Values</p>
                                <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                                  {JSON.stringify(selectedEvent.new_values, null, 2)}
                                </pre>
                              </div>
                            )}

                            {selectedEvent.metadata &&
                              Object.keys(selectedEvent.metadata).length > 0 && (
                                <div>
                                  <p className="text-sm font-medium mb-2">Metadata</p>
                                  <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                                    {JSON.stringify(selectedEvent.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}

                            {selectedEvent.user_agent && (
                              <div>
                                <p className="text-sm font-medium">User Agent</p>
                                <p className="text-sm text-muted-foreground text-xs">
                                  {selectedEvent.user_agent}
                                </p>
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      )}
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {events.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            No audit events found
          </div>
        )}

        {events.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Page {page + 1}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!hasMore}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}