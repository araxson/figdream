"use client"

import { TrendingUp, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import type { PerformanceData, Review } from "../profile-view-utils/profile-view-types"
import { calculateCompletionRate } from "../profile-view-utils/profile-view-helpers"

interface ProfilePerformanceSectionProps {
  performanceData: PerformanceData
  recentReviews: Review[]
}

export function ProfilePerformanceSection({
  performanceData,
  recentReviews
}: ProfilePerformanceSectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Completed</span>
                <span className="font-medium">{performanceData.appointments.completed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Cancelled</span>
                <span className="font-medium">{performanceData.appointments.cancelled}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">No-Shows</span>
                <span className="font-medium">{performanceData.appointments.noShow}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm font-medium">Completion Rate</span>
                <span className="font-medium">
                  {calculateCompletionRate(
                    performanceData.appointments.completed,
                    performanceData.appointments.total
                  )}%
                </span>
              </div>
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
                <span className="font-medium">${performanceData.revenue.services}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Tips</span>
                <span className="font-medium">${performanceData.revenue.tips}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total Revenue</span>
                <span className="font-medium">${performanceData.revenue.total}</span>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span className="text-xs">+{performanceData.revenue.growth}% from last month</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {performanceData.ratings.distribution.map((rating) => (
              <div key={rating.stars} className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-20">
                  <span className="text-sm">{rating.stars}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </div>
                <Progress
                  value={(rating.count / performanceData.ratings.total) * 100}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-10">
                  {rating.count}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <div key={review.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.customer}</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(review.date), "MMM d, yyyy")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}