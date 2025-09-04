import {
  Users,
  DollarSign,
  Calendar,
  Clock,
  Activity,
  Target,
  AlertCircle,
} from "lucide-react"
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AnalyticsOverviewClient } from './analytics-overview-client'
import { createServerClient } from "@/lib/database/supabase/server"
import type { Database } from "@/types/database.types"
type AnalyticsData = Database["public"]["Views"]["analytics_overview"]["Row"]
type MetricTrend = Database["public"]["Views"]["analytics_trends"]["Row"]
interface KPICard {
  title: string
  value: string | number
  change: number
  changeType: "increase" | "decrease" | "neutral"
  icon: React.ReactNode
  description: string
  target?: number
}
const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--primary))"]

interface AnalyticsOverviewProps {
  dateRange?: string
}

export async function AnalyticsOverview({ dateRange = "7d" }: AnalyticsOverviewProps) {
  const supabase = createServerClient()
  
  try {
    // Fetch main analytics overview
    const { data: overview, error: overviewError } = await supabase
      .from("analytics_overview")
      .select("*")
      .eq("date_range", dateRange)
      .single()
    
    if (overviewError) throw overviewError
    
    // Fetch trends data
    const { data: trendsData, error: trendsError } = await supabase
      .from("analytics_trends")
      .select("*")
      .eq("period", dateRange)
      .order("date", { ascending: true })
      
    if (trendsError) throw trendsError
    
    // Process data for charts
    const { kpis, revenueData, appointmentData, serviceData, customerData } = processAnalyticsData(overview, trendsData || [])
    
    return (
      <AnalyticsOverviewClient
        initialKpis={kpis}
        initialRevenueData={revenueData}
        initialAppointmentData={appointmentData}
        initialServiceData={serviceData}
        initialCustomerData={customerData}
        defaultDateRange={dateRange}
      />
    )
  } catch (_error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load analytics data. Please try again.
        </AlertDescription>
      </Alert>
    )
  }
}

function processAnalyticsData(overview: AnalyticsData | null, trends: MetricTrend[]) {
  // Revenue chart data
  const revenueData = trends.map(t => ({
    date: new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    revenue: t.revenue || 0,
    target: t.revenue_target || 0,
    appointments: t.appointment_count || 0
  }))
  
  // Appointment status breakdown
  const appointmentData = [
    { name: "Completed", value: overview?.completed_appointments || 0, color: COLORS[2] },
    { name: "Cancelled", value: overview?.cancelled_appointments || 0, color: COLORS[4] },
    { name: "No-Show", value: overview?.noshow_appointments || 0, color: COLORS[3] },
    { name: "Pending", value: overview?.pending_appointments || 0, color: COLORS[1] }
  ]
  
  // Service performance - using empty array for now 
  const serviceData: Array<{service: string; bookings: number; revenue: number; satisfaction?: number}> = []
  
  // Customer metrics
  const customerData = trends.map(t => ({
    date: new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    newCustomers: t.new_customers || 0,
    returningCustomers: t.returning_customers || 0,
    churnRate: t.churn_rate || 0
  }))
  
  // Calculate KPIs
  const kpis: KPICard[] = [
    {
      title: "Total Revenue",
      value: `$${(overview?.total_revenue || 0).toLocaleString()}`,
      change: overview?.revenue_change || 0,
      changeType: (overview?.revenue_change || 0) > 0 ? "increase" : "decrease",
      icon: <DollarSign className="h-4 w-4" />,
      description: "vs previous period",
      target: overview?.revenue_target
    },
    {
      title: "Total Appointments",
      value: overview?.total_appointments || 0,
      change: overview?.appointment_change || 0,
      changeType: (overview?.appointment_change || 0) > 0 ? "increase" : "decrease",
      icon: <Calendar className="h-4 w-4" />,
      description: "bookings this period"
    },
    {
      title: "Active Customers",
      value: overview?.active_customers || 0,
      change: overview?.customer_change || 0,
      changeType: (overview?.customer_change || 0) > 0 ? "increase" : "decrease",
      icon: <Users className="h-4 w-4" />,
      description: "unique customers"
    },
    {
      title: "Avg Booking Value",
      value: `$${(overview?.avg_booking_value || 0).toFixed(2)}`,
      change: overview?.abv_change || 0,
      changeType: (overview?.abv_change || 0) > 0 ? "increase" : "decrease",
      icon: <Activity className="h-4 w-4" />,
      description: "per appointment"
    },
    {
      title: "Utilization Rate",
      value: `${(overview?.utilization_rate || 0).toFixed(1)}%`,
      change: overview?.utilization_change || 0,
      changeType: (overview?.utilization_change || 0) > 0 ? "increase" : "decrease",
      icon: <Clock className="h-4 w-4" />,
      description: "of available slots",
      target: 75
    },
    {
      title: "Customer Satisfaction",
      value: (overview?.avg_rating || 0).toFixed(1),
      change: overview?.rating_change || 0,
      changeType: (overview?.rating_change || 0) > 0 ? "increase" : "decrease",
      icon: <Target className="h-4 w-4" />,
      description: "average rating",
      target: 4.5
    }
  ]
  
  return {
    kpis,
    revenueData,
    appointmentData,
    serviceData,
    customerData
  }
}

export { AnalyticsOverview }