import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import type {
  AuditEvent,
  AuditEventWithUser,
  AuditEventFilters,
  DataChange,
  DataChangeWithUser,
  DataChangeFilters,
  SecurityIncident,
  SecurityIncidentWithUsers,
  SecurityIncidentFilters,
  AccessLog,
  AccessLogFilters,
  AuditStats,
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

// Check if user is admin
async function verifyAdminAuth() {
  const { user, supabase } = await verifyAuth();

  const { data: userRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!userRole || !["admin", "super_admin"].includes(userRole.role)) {
    throw new Error("Forbidden: Admin access required");
  }

  return { user, supabase };
}

// Get audit events with filters
export const getAuditEvents = cache(
  async (filters: AuditEventFilters = {}): Promise<AuditEventWithUser[]> => {
    const { user, supabase } = await verifyAuth();

    let query = supabase
      .from("audit.events")
      .select(
        `
        *,
        user:auth.users!user_id (
          id,
          email,
          raw_user_meta_data->display_name
        ),
        salon:organization.salons!salon_id (
          id,
          name
        )
      `
      )
      .order("event_timestamp", { ascending: false });

    // Apply filters
    if (filters.userId) {
      query = query.eq("user_id", filters.userId);
    }
    if (filters.salonId) {
      query = query.eq("salon_id", filters.salonId);
    }
    if (filters.eventType) {
      query = query.eq("event_type", filters.eventType);
    }
    if (filters.eventCategory) {
      query = query.eq("event_category", filters.eventCategory);
    }
    if (filters.action) {
      query = query.eq("action", filters.action);
    }
    if (filters.resourceType) {
      query = query.eq("resource_type", filters.resourceType);
    }
    if (filters.resourceId) {
      query = query.eq("resource_id", filters.resourceId);
    }
    if (filters.severity) {
      query = query.eq("severity", filters.severity);
    }
    if (filters.success !== undefined) {
      query = query.eq("success", filters.success);
    }
    if (filters.startDate) {
      query = query.gte("event_timestamp", filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte("event_timestamp", filters.endDate);
    }
    if (filters.searchTerm) {
      query = query.or(
        `event_type.ilike.%${filters.searchTerm}%,resource_name.ilike.%${filters.searchTerm}%,error_message.ilike.%${filters.searchTerm}%`
      );
    }

    // Apply pagination
    const limit = filters.limit || 100;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching audit events:", error);
      throw new Error("Failed to fetch audit events");
    }

    return (data || []) as AuditEventWithUser[];
  }
);

// Get single audit event by ID
export const getAuditEvent = cache(
  async (eventId: string): Promise<AuditEventWithUser | null> => {
    const { supabase } = await verifyAuth();

    const { data, error } = await supabase
      .from("audit.events")
      .select(
        `
        *,
        user:auth.users!user_id (
          id,
          email,
          raw_user_meta_data->display_name
        ),
        salon:organization.salons!salon_id (
          id,
          name
        )
      `
      )
      .eq("id", eventId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error fetching audit event:", error);
      throw new Error("Failed to fetch audit event");
    }

    return data as AuditEventWithUser;
  }
);

// Get data changes with filters
export const getDataChanges = cache(
  async (filters: DataChangeFilters = {}): Promise<DataChangeWithUser[]> => {
    const { supabase } = await verifyAdminAuth();

    let query = supabase
      .from("audit.data_changes")
      .select(
        `
        *,
        changed_by_user:auth.users!changed_by (
          id,
          email,
          raw_user_meta_data->display_name
        )
      `
      )
      .order("changed_at", { ascending: false });

    // Apply filters
    if (filters.tableName) {
      query = query.eq("table_name", filters.tableName);
    }
    if (filters.operation) {
      query = query.eq("operation", filters.operation);
    }
    if (filters.changedBy) {
      query = query.eq("changed_by", filters.changedBy);
    }
    if (filters.recordId) {
      query = query.eq("record_id", filters.recordId);
    }
    if (filters.startDate) {
      query = query.gte("changed_at", filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte("changed_at", filters.endDate);
    }

    // Apply pagination
    const limit = filters.limit || 100;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching data changes:", error);
      throw new Error("Failed to fetch data changes");
    }

    return (data || []) as DataChangeWithUser[];
  }
);

// Get security incidents with filters
export const getSecurityIncidents = cache(
  async (
    filters: SecurityIncidentFilters = {}
  ): Promise<SecurityIncidentWithUsers[]> => {
    const { supabase } = await verifyAdminAuth();

    let query = supabase
      .from("audit.security_incidents")
      .select(
        `
        *,
        reporting_user:auth.users!user_id (
          id,
          email,
          raw_user_meta_data->display_name
        ),
        resolving_user:auth.users!resolved_by (
          id,
          email,
          raw_user_meta_data->display_name
        )
      `
      )
      .order("detected_at", { ascending: false });

    // Apply filters
    if (filters.incidentType) {
      query = query.eq("incident_type", filters.incidentType);
    }
    if (filters.severity) {
      query = query.eq("severity", filters.severity);
    }
    if (filters.status) {
      query = query.eq("status", filters.status);
    }
    if (filters.userId) {
      query = query.eq("user_id", filters.userId);
    }
    if (filters.startDate) {
      query = query.gte("detected_at", filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte("detected_at", filters.endDate);
    }

    // Apply pagination
    const limit = filters.limit || 100;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching security incidents:", error);
      throw new Error("Failed to fetch security incidents");
    }

    return (data || []) as SecurityIncidentWithUsers[];
  }
);

// Get access logs with filters
export const getAccessLogs = cache(
  async (filters: AccessLogFilters = {}): Promise<AccessLog[]> => {
    const { user, supabase } = await verifyAuth();

    let query = supabase
      .from("audit.access_logs")
      .select("*")
      .order("accessed_at", { ascending: false });

    // Non-admins can only see their own access logs
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!userRole || !["admin", "super_admin"].includes(userRole.role)) {
      query = query.eq("user_id", user.id);
    } else {
      // Admins can apply filters
      if (filters.userId) {
        query = query.eq("user_id", filters.userId);
      }
      if (filters.salonId) {
        query = query.eq("salon_id", filters.salonId);
      }
    }

    // Apply common filters
    if (filters.resourceType) {
      query = query.eq("resource_type", filters.resourceType);
    }
    if (filters.resourceId) {
      query = query.eq("resource_id", filters.resourceId);
    }
    if (filters.action) {
      query = query.eq("action", filters.action);
    }
    if (filters.permissionResult !== undefined) {
      query = query.eq("permission_check_result", filters.permissionResult);
    }
    if (filters.startDate) {
      query = query.gte("accessed_at", filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte("accessed_at", filters.endDate);
    }

    // Apply pagination
    const limit = filters.limit || 100;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching access logs:", error);
      throw new Error("Failed to fetch access logs");
    }

    return (data || []) as AccessLog[];
  }
);

