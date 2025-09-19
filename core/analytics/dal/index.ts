// Export all types
export * from "./analytics-types";
export type * from "./analytics-helpers";

// Export helper functions
export {
  verifyAnalyticsAuth,
  calculateDaysBetween,
  getPreviousPeriodRange,
} from "./analytics-helpers";

// Export revenue queries
export {
  getRevenueMetrics,
  getPreviousPeriodRevenue,
  getRevenueAnalytics,
  getRevenueTrends,
} from "./revenue-queries";

// Export appointment queries
export {
  getAppointmentMetrics,
  getAppointmentTrends,
  getBookingHeatmap,
  getAppointmentComparisons,
  getAppointmentsByStatus,
} from "./appointment-queries";

// Export customer queries
export {
  getCustomerMetrics,
  getCustomerInsights,
  getCustomerTrends,
  getTopCustomers,
  getCustomerRetention,
} from "./customer-queries";

// Export staff queries
export {
  getStaffMetrics,
  getStaffPerformance,
  getTopPerformers,
  getStaffUtilization,
  getStaffRevenue,
} from "./staff-queries";

// Export salon queries
export {
  getServiceMetrics,
  getSalonAnalytics,
  compareSalons,
  getSalonOccupancy,
  getSalonGrowth,
} from "./salon-queries";

// Export platform-wide queries
export {
  getDashboardMetrics,
  getPerformanceMetrics,
  getChartData,
  getPlatformStatistics,
} from "./platform-queries";