// Layout components
export { DashboardLayout } from './layouts/dashboard-layout'

// Sidebar components
export { AppSidebar, type AppSidebarConfig, type SidebarNavItem, type SidebarUserInfo } from './navigation/app-sidebar'
export {
  customerSidebarConfig,
  salonOwnerSidebarConfig,
  staffSidebarConfig,
  locationManagerSidebarConfig,
  superAdminSidebarConfig
} from './navigation/sidebar-configs'

// Navigation components
export { CommandSearch } from './navigation/command-search'

// Shared UI components
export { DateRangePicker } from './ui-components/pickers/date-range-picker'
export { TimePicker } from './ui-components/pickers/time-picker'
export { PriceRangeSlider } from './ui-components/pickers/price-range-slider'
export { DurationSlider } from './ui-components/pickers/duration-slider'
export { NetworkRecovery, ApiErrorRecovery, ProgressiveRecovery } from './error/error-recovery'

// Data display components
export { GalleryCarousel } from './ui-components/display/gallery-carousel'