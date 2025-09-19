import type {} from "@/types/database.types";

// Note: These types are based on the audit schema tables
// Since types might not include audit schema, we define them manually
export interface AuditEvent {
  id: string;
  event_type: string;
  event_category: string;
  event_timestamp: string;
  user_id?: string;
  session_id?: string;
  salon_id?: string;
  entity_type?: string;
  entity_id?: string;
  action: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  metadata: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  request_id?: string;
  correlation_id?: string;
  severity: "debug" | "info" | "warning" | "error" | "critical";
  success: boolean;
  error_message?: string;
  error_stack?: string;
  compliance_labels?: string[];
  retention_days?: number;
  is_encrypted?: boolean;
  checksum?: string;
  created_at?: string;
}

// Extended types with user relations
export interface AuditEventWithUser extends AuditEvent {
  user?: {
    id: string;
    email: string;
    display_name?: string;
  };
}

export interface DataChangeWithUser extends DataChange {
  user?: {
    id: string;
    email: string;
    display_name?: string;
  };
}

export interface SecurityIncidentWithUser extends SecurityIncident {
  reported_by_user?: {
    id: string;
    email: string;
    display_name?: string;
  };
  resolved_by_user?: {
    id: string;
    email: string;
    display_name?: string;
  };
}

export interface DataChange {
  id: string;
  table_schema: string;
  table_name: string;
  operation: "INSERT" | "UPDATE" | "DELETE";
  record_id: string;
  changed_by?: string;
  changed_at: string;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  change_details?: Record<string, unknown>;
  session_id?: string;
  transaction_id?: string;
  application_name?: string;
  client_ip?: string;
  is_bulk_operation?: boolean;
  batch_id?: string;
  metadata?: Record<string, unknown>;
}

export interface SecurityIncident {
  id: string;
  incident_type: string;
  severity: "low" | "medium" | "high" | "critical";
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  description: string;
  detected_at: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
  is_resolved: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface AuditLogFilters {
  userId?: string;
  salonId?: string;
  entityType?: string;
  entityId?: string;
  eventType?: string;
  eventCategory?: string;
  severity?: string;
  success?: boolean;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface DataChangeFilters {
  tableName?: string;
  operation?: "INSERT" | "UPDATE" | "DELETE";
  changedBy?: string;
  recordId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface SecurityIncidentFilters {
  incidentType?: string;
  severity?: string;
  userId?: string;
  isResolved?: boolean;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface AuditStats {
  totalEvents: number;
  eventsByCategory: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  failureRate: number;
  topUsers: Array<{
    userId: string;
    eventCount: number;
  }>;
  topActions: Array<{
    action: string;
    count: number;
  }>;
  recentIncidents: number;
}

export interface AuditLogExport {
  events: AuditEvent[];
  metadata: {
    exportedAt: string;
    exportedBy: string;
    filters: AuditLogFilters;
    totalCount: number;
  };
}
