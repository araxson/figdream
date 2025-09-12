import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  BarChart3,
  Settings,
  Briefcase,
  MapPin,
  Package,
  TrendingUp,
  FileText,
  Scissors,
  Star,
  Clock,
  UserCheck,
  CalendarOff,
  Mail,
  MessageSquare,
} from "lucide-react"

// Navigation for Salon Owners and Managers
// Manages their specific salon(s) only
export const ownerNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Business",
    icon: Scissors,
    items: [
      {
        title: "Locations",
        url: "/dashboard/locations",
        icon: MapPin,
        description: "Manage salon locations",
      },
      {
        title: "Staff",
        url: "/dashboard/staff",
        icon: Users,
        description: "Manage staff members",
      },
      {
        title: "Staff Schedules",
        url: "/dashboard/staff/schedules",
        icon: Clock,
        description: "Manage work schedules",
      },
      {
        title: "Time Off Requests",
        url: "/dashboard/time-off",
        icon: CalendarOff,
        description: "Handle time off requests",
      },
      {
        title: "Staff Earnings",
        url: "/dashboard/staff-earnings",
        icon: DollarSign,
        description: "Track earnings & commissions",
      },
      {
        title: "Services",
        url: "/dashboard/services",
        icon: Briefcase,
        description: "Manage salon services",
      },
      {
        title: "Service Categories",
        url: "/dashboard/service-categories",
        icon: Package,
        description: "Organize service categories",
      },
    ],
  },
  {
    title: "Operations",
    icon: Calendar,
    items: [
      {
        title: "Appointments",
        url: "/dashboard/appointments",
        icon: Calendar,
        description: "Manage bookings",
      },
      {
        title: "Blocked Times",
        url: "/dashboard/blocked-times",
        icon: CalendarOff,
        description: "Block unavailable periods",
      },
      {
        title: "Customers",
        url: "/dashboard/customers",
        icon: UserCheck,
        description: "Customer management",
      },
      {
        title: "Reviews",
        url: "/dashboard/reviews",
        icon: Star,
        description: "Customer feedback",
      },
      {
        title: "Review Requests",
        url: "/dashboard/review-requests",
        icon: MessageSquare,
        description: "Automated review requests",
      },
    ],
  },
  {
    title: "Marketing",
    icon: TrendingUp,
    items: [
      {
        title: "Email Campaigns",
        url: "/dashboard/campaigns/email",
        icon: Mail,
        description: "Email marketing",
      },
      {
        title: "SMS Campaigns",
        url: "/dashboard/campaigns/sms",
        icon: MessageSquare,
        description: "SMS marketing",
      },
    ],
  },
  {
    title: "Analytics",
    icon: BarChart3,
    items: [
      {
        title: "Overview",
        url: "/dashboard/analytics",
        icon: BarChart3,
        description: "Performance metrics",
      },
      {
        title: "Revenue",
        url: "/dashboard/revenue",
        icon: DollarSign,
        description: "Financial analytics",
      },
      {
        title: "Reports",
        url: "/dashboard/reports",
        icon: FileText,
        description: "Detailed reports",
      },
    ],
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
    description: "Salon settings",
  },
]

// Salon Managers have slightly less access than owners
export const managerNavItems = ownerNavItems.filter(item => 
  !["Settings"].includes(item.title)
)