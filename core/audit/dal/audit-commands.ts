import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import type {
  CreateAuditEventInput,
  CreateSecurityIncidentInput,
  LogAccessInput,
  AuditEventCategories,
  AuditEventTypes,
  AuditActions,
} from "./audit-types";

// Verify authentication for all operations
async function verifyAuth() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  return { user, supabase };
}

// Get request context (IP, user agent, etc.)
async function getRequestContext() {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || undefined;
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0] || realIp || undefined;

  return { userAgent, ip };
}

// Log an audit event
export async function logAuditEvent(input: CreateAuditEventInput) {
  const { user, supabase } = await verifyAuth();
  const { userAgent, ip } = await getRequestContext();

  // Get user's current salon context if available
  let salonId: string | null = null;
  const { data: staffProfile } = await supabase
    .from("staff_profiles")
    .select("salon_id")
    .eq("user_id", user.id)
    .single();

  if (staffProfile) {
    salonId = staffProfile.salon_id;
  }

  const eventData = {
    user_id: user.id,
    salon_id: salonId,
    event_type: input.eventType,
    event_category: input.eventCategory,
    action: input.action,
    resource_type: input.resourceType || null,
    resource_id: input.resourceId || null,
    resource_name: input.resourceName || null,
    old_values: input.oldValues || null,
    new_values: input.newValues || null,
    changes: input.changes || null,
    severity: input.severity || "info",
    success: input.success !== false,
    error_message: input.errorMessage || null,
    error_stack: input.errorStack || null,
    metadata: input.metadata || {},
    correlation_id: input.correlationId || null,
    compliance_labels: input.complianceLabels || null,
    retention_days: input.retentionDays || 90,
    is_sensitive: input.isSensitive || false,
    ip_address: ip,
    user_agent: userAgent,
  };

  const { data, error } = await supabase
    .from("audit.events")
    .insert(eventData)
    .select()
    .single();

  if (error) {
    console.error("Error logging audit event:", error);
    throw new Error("Failed to log audit event");
  }

  return data;
}

// Log a security incident
export async function logSecurityIncident(input: CreateSecurityIncidentInput) {
  const { user, supabase } = await verifyAuth();
  const { userAgent, ip } = await getRequestContext();

  const incidentData = {
    incident_type: input.incidentType,
    severity: input.severity,
    title: input.title,
    description: input.description,
    user_id: user.id,
    affected_resources: input.affectedResources || null,
    metadata: input.metadata || {},
    ip_address: ip,
    user_agent: userAgent,
    status: "open" as const,
    detected_by: "user_report",
  };

  const { data, error } = await supabase
    .from("audit.security_incidents")
    .insert(incidentData)
    .select()
    .single();

  if (error) {
    console.error("Error logging security incident:", error);
    throw new Error("Failed to log security incident");
  }

  // Also log as an audit event
  await logAuditEvent({
    eventType: "security.incident_reported",
    eventCategory: "security",
    action: "create",
    resourceType: "security_incident",
    resourceId: data.id,
    resourceName: input.title,
    severity: input.severity === "critical" ? "critical" : "warning",
    metadata: {
      incidentType: input.incidentType,
      severity: input.severity,
    },
  });

  return data;
}

// Update security incident status
export async function updateSecurityIncident(
  incidentId: string,
  updates: {
    status?: "open" | "investigating" | "resolved" | "false_positive";
    resolutionNotes?: string;
    investigationNotes?: string;
  }
) {
  const { user, supabase } = await verifyAuth();

  // Check admin permission
  const { data: userRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!userRole || !["admin", "super_admin"].includes(userRole.role)) {
    throw new Error("Forbidden: Admin access required");
  }

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.status) {
    updateData.status = updates.status;
    if (updates.status === "resolved") {
      updateData.resolved_at = new Date().toISOString();
      updateData.resolved_by = user.id;
    }
  }

  if (updates.resolutionNotes) {
    updateData.resolution_notes = updates.resolutionNotes;
  }

  if (updates.investigationNotes) {
    const { data: incident } = await supabase
      .from("audit.security_incidents")
      .select("investigation_notes")
      .eq("id", incidentId)
      .single();

    const existingNotes = incident?.investigation_notes || [];
    updateData.investigation_notes = [
      ...existingNotes,
      `[${new Date().toISOString()}] ${updates.investigationNotes}`,
    ];
  }

  const { data, error } = await supabase
    .from("audit.security_incidents")
    .update(updateData)
    .eq("id", incidentId)
    .select()
    .single();

  if (error) {
    console.error("Error updating security incident:", error);
    throw new Error("Failed to update security incident");
  }

  // Log the update as an audit event
  await logAuditEvent({
    eventType: "security.incident_updated",
    eventCategory: "security",
    action: "update",
    resourceType: "security_incident",
    resourceId: incidentId,
    changes: updates,
    metadata: {
      newStatus: updates.status,
    },
  });

  return data;
}

// Log access to a resource
export async function logAccess(input: LogAccessInput) {
  const { user, supabase } = await verifyAuth();
  const { userAgent, ip } = await getRequestContext();

  // Get user's current salon context if available
  let salonId: string | null = null;
  const { data: staffProfile } = await supabase
    .from("staff_profiles")
    .select("salon_id")
    .eq("user_id", user.id)
    .single();

  if (staffProfile) {
    salonId = staffProfile.salon_id;
  }

  const accessData = {
    user_id: user.id,
    salon_id: salonId,
    resource_type: input.resourceType,
    resource_id: input.resourceId || null,
    action: input.action,
    permission_used: input.permissionUsed || null,
    permission_check_result: input.permissionCheckResult,
    response_time_ms: input.responseTimeMs || null,
    data_size_bytes: input.dataSizeBytes || null,
    metadata: input.metadata || {},
    ip_address: ip,
    user_agent: userAgent,
  };

  const { data, error } = await supabase
    .from("audit.access_logs")
    .insert(accessData)
    .select()
    .single();

  if (error) {
    console.error("Error logging access:", error);
    throw new Error("Failed to log access");
  }

  return data;
}

