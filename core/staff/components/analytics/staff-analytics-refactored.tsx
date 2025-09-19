"use client"

import { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { subDays } from "date-fns"
import type { StaffProfile } from "../../dal/staff-types"
import { StaffAnalyticsHeader } from "./staff-analytics-header"
import { StaffAnalyticsMetrics } from "./staff-analytics-metrics"
import { StaffPerformanceTable } from "./staff-performance-table"
import { StaffTopPerformers } from "./staff-top-performers"
import { StaffAnalyticsComparison } from "./staff-analytics-comparison"
import { StaffAnalyticsTrends } from "./staff-analytics-trends"
import { StaffAnalyticsInsights } from "./staff-analytics-insights"
import type { PerformanceMetric } from "./types"

interface StaffAnalyticsProps {
  staff: StaffProfile[]
  salonId?: string
  dateRange?: {
    from: Date
    to: Date
  }
}

export function StaffAnalytics({
  staff,
  salonId,
  dateRange = {
    from: subDays(new Date(), 30),
    to: new Date()
  }
}: StaffAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [selectedMetric, setSelectedMetric] = useState("revenue")
  const [comparisonMode, setComparisonMode] = useState(false)
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([])

  // Mock performance data (replace with actual data from server)
  const performanceData: PerformanceMetric[] = staff.map(member => ({
    staffId: member.id,
    staffName: member.display_name || "",
    revenue: Math.floor(Math.random() * 10000) + 5000,
    appointments: Math.floor(Math.random() * 100) + 50,
    rating: Math.random() * 2 + 3,
    utilization: Math.random() * 40 + 60,
    tips: Math.floor(Math.random() * 1000) + 500,
    rebookRate: Math.random() * 30 + 70,
    avgServiceTime: Math.floor(Math.random() * 30) + 45,
    clientRetention: Math.random() * 20 + 80
  }))

  // Calculate team averages
  const teamAverages = useMemo(() => {
    const total = performanceData.length
    if (total === 0) return {
      revenue: 0,
      appointments: 0,
      rating: 0,
      utilization: 0,
      tips: 0,
      rebookRate: 0,
      clientRetention: 0
    }

    return {
      revenue: performanceData.reduce((sum, p) => sum + p.revenue, 0) / total,
      appointments: performanceData.reduce((sum, p) => sum + p.appointments, 0) / total,
      rating: performanceData.reduce((sum, p) => sum + p.rating, 0) / total,
      utilization: performanceData.reduce((sum, p) => sum + p.utilization, 0) / total,
      tips: performanceData.reduce((sum, p) => sum + p.tips, 0) / total,
      rebookRate: performanceData.reduce((sum, p) => sum + p.rebookRate, 0) / total,
      clientRetention: performanceData.reduce((sum, p) => sum + p.clientRetention, 0) / total
    }
  }, [performanceData])

  // Top performers by metric
  const topPerformers = useMemo(() => {
    return {
      revenue: [...performanceData].sort((a, b) => b.revenue - a.revenue).slice(0, 3),
      rating: [...performanceData].sort((a, b) => b.rating - a.rating).slice(0, 3),
      appointments: [...performanceData].sort((a, b) => b.appointments - a.appointments).slice(0, 3),
      utilization: [...performanceData].sort((a, b) => b.utilization - a.utilization).slice(0, 3)
    }
  }, [performanceData])

  const handleExport = (format: "csv" | "pdf") => {
    // TODO: Implement export functionality
    console.log(`Exporting as ${format}`)
  }

  const handleComparisonToggle = () => {
    setComparisonMode(!comparisonMode)
  }

  return (
    <div className="space-y-6">
      <StaffAnalyticsHeader
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        comparisonMode={comparisonMode}
        onComparisonToggle={handleComparisonToggle}
        onExport={handleExport}
      />

      <StaffAnalyticsMetrics
        performanceData={performanceData}
        teamAverages={teamAverages}
      />

      <Tabs defaultValue="individual" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="individual">Individual</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-4">
          <StaffPerformanceTable
            performanceData={performanceData}
            teamAverages={teamAverages}
          />
          <StaffTopPerformers topPerformers={topPerformers} />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <StaffAnalyticsComparison
            performanceData={performanceData}
            selectedStaffIds={selectedStaffIds}
            onStaffSelectionChange={setSelectedStaffIds}
          />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <StaffAnalyticsTrends
            performanceData={performanceData}
            selectedMetric={selectedMetric}
            onMetricChange={setSelectedMetric}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <StaffAnalyticsInsights
            performanceData={performanceData}
            teamAverages={teamAverages}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}