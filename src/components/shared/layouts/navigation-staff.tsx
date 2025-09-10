import {
  LayoutDashboard,
  Calendar,
  Users,
  DollarSign,
  Clock,
  CalendarOff,
  UserCircle,
  Star,
  MessageSquare,
  BarChart3
} from 'lucide-react'
import { NavigationItem } from '@/components/shared/layouts/sidebar-base'

export const staffNavigation: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/staff',
    icon: LayoutDashboard,
  },
  {
    title: 'My Work',
    icon: Calendar,
    items: [
      {
        title: 'My Schedule',
        href: '/staff/schedule',
        icon: Calendar,
      },
      {
        title: 'Appointments',
        href: '/staff/appointments',
        icon: Clock,
      },
      {
        title: 'My Customers',
        href: '/staff/customers',
        icon: Users,
      },
    ],
  },
  {
    title: 'Earnings',
    icon: DollarSign,
    items: [
      {
        title: 'Overview',
        href: '/staff/earnings',
        icon: DollarSign,
      },
      {
        title: 'Tips',
        href: '/staff/tips',
        icon: Star,
      },
      {
        title: 'Performance',
        href: '/staff/performance',
        icon: BarChart3,
      },
    ],
  },
  {
    title: 'Personal',
    icon: UserCircle,
    items: [
      {
        title: 'Profile',
        href: '/staff/profile',
        icon: UserCircle,
      },
      {
        title: 'Time Off',
        href: '/staff/time-off',
        icon: CalendarOff,
      },
      {
        title: 'Messages',
        href: '/staff/messages',
        icon: MessageSquare,
        badge: 2,
      },
    ],
  },
]