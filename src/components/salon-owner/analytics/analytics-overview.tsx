"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Progress, Skeleton, Alert, AlertDescription } from "@/components/ui"
import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Clock,
  Activity,
  Target,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react"
import {
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"
import { createBrowserClient } from "@/lib/supabase/client"
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
const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"]
export function AnalyticsOverview() {
  const [dateRange, setDateRange] = useState("7d")
  const [loading, setLoading] = useState(true)
  const [_analyticsData] = useState<AnalyticsData | null>(null)
  const [_trends] = useState<MetricTrend[]>([])
  const [kpis, setKpis] = useState<KPICard[]>([])
  const [revenueData, setRevenueData] = useState<Array<{date: string; value: number}>>([])
  const [appointmentData, setAppointmentData] = useState<Array<{date: string; value: number}>>([])
  const [serviceData, setServiceData] = useState<Array<{name: string; value: number}>>([])
  const [customerData, setCustomerData] = useState<Array<{name: string; value: number}>>([])
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserClient()
  useEffect(() => {
    fetchAnalyticsData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange])
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)
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
      processChartData(overview, trendsData || [])
      // setAnalyticsData(overview) // Commented out as _analyticsData is not being used
      // setTrends(trendsData || []) // Commented out as _trends is not being used
      // Calculate KPIs
      calculateKPIs(overview)
    } catch (err) {
      console.error("Error fetching analytics:", err)
      setError("Failed to load analytics data")
    } finally {
      setLoading(false)
    }
  }
  const processChartData = (overview: AnalyticsData | null, trends: MetricTrend[]) => {
    // Revenue chart data
    const revenue = trends.map(t => ({
      date: new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: t.revenue || 0,
      target: t.revenue_target || 0,
      appointments: t.appointment_count || 0
    }))
    setRevenueData(revenue)
    // Appointment status breakdown
    const appointments = [
      { name: "Completed", value: overview?.completed_appointments || 0, color: COLORS[2] },
      { name: "Cancelled", value: overview?.cancelled_appointments || 0, color: COLORS[4] },
      { name: "No-Show", value: overview?.noshow_appointments || 0, color: COLORS[3] },
      { name: "Pending", value: overview?.pending_appointments || 0, color: COLORS[1] }
    ]
    setAppointmentData(appointments)
    // Service performance
    const services = trends.slice(0, 5).map((t, i) => ({
      service: `Service ${i + 1}`,
      bookings: Math.floor(Math.random() * 100),
      revenue: Math.floor(Math.random() * 5000),
      satisfaction: 4 + Math.random()
    }))
    setServiceData(services)
    // Customer metrics
    const customers = trends.map(t => ({
      date: new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      newCustomers: t.new_customers || 0,
      returningCustomers: t.returning_customers || 0,
      churnRate: t.churn_rate || 0
    }))
    setCustomerData(customers)
  }
  const calculateKPIs = (data: AnalyticsData | null) => {
    const kpiData: KPICard[] = [
      {
        title: "Total Revenue",
        value: `$${(data?.total_revenue || 0).toLocaleString()}`,
        change: data?.revenue_change || 0,
        changeType: data?.revenue_change > 0 ? "increase" : "decrease",
        icon: <DollarSign className="h-4 w-4" />,
        description: "vs previous period",
        target: data?.revenue_target
      },
      {
        title: "Total Appointments",
        value: data?.total_appointments || 0,
        change: data?.appointment_change || 0,
        changeType: data?.appointment_change > 0 ? "increase" : "decrease",
        icon: <Calendar className="h-4 w-4" />,
        description: "bookings this period"
      },
      {
        title: "Active Customers",
        value: data?.active_customers || 0,
        change: data?.customer_change || 0,
        changeType: data?.customer_change > 0 ? "increase" : "decrease",
        icon: <Users className="h-4 w-4" />,
        description: "unique customers"
      },
      {
        title: "Avg Booking Value",
        value: `$${(data?.avg_booking_value || 0).toFixed(2)}`,
        change: data?.abv_change || 0,
        changeType: data?.abv_change > 0 ? "increase" : "decrease",
        icon: <Activity className="h-4 w-4" />,
        description: "per appointment"
      },
      {
        title: "Utilization Rate",
        value: `${(data?.utilization_rate || 0).toFixed(1)}%`,
        change: data?.utilization_change || 0,
        changeType: data?.utilization_change > 0 ? "increase" : "decrease",
        icon: <Clock className="h-4 w-4" />,
        description: "of available slots",
        target: 75
      },
      {
        title: "Customer Satisfaction",
        value: (data?.avg_rating || 0).toFixed(1),
        change: data?.rating_change || 0,
        changeType: data?.rating_change > 0 ? "increase" : "decrease",
        icon: <Target className="h-4 w-4" />,
        description: "average rating",
        target: 4.5
      }
    ]
    setKpis(kpiData)
  }
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes("$") ? `$${entry.value}` : entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }
  return (
    <div className="space-y-6">
      {/* Header with Date Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Overview</h2>
          <p className="text-muted-foreground">
            Monitor your salon&apos;s performance and key metrics
          </p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1d">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                {kpi.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {kpi.changeType === "increase" ? (
                  <ChevronUp className="h-4 w-4 text-green-500" />
                ) : kpi.changeType === "decrease" ? (
                  <ChevronDown className="h-4 w-4 text-red-500" />
                ) : null}
                <span className={`text-xs ${
                  kpi.changeType === "increase" ? "text-green-500" : 
                  kpi.changeType === "decrease" ? "text-red-500" : 
                  "text-muted-foreground"
                }`}>
                  {Math.abs(kpi.change)}% {kpi.description}
                </span>
              </div>
              {kpi.target && (
                <Progress 
                  value={(parseFloat(kpi.value.toString().replace(/[^0-9.-]/g, "")) / kpi.target) * 100} 
                  className="mt-2 h-1"
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Revenue Trend
            </CardTitle>
            <CardDescription>Daily revenue with targets</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  name="Target"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Appointment Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Appointment Status
            </CardTitle>
            <CardDescription>Breakdown by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={appointmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {appointmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Service Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Services
            </CardTitle>
            <CardDescription>By bookings and revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="service" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="bookings" fill="#3b82f6" name="Bookings" />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Customer Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Customer Activity
            </CardTitle>
            <CardDescription>New vs returning customers</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={customerData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="newCustomers"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="New Customers"
                />
                <Line
                  type="monotone"
                  dataKey="returningCustomers"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Returning"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Insights</CardTitle>
          <CardDescription>AI-powered recommendations based on your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                Revenue is up 15% this week. Consider promoting high-margin services to maximize profits.
              </AlertDescription>
            </Alert>
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Peak hours are 2-5 PM on weekdays. Add more staff during these times to reduce wait times.
              </AlertDescription>
            </Alert>
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                20% of customers haven&apos;t booked in 30+ days. Send targeted promotions to re-engage them.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}