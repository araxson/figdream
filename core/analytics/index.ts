/**
 * Analytics Module - Public API
 *
 * Exports all public components, hooks, and types for the analytics feature.
 * This is the main entry point for consuming the analytics module.
 */

// Export components
export * from "./components";

// Export hooks
export * from "./hooks/use-analytics";
export * from "./hooks/use-analytics-mutations";

// Export types
export * from "./types";

// Export DAL functions (for server-side use only)
export * from "./dal";
export * from "./dal/analytics-mutations";
