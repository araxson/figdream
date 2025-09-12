import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, User } from 'lucide-react'
import { getMyAppointments } from './queries'

export async function MyAppointments() {
  const appointments = await getMyAppointments()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Appointments</CardTitle>
        <CardDescription>Your schedule for today</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {appointments.map((apt) => (
          <div key={apt.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{apt.customer && Array.isArray(apt.customer) && apt.customer[0] ? `${apt.customer[0].first_name} ${apt.customer[0].last_name}` : 'Unknown'}</p>
              </div>
              <p className="text-sm text-muted-foreground">{apt.appointment_services?.[0]?.services?.name || 'Service'}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{apt.start_time ? new Date(apt.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''} • {apt.computed_total_duration || 30} min</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={
                apt.status === 'confirmed' ? 'default' :
                apt.status === 'completed' ? 'secondary' :
                'outline'
              }>
                {apt.status}
              </Badge>
              <Button size="sm" variant="outline">
                View
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}