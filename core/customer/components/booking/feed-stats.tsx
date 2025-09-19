'use client'

import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import type { CapacityInfo } from '../types'

interface BookingFeedStatsProps {
  stats: {
    totalToday: number
    newBookings: number
    cancellations: number
    modifications: number
  }
  capacity: CapacityInfo | null
}

export function BookingFeedStats({ stats, capacity }: BookingFeedStatsProps) {
  // Calculate capacity values if available
  const capacityData = capacity ? {
    ...capacity,
    availableSlots: capacity.totalSlots - capacity.bookedSlots,
    utilizationPercentage: (capacity.bookedSlots / capacity.totalSlots) * 100
  } : null

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold">{stats.totalToday}</p>
          <p className="text-xs text-muted-foreground">Today's Activity</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{stats.newBookings}</p>
          <p className="text-xs text-muted-foreground">New Bookings</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">{stats.cancellations}</p>
          <p className="text-xs text-muted-foreground">Cancellations</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.modifications}</p>
          <p className="text-xs text-muted-foreground">Modifications</p>
        </div>
      </div>

      {/* Capacity Bar */}
      {capacityData && (
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Today's Capacity</span>
            <span className="font-medium">
              {capacityData.bookedSlots}/{capacityData.totalSlots} slots
            </span>
          </div>
          <Progress value={capacityData.utilizationPercentage} />
          {capacityData.utilizationPercentage > 80 && (
            <Alert className="py-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                High utilization! Only {capacityData.availableSlots} slots remaining.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </>
  )
}