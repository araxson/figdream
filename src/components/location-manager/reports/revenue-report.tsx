import { Card, CardContent, CardDescription, CardHeader, CardTitle, Progress } from "@/components/ui"
import { format } from "date-fns"
interface RevenueReportProps {
  monthlyReport: {
    totalRevenue: number
    totalAppointments: number
    completedAppointments: number
    cancelledAppointments: number
    noShowAppointments: number
    averageRevenue: number
  }
  weeklyReport?: {
    totalRevenue: number
    totalAppointments: number
    completedAppointments: number
    averageRevenue: number
  }
  monthStart: Date
}
export function RevenueReport({ monthlyReport, weeklyReport: _weeklyReport, monthStart }: RevenueReportProps) {
  const completionRate = monthlyReport.totalAppointments > 0
    ? (monthlyReport.completedAppointments / monthlyReport.totalAppointments) * 100
    : 0
  const cancelRate = monthlyReport.totalAppointments > 0
    ? (monthlyReport.cancelledAppointments / monthlyReport.totalAppointments) * 100
    : 0
  const noShowRate = monthlyReport.totalAppointments > 0
    ? (monthlyReport.noShowAppointments / monthlyReport.totalAppointments) * 100
    : 0
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
          <CardDescription>{format(monthStart, 'MMMM yyyy')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Total Appointments</span>
            <span className="font-medium">{monthlyReport.totalAppointments}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Completed</span>
            <span className="font-medium text-green-600">{monthlyReport.completedAppointments}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Cancelled</span>
            <span className="font-medium text-orange-600">{monthlyReport.cancelledAppointments}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">No Shows</span>
            <span className="font-medium text-red-600">{monthlyReport.noShowAppointments}</span>
          </div>
          <div className="border-t pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Revenue</span>
              <span className="font-bold text-lg">
                ${monthlyReport.totalRevenue.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Appointment Status Breakdown</CardTitle>
          <CardDescription>Monthly appointment outcomes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Completed</span>
              <span>{completionRate.toFixed(1)}%</span>
            </div>
            <Progress value={completionRate} className="h-2 bg-green-100" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Cancelled</span>
              <span>{cancelRate.toFixed(1)}%</span>
            </div>
            <Progress value={cancelRate} className="h-2 bg-orange-100" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>No Show</span>
              <span>{noShowRate.toFixed(1)}%</span>
            </div>
            <Progress value={noShowRate} className="h-2 bg-red-100" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}