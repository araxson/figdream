/**
 * Appointments Module - Public API
 *
 * Exports all public components, hooks, and types for the appointments feature.
 * This is the main entry point for consuming the appointments module.
 */

// Export components
export * from "./components";

// Export hooks
export * from "./hooks/use-appointments";
export * from "./hooks/use-appointments-mutations";

// Export types
export * from "./types";

// DAL functions are available via ./dal/* imports for server-side use only
// Do not export here to avoid client/server boundary issues
