import React from 'react'
import { Card } from '@/components/ui/card'

export interface AnalyticsDashboardProps {
  salonId: string
  dateRange?: {
    from: Date
    to: Date
  }
}

export function AnalyticsDashboard({ salonId, dateRange }: AnalyticsDashboardProps) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Marketing Analytics</h2>
      <p className="text-muted-foreground">
        Analytics dashboard for salon {salonId}
      </p>
      {dateRange && (
        <p className="text-sm text-muted-foreground mt-2">
          Date range: {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
        </p>
      )}
    </Card>
  )
}