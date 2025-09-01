import { createClient } from "@/lib/database/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RevenueSection } from './revenue-section'
import { DashboardPanels } from './dashboard-panels'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { Users, Calendar, DollarSign, TrendingUp, Clock, UserCheck, Package, Star, Plus, Settings, BarChart3 } from "lucide-react"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login/salon-owner")

  const { data: salon } = await supabase
    .from("salons")
    .select("id, name")
    .eq("owner_id", user.id)
    .single()

  if (!salon) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardHeader>
            <CardTitle>No Salon Found</CardTitle>
            <CardDescription>Please create a salon first.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]
  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(endOfWeek.getDate() + 6)

  const [
    todayAppointments,
    weeklyAppointments,
    totalCustomers,
    activeStaff,
    weeklyRevenue,
    pendingAppointments,
    totalServices,
    averageRating
  ] = await Promise.all([
    supabase
      .from("appointments")
      .select("id")
      .eq("salon_id", salon.id)
      .gte("start_time", `${today}T00:00:00`)
      .lte("start_time", `${today}T23:59:59`)
      .in("status", ["confirmed", "in_progress"]),
    
    supabase
      .from("appointments")
      .select("id")
      .eq("salon_id", salon.id)
      .gte("start_time", startOfWeek.toISOString())
      .lte("start_time", endOfWeek.toISOString()),
    
    supabase
      .from("customers")
      .select("id")
      .eq("salon_id", salon.id),
    
    supabase
      .from("staff_profiles")
      .select("id")
      .eq("salon_id", salon.id)
      .eq("is_active", true),
    
    supabase
      .from("appointments")
      .select("total_price")
      .eq("salon_id", salon.id)
      .eq("status", "completed")
      .gte("start_time", startOfWeek.toISOString())
      .lte("start_time", endOfWeek.toISOString()),
    
    supabase
      .from("appointments")
      .select("id")
      .eq("salon_id", salon.id)
      .eq("status", "pending"),
    
    supabase
      .from("services")
      .select("id")
      .eq("salon_id", salon.id)
      .eq("is_active", true),
    
    supabase
      .from("reviews")
      .select("rating")
      .eq("salon_id", salon.id)
      .eq("status", "published")
  ])

  const weeklyRevenueTotal = weeklyRevenue.data?.reduce((sum, apt) => sum + (apt.total_price || 0), 0) || 0
  const avgRating = averageRating.data && averageRating.data.length > 0
    ? averageRating.data.reduce((sum, r) => sum + r.rating, 0) / averageRating.data.length
    : 0

  const stats = [
    {
      title: "Today's Appointments",
      value: todayAppointments.data?.length || 0,
      description: "Scheduled for today",
      icon: Calendar,
      color: "text-blue-600"
    },
    {
      title: "Weekly Revenue",
      value: `$${weeklyRevenueTotal.toFixed(2)}`,
      description: "This week's earnings",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Total Customers",
      value: totalCustomers.data?.length || 0,
      description: "Registered customers",
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: "Active Staff",
      value: activeStaff.data?.length || 0,
      description: "Currently active",
      icon: UserCheck,
      color: "text-orange-600"
    },
    {
      title: "Pending Appointments",
      value: pendingAppointments.data?.length || 0,
      description: "Awaiting confirmation",
      icon: Clock,
      color: "text-red-600"
    },
    {
      title: "Weekly Appointments",
      value: weeklyAppointments.data?.length || 0,
      description: "This week total",
      icon: TrendingUp,
      color: "text-indigo-600"
    },
    {
      title: "Active Services",
      value: totalServices.data?.length || 0,
      description: "Available services",
      icon: Package,
      color: "text-pink-600"
    },
    {
      title: "Average Rating",
      value: avgRating.toFixed(1),
      description: `${averageRating.data?.length || 0} reviews`,
      icon: Star,
      color: "text-yellow-600"
    }
  ]

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/salon-admin">Admin</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of {salon.name}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <RevenueSection salonId={salon.id} />

      <DashboardPanels 
        stats={{
          todayAppointments: todayAppointments.data?.length || 0,
          pendingAppointments: pendingAppointments.data?.length || 0,
          activeStaff: activeStaff.data?.length || 0,
          activeServices: totalServices.data?.length || 0
        }}
        salonName={salon.name}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest appointments and bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Activity feed will be implemented here
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger>
                  <Plus className="mr-2 h-4 w-4" />
                  Create
                </MenubarTrigger>
                <MenubarContent>
                  <MenubarItem asChild>
                    <Link href="/salon-admin/appointments/new">
                      <Calendar className="mr-2 h-4 w-4" />
                      New Appointment
                    </Link>
                  </MenubarItem>
                  <MenubarItem asChild>
                    <Link href="/salon-admin/staff?action=add">
                      <Users className="mr-2 h-4 w-4" />
                      Add Staff Member
                    </Link>
                  </MenubarItem>
                  <MenubarItem asChild>
                    <Link href="/salon-admin/services?action=add">
                      <Package className="mr-2 h-4 w-4" />
                      New Service
                    </Link>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              
              <MenubarMenu>
                <MenubarTrigger>
                  <Settings className="mr-2 h-4 w-4" />
                  Manage
                </MenubarTrigger>
                <MenubarContent>
                  <MenubarItem asChild>
                    <Link href="/salon-admin/appointments">
                      <Calendar className="mr-2 h-4 w-4" />
                      Appointments
                    </Link>
                  </MenubarItem>
                  <MenubarItem asChild>
                    <Link href="/salon-admin/staff">
                      <Users className="mr-2 h-4 w-4" />
                      Staff
                    </Link>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem asChild>
                    <Link href="/salon-admin/services">
                      <Package className="mr-2 h-4 w-4" />
                      Services
                    </Link>
                  </MenubarItem>
                  <MenubarItem asChild>
                    <Link href="/salon-admin/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>

              <MenubarMenu>
                <MenubarTrigger>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Reports
                </MenubarTrigger>
                <MenubarContent>
                  <MenubarItem asChild>
                    <Link href="/salon-admin/analytics">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Analytics
                    </Link>
                  </MenubarItem>
                  <MenubarItem asChild>
                    <Link href="/salon-admin/reports">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Financial Reports
                    </Link>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}