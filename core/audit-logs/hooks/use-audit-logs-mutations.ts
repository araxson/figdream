"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createAuditLog,
  createDataChangeLog,
  createSecurityIncident,
  resolveIncident,
  logAuth,
  exportLogs,
} from "../actions/audit-logs";
import type { AuditEvent, AuditLogFilters } from "../dal/audit-logs-types";

export function useLogAuditEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: Partial<AuditEvent>) => {
      const result = await createAuditLog(event);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit-events"] });
      queryClient.invalidateQueries({ queryKey: ["audit-stats"] });
    },
    onError: (error) => {
      console.error("Failed to log audit event:", error);
    },
  });
}

export function useLogDataChange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (change: {
      tableName: string;
      operation: "INSERT" | "UPDATE" | "DELETE";
      recordId: string;
      oldData?: Record<string, unknown>;
      newData?: Record<string, unknown>;
      metadata?: Record<string, unknown>;
    }) => {
      const result = await createDataChangeLog(change);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-changes"] });
    },
    onError: (error) => {
      console.error("Failed to log data change:", error);
    },
  });
}

export function useReportSecurityIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (incident: {
      incidentType: string;
      severity: "low" | "medium" | "high" | "critical";
      description: string;
      metadata?: Record<string, unknown>;
    }) => {
      const result = await createSecurityIncident(incident);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-incidents"] });
      queryClient.invalidateQueries({ queryKey: ["unresolved-incidents"] });
      toast.error("Security incident reported");
    },
    onError: (error) => {
      toast.error("Failed to report security incident");
      console.error(error);
    },
  });
}

export function useResolveSecurityIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      incidentId,
      resolutionNotes,
    }: {
      incidentId: string;
      resolutionNotes: string;
    }) => {
      const result = await resolveIncident(incidentId, resolutionNotes);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-incidents"] });
      queryClient.invalidateQueries({ queryKey: ["unresolved-incidents"] });
      toast.success("Security incident resolved");
    },
    onError: (error) => {
      toast.error("Failed to resolve security incident");
      console.error(error);
    },
  });
}

export function useLogBulkOperation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      operation: string;
      entityType: string;
      affectedIds: string[];
      metadata?: Record<string, unknown>;
    }) => {
      // TODO: Create server action for bulk operation logging
      const result = await createAuditLog({
        metadata: params,
      } as Partial<AuditEvent>);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit-events"] });
    },
    onError: (error) => {
      console.error("Failed to log bulk operation:", error);
    },
  });
}

export function useLogAuthenticationEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      action:
        | "login"
        | "logout"
        | "failed_login"
        | "password_reset"
        | "mfa_enabled"
        | "mfa_disabled";
      success: boolean;
      metadata?: Record<string, unknown>;
    }) => {
      const result = await logAuth(
        params.action,
        params.success,
        params.metadata,
      );
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit-events"] });
      queryClient.invalidateQueries({ queryKey: ["user-activity"] });
    },
    onError: (error) => {
      console.error("Failed to log authentication event:", error);
    },
  });
}

export function useLogPermissionChange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      userId: string;
      roleChange: {
        oldRole?: string;
        newRole?: string;
        permissions?: string[];
        grantedBy?: string;
      };
    }) => {
      // TODO: Create server action for permission change logging
      const result = await createAuditLog({
        userId: params.userId,
        metadata: params.roleChange,
      } as Partial<AuditEvent>);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit-events"] });
      toast.success("Permission change logged");
    },
    onError: (error) => {
      toast.error("Failed to log permission change");
      console.error(error);
    },
  });
}

export function useExportAuditLogs() {
  return useMutation({
    mutationFn: async (params: {
      filters: AuditLogFilters;
      format: "json" | "csv";
    }) => {
      const result = await exportLogs(params.filters, params.format);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (_, variables) => {
      toast.success(`Audit logs exported as ${variables.format.toUpperCase()}`);
    },
    onError: (error) => {
      toast.error("Failed to export audit logs");
      console.error(error);
    },
  });
}
