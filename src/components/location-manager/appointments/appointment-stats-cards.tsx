import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, CheckCircle, DollarSign } from "lucide-react"
interface AppointmentStatsCardsProps {
  todaysAppointments: number
  upcomingCount: number
  completedCount: number
  todaysRevenue: number
}
export function AppointmentStatsCards({
  todaysAppointments,
  upcomingCount,
  completedCount,
  todaysRevenue
}: AppointmentStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today&apos;s Total</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todaysAppointments}</div>
          <p className="text-xs text-muted-foreground">Appointments scheduled</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingCount}</div>
          <p className="text-xs text-muted-foreground">Pending & confirmed</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedCount}</div>
          <p className="text-xs text-muted-foreground">Successfully finished</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today&apos;s Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${todaysRevenue.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">From completed appointments</p>
        </CardContent>
      </Card>
    </div>
  )
}