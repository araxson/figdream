/**
 * Audit Logs Module - Public API
 */

// Export components (without type re-exports to avoid ambiguity)
export {
  AuditLogs,
  AuditLogsManagement,
  AuditLogsFilters,
  DataChanges,
  AuditLogDetail,
} from "./components";

// Export hooks
export * from "./hooks/use-audit-logs";
export * from "./hooks/use-audit-logs-mutations";

// Export types (single source of truth)
export * from "./types";

// Export DAL functions (for server-side use only)
export * from "./dal/audit-logs-queries";
export * from "./dal/audit-logs-mutations";

// Export actions
export * from "./actions/audit-logs";
