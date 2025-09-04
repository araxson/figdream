import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings,
  CreditCard,
  BarChart3,
  Gift,
  Bell,
  Star
} from 'lucide-react'
export const sidebarConfig = {
  admin: [
    { title: 'Dashboard', href: '/super-admin', icon: LayoutDashboard },
    { title: 'Monitoring', href: '/super-admin/monitoring', icon: BarChart3 },
    { title: 'System', href: '/super-admin/system', icon: Settings },
    { title: 'Subscriptions', href: '/super-admin/subscriptions', icon: CreditCard },
    { title: 'Audit', href: '/super-admin/audit', icon: Users }
  ],
  salon: [
    { title: 'Dashboard', href: '/salon-owner', icon: LayoutDashboard },
    { title: 'Appointments', href: '/salon-owner/appointments', icon: Calendar },
    { title: 'Customers', href: '/salon-owner/customers', icon: Users },
    { title: 'Staff', href: '/salon-owner/staff', icon: Users },
    { title: 'Services', href: '/salon-owner/services', icon: Star },
    { title: 'Analytics', href: '/salon-owner/analytics', icon: BarChart3 },
    { title: 'Marketing', href: '/salon-owner/marketing', icon: Gift },
    { title: 'Settings', href: '/salon-owner/settings', icon: Settings }
  ],
  location: [
    { title: 'Dashboard', href: '/location-manager', icon: LayoutDashboard },
    { title: 'Appointments', href: '/location-manager/appointments', icon: Calendar },
    { title: 'Staff', href: '/location-manager/staff', icon: Users },
    { title: 'Analytics', href: '/location-manager/analytics', icon: BarChart3 },
    { title: 'Settings', href: '/location-manager/settings', icon: Settings }
  ],
  staff: [
    { title: 'Dashboard', href: '/staff-member', icon: LayoutDashboard },
    { title: 'Schedule', href: '/staff-member/schedule', icon: Calendar },
    { title: 'Appointments', href: '/staff-member/appointments', icon: Calendar },
    { title: 'Earnings', href: '/staff-member/earnings', icon: CreditCard },
    { title: 'Profile', href: '/staff-member/profile', icon: Users }
  ],
  customer: [
    { title: 'Dashboard', href: '/customer', icon: LayoutDashboard },
    { title: 'Appointments', href: '/customer/appointments', icon: Calendar },
    { title: 'Favorites', href: '/customer/favorites', icon: Star },
    { title: 'Loyalty', href: '/customer/loyalty', icon: Gift },
    { title: 'Notifications', href: '/customer/notifications', icon: Bell },
    { title: 'Settings', href: '/customer/settings', icon: Settings }
  ]
}
