import {
  LayoutDashboard,
  Users,
  Activity,
  FileText,
  Building2,
  Settings,
  BarChart3,
  Shield,
  Database,
  Globe,
  AlertTriangle,
  Monitor
} from 'lucide-react'
import { NavigationItem } from '@/components/shared/layouts/sidebar-base'

export const adminNavigation: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'System Management',
    icon: Monitor,
    items: [
      {
        title: 'All Salons',
        href: '/admin/salons',
        icon: Building2,
      },
      {
        title: 'User Management',
        href: '/admin/users',
        icon: Users,
      },
      {
        title: 'System Settings',
        href: '/admin/settings',
        icon: Settings,
      },
    ],
  },
  {
    title: 'Analytics & Monitoring',
    icon: BarChart3,
    items: [
      {
        title: 'System Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
      },
      {
        title: 'API Usage',
        href: '/admin/api-usage',
        icon: Activity,
      },
      {
        title: 'Performance',
        href: '/admin/performance',
        icon: Globe,
      },
    ],
  },
  {
    title: 'Security & Compliance',
    icon: Shield,
    items: [
      {
        title: 'Audit Logs',
        href: '/admin/audit-logs',
        icon: FileText,
      },
      {
        title: 'Security Alerts',
        href: '/admin/alerts',
        icon: AlertTriangle,
      },
      {
        title: 'Database',
        href: '/admin/database',
        icon: Database,
      },
    ],
  },
]