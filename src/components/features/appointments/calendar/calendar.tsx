import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AppointmentsCalendarProps {
  filters?: unknown
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AppointmentsCalendar(_props: AppointmentsCalendarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointments Calendar</CardTitle>
        <CardDescription>View appointments in calendar format</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Calendar view will be displayed here</p>
      </CardContent>
    </Card>
  )
}