import { Home, Search, Calendar, BookOpen, Users, BarChart3, Shield, Settings } from 'lucide-react'

export const getNavigationItems = (role?: string) => {
  if (!role) {
    return [
      { title: 'Home', href: '/', icon: Home },
      { title: 'Browse Salons', href: '/browse', icon: Search },
      { title: 'Services', href: '/services', icon: BookOpen },
      { title: 'About', href: '/about', icon: Users },
    ]
  }

  switch (role) {
    case 'customer':
      return [
        { title: 'Dashboard', href: '/customer', icon: Home },
        { title: 'Book Appointment', href: '/customer/book', icon: Calendar },
        { title: 'My Appointments', href: '/customer/appointments', icon: BookOpen },
        { title: 'Favorites', href: '/customer/favorites', icon: Users },
        { title: 'Preferences', href: '/customer/preferences', icon: Settings },
      ]
    case 'staff':
      return [
        { title: 'Dashboard', href: '/staff', icon: Home },
        { title: 'Schedule', href: '/staff/schedule', icon: Calendar },
        { title: 'Appointments', href: '/staff/appointments', icon: BookOpen },
        { title: 'Clients', href: '/staff/clients', icon: Users },
        { title: 'Analytics', href: '/staff/analytics', icon: BarChart3 },
      ]
    case 'admin':
      return [
        { title: 'Dashboard', href: '/admin', icon: Home },
        { title: 'Salon Management', href: '/admin/salon', icon: Settings },
        { title: 'Staff', href: '/admin/staff', icon: Users },
        { title: 'Services', href: '/admin/services', icon: BookOpen },
        { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      ]
    case 'super_admin':
      return [
        { title: 'Dashboard', href: '/admin', icon: Home },
        { title: 'Platform Overview', href: '/admin/platform', icon: Shield },
        { title: 'Salons', href: '/admin/salons', icon: Settings },
        { title: 'Users', href: '/admin/users', icon: Users },
        { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      ]
    default:
      return []
  }
}

export const getQuickActions = (role?: string) => {
  if (!role) {
    return [
      { title: 'Sign In', href: '/login', icon: Users, variant: 'ghost' as const },
      { title: 'Sign Up', href: '/register', icon: Users, variant: 'default' as const },
    ]
  }

  switch (role) {
    case 'customer':
      return [
        { title: 'Book Now', href: '/customer/book', icon: Calendar, variant: 'default' as const },
      ]
    case 'staff':
      return [
        { title: 'View Schedule', href: '/staff/schedule', icon: Calendar, variant: 'default' as const },
      ]
    case 'admin':
    case 'super_admin':
      return [
        { title: 'Manage', href: '/admin', icon: Settings, variant: 'default' as const },
      ]
    default:
      return []
  }
}