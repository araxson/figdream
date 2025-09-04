import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Users, BarChart3, Calendar } from "lucide-react"
import { hasPermission } from "@/lib/permissions"
import { AnalyticsDashboardClient } from './analytics-dashboard-client'
import type { Database } from "@/types/database.types"
type UserRole = Database["public"]["Enums"]["user_role_type"]
interface MetricCard {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ReactNode
  description?: string
}
interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor?: string
    backgroundColor?: string
  }[]
}
interface AnalyticsDashboardProps {
  userRole: UserRole
  metrics?: MetricCard[]
  revenueData?: ChartData
  appointmentData?: ChartData
  customerData?: ChartData
  performanceData?: Record<string, unknown>
  dateRange?: "today" | "week" | "month" | "quarter" | "year"
  onDateRangeChange?: (range: string) => void
  onExport?: () => void
  customCharts?: React.ReactNode
}
export function AnalyticsDashboard({
  userRole,
  metrics = [],
  revenueData,
  appointmentData,
  customerData,
  performanceData,
  dateRange = "month",
  onDateRangeChange,
  onExport,
  customCharts
}: AnalyticsDashboardProps) {
  const _canExport = hasPermission(userRole, "analytics.export")
  const canViewAll = hasPermission(userRole, "analytics.view_all")
  // Only use provided metrics, no defaults with fake data
  const defaultMetrics: MetricCard[] = metrics
  const getChangeColor = (change?: number) => {
    if (!change) return "text-muted-foreground"
    return change > 0 ? "text-green-600" : "text-red-600"
  }
  const getChangeIcon = (change?: number) => {
    if (!change) return null
    return change > 0 ? 
      <TrendingUp className="h-4 w-4" /> : 
      <TrendingDown className="h-4 w-4" />
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            {canViewAll ? "Organization-wide performance metrics" : "Your performance metrics"}
          </p>
        </div>
        <AnalyticsDashboardClient
          userRole={userRole}
          dateRange={dateRange}
          onDateRangeChange={onDateRangeChange}
          onExport={onExport}
        />
      </div>
      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {defaultMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <div className="text-muted-foreground">{metric.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              {metric.change !== undefined && (
                <div className={`flex items-center gap-1 text-xs ${getChangeColor(metric.change)}`}>
                  {getChangeIcon(metric.change)}
                  <span>{Math.abs(metric.change)}%</span>
                  <span className="text-muted-foreground">{metric.changeLabel}</span>
                </div>
              )}
              {metric.description && (
                <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Chart */}
        {revenueData && (
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Revenue trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 opacity-50" />
                <span className="ml-2">Revenue Chart</span>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Appointments Chart */}
        {appointmentData && (
          <Card>
            <CardHeader>
              <CardTitle>Appointment Trends</CardTitle>
              <CardDescription>Booking patterns and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <Calendar className="h-12 w-12 opacity-50" />
                <span className="ml-2">Appointments Chart</span>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Customer Chart */}
        {customerData && (
          <Card>
            <CardHeader>
              <CardTitle>Customer Growth</CardTitle>
              <CardDescription>New vs returning customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <Users className="h-12 w-12 opacity-50" />
                <span className="ml-2">Customer Chart</span>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Performance Chart */}
        {performanceData && (
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <TrendingUp className="h-12 w-12 opacity-50" />
                <span className="ml-2">Performance Chart</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Custom Charts Section */}
      {customCharts && (
        <div className="space-y-6">
          {customCharts}
        </div>
      )}
      {/* Top Performers Table - only show if performance data is provided */}
      {/* Quick Stats Summary - only show if data is provided */}
    </div>
  )
}