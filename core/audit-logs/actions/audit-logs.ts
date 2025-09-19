"use server";

import {
  logAuditEvent,
  logDataChange,
  reportSecurityIncident,
  resolveSecurityIncident,
  logAuthenticationEvent,
  exportAuditLogsData,
} from "../dal/audit-logs-mutations";
import {
  getAuditEvents,
  getAuditEventById,
  getDataChanges,
  getSecurityIncidents,
  getAuditStats,
  getUserActivity,
  getEntityHistory,
  getFailedLoginAttempts,
  getActiveIncidents,
  searchAuditLogs,
} from "../dal/audit-logs-queries";
import type {
  AuditEvent,
  AuditLogFilters,
  DataChangeFilters,
  SecurityIncidentFilters,
} from "../dal/audit-logs-types";

// Server action to log an audit event
export async function createAuditLog(event: Partial<AuditEvent>) {
  try {
    const result = await logAuditEvent(event);
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to create audit log:", error);
    return { success: false, error: "Failed to create audit log" };
  }
}

// Server action to log a data change
export async function createDataChangeLog(change: {
  tableName: string;
  operation: "INSERT" | "UPDATE" | "DELETE";
  recordId: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}) {
  try {
    const result = await logDataChange(change);
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to log data change:", error);
    return { success: false, error: "Failed to log data change" };
  }
}

// Server action to report security incident
export async function createSecurityIncident(incident: {
  incidentType: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const result = await reportSecurityIncident(incident);
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to report security incident:", error);
    return { success: false, error: "Failed to report security incident" };
  }
}

// Server action to resolve security incident
export async function resolveIncident(
  incidentId: string,
  resolutionNotes: string,
) {
  try {
    const result = await resolveSecurityIncident(incidentId, resolutionNotes);
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to resolve security incident:", error);
    return { success: false, error: "Failed to resolve security incident" };
  }
}

// Server action to log authentication event
export async function logAuth(
  action:
    | "login"
    | "logout"
    | "failed_login"
    | "password_reset"
    | "mfa_enabled"
    | "mfa_disabled",
  success: boolean,
  metadata?: Record<string, unknown>,
) {
  try {
    const result = await logAuthenticationEvent(action, success, metadata);
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to log authentication event:", error);
    return { success: false, error: "Failed to log authentication event" };
  }
}

// Server action to export audit logs
export async function exportLogs(
  filters: AuditLogFilters,
  format: "json" | "csv",
) {
  try {
    const result = await exportAuditLogsData(filters, format);
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to export audit logs:", error);
    return { success: false, error: "Failed to export audit logs" };
  }
}

// Query server actions
export async function fetchAuditEvents(filters: AuditLogFilters = {}) {
  try {
    const data = await getAuditEvents(filters);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch audit events:", error);
    return { success: false, error: "Failed to fetch audit events", data: [] };
  }
}

export async function fetchAuditEventById(id: string) {
  try {
    const data = await getAuditEventById(id);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch audit event:", error);
    return { success: false, error: "Failed to fetch audit event", data: null };
  }
}

export async function fetchDataChanges(filters: DataChangeFilters = {}) {
  try {
    const data = await getDataChanges(filters);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch data changes:", error);
    return { success: false, error: "Failed to fetch data changes", data: [] };
  }
}

export async function fetchSecurityIncidents(
  filters: SecurityIncidentFilters = {},
) {
  try {
    const data = await getSecurityIncidents(filters);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch security incidents:", error);
    return {
      success: false,
      error: "Failed to fetch security incidents",
      data: [],
    };
  }
}

export async function fetchAuditStats(salonId?: string) {
  try {
    const data = await getAuditStats(salonId);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch audit stats:", error);
    return { success: false, error: "Failed to fetch audit stats", data: null };
  }
}

export async function fetchUserActivity(userId: string, limit = 50) {
  try {
    const data = await getUserActivity(userId, limit);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch user activity:", error);
    return { success: false, error: "Failed to fetch user activity", data: [] };
  }
}

export async function fetchEntityHistory(entityType: string, entityId: string) {
  try {
    const data = await getEntityHistory(entityType, entityId);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch entity history:", error);
    return {
      success: false,
      error: "Failed to fetch entity history",
      data: [],
    };
  }
}

export async function fetchFailedLoginAttempts(
  userId?: string,
  limit = 10,
) {
  try {
    const data = await getFailedLoginAttempts(userId, limit);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch failed login attempts:", error);
    return {
      success: false,
      error: "Failed to fetch failed login attempts",
      data: [],
    };
  }
}

export async function fetchActiveIncidents() {
  try {
    const data = await getActiveIncidents();
    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch active incidents:", error);
    return {
      success: false,
      error: "Failed to fetch active incidents",
      data: [],
    };
  }
}

export async function searchAuditLogsAction(
  searchTerm: string,
  filters: AuditLogFilters = {},
) {
  try {
    const data = await searchAuditLogs(searchTerm, filters);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to search audit logs:", error);
    return { success: false, error: "Failed to search audit logs", data: [] };
  }
}
