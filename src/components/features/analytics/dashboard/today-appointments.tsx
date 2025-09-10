import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getTodayAppointments } from './queries'

export async function TodayAppointments() {
  const appointments = await getTodayAppointments()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Appointments</CardTitle>
        <CardDescription>Upcoming appointments for today</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{apt.customer}</p>
                  <p className="text-xs text-muted-foreground">
                    {apt.service} • {apt.time}
                  </p>
                </div>
                <Badge variant={
                  apt.status === 'confirmed' ? 'default' :
                  apt.status === 'cancelled' ? 'destructive' :
                  'secondary'
                }>
                  {apt.status}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}