"use client"

import { TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { PerformanceMetric } from "./types"

interface StaffAnalyticsTrendsProps {
  performanceData: PerformanceMetric[]
  selectedMetric: string
  onMetricChange: (metric: string) => void
}

export function StaffAnalyticsTrends({
  performanceData,
  selectedMetric,
  onMetricChange
}: StaffAnalyticsTrendsProps) {
  // Mock trend data
  const trendData = {
    revenue: [
      { month: "Jan", value: 45000 },
      { month: "Feb", value: 48000 },
      { month: "Mar", value: 52000 },
      { month: "Apr", value: 49000 },
      { month: "May", value: 55000 },
      { month: "Jun", value: 58000 }
    ],
    appointments: [
      { month: "Jan", value: 320 },
      { month: "Feb", value: 340 },
      { month: "Mar", value: 380 },
      { month: "Apr", value: 350 },
      { month: "May", value: 390 },
      { month: "Jun", value: 410 }
    ]
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Track performance metrics over time</CardDescription>
          </div>
          <Select value={selectedMetric} onValueChange={onMetricChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="appointments">Appointments</SelectItem>
              <SelectItem value="rating">Ratings</SelectItem>
              <SelectItem value="utilization">Utilization</SelectItem>
              <SelectItem value="tips">Tips</SelectItem>
              <SelectItem value="retention">Client Retention</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {/* Trend Chart Placeholder */}
        <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Trend chart for {selectedMetric}</p>
            <p className="text-sm text-muted-foreground">
              Showing 6-month trend analysis
            </p>
          </div>
        </div>

        {/* Trend Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Current Month</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {selectedMetric === "revenue" ? "$58,000" : "410"}
              </p>
              <p className="text-xs text-muted-foreground">
                +5.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Monthly Average</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {selectedMetric === "revenue" ? "$51,500" : "365"}
              </p>
              <p className="text-xs text-muted-foreground">
                Last 6 months
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Growth Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">+28.9%</p>
              <p className="text-xs text-muted-foreground">
                6-month growth
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}