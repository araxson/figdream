'use client'

import { format } from 'date-fns'
import {
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import type { AppointmentWithRelations } from '../types'

interface AppointmentDetailsTabProps {
  appointment: AppointmentWithRelations
}

export function AppointmentDetailsTab({ appointment }: AppointmentDetailsTabProps) {
  const startTime = new Date(appointment.start_time)
  const endTime = new Date(appointment.end_time)
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Schedule Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Date</span>
            </div>
            <span className="font-medium">{format(startTime, 'PPP')}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Time</span>
            </div>
            <span className="font-medium">
              {format(startTime, 'p')} - {format(endTime, 'p')} ({duration} min)
            </span>
          </div>
          {appointment.salon && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>Location</span>
              </div>
              <span className="font-medium">{appointment.salon.name}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {appointment.customer && (
            <>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={appointment.customer.avatar_url || undefined} />
                  <AvatarFallback>
                    {appointment.customer.first_name?.[0]}
                    {appointment.customer.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {appointment.customer.first_name} {appointment.customer.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">Customer</p>
                </div>
              </div>
              <div className="space-y-2">
                {appointment.customer.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{appointment.customer.email}</span>
                  </div>
                )}
                {appointment.customer.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{appointment.customer.phone}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Staff Member</CardTitle>
        </CardHeader>
        <CardContent>
          {appointment.staff && (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={appointment.staff.avatar_url || undefined} />
                <AvatarFallback>
                  {appointment.staff.first_name?.[0]}
                  {appointment.staff.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {appointment.staff.first_name} {appointment.staff.last_name}
                </p>
                <p className="text-sm text-muted-foreground">Service Provider</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {(appointment.notes || appointment.internal_notes) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {appointment.notes && (
              <div>
                <Label className="text-sm text-muted-foreground">Customer Notes</Label>
                <p className="text-sm mt-1">{appointment.notes}</p>
              </div>
            )}
            {appointment.internal_notes && (
              <div>
                <Label className="text-sm text-muted-foreground">Internal Notes</Label>
                <p className="text-sm mt-1">{appointment.internal_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}