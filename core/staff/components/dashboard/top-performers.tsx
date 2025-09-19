"use client"

import { Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TopPerformers } from "./types"

interface StaffTopPerformersProps {
  topPerformers: TopPerformers
}

export function StaffTopPerformers({ topPerformers }: StaffTopPerformersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Top Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topPerformers.revenue.map((performer, index) => (
              <div key={performer.staffId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {index + 1}. {performer.staffName}
                  </span>
                </div>
                <span className="text-sm font-bold">
                  ${performer.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Top Rated</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topPerformers.rating.map((performer, index) => (
              <div key={performer.staffId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {index + 1}. {performer.staffName}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-bold">
                    {performer.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Most Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topPerformers.appointments.map((performer, index) => (
              <div key={performer.staffId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {index + 1}. {performer.staffName}
                  </span>
                </div>
                <span className="text-sm font-bold">
                  {performer.appointments}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Highest Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topPerformers.utilization.map((performer, index) => (
              <div key={performer.staffId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {index + 1}. {performer.staffName}
                  </span>
                </div>
                <span className="text-sm font-bold">
                  {performer.utilization.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}