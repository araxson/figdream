import type { Database } from "@/types/database.types";

// Audit Event Types
export interface AuditEvent {
  id: string;
  user_id?: string | null;
  session_id?: string | null;
  event_type: string;
  event_category: string;
  action: string;
  resource_type?: string | null;
  resource_id?: string | null;
  resource_name?: string | null;
  salon_id?: string | null;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  changes?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  request_id?: string;
  correlation_id?: string | null;
  severity: "debug" | "info" | "warning" | "error" | "critical";
  success: boolean;
  error_message?: string | null;
  error_stack?: string | null;
  metadata?: Record<string, unknown>;
  compliance_labels?: string[] | null;
  retention_days?: number;
  is_sensitive?: boolean;
  created_at: string;
  event_timestamp: string;
}

// Data Change Types
export interface DataChange {
  id: string;
  table_schema: string;
  table_name: string;
  operation: "INSERT" | "UPDATE" | "DELETE" | "TRUNCATE";
  record_id: string;
  changed_by?: string | null;
  changed_at: string;
  old_data?: Record<string, unknown> | null;
  new_data?: Record<string, unknown> | null;
  changed_fields?: string[] | null;
  session_id?: string | null;
  transaction_id?: number | null;
  application_name?: string | null;
  client_ip?: string | null;
  is_bulk_operation?: boolean;
  batch_id?: string | null;
  batch_size?: number | null;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// Security Incident Types
export interface SecurityIncident {
  id: string;
  incident_type: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "resolved" | "false_positive";
  user_id?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  location?: Record<string, unknown> | null;
  title: string;
  description: string;
  affected_resources?: Record<string, unknown> | null;
  detected_at: string;
  detected_by?: string | null;
  resolved_at?: string | null;
  resolved_by?: string | null;
  resolution_notes?: string | null;
  investigation_notes?: string[] | null;
  evidence?: Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Access Log Types
export interface AccessLog {
  id: string;
  user_id?: string | null;
  session_id?: string | null;
  resource_type: string;
  resource_id?: string | null;
  action: string;
  permission_used?: string | null;
  permission_check_result: boolean;
  salon_id?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  response_time_ms?: number | null;
  data_size_bytes?: number | null;
  metadata?: Record<string, unknown>;
  accessed_at: string;
}

// Extended types with relations
export interface AuditEventWithUser extends AuditEvent {
  user?: {
    id: string;
    email: string;
    display_name?: string | null;
  } | null;
  salon?: {
    id: string;
    name: string;
  } | null;
}

export interface DataChangeWithUser extends DataChange {
  changed_by_user?: {
    id: string;
    email: string;
    display_name?: string | null;
  } | null;
}

export interface SecurityIncidentWithUsers extends SecurityIncident {
  reporting_user?: {
    id: string;
    email: string;
    display_name?: string | null;
  } | null;
  resolving_user?: {
    id: string;
    email: string;
    display_name?: string | null;
  } | null;
}

// Filter types for queries
export interface AuditEventFilters {
  userId?: string;
  salonId?: string;
  eventType?: string;
  eventCategory?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  severity?: string;
  success?: boolean;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  limit?: number;
  offset?: number;
}

export interface DataChangeFilters {
  tableName?: string;
  operation?: "INSERT" | "UPDATE" | "DELETE" | "TRUNCATE";
  changedBy?: string;
  recordId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface SecurityIncidentFilters {
  incidentType?: string;
  severity?: "low" | "medium" | "high" | "critical";
  status?: "open" | "investigating" | "resolved" | "false_positive";
  userId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface AccessLogFilters {
  userId?: string;
  salonId?: string;
  resourceType?: string;
  resourceId?: string;
  action?: string;
  permissionResult?: boolean;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

// Statistics types
export interface AuditStats {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  eventsByCategory: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  topUsers: Array<{
    userId: string;
    email?: string;
    eventCount: number;
  }>;
  topResources: Array<{
    resourceType: string;
    accessCount: number;
  }>;
  recentIncidents: number;
  openIncidents: number;
}

// Create event input types
export interface CreateAuditEventInput {
  eventType: string;
  eventCategory: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  resourceName?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  changes?: Record<string, unknown>;
  severity?: "debug" | "info" | "warning" | "error" | "critical";
  success?: boolean;
  errorMessage?: string;
  errorStack?: string;
  metadata?: Record<string, unknown>;
  correlationId?: string;
  complianceLabels?: string[];
  retentionDays?: number;
  isSensitive?: boolean;
}

export interface CreateSecurityIncidentInput {
  incidentType: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  affectedResources?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface LogAccessInput {
  resourceType: string;
  resourceId?: string;
  action: string;
  permissionUsed?: string;
  permissionCheckResult: boolean;
  responseTimeMs?: number;
  dataSizeBytes?: number;
  metadata?: Record<string, unknown>;
}

// Event categories and types constants
export const AuditEventCategories = {
  AUTHENTICATION: "authentication",
  DATA_ACCESS: "data_access",
  DATA_MODIFICATION: "data_modification",
  AUTHORIZATION: "authorization",
  CONFIGURATION: "configuration",
  SYSTEM: "system",
  SECURITY: "security",
  COMPLIANCE: "compliance",
} as const;

export const AuditEventTypes = {
  USER_LOGIN: "user.login",
  USER_LOGOUT: "user.logout",
  USER_REGISTER: "user.register",
  PASSWORD_CHANGE: "user.password_change",
  PASSWORD_RESET: "user.password_reset",
  DATA_CREATE: "data.create",
  DATA_READ: "data.read",
  DATA_UPDATE: "data.update",
  DATA_DELETE: "data.delete",
  DATA_EXPORT: "data.export",
  PERMISSION_GRANT: "permission.grant",
  PERMISSION_REVOKE: "permission.revoke",
  ROLE_ASSIGN: "role.assign",
  ROLE_REMOVE: "role.remove",
  CONFIG_CHANGE: "config.change",
  SYSTEM_ERROR: "system.error",
  SECURITY_ALERT: "security.alert",
  COMPLIANCE_CHECK: "compliance.check",
} as const;

export const AuditActions = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  EXECUTE: "execute",
  EXPORT: "export",
  IMPORT: "import",
  LOGIN: "login",
  LOGOUT: "logout",
  GRANT: "grant",
  REVOKE: "revoke",
  APPROVE: "approve",
  REJECT: "reject",
} as const;

export type AuditEventCategory = typeof AuditEventCategories[keyof typeof AuditEventCategories];
export type AuditEventType = typeof AuditEventTypes[keyof typeof AuditEventTypes];
export type AuditAction = typeof AuditActions[keyof typeof AuditActions];