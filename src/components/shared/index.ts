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
export { default as CommandTrigger } from './navigation-components/command-trigger'
export { default as CommandSearch } from './navigation-components/command-search'

// Shared UI components
export { DateRangePicker } from './ui-elements/date-range-picker'
export { TimePicker } from './ui-elements/time-picker'
export { PriceRangeSlider } from './ui-elements/price-range-slider'
export { DurationSlider } from './ui-elements/duration-slider'
export { ErrorRecovery } from './error-recovery'

// Data display components
export { default as GalleryCarousel } from './data-display/gallery-carousel'
export { default as ServiceDetailsCollapsible } from './data-display/service-details-collapsible'
export { default as TestimonialsCarousel } from './data-display/testimonials-carousel'