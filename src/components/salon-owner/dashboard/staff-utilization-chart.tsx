'use client'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useCallback } from 'react'
interface StaffUtilizationChartProps {
  staff: Array<{
    id: string
    name: string
    appointments: number
    hoursWorked: number
    utilizationRate: number
  }>
}
function StaffUtilizationChart({ staff }: StaffUtilizationChartProps) {
  const getUtilizationColor = useCallback((rate: number) => {
    if (rate >= 80) return 'text-red-600'
    if (rate >= 60) return 'text-green-600'
    if (rate >= 40) return 'text-yellow-600'
    return 'text-blue-600'
  }, [])

  const getUtilizationBadge = useCallback((rate: number) => {
    if (rate >= 80) return { label: 'High', variant: 'destructive' as const }
    if (rate >= 60) return { label: 'Good', variant: 'default' as const }
    if (rate >= 40) return { label: 'Moderate', variant: 'secondary' as const }
    return { label: 'Low', variant: 'outline' as const }
  }, [])
  return (
    <div className="space-y-4">
      {staff.map((member) => {
        const badge = getUtilizationBadge(member.utilizationRate)
        return (
          <div key={member.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{member.name}</span>
                <Badge variant={badge.variant} className="text-xs">
                  {badge.label}
                </Badge>
              </div>
              <span className={`text-sm font-semibold ${getUtilizationColor(member.utilizationRate)}`}>
                {member.utilizationRate.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={member.utilizationRate} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{member.appointments} appointments</span>
              <span>{member.hoursWorked.toFixed(1)} hours</span>
            </div>
          </div>
        )
      })}
      {staff.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No staff data available
        </div>
      )}
    </div>
  )
}

StaffUtilizationChart.displayName = 'StaffUtilizationChart'

export default StaffUtilizationChart
