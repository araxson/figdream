'use client'

import { CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Calendar, 
  DollarSign, 
  Star
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface StaffStatsProps {
  rating: number
  totalBookings: number
  revenue: number
  performance: {
    bookingRate: number
    customerSatisfaction: number
    revenue: number
  }
  schedule: {
    today: string
    tomorrow: string
  }
  services: string[]
}

export function StaffCardStats({ 
  rating, 
  totalBookings, 
  revenue, 
  performance,
  schedule,
  services 
}: StaffStatsProps) {
  return (
    <CardContent className="space-y-4">
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Star className="h-3 w-3" />
            Rating
          </div>
          <div className="font-semibold">{rating.toFixed(1)}</div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Bookings
          </div>
          <div className="font-semibold">{totalBookings}</div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <DollarSign className="h-3 w-3" />
            Revenue
          </div>
          <div className="font-semibold">${revenue.toLocaleString()}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Performance</div>
        <div className="space-y-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Booking Rate</span>
                    <span>{performance.bookingRate}%</span>
                  </div>
                  <Progress value={performance.bookingRate} className="h-1" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Percentage of available slots booked</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Customer Satisfaction</span>
                    <span>{performance.customerSatisfaction}%</span>
                  </div>
                  <Progress value={performance.customerSatisfaction} className="h-1" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Based on customer reviews and feedback</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Schedule</div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Today</span>
            <span>{schedule.today}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tomorrow</span>
            <span>{schedule.tomorrow}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Services</div>
        <div className="flex flex-wrap gap-1">
          {services.slice(0, 3).map((service) => (
            <span 
              key={service} 
              className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs"
            >
              {service}
            </span>
          ))}
          {services.length > 3 && (
            <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs">
              +{services.length - 3} more
            </span>
          )}
        </div>
      </div>
    </CardContent>
  )
}