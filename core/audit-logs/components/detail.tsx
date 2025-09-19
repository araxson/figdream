"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type {
  AuditEventWithUser,
  SecurityIncidentWithUser,
  DataChangeWithUser,
} from "../types";

interface AuditLogDetailProps {
  item:
    | AuditEventWithUser
    | SecurityIncidentWithUser
    | DataChangeWithUser
    | null;
  open: boolean;
  onClose: () => void;
}

export function AuditLogDetail({ item, open, onClose }: AuditLogDetailProps) {
  if (!item) return null;

  const isAuditEvent = "event_type" in item;
  const isSecurityIncident = "incident_type" in item && "severity" in item;
  const isDataChange = "operation" in item && "table_name" in item;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isAuditEvent && "Audit Event Details"}
            {isSecurityIncident && "Security Incident Details"}
            {isDataChange && "Data Change Details"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                ID
              </label>
              <p className="font-mono text-sm">{item.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Timestamp
              </label>
              <p className="text-sm">
                {new Date(
                  isDataChange
                    ? (item as DataChangeWithUser).changed_at
                    : isSecurityIncident
                      ? (item as SecurityIncidentWithUser).detected_at
                      : (item as AuditEventWithUser).event_timestamp ||
                        (item as AuditEventWithUser).created_at ||
                        "",
                ).toLocaleString()}
              </p>
            </div>
          </div>

          {isAuditEvent && (
            <>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Event Type
                </label>
                <Badge className="mt-1">{item.event_type}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Action
                </label>
                <p className="text-sm">{item.action}</p>
              </div>
            </>
          )}

          {isSecurityIncident && (
            <>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Severity
                </label>
                <Badge
                  variant={
                    item.severity === "critical"
                      ? "destructive"
                      : item.severity === "high"
                        ? "destructive"
                        : item.severity === "medium"
                          ? "secondary"
                          : "default"
                  }
                >
                  {item.severity}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Incident Type
                </label>
                <p className="text-sm">
                  {(item as SecurityIncidentWithUser).incident_type}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Description
                </label>
                <p className="text-sm">
                  {(item as SecurityIncidentWithUser).description}
                </p>
              </div>
            </>
          )}

          {isDataChange && (
            <>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Operation
                </label>
                <Badge>{(item as DataChangeWithUser).operation}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Table
                </label>
                <p className="font-mono text-sm">
                  {(item as DataChangeWithUser).table_name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Record ID
                </label>
                <p className="font-mono text-sm">
                  {(item as DataChangeWithUser).record_id}
                </p>
              </div>
            </>
          )}

          <Separator />

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              User
            </label>
            <p className="text-sm">
              {isAuditEvent
                ? (item as AuditEventWithUser).user?.display_name || "System"
                : isDataChange
                  ? (item as DataChangeWithUser).user?.display_name || "System"
                  : isSecurityIncident
                    ? (item as SecurityIncidentWithUser).reported_by_user
                        ?.display_name || "System"
                    : "System"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              IP Address
            </label>
            <p className="font-mono text-sm">
              {isDataChange
                ? (item as DataChangeWithUser).client_ip || "N/A"
                : isAuditEvent
                  ? (item as AuditEventWithUser).ip_address || "N/A"
                  : isSecurityIncident
                    ? (item as SecurityIncidentWithUser).ip_address || "N/A"
                    : "N/A"}
            </p>
          </div>

          {item.metadata && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Metadata
              </label>
              <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                {JSON.stringify(item.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
