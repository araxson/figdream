"use client"

import { TrendingUp, TrendingDown, DollarSign, Calendar, Star, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { PerformanceMetric } from "./types"

interface PerformanceMetricsProps {
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

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  format: formatType = "number"
}: {
  title: string
  value: number
  change?: number
  icon: any
  format?: "number" | "currency" | "percent"
}) {
  const formattedValue = formatType === "currency"
    ? `$${value.toLocaleString()}`
    : formatType === "percent"
    ? `${value.toFixed(1)}%`
    : value.toLocaleString()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        {change !== undefined && (
          <div className="flex items-center text-xs mt-1">
            {change > 0 ? (
              <>
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500">+{change.toFixed(1)}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                <span className="text-red-500">{change.toFixed(1)}%</span>
              </>
            )}
            <span className="text-muted-foreground ml-1">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function PerformanceMetricsOverview({
  performanceData,
  teamAverages
}: PerformanceMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Revenue"
        value={performanceData.reduce((sum, p) => sum + p.revenue, 0)}
        change={12.5}
        icon={DollarSign}
        format="currency"
      />
      <MetricCard
        title="Total Appointments"
        value={performanceData.reduce((sum, p) => sum + p.appointments, 0)}
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

export function PerformanceTable({
  performanceData,
  teamAverages
}: PerformanceMetricsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Individual Performance</CardTitle>
        <p className="text-sm text-muted-foreground">Detailed metrics for each staff member</p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-center">Appointments</TableHead>
                <TableHead className="text-center">Rating</TableHead>
                <TableHead className="text-center">Utilization</TableHead>
                <TableHead className="text-right">Tips</TableHead>
                <TableHead className="text-center">Rebook Rate</TableHead>
                <TableHead className="text-center">Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performanceData.map((metric) => {
                const performanceScore =
                  (metric.revenue / teamAverages.revenue) * 0.3 +
                  (metric.appointments / teamAverages.appointments) * 0.2 +
                  (metric.rating / teamAverages.rating) * 0.3 +
                  (metric.utilization / teamAverages.utilization) * 0.2

                return (
                  <TableRow key={metric.staffId}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {metric.staffName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{metric.staffName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      ${metric.revenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {metric.appointments}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {metric.rating.toFixed(1)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Progress value={metric.utilization} className="w-16" />
                        <span className="text-xs">{metric.utilization.toFixed(0)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      ${metric.tips.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {metric.rebookRate.toFixed(0)}%
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          performanceScore > 1.1 ? "default" :
                          performanceScore > 0.9 ? "secondary" :
                          "destructive"
                        }
                      >
                        {performanceScore > 1.1 ? "Excellent" :
                         performanceScore > 0.9 ? "Good" :
                         "Needs Improvement"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}