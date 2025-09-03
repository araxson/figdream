'use client'
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { 
  Users,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'
interface StaffingOptimizationTableProps {
  recommendations: Array<{
    date: string
    dayOfWeek: string
    predictedDemand: number
    requiredStaff: number
    availableStaff: number
    staffingGap: number
    recommendation: string
    peakHours: number[]
  }>
}
export default function StaffingOptimizationTable({ recommendations }: StaffingOptimizationTableProps) {
  const getStatusIcon = (gap: number) => {
    if (gap > 0) return <XCircle className="h-4 w-4 text-red-600" />
    if (gap < -1) return <AlertCircle className="h-4 w-4 text-yellow-600" />
    return <CheckCircle className="h-4 w-4 text-green-600" />
  }
  const getStatusBadge = (gap: number) => {
    if (gap > 0) return { label: 'Understaffed', variant: 'destructive' as const }
    if (gap < -1) return { label: 'Overstaffed', variant: 'secondary' as const }
    return { label: 'Optimal', variant: 'default' as const }
  }
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Day</TableHead>
            <TableHead className="text-center">Predicted Demand</TableHead>
            <TableHead className="text-center">Required Staff</TableHead>
            <TableHead className="text-center">Available Staff</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead>Recommendation</TableHead>
            <TableHead>Peak Hours</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recommendations.map((rec) => {
            const status = getStatusBadge(rec.staffingGap)
            return (
              <TableRow key={rec.date}>
                <TableCell className="font-medium">
                  {formatDate(rec.date)}
                </TableCell>
                <TableCell>{rec.dayOfWeek}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">{rec.predictedDemand}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{rec.requiredStaff}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{rec.availableStaff}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    {getStatusIcon(rec.staffingGap)}
                    <Badge variant={status.variant} className="text-xs">
                      {status.label}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm">{rec.recommendation}</p>
                  {rec.staffingGap !== 0 && (
                    <p className="text-xs text-muted-foreground">
                      Gap: {Math.abs(rec.staffingGap)} staff
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {rec.peakHours.slice(0, 3).map((hour) => (
                      <Badge key={hour} variant="outline" className="text-xs">
                        {hour}:00
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}