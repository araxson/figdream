// Main components
export { AppSidebar } from './app-sidebar'
export { default as SalonOwnerMenubar } from './app-menubar'

// Analytics components - from analytics directory
export { ChurnRiskList } from './analytics/churn-risk-list'
export { DemandForecastChart } from './analytics/demand-forecast-chart'
export { StaffingOptimizationTable } from './analytics/staffing-optimization-table'
export { AnalyticsOverview } from './analytics/analytics-overview'

// Appointment components
export { AppointmentsFilter } from './appointments/appointments-filter'
export { CancelDialog } from './appointments/cancel-dialog'
export { NotesManager } from './appointments/notes-manager'
export { RescheduleForm } from './appointments/reschedule-form'

// Customer components
export { CustomerList } from './customers/customer-list'

// Staff components
export { StaffTable } from './staff/staff-table'
export { StaffFormDialog } from './staff/staff-form-dialog'
export { StaffFilters } from './staff/staff-filters'
export { StaffStats } from './staff/staff-stats'

// Service components
export { ServiceForm } from './services/service-form'

// Marketing components - check if these exist
export * from './marketing'

// Gift cards components - check if these exist
export * from './gift-cards'