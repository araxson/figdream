import {
  LayoutDashboard,
  Calendar,
  Users,
  DollarSign,
  Settings,
  Clock,
} from "lucide-react"

export const staffNavItems = [
  {
    title: "Dashboard",
    url: "/staff",
    icon: LayoutDashboard,
  },
  {
    title: "Schedule",
    url: "/staff/schedule",
    icon: Calendar,
  },
  {
    title: "Appointments",
    url: "/staff/appointments",
    icon: Clock,
  },
  {
    title: "Customers",
    url: "/staff/customers",
    icon: Users,
  },
  {
    title: "Profile",
    url: "/staff/profile",
    icon: Settings,
  },
  {
    title: "Tips & Earnings",
    url: "/staff/tips",
    icon: DollarSign,
  },
]