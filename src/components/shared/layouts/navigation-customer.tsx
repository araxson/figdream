import {
  Calendar,
  User,
  Heart,
  Clock,
  MapPin,
  CreditCard,
  Bell,
  Star,
  Gift
} from 'lucide-react'
import { NavigationItem } from '@/components/shared/layouts/sidebar-base'

// Customer navigation items for mobile menu or dropdown
export const customerNavigation: NavigationItem[] = [
  {
    title: 'Book Appointment',
    href: '/book',
    icon: Calendar,
  },
  {
    title: 'My Appointments',
    href: '/appointments',
    icon: Clock,
  },
  {
    title: 'My Profile',
    href: '/profile',
    icon: User,
  },
  {
    title: 'Favorites',
    href: '/favorites',
    icon: Heart,
  },
  {
    title: 'Reviews',
    href: '/reviews',
    icon: Star,
  },
  {
    title: 'Rewards',
    href: '/rewards',
    icon: Gift,
  },
  {
    title: 'Payment Methods',
    href: '/payment-methods',
    icon: CreditCard,
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
  },
  {
    title: 'Find Salons',
    href: '/salons',
    icon: MapPin,
  },
]

// Quick actions for customer header
export const customerQuickActions = [
  {
    title: 'Book Now',
    href: '/book',
    icon: Calendar,
    variant: 'default' as const,
  },
  {
    title: 'View Appointments',
    href: '/appointments',
    icon: Clock,
    variant: 'outline' as const,
  },
]