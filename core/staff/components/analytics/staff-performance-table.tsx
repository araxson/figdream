"use client"

import { Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { PerformanceMetric, TeamAverages } from "./types"

interface StaffPerformanceTableProps {
  performanceData: PerformanceMetric[]
  teamAverages: TeamAverages
}

export function StaffPerformanceTable({
  performanceData,
  teamAverages
}: StaffPerformanceTableProps) {
  const calculatePerformanceScore = (metric: PerformanceMetric) => {
    return (
      (metric.revenue / teamAverages.revenue) * 0.3 +
      (metric.appointments / teamAverages.appointments) * 0.2 +
      (metric.rating / teamAverages.rating) * 0.3 +
      (metric.utilization / teamAverages.utilization) * 0.2
    )
  }

  const getPerformanceLabel = (score: number) => {
    if (score > 1.1) return { label: "Excellent", variant: "default" as const }
    if (score > 0.9) return { label: "Good", variant: "secondary" as const }
    return { label: "Needs Improvement", variant: "destructive" as const }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Individual Performance</CardTitle>
        <CardDescription>Detailed metrics for each staff member</CardDescription>
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
                const performanceScore = calculatePerformanceScore(metric)
                const performance = getPerformanceLabel(performanceScore)

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
                      <Badge variant={performance.variant}>
                        {performance.label}
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