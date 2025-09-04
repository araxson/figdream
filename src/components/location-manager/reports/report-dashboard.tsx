import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, DollarSign, BarChart, Calendar } from "lucide-react"
import { format } from "date-fns"
interface ReportDashboardProps {
  monthlyReport: {
    totalRevenue: number
    totalAppointments: number
    completedAppointments: number
    cancelledAppointments: number
    noShowAppointments: number
    averageRevenue: number
  }
  monthStart: Date
}
export function ReportDashboard({ monthlyReport, monthStart }: ReportDashboardProps) {
  const completionRate = monthlyReport.totalAppointments > 0
    ? (monthlyReport.completedAppointments / monthlyReport.totalAppointments) * 100
    : 0
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${monthlyReport.totalRevenue.toLocaleString('en-US', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            {format(monthStart, 'MMM yyyy')}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Appointments</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{monthlyReport.totalAppointments}</div>
          <p className="text-xs text-muted-foreground">
            {monthlyReport.completedAppointments} completed
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
          <Progress value={completionRate} className="mt-2 h-2" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg per Appointment</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${monthlyReport.averageRevenue.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            Revenue per service
          </p>
        </CardContent>
      </Card>
    </div>
  )
}