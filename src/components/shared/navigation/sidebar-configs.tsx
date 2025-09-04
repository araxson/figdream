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
  PieChart,
  CreditCard
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
    { title: 'Dashboard', href: '/salon-owner/dashboard', icon: Home },
    {
      title: 'Appointments',
      href: '/salon-owner/appointments',
      icon: Calendar,
      subItems: [
        { title: 'All Appointments', href: '/salon-owner/appointments' },
        { title: 'Calendar View', href: '/salon-owner/appointments/calendar' },
        { title: 'Appointment Notes', href: '/salon-owner/appointments/notes' },
      ],
    },
    { title: 'Customers', href: '/salon-owner/customers', icon: Users },
    {
      title: 'Services',
      href: '/salon-owner/services',
      icon: Package,
      subItems: [
        { title: 'All Services', href: '/salon-owner/services' },
        { title: 'Categories', href: '/salon-owner/categories' },
        { title: 'Pricing', href: '/salon-owner/services/pricing' },
      ],
    },
    {
      title: 'Staff',
      href: '/salon-owner/staff',
      icon: UserCheck,
      subItems: [
        { title: 'Team Members', href: '/salon-owner/staff' },
        { title: 'Schedules', href: '/salon-owner/staff/schedule' },
        { title: 'Performance', href: '/salon-owner/staff/performance' },
        { title: 'Specialties', href: '/salon-owner/staff/specialties' },
      ],
    },
    { title: 'Time Off', href: '/salon-owner/time-off', icon: CalendarOff },
    { title: 'Blocked Times', href: '/salon-owner/blocked-times', icon: Clock },
    { title: 'Locations', href: '/salon-owner/locations', icon: MapPin },
    {
      title: 'Loyalty Program',
      href: '/salon-owner/loyalty',
      icon: Trophy,
      subItems: [
        { title: 'Overview', href: '/salon-owner/loyalty' },
        { title: 'Rewards', href: '/salon-owner/loyalty/rewards' },
        { title: 'Transactions', href: '/salon-owner/loyalty/transactions' },
        { title: 'Ledger', href: '/salon-owner/loyalty/ledger' },
      ],
    },
    {
      title: 'Marketing',
      href: '/salon-owner/marketing',
      icon: Megaphone,
      subItems: [
        { title: 'Campaigns', href: '/salon-owner/marketing' },
        { title: 'Analytics', href: '/salon-owner/marketing/analytics' },
        { title: 'SMS Opt-outs', href: '/salon-owner/marketing/sms-opt-outs' },
      ],
    },
    {
      title: 'Analytics',
      href: '/salon-owner/analytics',
      icon: BarChart3,
      subItems: [
        { title: 'Overview', href: '/salon-owner/analytics' },
        { title: 'Metrics Overview', href: '/salon-owner/analytics/metrics-overview' },
        { title: 'Customer Insights', href: '/salon-owner/analytics/customer-insights' },
        { title: 'Predictions', href: '/salon-owner/dashboard/predictions' },
      ],
    },
    { title: 'Data Export', href: '/salon-owner/data-export', icon: Archive },
    { title: 'Settings', href: '/salon-owner/settings', icon: Settings },
  ]
}
export const staffSidebarConfig: AppSidebarConfig = {
  title: 'Staff Portal',
  subtitle: 'Your work schedule',
  icon: UserCheck,
  navigation: [
    { title: 'Dashboard', href: '/staff-member', icon: Home },
    { title: 'Appointments', href: '/staff-member/appointments', icon: Calendar },
    { title: 'Schedule', href: '/staff-member/schedule', icon: Clock },
    { title: 'Earnings', href: '/staff-member/earnings', icon: DollarSign },
    { title: 'Time Off', href: '/staff-member/time-off', icon: CalendarOff },
    { title: 'Performance', href: '/staff-member/performance', icon: TrendingUp },
    { title: 'Profile', href: '/staff-member/profile', icon: User },
    { title: 'Settings', href: '/staff-member/settings', icon: Settings },
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
    { title: 'Dashboard', href: '/super-admin', icon: Home },
    { title: 'Analytics', href: '/super-admin/analytics', icon: BarChart3 },
    { title: 'Audit Logs', href: '/super-admin/audit', icon: FileText },
    { title: 'Subscriptions', href: '/super-admin/subscriptions', icon: ShoppingCart },
    { title: 'Users', href: '/super-admin/users', icon: Users },
    { title: 'Salons', href: '/super-admin/salons', icon: Store },
    { title: 'System Health', href: '/super-admin/system-health', icon: Monitor },
    { title: 'Email Templates', href: '/super-admin/email-templates', icon: MessageSquare },
    { title: 'Billing', href: '/super-admin/billing', icon: CreditCard },
    { title: 'Monitoring', href: '/super-admin/monitoring', icon: PieChart },
    { title: 'System Settings', href: '/super-admin/system', icon: Database },
    { title: 'Settings', href: '/super-admin/settings', icon: Settings },
  ]
}