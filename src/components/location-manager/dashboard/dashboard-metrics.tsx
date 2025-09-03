import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Users, Calendar, DollarSign, TrendingUp, TrendingDown, Minus } from "lucide-react"
interface DashboardMetricsProps {
  metrics: {
    todaysAppointments: number
    appointmentChange: number
    activeStaff: number
    todaysRevenue: number
    utilizationRate: number
  }
}
export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }
  const getChangeText = (change: number, prefix: string = "") => {
    if (change > 0) return `+${prefix}${Math.abs(change)} from yesterday`
    if (change < 0) return `-${prefix}${Math.abs(change)} from yesterday`
    return "Same as yesterday"
  }
  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600"
    if (change < 0) return "text-red-600"
    return "text-muted-foreground"
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today&apos;s Appointments</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.todaysAppointments}</div>
          <div className="flex items-center gap-1">
            {getChangeIcon(metrics.appointmentChange)}
            <p className={`text-xs ${getChangeColor(metrics.appointmentChange)}`}>
              {getChangeText(metrics.appointmentChange)}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.activeStaff}</div>
          <p className="text-xs text-muted-foreground">
            Currently on duty
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today&apos;s Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${metrics.todaysRevenue.toLocaleString('en-US', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            From completed appointments
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.utilizationRate}%</div>
          <p className="text-xs text-muted-foreground">
            Staff with appointments today
          </p>
        </CardContent>
      </Card>
    </div>
  )
}