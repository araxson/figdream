"use client";

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import {
  fetchAuditEvents,
  fetchAuditEventById,
  fetchDataChanges,
  fetchSecurityIncidents,
  fetchAuditStats,
  fetchUserActivity,
  fetchEntityHistory,
  fetchFailedLoginAttempts,
  fetchActiveIncidents,
  searchAuditLogsAction,
} from "../actions/audit-logs";
import type {
  AuditLogFilters,
  DataChangeFilters,
  SecurityIncidentFilters,
} from "../dal/audit-logs-types";

export function useAuditEvents(filters: AuditLogFilters = {}) {
  return useQuery({
    queryKey: ["audit-events", filters],
    queryFn: async () => {
      const result = await fetchAuditEvents(filters);
      return result.data || [];
    },
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useSuspenseAuditEvents(filters: AuditLogFilters = {}) {
  return useSuspenseQuery({
    queryKey: ["audit-events", filters],
    queryFn: async () => {
      const result = await fetchAuditEvents(filters);
      return result.data || [];
    },
  });
}

export function useAuditEvent(id: string) {
  return useQuery({
    queryKey: ["audit-event", id],
    queryFn: async () => {
      const result = await fetchAuditEventById(id);
      return result.data;
    },
    enabled: !!id,
  });
}

export function useDataChanges(filters: DataChangeFilters = {}) {
  return useQuery({
    queryKey: ["data-changes", filters],
    queryFn: async () => {
      const result = await fetchDataChanges(filters);
      return result.data || [];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

export function useSecurityIncidents(filters: SecurityIncidentFilters = {}) {
  return useQuery({
    queryKey: ["security-incidents", filters],
    queryFn: async () => {
      const result = await fetchSecurityIncidents(filters);
      return result.data || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useAuditStats(salonId?: string) {
  return useQuery({
    queryKey: ["audit-stats", salonId],
    queryFn: async () => {
      const result = await fetchAuditStats(salonId);
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

export function useUserActivityLog(userId: string, limit = 50) {
  return useQuery({
    queryKey: ["user-activity", userId, limit],
    queryFn: async () => {
      const result = await fetchUserActivity(userId, limit);
      return result.data || [];
    },
    enabled: !!userId,
  });
}

export function useEntityHistory(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ["entity-history", entityType, entityId],
    queryFn: async () => {
      const result = await fetchEntityHistory(entityType, entityId);
      return result.data || [];
    },
    enabled: !!entityType && !!entityId,
  });
}

export function useRecentFailures(userId?: string, limit = 10) {
  return useQuery({
    queryKey: ["recent-failures", userId, limit],
    queryFn: async () => {
      const result = await fetchFailedLoginAttempts(userId, limit);
      return result.data || [];
    },
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useUnresolvedIncidents() {
  return useQuery({
    queryKey: ["unresolved-incidents"],
    queryFn: async () => {
      const result = await fetchActiveIncidents();
      return result.data || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useSearchAuditLogs(
  searchTerm: string,
  filters: AuditLogFilters = {},
) {
  return useQuery({
    queryKey: ["search-audit-logs", searchTerm, filters],
    queryFn: async () => {
      const result = await searchAuditLogsAction(searchTerm, filters);
      return result.data || [];
    },
    enabled: !!searchTerm && searchTerm.length > 2,
  });
}
