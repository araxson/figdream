"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardStats } from './dashboard-stats'
import { 
  Users, 
  Store, 
  Calendar,
  Clock,
  Star,
  BarChart3,
  Settings,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Database,
  Server,
  Lock,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { format, startOfDay, startOfMonth, startOfWeek, formatDistanceToNow } from 'date-fns'

interface DashboardProps {
  userRole: 'super_admin' | 'salon_owner' | 'salon_manager' | 'staff' | 'customer'
  salonId?: string
  initialStats?: Record<string, unknown>
  initialSystemStatus?: any[]
  initialActivity?: any[]
}

interface SystemStatus {
  name: string
  status: 'operational' | 'degraded' | 'down'
  uptime: number
  icon: React.ComponentType<{ className?: string }>
}

interface Activity {
  id: string
  user: string
  action: string
  timestamp: string
  type: 'create' | 'update' | 'delete' | 'login' | 'alert' | 'system'
  message: string
  time: string
  icon: React.ComponentType<{ className?: string }>
}

interface Alert {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  timestamp: string
}

interface TopService {
  id: string
  name: string
  bookings: number
  revenue: number
  change: number
}

interface ScheduleItem {
  id: string
  time: string
  customer: string
  service: string
  duration: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
}

interface StaffMetric {
  id: string
  name: string
  appointments: number
  revenue: number
  rating: number
}

interface Appointment {
  id: string
  time: string
  customer: string
  service: string
  staff?: string
  date?: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
}

interface DashboardData {
  stats?: Record<string, number | string>
  appointments?: Appointment[]
  recentActivity?: Activity[]
  topServices?: TopService[]
  alerts?: Alert[]
  todaysSchedule?: ScheduleItem[]
  todaysAppointments?: Appointment[]
  upcomingAppointments?: Appointment[]
  staffMetrics?: StaffMetric[]
  revenue?: Record<string, number>
  systemStatus?: SystemStatus[]
}

export function Dashboard({ userRole, salonId, initialStats, initialSystemStatus, initialActivity }: DashboardProps) {
  const [stats, setStats] = useState<Record<string, unknown>>(initialStats || {})
  const [loading, setLoading] = useState(!initialStats)
  
  // Map icons for system status
  const systemStatusWithIcons = initialSystemStatus?.map(status => ({
    ...status,
    icon: status.name === 'Database' ? Database :
          status.name === 'API Services' ? Server :
          status.name === 'Authentication' ? Lock :
          status.name === 'Payment Gateway' ? DollarSign :
          Server
  }))
  
  // Map icons for recent activity
  const recentActivityWithIcons = initialActivity?.map(activity => ({
    ...activity,
    icon: activity.type === 'create' ? Store :
          activity.type === 'update' ? Users :
          activity.type === 'delete' ? AlertCircle :
          activity.type === 'login' ? Lock :
          Database
  }))
  
  const [additionalData, setAdditionalData] = useState<DashboardData>({
    systemStatus: systemStatusWithIcons,
    recentActivity: recentActivityWithIcons
  })
  const supabase = createClient()

  useEffect(() => {
    // Skip fetching if we have initial data (server-side rendered)
    if (userRole === 'super_admin' && initialStats) {
      return
    }
    
    async function fetchDashboardData() {
      try {
        setLoading(true)
        const today = startOfDay(new Date())
        const weekStart = startOfWeek(new Date())
        const monthStart = startOfMonth(new Date())

        switch (userRole) {
          case 'super_admin':
            if (!initialStats) {
              await fetchAdminData()
            }
            break
          case 'salon_owner':
          case 'salon_manager':
            await fetchOwnerData(today, monthStart)
            break
          case 'staff':
            await fetchStaffData(today, weekStart, monthStart)
            break
          case 'customer':
            await fetchCustomerData()
            break
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    async function fetchAdminData() {
      try {
        // Fetch real admin stats from the API
        const response = await fetch('/api/admin/dashboard')
        if (!response.ok) throw new Error('Failed to fetch admin stats')
        
        const data = await response.json()
        
        // Set the real stats
        setStats(data.stats || {})
        
        // Fetch recent audit logs for activity
        const { data: auditLogs } = await supabase
          .from('audit_logs')
          .select(`
            *,
            user:profiles!audit_logs_user_id_fkey(email, full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(10)

        // For system status, we'll use a simplified approach
        // since system_health_metrics table structure is different
        setAdditionalData({
          systemStatus: [
            { 
              name: "Database", 
              status: "operational", 
              uptime: 99.99, 
              icon: Database 
            },
            { 
              name: "API Services", 
              status: "operational", 
              uptime: 99.95, 
              icon: Server 
            },
            { 
              name: "Authentication", 
              status: "operational", 
              uptime: 100, 
              icon: Lock 
            },
            { 
              name: "Payment Gateway", 
              status: "operational", 
              uptime: 99.9, 
              icon: DollarSign 
            },
          ],
          recentActivity: auditLogs?.map((log) => ({
            id: log.id,
            user: log.user?.email || 'System',
            action: log.action,
            timestamp: log.created_at,
            type: log.action === 'CREATE' ? 'create' : 
                  log.action === 'UPDATE' ? 'update' : 
                  log.action === 'DELETE' ? 'delete' : 
                  log.action === 'LOGIN' ? 'login' :
                  'system' as const,
            message: `${log.action} ${log.entity_type}${log.entity_id ? ` #${log.entity_id}` : ''}`,
            time: formatDistanceToNow(new Date(log.created_at), { addSuffix: true }),
            icon: log.action === 'CREATE' ? Store :
                  log.action === 'UPDATE' ? Users :
                  log.action === 'DELETE' ? AlertCircle :
                  log.action === 'LOGIN' ? Lock :
                  Database
          })) || []
        })
      } catch (error) {
        console.error('Error fetching admin data:', error)
        // Set default values on error
        setStats({
          totalUsers: 0,
          totalSalons: 0,
          totalRevenue: 0,
          systemHealth: 0
        })
      }
    }

    async function fetchOwnerData(today: Date, monthStart: Date) {
      try {
        // Fetch today's appointments
        const { data: todayAppts } = await supabase
          .from('appointments')
          .select(`
            id,
            start_time,
            computed_total_price,
            status,
            customer:profiles!appointments_customer_id_fkey (first_name, last_name),
            appointment_services (services (name)),
            staff:staff_profiles!appointments_staff_id_fkey (user:profiles!staff_profiles_user_id_fkey (first_name, last_name))
          `)
          .gte('start_time', today.toISOString())
          .lt('start_time', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
          .order('start_time')

        // Fetch monthly revenue
        const { data: monthlyAppts } = await supabase
          .from('appointments')
          .select('computed_total_price')
          .gte('start_time', monthStart.toISOString())
          .eq('status', 'completed')

        // Fetch other data
        const { count: customerCount } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })

        const { data: reviews } = await supabase
          .from('reviews')
          .select('rating')

        const { count: staffCount } = await supabase
          .from('staff_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)

        const { count: serviceCount } = await supabase
          .from('services')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)

        // Calculate stats
        const todayRevenue = todayAppts?.reduce((sum, apt) => sum + Number(apt.computed_total_price || 0), 0) || 0
        const monthlyRevenue = monthlyAppts?.reduce((sum, apt) => sum + Number(apt.computed_total_price || 0), 0) || 0
        const avgRating = reviews?.length ? 
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

        setStats({
          todayRevenue,
          monthlyRevenue,
          todayAppointments: todayAppts?.length || 0,
          monthlyEarnings: monthlyRevenue,
          totalCustomers: customerCount || 0,
          averageRating: Math.round(avgRating * 10) / 10,
          totalReviews: reviews?.length || 0,
          regularClients: 0,
          activeStaff: staffCount || 0,
          totalServices: serviceCount || 0
        })

        // Format today's appointments for additional data
        setAdditionalData({
          todaysAppointments: (todayAppts || []).slice(0, 4).map(apt => {
            const customer = Array.isArray(apt.customer) ? apt.customer[0] : apt.customer
            const staff = Array.isArray(apt.staff) ? apt.staff[0] : apt.staff
            const staffUser = staff?.user ? (Array.isArray(staff.user) ? staff.user[0] : staff.user) : null
            
            return {
              id: apt.id,
              time: format(new Date(apt.start_time), 'HH:mm'),
              customer: customer ? 
                `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unknown' : 'Unknown',
              service: apt.appointment_services?.[0]?.services?.name || 'Unknown Service',
              staff: staffUser ? 
                `${staffUser.first_name || ''} ${staffUser.last_name || ''}`.trim() || 'Unknown' : 'Unknown',
              status: apt.status as Appointment['status']
            }
          })
        })
      } catch (error) {
        console.error('Error fetching owner data:', error)
      }
    }

    async function fetchStaffData(today: Date, weekStart: Date, monthStart: Date) {
      try {
        const { data: session } = await supabase.auth.getSession()
        if (!session?.session?.user) return

        const staffId = session.session.user.id

        // Fetch today's appointments
        const { data: todayAppts } = await supabase
          .from('appointments')
          .select(`
            id,
            start_time,
            status,
            computed_total_price,
            computed_total_duration,
            customers (first_name, last_name),
            appointment_services (services(name))
          `)
          .eq('staff_id', staffId)
          .gte('start_time', today.toISOString())
          .lt('start_time', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
          .order('start_time')

        // Fetch weekly and monthly earnings
        const { data: weeklyAppts } = await supabase
          .from('appointments')
          .select('computed_total_price')
          .eq('staff_id', staffId)
          .eq('status', 'completed')
          .gte('start_time', weekStart.toISOString())

        const { data: monthlyAppts } = await supabase
          .from('appointments')
          .select('computed_total_price')
          .eq('staff_id', staffId)
          .eq('status', 'completed')
          .gte('start_time', monthStart.toISOString())

        // Fetch reviews
        const { data: reviews } = await supabase
          .from('reviews')
          .select('rating, comment, created_at, customers (first_name, last_name)')
          .eq('staff_id', staffId)
          .order('created_at', { ascending: false })
          .limit(10)

        // Calculate stats
        const completedToday = todayAppts?.filter(apt => apt.status === 'completed').length || 0
        const upcomingToday = todayAppts?.filter(apt => apt.status === 'confirmed' || apt.status === 'pending').length || 0
        const weeklyEarnings = weeklyAppts?.reduce((sum, apt) => sum + Number(apt.computed_total_price || 0), 0) || 0
        const monthlyEarnings = monthlyAppts?.reduce((sum, apt) => sum + Number(apt.computed_total_price || 0), 0) || 0
        const avgRating = reviews?.length ? 
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

        setStats({
          todayAppointments: todayAppts?.length || 0,
          completedToday,
          upcomingToday,
          weeklyEarnings,
          monthlyEarnings,
          averageRating: Math.round(avgRating * 10) / 10,
          totalReviews: reviews?.length || 0,
          regularClients: 0
        })

        // Format schedule and reviews for additional data
        setAdditionalData({
          todaysSchedule: (todayAppts || []).map(apt => ({
            id: apt.id,
            time: format(new Date(apt.start_time), 'HH:mm'),
            customer: (apt.customers && typeof apt.customers === 'object' && 'first_name' in apt.customers && 'last_name' in apt.customers) ? 
              `${(apt.customers as {first_name?: string, last_name?: string}).first_name || ''} ${(apt.customers as {first_name?: string, last_name?: string}).last_name || ''}`.trim() : 'Unknown',
            service: apt.appointment_services?.[0]?.services?.name || 'Unknown Service',
            duration: apt.computed_total_duration ? `${apt.computed_total_duration} min` : '30 min',
            status: (apt.status === 'completed' ? 'completed' : 
                   apt.status === 'in_progress' ? 'in-progress' : 
                   apt.status === 'cancelled' ? 'cancelled' : 'scheduled') as ScheduleItem['status']
          }))
        })
      } catch (error) {
        console.error('Error fetching staff data:', error)
      }
    }

    async function fetchCustomerData() {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch customer's appointments
        const { data: appointments } = await supabase
          .from('appointments')
          .select(`
            id,
            start_time,
            status,
            computed_total_price,
            service:appointment_services(
              services(name)
            ),
            staff:staff_profiles(
              user:profiles(first_name, last_name)
            ),
            salon:salons(name)
          `)
          .eq('customer_id', user.id)
          .order('start_time', { ascending: false })

        // Fetch customer profile for additional info
        const { data: customerProfile } = await supabase
          .from('customers')
          .select('*')
          .eq('id', user.id)
          .single()

        // Calculate stats
        const now = new Date()
        const upcoming = appointments?.filter(apt => 
          new Date(apt.start_time) > now && 
          (apt.status === 'confirmed' || apt.status === 'pending')
        ) || []
        
        const completed = appointments?.filter(apt => 
          apt.status === 'completed'
        ) || []
        
        const totalSpent = completed.reduce((sum, apt) => 
          sum + (apt.computed_total_price || 0), 0
        )

        // Get member since date
        const { data: profile } = await supabase
          .from('profiles')
          .select('created_at')
          .eq('id', user.id)
          .single()
        
        const memberSinceMonths = profile?.created_at ? 
          Math.floor((now.getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0

        setStats({
          totalBookings: appointments?.length || 0,
          upcomingAppointments: upcoming.length,
          completedAppointments: completed.length,
          loyaltyPoints: 0, // Loyalty system not yet implemented
          totalSpent: Math.round(totalSpent),
          favoriteService: "Not set", // Would need to calculate from appointments
          memberSince: memberSinceMonths,
          activeOffers: 0, // Would need offers table
          membershipLevel: customerProfile?.is_vip ? "VIP" : "Standard",
          nextRewardAt: 50 // Placeholder for loyalty system
        })

        // Format upcoming appointments
        setAdditionalData({
          upcomingAppointments: upcoming.slice(0, 3).map(apt => ({
            id: apt.id,
            service: apt.service?.[0]?.services?.name || 'Service',
            date: format(new Date(apt.start_time), 'MMM d, yyyy'),
            time: format(new Date(apt.start_time), 'h:mm a'),
            staff: apt.staff?.user ? 
              `${apt.staff.user.first_name} ${apt.staff.user.last_name}` : 'Staff',
            customer: 'You',
            status: apt.status as 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
          }))
        })
      } catch (error) {
        console.error('Error fetching customer data:', error)
        // Set default values on error
        setStats({
          totalBookings: 0,
          upcomingAppointments: 0,
          completedAppointments: 0,
          loyaltyPoints: 0,
          totalSpent: 0
        })
      }
    }

    fetchDashboardData()
  }, [supabase, userRole, salonId, initialStats])

  const renderRoleSpecificContent = () => {
    switch (userRole) {
      case 'super_admin':
        return renderAdminContent()
      case 'salon_owner':
      case 'salon_manager':
        return renderOwnerContent()
      case 'staff':
        return renderStaffContent()
      case 'customer':
        return renderCustomerContent()
      default:
        return null
    }
  }

  const renderAdminContent = () => (
    <>
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks and navigation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={cn("grid gap-3 md:grid-cols-2 lg:grid-cols-4")}>
            <Button variant="outline" className={cn("justify-start h-auto py-3")} asChild>
              <Link href="/admin/users">
                <div className={cn("flex items-start gap-3 w-full")}>
                  <Users className={cn("h-5 w-5 mt-0.5")} />
                  <div className={cn("text-left")}>
                    <div className={cn("font-medium")}>Manage Users</div>
                    <div className={cn("text-xs text-muted-foreground")}>
                      {String(stats.totalUsers || 0)} total users
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className={cn("justify-start h-auto py-3")} asChild>
              <Link href="/admin/salons">
                <div className={cn("flex items-start gap-3 w-full")}>
                  <Store className={cn("h-5 w-5 mt-0.5")} />
                  <div className={cn("text-left")}>
                    <div className={cn("font-medium")}>Manage Salons</div>
                    <div className={cn("text-xs text-muted-foreground")}>
                      {String(stats.totalSalons || 0)} active salons
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className={cn("justify-start h-auto py-3")} asChild>
              <Link href="/admin/analytics">
                <div className={cn("flex items-start gap-3 w-full")}>
                  <BarChart3 className={cn("h-5 w-5 mt-0.5")} />
                  <div className={cn("text-left")}>
                    <div className={cn("font-medium")}>View Analytics</div>
                    <div className={cn("text-xs text-muted-foreground")}>
                      Detailed insights
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className={cn("justify-start h-auto py-3")} asChild>
              <Link href="/admin/settings">
                <div className={cn("flex items-start gap-3 w-full")}>
                  <Settings className={cn("h-5 w-5 mt-0.5")} />
                  <div className={cn("text-left")}>
                    <div className={cn("font-medium")}>System Settings</div>
                    <div className={cn("text-xs text-muted-foreground")}>
                      Configuration
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className={cn("grid gap-6 lg:grid-cols-2")}>
        {/* System Status */}
        <Card>
          <CardHeader>
            <div className={cn("flex items-center justify-between")}>
              <div>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Service health and uptime</CardDescription>
              </div>
              <Badge variant="outline" className={cn("text-green-600")}>
                <CheckCircle className={cn("mr-1 h-3 w-3")} />
                All Systems Operational
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn("space-y-4")}>
              {additionalData.systemStatus?.map((service) => {
                const Icon = service.icon
                return (
                  <div key={service.name} className={cn("flex items-center justify-between p-3 rounded-lg border")}>
                    <div className={cn("flex items-center gap-3")}>
                      <div className={cn(
                        "p-2 rounded-lg",
                        service.status === "operational" ? "bg-green-100 dark:bg-green-900/20" : "bg-yellow-100 dark:bg-yellow-900/20"
                      )}>
                        <Icon className={cn(
                          "h-4 w-4",
                          service.status === "operational" ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"
                        )} />
                      </div>
                      <div>
                        <p className={cn("font-medium")}>{service.name}</p>
                        <p className={cn("text-sm text-muted-foreground")}>
                          {service.uptime}% uptime
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={service.status === "operational" ? "default" : "secondary"}
                      className={cn(
                        service.status === "operational" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                      )}
                    >
                      {service.status}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className={cn("flex items-center justify-between")}>
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform events</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/audit-logs">
                  View all
                  <ChevronRight className={cn("ml-1 h-4 w-4")} />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn("space-y-4")}>
              {additionalData.recentActivity?.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <div key={index} className={cn("flex gap-3")}>
                    <div className={cn(
                      "p-2 rounded-lg shrink-0",
                      activity.type === "alert" ? "bg-yellow-100 dark:bg-yellow-900/20" :
                      activity.type === "system" ? "bg-blue-100 dark:bg-blue-900/20" : 
                      "bg-green-100 dark:bg-green-900/20"
                    )}>
                      <Icon className={cn(
                        "h-4 w-4",
                        activity.type === "alert" ? "text-yellow-600 dark:text-yellow-400" :
                        activity.type === "system" ? "text-blue-600 dark:text-blue-400" : 
                        "text-green-600 dark:text-green-400"
                      )} />
                    </div>
                    <div className={cn("flex-1 space-y-1")}>
                      <p className={cn("text-sm leading-relaxed")}>
                        {activity.message}
                      </p>
                      <div className={cn("flex items-center text-xs text-muted-foreground")}>
                        <Clock className={cn("mr-1 h-3 w-3")} />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )

  const renderOwnerContent = () => (
    <>
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your salon efficiently</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <Link href="/dashboard/appointments">
                <div className="flex items-start gap-3 w-full">
                  <Calendar className="h-5 w-5 mt-0.5" />
                  <div className="text-left">
                    <div className="font-medium">View Schedule</div>
                    <div className="text-xs text-muted-foreground">
                      Today&apos;s appointments
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <Link href="/dashboard/staff">
                <div className="flex items-start gap-3 w-full">
                  <Users className="h-5 w-5 mt-0.5" />
                  <div className="text-left">
                    <div className="font-medium">Manage Staff</div>
                    <div className="text-xs text-muted-foreground">
                      {String(stats.activeStaff || 0)} active staff
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <Link href="/dashboard/services">
                <div className="flex items-start gap-3 w-full">
                  <Star className="h-5 w-5 mt-0.5" />
                  <div className="text-left">
                    <div className="font-medium">Services</div>
                    <div className="text-xs text-muted-foreground">
                      {String(stats.totalServices || 0)} services
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <Link href="/dashboard/analytics">
                <div className="flex items-start gap-3 w-full">
                  <BarChart3 className="h-5 w-5 mt-0.5" />
                  <div className="text-left">
                    <div className="font-medium">Analytics</div>
                    <div className="text-xs text-muted-foreground">
                      Performance insights
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Appointments */}
      {additionalData.todaysAppointments && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Today&apos;s Appointments</CardTitle>
                <CardDescription>Upcoming appointments for today</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/appointments">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {additionalData.todaysAppointments.map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{appointment.customer}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {appointment.time}
                      </span>
                      <span>{appointment.service}</span>
                      <span>with {appointment.staff}</span>
                    </div>
                  </div>
                </div>
              ))}
              {additionalData.todaysAppointments.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No appointments scheduled for today</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )

  const renderStaffContent = () => (
    <>
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your day efficiently</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <Link href="/staff/schedule">
                <div className="flex items-start gap-3 w-full">
                  <Calendar className="h-5 w-5 mt-0.5" />
                  <div className="text-left">
                    <div className="font-medium">My Schedule</div>
                    <div className="text-xs text-muted-foreground">
                      View appointments
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <Link href="/staff/availability">
                <div className="flex items-start gap-3 w-full">
                  <Clock className="h-5 w-5 mt-0.5" />
                  <div className="text-left">
                    <div className="font-medium">Availability</div>
                    <div className="text-xs text-muted-foreground">
                      Set working hours
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <Link href="/staff/earnings">
                <div className="flex items-start gap-3 w-full">
                  <DollarSign className="h-5 w-5 mt-0.5" />
                  <div className="text-left">
                    <div className="font-medium">My Earnings</div>
                    <div className="text-xs text-muted-foreground">
                      Track performance
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule */}
      {additionalData.todaysSchedule && (
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Schedule</CardTitle>
            <CardDescription>Your appointments for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {additionalData.todaysSchedule.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium w-16">{item.time}</div>
                    <div>
                      <p className="font-medium">{item.customer}</p>
                      <p className="text-sm text-muted-foreground">{item.service} • {item.duration}</p>
                    </div>
                  </div>
                  <Badge variant={
                    item.status === 'completed' ? 'default' : 
                    item.status === 'in-progress' ? 'secondary' : 'outline'
                  }>
                    {item.status}
                  </Badge>
                </div>
              ))}
              {additionalData.todaysSchedule.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No appointments scheduled for today</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )

  const renderCustomerContent = () => (
    <>
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your bookings and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/customer/book">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-6 w-6 text-blue-600" />
                    <div>
                      <CardTitle className="text-base">Book Appointment</CardTitle>
                      <CardDescription className="text-sm">
                        Schedule your next visit
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/customer/appointments">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-6 w-6 text-green-600" />
                    <div>
                      <CardTitle className="text-base">My Appointments</CardTitle>
                      <CardDescription className="text-sm">
                        View and manage bookings
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/services">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Star className="h-6 w-6 text-purple-600" />
                    <div>
                      <CardTitle className="text-base">Browse Services</CardTitle>
                      <CardDescription className="text-sm">
                        Explore our offerings
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/customer/profile">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Users className="h-6 w-6 text-orange-600" />
                    <div>
                      <CardTitle className="text-base">My Profile</CardTitle>
                      <CardDescription className="text-sm">
                        Update your information
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      {additionalData.upcomingAppointments && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>
                  Your scheduled visits for the next 30 days
                </CardDescription>
              </div>
              <Link href="/customer/appointments">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {additionalData.upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{appointment.service}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {appointment.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {appointment.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {appointment.staff}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Reschedule</Button>
                    <Button variant="outline" size="sm">Cancel</Button>
                  </div>
                </div>
              ))}
              {additionalData.upcomingAppointments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No upcoming appointments</p>
                  <Link href="/customer/book">
                    <Button className="mt-4">Book Your First Appointment</Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-24" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <DashboardStats userRole={userRole} stats={stats as any} loading={loading} />
      {renderRoleSpecificContent()}
    </div>
  )
}