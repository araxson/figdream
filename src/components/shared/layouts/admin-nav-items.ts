import {
  LayoutDashboard,
  Users,
  Activity,
  FileText,
  Building2,
  Settings,
  BarChart3,
  Shield,
  AlertTriangle,
  Monitor,
  Grid3X3,
  Mail,
  MessageSquare,
  DollarSign,
  HelpCircle,
  CreditCard,
  Briefcase,
  Calendar,
  Store,
  Heart,
  AlertCircle,
} from "lucide-react"

// Navigation for Super Admin (Platform Owner)
// Can manage ALL salons and platform-wide settings
export const adminNavItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Salon Management",
    icon: Store,
    items: [
      {
        title: "Appointments",
        url: "/dashboard/appointments",
        icon: Calendar,
        description: "Manage any salon's bookings",
      },
      {
        title: "Staff",
        url: "/dashboard/staff",
        icon: Users,
        description: "Manage any salon's staff",
      },
      {
        title: "Services",
        url: "/dashboard/services",
        icon: Briefcase,
        description: "Manage any salon's services",
      },
      {
        title: "Blocked Times",
        url: "/dashboard/blocked-times",
        icon: Calendar,
        description: "Manage any salon's schedule blocks",
      },
      {
        title: "Review Requests",
        url: "/dashboard/review-requests",
        icon: MessageSquare,
        description: "Manage any salon's review requests",
      },
    ],
  },
  {
    title: "Platform Management",
    icon: Shield,
    items: [
      {
        title: "All Salons",
        url: "/admin/salons",
        icon: Building2,
        description: "Manage all salons on platform",
      },
      {
        title: "Platform Users",
        url: "/admin/users",
        icon: Users,
        description: "Manage all users across platform",
      },
      {
        title: "Service Categories",
        url: "/admin/categories",
        icon: Grid3X3,
        description: "Platform-wide service categories",
      },
      {
        title: "Pricing Plans",
        url: "/admin/pricing",
        icon: DollarSign,
        description: "Platform subscription plans",
      },
      {
        title: "Subscriptions",
        url: "/admin/subscriptions",
        icon: CreditCard,
        description: "Active salon subscriptions",
      },
    ],
  },
  {
    title: "Marketing",
    icon: Mail,
    items: [
      {
        title: "Email Campaigns",
        url: "/admin/campaigns/email",
        icon: Mail,
      },
      {
        title: "SMS Campaigns",
        url: "/admin/campaigns/sms",
        icon: MessageSquare,
      },
    ],
  },
  {
    title: "Monitoring",
    icon: Monitor,
    items: [
      {
        title: "System Health",
        url: "/admin/system-health",
        icon: Heart,
        description: "Platform health monitoring",
      },
      {
        title: "Error Logs",
        url: "/admin/error-logs",
        icon: AlertCircle,
        description: "System error tracking",
      },
      {
        title: "Alerts",
        url: "/admin/alerts",
        icon: AlertTriangle,
      },
      {
        title: "Audit Logs",
        url: "/admin/audit-logs",
        icon: Activity,
      },
      {
        title: "Analytics",
        url: "/admin/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Configuration",
    icon: Settings,
    items: [
      {
        title: "Platform Settings",
        url: "/admin/settings",
        icon: Settings,
        description: "Global platform configuration",
      },
      {
        title: "FAQ Management",
        url: "/admin/faq",
        icon: HelpCircle,
        description: "Platform FAQ content",
      },
    ],
  },
]