// Helper function to log authentication events
export async function logAuthEvent(
  type: "login" | "logout" | "register" | "password_change" | "password_reset",
  success = true,
  errorMessage?: string
) {
  const eventTypeMap = {
    login: "user.login",
    logout: "user.logout",
    register: "user.register",
    password_change: "user.password_change",
    password_reset: "user.password_reset",
  };

  return logAuditEvent({
    eventType: eventTypeMap[type],
    eventCategory: "authentication",
    action: type,
    success,
    errorMessage,
    severity: success ? "info" : "warning",
  });
}

// Helper function to log data operations
export async function logDataOperation(
  operation: "create" | "read" | "update" | "delete",
  resourceType: string,
  resourceId: string,
  resourceName?: string,
  oldValues?: Record<string, unknown>,
  newValues?: Record<string, unknown>
) {
  const eventTypeMap = {
    create: "data.create",
    read: "data.read",
    update: "data.update",
    delete: "data.delete",
  };

  return logAuditEvent({
    eventType: eventTypeMap[operation],
    eventCategory: "data_modification",
    action: operation,
    resourceType,
    resourceId,
    resourceName,
    oldValues,
    newValues,
    changes: oldValues && newValues ? calculateChanges(oldValues, newValues) : undefined,
  });
}

// Helper function to log permission changes
export async function logPermissionChange(
  action: "grant" | "revoke",
  userId: string,
  permission: string,
  resourceType?: string,
  resourceId?: string
) {
  return logAuditEvent({
    eventType: action === "grant" ? "permission.grant" : "permission.revoke",
    eventCategory: "authorization",
    action,
    resourceType: resourceType || "user",
    resourceId: resourceId || userId,
    metadata: {
      userId,
      permission,
    },
  });
}

// Helper function to log configuration changes
export async function logConfigChange(
  configType: string,
  configKey: string,
  oldValue: unknown,
  newValue: unknown
) {
  return logAuditEvent({
    eventType: "config.change",
    eventCategory: "configuration",
    action: "update",
    resourceType: configType,
    resourceId: configKey,
    oldValues: { [configKey]: oldValue },
    newValues: { [configKey]: newValue },
    changes: { [configKey]: { old: oldValue, new: newValue } },
  });
}

// Helper function to calculate changes between old and new values
function calculateChanges(
  oldValues: Record<string, unknown>,
  newValues: Record<string, unknown>
): Record<string, { old: unknown; new: unknown }> {
  const changes: Record<string, { old: unknown; new: unknown }> = {};

  const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);

  allKeys.forEach((key) => {
    if (oldValues[key] !== newValues[key]) {
      changes[key] = {
        old: oldValues[key],
        new: newValues[key],
      };
    }
  });

  return changes;
}

// Bulk operations for performance
export async function logBulkAuditEvents(events: CreateAuditEventInput[]) {
  const { user, supabase } = await verifyAuth();
  const { userAgent, ip } = await getRequestContext();

  // Get user's current salon context
  let salonId: string | null = null;
  const { data: staffProfile } = await supabase
    .from("staff_profiles")
    .select("salon_id")
    .eq("user_id", user.id)
    .single();

  if (staffProfile) {
    salonId = staffProfile.salon_id;
  }

  const correlationId = crypto.randomUUID();

  const eventsData = events.map((input) => ({
    user_id: user.id,
    salon_id: salonId,
    event_type: input.eventType,
    event_category: input.eventCategory,
    action: input.action,
    resource_type: input.resourceType || null,
    resource_id: input.resourceId || null,
    resource_name: input.resourceName || null,
    old_values: input.oldValues || null,
    new_values: input.newValues || null,
    changes: input.changes || null,
    severity: input.severity || "info",
    success: input.success !== false,
    error_message: input.errorMessage || null,
    metadata: input.metadata || {},
    correlation_id: correlationId,
    compliance_labels: input.complianceLabels || null,
    retention_days: input.retentionDays || 90,
    is_sensitive: input.isSensitive || false,
    ip_address: ip,
    user_agent: userAgent,
  }));

  const { data, error } = await supabase
    .from("audit.events")
    .insert(eventsData)
    .select();

  if (error) {
    console.error("Error logging bulk audit events:", error);
    throw new Error("Failed to log bulk audit events");
  }

  return data;
}

// Clean up old audit logs based on retention policy
export async function cleanupOldAuditLogs() {
  const { supabase } = await verifyAuth();

  // Check admin permission
  const { data: userRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", (await supabase.auth.getUser()).data.user!.id)
    .single();

  if (!userRole || !["admin", "super_admin"].includes(userRole.role)) {
    throw new Error("Forbidden: Admin access required");
  }

  // Call the cleanup function
  const { error } = await supabase.rpc("cleanup_old_logs");

  if (error) {
    console.error("Error cleaning up audit logs:", error);
    throw new Error("Failed to cleanup audit logs");
  }

  // Log the cleanup action
  await logAuditEvent({
    eventType: "system.cleanup",
    eventCategory: "system",
    action: "execute",
    resourceType: "audit_logs",
    metadata: {
      action: "retention_cleanup",
    },
  });

  return { success: true };
}