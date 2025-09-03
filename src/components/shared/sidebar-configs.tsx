import {
  Calendar,
  Gift,
  Heart,
  Home,
  MessageSquare,
  Settings,
  Star,
  User,
  Users,
  Store,
  MapPin,
  Trophy,
  Megaphone,
  Clock,
  BarChart3,
  Package,
  UserCheck,
  CalendarOff,
  ShoppingCart,
  DollarSign,
  Archive,
  Shield,
  Monitor,
  Database,
  FileText,
  TrendingUp,
  PieChart
} from 'lucide-react'
import type { AppSidebarConfig } from './app-sidebar'
export const customerSidebarConfig: AppSidebarConfig = {
  title: 'Customer Portal',
  subtitle: 'Manage your bookings',
  icon: User,
  navigation: [
    { title: 'Dashboard', href: '/customer', icon: Home },
    { title: 'Appointments', href: '/customer/appointments', icon: Calendar },
    { title: 'Loyalty', href: '/customer/loyalty', icon: Star },
    { title: 'Gift Cards', href: '/customer/gift-cards', icon: Gift },
    { title: 'Favorites', href: '/customer/favorites', icon: Heart },
    { title: 'Reviews', href: '/customer/reviews', icon: MessageSquare },
    { title: 'Profile', href: '/customer/profile', icon: User },
    { title: 'Settings', href: '/customer/settings', icon: Settings },
  ]
}
export const salonOwnerSidebarConfig: AppSidebarConfig = {
  title: 'Salon Management',
  subtitle: 'Run your business',
  icon: Store,
  navigation: [
    { title: 'Dashboard', href: '/salon/dashboard', icon: Home },
    {
      title: 'Appointments',
      href: '/salon/appointments',
      icon: Calendar,
      subItems: [
        { title: 'All Appointments', href: '/salon/appointments' },
        { title: 'Calendar View', href: '/salon/appointments/calendar' },
        { title: 'Appointment Notes', href: '/salon/appointments/notes' },
      ],
    },
    { title: 'Customers', href: '/salon/customers', icon: Users },
    {
      title: 'Services',
      href: '/salon/services',
      icon: Package,
      subItems: [
        { title: 'All Services', href: '/salon/services' },
        { title: 'Categories', href: '/salon/categories' },
        { title: 'Pricing', href: '/salon/services/pricing' },
      ],
    },
    {
      title: 'Staff',
      href: '/salon/staff',
      icon: UserCheck,
      subItems: [
        { title: 'Team Members', href: '/salon/staff' },
        { title: 'Schedules', href: '/salon/staff/schedule' },
        { title: 'Performance', href: '/salon/staff/performance' },
        { title: 'Specialties', href: '/salon/staff/specialties' },
      ],
    },
    { title: 'Time Off', href: '/salon/time-off', icon: CalendarOff },
    { title: 'Blocked Times', href: '/salon/blocked-times', icon: Clock },
    { title: 'Locations', href: '/salon/locations', icon: MapPin },
    {
      title: 'Loyalty Program',
      href: '/salon/loyalty',
      icon: Trophy,
      subItems: [
        { title: 'Overview', href: '/salon/loyalty' },
        { title: 'Rewards', href: '/salon/loyalty/rewards' },
        { title: 'Transactions', href: '/salon/loyalty/transactions' },
        { title: 'Ledger', href: '/salon/loyalty/ledger' },
      ],
    },
    {
      title: 'Marketing',
      href: '/salon/marketing',
      icon: Megaphone,
      subItems: [
        { title: 'Campaigns', href: '/salon/marketing' },
        { title: 'Analytics', href: '/salon/marketing/analytics' },
        { title: 'SMS Opt-outs', href: '/salon/marketing/sms-opt-outs' },
      ],
    },
    {
      title: 'Analytics',
      href: '/salon/analytics',
      icon: BarChart3,
      subItems: [
        { title: 'Overview', href: '/salon/analytics' },
        { title: 'Metrics Overview', href: '/salon/analytics/metrics-overview' },
        { title: 'Customer Insights', href: '/salon/analytics/customer-insights' },
        { title: 'Predictions', href: '/salon/dashboard/predictions' },
      ],
    },
    { title: 'Data Export', href: '/salon/data-export', icon: Archive },
    { title: 'Settings', href: '/salon/settings', icon: Settings },
  ]
}
export const staffSidebarConfig: AppSidebarConfig = {
  title: 'Staff Portal',
  subtitle: 'Your work schedule',
  icon: UserCheck,
  navigation: [
    { title: 'Dashboard', href: '/staff', icon: Home },
    { title: 'Appointments', href: '/staff/appointments', icon: Calendar },
    { title: 'Schedule', href: '/staff/schedule', icon: Clock },
    { title: 'Earnings', href: '/staff/earnings', icon: DollarSign },
    { title: 'Time Off', href: '/staff/time-off', icon: CalendarOff },
    { title: 'Performance', href: '/staff/performance', icon: TrendingUp },
    { title: 'Profile', href: '/staff/profile', icon: User },
    { title: 'Settings', href: '/staff/settings', icon: Settings },
  ]
}
export const locationManagerSidebarConfig: AppSidebarConfig = {
  title: 'Location Manager',
  subtitle: 'Manage this location',
  icon: MapPin,
  navigation: [
    { title: 'Dashboard', href: '/location-manager', icon: Home },
    { title: 'Appointments', href: '/location-manager/appointments', icon: Calendar },
    { title: 'Staff', href: '/location-manager/staff', icon: UserCheck },
    { title: 'Schedule', href: '/location-manager/schedule', icon: Clock },
    { title: 'Reports', href: '/location-manager/reports', icon: FileText },
    { title: 'Settings', href: '/location-manager/settings', icon: Settings },
  ]
}
export const superAdminSidebarConfig: AppSidebarConfig = {
  title: 'Super Admin',
  subtitle: 'System management',
  icon: Shield,
  navigation: [
    { title: 'Dashboard', href: '/admin', icon: Home },
    { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { title: 'Audit Logs', href: '/admin/audit', icon: FileText },
    { title: 'Subscriptions', href: '/admin/subscriptions', icon: ShoppingCart },
    { title: 'Users', href: '/admin/users', icon: Users },
    { title: 'Salons', href: '/admin/salons', icon: Store },
    { title: 'System Health', href: '/admin/system-health', icon: Monitor },
    { title: 'Email Templates', href: '/admin/email-templates', icon: MessageSquare },
    { title: 'Billing', href: '/admin/billing', icon: CreditCard },
    { title: 'Monitoring', href: '/admin/monitoring', icon: PieChart },
    { title: 'System Settings', href: '/admin/system', icon: Database },
    { title: 'Settings', href: '/admin/settings', icon: Settings },
  ]
}