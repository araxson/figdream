"use client"

import {
  DollarSign,
  TrendingUp,
  BarChart3,
  Users,
  Star,
  Calendar
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface PerformanceData {
  appointments: {
    total: number
    completed: number
    cancelled: number
    noShow: number
  }
  revenue: {
    total: number
    services: number
    tips: number
    growth: number
  }
  ratings: {
    average: number
    total: number
    distribution: Array<{ stars: number; count: number }>
  }
  utilization: {
    current: number
    target: number
    trend: "up" | "down" | "stable"
  }
}

interface StaffPerformanceMetricsProps {
  performanceData: PerformanceData
}

export function StaffPerformanceMetrics({ performanceData }: StaffPerformanceMetricsProps) {
  const { appointments, revenue, ratings, utilization } = performanceData

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Appointments</p>
                <p className="text-2xl font-bold">{appointments.total}</p>
                <p className="text-xs text-muted-foreground">
                  {appointments.completed} completed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Revenue</p>
                <p className="text-2xl font-bold">${revenue.total.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +{revenue.growth}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Rating</p>
                <p className="text-2xl font-bold">{ratings.average}</p>
                <p className="text-xs text-muted-foreground">
                  {ratings.total} reviews
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Details */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Completed</span>
                <span className="font-medium">{appointments.completed}</span>
              </div>
              <Progress
                value={(appointments.completed / appointments.total) * 100}
                className="h-2"
              />

              <div className="flex justify-between text-sm">
                <span>Cancelled</span>
                <span className="font-medium text-red-600">{appointments.cancelled}</span>
              </div>
              <Progress
                value={(appointments.cancelled / appointments.total) * 100}
                className="h-2"
              />

              <div className="flex justify-between text-sm">
                <span>No Show</span>
                <span className="font-medium text-orange-600">{appointments.noShow}</span>
              </div>
              <Progress
                value={(appointments.noShow / appointments.total) * 100}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Services</span>
                <span className="font-medium">${revenue.services.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Tips</span>
                <span className="font-medium">${revenue.tips.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Total</span>
                <span className="font-bold">${revenue.total.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Utilization */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Utilization</CardTitle>
          <CardDescription>
            Current utilization vs target
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Current: {utilization.current}%</span>
              <span>Target: {utilization.target}%</span>
            </div>
            <Progress value={utilization.current} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {utilization.current >= utilization.target
                ? "Meeting utilization target"
                : `${utilization.target - utilization.current}% below target`
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ratings.distribution.map((rating) => (
              <div key={rating.stars} className="flex items-center gap-3">
                <span className="text-sm w-8">{rating.stars}★</span>
                <Progress
                  value={(rating.count / ratings.total) * 100}
                  className="flex-1 h-2"
                />
                <span className="text-sm w-8">{rating.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}