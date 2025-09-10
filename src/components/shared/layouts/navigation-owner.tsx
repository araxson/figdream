import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  DollarSign,
  BarChart3,
  Settings,
  Star,
  Megaphone,
  Scissors,
  MapPin,
  FileText,
  TrendingUp
} from 'lucide-react'
import { NavigationItem } from '@/components/shared/layouts/sidebar-base'

export const ownerNavigation: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Business Management',
    icon: Scissors,
    items: [
      {
        title: 'Appointments',
        href: '/dashboard/appointments',
        icon: Calendar,
      },
      {
        title: 'Customers',
        href: '/dashboard/customers',
        icon: Users,
      },
      {
        title: 'Staff',
        href: '/dashboard/staff',
        icon: UserCheck,
      },
      {
        title: 'Services',
        href: '/dashboard/services',
        icon: Scissors,
      },
    ],
  },
  {
    title: 'Revenue & Analytics',
    icon: TrendingUp,
    items: [
      {
        title: 'Revenue',
        href: '/dashboard/revenue',
        icon: DollarSign,
      },
      {
        title: 'Analytics',
        href: '/dashboard/analytics',
        icon: BarChart3,
      },
      {
        title: 'Reports',
        href: '/dashboard/reports',
        icon: FileText,
      },
    ],
  },
  {
    title: 'Marketing',
    icon: Megaphone,
    items: [
      {
        title: 'Campaigns',
        href: '/dashboard/campaigns',
        icon: Megaphone,
      },
      {
        title: 'Reviews',
        href: '/dashboard/reviews',
        icon: Star,
      },
    ],
  },
  {
    title: 'Settings',
    icon: Settings,
    items: [
      {
        title: 'Salon Settings',
        href: '/dashboard/settings/salon',
        icon: Settings,
      },
      {
        title: 'Locations',
        href: '/dashboard/settings/locations',
        icon: MapPin,
      },
    ],
  },
]

// Manager navigation (subset of owner)
export const managerNavigation: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Operations',
    icon: Calendar,
    items: [
      {
        title: 'Appointments',
        href: '/dashboard/appointments',
        icon: Calendar,
      },
      {
        title: 'Customers',
        href: '/dashboard/customers',
        icon: Users,
      },
      {
        title: 'Staff',
        href: '/dashboard/staff',
        icon: UserCheck,
      },
    ],
  },
  {
    title: 'Reports',
    href: '/dashboard/reports',
    icon: FileText,
  },
  {
    title: 'Reviews',
    href: '/dashboard/reviews',
    icon: Star,
  },
]