"use client"

import { AlertCircle, TrendingUp, Award, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import type { PerformanceMetric, TeamAverages } from "./types"

interface StaffAnalyticsInsightsProps {
  performanceData: PerformanceMetric[]
  teamAverages: TeamAverages
}

export function StaffAnalyticsInsights({
  performanceData,
  teamAverages
}: StaffAnalyticsInsightsProps) {
  // Generate insights based on data
  const insights = generateInsights(performanceData, teamAverages)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>
            AI-powered recommendations based on current performance data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.map((insight, index) => (
            <Alert key={index}>
              <insight.icon className="h-4 w-4" />
              <AlertDescription>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium mb-1">{insight.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                  </div>
                  <Badge variant={insight.type}>
                    {insight.priority}
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 mt-0.5 text-green-500" />
                <div className="text-sm">
                  <p className="font-medium">Schedule Optimization</p>
                  <p className="text-muted-foreground">
                    3 staff members have low utilization during peak hours
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Target className="h-4 w-4 mt-0.5 text-blue-500" />
                <div className="text-sm">
                  <p className="font-medium">Training Recommendation</p>
                  <p className="text-muted-foreground">
                    2 staff could benefit from upselling training
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recognition</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {performanceData
                .filter(staff => staff.rating > 4.5)
                .slice(0, 3)
                .map(staff => (
                  <li key={staff.staffId} className="flex items-start gap-2">
                    <Award className="h-4 w-4 mt-0.5 text-yellow-500" />
                    <div className="text-sm">
                      <p className="font-medium">{staff.staffName}</p>
                      <p className="text-muted-foreground">
                        Exceptional customer satisfaction ({staff.rating.toFixed(1)} rating)
                      </p>
                    </div>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function generateInsights(
  performanceData: PerformanceMetric[],
  teamAverages: TeamAverages
): Array<{
  title: string
  description: string
  type: "default" | "secondary" | "destructive"
  priority: string
  icon: typeof AlertCircle
}> {
  const insights = []

  // Check for underperforming staff
  const underperformers = performanceData.filter(
    staff => staff.revenue < teamAverages.revenue * 0.7
  )
  if (underperformers.length > 0) {
    insights.push({
      title: "Performance Gap Detected",
      description: `${underperformers.length} staff members are performing below 70% of team average revenue`,
      type: "destructive" as const,
      priority: "High",
      icon: AlertCircle
    })
  }

  // Check for high performers
  const highPerformers = performanceData.filter(
    staff => staff.rating > 4.5 && staff.revenue > teamAverages.revenue * 1.2
  )
  if (highPerformers.length > 0) {
    insights.push({
      title: "Star Performers",
      description: `${highPerformers.length} staff members are exceeding expectations`,
      type: "default" as const,
      priority: "Info",
      icon: Award
    })
  }

  // Check utilization
  const lowUtilization = performanceData.filter(
    staff => staff.utilization < 60
  )
  if (lowUtilization.length > 0) {
    insights.push({
      title: "Low Utilization Alert",
      description: `${lowUtilization.length} staff members have utilization below 60%`,
      type: "secondary" as const,
      priority: "Medium",
      icon: Target
    })
  }

  return insights
}