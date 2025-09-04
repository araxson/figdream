"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DollarSign,
  Calendar,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface KPICard {
  title: string
  value: string | number
  change: number
  changeType: "increase" | "decrease" | "neutral"
  icon: React.ReactNode
  description: string
  target?: number
}

interface AnalyticsOverviewClientProps {
  initialKpis: KPICard[]
  initialRevenueData: Array<{date: string; value: number}>
  initialAppointmentData: Array<{date: string; value: number}>
  initialServiceData: Array<{name: string; value: number}>
  initialCustomerData: Array<{name: string; value: number}>
  defaultDateRange: string
}

export function AnalyticsOverviewClient({
  initialKpis,
  defaultDateRange,
}: AnalyticsOverviewClientProps) {
  const [dateRange, setDateRange] = useState(defaultDateRange)

  const getChangeIcon = (change: number) => {
    return change > 0 ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
  }

  const getChangeColor = (changeType: string) => {
    return changeType === "increase" ? "text-green-600" : "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Overview</h2>
          <p className="text-muted-foreground">Your salon&apos;s key performance metrics</p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {initialKpis.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <div className="text-muted-foreground">{kpi.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className={`flex items-center text-xs ${getChangeColor(kpi.changeType)}`}>
                {getChangeIcon(kpi.change)}
                <span className="ml-1">
                  {Math.abs(kpi.change)}% {kpi.description}
                </span>
              </div>
              {kpi.target && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Target: {kpi.target}</span>
                    <span>{Math.round((Number(kpi.value.toString().replace(/\D/g, '')) / kpi.target) * 100)}%</span>
                  </div>
                  <Progress 
                    value={Math.min((Number(kpi.value.toString().replace(/\D/g, '')) / kpi.target) * 100, 100)} 
                    className="h-2 mt-1" 
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section - Placeholder for now */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Revenue over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <DollarSign className="h-12 w-12 mx-auto opacity-50 mb-2" />
                <p>Revenue chart will be rendered here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointment Trends</CardTitle>
            <CardDescription>Booking patterns and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto opacity-50 mb-2" />
                <p>Appointment chart will be rendered here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}