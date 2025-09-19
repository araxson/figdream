// Re-export types from DAL for component use
export type {
  AuditEvent,
  AuditEventWithUser,
  SecurityIncident,
  SecurityIncidentWithUser,
  DataChange,
  DataChangeWithUser,
  AuditLogFilters,
  SecurityIncidentFilters,
  DataChangeFilters,
  AuditStats,
} from "./dal/audit-logs-types";

// Component-specific types
export interface AuditLogsViewMode {
  mode: "events" | "incidents" | "changes";
}

export interface AuditLogsTimeRange {
  preset: "today" | "yesterday" | "week" | "month" | "custom";
  startDate?: Date;
  endDate?: Date;
}

export interface AuditLogsExportOptions {
  format: "json" | "csv";
  includeMetadata: boolean;
  dateRange: AuditLogsTimeRange;
}