// Get audit statistics
export const getAuditStats = cache(
  async (filters: AuditEventFilters = {}): Promise<AuditStats> => {
    const { supabase } = await verifyAdminAuth();

    // Build base query with filters
    let baseQuery = supabase.from("audit.events").select("*", { head: false });

    if (filters.startDate) {
      baseQuery = baseQuery.gte("event_timestamp", filters.startDate);
    }
    if (filters.endDate) {
      baseQuery = baseQuery.lte("event_timestamp", filters.endDate);
    }
    if (filters.salonId) {
      baseQuery = baseQuery.eq("salon_id", filters.salonId);
    }

    // Get total events
    const { count: totalEvents } = await baseQuery;

    // Get successful vs failed events
    const { count: successfulEvents } = await supabase
      .from("audit.events")
      .select("*", { count: "exact", head: true })
      .eq("success", true);

    const { count: failedEvents } = await supabase
      .from("audit.events")
      .select("*", { count: "exact", head: true })
      .eq("success", false);

    // Get events by category
    const { data: categoryData } = await supabase
      .from("audit.events")
      .select("event_category")
      .not("event_category", "is", null);

    const eventsByCategory: Record<string, number> = {};
    if (categoryData) {
      categoryData.forEach((item) => {
        eventsByCategory[item.event_category] =
          (eventsByCategory[item.event_category] || 0) + 1;
      });
    }

    // Get events by severity
    const { data: severityData } = await supabase
      .from("audit.events")
      .select("severity")
      .not("severity", "is", null);

    const eventsBySeverity: Record<string, number> = {};
    if (severityData) {
      severityData.forEach((item) => {
        eventsBySeverity[item.severity] =
          (eventsBySeverity[item.severity] || 0) + 1;
      });
    }

    // Get top users
    const { data: topUsersData } = await supabase.rpc("get_top_audit_users", {
      limit_count: 10,
    });

    // Get top resources
    const { data: topResourcesData } = await supabase.rpc(
      "get_top_audit_resources",
      {
        limit_count: 10,
      }
    );

    // Get incident counts
    const { count: recentIncidents } = await supabase
      .from("audit.security_incidents")
      .select("*", { count: "exact", head: true })
      .gte("detected_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const { count: openIncidents } = await supabase
      .from("audit.security_incidents")
      .select("*", { count: "exact", head: true })
      .eq("status", "open");

    return {
      totalEvents: totalEvents || 0,
      successfulEvents: successfulEvents || 0,
      failedEvents: failedEvents || 0,
      eventsByCategory,
      eventsBySeverity,
      topUsers: topUsersData || [],
      topResources: topResourcesData || [],
      recentIncidents: recentIncidents || 0,
      openIncidents: openIncidents || 0,
    };
  }
);

// Get related events by correlation ID
export const getRelatedEvents = cache(
  async (correlationId: string): Promise<AuditEvent[]> => {
    const { supabase } = await verifyAuth();

    const { data, error } = await supabase
      .from("audit.events")
      .select("*")
      .eq("correlation_id", correlationId)
      .order("event_timestamp", { ascending: true });

    if (error) {
      console.error("Error fetching related events:", error);
      throw new Error("Failed to fetch related events");
    }

    return (data || []) as AuditEvent[];
  }
);

// Export audit logs for compliance
export const exportAuditLogs = cache(
  async (filters: AuditEventFilters = {}) => {
    const { user, supabase } = await verifyAdminAuth();

    // Get the events
    const events = await getAuditEvents(filters);

    // Create export metadata
    const exportData = {
      events,
      metadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: user.id,
        filters,
        totalCount: events.length,
      },
    };

    // Log the export action
    await supabase.rpc("log_event", {
      p_event_type: "data.export",
      p_event_category: "compliance",
      p_action: "export",
      p_resource_type: "audit_logs",
      p_metadata: { filters, count: events.length },
    });

    return exportData;
  }
);