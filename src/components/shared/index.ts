// Sidebar components
export { AppSidebar, type AppSidebarConfig, type SidebarNavItem, type SidebarUserInfo } from './app-sidebar'
export {
  customerSidebarConfig,
  salonOwnerSidebarConfig,
  staffSidebarConfig,
  locationManagerSidebarConfig,
  superAdminSidebarConfig
} from './sidebar-configs'

// Navigation components
export { CommandSearch } from './navigation/command-search'

// Shared UI components
export { DateRangePicker } from './ui-components/date-range-picker'
export { TimePicker } from './ui-components/time-picker'
export { PriceRangeSlider } from './ui-components/price-range-slider'
export { DurationSlider } from './ui-components/duration-slider'
export { NetworkRecovery, ApiErrorRecovery, ProgressiveRecovery } from './error-recovery'

// Data display components
export { GalleryCarousel } from './ui-components/gallery-carousel'