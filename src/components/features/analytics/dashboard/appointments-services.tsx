import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'
import Link from 'next/link'
import { TodayAppointment, TopService } from './dashboard-types'

interface AppointmentsAndServicesProps {
  appointments: TodayAppointment[]
  services: TopService[]
}

export function AppointmentsAndServices({ appointments, services }: AppointmentsAndServicesProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Today&apos;s Appointments</CardTitle>
              <CardDescription>Upcoming appointments for today</CardDescription>
            </div>
            <Link href="/dashboard/appointments">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.map((apt, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{apt.time}</span>
                  </div>
                  <p className="text-sm font-medium">{apt.customer}</p>
                  <p className="text-xs text-muted-foreground">{apt.service} • {apt.staff}</p>
                </div>
                <Button variant="ghost" size="sm">Details</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Top Services</CardTitle>
              <CardDescription>Most popular services this month</CardDescription>
            </div>
            <Link href="/dashboard/services">
              <Button variant="outline" size="sm">Manage</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{service.service}</p>
                  <span className="text-sm font-bold">${service.revenue}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{service.count} bookings</span>
                  <span>•</span>
                  <span>${(service.revenue / service.count).toFixed(0)} avg</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}