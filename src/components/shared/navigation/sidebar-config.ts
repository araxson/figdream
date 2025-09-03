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
    { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { title: 'Monitoring', href: '/admin/monitoring', icon: BarChart3 },
    { title: 'System', href: '/admin/system', icon: Settings },
    { title: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
    { title: 'Audit', href: '/admin/audit', icon: Users }
  ],
  salon: [
    { title: 'Dashboard', href: '/salon', icon: LayoutDashboard },
    { title: 'Appointments', href: '/salon/appointments', icon: Calendar },
    { title: 'Customers', href: '/salon/customers', icon: Users },
    { title: 'Staff', href: '/salon/staff', icon: Users },
    { title: 'Services', href: '/salon/services', icon: Star },
    { title: 'Analytics', href: '/salon/analytics', icon: BarChart3 },
    { title: 'Marketing', href: '/salon/marketing', icon: Gift },
    { title: 'Settings', href: '/salon/settings', icon: Settings }
  ],
  location: [
    { title: 'Dashboard', href: '/location', icon: LayoutDashboard },
    { title: 'Appointments', href: '/location/appointments', icon: Calendar },
    { title: 'Staff', href: '/location/staff', icon: Users },
    { title: 'Analytics', href: '/location/analytics', icon: BarChart3 },
    { title: 'Settings', href: '/location/settings', icon: Settings }
  ],
  staff: [
    { title: 'Dashboard', href: '/staff', icon: LayoutDashboard },
    { title: 'Schedule', href: '/staff/schedule', icon: Calendar },
    { title: 'Appointments', href: '/staff/appointments', icon: Calendar },
    { title: 'Earnings', href: '/staff/earnings', icon: CreditCard },
    { title: 'Profile', href: '/staff/profile', icon: Users }
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
