/**
 * Layouts Module - Public API
 */

// Export components
export * from "./components";

// Export config (excluding UserRole to avoid duplicate)
export {
  getNavigationByRole,
  getDashboardPath,
  type NavigationItem,
  type NavigationGroup,
} from "./config/navigation";

// Export types (UserRole comes from here)
export * from "./types";
