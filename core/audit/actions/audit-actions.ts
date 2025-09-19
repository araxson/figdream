"use server";

import { revalidatePath } from "next/cache";
import {
  logAuditEvent,
  logSecurityIncident,
  updateSecurityIncident,
  logAccess,
  logAuthEvent,
  logDataOperation,
  logPermissionChange,
  logConfigChange,
  cleanupOldAuditLogs,
} from "../dal/audit-commands";
import {
  getAuditEvents,
  getAuditEvent,
  getDataChanges,
  getSecurityIncidents,
  getAccessLogs,
  getAuditStats,
  getRelatedEvents,
  exportAuditLogs,
} from "../dal/audit-queries";
import type {
  CreateAuditEventInput,
  CreateSecurityIncidentInput,
  LogAccessInput,
  AuditEventFilters,
  DataChangeFilters,
  SecurityIncidentFilters,
  AccessLogFilters,
} from "../dal/audit-types";

// Query Actions
export async function fetchAuditEvents(filters: AuditEventFilters = {}) {
  try {
    const events = await getAuditEvents(filters);
    return { success: true, data: events, error: null };
  } catch (error) {
    console.error("Error fetching audit events:", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch audit events",
    };
  }
}

export async function fetchAuditEvent(eventId: string) {
  try {
    const event = await getAuditEvent(eventId);
    return { success: true, data: event, error: null };
  } catch (error) {
    console.error("Error fetching audit event:", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch audit event",
    };
  }
}

export async function fetchDataChanges(filters: DataChangeFilters = {}) {
  try {
    const changes = await getDataChanges(filters);
    return { success: true, data: changes, error: null };
  } catch (error) {
    console.error("Error fetching data changes:", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch data changes",
    };
  }
}

export async function fetchSecurityIncidents(
  filters: SecurityIncidentFilters = {}
) {
  try {
    const incidents = await getSecurityIncidents(filters);
    return { success: true, data: incidents, error: null };
  } catch (error) {
    console.error("Error fetching security incidents:", error);
    return {
      success: false,
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch security incidents",
    };
  }
}

export async function fetchAccessLogs(filters: AccessLogFilters = {}) {
  try {
    const logs = await getAccessLogs(filters);
    return { success: true, data: logs, error: null };
  } catch (error) {
    console.error("Error fetching access logs:", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch access logs",
    };
  }
}

export async function fetchAuditStats(filters: AuditEventFilters = {}) {
  try {
    const stats = await getAuditStats(filters);
    return { success: true, data: stats, error: null };
  } catch (error) {
    console.error("Error fetching audit stats:", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch audit stats",
    };
  }
}

export async function fetchRelatedEvents(correlationId: string) {
  try {
    const events = await getRelatedEvents(correlationId);
    return { success: true, data: events, error: null };
  } catch (error) {
    console.error("Error fetching related events:", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch related events",
    };
  }
}

// Command Actions
export async function createAuditEvent(input: CreateAuditEventInput) {
  try {
    const event = await logAuditEvent(input);
    revalidatePath("/admin/audit-logs");
    return { success: true, data: event, error: null };
  } catch (error) {
    console.error("Error creating audit event:", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to create audit event",
    };
  }
}

export async function reportSecurityIncident(
  input: CreateSecurityIncidentInput
) {
  try {
    const incident = await logSecurityIncident(input);
    revalidatePath("/admin/security");
    return { success: true, data: incident, error: null };
  } catch (error) {
    console.error("Error reporting security incident:", error);
    return {
      success: false,
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to report security incident",
    };
  }
}

export async function updateIncidentStatus(
  incidentId: string,
  updates: {
    status?: "open" | "investigating" | "resolved" | "false_positive";
    resolutionNotes?: string;
    investigationNotes?: string;
  }
) {
  try {
    const incident = await updateSecurityIncident(incidentId, updates);
    revalidatePath("/admin/security");
    return { success: true, data: incident, error: null };
  } catch (error) {
    console.error("Error updating incident status:", error);
    return {
      success: false,
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update incident status",
    };
  }
}

export async function trackResourceAccess(input: LogAccessInput) {
  try {
    const log = await logAccess(input);
    return { success: true, data: log, error: null };
  } catch (error) {
    console.error("Error tracking resource access:", error);
    return {
      success: false,
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to track resource access",
    };
  }
}

// Helper Actions for specific events
export async function trackAuthEvent(
  type: "login" | "logout" | "register" | "password_change" | "password_reset",
  success = true,
  errorMessage?: string
) {
  try {
    const event = await logAuthEvent(type, success, errorMessage);
    return { success: true, data: event, error: null };
  } catch (error) {
    console.error("Error tracking auth event:", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to track auth event",
    };
  }
}

export async function trackDataChange(
  operation: "create" | "read" | "update" | "delete",
  resourceType: string,
  resourceId: string,
  resourceName?: string,
  oldValues?: Record<string, unknown>,
  newValues?: Record<string, unknown>
) {
  try {
    const event = await logDataOperation(
      operation,
      resourceType,
      resourceId,
      resourceName,
      oldValues,
      newValues
    );
    return { success: true, data: event, error: null };
  } catch (error) {
    console.error("Error tracking data change:", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to track data change",
    };
  }
}

export async function trackPermissionChange(
  action: "grant" | "revoke",
  userId: string,
  permission: string,
  resourceType?: string,
  resourceId?: string
) {
  try {
    const event = await logPermissionChange(
      action,
      userId,
      permission,
      resourceType,
      resourceId
    );
    revalidatePath("/admin/users");
    return { success: true, data: event, error: null };
  } catch (error) {
    console.error("Error tracking permission change:", error);
    return {
      success: false,
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to track permission change",
    };
  }
}

export async function trackConfigChange(
  configType: string,
  configKey: string,
  oldValue: unknown,
  newValue: unknown
) {
  try {
    const event = await logConfigChange(configType, configKey, oldValue, newValue);
    revalidatePath("/admin/settings");
    return { success: true, data: event, error: null };
  } catch (error) {
    console.error("Error tracking config change:", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to track config change",
    };
  }
}

// Export and cleanup actions
export async function exportAuditData(filters: AuditEventFilters = {}) {
  try {
    const exportData = await exportAuditLogs(filters);
    return { success: true, data: exportData, error: null };
  } catch (error) {
    console.error("Error exporting audit data:", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to export audit data",
    };
  }
}

export async function performAuditCleanup() {
  try {
    const result = await cleanupOldAuditLogs();
    revalidatePath("/admin/audit-logs");
    return { success: true, data: result, error: null };
  } catch (error) {
    console.error("Error performing audit cleanup:", error);
    return {
      success: false,
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to perform audit cleanup",
    };
  }
}