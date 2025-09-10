import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Calendar,
  Users,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

async function getStats() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: salon } = await supabase
    .from('salons')
    .select('id')
    .eq('created_by', user.id)
    .single()

  if (!salon) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  
  // Calculate last month for comparison
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)

  const [todayAppointments, monthAppointments, activeCustomers, monthRevenue, lastMonthAppointments, lastMonthRevenue] = await Promise.all([
    supabase
      .from('appointments')
      .select('id')
      .eq('salon_id', salon.id)
      .eq('appointment_date', today.toISOString().split('T')[0])
      .neq('status', 'cancelled'),
    
    supabase
      .from('appointments')
      .select('id')
      .eq('salon_id', salon.id)
      .gte('appointment_date', monthStart.toISOString().split('T')[0])
      .lte('appointment_date', monthEnd.toISOString().split('T')[0])
      .neq('status', 'cancelled'),
    
    supabase
      .from('customers')
      .select('id')
      .eq('salon_id', salon.id),
    
    supabase
      .from('appointments')
      .select('computed_total_price')
      .eq('salon_id', salon.id)
      .eq('status', 'completed')
      .gte('appointment_date', monthStart.toISOString().split('T')[0])
      .lte('appointment_date', monthEnd.toISOString().split('T')[0]),
      
    supabase
      .from('appointments')
      .select('id')
      .eq('salon_id', salon.id)
      .gte('appointment_date', lastMonthStart.toISOString().split('T')[0])
      .lte('appointment_date', lastMonthEnd.toISOString().split('T')[0])
      .neq('status', 'cancelled'),
      
    supabase
      .from('appointments')
      .select('computed_total_price')
      .eq('salon_id', salon.id)
      .eq('status', 'completed')
      .gte('appointment_date', lastMonthStart.toISOString().split('T')[0])
      .lte('appointment_date', lastMonthEnd.toISOString().split('T')[0])
  ])

  const revenue = monthRevenue.data?.reduce((sum, apt) => sum + (Number(apt.computed_total_price) || 0), 0) || 0
  const lastRevenue = lastMonthRevenue.data?.reduce((sum, apt) => sum + (Number(apt.computed_total_price) || 0), 0) || 0
  
  // Calculate trends
  const appointmentsTrend = lastMonthAppointments.data?.length 
    ? ((monthAppointments.data?.length || 0) - lastMonthAppointments.data.length) / lastMonthAppointments.data.length * 100
    : 0
    
  const revenueTrend = lastRevenue 
    ? ((revenue - lastRevenue) / lastRevenue * 100)
    : 0

  return {
    todayAppointments: todayAppointments.data?.length || 0,
    monthAppointments: monthAppointments.data?.length || 0,
    activeCustomers: activeCustomers.data?.length || 0,
    monthRevenue: revenue,
    appointmentsTrend: Math.round(appointmentsTrend),
    revenueTrend: Math.round(revenueTrend)
  }
}

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ElementType
  trend?: number
  trendLabel?: string
  className?: string
}

function StatCard({ title, value, description, icon: Icon, trend, trendLabel, className }: StatCardProps) {
  const isPositive = trend && trend > 0
  const TrendIcon = isPositive ? ArrowUp : ArrowDown
  
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <div className="relative">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {trend !== undefined && trend !== 0 && (
            <div className={cn(
              "absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full",
              isPositive ? "bg-green-100" : "bg-red-100"
            )}>
              <TrendIcon className={cn(
                "h-2.5 w-2.5",
                isPositive ? "text-green-600" : "text-red-600"
              )} />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-3">
          <div className="text-2xl font-bold">{value}</div>
          {trend !== undefined && trend !== 0 && (
            <div className={cn(
              "flex items-center text-xs",
              isPositive ? "text-green-600" : "text-red-600"
            )}>
              <TrendIcon className="mr-0.5 h-3 w-3" />
              <span className="font-medium">{Math.abs(trend)}%</span>
              {trendLabel && (
                <span className="ml-1 text-muted-foreground">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export async function OwnerStats() {
  const stats = await getStats()

  if (!stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 bg-muted animate-pulse rounded" />
              <div className="h-3 w-16 bg-muted animate-pulse rounded mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Today's Appointments"
        value={stats.todayAppointments}
        icon={Calendar}
        description="Scheduled for today"
      />
      <StatCard
        title="Monthly Appointments"
        value={stats.monthAppointments}
        icon={Activity}
        description="This month total"
        trend={stats.appointmentsTrend}
        trendLabel="vs last month"
      />
      <StatCard
        title="Active Customers"
        value={stats.activeCustomers}
        icon={Users}
        description="Total registered"
      />
      <StatCard
        title="Monthly Revenue"
        value={`$${stats.monthRevenue.toLocaleString()}`}
        icon={DollarSign}
        description="Total this month"
        trend={stats.revenueTrend}
        trendLabel="vs last month"
      />
    </div>
  )
}