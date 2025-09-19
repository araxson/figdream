'use client'

import { Scissors } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { AppointmentWithRelations } from '../types'

interface AppointmentServicesTabProps {
  appointment: AppointmentWithRelations
}

export function AppointmentServicesTab({ appointment }: AppointmentServicesTabProps) {
  const startTime = new Date(appointment.start_time)
  const endTime = new Date(appointment.end_time)
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Services</CardTitle>
        </CardHeader>
        <CardContent>
          {appointment.services && appointment.services.length > 0 ? (
            <div className="space-y-3">
              {appointment.services.map((service) => (
                <div key={service.id} className="flex items-start justify-between p-3 rounded-lg border">
                  <div className="flex items-start gap-3">
                    <Scissors className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{service.service_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {service.duration_minutes} minutes
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${service.unit_price.toFixed(2)}</p>
                    {service.quantity > 1 && (
                      <p className="text-sm text-muted-foreground">x{service.quantity}</p>
                    )}
                  </div>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total Duration</span>
                <span>{duration} minutes</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No services added</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}