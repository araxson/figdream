"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState, useCallback } from 'react'
import { ChartDataItem } from './revenue-types'
import { fetchRevenueData } from './revenue-api'
import { RevenueStats } from './revenue-stats'
import { RevenueBarChart } from './revenue-bar-chart'
import { RevenueLineChart } from './revenue-line-chart'
import { RevenueAreaChart } from './revenue-area-chart'

export function RevenueChart() {
  const [timeRange, setTimeRange] = useState("7")
  const [chartType, setChartType] = useState("bar")
  const [chartData, setChartData] = useState<ChartDataItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    const data = await fetchRevenueData(timeRange)
    setChartData(data)
    setLoading(false)
  }, [timeRange])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>Track your salon&apos;s revenue performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px]">
            Loading revenue data...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Track your salon&apos;s revenue performance</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Tabs value={chartType} onValueChange={setChartType}>
              <TabsList>
                <TabsTrigger value="bar">Bar</TabsTrigger>
                <TabsTrigger value="line">Line</TabsTrigger>
                <TabsTrigger value="area">Area</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <RevenueStats data={chartData} />
        
        {chartType === "bar" && <RevenueBarChart data={chartData} />}
        {chartType === "line" && <RevenueLineChart data={chartData} />}
        {chartType === "area" && <RevenueAreaChart data={chartData} />}
      </CardContent>
    </Card>
  )
}