/**
 * Loyalty Components - Public exports
 */

// Main orchestrator
export { LoyaltyProgramMain } from "./main";

// Core components
export { LoyaltyDashboard } from "./dashboard";
export { LoyaltyMembersList } from "./members-list";
export { LoyaltyTransactionsList } from "./transactions-list";
export { LoyaltyAnalytics } from "./analytics";
export { LoyaltyProgramSettings } from "./settings";

// Dialog components
export { EnrollCustomerDialog } from "./enroll-dialog";
export { AdjustPointsDialog } from "./adjust-points-dialog";
export { CreateProgramDialog } from "./create-program-dialog";

// State components
export { LoyaltyEmptyState } from "./empty-state";
export { LoyaltyLoadingState } from "./loading";
export { LoyaltyErrorBoundary } from "./error-boundary";
