'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui'
import {
  Calendar,
  CreditCard,
  Gift,
  Heart,
  Home,
  MessageSquare,
  Package,
  Search,
  Settings,
  Star,
  User,
  Users,
  Building,
  DollarSign,
  BarChart,
  Shield,
  Clock,
  Scissors,
  Activity,
  Mail,
} from 'lucide-react'
interface CommandSearchProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  userRole?: 'customer' | 'staff' | 'salon_owner' | 'super_admin'
}
export function CommandSearch({ open, onOpenChange, userRole = 'customer' }: CommandSearchProps) {
  const router = useRouter()
  const [searchOpen, setSearchOpen] = React.useState(false)
  React.useEffect(() => {
    if (open !== undefined) {
      setSearchOpen(open)
    }
  }, [open])
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])
  const handleOpenChange = (newOpen: boolean) => {
    setSearchOpen(newOpen)
    onOpenChange?.(newOpen)
  }
  const runCommand = React.useCallback((command: () => void) => {
    setSearchOpen(false)
    command()
  }, [])
  // Define navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      {
        group: 'Navigation',
        items: [
          { icon: Home, label: 'Dashboard', shortcut: 'D', action: () => router.push(`/${userRole}`) },
          { icon: Settings, label: 'Settings', shortcut: 'S', action: () => router.push(`/${userRole}/settings`) },
        ]
      }
    ]
    switch (userRole) {
      case 'customer':
        return [
          ...baseItems,
          {
            group: 'Bookings',
            items: [
              { icon: Calendar, label: 'My Appointments', shortcut: 'A', action: () => router.push('/customer/appointments') },
              { icon: Search, label: 'Find Salons', shortcut: 'F', action: () => router.push('/book') },
              { icon: Clock, label: 'Booking History', action: () => router.push('/customer/appointments?view=history') },
            ]
          },
          {
            group: 'Account',
            items: [
              { icon: Star, label: 'Loyalty Points', action: () => router.push('/customer/loyalty') },
              { icon: Gift, label: 'Gift Cards', action: () => router.push('/customer/gift-cards') },
              { icon: Heart, label: 'Favorites', action: () => router.push('/customer/favorites') },
              { icon: MessageSquare, label: 'My Reviews', action: () => router.push('/customer/reviews') },
              { icon: CreditCard, label: 'Payment Methods', action: () => router.push('/customer/payment-methods') },
              { icon: User, label: 'Profile', shortcut: 'P', action: () => router.push('/customer/profile') },
            ]
          }
        ]
      case 'staff':
        return [
          ...baseItems,
          {
            group: 'Schedule',
            items: [
              { icon: Calendar, label: 'My Schedule', shortcut: 'C', action: () => router.push('/staff-member/schedule') },
              { icon: Clock, label: 'Time Off Requests', action: () => router.push('/staff-member/timeoff') },
              { icon: Users, label: 'My Clients', action: () => router.push('/staff-member/clients') },
            ]
          },
          {
            group: 'Performance',
            items: [
              { icon: BarChart, label: 'My Stats', action: () => router.push('/staff-member/performance') },
              { icon: DollarSign, label: 'Commissions', action: () => router.push('/staff-member/commissions') },
              { icon: Star, label: 'Reviews', action: () => router.push('/staff-member/reviews') },
            ]
          },
          {
            group: 'Services',
            items: [
              { icon: Scissors, label: 'My Services', action: () => router.push('/staff-member/services') },
              { icon: Package, label: 'Products', action: () => router.push('/staff-member/products') },
            ]
          }
        ]
      case 'salon_owner':
        return [
          ...baseItems,
          {
            group: 'Management',
            items: [
              { icon: Building, label: 'Salon Settings', shortcut: 'L', action: () => router.push('/salon-owner/salons') },
              { icon: Users, label: 'Staff Management', shortcut: 'T', action: () => router.push('/salon-owner/staff') },
              { icon: Calendar, label: 'Appointments', shortcut: 'A', action: () => router.push('/salon-owner/appointments') },
              { icon: Scissors, label: 'Services', action: () => router.push('/salon-owner/services') },
            ]
          },
          {
            group: 'Business',
            items: [
              { icon: BarChart, label: 'Analytics', shortcut: 'N', action: () => router.push('/salon-owner/analytics') },
              { icon: DollarSign, label: 'Payments', action: () => router.push('/salon-owner/payments') },
              { icon: MessageSquare, label: 'Reviews', action: () => router.push('/salon-owner/reviews') },
              { icon: Gift, label: 'Promotions', action: () => router.push('/salon-owner/promotions') },
            ]
          },
          {
            group: 'Customers',
            items: [
              { icon: Users, label: 'Customer List', action: () => router.push('/salon-owner/customers') },
              { icon: Star, label: 'Loyalty Program', action: () => router.push('/salon-owner/loyalty') },
              { icon: Mail, label: 'Communications', action: () => router.push('/salon-owner/communications') },
            ]
          }
        ]
      case 'super_admin':
        return [
          ...baseItems,
          {
            group: 'Platform',
            items: [
              { icon: Building, label: 'All Salons', shortcut: 'L', action: () => router.push('/admin/salons') },
              { icon: Users, label: 'All Users', shortcut: 'U', action: () => router.push('/admin/users') },
              { icon: BarChart, label: 'Platform Analytics', shortcut: 'N', action: () => router.push('/admin/analytics') },
              { icon: Activity, label: 'System Health', action: () => router.push('/admin/system-health') },
            ]
          },
          {
            group: 'Management',
            items: [
              { icon: DollarSign, label: 'Billing', action: () => router.push('/admin/billing') },
              { icon: Mail, label: 'Email Templates', action: () => router.push('/admin/email-templates') },
              { icon: Shield, label: 'Security', action: () => router.push('/admin/security') },
            ]
          }
        ]
      default:
        return baseItems
    }
  }
  const navigationItems = getNavigationItems()
  return (
    <CommandDialog open={searchOpen} onOpenChange={handleOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {navigationItems.map((section, index) => (
          <React.Fragment key={section.group}>
            {index > 0 && <CommandSeparator />}
            <CommandGroup heading={section.group}>
              {section.items.map((item) => (
                <CommandItem
                  key={item.label}
                  onSelect={() => runCommand(item.action)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                  {item.shortcut && (
                    <CommandShortcut>⌘{item.shortcut}</CommandShortcut>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  )
}