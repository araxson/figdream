"use client"

import {
  DollarSign,
  Calendar,
  Star,
  Activity,
  TrendingUp,
  TrendingDown,
  LucideIcon
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PerformanceMetric } from "./types"

interface MetricCardProps {
  title: string
  value: number
  change?: number
  icon: LucideIcon
  format?: "currency" | "percent" | "number"
}

function MetricCard({ title, value, change, icon: Icon, format = "number" }: MetricCardProps) {
  const formatValue = () => {
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0
        }).format(value)
      case "percent":
        return `${value.toFixed(1)}%`
      default:
        return value.toFixed(0)
    }
  }

  const isPositive = change && change > 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue()}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={isPositive ? "text-green-500" : "text-red-500"}>
              {Math.abs(change).toFixed(1)}%
            </span>
            <span>from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface StaffAnalyticsMetricsProps {
  performanceData: PerformanceMetric[]
  teamAverages: {
    revenue: number
    appointments: number
    rating: number
    utilization: number
    tips: number
    rebookRate: number
    clientRetention: number
  }
}

export function StaffAnalyticsMetrics({
  performanceData,
  teamAverages
}: StaffAnalyticsMetricsProps) {
  const totalRevenue = performanceData.reduce((sum, p) => sum + p.revenue, 0)
  const totalAppointments = performanceData.reduce((sum, p) => sum + p.appointments, 0)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Revenue"
        value={totalRevenue}
        change={12.5}
        icon={DollarSign}
        format="currency"
      />
      <MetricCard
        title="Total Appointments"
        value={totalAppointments}
        change={8.2}
        icon={Calendar}
      />
      <MetricCard
        title="Average Rating"
        value={teamAverages.rating}
        change={2.1}
        icon={Star}
      />
      <MetricCard
        title="Team Utilization"
        value={teamAverages.utilization}
        change={-3.5}
        icon={Activity}
        format="percent"
      />
    </div>
  )
}

export { MetricCard }